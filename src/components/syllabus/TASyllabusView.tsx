import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck, Clock, BookOpen, Link2, CheckCircle2,
  XCircle, AlertCircle, Star, Send, FileText, ChevronDown, ChevronRight,
  ClipboardList
} from "lucide-react";
import StaffReportTabContent from "@/components/syllabus/shared/StaffReportTabContent";
import SyllabusSidebarLayout, { type NavItem } from "@/components/syllabus/shared/SyllabusSidebarLayout";
import { GameTabContent, QuizTabContent } from "@/components/syllabus/shared/GameQuizContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  syllabuses, classSchedules, dailyReports as initialReports,
  students,
  type DailyReport, type AttendanceRecord, type AttendanceStatus
} from "@/data/mockData";

const TODAY = "2026-04-22";

const attendanceConfig: Record<AttendanceStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  present: { label: "Có mặt", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100 border-green-300" },
  absent: { label: "Vắng", icon: XCircle, color: "text-red-600", bg: "bg-red-100 border-red-300" },
  late: { label: "Trễ", icon: AlertCircle, color: "text-yellow-600", bg: "bg-yellow-100 border-yellow-300" },
};

const classStudents = students.filter(s => s.classIds.includes("CLS001")).slice(0, 8);

type TATab = "today" | "attendance" | "reports" | "staff_report";

