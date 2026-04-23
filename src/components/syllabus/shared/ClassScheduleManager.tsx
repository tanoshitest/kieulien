import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, MapPin, User, FileText, ChevronDown, ChevronRight,
  TrendingUp, AlertTriangle, CheckCircle2, CircleDashed, Pencil, Plus,
  Trash2, Split, GitMerge, ArrowRightLeft, History, X, Save,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { classes, type ClassSchedule, type Syllabus } from "@/data/mockData";
import {
  computeClassScheduleSummary, kindBadge, progressStatusBadge, statusTone,
} from "@/utils/classScheduleUtils";
import {
  useClassSchedules,
  reasonLabel,
  type ChangeReason,
  type ChangeRequestType,
  type ChangeRequestPayload,
  type ScheduleChangeRequest,
  type AuditAction,
} from "@/contexts/ClassScheduleContext";
import { useRole } from "@/contexts/RoleContext";

interface Props {
  syllabus: Syllabus;
}

const auditActionLabel: Record<AuditAction, { label: string; color: string }> = {
  progress_update:    { label: "Cập nhật tiến độ", color: "bg-blue-100 text-blue-700" },
  request_submit:     { label: "Gửi đề xuất",     color: "bg-amber-100 text-amber-700" },
  request_approve:    { label: "Duyệt",           color: "bg-emerald-100 text-emerald-700" },
  request_reject:     { label: "Từ chối",         color: "bg-rose-100 text-rose-700" },
  admin_direct_edit:  { label: "Admin sửa",       color: "bg-violet-100 text-violet-700" },
  schedule_create:    { label: "Thêm buổi",       color: "bg-emerald-100 text-emerald-700" },
  schedule_delete:    { label: "Xoá buổi",        color: "bg-rose-100 text-rose-700" },
};

const reqTypeLabel: Record<ChangeRequestType, string> = {
  split: "Tách buổi (Split)",
  insert: "Chèn buổi bù",
  shift: "Dời lịch",
  merge: "Gộp 2 session",
};

