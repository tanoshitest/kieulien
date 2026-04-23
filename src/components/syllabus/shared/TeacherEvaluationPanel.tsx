import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClipboardCheck, Star, Eye, EyeOff, Send, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/contexts/RoleContext";
import { useSyllabusFeatures, type TeacherEvaluation } from "@/contexts/SyllabusFeaturesContext";

interface Props {
  teacherId: string;
  teacherName: string;
  classScheduleId?: string;
  className?: string;
}

const TeacherEvaluationPanel: React.FC<Props> = ({ teacherId, teacherName, classScheduleId, className }) => {
  const { isTeacher, isAdmin, isTA, isParent } = useRole();
  const { evaluations, evaluationCriteria, upsertEvaluation, publishEvaluation } = useSyllabusFeatures();

  if (isParent) return null;

  const list = useMemo(
    () => evaluations.filter(e => e.teacherId === teacherId).sort((a, b) => b.date.localeCompare(a.date)),
    [evaluations, teacherId]
  );

  // GV chỉ thấy bản đã published
  const visible = isTeacher ? list.filter(e => e.visibleToTeacher) : list;

  const [editing, setEditing] = useState<TeacherEvaluation | null>(null);

  const canCreate = isTA || isAdmin;

  const startNew = () => {
    setEditing({
      id: `EVAL_${Date.now()}`,
      teacherId, teacherName,
      classScheduleId, className,
      date: "2026-04-22",
      criteria: evaluationCriteria.map(c => ({ criterionId: c.id, score: 8 })),
      overallNote: "",
      reviewerId: "USR_OPS", reviewerName: "Ms. Linh Chi",
      visibleToTeacher: false,
      createdAt: new Date().toISOString(),
    });
  };

  const totalScore = (e: TeacherEvaluation) => {
    const sum = e.criteria.reduce((s, c) => s + c.score, 0);
    const max = evaluationCriteria.reduce((s, c) => s + c.maxScore, 0);
    return { sum, max, pct: Math.round((sum / max) * 100) };
  };

  return (
    <Card className="border-teal-200">
      <CardHeader className="bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-teal-900">
            <ClipboardCheck className="w-5 h-5 text-teal-600" /> Đánh giá Giảng viên — {teacherName}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isTeacher && <Badge variant="outline" className="text-[10px] gap-1 border-teal-300 text-teal-700"><Eye className="w-3 h-3" />Chỉ xem bản đã công bố</Badge>}
            {canCreate && (
              <Button size="sm" variant="outline" className="border-teal-300" onClick={startNew}>
                <Plus className="w-3 h-3 mr-1" />Đánh giá mới
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-teal-700/80">
          Học vụ dự giờ và chấm theo {evaluationCriteria.length} tiêu chí. Phiếu chỉ hiển thị cho GV sau khi học vụ công bố.
        </p>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        {visible.length === 0 && <p className="text-sm text-muted-foreground italic">Chưa có đánh giá nào.</p>}
        {visible.map(e => {
          const total = totalScore(e);
          return (
            <div key={e.id} className="p-3 border border-border rounded-lg bg-card">
              <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                <div>
                  <p className="text-sm font-semibold">Dự giờ {e.date}{e.className ? ` · ${e.className}` : ""}</p>
                  <p className="text-[11px] text-muted-foreground">Học vụ: {e.reviewerName}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge className={`text-[10px] ${total.pct >= 80 ? "bg-emerald-100 text-emerald-700" : total.pct >= 60 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                    {total.sum}/{total.max} ({total.pct}%)
                  </Badge>
                  {e.visibleToTeacher ? (
                    <Badge className="text-[10px] bg-blue-100 text-blue-700 gap-1"><Eye className="w-3 h-3" />Đã công bố</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] gap-1"><EyeOff className="w-3 h-3" />Nháp</Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 my-2">
                {e.criteria.map(c => {
                  const cri = evaluationCriteria.find(x => x.id === c.criterionId);
                  return (
                    <div key={c.criterionId} className="p-1.5 bg-teal-50/40 rounded border border-teal-100 text-center">
                      <p className="text-[9px] text-muted-foreground line-clamp-1">{cri?.label}</p>
                      <p className="text-base font-bold text-teal-700">{c.score}<span className="text-[9px] text-muted-foreground">/{cri?.maxScore}</span></p>
                    </div>
                  );
                })}
              </div>
              {e.overallNote && (
                <p className="text-xs italic bg-muted/30 p-2 rounded"><strong>Nhận xét chung:</strong> {e.overallNote}</p>
              )}
              {canCreate && (
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditing(e)}>Sửa</Button>
                  {!e.visibleToTeacher && (
                    <Button size="sm" className="h-7 text-xs bg-teal-600 hover:bg-teal-700" onClick={() => { publishEvaluation(e.id); toast.success("Đã công bố cho GV xem"); }}>
                      <Send className="w-3 h-3 mr-1" />Công bố cho GV
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>

      {editing && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Phiếu đánh giá GV — {editing.teacherName}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Ngày dự giờ</label>
                  <Input type="date" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold">Lớp</label>
                  <Input value={editing.className ?? ""} onChange={e => setEditing({ ...editing, className: e.target.value })} placeholder="VD: 4CLC 2" />
                </div>
              </div>
              <div className="space-y-2">
                {evaluationCriteria.map((cri, idx) => {
                  const score = editing.criteria[idx]?.score ?? 0;
                  return (
                    <div key={cri.id} className="flex items-center gap-3 p-2 bg-muted/20 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{idx + 1}. {cri.label}</p>
                      </div>
                      <Input type="number" min={0} max={cri.maxScore} step={0.5} value={score} onChange={e => {
                        const v = Number(e.target.value);
                        const next = [...editing.criteria];
                        next[idx] = { criterionId: cri.id, score: isNaN(v) ? 0 : Math.min(cri.maxScore, Math.max(0, v)) };
                        setEditing({ ...editing, criteria: next });
                      }} className="w-20" />
                      <span className="text-xs text-muted-foreground">/{cri.maxScore}</span>
                    </div>
                  );
                })}
              </div>
              <div>
                <label className="text-xs font-semibold">Nhận xét chung</label>
                <Textarea rows={4} value={editing.overallNote} onChange={e => setEditing({ ...editing, overallNote: e.target.value })} placeholder="Điểm mạnh, điểm cần cải thiện, gợi ý..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>Huỷ</Button>
              <Button onClick={() => { upsertEvaluation(editing); toast.success("Đã lưu nháp"); setEditing(null); }}>Lưu nháp</Button>
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => {
                upsertEvaluation({ ...editing, visibleToTeacher: true, publishedAt: new Date().toISOString() });
                toast.success("Đã lưu & công bố cho GV");
                setEditing(null);
              }}>
                <Send className="w-3 h-3 mr-1" />Lưu & Công bố
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default TeacherEvaluationPanel;