const TASyllabusView: React.FC = () => {
  const [selectedSyllabusId, setSelectedSyllabusId] = useState<string | null>(null);
  const [reports, setReports] = useState<DailyReport[]>(initialReports);
  const [activeTab, setActiveTab] = useState<TATab>("today");
  const [expandedProcess, setExpandedProcess] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState<NavItem>("syllabus");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Today's data
  const todaySchedule = classSchedules.find(cs => cs.date === TODAY);
  const todaySyllabus = todaySchedule ? syllabuses.find(s => s.id === todaySchedule.syllabusId) : null;
  const todaySession = todaySyllabus?.sessions.find(s => s.id === todaySchedule?.syllabusSessionId);
  const existingReport = reports.find(r => r.classScheduleId === todaySchedule?.id);

  // Attendance state
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() =>
    classStudents.map(s => ({ studentId: s.id, studentName: s.name, studentAvatar: s.avatar, status: "present" as AttendanceStatus, note: "" }))
  );

  // Report form
  const [classEnergy, setClassEnergy] = useState<number>(existingReport?.classEnergy ?? 0);
  const [generalNotes, setGeneralNotes] = useState(existingReport?.generalNotes ?? "");
  const [issues, setIssues] = useState(existingReport?.issues ?? "");

  // Per-student note dialog
  const [noteDialog, setNoteDialog] = useState<{ stuId: string; name: string } | null>(null);
  const [noteText, setNoteText] = useState("");

  const updateAttendance = (stuId: string, status: AttendanceStatus) => {
    setAttendance(prev => prev.map(a => a.studentId === stuId ? { ...a, status } : a));
  };

  const openNoteDialog = (stuId: string, name: string) => {
    const current = attendance.find(a => a.studentId === stuId);
    setNoteText(current?.note ?? "");
    setNoteDialog({ stuId, name });
  };

  const saveNote = () => {
    if (!noteDialog) return;
    setAttendance(prev => prev.map(a => a.studentId === noteDialog.stuId ? { ...a, note: noteText } : a));
    setNoteDialog(null);
    toast.success("Đã lưu ghi chú");
  };

  const submitReport = (draft: boolean) => {
    if (!todaySchedule || !todaySession) return;
    if (classEnergy === 0 && !draft) { toast.error("Vui lòng đánh giá năng lượng lớp"); return; }

    const report: DailyReport = {
      id: existingReport?.id ?? `DR_${Date.now()}`,
      classScheduleId: todaySchedule.id,
      classId: todaySchedule.classId,
      className: todaySchedule.className,
      sessionTitle: todaySession.title,
      date: TODAY,
      taId: todaySchedule.taId ?? "",
      taName: todaySchedule.taName ?? "",
      attendance,
      classEnergy,
      generalNotes,
      issues,
      submittedAt: draft ? undefined : new Date().toISOString(),
      isDraft: draft,
    };

    setReports(prev => {
      const exists = prev.find(r => r.classScheduleId === todaySchedule.id);
      return exists ? prev.map(r => r.id === exists.id ? report : r) : [...prev, report];
    });

    if (draft) toast.info("Đã lưu nháp báo cáo");
    else toast.success("Đã nộp báo cáo buổi học thành công!");
  };

  const presentCount = attendance.filter(a => a.status === "present").length;
  const absentCount = attendance.filter(a => a.status === "absent").length;
  const lateCount = attendance.filter(a => a.status === "late").length;

  // ====== COURSE SELECTION SCREEN ======
  if (!selectedSyllabusId) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-foreground">Chọn khóa học</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Chọn 1 khóa để xem chi tiết buổi học, điểm danh và báo cáo học vụ</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {syllabuses.map((syl, i) => (
            <motion.button
              key={syl.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedSyllabusId(syl.id)}
              className="text-left bg-card border border-border hover:border-primary/60 hover:shadow-md rounded-xl p-5 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground truncate">{syl.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Cấp độ: {syl.level}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{syl.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{syl.totalSessions} buổi</span>
                <span className="text-primary font-medium flex items-center gap-1">
                  Vào khóa <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  const currentSyllabus = syllabuses.find(s => s.id === selectedSyllabusId);

  // ====== COURSE DETAIL (TABS) ======
  const tabs: { id: TATab; label: string; icon: React.ElementType }[] = [
    { id: "today", label: "Ca học hôm nay", icon: Clock },
    { id: "attendance", label: "Điểm danh", icon: ClipboardCheck },
    { id: "staff_report", label: "Báo cáo học vụ", icon: ClipboardList },
  ];

  React.useEffect(() => {
    if (currentSyllabus && !selectedSessionId) {
      const todaySched = classSchedules.find(cs => cs.date === TODAY && cs.syllabusId === currentSyllabus.id);
      const initial = todaySched?.syllabusSessionId ?? currentSyllabus.sessions[0]?.id ?? null;
      setSelectedSessionId(initial);
    }
  }, [currentSyllabus, selectedSessionId]);

  if (!currentSyllabus) return null;

  const selectedSession = currentSyllabus.sessions.find(s => s.id === selectedSessionId) ?? currentSyllabus.sessions[0];

  return (
    <SyllabusSidebarLayout
      syllabus={currentSyllabus}
      classSchedules={classSchedules}
      selectedSessionId={selectedSessionId}
      onSessionSelect={setSelectedSessionId}
      activeNavItem={activeNavItem}
      onNavItemChange={setActiveNavItem}
      teacherName="Ms. Thu Trang"
      breadcrumb={`Học vụ / Khoá học của tôi / ${currentSyllabus.id}`}
      onBack={() => { setSelectedSyllabusId(null); setSelectedSessionId(null); }}
    >
      {activeNavItem === "game" ? (
        <GameTabContent />
      ) : activeNavItem === "quiz" ? (
        <QuizTabContent />
      ) : (
        <>
      {/* Session header */}
      {selectedSession && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">BUỔI {selectedSession.order}</p>
          <h2 className="text-xl font-bold text-foreground mb-1.5">Buổi {selectedSession.order}: {selectedSession.title}</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>90 phút</span>
            <span>·</span>
            <span>Tuần {Math.ceil(selectedSession.order / 2)}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === t.id ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* TODAY TAB */}
      {activeTab === "today" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {todaySession && todaySchedule ? (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="bg-indigo-50 border-b border-border px-5 py-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground">Session {todaySession.order}: {todaySession.title}</h3>
                      <Badge variant="secondary">{todaySyllabus?.name}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {todaySchedule.className} · {todaySchedule.startTime} – {todaySchedule.endTime} · {todaySchedule.room}
                    </p>
                  </div>
                  {todaySession.materialsLink && (
                    <a href={todaySession.materialsLink} target="_blank" rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:underline">
                      <Link2 className="w-3.5 h-3.5" /> Tài liệu buổi học
                    </a>
                  )}
                </div>
              </div>
              <div className="px-5 py-4 grid grid-cols-2 gap-3">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">📚 Từ vựng</p>
                  <p className="text-xs text-foreground leading-relaxed">{todaySession.vocab}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">📝 Ngữ pháp</p>
                  <p className="text-xs text-foreground leading-relaxed">{todaySession.grammar}</p>
                </div>
                <div className="col-span-2">
                  <button onClick={() => setExpandedProcess(p => !p)} className="w-full flex items-center justify-between text-sm font-semibold text-foreground py-1">
                    <span>📋 Quy trình dạy</span>
                    {expandedProcess ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expandedProcess && (
                    <pre className="mt-2 text-xs font-sans text-foreground whitespace-pre-wrap leading-relaxed bg-muted/30 p-3 rounded-lg">{todaySession.teachingProcess}</pre>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Không có ca học hôm nay</p>
            </div>
          )}
        </motion.div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === "attendance" && todaySchedule && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="border-b border-border px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-foreground" />
                <h4 className="font-semibold text-sm text-foreground">Điểm danh</h4>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-green-600 font-medium">✓ {presentCount} có mặt</span>
                {lateCount > 0 && <span className="text-yellow-600 font-medium">⏰ {lateCount} trễ</span>}
                {absentCount > 0 && <span className="text-red-600 font-medium">✗ {absentCount} vắng</span>}
              </div>
            </div>
            <div className="divide-y divide-border">
              {attendance.map(stu => {
                return (
                  <div key={stu.studentId} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      {stu.studentAvatar}
                    </div>
                    <span className="text-sm flex-1 font-medium text-foreground">{stu.studentName}</span>
                    {stu.note && <span className="text-xs text-muted-foreground italic truncate max-w-[120px]">{stu.note}</span>}
                    <div className="flex gap-1.5 flex-shrink-0">
                      {(["present", "late", "absent"] as AttendanceStatus[]).map(s => {
                        const c = attendanceConfig[s];
                        const I = c.icon;
                        return (
                          <button key={s} onClick={() => updateAttendance(stu.studentId, s)}
                            className={`p-1.5 rounded-lg border transition-all ${stu.status === s ? c.bg + " border-current " + c.color : "border-border text-muted-foreground/40 hover:border-muted-foreground/40"}`}
                            title={c.label}>
                            <I className="w-4 h-4" />
                          </button>
                        );
                      })}
                      <button onClick={() => openNoteDialog(stu.studentId, stu.studentName)}
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors" title="Thêm ghi chú">
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick energy + submit */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Send className="w-4 h-4" /> Báo cáo nhanh buổi học
            </h4>
            <div>
              <label className="text-sm font-medium mb-2 block">⚡ Năng lượng lớp học</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setClassEnergy(n)}
                    className={`w-10 h-10 rounded-xl border-2 font-bold text-sm transition-all ${classEnergy >= n ? "border-yellow-400 bg-yellow-50 text-yellow-600" : "border-border text-muted-foreground/40 hover:border-yellow-300"}`}>
                    <Star className={`w-4 h-4 mx-auto ${classEnergy >= n ? "fill-yellow-400 text-yellow-400" : ""}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">📝 Ghi chú chung</label>
              <Textarea rows={3} placeholder="Tình hình lớp học hôm nay..." value={generalNotes} onChange={e => setGeneralNotes(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">⚠️ Vấn đề phát sinh</label>
              <Textarea rows={2} placeholder="Học sinh vắng đột xuất, tài liệu thiếu..." value={issues} onChange={e => setIssues(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-1.5" onClick={() => submitReport(true)}>
                <FileText className="w-4 h-4" /> Lưu nháp
              </Button>
              <Button className="flex-1 gap-1.5" onClick={() => submitReport(false)}>
                <Send className="w-4 h-4" /> Nộp báo cáo
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* REPORTS HISTORY TAB */}
      {activeTab === "reports" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {reports.filter(r => !r.isDraft).length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Chưa có báo cáo nào được nộp</p>
            </div>
          ) : (
            reports.filter(r => !r.isDraft).map((report, i) => (
              <motion.div key={report.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-foreground">{report.sessionTitle}</h4>
                      <Badge variant="secondary">{report.className}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(report.date).toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1 rounded-full">
                    {[...Array(report.classEnergy)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                    {[...Array(5 - report.classEnergy)].map((_, i) => <Star key={i} className="w-3 h-3 text-muted-foreground/30" />)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {(["present", "absent", "late"] as AttendanceStatus[]).map(s => {
                    const count = report.attendance.filter(a => a.status === s).length;
                    const c = attendanceConfig[s];
                    return (
                      <div key={s} className={`text-center py-2 rounded-lg border ${c.bg}`}>
                        <p className={`text-lg font-bold ${c.color}`}>{count}</p>
                        <p className={`text-xs ${c.color}`}>{c.label}</p>
                      </div>
                    );
                  })}
                </div>
                {report.generalNotes && <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg">{report.generalNotes}</p>}
                {report.issues && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg mt-2">⚠️ {report.issues}</p>}
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* STAFF REPORT TAB (chỉ TA/Admin) */}
      {activeTab === "staff_report" && (
        <StaffReportTabContent />
      )}

        </>
      )}

      {/* Note Dialog */}
      <Dialog open={!!noteDialog} onOpenChange={() => setNoteDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Ghi chú: {noteDialog?.name}</DialogTitle></DialogHeader>
          <Textarea rows={3} placeholder="Nhập ghi chú cho học sinh này..." value={noteText} onChange={e => setNoteText(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialog(null)}>Hủy</Button>
            <Button onClick={saveNote}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SyllabusSidebarLayout>
  );
};

export default TASyllabusView;
