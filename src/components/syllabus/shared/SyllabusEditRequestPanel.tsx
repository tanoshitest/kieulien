import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FilePenLine, CheckCircle2, XCircle, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/contexts/RoleContext";
import {
  useSyllabusFeatures,
  type SyllabusEditRequest,
  type SylEditField,
  type SylFieldChange,
} from "@/contexts/SyllabusFeaturesContext";
import type { Syllabus, SyllabusSession } from "@/data/mockData";

interface Props {
  syllabus: Syllabus;
  /** Optional — nếu truyền: chỉ hiện request của session này và form sẽ auto-fill */
  session?: SyllabusSession;
}

const fieldLabel: Record<SylEditField, string> = {
  title: "Tiêu đề buổi",
  vocab: "Từ vựng",
  grammar: "Ngữ pháp",
  teachingProcess: "Tiến trình dạy",
  materialsLink: "Link tài liệu",
};

const ALL_FIELDS: SylEditField[] = ["title", "vocab", "grammar", "teachingProcess", "materialsLink"];

const statusCls: Record<SyllabusEditRequest["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

// Convert legacy single-field request → changes[]
function normalizeChanges(r: SyllabusEditRequest): SylFieldChange[] {
  if (r.changes && r.changes.length > 0) return r.changes;
  return [{ field: r.field, oldValue: r.oldValue, newValue: r.newValue }];
}

const SyllabusEditRequestPanel: React.FC<Props> = ({ syllabus, session }) => {
  const { isTeacher, isAdmin, isTA, isParent } = useRole();
  const { sylEditRequests, submitSylEditRequest, approveSylEdit, rejectSylEdit } = useSyllabusFeatures();

  if (isParent) return null;

  const relevant = useMemo(() => {
    const list = sylEditRequests.filter(r => r.syllabusId === syllabus.id);
    if (session) return list.filter(r => r.sessionId === session.id);
    return list;
  }, [sylEditRequests, syllabus.id, session]);

  // ── GV propose dialog state ──────────────────────────────────────
  const [opening, setOpening] = useState(false);
  const [editSession, setEditSession] = useState<SyllabusSession | null>(session ?? syllabus.sessions[0] ?? null);
  const [draft, setDraft] = useState<Record<SylEditField, string>>({
    title: "", vocab: "", grammar: "", teachingProcess: "", materialsLink: "",
  });
  const [reason, setReason] = useState("");

  // ── TA review dialog state ───────────────────────────────────────
  const [reviewing, setReviewing] = useState<SyllabusEditRequest | null>(null);
  const [pickedFields, setPickedFields] = useState<Set<SylEditField>>(new Set());
  const [reviewNote, setReviewNote] = useState("");

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const openProposeDialog = (sess: SyllabusSession) => {
    setEditSession(sess);
    setDraft({
      title: sess.title ?? "",
      vocab: sess.vocab ?? "",
      grammar: sess.grammar ?? "",
      teachingProcess: sess.teachingProcess ?? "",
      materialsLink: sess.materialsLink ?? "",
    });
    setReason("");
    setOpening(true);
  };

  const computeChanges = (sess: SyllabusSession, d: typeof draft): SylFieldChange[] => {
    const changes: SylFieldChange[] = [];
    ALL_FIELDS.forEach(f => {
      const oldV = (sess[f] ?? "").toString();
      const newV = (d[f] ?? "").toString();
      if (oldV !== newV) changes.push({ field: f, oldValue: oldV, newValue: newV });
    });
    return changes;
  };

  const submitProposal = () => {
    if (!editSession) return toast.error("Chưa chọn buổi");
    if (!reason.trim()) return toast.error("Vui lòng nhập lý do đề xuất");
    const changes = computeChanges(editSession, draft);
    if (changes.length === 0) return toast.error("Bạn chưa thay đổi field nào");

    // Tương thích ngược: vẫn fill field/oldValue/newValue = change đầu tiên
    const first = changes[0];
    submitSylEditRequest({
      syllabusId: syllabus.id,
      syllabusName: syllabus.name,
      sessionId: editSession.id,
      sessionTitle: editSession.title,
      field: first.field,
      oldValue: first.oldValue,
      newValue: first.newValue,
      changes,
      reason,
      requestedBy: "USR001",
      requestedByName: "Ms. Thu Trang",
    });
    toast.success(`Đã gửi đề xuất sửa ${changes.length} field tới học vụ`);
    setOpening(false);
  };

  const openReview = (r: SyllabusEditRequest) => {
    setReviewing(r);
    const changes = normalizeChanges(r);
    setPickedFields(new Set(changes.map(c => c.field)));
    setReviewNote("Đồng ý áp dụng");
  };

  const togglePicked = (f: SylEditField) => {
    setPickedFields(prev => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f); else next.add(f);
      return next;
    });
  };

  const confirmApprove = () => {
    if (!reviewing) return;
    if (pickedFields.size === 0) return toast.error("Tick ít nhất 1 field để duyệt");
    const allChanges = normalizeChanges(reviewing);
    const accepted = allChanges.filter(c => pickedFields.has(c.field));
    approveSylEdit(reviewing.id, "Ms. Linh Chi", reviewNote, (approved) => {
      // Phát từng change đã chọn ra event để AdminSyllabusView ghi đè vào template
      accepted.forEach(c => {
        window.dispatchEvent(new CustomEvent("syllabus:apply-edit", {
          detail: {
            syllabusId: approved.syllabusId,
            sessionId: approved.sessionId,
            field: c.field,
            newValue: c.newValue,
          },
        }));
      });
    }, accepted.map(c => c.field));
    toast.success(`Đã duyệt ${accepted.length}/${allChanges.length} field & áp dụng vào template`);
    setReviewing(null);
  };

  const pendingCount = relevant.filter(r => r.status === "pending").length;

  return (
    <Card className="border-indigo-200">
      <CardHeader className="bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <FilePenLine className="w-5 h-5 text-indigo-600" /> Đề xuất sửa Syllabus
            {session && <Badge variant="outline" className="text-[10px]">Buổi {session.order}</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && <Badge className="bg-amber-100 text-amber-700">{pendingCount} chờ duyệt</Badge>}
            {isTeacher && session && (
              <Button size="sm" variant="outline" className="border-indigo-300" onClick={() => openProposeDialog(session)}>
                <Send className="w-3 h-3 mr-1" />Đề xuất sửa buổi này
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-indigo-700/80">
          GV mở popup giống Admin → sửa nhiều field cùng lúc → Học vụ review từng diff & duyệt từng phần.
        </p>
      </CardHeader>

      <CardContent className="pt-4 space-y-2">
        {relevant.length === 0 && <p className="text-sm text-muted-foreground italic">Chưa có đề xuất nào.</p>}
        {relevant.map(r => {
          const changes = normalizeChanges(r);
          return (
            <div key={r.id} className="p-3 border border-border rounded-lg bg-card">
              <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    Buổi {r.sessionTitle} <span className="text-muted-foreground">— {changes.length} field thay đổi</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">GV {r.requestedByName} · {new Date(r.requestedAt).toLocaleString("vi-VN")}</p>
                </div>
                <Badge className={`text-[10px] ${statusCls[r.status]}`}>
                  {r.status === "pending" ? "Chờ duyệt" : r.status === "approved" ? "Đã duyệt" : "Từ chối"}
                </Badge>
              </div>

              {/* Tóm tắt các field đã đổi */}
              <div className="flex flex-wrap gap-1 mb-2">
                {changes.map(c => {
                  const applied = r.appliedFields?.includes(c.field);
                  return (
                    <Badge
                      key={c.field}
                      variant="outline"
                      className={`text-[10px] ${
                        r.status === "approved"
                          ? applied ? "border-emerald-300 text-emerald-700 bg-emerald-50" : "border-slate-300 text-slate-500 line-through"
                          : "border-amber-300 text-amber-700 bg-amber-50"
                      }`}
                    >
                      {fieldLabel[c.field]}
                      {r.status === "approved" && (applied ? " ✓" : " (bỏ qua)")}
                    </Badge>
                  );
                })}
              </div>

              <p className="text-xs italic text-muted-foreground"><strong>Lý do:</strong> {r.reason}</p>
              {r.reviewNote && <p className="mt-1 text-xs p-2 bg-muted/30 rounded"><strong>Học vụ:</strong> {r.reviewNote}</p>}

              {r.status === "pending" && (isTA || isAdmin) && (
                <div className="mt-2 flex gap-2">
                  <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={() => openReview(r)}>
                    <CheckCircle2 className="w-3 h-3 mr-1" />Mở review
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs border-rose-300 text-rose-700" onClick={() => setRejectingId(r.id)}>
                    <XCircle className="w-3 h-3 mr-1" />Từ chối
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>

      {/* GV PROPOSE DIALOG — Hybrid: full form, highlight field đã đổi */}
      {opening && editSession && (() => {
        const liveChanges = computeChanges(editSession, draft);
        const changedSet = new Set(liveChanges.map(c => c.field));
        return (
          <Dialog open onOpenChange={setOpening}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FilePenLine className="w-5 h-5 text-indigo-600" />
                  Đề xuất sửa Syllabus — Buổi {editSession.order}: {editSession.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                {liveChanges.length > 0 && (
                  <div className="flex items-center gap-2 text-xs p-2 rounded bg-amber-50 border border-amber-200 text-amber-800">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Đã thay đổi {liveChanges.length} field: {liveChanges.map(c => fieldLabel[c.field]).join(", ")}
                  </div>
                )}

                {ALL_FIELDS.map(f => {
                  const isChanged = changedSet.has(f);
                  const isShortField = f === "title" || f === "materialsLink";
                  return (
                    <div
                      key={f}
                      className={`p-2 rounded-lg border transition-colors ${
                        isChanged ? "border-amber-400 bg-amber-50/50" : "border-border bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold flex items-center gap-1.5">
                          {fieldLabel[f]}
                          {isChanged && <span className="text-[9px] px-1.5 py-0.5 bg-amber-500 text-white rounded">ĐÃ ĐỔI</span>}
                        </label>
                        {isChanged && (
                          <button
                            type="button"
                            className="text-[10px] text-muted-foreground hover:text-foreground underline"
                            onClick={() => setDraft(d => ({ ...d, [f]: (editSession[f] ?? "") }))}
                          >
                            Hoàn tác
                          </button>
                        )}
                      </div>
                      {isShortField ? (
                        <Input value={draft[f]} onChange={e => setDraft(d => ({ ...d, [f]: e.target.value }))} />
                      ) : (
                        <Textarea rows={3} value={draft[f]} onChange={e => setDraft(d => ({ ...d, [f]: e.target.value }))} />
                      )}
                      {isChanged && (
                        <p className="mt-1 text-[10px] text-muted-foreground line-through truncate">
                          Cũ: {(editSession[f] ?? "").toString() || "(trống)"}
                        </p>
                      )}
                    </div>
                  );
                })}

                <div>
                  <label className="text-xs font-semibold">Lý do đề xuất *</label>
                  <Textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="VD: Nên thêm Puzzle và Lego vì HS rất quen thuộc..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpening(false)}>Huỷ</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={submitProposal}>
                  <Send className="w-4 h-4 mr-1.5" />Gửi đề xuất ({liveChanges.length})
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}

      {/* TA REVIEW DIALOG — diff + cho duyệt từng field */}
      {reviewing && (() => {
        const changes = normalizeChanges(reviewing);
        return (
          <Dialog open onOpenChange={() => setReviewing(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  Review đề xuất — Buổi {reviewing.sessionTitle}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="text-xs p-2 rounded bg-indigo-50 border border-indigo-200">
                  <p><strong>GV:</strong> {reviewing.requestedByName} · {new Date(reviewing.requestedAt).toLocaleString("vi-VN")}</p>
                  <p className="mt-1 italic"><strong>Lý do:</strong> {reviewing.reason}</p>
                </div>

                <p className="text-xs text-muted-foreground">
                  Tick các field bạn muốn áp dụng vào template. Bỏ tick = không áp dụng (vẫn lưu lịch sử request).
                </p>

                {changes.map(c => {
                  const checked = pickedFields.has(c.field);
                  return (
                    <div
                      key={c.field}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        checked ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200 bg-slate-50/30"
                      }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer mb-2">
                        <input type="checkbox" checked={checked} onChange={() => togglePicked(c.field)} className="w-4 h-4" />
                        <span className="text-sm font-semibold">{fieldLabel[c.field]}</span>
                      </label>
                      <div className="grid md:grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-rose-50/60 border border-rose-100">
                          <p className="font-semibold text-rose-700 mb-1 text-[10px]">CŨ</p>
                          <p className="whitespace-pre-wrap">{c.oldValue || <em className="text-muted-foreground">(trống)</em>}</p>
                        </div>
                        <div className="p-2 rounded bg-emerald-50/60 border border-emerald-100">
                          <p className="font-semibold text-emerald-700 mb-1 text-[10px]">MỚI</p>
                          <p className="whitespace-pre-wrap">{c.newValue || <em className="text-muted-foreground">(trống)</em>}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div>
                  <label className="text-xs font-semibold">Ghi chú duyệt</label>
                  <Textarea rows={2} value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="VD: Đồng ý áp dụng phần từ vựng, bỏ qua phần grammar..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReviewing(null)}>Huỷ</Button>
                <Button variant="outline" onClick={() => setPickedFields(new Set(changes.map(c => c.field)))}>Tick tất cả</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={confirmApprove}>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />Duyệt {pickedFields.size}/{changes.length} field
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}

      {rejectingId && (
        <Dialog open onOpenChange={() => setRejectingId(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Từ chối đề xuất sửa</DialogTitle></DialogHeader>
            <Textarea rows={4} value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Lý do từ chối..." />
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectingId(null)}>Huỷ</Button>
              <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => {
                if (!rejectNote.trim()) return toast.error("Nhập lý do");
                rejectSylEdit(rejectingId, "Ms. Linh Chi", rejectNote);
                toast.success("Đã từ chối");
                setRejectingId(null);
                setRejectNote("");
              }}>Xác nhận từ chối</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default SyllabusEditRequestPanel;