const ClassScheduleManager: React.FC<Props> = ({ syllabus }) => {
  const { isAdmin, isTeacher, isTA } = useRole();
  const canReview = isAdmin || isTA;
  const reviewerName = isTA ? "Ms. Linh Chi (Học vụ)" : "Admin";
  const reviewerRole: "admin" | "ta" = isTA ? "ta" : "admin";
  const {
    schedules, requests, auditLogs,
    updateProgress, submitRequest, approveRequest, rejectRequest,
    addSchedule, updateSchedule, removeSchedule, pendingCount,
  } = useClassSchedules();

  // ── Lớp đang dùng syllabus
  const classesUsingSyllabus = useMemo(() => {
    const ids = Array.from(new Set(schedules.filter(cs => cs.syllabusId === syllabus.id).map(cs => cs.classId)));
    return ids.map(id => classes.find(c => c.id === id)).filter((c): c is NonNullable<typeof c> => Boolean(c));
  }, [schedules, syllabus.id]);

  const [selectedClassId, setSelectedClassId] = useState<string | null>(classesUsingSyllabus[0]?.id ?? null);
  const [tab, setTab] = useState<"timeline" | "history">("timeline");
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | null>(null);

  // Auto-expand buổi đầu tiên có request pending để học vụ/admin thấy ngay
  React.useEffect(() => {
    if (!selectedClassId) return;
    const firstPending = requests.find(r => r.classId === selectedClassId && r.status === "pending");
    if (firstPending) {
      const sid = (() => {
        const p = firstPending.payload;
        if (p.type === "split" || p.type === "shift") return p.scheduleId;
        if (p.type === "insert") return p.afterScheduleId;
        if (p.type === "merge") return p.primaryScheduleId;
        return null;
      })();
      if (sid) setExpandedScheduleId(sid);
    }
  }, [selectedClassId, requests]);

  // ── Dialog states
  const [progressDialog, setProgressDialog] = useState<ClassSchedule | null>(null);
  const [requestDialog, setRequestDialog] = useState<{ type: ChangeRequestType; sched?: ClassSchedule } | null>(null);
  const [reviewDialog, setReviewDialog] = useState<{ requestId: string; mode: "approve" | "reject" } | null>(null);
  const [adminEditDialog, setAdminEditDialog] = useState<ClassSchedule | null>(null);

  if (classesUsingSyllabus.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
        <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Chưa có lớp nào dùng syllabus này</p>
        <p className="text-sm mt-1">Khi xếp lớp xong, lịch học thực tế sẽ hiển thị tại đây.</p>
      </div>
    );
  }

  const selectedClass = classesUsingSyllabus.find(c => c.id === selectedClassId);
  const summaries = classesUsingSyllabus.map(c => ({
    classItem: c,
    summary: computeClassScheduleSummary(c.id, c.name, syllabus, schedules),
  }));
  const selectedSummary = summaries.find(s => s.classItem.id === selectedClassId)?.summary;

  const classSchedulesSorted = useMemo(() => {
    if (!selectedClassId) return [];
    return schedules
      .filter(cs => cs.classId === selectedClassId && cs.syllabusId === syllabus.id)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedClassId, syllabus.id, schedules]);

  const classRequests = useMemo(
    () => requests.filter(r => r.classId === selectedClassId).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
    [requests, selectedClassId],
  );

  const classLogs = useMemo(
    () => auditLogs.filter(l => l.classId === selectedClassId).sort((a, b) => b.at.localeCompare(a.at)),
    [auditLogs, selectedClassId],
  );

  const classPendingCount = classRequests.filter(r => r.status === "pending").length;

  return (
    <div className="space-y-5">
      {/* Explainer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm flex-1">
          <p className="font-semibold text-blue-900">Lịch học thực tế (Class Schedule)</p>
          <p className="text-blue-800 mt-0.5">
            Mỗi lớp có lịch riêng được clone từ syllabus mẫu.
            {isTeacher && " Giáo viên có thể tick tiến độ sau buổi học và đề xuất điều chỉnh — chờ Học vụ duyệt (chỉ cho lớp đó)."}
            {isTA && " Học vụ duyệt đề xuất cho lớp mình phụ trách. Việc duyệt KHÔNG ảnh hưởng tới syllabus mẫu."}
            {isAdmin && " Admin có thể chỉnh trực tiếp hoặc duyệt đề xuất từ giáo viên."}
          </p>
        </div>
        {canReview && pendingCount > 0 && (
          <Badge className="bg-amber-500 text-white">{pendingCount} đề xuất chờ duyệt</Badge>
        )}
      </div>

      {/* Class summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {summaries.map(({ classItem, summary }) => {
          const tone = statusTone(summary.status);
          const isActive = classItem.id === selectedClassId;
          return (
            <button
              key={classItem.id}
              onClick={() => setSelectedClassId(classItem.id)}
              className={`text-left bg-card rounded-xl p-4 border transition-all ${
                isActive ? "border-primary ring-2 ring-primary/20 shadow" : "border-border hover:border-primary/40"
              }`}
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{classItem.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{classItem.schedule}</p>
                </div>
                <Badge variant="outline" className={`${tone.cls} text-[10px] font-semibold flex-shrink-0`}>
                  {tone.label}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Mẫu</p>
                  <p className="text-sm font-bold text-slate-700">{summary.templateSessions}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Thực tế</p>
                  <p className="text-sm font-bold text-blue-700">{summary.actualSchedules}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Chênh</p>
                  <p className={`text-sm font-bold ${
                    summary.deviation > 0 ? "text-rose-600" : summary.deviation < 0 ? "text-emerald-600" : "text-slate-600"
                  }`}>{summary.deviation > 0 ? `+${summary.deviation}` : summary.deviation}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      {selectedClass && selectedSummary && (
        <motion.div
          key={selectedClass.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          {/* Class header */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-bold text-base text-foreground">{selectedClass.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedClass.schedule} · {selectedClass.studentCount}/{selectedClass.maxStudents} HV ·
                Khai giảng {selectedClass.startDate}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedSummary.deviation > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-amber-800 font-medium">Chậm {selectedSummary.deviation} buổi</span>
                </div>
              )}
              {isAdmin && (
                <></>
              )}
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex border-b border-border bg-muted/20">
            <button
              onClick={() => setTab("timeline")}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === "timeline" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
              Timeline buổi học
              {classPendingCount > 0 && <Badge className="ml-1.5 bg-amber-500 text-white text-[10px] h-4 px-1.5">{classPendingCount}</Badge>}
            </button>
            <button
              onClick={() => setTab("history")}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === "history" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <History className="w-3.5 h-3.5 inline mr-1.5" />
              Lịch sử thay đổi
            </button>
          </div>

          {/* Tab content */}
          <div className="p-5">
            {tab === "timeline" && (
              <TimelineTab
                syllabus={syllabus}
                schedules={classSchedulesSorted}
                requests={classRequests}
                expandedId={expandedScheduleId}
                onToggleExpand={(id) => setExpandedScheduleId(expandedScheduleId === id ? null : id)}
                onUpdateProgress={(s) => setProgressDialog(s)}
                onRequestChange={(type, sched) => setRequestDialog({ type, sched })}
                onAdminEdit={(s) => setAdminEditDialog(s)}
                onAdminDelete={(s) => {
                  if (confirm(`Xoá buổi ngày ${s.date}?`)) {
                    removeSchedule(s.id, { name: "Admin", role: "admin" }, `Admin xoá buổi ${s.date}`);
                    toast.success("Đã xoá buổi");
                  }
                }}
                onReview={(id, mode) => setReviewDialog({ requestId: id, mode })}
                isAdmin={isAdmin}
                isTeacher={isTeacher}
                canReview={canReview}
              />
            )}

            {tab === "history" && (
              <HistoryTab logs={classLogs} />
            )}

            {/* Stats footer */}
            {tab === "timeline" && (
              <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <Stat label="Buổi mẫu" value={String(selectedSummary.templateSessions)} color="text-slate-700" />
                <Stat label="Buổi thực tế" value={String(selectedSummary.actualSchedules)} color="text-blue-700" />
                <Stat label="Đã hoàn tất" value={`${selectedSummary.completedSessions}/${selectedSummary.templateSessions}`} color="text-emerald-700" />
                <Stat label="Deviation" value={`${selectedSummary.deviation > 0 ? "+" : ""}${selectedSummary.deviation} buổi`}
                  color={selectedSummary.deviation > 0 ? "text-rose-600" : selectedSummary.deviation < 0 ? "text-emerald-600" : "text-slate-600"} />
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* DIALOGS */}
      <ProgressDialog
        schedule={progressDialog}
        onClose={() => setProgressDialog(null)}
        onSave={(patch) => {
          if (!progressDialog) return;
          updateProgress(progressDialog.id, patch, { name: isAdmin ? "Admin" : "Ms. Thu Trang", role: isAdmin ? "admin" : "teacher" });
          toast.success("Đã cập nhật tiến độ");
          setProgressDialog(null);
        }}
      />

      <RequestDialog
        config={requestDialog}
        syllabus={syllabus}
        classId={selectedClass?.id ?? ""}
        className={selectedClass?.name ?? ""}
        schedules={classSchedulesSorted}
        onClose={() => setRequestDialog(null)}
        onSubmit={(payload, reason, reasonNote) => {
          if (!requestDialog || !selectedClass) return;
          submitRequest({
            type: requestDialog.type,
            classId: selectedClass.id,
            className: selectedClass.name,
            syllabusId: syllabus.id,
            payload,
            reason,
            reasonNote,
            requestedBy: "USR001",
            requestedByName: isTeacher ? "Ms. Thu Trang" : "Admin",
          });
          toast.success("Đã gửi đề xuất, chờ Học vụ duyệt");
          setRequestDialog(null);
        }}
      />

      <ReviewDialog
        config={reviewDialog}
        request={reviewDialog ? requests.find(r => r.id === reviewDialog.requestId) ?? null : null}
        onClose={() => setReviewDialog(null)}
        onConfirm={(note) => {
          if (!reviewDialog) return;
          if (reviewDialog.mode === "approve") {
            approveRequest(reviewDialog.requestId, { id: reviewerRole === "ta" ? "USR_OPS" : "USR_ADMIN", name: reviewerName }, note);
            toast.success(`Đã duyệt đề xuất (${reviewerRole === "ta" ? "Học vụ" : "Admin"} — chỉ áp dụng cho lớp này, không ảnh hưởng template)`);
          } else {
            rejectRequest(reviewDialog.requestId, { id: reviewerRole === "ta" ? "USR_OPS" : "USR_ADMIN", name: reviewerName }, note || "Từ chối");
            toast.info("Đã từ chối đề xuất");
          }
          setReviewDialog(null);
        }}
      />

      <AdminEditDialog
        schedule={adminEditDialog}
        syllabus={syllabus}
        allSchedules={schedules}
        onClose={() => setAdminEditDialog(null)}
        onSave={(payload, isNew) => {
          if (!adminEditDialog) return;
          if (isNew) {
            const id = `CS_ADMIN_${Date.now()}`;
            addSchedule({ ...payload, id }, { name: "Admin", role: "admin" }, `Admin thêm buổi ${payload.date} (${payload.kind})`);
            toast.success("Đã thêm buổi mới");
          } else {
            updateSchedule(adminEditDialog.id, payload, { name: "Admin", role: "admin" }, `Admin sửa buổi ${payload.date}`);
            toast.success("Đã cập nhật buổi");
          }
          setAdminEditDialog(null);
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Timeline tab
// ─────────────────────────────────────────────────────────────
/** Lấy scheduleId chính mà request gắn vào (để lồng vào timeline) */
const getRequestScheduleId = (r: ScheduleChangeRequest): string | null => {
  const p = r.payload;
  if (p.type === "split") return p.scheduleId;
  if (p.type === "shift") return p.scheduleId;
  if (p.type === "insert") return p.afterScheduleId;
  if (p.type === "merge") return p.primaryScheduleId;
  return null;
};

const TimelineTab: React.FC<{
  syllabus: Syllabus;
  schedules: ClassSchedule[];
  requests: ScheduleChangeRequest[];
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  onUpdateProgress: (s: ClassSchedule) => void;
  onRequestChange: (type: ChangeRequestType, sched: ClassSchedule) => void;
  onAdminEdit: (s: ClassSchedule) => void;
  onAdminDelete: (s: ClassSchedule) => void;
  onReview: (id: string, mode: "approve" | "reject") => void;
  isAdmin: boolean;
  isTeacher: boolean;
  canReview: boolean;
}> = ({ syllabus, schedules, requests, expandedId, onToggleExpand, onUpdateProgress, onRequestChange, onAdminEdit, onAdminDelete, onReview, isAdmin, isTeacher, canReview }) => {
  return (
    <div className="space-y-2">
      {schedules.map((cs, idx) => {
        const sess = syllabus.sessions.find(s => s.id === cs.syllabusSessionId);
        const isExpanded = expandedId === cs.id;
        const kind = cs.kind ?? "regular";
        const kindInfo = kindBadge[kind];
        const ps = cs.progressStatus ?? "planned";
        const psInfo = progressStatusBadge[ps];
        const csRequests = requests.filter(r => getRequestScheduleId(r) === cs.id);
        const csPending = csRequests.filter(r => r.status === "pending");
        const isDerived = kind !== "regular"; // buổi sinh ra do split/insert/merge → thụt vào

        return (
          <div key={cs.id} className={`relative ${isDerived ? "pl-10" : ""}`}>
            {idx < schedules.length - 1 && <div className={`absolute top-10 bottom-0 w-0.5 bg-border ${isDerived ? "left-[59px]" : "left-[19px]"}`} />}
            {isDerived && (
              <div className="absolute left-6 top-5 w-6 h-3 border-l-2 border-b-2 border-dashed border-muted-foreground/30 rounded-bl-lg" />
            )}

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 flex items-start justify-center pt-2">
                {ps === "completed-full" ? <CheckCircle2 className="w-6 h-6 text-emerald-500 bg-card rounded-full" /> :
                 ps === "completed-partial" ? <CheckCircle2 className="w-6 h-6 text-amber-500 bg-card rounded-full" /> :
                 ps === "skipped" ? <CircleDashed className="w-6 h-6 text-rose-400 bg-card rounded-full" /> :
                 <CircleDashed className="w-6 h-6 text-slate-300 bg-card rounded-full" />}
              </div>

              <div className="flex-1 bg-muted/20 border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => onToggleExpand(cs.id)}
                  className="w-full p-3 flex items-center gap-3 text-left hover:bg-muted/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">Buổi {idx + 1}</span>
                      <span className="text-sm font-semibold text-foreground">
                        {sess ? `Session ${sess.order}: ${sess.title}` : "(không xác định)"}
                      </span>
                      <Badge variant="outline" className={`${kindInfo.color} text-[10px]`}>{kindInfo.label}</Badge>
                      <Badge variant="outline" className={`${psInfo.color} text-[10px] border-transparent`}>{psInfo.label}</Badge>
                      {csPending.length > 0 && (
                        <Badge className="bg-amber-500 text-white text-[10px] gap-1 animate-pulse">
                          <ArrowRightLeft className="w-3 h-3" />{csPending.length} đề xuất chờ duyệt
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{cs.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{cs.startTime}–{cs.endTime}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{cs.room}</span>
                    </div>
                  </div>
                  {cs.progressPercent !== undefined && cs.progressPercent < 100 && (
                    <div className="flex-shrink-0 text-right">
                      <p className="text-[10px] text-muted-foreground">% nội dung</p>
                      <p className="text-sm font-bold text-amber-600">{cs.progressPercent}%</p>
                    </div>
                  )}
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="border-t border-border p-3 bg-background space-y-3">
                        {/* ═══ Inline Change Requests (ưu tiên trên cùng) ═══ */}
                        {csRequests.length > 0 && (
                          <div className="space-y-2">
                            {csRequests.map(r => {
                              const statusColor = r.status === "pending" ? "bg-amber-100 text-amber-700 border-amber-300"
                                : r.status === "approved" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : "bg-rose-100 text-rose-700 border-rose-200";
                              const statusLabel = r.status === "pending" ? "Chờ duyệt" : r.status === "approved" ? "Đã duyệt" : "Từ chối";
                              const payloadPreview = (() => {
                                const p = r.payload;
                                if (p.type === "split") return `Tách: part A đạt ${p.partAPercent}% · Phần B dời sang ${p.partBDate} ${p.partBStartTime}–${p.partBEndTime} @ ${p.partBRoom}`;
                                if (p.type === "shift") return `Dời sang ngày ${p.newDate}${p.cascade ? " · cascade các buổi sau" : ""}`;
                                if (p.type === "insert") return `Chèn buổi bù ${p.date} ${p.startTime}–${p.endTime} @ ${p.room} · mục đích: ${p.purpose}`;
                                if (p.type === "merge") return `Gộp buổi ${p.removeScheduleId} vào buổi này`;
                                return "";
                              })();
                              return (
                                <div key={r.id} className={`border rounded-md p-2.5 ${r.status === "pending" ? "border-amber-300 bg-amber-50/50 ring-1 ring-amber-200" : "border-border bg-muted/20"}`}>
                                  <div className="flex items-start justify-between gap-2 flex-wrap mb-1.5">
                                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                                      <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
                                      <span className="text-xs font-semibold">{reqTypeLabel[r.type]}</span>
                                      <Badge variant="outline" className={`${statusColor} text-[10px]`}>{statusLabel}</Badge>
                                    </div>
                                    {r.status === "pending" && canReview && (
                                      <div className="flex gap-1.5">
                                        <Button size="sm" className="h-6 text-[11px] gap-1 bg-emerald-600 hover:bg-emerald-700 px-2" onClick={(e) => { e.stopPropagation(); onReview(r.id, "approve"); }}>
                                          <CheckCircle2 className="w-3 h-3" />Duyệt
                                        </Button>
                                        <Button size="sm" variant="outline" className="h-6 text-[11px] gap-1 text-rose-700 border-rose-300 px-2" onClick={(e) => { e.stopPropagation(); onReview(r.id, "reject"); }}>
                                          <X className="w-3 h-3" />Từ chối
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-muted-foreground mb-1">
                                    {r.requestedByName} · {r.requestedAt.split("T")[0]} {r.requestedAt.split("T")[1]?.slice(0, 5)} · Lý do: <span className="font-medium text-foreground">{reasonLabel[r.reason]}</span>
                                  </p>
                                  <p className="text-xs bg-background/60 rounded p-1.5 border border-border/60">{payloadPreview}</p>
                                  {r.reasonNote && <p className="text-[11px] italic text-muted-foreground mt-1">"{r.reasonNote}"</p>}
                                  {r.reviewNote && (
                                    <p className="text-[11px] mt-1">
                                      <span className="text-muted-foreground">Phản hồi {r.reviewedByName}:</span> <span className="font-medium">{r.reviewNote}</span>
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">GV:</span>
                            <span className="font-medium">{cs.teacherName}</span>
                          </div>
                          {cs.taName && (
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">TA:</span>
                              <span className="font-medium">{cs.taName}</span>
                            </div>
                          )}
                        </div>
                        {cs.parentScheduleId && (
                          <p className="text-xs text-muted-foreground">↳ Tiếp nối từ buổi <code className="font-mono">{cs.parentScheduleId}</code></p>
                        )}
                        {cs.mergedSessionIds && cs.mergedSessionIds.length > 0 && (
                          <p className="text-xs text-violet-700">
                            <GitMerge className="w-3 h-3 inline mr-1" />
                            Buổi này gộp thêm: {cs.mergedSessionIds.join(", ")}
                          </p>
                        )}
                        {cs.progressNote && (
                          <div className="bg-amber-50/50 border border-amber-100 rounded-md p-2">
                            <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Ghi chú tiến độ
                            </p>
                            <p className="text-xs text-foreground">{cs.progressNote}</p>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {isTeacher && !isAdmin && (
                            <>
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 text-amber-700 border-amber-300" onClick={() => onRequestChange("split", cs)}>
                                <Split className="w-3 h-3" /> Đề xuất tách
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 text-blue-700 border-blue-300" onClick={() => onRequestChange("insert", cs)}>
                                <Plus className="w-3 h-3" /> Đề xuất chèn buổi bù
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 text-purple-700 border-purple-300" onClick={() => onRequestChange("shift", cs)}>
                                <ArrowRightLeft className="w-3 h-3" /> Đề xuất dời lịch
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 text-violet-700 border-violet-300" onClick={() => onRequestChange("merge", cs)}>
                                <GitMerge className="w-3 h-3" /> Đề xuất gộp
                              </Button>
                            </>
                          )}
                          {isAdmin && (
                            <>
                              <div className="flex-1" />
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => onAdminEdit(cs)}>
                                <Pencil className="w-3 h-3" /> Sửa trực tiếp
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 text-rose-700 border-rose-300" onClick={() => onAdminDelete(cs)}>
                                <Trash2 className="w-3 h-3" /> Xoá
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Requests tab
// ─────────────────────────────────────────────────────────────
const RequestsTab: React.FC<{
  requests: ReturnType<typeof useClassSchedules>["requests"];
  isAdmin: boolean;
  onReview: (id: string, mode: "approve" | "reject") => void;
}> = ({ requests, isAdmin, onReview }) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ArrowRightLeft className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Chưa có đề xuất nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map(r => {
        const statusColor = r.status === "pending" ? "bg-amber-100 text-amber-700 border-amber-200"
          : r.status === "approved" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
          : "bg-rose-100 text-rose-700 border-rose-200";
        const statusLabel = r.status === "pending" ? "Chờ duyệt" : r.status === "approved" ? "Đã duyệt" : "Từ chối";

        return (
          <div key={r.id} className="border border-border rounded-lg p-4 bg-card">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <code className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{r.id}</code>
                  <span className="font-semibold text-sm">{reqTypeLabel[r.type]}</span>
                  <Badge variant="outline" className={`${statusColor} text-[10px] font-semibold`}>{statusLabel}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {r.requestedByName} · {r.requestedAt.split("T")[0]} {r.requestedAt.split("T")[1]?.slice(0, 5)}
                </p>
              </div>
              {isAdmin && r.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => onReview(r.id, "approve")}>
                    <CheckCircle2 className="w-3 h-3" /> Duyệt
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 text-rose-700 border-rose-300" onClick={() => onReview(r.id, "reject")}>
                    <X className="w-3 h-3" /> Từ chối
                  </Button>
                </div>
              )}
            </div>
            <div className="bg-muted/30 rounded-md p-2 text-xs space-y-1">
              <p><span className="text-muted-foreground">Lý do:</span> <span className="font-medium">{reasonLabel[r.reason]}</span></p>
              {r.reasonNote && <p className="text-foreground italic">"{r.reasonNote}"</p>}
              <p className="text-muted-foreground pt-1 border-t border-border/50 mt-1">
                <span className="font-mono">{JSON.stringify(r.payload, null, 0).slice(0, 180)}...</span>
              </p>
            </div>
            {r.reviewNote && (
              <div className="mt-2 text-xs">
                <span className="text-muted-foreground">Phản hồi {r.reviewedByName}:</span>{" "}
                <span className="font-medium">{r.reviewNote}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// History tab (audit log)
// ─────────────────────────────────────────────────────────────
const HistoryTab: React.FC<{ logs: ReturnType<typeof useClassSchedules>["auditLogs"] }> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Chưa có hoạt động nào</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {logs.map(l => {
        const info = auditActionLabel[l.action];
        return (
          <div key={l.id} className="flex items-start gap-3 p-3 border border-border rounded-lg bg-muted/10">
            <Badge variant="outline" className={`${info.color} text-[10px] font-semibold flex-shrink-0`}>{info.label}</Badge>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground">{l.detail}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {l.actorName} · {l.actorRole} · {l.at.split("T")[0]} {l.at.split("T")[1]?.slice(0, 5)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className={`text-lg font-bold ${color}`}>{value}</p>
  </div>
);

// ─────────────────────────────────────────────────────────────
// PROGRESS DIALOG
// ─────────────────────────────────────────────────────────────
const ProgressDialog: React.FC<{
  schedule: ClassSchedule | null;
  onClose: () => void;
  onSave: (patch: Partial<Pick<ClassSchedule, "progressStatus" | "progressPercent" | "progressNote" | "status">>) => void;
}> = ({ schedule, onClose, onSave }) => {
  const [status, setStatus] = useState<NonNullable<ClassSchedule["progressStatus"]>>("completed-full");
  const [percent, setPercent] = useState<number>(100);
  const [note, setNote] = useState("");

  React.useEffect(() => {
    if (schedule) {
      setStatus(schedule.progressStatus ?? "completed-full");
      setPercent(schedule.progressPercent ?? 100);
      setNote(schedule.progressNote ?? "");
    }
  }, [schedule]);

  if (!schedule) return null;

  return (
    <Dialog open={!!schedule} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật tiến độ buổi học</DialogTitle>
          <DialogDescription className="text-xs">
            {schedule.date} · {schedule.startTime}–{schedule.endTime} · {schedule.room}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="text-sm font-medium mb-1 block">Trạng thái</label>
            <Select value={status} onValueChange={(v: typeof status) => setStatus(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Chưa dạy</SelectItem>
                <SelectItem value="completed-full">Xong 100%</SelectItem>
                <SelectItem value="completed-partial">Xong 1 phần</SelectItem>
                <SelectItem value="skipped">Bỏ qua</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {status === "completed-partial" && (
            <div>
              <label className="text-sm font-medium mb-1 block">% nội dung đã dạy ({percent}%)</label>
              <input type="range" min={10} max={95} step={5} value={percent}
                onChange={e => setPercent(parseInt(e.target.value))} className="w-full" />
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-1 block">Ghi chú</label>
            <Textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
              placeholder="Phần nào đã dạy / phần nào còn thiếu..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={() => onSave({
            progressStatus: status,
            progressPercent: status === "completed-full" ? 100 : status === "completed-partial" ? percent : status === "skipped" ? 0 : undefined,
            progressNote: note || undefined,
            status: status === "completed-full" || status === "completed-partial" || status === "skipped" ? "completed" : "upcoming",
          })}>
            <Save className="w-4 h-4 mr-1.5" /> Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─────────────────────────────────────────────────────────────
// REQUEST DIALOG (Split / Insert / Shift / Merge)
// ─────────────────────────────────────────────────────────────
const RequestDialog: React.FC<{
  config: { type: ChangeRequestType; sched?: ClassSchedule } | null;
  syllabus: Syllabus;
  classId: string;
  className: string;
  schedules: ClassSchedule[];
  onClose: () => void;
  onSubmit: (payload: ChangeRequestPayload, reason: ChangeReason, reasonNote?: string) => void;
}> = ({ config, syllabus, classId, schedules, onClose, onSubmit }) => {
  const [reason, setReason] = useState<ChangeReason>("hv_new");
  const [reasonNote, setReasonNote] = useState("");

  // Split fields
  const [partAPercent, setPartAPercent] = useState(60);
  const [partBDate, setPartBDate] = useState("2026-04-25");

  // Insert fields
  const [insertSessionId, setInsertSessionId] = useState(syllabus.sessions[0]?.id ?? "");
  const [insertDate, setInsertDate] = useState("2026-04-25");
  const [insertPurpose, setInsertPurpose] = useState("Ôn tập");

  // Shift fields
  const [newDate, setNewDate] = useState("2026-04-25");
  const [cascade, setCascade] = useState(true);

  // Merge fields
  const [mergeTargetId, setMergeTargetId] = useState("");

  React.useEffect(() => {
    if (config?.sched) {
      setNewDate(config.sched.date);
    }
  }, [config]);

  if (!config) return null;
  const { type, sched } = config;

  const titles: Record<ChangeRequestType, string> = {
    split: "Đề xuất tách buổi (Split)",
    insert: "Đề xuất chèn buổi bù (Insert Makeup)",
    shift: "Đề xuất dời lịch (Shift)",
    merge: "Đề xuất gộp 2 session (Merge)",
  };

  const handleSubmit = () => {
    let payload: ChangeRequestPayload;
    if (type === "split" && sched) {
      payload = {
        type: "split", scheduleId: sched.id, partAPercent,
        partBDate, partBStartTime: sched.startTime, partBEndTime: sched.endTime, partBRoom: sched.room,
      };
    } else if (type === "insert" && sched) {
      payload = {
        type: "insert", classId, afterScheduleId: sched.id,
        syllabusSessionId: insertSessionId, date: insertDate,
        startTime: sched.startTime, endTime: sched.endTime, room: sched.room,
        purpose: insertPurpose,
      };
    } else if (type === "shift" && sched) {
      payload = { type: "shift", scheduleId: sched.id, newDate, cascade };
    } else if (type === "merge" && sched) {
      if (!mergeTargetId) { toast.error("Chọn buổi muốn gộp vào"); return; }
      payload = { type: "merge", classId, primaryScheduleId: sched.id, removeScheduleId: mergeTargetId };
    } else {
      return;
    }
    onSubmit(payload, reason, reasonNote);
  };

  return (
    <Dialog open={!!config} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{titles[type]}</DialogTitle>
          {sched && (
            <DialogDescription className="text-xs">
              Buổi gốc: {sched.date} · {sched.startTime}–{sched.endTime} · {sched.room}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Type-specific fields */}
          {type === "split" && (
            <>
              <div>
                <label className="text-sm font-medium mb-1 block">% đã dạy được trong buổi gốc ({partAPercent}%)</label>
                <input type="range" min={10} max={90} step={5} value={partAPercent}
                  onChange={e => setPartAPercent(parseInt(e.target.value))} className="w-full" />
                <p className="text-xs text-muted-foreground mt-1">Phần còn lại ({100 - partAPercent}%) sẽ chuyển sang buổi mới.</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Ngày buổi mới (Part B)</label>
                <Input type="date" value={partBDate} onChange={e => setPartBDate(e.target.value)} />
              </div>
            </>
          )}

          {type === "insert" && (
            <>
              <div>
                <label className="text-sm font-medium mb-1 block">Session sẽ dạy trong buổi bù</label>
                <Select value={insertSessionId} onValueChange={setInsertSessionId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {syllabus.sessions.map(s => (
                      <SelectItem key={s.id} value={s.id}>Session {s.order}: {s.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Ngày buổi bù</label>
                <Input type="date" value={insertDate} onChange={e => setInsertDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Mục đích</label>
                <Input value={insertPurpose} onChange={e => setInsertPurpose(e.target.value)}
                  placeholder="VD: Ôn tập trước kiểm tra" />
              </div>
            </>
          )}

          {type === "shift" && (
            <>
              <div>
                <label className="text-sm font-medium mb-1 block">Ngày mới</label>
                <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={cascade} onChange={e => setCascade(e.target.checked)} />
                Dời cả các buổi sau (cascade)
              </label>
            </>
          )}

          {type === "merge" && (
            <>
              <div>
                <label className="text-sm font-medium mb-1 block">Gộp buổi nào vào buổi gốc?</label>
                <Select value={mergeTargetId} onValueChange={setMergeTargetId}>
                  <SelectTrigger><SelectValue placeholder="-- Chọn buổi sẽ bị gộp --" /></SelectTrigger>
                  <SelectContent>
                    {schedules.filter(s => s.id !== sched?.id).map(s => {
                      const ss = syllabus.sessions.find(x => x.id === s.syllabusSessionId);
                      return (
                        <SelectItem key={s.id} value={s.id}>
                          {s.date} · {ss ? `S${ss.order}: ${ss.title}` : s.id}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Nội dung session sẽ được gộp vào buổi gốc, buổi bị chọn sẽ bị xoá khỏi lịch.</p>
              </div>
            </>
          )}

          {/* Reason - bắt buộc */}
          <div className="border-t border-border pt-3">
            <label className="text-sm font-medium mb-1 block">Lý do <span className="text-rose-500">*</span></label>
            <Select value={reason} onValueChange={(v: ChangeReason) => setReason(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(reasonLabel) as ChangeReason[]).map(r => (
                  <SelectItem key={r} value={r}>{reasonLabel[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Ghi chú thêm</label>
            <Textarea rows={2} value={reasonNote} onChange={e => setReasonNote(e.target.value)}
              placeholder="Mô tả ngắn cho admin..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-1.5" /> Gửi đề xuất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─────────────────────────────────────────────────────────────
// REVIEW DIALOG (Admin duyệt)
// ─────────────────────────────────────────────────────────────
const ReviewDialog: React.FC<{
  config: { requestId: string; mode: "approve" | "reject" } | null;
  request: ReturnType<typeof useClassSchedules>["requests"][number] | null;
  onClose: () => void;
  onConfirm: (note: string) => void;
}> = ({ config, request, onClose, onConfirm }) => {
  const [note, setNote] = useState("");
  React.useEffect(() => { setNote(""); }, [config?.requestId]);

  if (!config || !request) return null;

  const isApprove = config.mode === "approve";

  return (
    <Dialog open={!!config} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isApprove ? "Duyệt đề xuất" : "Từ chối đề xuất"}</DialogTitle>
          <DialogDescription className="text-xs">
            {request.id} · {request.type.toUpperCase()} · GV {request.requestedByName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="bg-muted/30 rounded-md p-3 text-xs space-y-1">
            <p><span className="text-muted-foreground">Lý do:</span> <span className="font-medium">{reasonLabel[request.reason]}</span></p>
            {request.reasonNote && <p className="italic">"{request.reasonNote}"</p>}
          </div>
          {isApprove && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs">
              <p className="font-semibold text-amber-900">Tác động khi duyệt:</p>
              <p className="text-amber-800 mt-1">
                {request.type === "split" && "Buổi gốc sẽ chuyển sang trạng thái 'Xong 1 phần', tạo thêm 1 buổi mới."}
                {request.type === "insert" && "Sẽ thêm 1 buổi bù vào lịch lớp."}
                {request.type === "shift" && "Buổi sẽ được dời sang ngày mới."}
                {request.type === "merge" && "2 session sẽ được gộp vào 1 buổi, buổi còn lại sẽ bị xoá."}
              </p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-1 block">Ghi chú phản hồi {!isApprove && <span className="text-rose-500">*</span>}</label>
            <Textarea rows={3} value={note} onChange={e => setNote(e.target.value)}
              placeholder={isApprove ? "VD: OK cho phép" : "Nêu rõ lý do từ chối..."} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button
            className={isApprove ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}
            onClick={() => onConfirm(note)}
            disabled={!isApprove && !note.trim()}
          >
            {isApprove ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <X className="w-4 h-4 mr-1.5" />}
            {isApprove ? "Duyệt" : "Từ chối"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─────────────────────────────────────────────────────────────
// ADMIN EDIT DIALOG (sửa/thêm trực tiếp)
// ─────────────────────────────────────────────────────────────
const AdminEditDialog: React.FC<{
  schedule: ClassSchedule | null;
  syllabus: Syllabus;
  allSchedules: ClassSchedule[];
  onClose: () => void;
  onSave: (patch: ClassSchedule, isNew: boolean) => void;
}> = ({ schedule, syllabus, allSchedules, onClose, onSave }) => {
  const [form, setForm] = useState<ClassSchedule | null>(null);
  React.useEffect(() => { setForm(schedule); }, [schedule]);

  if (!form) return null;
  const isNew = !form.id;
  const kind = form.kind ?? "regular";

  // Buổi cùng lớp (loại trừ chính nó) — để chọn parent / merge
  const sameClassSchedules = allSchedules
    .filter(s => s.classId === form.classId && s.syllabusId === form.syllabusId && s.id !== form.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Helper: label cho 1 schedule khi pick
  const labelOf = (s: ClassSchedule) => {
    const sess = syllabus.sessions.find(x => x.id === s.syllabusSessionId);
    const k = s.kind && s.kind !== "regular" ? ` [${s.kind}]` : "";
    return `B${sess?.order ?? "?"} · ${s.date}${k} — ${sess?.title ?? ""}`;
  };

  // Khi đổi kind → reset các field liên quan
  const onKindChange = (v: NonNullable<ClassSchedule["kind"]>) => {
    setForm({
      ...form,
      kind: v,
      parentScheduleId: v === "regular" ? undefined : form.parentScheduleId,
      mergedSessionIds: v === "merged" ? (form.mergedSessionIds ?? []) : undefined,
    });
  };

  const toggleMergeSession = (sid: string) => {
    const cur = form.mergedSessionIds ?? [];
    const next = cur.includes(sid) ? cur.filter(x => x !== sid) : [...cur, sid];
    setForm({ ...form, mergedSessionIds: next });
  };

  // Nếu chọn parent → auto fill syllabusSessionId từ parent (cho split/makeup)
  const onParentChange = (parentId: string) => {
    const parent = allSchedules.find(s => s.id === parentId);
    setForm({
      ...form,
      parentScheduleId: parentId,
      syllabusSessionId: parent ? parent.syllabusSessionId : form.syllabusSessionId,
    });
  };

  return (
    <Dialog open={!!schedule} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Thêm buổi mới" : "Sửa buổi (Admin trực tiếp)"}</DialogTitle>
          <DialogDescription className="text-xs">Thay đổi sẽ được ghi vào audit log.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Loại buổi — đưa lên đầu để các field bên dưới đổi theo */}
          <div>
            <label className="text-sm font-medium mb-1 block">Loại buổi</label>
            <Select value={kind} onValueChange={(v: NonNullable<ClassSchedule["kind"]>) => onKindChange(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="makeup">Bù</SelectItem>
                <SelectItem value="split-a">Tách (phần A)</SelectItem>
                <SelectItem value="split-b">Tách (phần B)</SelectItem>
                <SelectItem value="merged">Gộp</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground mt-1">
              {kind === "regular" && "Buổi chính theo giáo trình — đổi loại để chuyển thành Bù/Tách/Gộp."}
              {kind === "makeup" && "Buổi bù cho buổi đã nghỉ — chọn buổi gốc bên dưới."}
              {(kind === "split-a" || kind === "split-b") && "Tách 1 buổi gốc thành 2 phần — chọn buổi gốc bên dưới."}
              {kind === "merged" && "Gộp nhiều buổi vào 1 — chọn các buổi cần gộp bên dưới."}
            </p>
          </div>

          {/* Parent info — fix theo schedule đang sửa, không cho chọn lại */}
          {(kind === "makeup" || kind === "split-a" || kind === "split-b") && (() => {
            // Parent = schedule có parentScheduleId trỏ tới (nếu có), hoặc chính schedule đang sửa làm anchor
            const parentSched = form.parentScheduleId
              ? allSchedules.find(s => s.id === form.parentScheduleId)
              : allSchedules.find(s => s.id === form.id) ?? null;
            const parentSess = parentSched
              ? syllabus.sessions.find(x => x.id === parentSched.syllabusSessionId)
              : syllabus.sessions.find(x => x.id === form.syllabusSessionId);
            // Auto set parentScheduleId nếu đang trống & có anchor
            if (!form.parentScheduleId && parentSched && parentSched.id && parentSched.id !== form.id) {
              // do nothing — anchor là chính nó, không gán
            }
            return (
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
                <p className="text-xs font-semibold text-amber-900 mb-1">
                  {kind === "makeup" ? "Bù cho buổi:" : "Tách từ buổi:"}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                    B{parentSess?.order ?? "?"}
                  </span>
                  <span className="font-medium text-foreground">{parentSess?.title ?? "—"}</span>
                  {parentSched?.date && (
                    <span className="text-[11px] text-muted-foreground">· {parentSched.date}</span>
                  )}
                </div>
                <p className="text-[10px] text-amber-700/80 mt-1 italic">
                  Đã gán cố định theo buổi đang sửa — không cần chọn lại.
                </p>
              </div>
            );
          })()}

          {/* Merge picker — chọn nhiều syllabusSessionId */}
          {kind === "merged" && (
            <div className="p-3 rounded-lg border border-violet-200 bg-violet-50/50 space-y-2">
              <label className="text-sm font-medium block text-violet-900">Các buổi cần gộp *</label>
              <p className="text-[11px] text-violet-800">Tick các buổi sẽ dạy gộp trong 1 session này (chọn ít nhất 2).</p>
              <div className="max-h-56 overflow-y-auto grid grid-cols-2 gap-1 pr-1">
                {syllabus.sessions.map(s => {
                  const checked = (form.mergedSessionIds ?? []).includes(s.id);
                  return (
                    <label key={s.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white cursor-pointer text-sm border border-transparent hover:border-violet-200">
                      <input type="checkbox" checked={checked} onChange={() => toggleMergeSession(s.id)} />
                      <span className="text-xs font-bold text-muted-foreground w-8">B{s.order}</span>
                      <span className="flex-1 truncate">{s.title}</span>
                    </label>
                  );
                })}
              </div>
              {(form.mergedSessionIds?.length ?? 0) > 0 && (
                <p className="text-[11px] text-violet-800">Đã chọn {form.mergedSessionIds!.length} buổi.</p>
              )}
            </div>
          )}

          {/* Grid 2 cột cho các field còn lại */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Buổi syllabus — fix cứng theo buổi đang sửa */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Buổi giáo trình</label>
              {(() => {
                const sess = syllabus.sessions.find(s => s.id === form.syllabusSessionId);
                return (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-muted/30 text-sm">
                    <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded">
                      B{sess?.order ?? "?"}
                    </span>
                    <span className="font-medium text-foreground">{sess?.title ?? "—"}</span>
                  </div>
                );
              })()}
              <p className="text-[10px] italic text-muted-foreground mt-1">
                Đã gán cố định theo buổi đang sửa — không cần chọn lại.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Ngày {kind === "makeup" && "(ngày dạy bù)"}
                {(kind === "split-a" || kind === "split-b") && "(ngày của phần này)"}
              </label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Phòng</label>
              <Input value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Bắt đầu</label>
              <Input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Kết thúc</label>
              <Input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={() => {
            // Validate
            if (kind === "merged" && (form.mergedSessionIds?.length ?? 0) < 2) {
              toast.error("Chọn ít nhất 2 buổi để gộp");
              return;
            }
            onSave(form, isNew);
          }}>
            <Save className="w-4 h-4 mr-1.5" /> {isNew ? "Thêm" : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClassScheduleManager;
