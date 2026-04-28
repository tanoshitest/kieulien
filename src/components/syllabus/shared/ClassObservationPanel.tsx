import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ClipboardList, Eye, EyeOff, Send, Plus, Trash2,
  CheckCircle2, Clock, ChevronDown, ChevronRight, AlertTriangle, Award
} from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/contexts/RoleContext";
import {
  useSyllabusFeatures,
  type ClassObservation,
  type ObservationScore,
  DEFAULT_OBSERVATION_CRITERIA,
} from "@/contexts/SyllabusFeaturesContext";

interface Props {
  teacherId: string;
  teacherName: string;
  classId?: string;
  className?: string;
  classScheduleId?: string;
  date?: string;
}

// ── Helpers ──────────────────────────────────────────────────────
const gradeLabel = (pct: number) =>
  pct >= 90 ? { text: "Xuất sắc", cls: "bg-emerald-100 text-emerald-700" }
  : pct >= 75 ? { text: "Tốt", cls: "bg-blue-100 text-blue-700" }
  : pct >= 60 ? { text: "Đạt yêu cầu", cls: "bg-amber-100 text-amber-700" }
  : { text: "Cần cải thiện", cls: "bg-rose-100 text-rose-700" };

const statusCfg: Record<ClassObservation["status"], { label: string; cls: string; icon: React.ElementType }> = {
  draft:     { label: "Nháp",        cls: "bg-slate-100 text-slate-700",    icon: Clock },
  completed: { label: "Hoàn thành",  cls: "bg-amber-100 text-amber-700",    icon: ClipboardList },
  published: { label: "Đã công bố",  cls: "bg-emerald-100 text-emerald-700", icon: Eye },
};

const DEFAULT_SCORES = (): ObservationScore[] =>
  DEFAULT_OBSERVATION_CRITERIA.map(c => ({ criterionId: c.id, passed: true, score: 5, comment: "" }));

// ── Group rows by hạng mục ────────────────────────────────────────
function groupByGroup(section: "B" | "C") {
  const rows = DEFAULT_OBSERVATION_CRITERIA.filter(c => c.section === section);
  const groups: Record<string, typeof rows> = {};
  for (const r of rows) {
    if (!groups[r.group]) groups[r.group] = [];
    groups[r.group].push(r);
  }
  return groups;
}

// ── ScoreTable (one section) ──────────────────────────────────────
interface TableProps {
  section: "B" | "C";
  scores: ObservationScore[];
  readOnly: boolean;
  onChange: (criterionId: string, field: "passed" | "score" | "comment", value: boolean | number | string) => void;
}

