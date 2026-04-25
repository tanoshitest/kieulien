import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClipboardCheck, Plus, Globe2 } from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/contexts/RoleContext";
import { useSyllabusFeatures, type ForeignTeacherEvaluation } from "@/contexts/SyllabusFeaturesContext";

interface Props {
  foreignTeacherId: string;
  foreignTeacherName: string;
  classScheduleId?: string;
  className?: string;
}

const ForeignTeacherEvaluationPanel: React.FC<Props> = ({ foreignTeacherId, foreignTeacherName, classScheduleId, className }) => {
  const { isTeacher, isAdmin, isTA, isParent, isForeignTeacher } = useRole();
  const { foreignEvaluations, foreignEvalCriteria, upsertForeignEvaluation } = useSyllabusFeatures();

  if (isParent) return null;

  const list = useMemo(
    () => foreignEvaluations.filter(e => e.foreignTeacherId === foreignTeacherId).sort((a, b) => b.date.localeCompare(a.date)),
    [foreignEvaluations, foreignTeacherId]
  );

  const [editing, setEditing] = useState<ForeignTeacherEvaluation | null>(null);

  // GV Việt và TA đều có thể chấm GVNN. Admin xem + chấm. GVNN chỉ xem.
  const canCreate = isTA || isAdmin || isTeacher;

  const startNew = () => {
    const role: "ta" | "teacher" | "admin" = isTA ? "ta" : isAdmin ? "admin" : "teacher";
    const reviewerName = isTA ? "Ms. Linh Chi (TA)" : isAdmin ? "Admin" : "Ms. Thu Trang";
    setEditing({
      id: `FEVAL_${Date.now()}`,
      foreignTeacherId, foreignTeacherName,
      classScheduleId, className,
      date: "2026-04-24",
      criteria: foreignEvalCriteria.map(c => ({ criterionId: c.id, score: 8 })),
      overallNote: "",
      reviewerId: "USR_OPS", reviewerName, reviewerRole: role,
      createdAt: new Date().toISOString(),
    });
  };

  const totalScore = (e: ForeignTeacherEvaluation) => {
    const sum = e.criteria.reduce((s, c) => s + c.score, 0);
    const max = foreignEvalCriteria.reduce((s, c) => s + c.maxScore, 0);
    return { sum, max, pct: Math.round((sum / max) * 100) };
  };

  return (
    <Card className="border-emerald-200">
      <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-emerald-900 text-base">
            <Globe2 className="w-5 h-5 text-emerald-600" /> Đánh giá GV Nước ngoài — {foreignTeacherName}
          </CardTitle>
          {canCreate && !isForeignTeacher && (
            <Button size="sm" variant="outline" className="border-emerald-300" onClick={startNew}>
              <Plus className="w-3 h-3 mr-1" />Đánh giá
            </Button>
          )}
        </div>
        <p className="text-xs text-emerald-700/80">
          GV Việt + Học vụ chấm GVNN sau buổi dạy. {foreignEvalCriteria.length} tiêu chí.
        </p>
      </CardHeader>

      <CardContent className="pt-3 space-y-2">
        {list.length === 0 && <p className="text-sm text-muted-foreground italic">Chưa có đánh giá nào.</p>}
        {list.map(e => {
          const total = totalScore(e);
          return (
            <div key={e.id} className="p-3 border border-border rounded-lg bg-card">
              <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                <div>
                  <p className="text-sm font-semibold">Buổi {e.date}{e.className ? ` · ${e.className}` : ""}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {e.reviewerRole === "ta" ? "Học vụ" : e.reviewerRole === "admin" ? "Admin" : "GV Việt"}: {e.reviewerName}
                  </p>
                </div>
                <Badge className={`text-[10px] ${total.pct >= 80 ? "bg-emerald-100 text-emerald-700" : total.pct >= 60 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                  {total.sum}/{total.max} ({total.pct}%)
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 my-2">
                {e.criteria.map(c => {
                  const cri = foreignEvalCriteria.find(x => x.id === c.criterionId);
                  return (
                    <div key={c.criterionId} className="p-1.5 bg-emerald-50/40 rounded border border-emerald-100 text-center">
                      <p className="text-[9px] text-muted-foreground line-clamp-1">{cri?.label}</p>
                      <p className="text-base font-bold text-emerald-700">{c.score}<span className="text-[9px] text-muted-foreground">/{cri?.maxScore}</span></p>
                    </div>
                  );
                })}
              </div>
              {e.overallNote && (
                <p className="text-xs italic bg-muted/30 p-2 rounded"><strong>Nhận xét:</strong> {e.overallNote}</p>
              )}
              {canCreate && !isForeignTeacher && (
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditing(e)}>Sửa</Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>

      {editing && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Đánh giá GVNN — {editing.foreignTeacherName}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Ngày</label>
                  <Input type="date" value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold">Lớp</label>
                  <Input value={editing.className ?? ""} onChange={e => setEditing({ ...editing, className: e.target.value })} placeholder="VD: 4CLC 2" />
                </div>
              </div>
              <div className="space-y-2">
                {foreignEvalCriteria.map((cri, idx) => {
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
                <Textarea rows={4} value={editing.overallNote} onChange={e => setEditing({ ...editing, overallNote: e.target.value })} placeholder="Phối hợp, năng lượng, hiệu quả với HS..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>Huỷ</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                upsertForeignEvaluation(editing);
                toast.success("Đã lưu đánh giá GVNN");
                setEditing(null);
              }}>
                <ClipboardCheck className="w-3 h-3 mr-1" />Lưu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default ForeignTeacherEvaluationPanel;
