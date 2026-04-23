import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotebookPen, Save, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/contexts/RoleContext";
import { useSyllabusFeatures } from "@/contexts/SyllabusFeaturesContext";

interface Props {
  classScheduleId: string;
  classId: string;
  syllabusSessionId: string;
  teacherName?: string;
}

const TeacherNotePanel: React.FC<Props> = ({ classScheduleId, classId, syllabusSessionId, teacherName = "Ms. Thu Trang" }) => {
  const { isTeacher, isAdmin, isTA, isParent } = useRole();
  const { teacherNotes, upsertTeacherNote } = useSyllabusFeatures();

  // Phụ huynh không xem được
  if (isParent) return null;

  const existing = teacherNotes.find(n => n.classScheduleId === classScheduleId && n.syllabusSessionId === syllabusSessionId);
  const [progress, setProgress] = useState(existing?.teachingProgress ?? "");
  const [extraHw, setExtraHw] = useState(existing?.extraHomework ?? "");
  const [editing, setEditing] = useState(!existing);

  useEffect(() => {
    setProgress(existing?.teachingProgress ?? "");
    setExtraHw(existing?.extraHomework ?? "");
    setEditing(!existing);
  }, [existing?.id, syllabusSessionId, classScheduleId]);

  const canEdit = isTeacher || isAdmin;

  const handleSave = () => {
    if (!progress.trim()) {
      toast.error("Vui lòng nhập tiến độ giảng dạy");
      return;
    }
    const now = new Date().toISOString();
    upsertTeacherNote({
      id: existing?.id ?? `TN_${Date.now()}`,
      classScheduleId, classId, syllabusSessionId,
      teacherId: "USR001", teacherName,
      teachingProgress: progress, extraHomework: extraHw,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    toast.success("Đã lưu Teacher Note");
    setEditing(false);
  };

  return (
    <Card className="border-purple-200">
      <CardHeader className="bg-gradient-to-br from-purple-50 to-fuchsia-50">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <NotebookPen className="w-5 h-5 text-purple-600" /> Teacher Note (Học vụ xem)
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px] gap-1 border-purple-300 text-purple-700">
              <EyeOff className="w-3 h-3" /> Phụ huynh không xem
            </Badge>
            {(isTA && !canEdit) && <Badge className="text-[10px] bg-blue-100 text-blue-700 gap-1"><Eye className="w-3 h-3" />Chế độ xem</Badge>}
          </div>
        </div>
        <p className="text-xs text-purple-700/80">
          GV ghi nhận tiến trình thực tế dạy buổi này + BTVN bổ sung (nếu có). Học vụ xem để theo dõi tiến độ giảng dạy lớp.
        </p>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {!editing && existing ? (
          <>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Tiến độ giảng dạy thực tế</p>
              <p className="text-sm whitespace-pre-wrap leading-relaxed bg-muted/30 p-3 rounded">{existing.teachingProgress}</p>
            </div>
            {existing.extraHomework && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">BTVN bổ sung</p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed bg-amber-50/40 p-3 rounded border border-amber-100">{existing.extraHomework}</p>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground">
              Cập nhật {new Date(existing.updatedAt).toLocaleString("vi-VN")} · GV {existing.teacherName}
            </p>
            {canEdit && (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Chỉnh sửa</Button>
            )}
          </>
        ) : canEdit ? (
          <>
            <div>
              <label className="text-xs font-semibold mb-1 block">Tiến độ giảng dạy thực tế *</label>
              <Textarea rows={4} value={progress} onChange={e => setProgress(e.target.value)} placeholder="VD: Đã dạy đủ vocab + grammar. Phần role-play kéo dài hơn dự kiến do HS hứng thú..." />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">BTVN bổ sung (nếu có)</label>
              <Textarea rows={3} value={extraHw} onChange={e => setExtraHw(e.target.value)} placeholder="VD: Yêu cầu HS quay thêm 1 video kể về gia đình..." />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleSave} className="bg-purple-600 hover:bg-purple-700"><Save className="w-3 h-3 mr-1" />Lưu</Button>
              {existing && <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Huỷ</Button>}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground italic">GV chưa tạo note cho buổi này.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherNotePanel;