const SectionTable: React.FC<TableProps> = ({ section, scores, readOnly, onChange }) => {
  const groups = groupByGroup(section);
  const sectionLabel = section === "B"
    ? "B. ĐÁNH GIÁ GIÁO VIÊN"
    : "C. ĐÁNH GIÁ QUY TRÌNH VẬN HÀNH LỚP HỌC";
  const maxTotal = DEFAULT_OBSERVATION_CRITERIA.filter(c => c.section === section).reduce((a, c) => a + c.maxScore, 0);
  const earned = scores.filter(s => DEFAULT_OBSERVATION_CRITERIA.find(c => c.id === s.criterionId)?.section === section)
    .reduce((a, s) => a + s.score, 0);

  const headerCls = section === "B"
    ? "bg-blue-700 text-white"
    : "bg-yellow-600 text-white";

  let globalIdx = section === "B" ? 0 : 0;

  return (
    <div className="rounded-xl overflow-hidden border border-border">
      {/* Section header */}
      <div className={`px-4 py-2.5 flex items-center justify-between ${headerCls}`}>
        <span className="font-bold text-sm tracking-wide">{sectionLabel}</span>
        <span className="text-sm font-bold opacity-90">{earned}/{maxTotal} điểm</span>
      </div>

      {/* Table */}
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/60 border-b border-border">
            <th className="px-2 py-2 text-left w-8">STT</th>
            <th className="px-2 py-2 text-left w-28">Hạng mục</th>
            <th className="px-2 py-2 text-left">Nhóm tiêu chí</th>
            <th className="px-2 py-2 text-center w-12">ĐẠT</th>
            <th className="px-2 py-2 text-center w-16">0–5</th>
            <th className="px-2 py-2 text-left w-36">Nhận xét</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groups).map(([groupName, criteria]) =>
            criteria.map((crit, idxInGroup) => {
              globalIdx++;
              const sc = scores.find(s => s.criterionId === crit.id);
              const rowCls = globalIdx % 2 === 0 ? "bg-muted/10" : "bg-background";
              return (
                <tr key={crit.id} className={`border-b border-border/50 ${rowCls}`}>
                  <td className="px-2 py-2 font-semibold text-muted-foreground">{globalIdx}</td>
                  {/* Hạng mục — chỉ hiện ở dòng đầu của group */}
                  {idxInGroup === 0 ? (
                    <td rowSpan={criteria.length} className="px-2 py-2 font-semibold text-foreground align-top border-r border-border/40">
                      {groupName}
                    </td>
                  ) : null}
                  <td className="px-2 py-2 text-foreground/90">{crit.label}</td>
                  {/* ĐẠT checkbox */}
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={sc?.passed ?? true}
                      disabled={readOnly}
                      onChange={e => onChange(crit.id, "passed", e.target.checked)}
                      className="w-4 h-4 accent-emerald-600"
                    />
                  </td>
                  {/* Score 0-5 */}
                  <td className="px-2 py-2 text-center">
                    {readOnly ? (
                      <span className={`font-bold text-sm ${(sc?.score ?? 5) >= 4 ? "text-emerald-700" : (sc?.score ?? 5) >= 3 ? "text-amber-600" : "text-rose-600"}`}>
                        {sc?.score ?? 5}
                      </span>
                    ) : (
                      <Input
                        type="number" min={0} max={5} step={1}
                        value={sc?.score ?? 5}
                        onChange={e => onChange(crit.id, "score", Math.min(5, Math.max(0, Number(e.target.value))))}
                        className="h-7 w-14 text-center text-xs px-1"
                      />
                    )}
                  </td>
                  {/* Comment */}
                  <td className="px-2 py-2">
                    {readOnly ? (
                      sc?.comment ? <span className="italic text-muted-foreground">{sc.comment}</span> : null
                    ) : (
                      <Input
                        value={sc?.comment ?? ""}
                        onChange={e => onChange(crit.id, "comment", e.target.value)}
                        placeholder="Ghi chú..."
                        className="h-7 text-xs"
                      />
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────
const ClassObservationPanel: React.FC<Props> = ({
  teacherId, teacherName, classId = "CLS001", className = "4CLC 2",
  classScheduleId, date,
}) => {
  const { isTeacher, isAdmin, isTA, isParent } = useRole();
  const { observations, upsertObservation, publishObservation, deleteObservation } = useSyllabusFeatures();

  if (isParent) return null;

  const myObs = useMemo(
    () => observations
      .filter(o => o.teacherId === teacherId)
      .filter(o => isTeacher ? o.visibleToTeacher : true)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [observations, teacherId, isTeacher]
  );

  const [editing, setEditing] = useState<ClassObservation | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── helpers ──
  const startNew = () => {
    const today = new Date().toISOString().slice(0, 10);
    setEditing({
      id: `OBS_${Date.now()}`,
      teacherId, teacherName,
      classId, className,
      classScheduleId,
      date: date ?? today,
      observerId: "USR_OPS",
      observerName: "Ms. Linh Chi",
      scores: DEFAULT_SCORES(),
      totalScore: 100, sectionBScore: 60, sectionCScore: 40,
      overallComment: "",
      status: "draft",
      visibleToTeacher: false,
      createdAt: new Date().toISOString(),
    });
  };

  const handleScoreChange = (cId: string, field: "passed" | "score" | "comment", val: boolean | number | string) => {
    if (!editing) return;
    setEditing(prev => {
      if (!prev) return prev;
      const scores = prev.scores.map(s =>
        s.criterionId === cId ? { ...s, [field]: val } : s
      );
      return { ...prev, scores };
    });
  };

  const saveEditing = (publish = false) => {
    if (!editing) return;
    const obs: ClassObservation = {
      ...editing,
      status: publish ? "published" : "completed",
      visibleToTeacher: publish,
      publishedAt: publish ? new Date().toISOString() : undefined,
    };
    upsertObservation(obs);
    toast.success(publish ? "Đã lưu & công bố cho GV" : "Đã lưu phiếu dự giờ");
    setEditing(null);
  };

  // Compute live scores when editing
  const liveScores = useMemo(() => {
    if (!editing) return null;
    const bScore = editing.scores
      .filter(s => DEFAULT_OBSERVATION_CRITERIA.find(c => c.id === s.criterionId)?.section === "B")
      .reduce((a, s) => a + s.score, 0);
    const cScore = editing.scores
      .filter(s => DEFAULT_OBSERVATION_CRITERIA.find(c => c.id === s.criterionId)?.section === "C")
      .reduce((a, s) => a + s.score, 0);
    return { bScore, cScore, total: bScore + cScore };
  }, [editing?.scores]);

  const canEdit = isTA || isAdmin;

  return (
    <Card className="border-blue-200">
      <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            Phiếu Dự giờ Đánh giá GV
          </CardTitle>
          <div className="flex items-center gap-2">
            {isTeacher && (
              <Badge variant="outline" className="text-[10px] gap-1 border-blue-300 text-blue-700">
                <Eye className="w-3 h-3" /> Chỉ xem bản đã công bố
              </Badge>
            )}
            {canEdit && (
              <Button size="sm" variant="outline" className="border-blue-300" onClick={startNew}>
                <Plus className="w-3 h-3 mr-1" /> Tạo phiếu mới
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-blue-700/80">
          Học vụ dự giờ → chấm 20 tiêu chí (B: GV 60đ + C: Vận hành 40đ) → tổng 100đ. GV xem sau khi công bố.
        </p>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        {myObs.length === 0 && (
          <p className="text-sm text-muted-foreground italic">Chưa có phiếu dự giờ nào.</p>
        )}

        {myObs.map(obs => {
          const pct = obs.totalScore;
          const grade = gradeLabel(pct);
          const cfg = statusCfg[obs.status];
          const StatusIcon = cfg.icon;
          const expanded = expandedId === obs.id;

          return (
            <div key={obs.id} className="border border-border rounded-xl overflow-hidden bg-card">
              {/* Card header row */}
              <div
                className="px-4 py-3 flex items-center gap-3 flex-wrap cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(expanded ? null : obs.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">Dự giờ {obs.date} · {obs.className}</p>
                    <p className="text-[11px] text-muted-foreground">Học vụ: {obs.observerName}</p>
                  </div>
                </div>

                {/* Scores */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="font-medium text-blue-700">B:{obs.sectionBScore}/60</span>
                    <span>+</span>
                    <span className="font-medium text-yellow-700">C:{obs.sectionCScore}/40</span>
                  </div>
                  <Badge className={`text-sm font-bold px-3 ${grade.cls}`}>
                    <Award className="w-3.5 h-3.5 mr-1" />{obs.totalScore}/100
                  </Badge>
                  <Badge className={`text-[10px] ${grade.cls}`}>{grade.text}</Badge>
                  <Badge className={`text-[10px] gap-1 ${cfg.cls}`}>
                    <StatusIcon className="w-3 h-3" />{cfg.label}
                  </Badge>
                  {expanded
                    ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  }
                </div>
              </div>

              {/* Score bar */}
              <div className="px-4 pb-2">
                <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-emerald-500" : pct >= 75 ? "bg-blue-500" : pct >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Expanded detail */}
              {expanded && (
                <div className="border-t border-border px-4 py-4 space-y-4">
                  {/* Section B table — read-only view */}
                  <SectionTable
                    section="B"
                    scores={obs.scores}
                    readOnly
                    onChange={() => {}}
                  />
                  <SectionTable
                    section="C"
                    scores={obs.scores}
                    readOnly
                    onChange={() => {}}
                  />

                  {/* Overall comment */}
                  {obs.overallComment && (
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Nhận xét tổng quát</p>
                      <p className="text-sm italic">{obs.overallComment}</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  {canEdit && (
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs"
                        onClick={() => setEditing({ ...obs })}>
                        Chỉnh sửa
                      </Button>
                      {obs.status !== "published" && (
                        <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => { publishObservation(obs.id); toast.success("Đã công bố cho GV"); }}>
                          <Send className="w-3 h-3 mr-1" />Công bố cho GV
                        </Button>
                      )}
                      {obs.status === "draft" && (
                        <Button size="sm" variant="outline"
                          className="h-7 text-xs border-rose-300 text-rose-700"
                          onClick={() => setDeleteConfirm(obs.id)}>
                          <Trash2 className="w-3 h-3 mr-1" />Xoá
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>

      {/* ── EDIT DIALOG ── */}
      {editing && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                Phiếu dự giờ — {editing.teacherName}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Meta */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold">Ngày dự giờ</label>
                  <Input type="date" value={editing.date}
                    onChange={e => setEditing({ ...editing, date: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold">Lớp</label>
                  <Input value={editing.className}
                    onChange={e => setEditing({ ...editing, className: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold">Học vụ dự giờ</label>
                  <Input value={editing.observerName}
                    onChange={e => setEditing({ ...editing, observerName: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold">Giáo viên</label>
                  <Input value={editing.teacherName} readOnly className="opacity-70" />
                </div>
              </div>

              {/* Live score banner */}
              {liveScores && (
                <div className={`p-3 rounded-xl flex items-center gap-4 flex-wrap ${gradeLabel(liveScores.total).cls}`}>
                  <Award className="w-5 h-5" />
                  <span className="text-2xl font-extrabold">{liveScores.total}/100</span>
                  <span className="font-bold">{gradeLabel(liveScores.total).text}</span>
                  <span className="text-sm opacity-80">
                    Phần B (GV): {liveScores.bScore}/60 · Phần C (Vận hành): {liveScores.cScore}/40
                  </span>
                  <div className="flex-1 min-w-[120px]">
                    <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                      <div className="h-full bg-current rounded-full" style={{ width: `${liveScores.total}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Section B */}
              <SectionTable
                section="B"
                scores={editing.scores}
                readOnly={false}
                onChange={handleScoreChange}
              />

              {/* Section C */}
              <SectionTable
                section="C"
                scores={editing.scores}
                readOnly={false}
                onChange={handleScoreChange}
              />

              {/* Overall comment */}
              <div>
                <label className="text-xs font-semibold">Nhận xét tổng quát</label>
                <Textarea rows={3} value={editing.overallComment}
                  onChange={e => setEditing({ ...editing, overallComment: e.target.value })}
                  placeholder="Điểm mạnh, điểm cần cải thiện, đề xuất cho buổi tiếp theo..." />
              </div>
            </div>

            <DialogFooter className="flex-wrap gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Huỷ</Button>
              <Button variant="outline" onClick={() => saveEditing(false)}>
                <Clock className="w-3.5 h-3.5 mr-1" />Lưu nháp
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => saveEditing(true)}>
                <Send className="w-3.5 h-3.5 mr-1" />Lưu & Công bố cho GV
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <Dialog open onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="w-5 h-5" /> Xác nhận xoá
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">Phiếu dự giờ sẽ bị xoá vĩnh viễn. Không thể hoàn tác.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Huỷ</Button>
              <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => {
                deleteObservation(deleteConfirm);
                toast.success("Đã xoá phiếu dự giờ");
                setDeleteConfirm(null);
                setExpandedId(null);
              }}>Xoá</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default ClassObservationPanel;
