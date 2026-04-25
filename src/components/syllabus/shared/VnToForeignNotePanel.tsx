import React, { useState } from "react";
import { useForeignNotes } from "@/contexts/ForeignNoteContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Globe2, Send, Star, Clock, CheckCircle2, AlertCircle, Trash2, Paperclip } from "lucide-react";
import { toast } from "sonner";

interface Props {
  classId: string;
  className: string;
  date: string;
  classScheduleId?: string;
  sessionId?: string;
  /** Thông tin GVNN dạy buổi này (lấy từ schedule) */
  foreignTeacherId?: string;
  foreignTeacherName?: string;
  foreignStartTime?: string;
  foreignEndTime?: string;
  foreignContent?: string;
  foreignMaterialsLink?: string;
  /** GV Việt đang đăng nhập */
  vnTeacherId: string;
  vnTeacherName: string;
}

const VnToForeignNotePanel: React.FC<Props> = ({
  classId,
  className,
  date,
  classScheduleId,
  sessionId,
  foreignTeacherId,
  foreignTeacherName,
  foreignStartTime,
  foreignEndTime,
  foreignContent,
  foreignMaterialsLink,
  vnTeacherId,
  vnTeacherName,
}) => {
  const { getNotesForSession, createNote, deleteNote } = useForeignNotes();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"normal" | "important">("normal");
  const [highlights, setHighlights] = useState("");

  const notes = getNotesForSession(classId, date);

  const noFT = !foreignTeacherId;

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung note");
      return;
    }
    if (!foreignTeacherId || !foreignTeacherName) {
      toast.error("Buổi này chưa có GVNN — không thể gửi note");
      return;
    }
    createNote({
      classId,
      className,
      date,
      classScheduleId,
      sessionId,
      vnTeacherId,
      vnTeacherName,
      foreignTeacherId,
      foreignTeacherName,
      content: content.trim(),
      priority,
      highlightTopics: highlights
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    toast.success(`Đã gửi note cho ${foreignTeacherName}`);
    setContent("");
    setHighlights("");
    setPriority("normal");
    setOpen(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-border flex items-center gap-2">
        <Globe2 className="w-4 h-4 text-emerald-600" />
        <h4 className="font-semibold text-sm text-foreground">Bridge với GVNN</h4>
        <Badge variant="outline" className="ml-auto text-[10px]">
          {notes.length} note
        </Badge>
      </div>

      <div className="p-5 space-y-4">
        {/* GVNN info card */}
        {noFT ? (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <b>Buổi này chưa có GVNN.</b> Học vụ cần xếp lịch GVNN trước khi GV Việt có thể gửi note.
            </div>
          </div>
        ) : (
          <div className="border border-border rounded-lg p-3 bg-emerald-50/40 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-base">🌍</span>
              <span className="font-semibold text-foreground">{foreignTeacherName}</span>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 text-[10px]">
                {foreignStartTime} – {foreignEndTime}
              </Badge>
            </div>
            {foreignContent && (
              <div className="text-xs text-muted-foreground">
                <b className="text-foreground">ND GVNN dạy:</b>{" "}
                <span className="line-clamp-2">{foreignContent.split("\n")[0]}</span>
              </div>
            )}
            {foreignMaterialsLink && (
              <div className="text-xs flex items-center gap-1 text-emerald-700">
                <Paperclip className="w-3 h-3" />
                <span className="truncate">{foreignMaterialsLink.split("/").pop()}</span>
              </div>
            )}
          </div>
        )}

        {/* Send note button */}
        <Button
          onClick={() => setOpen(true)}
          disabled={noFT}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          size="sm"
        >
          <Send className="w-3.5 h-3.5 mr-1.5" />
          Gửi note / dặn dò GVNN
        </Button>

        {/* History */}
        {notes.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              📜 Lịch sử note ({notes.length})
            </div>
            {notes.map((n) => (
              <div
                key={n.id}
                className={`border rounded-lg p-3 text-xs space-y-1.5 ${
                  n.priority === "important" ? "border-amber-300 bg-amber-50/50" : "border-border bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{n.vnTeacherName}</span>
                  <span className="text-muted-foreground">→ {n.foreignTeacherName}</span>
                  {n.priority === "important" && (
                    <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-[10px] h-4">
                      <Star className="w-2.5 h-2.5 mr-0.5" /> Quan trọng
                    </Badge>
                  )}
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(n.createdAt).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-foreground leading-relaxed">{n.content}</p>
                {n.highlightTopics && n.highlightTopics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {n.highlightTopics.map((t, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-[10px] h-4 border-emerald-300 text-emerald-700 bg-emerald-50"
                      >
                        ⭐ {t}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                  {n.readAt ? (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      GVNN đã đọc{" "}
                      {new Date(n.readAt).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Chưa đọc
                    </span>
                  )}
                  {n.vnTeacherId === vnTeacherId && !n.readAt && (
                    <button
                      onClick={() => {
                        deleteNote(n.id);
                        toast.success("Đã xoá note");
                      }}
                      className="ml-auto text-[10px] text-rose-600 hover:underline flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" /> Xoá
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compose dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" />
              Gửi note cho {foreignTeacherName}
            </DialogTitle>
            <p className="text-xs text-muted-foreground text-left">
              Lớp <b>{className}</b> · {date} · GVNN vào lớp {foreignStartTime}–{foreignEndTime}
            </p>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Nội dung note <span className="text-rose-500">*</span>
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="VD: Practice warm-up Q&A trong slide p.3-5. Em Minh hay phát âm /θ/ sai, anh chú ý correct kỹ..."
                className="text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Topic cần nhấn mạnh (cách nhau bằng dấu phẩy)
              </label>
              <Input
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                placeholder="Warm-up Q&A, Pronunciation /θ/"
                className="text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-foreground">Mức độ:</label>
              <button
                type="button"
                onClick={() => setPriority("normal")}
                className={`px-2.5 py-1 rounded-md text-xs border transition ${
                  priority === "normal"
                    ? "bg-muted text-foreground border-border"
                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                Bình thường
              </button>
              <button
                type="button"
                onClick={() => setPriority("important")}
                className={`px-2.5 py-1 rounded-md text-xs border flex items-center gap-1 transition ${
                  priority === "important"
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-background text-amber-700 border-amber-300 hover:bg-amber-50"
                }`}
              >
                <Star className="w-3 h-3" />
                Quan trọng
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Gửi note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VnToForeignNotePanel;
