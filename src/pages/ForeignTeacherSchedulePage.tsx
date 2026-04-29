import { useMemo, useState } from "react";
import { useClassSchedules } from "@/contexts/ClassScheduleContext";
import { useRole } from "@/contexts/RoleContext";
import { foreignTeachers as initialForeignTeachers, users, branches, syllabuses, type AppUser } from "@/data/mockData";
import { autoAssignForeignTeachers, calculateShiftSlots, detectShift, validateAssignment, isAvailable, type AssignmentResult, type ShiftId } from "@/utils/foreignShiftUtils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import MaterialsViewer from "@/components/syllabus/shared/MaterialsViewer";
import { CalendarClock, Sparkles, AlertTriangle, CheckCircle2, RefreshCw, ChevronLeft, ChevronRight, Users, MapPin, Building2, GraduationCap, FileVideo, Clock, MessageSquareText, Star, Settings2, Save } from "lucide-react";
import { toast } from "sonner";
import { useForeignNotes } from "@/contexts/ForeignNoteContext";

const DOW_LABEL = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const DOW_FULL = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

/** Lấy Monday của tuần chứa date */
function getMonday(d: Date): Date {
  const m = new Date(d);
  const day = m.getDay() || 7; // Sun=0→7
  if (day !== 1) m.setDate(m.getDate() - (day - 1));
  m.setHours(0, 0, 0, 0);
  return m;
}
function fmt(d: Date) { return d.toISOString().slice(0, 10); }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

