import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Video, Zap, FileText,
  Upload, Link2, ExternalLink, Award, MessageSquare, Eye, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  syllabuses, classSchedules, homeworkSubmissions as initialSubmissions,
  dailyReports,
  type HomeworkSubmission, type HomeworkType, type HomeworkStatus
} from "@/data/mockData";
import SyllabusSidebarLayout, { type NavItem } from "@/components/syllabus/shared/SyllabusSidebarLayout";
import { GameTabContent, QuizTabContent } from "@/components/syllabus/shared/GameQuizContent";

const TODAY = "2026-04-22";
const MY_STUDENT_ID = "STU011"; // Minh Anh Mina (parent's child)

const hwTypeLabel: Record<HomeworkType, string> = {
  video_speaking: "Video Speaking", quizizz: "Quizizz", writing: "Writing"
};
const hwTypeColor: Record<HomeworkType, string> = {
  video_speaking: "bg-purple-100 text-purple-700",
  quizizz: "bg-orange-100 text-orange-700",
  writing: "bg-blue-100 text-blue-700",
};
const hwTypeIcon: Record<HomeworkType, React.ElementType> = {
  video_speaking: Video, quizizz: Zap, writing: FileText
};
const statusConfig: Record<HomeworkStatus, { label: string; color: string; dot: string }> = {
  pending: { label: "Chờ nộp", color: "bg-gray-100 text-gray-600", dot: "bg-red-400" },
  submitted: { label: "Đã nộp", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" },
  graded: { label: "Đã chấm", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
};

// Build all homeworks for this student
function buildStudentHomeworks(submissions: HomeworkSubmission[]) {
  const result: Array<{
    scheduleId: string; date: string; sessionTitle: string; sessionOrder: number;
    hw: { id: string; type: HomeworkType; title: string; description: string; externalLink?: string };
    submission?: HomeworkSubmission;
  }> = [];

  for (const sched of classSchedules) {
    const syllabus = syllabuses.find(s => s.id === sched.syllabusId);
    const session = syllabus?.sessions.find(s => s.id === sched.syllabusSessionId);
    if (!session) continue;
    for (const hw of session.homeworks) {
      const sub = submissions.find(s => s.homeworkId === hw.id && s.studentId === MY_STUDENT_ID);
      result.push({ scheduleId: sched.id, date: sched.date, sessionTitle: session.title, sessionOrder: session.order, hw, submission: sub });
    }
  }
  return result.sort((a, b) => b.date.localeCompare(a.date));
}

const ParentSyllabusView: React.FC = () => {
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>(initialSubmissions);
  const [activeTab, setActiveTab] = useState<"homework" | "reports">("homework");
  const [activeNavItem, setActiveNavItem] = useState<NavItem>("syllabus");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Derive parent's syllabus
  const parentSyllabus = useMemo(() => {
    const myClass = classSchedules.find(cs => cs.classId);
    return syllabuses.find(s => s.id === myClass?.syllabusId) ?? syllabuses[0];
  }, []);

  // Submit dialog
  const [submitDialog, setSubmitDialog] = useState<null | { scheduleId: string; sessionTitle: string; hw: { id: string; type: HomeworkType; title: string; description: string; externalLink?: string } }>(null);
  const [submitUrl, setSubmitUrl] = useState("");
  const [submitText, setSubmitText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Class info
  const mySchedules = classSchedules;
  void mySchedules;

  const allHWs = buildStudentHomeworks(submissions);
  const pendingHWs = allHWs.filter(h => !h.submission);
  const submittedHWs = allHWs.filter(h => h.submission && h.submission.status !== "graded");
  const gradedHWs = allHWs.filter(h => h.submission?.status === "graded");

  const openSubmit = (item: typeof allHWs[0]) => {
    if (item.hw.type === "quizizz" && item.hw.externalLink) {
      window.open(item.hw.externalLink, "_blank");
      toast.info("Sau khi hoàn thành Quizizz, quay lại và dán link kết quả để nộp!");
    }
    setSubmitUrl("");
    setSubmitText("");
    setSubmitDialog({ scheduleId: item.scheduleId, sessionTitle: item.sessionTitle, hw: item.hw });
  };

  const handleSubmit = async () => {
    if (!submitDialog) return;
    if (!submitUrl.trim() && !submitText.trim()) { toast.error("Vui lòng nhập link hoặc nội dung bài nộp"); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));

    const newSub: HomeworkSubmission = {
      id: `HWS_${Date.now()}`,
      homeworkId: submitDialog.hw.id,
      homeworkTitle: submitDialog.hw.title,
      homeworkType: submitDialog.hw.type,
      classScheduleId: submitDialog.scheduleId,
      sessionTitle: submitDialog.sessionTitle,
      studentId: MY_STUDENT_ID,
      studentName: "Minh Anh Mina",
      studentAvatar: "MA",
      submitUrl: submitUrl.trim() || undefined,
      submitText: submitText.trim() || undefined,
      submittedAt: new Date().toISOString(),
      status: "submitted",
    };

    setSubmissions(prev => [...prev, newSub]);
    setSubmitting(false);
    setSubmitDialog(null);
    toast.success("🎉 Đã nộp bài thành công! Giáo viên sẽ chấm điểm sớm nhé.");
  };

  return (
    <SyllabusSidebarLayout
      syllabus={parentSyllabus}
      classSchedules={classSchedules}
      selectedSessionId={selectedSessionId}
      onSessionSelect={setSelectedSessionId}
      activeNavItem={activeNavItem}
      onNavItemChange={setActiveNavItem}
      teacherName="Ms. Thu Trang"
      breadcrumb={`Phụ huynh / Khoá học của con / ${parentSyllabus.id}`}
    >
      {activeNavItem === "game" ? (
        <GameTabContent />
      ) : activeNavItem === "quiz" ? (
        <QuizTabContent />
      ) : (
        <>
      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1 mb-6">
        {[
          { id: "homework", label: `Bài tập${pendingHWs.length > 0 ? ` (${pendingHWs.length} chờ)` : ""}`, icon: FileText },
          { id: "reports", label: "Báo cáo lớp", icon: MessageSquare },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="w-4 h-4" />{t.label}
            {t.id === "homework" && pendingHWs.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">{pendingHWs.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* HOMEWORK TAB */}
      {activeTab === "homework" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Pending */}
          {pendingHWs.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Chờ nộp ({pendingHWs.length})
              </h3>
              <div className="space-y-2">
                {pendingHWs.map((item, i) => {
                  const Icon = hwTypeIcon[item.hw.type];
                  return (
                    <motion.div key={`${item.scheduleId}-${item.hw.id}`} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-card border border-red-200 rounded-xl p-4 flex items-start gap-3">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 ${hwTypeColor[item.hw.type]}`}>
                        <Icon className="w-3.5 h-3.5" />{hwTypeLabel[item.hw.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground">{item.hw.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.sessionTitle}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.hw.description}</p>
                      </div>
                      <Button size="sm" className="flex-shrink-0 gap-1.5" onClick={() => openSubmit(item)}>
                        {item.hw.type === "quizizz" ? <><ExternalLink className="w-3.5 h-3.5" />Làm Quizizz</> : <><Upload className="w-3.5 h-3.5" />Nộp bài</>}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submitted (waiting grade) */}
          {submittedHWs.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />Đã nộp - Chờ chấm ({submittedHWs.length})
              </h3>
              <div className="space-y-2">
                {submittedHWs.map((item, i) => {
                  const sub = item.submission!;
                  const Icon = hwTypeIcon[item.hw.type];
                  return (
                    <motion.div key={sub.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-card border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 ${hwTypeColor[item.hw.type]}`}>
                        <Icon className="w-3.5 h-3.5" />{hwTypeLabel[item.hw.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground">{item.hw.title}</p>
                        <p className="text-xs text-muted-foreground">{item.sessionTitle}</p>
                        {sub.submitUrl && <a href={sub.submitUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mt-1"><Eye className="w-3 h-3" />Xem bài đã nộp</a>}
                        {sub.submitText && <p className="text-xs bg-muted/50 p-1.5 rounded mt-1 text-foreground">{sub.submitText}</p>}
                        <p className="text-xs text-muted-foreground mt-1">Nộp lúc: {new Date(sub.submittedAt).toLocaleString("vi-VN")}</p>
                      </div>
                      <Badge className={statusConfig[sub.status].color}>{statusConfig[sub.status].label}</Badge>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Graded */}
          {gradedHWs.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Đã chấm điểm ({gradedHWs.length})
              </h3>
              <div className="space-y-2">
                {gradedHWs.map((item, i) => {
                  const sub = item.submission!;
                  const Icon = hwTypeIcon[item.hw.type];
                  return (
                    <motion.div key={sub.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-card border border-green-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 ${hwTypeColor[item.hw.type]}`}>
                          <Icon className="w-3.5 h-3.5" />{hwTypeLabel[item.hw.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground">{item.hw.title}</p>
                          <p className="text-xs text-muted-foreground">{item.sessionTitle}</p>
                          {sub.submitUrl && <a href={sub.submitUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mt-1"><Eye className="w-3 h-3" />Xem bài đã nộp</a>}
                        </div>
                        <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full flex-shrink-0">
                          <Award className="w-4 h-4" />
                          <span className="font-bold text-lg leading-none">{sub.score}</span>
                          <span className="text-xs">/10</span>
                        </div>
                      </div>
                      {sub.feedback && (
                        <div className="mt-3 flex items-start gap-2 bg-muted/30 rounded-lg p-3">
                          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-0.5">Nhận xét của {sub.gradedByName}</p>
                            <p className="text-sm text-foreground italic">"{sub.feedback}"</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {allHWs.length === 0 && (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Chưa có bài tập nào</p>
            </div>
          )}
        </motion.div>
      )}

      {/* REPORTS TAB */}
      {activeTab === "reports" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {dailyReports.filter(r => !r.isDraft).length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Chưa có báo cáo buổi học nào</p>
            </div>
          ) : (
            dailyReports.filter(r => !r.isDraft).map((report, i) => {
              const myAttendance = report.attendance.find(a => a.studentId === MY_STUDENT_ID);
              return (
                <motion.div key={report.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{report.sessionTitle}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(report.date).toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-full">
                      {[...Array(report.classEnergy)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                      {[...Array(5 - report.classEnergy)].map((_, i) => <Star key={i} className="w-3 h-3 text-muted-foreground/30" />)}
                    </div>
                  </div>

                  {myAttendance && (
                    <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-3 ${
                      myAttendance.status === "present" ? "bg-green-100 text-green-700" :
                      myAttendance.status === "late" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-600"}`}>
                      {myAttendance.status === "present" ? "✓ Có mặt" : myAttendance.status === "late" ? "⏰ Đi trễ" : "✗ Vắng mặt"}
                      {myAttendance.note && ` — ${myAttendance.note}`}
                    </div>
                  )}

                  {report.generalNotes && (
                    <div className="bg-muted/30 rounded-lg p-3 mb-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">📝 Nhận xét chung</p>
                      <p className="text-sm text-foreground">{report.generalNotes}</p>
                    </div>
                  )}
                  {report.issues && (
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-red-600 mb-1">⚠️ Lưu ý</p>
                      <p className="text-sm text-red-700">{report.issues}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">Báo cáo bởi: {report.taName}</p>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}

      {/* Submit Dialog */}
      <Dialog open={!!submitDialog} onOpenChange={() => setSubmitDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nộp bài: {submitDialog?.hw.title}</DialogTitle>
          </DialogHeader>
          {submitDialog && (
            <div className="space-y-4 py-2">
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs font-medium text-muted-foreground">{submitDialog.sessionTitle}</p>
                <p className="text-sm text-foreground mt-0.5">{submitDialog.hw.description}</p>
              </div>

              {submitDialog.hw.type === "video_speaking" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5" /> Link YouTube / Google Drive
                    </label>
                    <Input placeholder="https://youtube.com/... hoặc https://drive.google.com/..." value={submitUrl} onChange={e => setSubmitUrl(e.target.value)} />
                    <p className="text-xs text-muted-foreground mt-1">Quay video rồi upload lên YouTube (unlisted) hoặc Google Drive và dán link vào đây</p>
                  </div>
                  <div className="text-center text-xs text-muted-foreground">— hoặc —</div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" /> Ghi chú thêm (tuỳ chọn)
                    </label>
                    <Textarea rows={2} placeholder="Ghi chú thêm cho giáo viên..." value={submitText} onChange={e => setSubmitText(e.target.value)} />
                  </div>
                </>
              )}

              {submitDialog.hw.type === "writing" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Link tài liệu (Drive/Docs)</label>
                    <Input placeholder="https://drive.google.com/..." value={submitUrl} onChange={e => setSubmitUrl(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Hoặc nhập trực tiếp</label>
                    <Textarea rows={4} placeholder="Nhập nội dung bài viết ở đây..." value={submitText} onChange={e => setSubmitText(e.target.value)} />
                  </div>
                </>
              )}

              {submitDialog.hw.type === "quizizz" && (
                <>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
                    <p className="font-semibold mb-1">✅ Đã hoàn thành Quizizz?</p>
                    <p className="text-xs">Dán link kết quả hoặc mô tả kết quả của bạn vào đây để gửi cho giáo viên.</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Link kết quả Quizizz</label>
                    <Input placeholder="https://quizizz.com/results/..." value={submitUrl} onChange={e => setSubmitUrl(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Hoặc nhập điểm số</label>
                    <Textarea rows={2} placeholder="VD: Score: 18/20, thời gian: 5 phút 30 giây" value={submitText} onChange={e => setSubmitText(e.target.value)} />
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialog(null)}>Hủy</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="gap-1.5">
              {submitting ? "Đang nộp..." : <><Upload className="w-4 h-4" />Nộp bài</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      )}
    </SyllabusSidebarLayout>
  );
};

export default ParentSyllabusView;
