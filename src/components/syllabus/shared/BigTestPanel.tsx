import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Video, Upload, Send, CheckCircle2, XCircle, AlertTriangle, Clock, FileCheck2 } from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/contexts/RoleContext";
import { useSyllabusFeatures, type BigTestReport } from "@/contexts/SyllabusFeaturesContext";

interface Props {
  syllabusSessionId: string;
  classId: string;
  className: string;
  stageId: string;
  stageName: string;
  students: { id: string; name: string; avatar: string }[];
}

const NOW = new Date("2026-04-22T14:00:00");

const hoursSince = (iso?: string) => {
  if (!iso) return 0;
  return (NOW.getTime() - new Date(iso).getTime()) / 3600000;
};
const daysUntil = (iso?: string) => {
  if (!iso) return 999;
  return (new Date(iso).getTime() - NOW.getTime()) / 86400000;
};

const DEFAULT_SKILLS = ["Speaking", "Listening", "Reading", "Writing"];

const statusBadge: Record<BigTestReport["status"], { label: string; cls: string }> = {
  draft: { label: "Bản nháp", cls: "bg-gray-100 text-gray-700" },
  pending: { label: "Chờ duyệt", cls: "bg-amber-100 text-amber-700" },
  approved: { label: "Đã duyệt", cls: "bg-blue-100 text-blue-700" },
  sent: { label: "Đã gửi PH", cls: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Bị trả lại", cls: "bg-rose-100 text-rose-700" },
};

const BigTestPanel: React.FC<Props> = ({ syllabusSessionId, classId, className, stageId, stageName, students }) => {
  const { isTeacher, isAdmin, isTA, isParent } = useRole();
  const { bigTests, upsertBigTest, submitBigTest, approveBigTest, rejectBigTest, sendBigTest } = useSyllabusFeatures();

  const sessionReports = useMemo(
    () => bigTests.filter(b => b.syllabusSessionId === syllabusSessionId && b.classId === classId),
    [bigTests, syllabusSessionId, classId]
  );

  const [editing, setEditing] = useState<BigTestReport | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const openNewFor = (stu: { id: string; name: string; avatar: string }) => {
    const now = new Date("2026-04-22").toISOString().slice(0, 10);
    const deadline = new Date("2026-04-29").toISOString().slice(0, 10);
    setEditing({
      id: `BT_${Date.now()}`, classId, className,
      stageId, stageName,
      syllabusSessionId,
      studentId: stu.id, studentName: stu.name, studentAvatar: stu.avatar,
      testDate: now,
      comments: "",
      scores: DEFAULT_SKILLS.map(s => ({ skill: s, score: 7 })),
      status: "draft",
      teacherId: "USR001", teacherName: "Ms. Thu Trang",
      teacherDeadline: deadline,
    });
  };

  const saveDraft = () => {
    if (!editing) return;
    upsertBigTest({ ...editing, status: "draft" });
    toast.success("Đã lưu nháp");
    setEditing(null);
  };

  const submitForReview = () => {
    if (!editing) return;
    if (!editing.videoUrl && !editing.videoFileName) {
      toast.error("Vui lòng upload video bài test");
      return;
    }
    if (!editing.comments.trim()) {
      toast.error("Vui lòng nhập nhận xét");
      return;
    }
    upsertBigTest({ ...editing, status: "pending", submittedAt: new Date().toISOString() });
    toast.success(`Đã gửi báo cáo Big Test cho ${editing.studentName} chờ học vụ duyệt`);
    setEditing(null);
  };

  const handleApprove = (id: string) => {
    approveBigTest(id, "Ms. Linh Chi", "OK, có thể gửi PH");
    toast.success("Đã duyệt. Học vụ có 24h để gửi PH.");
  };

  const handleSend = (id: string) => {
    sendBigTest(id, isAdmin ? "Admin" : "Ms. Linh Chi");
    toast.success("Đã gửi báo cáo tới phụ huynh");
  };

  const confirmReject = () => {
    if (!rejectingId || !rejectNote.trim()) {
      toast.error("Vui lòng nhập lý do trả lại");
      return;
    }
    rejectBigTest(rejectingId, "Ms. Linh Chi", rejectNote);
    toast.success("Đã trả lại để GV chỉnh sửa");
    setRejectingId(null);
    setRejectNote("");
  };

  const pendingCount = sessionReports.filter(b => b.status === "pending").length;
  const approvedNotSent = sessionReports.filter(b => b.status === "approved").length;
  const studentsWithoutReport = students.filter(s => !sessionReports.some(r => r.studentId === s.id));

  // Parent view — chỉ xem báo cáo của con mình sau khi được gửi
  if (isParent) {
    const sent = sessionReports.filter(b => b.status === "sent");
    return (
      <Card className="border-amber-200">
        <CardHeader className="bg-gradient-to-br from-amber-50 to-orange-50">
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Trophy className="w-5 h-5" /> Báo cáo Big Test — {stageName}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {sent.length === 0 && <p className="text-sm text-muted-foreground italic">Chưa có báo cáo nào được gửi.</p>}
          {sent.map(r => (
            <div key={r.id} className="p-4 border border-amber-100 rounded-lg bg-amber-50/30">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="w-9 h-9"><AvatarFallback>{r.studentAvatar}</AvatarFallback></Avatar>
                <div>
                  <p className="font-semibold text-sm">{r.studentName}</p>
                  <p className="text-xs text-muted-foreground">Ngày test: {r.testDate}</p>
                </div>
              </div>
              {r.videoUrl && (
                <a href={r.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mb-2">
                  <Video className="w-3 h-3" /> Xem video bài làm
                </a>
              )}
              <div className="grid grid-cols-4 gap-2 my-2">
                {r.scores.map(s => (
                  <div key={s.skill} className="text-center p-2 bg-white rounded border">
                    <p className="text-[10px] text-muted-foreground uppercase">{s.skill}</p>
                    <p className="text-lg font-bold text-amber-700">{s.score}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs leading-relaxed bg-white p-2 rounded border">{r.comments}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-300 shadow-sm">
      <CardHeader className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Trophy className="w-5 h-5 text-amber-600" /> Big Test — {stageName}
          </CardTitle>
          <div className="flex items-center gap-2 text-xs">
            <Badge className="bg-amber-100 text-amber-700 border-amber-300">{sessionReports.length}/{students.length} báo cáo</Badge>
            {pendingCount > 0 && <Badge className="bg-amber-200 text-amber-800">{pendingCount} chờ duyệt</Badge>}
            {approvedNotSent > 0 && <Badge className="bg-blue-100 text-blue-700">{approvedNotSent} sẵn sàng gửi</Badge>}
          </div>
        </div>
        <p className="text-xs text-amber-700/80 mt-1">
          Quy trình: GV upload video + nhận xét + chấm điểm 4 kỹ năng → Học vụ duyệt → Gửi phụ huynh. GV có 7 ngày, học vụ có 24h sau duyệt.
        </p>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        {/* GV: học sinh chưa có báo cáo → nút tạo */}
        {isTeacher && studentsWithoutReport.length > 0 && (
          <div className="p-3 border border-dashed border-amber-300 rounded-lg bg-amber-50/40">
            <p className="text-xs font-medium text-amber-800 mb-2">Học sinh chưa có báo cáo ({studentsWithoutReport.length}):</p>
            <div className="flex flex-wrap gap-1.5">
              {studentsWithoutReport.map(s => (
                <Button key={s.id} size="sm" variant="outline" className="h-7 text-xs border-amber-300 hover:bg-amber-100" onClick={() => openNewFor(s)}>
                  <Upload className="w-3 h-3 mr-1" />{s.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Danh sách báo cáo */}
        {sessionReports.length === 0 && !isTeacher && (
          <p className="text-sm text-muted-foreground italic">GV chưa tạo báo cáo Big Test nào.</p>
        )}

        {sessionReports.map(r => {
          const isOverdueGV = r.status === "draft" && daysUntil(r.teacherDeadline) < 0;
          const isOverdueStaff = r.status === "approved" && hoursSince(r.reviewedAt) > 24;
          return (
            <div key={r.id} className={`p-4 border rounded-lg ${(isOverdueGV || isOverdueStaff) ? "border-rose-300 bg-rose-50/40" : "border-border bg-card"}`}>
              <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="w-9 h-9"><AvatarFallback>{r.studentAvatar}</AvatarFallback></Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{r.studentName}</p>
                    <p className="text-[11px] text-muted-foreground">Test {r.testDate} · GV {r.teacherName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge className={`text-[10px] ${statusBadge[r.status].cls}`}>{statusBadge[r.status].label}</Badge>
                  {isOverdueGV && (
                    <Badge className="text-[10px] bg-rose-100 text-rose-700 border-rose-300"><AlertTriangle className="w-3 h-3 mr-1" />GV QUÁ HẠN</Badge>
                  )}
                  {isOverdueStaff && (
                    <Badge className="text-[10px] bg-rose-100 text-rose-700 border-rose-300"><AlertTriangle className="w-3 h-3 mr-1" />Học vụ quá 24h chưa gửi</Badge>
                  )}
                </div>
              </div>

              {r.videoUrl && (
                <a href={r.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mb-2">
                  <Video className="w-3 h-3" /> Video: {r.videoFileName ?? r.videoUrl}
                </a>
              )}
              {r.comments && <p className="text-xs leading-relaxed bg-muted/30 p-2 rounded mb-2">{r.comments}</p>}
              <div className="grid grid-cols-4 gap-2">
                {r.scores.map(s => (
                  <div key={s.skill} className="text-center p-1.5 bg-amber-50/50 rounded border border-amber-100">
                    <p className="text-[9px] text-muted-foreground uppercase">{s.skill}</p>
                    <p className="text-base font-bold text-amber-700">{s.score}</p>
                  </div>
                ))}
              </div>

              {r.reviewNote && (
                <p className="mt-2 text-xs p-2 rounded bg-rose-50 border border-rose-200 text-rose-700">
                  <strong>Ghi chú học vụ:</strong> {r.reviewNote}
                </p>
              )}

              {/* Actions */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {isTeacher && (r.status === "draft" || r.status === "rejected") && (
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditing(r)}>
                    <Upload className="w-3 h-3 mr-1" />Sửa / nộp
                  </Button>
                )}
                {(isTA || isAdmin) && r.status === "pending" && (
                  <>
                    <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApprove(r.id)}>
                      <CheckCircle2 className="w-3 h-3 mr-1" />Duyệt
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs border-rose-300 text-rose-700" onClick={() => setRejectingId(r.id)}>
                      <XCircle className="w-3 h-3 mr-1" />Trả lại
                    </Button>
                  </>
                )}
                {(isTA || isAdmin) && r.status === "approved" && (
                  <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700" onClick={() => handleSend(r.id)}>
                    <Send className="w-3 h-3 mr-1" />Gửi phụ huynh
                  </Button>
                )}
                {r.status === "sent" && r.sentAt && (
                  <span className="text-[11px] text-emerald-700 flex items-center gap-1">
                    <FileCheck2 className="w-3 h-3" /> Đã gửi {new Date(r.sentAt).toLocaleString("vi-VN")}
                  </span>
                )}
                {r.status === "pending" && r.submittedAt && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Nộp {new Date(r.submittedAt).toLocaleString("vi-VN")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>

      {/* Edit dialog */}
      {editing && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" /> Báo cáo Big Test — {editing.studentName}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Ngày test</label>
                  <Input type="date" value={editing.testDate} onChange={e => setEditing({ ...editing, testDate: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium">Hạn GV nộp</label>
                  <Input type="date" value={editing.teacherDeadline} onChange={e => setEditing({ ...editing, teacherDeadline: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">Video bài làm (URL Google Drive)</label>
                <Input placeholder="https://drive.google.com/..." value={editing.videoUrl ?? ""} onChange={e => setEditing({ ...editing, videoUrl: e.target.value, videoFileName: e.target.value ? "Video Big Test" : undefined })} />
              </div>
              <div>
                <label className="text-xs font-medium">Nhận xét chi tiết</label>
                <Textarea rows={4} placeholder="Đánh giá điểm mạnh, điểm yếu, gợi ý luyện tập..." value={editing.comments} onChange={e => setEditing({ ...editing, comments: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium">Điểm 4 kỹ năng (0-10)</label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {editing.scores.map((s, idx) => (
                    <div key={s.skill}>
                      <p className="text-[10px] text-muted-foreground uppercase">{s.skill}</p>
                      <Input type="number" min={0} max={10} step={0.5} value={s.score} onChange={e => {
                        const v = Number(e.target.value);
                        const next = [...editing.scores]; next[idx] = { ...s, score: isNaN(v) ? 0 : v };
                        setEditing({ ...editing, scores: next });
                      }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={saveDraft}>Lưu nháp</Button>
              <Button onClick={submitForReview} className="bg-amber-600 hover:bg-amber-700">
                <Send className="w-3 h-3 mr-1" />Nộp chờ học vụ duyệt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject dialog */}
      {rejectingId && (
        <Dialog open onOpenChange={() => setRejectingId(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Trả lại báo cáo để GV chỉnh sửa</DialogTitle></DialogHeader>
            <Textarea rows={4} placeholder="Lý do trả lại (bắt buộc)..." value={rejectNote} onChange={e => setRejectNote(e.target.value)} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectingId(null)}>Huỷ</Button>
              <Button className="bg-rose-600 hover:bg-rose-700" onClick={confirmReject}>Xác nhận trả lại</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default BigTestPanel;