export default function ForeignTeacherSchedulePage() {
  const { schedules, updateSchedule } = useClassSchedules();
  const { isAdmin, isTA, isOps, isForeignTeacher } = useRole();

  // Tuần hiện tại: bắt đầu = Monday của 2026-04-24
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date("2026-04-24")));
  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, i) => fmt(addDays(weekStart, i))), [weekStart]);

  const [preview, setPreview] = useState<AssignmentResult[] | null>(null);
  const [unassigned, setUnassigned] = useState<Array<{ classScheduleId: string; reason: string }>>([]);
  const [committed, setCommitted] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null); // key = `${ftId}|${date}`
  const [activeTab, setActiveTab] = useState<"schedule" | "settings">("schedule");

  // Local editable copy of foreign teacher availability settings
  const [ftSettings, setFtSettings] = useState<AppUser[]>(() =>
    initialForeignTeachers.map((ft) => ({ ...ft, availability: ft.availability ? { ...ft.availability, unavailableDates: [...(ft.availability.unavailableDates ?? [])] } : undefined }))
  );

  const foreignTeachers = ftSettings;

  const currentFT = isForeignTeacher ? foreignTeachers[0] : null;

  const weekSchedules = useMemo(() => {
    return schedules.filter((s) => {
      if (!weekDates.includes(s.date)) return false;
      // Cho phép admin xếp GVNN vào BẤT KỲ buổi nào (sáng/chiều/tối) — không phụ thuộc giờ.
      // GVNN của riêng họ chỉ thấy lớp đã được gán.
      if (isForeignTeacher) {
        return s.foreignTeacherId === currentFT?.id;
      }
      return true;
    });
  }, [schedules, weekDates, isForeignTeacher, currentFT]);

  const enrichedSchedules = useMemo(() => {
    return weekSchedules.map((s) => {
      const teacher = users.find((u) => u.id === s.teacherId);
      const branchId = teacher?.branchId ?? "BR001";
      return { ...s, branchId } as typeof s & { branchId: string };
    });
  }, [weekSchedules]);

  const handleAutoAssign = () => {
    setCommitted(false);
    // Build existingAssignments từ schedules đã có foreignTeacherId trong tuần
    const existingAssignments: Record<string, AssignmentResult[]> = {};
    for (const s of enrichedSchedules) {
      if (!s.foreignTeacherId || !s.foreignStartTime || !s.foreignEndTime) continue;
      const key = `${s.foreignTeacherId}_${s.date}`;
      if (!existingAssignments[key]) existingAssignments[key] = [];
      existingAssignments[key].push({
        classScheduleId: s.id,
        foreignTeacherId: s.foreignTeacherId,
        foreignTeacherName: s.foreignTeacherName ?? "",
        startTime: s.foreignStartTime,
        endTime: s.foreignEndTime,
        shift: (s.foreignShift as ShiftId) ?? detectShift(s.endTime),
        branchId: (s as any).branchId ?? "BR001",
      });
    }
    const result = autoAssignForeignTeachers({
      schedules: enrichedSchedules as any,
      foreignTeachers: foreignTeachers.map((ft) => ({
        id: ft.id,
        name: ft.name,
        branchId: ft.branchId,
        availability: ft.availability,
      })),
      existingAssignments,
    });
    setPreview(result.assignments);
    setUnassigned(result.unassigned);
    toast.success(`Đã xếp tự động ${result.assignments.length} lớp${result.unassigned.length ? `, ${result.unassigned.length} lớp chưa xếp được` : ""}`);
  };

  const handleCommit = () => {
    if (!preview) return;
    preview.forEach((a) => {
      updateSchedule(
        a.classScheduleId,
        {
          foreignTeacherId: a.foreignTeacherId,
          foreignTeacherName: a.foreignTeacherName,
          foreignStartTime: a.startTime,
          foreignEndTime: a.endTime,
          foreignShift: a.shift,
        },
        { name: "Auto-Scheduler", role: isAdmin ? "admin" : "ta" },
        `Auto-assign GVNN ${a.foreignTeacherName} (${a.startTime}-${a.endTime})`
      );
    });
    setCommitted(true);
    toast.success("Đã áp dụng lịch GVNN cho cả tuần!");
  };

  const handleClear = () => {
    setPreview(null);
    setUnassigned([]);
    setCommitted(false);
  };

  /** Kéo thả: chuyển assignment preview sang GVNN khác (giữ nguyên giờ + date) */
  const handleDrop = (targetFtId: string, targetDate: string) => {
    if (!preview || !dragId) return;
    const a = preview.find((x) => x.classScheduleId === dragId);
    if (!a) return;
    const cls = enrichedSchedules.find((s) => s.id === dragId);
    if (!cls || cls.date !== targetDate) {
      toast.error("Chỉ có thể kéo trong cùng ngày");
      return;
    }
    if (a.foreignTeacherId === targetFtId) return;

    // Build "existing" của target (ngoại trừ chính slot đang di chuyển)
    const targetExisting = preview
      .filter((x) => x.foreignTeacherId === targetFtId && x.classScheduleId !== dragId &&
        enrichedSchedules.find((s) => s.id === x.classScheduleId)?.date === targetDate)
      .map((x) => ({ branchId: x.branchId, startTime: x.startTime, endTime: x.endTime }));

    const targetFt = foreignTeachers.find((f) => f.id === targetFtId);
    if (!targetFt) return;

    // Check availability của target FT ngày đó
    if (!isAvailable({ id: targetFt.id, name: targetFt.name, branchId: targetFt.branchId, availability: targetFt.availability }, targetDate, a.shift)) {
      toast.error(`${targetFt.name} không làm việc ngày ${targetDate} ca ${a.shift}`);
      return;
    }

    const warnings = validateAssignment(
      { branchId: a.branchId, startTime: a.startTime, endTime: a.endTime },
      targetExisting,
    );
    if (warnings.some((w) => w.startsWith("Trùng giờ"))) {
      toast.error("Không thể xếp: " + warnings[0]);
      return;
    }

    // Check max 3 lớp/ca
    const sameShift = preview.filter((x) =>
      x.foreignTeacherId === targetFtId && x.shift === a.shift &&
      enrichedSchedules.find((s) => s.id === x.classScheduleId)?.date === targetDate &&
      x.classScheduleId !== dragId
    ).length;
    if (sameShift >= 3) {
      toast.error(`${targetFt.name} đã có 3 lớp trong ca này`);
      return;
    }

    const next = preview.map((x) => x.classScheduleId === dragId
      ? { ...x, foreignTeacherId: targetFtId, foreignTeacherName: targetFt.name, warnings: warnings.length ? warnings : undefined }
      : x
    );
    setPreview(next);
    toast.success(`Đã chuyển ${cls.className} sang ${targetFt.name}`);
    setDragId(null);
    setDragOver(null);
  };

  const prevWeek = () => { setWeekStart((w) => addDays(w, -7)); handleClear(); };
  const nextWeek = () => { setWeekStart((w) => addDays(w, 7)); handleClear(); };
  const thisWeek = () => { setWeekStart(getMonday(new Date("2026-04-24"))); handleClear(); };

  const weekLabel = `${fmt(weekStart).slice(5).replace("-", "/")} – ${fmt(addDays(weekStart, 6)).slice(5).replace("-", "/")}/2026`;

  // ───────── View cho GVNN: day tabs + table lớp + detail panel ─────────
  if (isForeignTeacher && currentFT) {
    return <ForeignTeacherView
      currentFT={currentFT}
      weekDates={weekDates}
      weekLabel={weekLabel}
      enrichedSchedules={enrichedSchedules as any}
      onPrev={prevWeek}
      onNext={nextWeek}
      onThis={thisWeek}
    />;
  }

  // ───────── View Admin / TA ─────────
  return (
    <div className="h-full overflow-auto bg-muted/20">
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-emerald-600" />
              Lịch dạy GVNN — {weekLabel}
            </h1>
            <p className="text-sm text-muted-foreground">
              Tự động xếp 10 GVNN cho {enrichedSchedules.length} lớp tối trong tuần. Quy tắc: 25-30 phút/lớp, max 3 lớp/ca, buffer 30 phút giữa cơ sở.
            </p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {activeTab === "schedule" && (
              <>
                <Button variant="outline" size="sm" onClick={prevWeek}><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" onClick={thisWeek}>Tuần này</Button>
                <Button variant="outline" size="sm" onClick={nextWeek}><ChevronRight className="w-4 h-4" /></Button>
                <Button onClick={handleAutoAssign} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  <Sparkles className="w-4 h-4" />
                  Xếp tự động
                </Button>
                {preview && !committed && (
                  <>
                    <Button onClick={handleClear} variant="outline" className="gap-1.5">
                      <RefreshCw className="w-4 h-4" />
                      Reset
                    </Button>
                    <Button onClick={handleCommit} className="gap-1.5 bg-orange-500 hover:bg-orange-600">
                      <CheckCircle2 className="w-4 h-4" />
                      Áp dụng lịch
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          <button
            onClick={() => setActiveTab("schedule")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "schedule" ? "border-emerald-600 text-emerald-700" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <CalendarClock className="w-4 h-4 inline mr-1.5" />
            Xếp lịch tuần
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "settings" ? "border-emerald-600 text-emerald-700" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <Settings2 className="w-4 h-4 inline mr-1.5" />
            Cài đặt lịch GVNN
          </button>
        </div>

        {activeTab === "settings" && (
          <FTAvailabilitySettings
            ftSettings={ftSettings}
            onChange={setFtSettings}
          />
        )}

        {activeTab === "schedule" && (<>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3">
            <div className="text-xs text-muted-foreground">Tổng lớp tối</div>
            <div className="text-2xl font-bold">{enrichedSchedules.length}</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground">GVNN khả dụng</div>
            <div className="text-2xl font-bold text-emerald-600">{foreignTeachers.length}</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground">Đã xếp (preview)</div>
            <div className="text-2xl font-bold text-blue-600">{preview?.length ?? 0}</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground">Chưa xếp được</div>
            <div className="text-2xl font-bold text-rose-600">{unassigned.length}</div>
          </Card>
        </div>

        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="text-xs space-y-1.5 text-amber-900">
            <div className="font-semibold">📋 Quy tắc tính giờ tự động:</div>
            <div>• <b>Ca 1</b> (trước giải lao 19:25): 2 lớp → 30 phút bắt đầu 18:20 | 3 lớp → 25 phút bắt đầu 18:00</div>
            <div>• <b>Giải lao</b>: 19:25 - 19:35 (10 phút)</div>
            <div>• <b>Ca 2</b> (sau giải lao): 2 lớp → 30 phút bắt đầu 19:35 | 3 lớp → 25 phút bắt đầu 19:35</div>
            <div>• Nghỉ 5 phút giữa các lớp trong cùng ca, buffer 30 phút khi đổi cơ sở.</div>
          </div>
        </Card>

        {unassigned.length > 0 && (
          <Card className="p-4 bg-rose-50 border-rose-200">
            <div className="font-semibold text-sm text-rose-900 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4" />
              Không xếp được {unassigned.length} lớp
            </div>
            <div className="space-y-1 text-xs text-rose-800">
              {unassigned.map((u) => {
                const cls = enrichedSchedules.find((s) => s.id === u.classScheduleId);
                return (
                  <div key={u.classScheduleId}>
                    • <b>{cls?.className}</b> ({cls?.date} {cls?.startTime}): {u.reason}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <Card className="p-4">
          <div className="font-semibold text-sm mb-3 flex items-center justify-between">
            <span>📊 Ma trận lịch GVNN (cột = GVNN, dòng = ngày)</span>
            {preview && !committed && (
              <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                ✋ Có thể kéo thả card sang GVNN khác (cùng ngày), sau đó bấm "Áp dụng lịch"
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-muted text-left sticky left-0 z-10">Ngày</th>
                  {foreignTeachers.map((ft) => {
                    const avail = ft.availability;
                    const dayLabels = avail ? avail.days.map((d) => ["", "T2","T3","T4","T5","T6","T7","CN"][d]).join(" ") : "Tất cả";
                    const shiftLabel = avail ? avail.shifts.join("+") : "ca1+ca2";
                    return (
                      <th key={ft.id} className="border p-2 bg-muted min-w-[140px]">
                        <div className="font-semibold">{ft.name.replace(/^(Mr\.|Ms\.) /, "")}</div>
                        <div className="text-[10px] text-muted-foreground font-normal">
                          {branches.find((b) => b.id === ft.branchId)?.name.replace("MENGLISH - ", "")}
                        </div>
                        <div className="text-[9px] text-blue-600 mt-0.5">{dayLabels} · {shiftLabel} · max {avail?.maxClassesPerWeek ?? "∞"}/tuần</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {weekDates.map((date, di) => (
                  <tr key={date}>
                    <td className="border p-2 bg-muted/40 sticky left-0 z-10 font-semibold whitespace-nowrap">
                      {DOW_LABEL[di]} <span className="text-muted-foreground font-normal">{date.slice(5)}</span>
                    </td>
                    {foreignTeachers.map((ft) => {
                      const avail = ft.availability;
                      const isOff = avail?.unavailableDates.includes(date);
                      // Check both ca1 and ca2 availability for this date
                      const worksAnyCa = avail
                        ? avail.shifts.some((sh) => isAvailable({ id: ft.id, name: ft.name, branchId: ft.branchId, availability: avail }, date, sh))
                        : true;
                      const notWorking = !isOff && !worksAnyCa;

                      const previewCells = (preview ?? []).filter(
                        (a) => a.foreignTeacherId === ft.id && enrichedSchedules.find((s) => s.id === a.classScheduleId)?.date === date
                      );
                      const committedCells = enrichedSchedules.filter(
                        (s) => s.foreignTeacherId === ft.id && s.date === date
                      );
                      const cells = preview ? previewCells.map(a => {
                        const cls = enrichedSchedules.find(s => s.id === a.classScheduleId);
                        return { ...a, className: cls?.className, branchIdFrom: a.branchId };
                      }) : committedCells.map(s => ({
                        classScheduleId: s.id,
                        className: s.className,
                        startTime: s.foreignStartTime || s.startTime,
                        endTime: s.foreignEndTime || s.endTime,
                        shift: s.foreignShift || "ca1",
                        branchIdFrom: s.branchId,
                        warnings: undefined as string[] | undefined,
                      }));

                      if (isOff) {
                        return (
                          <td key={ft.id} className="border p-1 bg-red-50 align-middle text-center">
                            <div className="text-[9px] text-red-500 font-medium">Nghỉ</div>
                          </td>
                        );
                      }
                      if (notWorking) {
                        return (
                          <td key={ft.id} className="border p-1 bg-gray-100 align-middle text-center">
                            <div className="text-[9px] text-gray-400">Không làm</div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={ft.id}
                          className={`border p-1 align-top transition ${
                            preview && dragOver === `${ft.id}|${date}` ? "bg-emerald-50 ring-2 ring-emerald-400 ring-inset" : ""
                          }`}
                          onDragOver={(e) => { if (preview && dragId) { e.preventDefault(); setDragOver(`${ft.id}|${date}`); } }}
                          onDragLeave={() => setDragOver((v) => v === `${ft.id}|${date}` ? null : v)}
                          onDrop={(e) => { e.preventDefault(); handleDrop(ft.id, date); }}
                        >
                          {cells.length === 0 && (
                            <div className="text-[10px] text-muted-foreground/40 text-center py-2">—</div>
                          )}
                          {cells.map((a) => {
                            const isHome = ft.branchId === a.branchIdFrom;
                            const draggable = !!preview && !committed;
                            return (
                              <div
                                key={a.classScheduleId}
                                draggable={draggable}
                                onDragStart={() => setDragId(a.classScheduleId)}
                                onDragEnd={() => { setDragId(null); setDragOver(null); }}
                                className={`mb-1 p-1.5 rounded text-[10px] ${
                                  isHome ? "bg-emerald-100 border border-emerald-300" : "bg-amber-100 border border-amber-300"
                                } ${draggable ? "cursor-grab active:cursor-grabbing hover:shadow-md" : ""} ${
                                  dragId === a.classScheduleId ? "opacity-40" : ""
                                }`}
                                title={a.warnings?.join("\n") || (draggable ? "Kéo thả sang GVNN khác" : "")}
                              >
                                <div className="font-semibold">{a.className}</div>
                                <div>{a.startTime}-{a.endTime}</div>
                                <div className="text-[9px] text-muted-foreground">
                                  {a.shift === "ca1" ? "Ca 1" : "Ca 2"} {!isHome && "✈"}
                                </div>
                                {a.warnings && a.warnings.length > 0 && (
                                  <div className="text-amber-700 text-[9px] mt-0.5">⚠ {a.warnings.length}</div>
                                )}
                              </div>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" /> Home-branch</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" /> Cross-branch (đã pass buffer 30')</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-100 border border-gray-300" /> Không làm ngày này</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-50 border border-red-200" /> Nghỉ ad-hoc</div>
          <div className="flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-amber-600" /> Có cảnh báo</div>
        </div>

        {/* Bảng gán thủ công GVNN cho từng buổi (admin + TA) */}
        {(isAdmin || isTA || isOps) && !preview && (
          <ManualAssignTable
            schedules={enrichedSchedules}
            allSchedules={schedules}
            weekDates={weekDates}
            foreignTeachersList={foreignTeachers}
            onAssign={(scheduleId, ftId, startTime, endTime) => {
              const ft = ftId ? foreignTeachers.find((f) => f.id === ftId) : null;
              updateSchedule(
                scheduleId,
                ft
                  ? {
                      foreignTeacherId: ft.id,
                      foreignTeacherName: ft.name,
                      foreignStartTime: startTime,
                      foreignEndTime: endTime,
                      foreignShift: detectShift(startTime),
                    }
                  : {
                      foreignTeacherId: undefined,
                      foreignTeacherName: undefined,
                      foreignStartTime: undefined,
                      foreignEndTime: undefined,
                      foreignShift: undefined,
                    },
                { name: isAdmin ? "Admin" : isOps ? "Học vụ" : "TA", role: isAdmin ? "admin" : isOps ? "ops" : "ta" },
                ft ? `Gán thủ công GVNN ${ft.name}` : "Bỏ gán GVNN"
              );
              toast.success(ft ? `Đã gán ${ft.name}` : "Đã bỏ gán GVNN");
            }}
          />
        )}
        </>)}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
 * Sub-component: Cài đặt lịch cố định GVNN
 * ══════════════════════════════════════════════════════════ */
const DOW_NAMES = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const DOW_ISO = [1, 2, 3, 4, 5, 6, 7];

interface FTAvailabilitySettingsProps {
  ftSettings: AppUser[];
  onChange: (updated: AppUser[]) => void;
}

function FTAvailabilitySettings({ ftSettings, onChange }: FTAvailabilitySettingsProps) {
  const [addDateFor, setAddDateFor] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");

  const update = (ftId: string, patch: Partial<NonNullable<AppUser["availability"]>>) => {
    onChange(ftSettings.map((ft) => {
      if (ft.id !== ftId) return ft;
      return { ...ft, availability: { ...ft.availability!, ...patch } };
    }));
  };

  const toggleDay = (ftId: string, isoDay: number) => {
    const ft = ftSettings.find((f) => f.id === ftId)!;
    const days = ft.availability?.days ?? [];
    update(ftId, { days: days.includes(isoDay) ? days.filter((d) => d !== isoDay) : [...days, isoDay].sort() });
  };

  const toggleShift = (ftId: string, shift: ShiftId) => {
    const ft = ftSettings.find((f) => f.id === ftId)!;
    const shifts = ft.availability?.shifts ?? [];
    update(ftId, { shifts: shifts.includes(shift) ? shifts.filter((s) => s !== shift) : [...shifts, shift] });
  };

  const addUnavailable = (ftId: string, date: string) => {
    if (!date) return;
    const ft = ftSettings.find((f) => f.id === ftId)!;
    const existing = ft.availability?.unavailableDates ?? [];
    if (existing.includes(date)) return;
    update(ftId, { unavailableDates: [...existing, date].sort() });
    setNewDate("");
    setAddDateFor(null);
  };

  const removeUnavailable = (ftId: string, date: string) => {
    const ft = ftSettings.find((f) => f.id === ftId)!;
    update(ftId, { unavailableDates: (ft.availability?.unavailableDates ?? []).filter((d) => d !== date) });
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-sm flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-emerald-600" />
          Lịch làm việc cố định của GVNN
        </div>
        <div className="text-xs text-muted-foreground">Thay đổi sẽ được áp dụng ngay cho lần xếp tự động tiếp theo</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left min-w-[140px]">GVNN</th>
              <th className="border p-2 text-center" colSpan={7}>Ngày làm (T2–CN)</th>
              <th className="border p-2 text-center">Ca</th>
              <th className="border p-2 text-center">Max/tuần</th>
              <th className="border p-2 text-left min-w-[160px]">Ngày nghỉ ad-hoc</th>
            </tr>
          </thead>
          <tbody>
            {ftSettings.map((ft) => {
              const avail = ft.availability;
              return (
                <tr key={ft.id} className="hover:bg-muted/20 border-b">
                  <td className="border p-2">
                    <div className="font-semibold">{ft.name.replace(/^(Mr\.|Ms\.) /, "")}</div>
                    <div className="text-[10px] text-muted-foreground">{branches.find((b) => b.id === ft.branchId)?.name.replace("MENGLISH - ", "")}</div>
                  </td>
                  {DOW_ISO.map((d, i) => (
                    <td key={d} className="border p-1 text-center">
                      <label className="cursor-pointer flex flex-col items-center gap-0.5">
                        <span className="text-[9px] text-muted-foreground">{DOW_NAMES[i]}</span>
                        <input
                          type="checkbox"
                          checked={avail?.days.includes(d) ?? false}
                          onChange={() => toggleDay(ft.id, d)}
                          className="accent-emerald-600"
                        />
                      </label>
                    </td>
                  ))}
                  <td className="border p-1 text-center">
                    <div className="flex flex-col gap-1 items-center">
                      {(["ca1", "ca2"] as ShiftId[]).map((sh) => (
                        <label key={sh} className="cursor-pointer flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={avail?.shifts.includes(sh) ?? false}
                            onChange={() => toggleShift(ft.id, sh)}
                            className="accent-emerald-600"
                          />
                          <span>{sh === "ca1" ? "Ca 1" : "Ca 2"}</span>
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="border p-1 text-center">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={avail?.maxClassesPerWeek ?? 10}
                      onChange={(e) => update(ft.id, { maxClassesPerWeek: parseInt(e.target.value) || 1 })}
                      className="w-12 border rounded px-1 py-0.5 text-center text-xs"
                    />
                  </td>
                  <td className="border p-2">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {(avail?.unavailableDates ?? []).map((d) => (
                        <span key={d} className="inline-flex items-center gap-0.5 bg-red-100 text-red-700 rounded px-1.5 py-0.5 text-[10px]">
                          {d}
                          <button onClick={() => removeUnavailable(ft.id, d)} className="hover:text-red-900">×</button>
                        </span>
                      ))}
                    </div>
                    {addDateFor === ft.id ? (
                      <div className="flex gap-1 items-center">
                        <input
                          type="date"
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="border rounded px-1 py-0.5 text-xs"
                        />
                        <button onClick={() => addUnavailable(ft.id, newDate)} className="text-emerald-700 text-xs font-semibold">OK</button>
                        <button onClick={() => { setAddDateFor(null); setNewDate(""); }} className="text-muted-foreground text-xs">Hủy</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddDateFor(ft.id)}
                        className="text-xs text-emerald-700 hover:underline"
                      >
                        + Thêm ngày nghỉ
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════
 * Sub-component: Bảng gán GVNN thủ công (admin + TA)
 * Cho phép gán bất kỳ GVNN nào vào bất kỳ buổi học nào trong tuần,
 * không phụ thuộc giờ học. Có thể bỏ trống để GV Việt handle cả 2 phần.
 * RULE: mỗi lớp tối đa 1 buổi GVNN / tuần.
 * ══════════════════════════════════════════════════════════ */
interface ManualAssignTableProps {
  schedules: Array<any>;
  allSchedules: Array<any>;
  weekDates: string[];
  foreignTeachersList: AppUser[];
  onAssign: (scheduleId: string, ftId: string | null, startTime: string, endTime: string) => void;
}

function ManualAssignTable({ schedules, allSchedules, weekDates, foreignTeachersList, onAssign }: ManualAssignTableProps) {
  // Sort theo date + giờ
  const sorted = useMemo(
    () => [...schedules].sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)),
    [schedules]
  );

  /** Kiểm tra: với 1 schedule, lớp đó đã có GVNN nào trong tuần chưa (ngoại trừ chính schedule đang xét) */
  const getClassWeekForeignSession = (scheduleId: string, classId: string) => {
    return allSchedules.find(
      (s) =>
        s.classId === classId &&
        s.id !== scheduleId &&
        weekDates.includes(s.date) &&
        !!s.foreignTeacherId
    );
  };

  return (
    <Card className="p-4">
      <div className="font-semibold text-sm mb-3 flex items-center gap-2 flex-wrap">
        <GraduationCap className="w-4 h-4 text-emerald-600" />
        ✋ Gán thủ công GVNN cho từng buổi
        <span className="text-[11px] font-normal text-muted-foreground">
          (Admin/Học vụ gán GVNN vào BẤT KỲ buổi — sáng/chiều/tối. Quy tắc: mỗi lớp tối đa <b>1 buổi GVNN/tuần</b>. Không gán = GV Việt handle cả 2 phần)
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left">Ngày</th>
              <th className="border p-2 text-left">Lớp</th>
              <th className="border p-2 text-left">Giờ học</th>
              <th className="border p-2 text-left">GV Việt</th>
              <th className="border p-2 text-left">GVNN gán</th>
              <th className="border p-2 text-left">Giờ GVNN</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => {
              const assignedFt = foreignTeachersList.find((f) => f.id === s.foreignTeacherId);
              const otherSessionInWeek = getClassWeekForeignSession(s.id, s.classId);
              const hasOtherFT = !!otherSessionInWeek;
              const rowLocked = hasOtherFT && !s.foreignTeacherId;
              return (
                <tr key={s.id} className={`hover:bg-muted/30 ${rowLocked ? "bg-slate-50 opacity-70" : ""}`}>
                  <td className="border p-2 whitespace-nowrap">{s.date}</td>
                  <td className="border p-2 font-semibold">{s.className}</td>
                  <td className="border p-2 whitespace-nowrap">{s.startTime}–{s.endTime}</td>
                  <td className="border p-2">{s.teacherName}</td>
                  <td className="border p-2">
                    <select
                      disabled={rowLocked}
                      value={s.foreignTeacherId ?? ""}
                      onChange={(e) => {
                        const ftId = e.target.value || null;
                        if (ftId && hasOtherFT) {
                          toast.error(
                            `${s.className} đã có GVNN ngày ${otherSessionInWeek?.date} trong tuần này. Quy tắc: tối đa 1 buổi GVNN/lớp/tuần.`
                          );
                          return;
                        }
                        const endH = parseInt(s.endTime.split(":")[0]);
                        const endM = parseInt(s.endTime.split(":")[1]);
                        const startGvnn = `${String(endH).padStart(2, "0")}:${String(Math.max(endM - 15, 0)).padStart(2, "0")}`;
                        const endGvnn = s.endTime;
                        onAssign(s.id, ftId, s.foreignStartTime || startGvnn, s.foreignEndTime || endGvnn);
                      }}
                      className="border rounded px-2 py-1 text-xs bg-background min-w-[140px] disabled:bg-slate-100"
                      title={rowLocked ? `Lớp đã có GVNN ngày ${otherSessionInWeek?.date}` : ""}
                    >
                      <option value="">— GV Việt handle cả 2 —</option>
                      {foreignTeachersList.map((ft) => (
                        <option key={ft.id} value={ft.id}>
                          {ft.name} ({branches.find((b) => b.id === ft.branchId)?.name.replace("MENGLISH - ", "")})
                        </option>
                      ))}
                    </select>
                    {rowLocked && (
                      <div className="text-[10px] text-amber-700 mt-0.5">
                        🔒 Đã có GVNN ngày {otherSessionInWeek?.date}
                      </div>
                    )}
                  </td>
                  <td className="border p-2 whitespace-nowrap">
                    {assignedFt ? (
                      <span className="text-emerald-700 font-semibold">{s.foreignStartTime}–{s.foreignEndTime}</span>
                    ) : (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={6} className="border p-4 text-center text-muted-foreground">Tuần này chưa có lịch dạy nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════
 * Sub-component: Day-view cho GVNN
 * ══════════════════════════════════════════════════════════ */
interface FTViewProps {
  currentFT: { id: string; name: string; avatar: string; branchId: string };
  weekDates: string[];
  weekLabel: string;
  enrichedSchedules: Array<any>;
  onPrev: () => void;
  onNext: () => void;
  onThis: () => void;
}

function ForeignTeacherView({ currentFT, weekDates, weekLabel, enrichedSchedules, onPrev, onNext, onThis }: FTViewProps) {
  const { getNotesForSession, markAllReadForSession } = useForeignNotes();
  const [detailScheduleId, setDetailScheduleId] = useState<string | null>(null);

  const myAssigns = useMemo(
    () => enrichedSchedules.filter((s) => s.foreignTeacherId === currentFT.id),
    [enrichedSchedules, currentFT.id]
  );

  const byDate = useMemo(() => {
    const m: Record<string, any[]> = {};
    for (const s of myAssigns) {
      if (!m[s.date]) m[s.date] = [];
      m[s.date].push(s);
    }
    Object.values(m).forEach((arr) => arr.sort((a, b) => (a.foreignStartTime || a.startTime).localeCompare(b.foreignStartTime || b.startTime)));
    return m;
  }, [myAssigns]);

  const detailSched = detailScheduleId ? myAssigns.find((s) => s.id === detailScheduleId) : null;

  // ─── Time grid setup ───
  // Slot 30 phút từ 17:00 đến 21:30 = 10 slots
  const SLOT_MIN = 30;
  const START_MIN = 17 * 60; // 17:00
  const END_MIN = 21 * 60 + 30; // 21:30
  const totalSlots = (END_MIN - START_MIN) / SLOT_MIN;
  const SLOT_HEIGHT = 34; // px — compact để toàn bộ lịch fit màn hình
  const timeSlots = Array.from({ length: totalSlots }, (_, i) => {
    const m = START_MIN + i * SLOT_MIN;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  });

  const parseMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
            {currentFT.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm leading-tight truncate">{currentFT.name}</div>
            <div className="text-[10px] text-muted-foreground truncate">GV Nước ngoài • {branches.find((b) => b.id === currentFT.branchId)?.name}</div>
          </div>
          {(() => {
            const totalUnread = myAssigns.reduce((sum, s) => {
              return (
                sum +
                getNotesForSession(s.classId, s.date).filter(
                  (n) => n.foreignTeacherId === currentFT.id && !n.readAt
                ).length
              );
            }, 0);
            if (totalUnread === 0) return null;
            return (
              <div className="flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-700 rounded-full border border-rose-300">
                <MessageSquareText className="w-3 h-3" />
                <span className="text-[11px] font-bold">{totalUnread} note mới</span>
              </div>
            );
          })()}
          <Button variant="outline" size="sm" className="h-7 px-2" onClick={onPrev}><ChevronLeft className="w-3.5 h-3.5" /></Button>
          <div className="text-xs font-semibold whitespace-nowrap">{weekLabel}</div>
          <Button variant="outline" size="sm" className="h-7 px-2" onClick={onNext}><ChevronRight className="w-3.5 h-3.5" /></Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onThis}>Tuần này</Button>
        </div>

        {/* WEEKLY GRID: rows = time slots, cols = days */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header row: days */}
              <div className="grid border-b bg-orange-100/70 sticky top-0 z-10" style={{ gridTemplateColumns: `44px repeat(7, 1fr)` }}>
                <div className="px-1 py-1 text-[9px] font-semibold text-muted-foreground text-center border-r">Giờ</div>
                {weekDates.map((d, i) => {
                  const isToday = d === todayStr;
                  const dayCount = byDate[d]?.length ?? 0;
                  return (
                    <div key={d} className={`px-1 py-1 text-center border-r last:border-r-0 ${isToday ? "bg-emerald-100" : ""}`}>
                      <div className="text-[9px] font-medium text-muted-foreground leading-tight">{DOW_LABEL[i]}</div>
                      <div className={`text-xs font-bold leading-tight ${isToday ? "text-emerald-700" : ""}`}>{d.slice(8, 10)}/{d.slice(5, 7)}</div>
                      {dayCount > 0 && (
                        <div className="text-[8px] text-emerald-700 font-semibold leading-tight">{dayCount} lớp</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Body: relative grid + absolutely-positioned class cards per day */}
              <div className="relative grid" style={{ gridTemplateColumns: `44px repeat(7, 1fr)` }}>
                {/* Time labels column */}
                <div className="border-r flex flex-col">
                  {timeSlots.map((t) => (
                    <div key={t} className="text-[9px] font-mono text-muted-foreground text-right pr-1 border-b" style={{ height: SLOT_HEIGHT }}>
                      {t}
                    </div>
                  ))}
                </div>

                {/* 7 day columns */}
                {weekDates.map((d) => {
                  const isToday = d === todayStr;
                  const dayClasses = byDate[d] ?? [];
                  return (
                    <div
                      key={d}
                      className={`relative border-r last:border-r-0 ${isToday ? "bg-emerald-50/40" : ""}`}
                      style={{ height: totalSlots * SLOT_HEIGHT }}
                    >
                      {/* Background slot lines */}
                      {timeSlots.map((t, idx) => (
                        <div key={t} className="border-b border-dashed border-border/40" style={{ height: SLOT_HEIGHT }} />
                      ))}

                      {/* Class cards positioned absolutely */}
                      {dayClasses.map((s) => {
                        const startStr = s.foreignStartTime || s.startTime;
                        const endStr = s.foreignEndTime || s.endTime;
                        const startM = parseMin(startStr);
                        const endM = parseMin(endStr);
                        const top = ((startM - START_MIN) / SLOT_MIN) * SLOT_HEIGHT;
                        // Min height 24px để card luôn đọc được dù 15'
                        const height = Math.max(((endM - startM) / SLOT_MIN) * SLOT_HEIGHT, 24);

                        const session = syllabuses.find((sy) => sy.id === s.syllabusId)?.sessions.find((ss) => ss.id === s.syllabusSessionId);
                        const sessionNotes = getNotesForSession(s.classId, s.date).filter(
                          (n) => n.foreignTeacherId === currentFT.id
                        );
                        const unreadNotes = sessionNotes.filter((n) => !n.readAt).length;
                        const hasImportant = sessionNotes.some((n) => !n.readAt && n.priority === "important");

                        return (
                          <button
                            key={s.id}
                            onClick={() => setDetailScheduleId(s.id)}
                            className={`absolute left-0.5 right-0.5 rounded border-l-2 px-1 py-0.5 text-left transition-all hover:shadow-md hover:z-10 overflow-hidden ${
                              hasImportant
                                ? "bg-amber-100 border-amber-500 hover:bg-amber-200"
                                : unreadNotes > 0
                                ? "bg-rose-50 border-rose-400 hover:bg-rose-100"
                                : "bg-cyan-100 border-cyan-500 hover:bg-cyan-200"
                            }`}
                            style={{ top, height }}
                            title={`${s.className} · ${startStr}-${endStr} · ${s.room}`}
                          >
                            <div className="flex items-center gap-0.5">
                              <div className="font-bold text-[10px] text-cyan-900 truncate flex-1 leading-tight">{s.className}</div>
                              {unreadNotes > 0 && (
                                <span className={`min-w-[12px] h-[12px] rounded-full text-[8px] font-bold flex items-center justify-center px-0.5 flex-shrink-0 ${
                                  hasImportant ? "bg-amber-500 text-white animate-pulse" : "bg-rose-500 text-white"
                                }`}>{unreadNotes}</span>
                              )}
                            </div>
                            <div className="text-[8px] font-mono text-muted-foreground leading-tight truncate">{startStr}-{endStr}</div>
                            {height >= 45 && (
                              <div className="text-[8px] text-muted-foreground leading-tight truncate">
                                {s.room}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="px-2 py-1 border-t bg-muted/30 text-[9px] text-muted-foreground flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-100 border-l-2 border-cyan-500"></span>Bình thường</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-50 border-l-2 border-rose-400"></span>Note chưa đọc</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-100 border-l-2 border-amber-500"></span>Quan trọng</span>
            <span className="ml-auto">💡 Click ô để xem chi tiết · {myAssigns.length} lớp/tuần</span>
          </div>
        </Card>
      </div>

      <Dialog open={!!detailSched} onOpenChange={(o) => {
        if (!o) {
          setDetailScheduleId(null);
        } else if (detailSched) {
          markAllReadForSession(detailSched.classId, detailSched.date, currentFT.id);
        }
      }}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[92vh] p-0 overflow-hidden flex flex-col">
          {detailSched && (() => {
            const session = syllabuses.find((sy) => sy.id === detailSched.syllabusId)?.sessions.find((ss) => ss.id === detailSched.syllabusSessionId);
            const branch = branches.find((b) => b.id === detailSched.branchId);
            const dIdx = new Date(detailSched.date).getDay();
            const dowLabel = DOW_FULL[dIdx === 0 ? 6 : dIdx - 1];
            const sessionNotes = getNotesForSession(detailSched.classId, detailSched.date).filter(
              (n) => n.foreignTeacherId === currentFT.id
            );
            return (
              <>
                {/* Top bar */}
                <div className="flex items-center gap-3 px-5 py-3 border-b bg-gradient-to-r from-emerald-50 to-teal-50 flex-shrink-0">
                  <span className="bg-cyan-200 text-cyan-900 font-bold px-3 py-1 rounded text-base">{detailSched.className}</span>
                  <Badge variant="outline" className="text-emerald-700 font-mono">
                    {detailSched.foreignStartTime} - {detailSched.foreignEndTime}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{dowLabel}, {detailSched.date}</span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {detailSched.room} · {branch?.name}
                  </span>
                </div>

                {/* 2-column body */}
                <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
                  {/* LEFT: notes + info — scrollable */}
                  <div className="col-span-5 border-r overflow-y-auto p-4 space-y-3 bg-muted/10">
                    {/* Notes panel */}
                    {sessionNotes.length > 0 && (
                      <div className="border-2 border-emerald-400 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
                        <div className="px-3 py-2 bg-emerald-600 text-white flex items-center gap-2">
                          <MessageSquareText className="w-4 h-4" />
                          <span className="font-bold text-sm">📌 Lời nhắn từ GV Việt</span>
                          <Badge className="ml-auto bg-white text-emerald-700 hover:bg-white">
                            {sessionNotes.length} note
                          </Badge>
                        </div>
                        <div className="p-2 space-y-2">
                          {sessionNotes.map((n) => (
                            <div
                              key={n.id}
                              className={`bg-white rounded-lg p-3 border ${
                                n.priority === "important" ? "border-amber-400 ring-1 ring-amber-200" : "border-border"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="font-semibold text-sm text-foreground">{n.vnTeacherName}</span>
                                {n.priority === "important" && (
                                  <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-[10px] h-4">
                                    <Star className="w-2.5 h-2.5 mr-0.5" /> Important
                                  </Badge>
                                )}
                                <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(n.createdAt).toLocaleString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">{n.content}</p>
                              {n.highlightTopics && n.highlightTopics.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {n.highlightTopics.map((t, i) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="text-[10px] h-5 border-emerald-400 text-emerald-700 bg-emerald-50"
                                    >
                                      ⭐ {t}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <InfoBox icon={Clock} label="Thời gian GVNN" value={`${detailSched.foreignStartTime} - ${detailSched.foreignEndTime}`} />
                      <InfoBox icon={MapPin} label="Phòng" value={detailSched.room} />
                      <InfoBox icon={Users} label="Sĩ số" value={`${detailSched.studentCount ?? "—"} HV`} />
                      <InfoBox icon={GraduationCap} label="Độ tuổi" value={detailSched.ageRange ?? "—"} />
                      <InfoBox icon={Building2} label="Chi nhánh" value={branch?.name ?? "—"} />
                      <InfoBox icon={GraduationCap} label="GV Việt" value={detailSched.teacherName} />
                    </div>

                    {branch?.location && (
                      <div className="text-xs text-muted-foreground flex items-start gap-1.5 px-1">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        {branch.location}
                      </div>
                    )}

                    {/* Foreign content */}
                    <div className="border rounded-lg p-3 bg-emerald-50/30">
                      <div className="font-semibold text-sm mb-2">🌍 Nội dung GVNN phụ trách</div>
                      <pre className="text-xs font-sans whitespace-pre-wrap leading-relaxed text-foreground">
                        {session?.foreignContent || "Chưa có nội dung dành cho GVNN. Liên hệ TA/admin bổ sung."}
                      </pre>
                    </div>

                    {/* VN lesson */}
                    {session && (
                      <details className="border rounded-lg p-3 bg-muted/20">
                        <summary className="font-semibold text-sm cursor-pointer">📘 Bài học hôm nay: {session.title}</summary>
                        <div className="mt-3 space-y-2 text-xs">
                          <div><b>Vocab:</b> {session.vocab}</div>
                          <div><b>Grammar:</b> {session.grammar}</div>
                          <div><b>Quy trình GV VN:</b></div>
                          <pre className="font-sans whitespace-pre-wrap bg-white p-2 rounded border text-[11px]">{session.teachingProcess}</pre>
                        </div>
                      </details>
                    )}
                  </div>

                  {/* RIGHT: materials viewer — large area (ưu tiên slide demo GV Việt cho GVNN xem nhanh) */}
                  {(() => {
                    const slideUrl = detailSched?.materialsLink || session?.foreignMaterialsLink;
                    const fileLabel = slideUrl?.split("/").pop();
                    return (
                      <div className="col-span-7 flex flex-col overflow-hidden bg-background">
                        <div className="px-4 py-2 border-b bg-muted/30 flex items-center gap-2 flex-shrink-0">
                          <FileVideo className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-sm">Slide bài giảng</span>
                          {fileLabel && (
                            <span className="text-xs text-muted-foreground ml-2 truncate max-w-[280px]">📎 {fileLabel}</span>
                          )}
                        </div>
                        <div className="flex-1 overflow-auto p-3">
                          {slideUrl ? (
                            <MaterialsViewer
                              url={slideUrl}
                              title={session?.title}
                              watermark={currentFT.name}
                            />
                          ) : (
                            <div className="text-sm text-muted-foreground text-center py-20">
                              Chưa có tài liệu đính kèm cho buổi này.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoBox({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="border rounded-lg p-3 bg-white">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className="text-sm font-semibold mt-0.5">{value}</div>
    </div>
  );
}
