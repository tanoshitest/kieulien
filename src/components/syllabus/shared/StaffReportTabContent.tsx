import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList, BookOpen, Camera, Image as ImageIcon, X as XIcon,
  UserPlus, NotebookPen, Award, Star, Send, Users as UsersIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { students } from "@/data/mockData";

interface Props {
  classId?: string; // default CLS001
}

const StaffReportTabContent: React.FC<Props> = ({ classId = "CLS001" }) => {
  const classStudents = students.filter(s => s.classIds.includes(classId)).slice(0, 15);

  const [srLessonContent, setSrLessonContent] = useState("");
  const [srPhotos, setSrPhotos] = useState<{ id: string; url: string; caption: string }[]>([]);
  const [srSupportStudents, setSrSupportStudents] = useState<{ id: string; studentId: string; reason: string }[]>([]);
  const [srDiary, setSrDiary] = useState("");
  const [srTeacherRating, setSrTeacherRating] = useState(0);
  const [srTeacherFeedback, setSrTeacherFeedback] = useState("");
  const [srExtraNotes, setSrExtraNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onPickPhotos = (files: FileList | null) => {
    if (!files) return;
    const newOnes = Array.from(files).map(f => ({
      id: `IMG_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      url: URL.createObjectURL(f),
      caption: "",
    }));
    setSrPhotos(prev => [...prev, ...newOnes]);
    toast.success(`Đã tải lên ${newOnes.length} ảnh`);
  };

  const addSupportStudent = () => {
    setSrSupportStudents(prev => [...prev, { id: `SUP_${Date.now()}`, studentId: "", reason: "" }]);
  };

  const saveStaffReport = () => {
    if (!srLessonContent.trim()) { toast.error("Vui lòng nhập 'Hôm nay học gì'"); return; }
    toast.success("Đã lưu báo cáo học vụ!");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl px-5 py-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-foreground flex items-center gap-2">
            Báo cáo học vụ
            <Badge className="bg-violet-100 text-violet-700 text-[10px]">Chỉ Học vụ / Admin</Badge>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Báo cáo nội bộ: nội dung buổi học, ảnh lớp, học sinh cần bổ trợ, nhật ký dạy, đánh giá giáo viên
          </p>
        </div>
      </div>

      {/* 1. Hôm nay học gì */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-2">
        <label className="font-semibold text-sm text-foreground flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-violet-600" /> Hôm nay học gì <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-muted-foreground">Nội dung chính giáo viên đã dạy, hoạt động đã triển khai</p>
        <Textarea rows={4} placeholder="VD: Session 4 - Colors & Shapes. GV đã dạy 10 từ vựng màu sắc và hình khối..."
          value={srLessonContent} onChange={e => setSrLessonContent(e.target.value)} />
      </div>

      {/* 2. Ảnh lớp học */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Camera className="w-4 h-4 text-violet-600" /> Ảnh buổi học
          </label>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
            <Camera className="w-3.5 h-3.5" /> Chụp / Tải ảnh
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={e => { onPickPhotos(e.target.files); e.target.value = ""; }} />
        </div>
        {srPhotos.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-lg py-8 text-center text-muted-foreground">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Chưa có ảnh. Tải lên ảnh lớp học, hoạt động, sản phẩm HS...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {srPhotos.map(p => (
              <div key={p.id} className="relative group">
                <img src={p.url} alt="" className="w-full aspect-video object-cover rounded-lg border border-border" />
                <button onClick={() => setSrPhotos(prev => prev.filter(x => x.id !== p.id))}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <XIcon className="w-3.5 h-3.5" />
                </button>
                <Input value={p.caption} onChange={e => setSrPhotos(prev => prev.map(x => x.id === p.id ? { ...x, caption: e.target.value } : x))}
                  placeholder="Ghi chú ảnh..." className="h-7 text-xs mt-1.5" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Học sinh cần bổ trợ */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-sm text-foreground flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-violet-600" /> Học sinh cần bổ trợ
          </label>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={addSupportStudent}>
            <UserPlus className="w-3.5 h-3.5" /> Thêm HS
          </Button>
        </div>
        {srSupportStudents.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Chưa có học sinh nào cần bổ trợ.</p>
        ) : (
          <div className="space-y-2">
            {srSupportStudents.map(sup => (
              <div key={sup.id} className="flex items-center gap-2 p-2.5 bg-muted/20 rounded-lg">
                <select
                  value={sup.studentId}
                  onChange={e => setSrSupportStudents(prev => prev.map(x => x.id === sup.id ? { ...x, studentId: e.target.value } : x))}
                  className="h-9 text-sm rounded-md border border-border bg-background px-2 min-w-[160px]"
                >
                  <option value="">-- Chọn học sinh --</option>
                  {classStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <Input value={sup.reason}
                  onChange={e => setSrSupportStudents(prev => prev.map(x => x.id === sup.id ? { ...x, reason: e.target.value } : x))}
                  placeholder="Lý do (VD: Chưa thuộc từ vựng, cần dạy kèm grammar...)"
                  className="h-9 text-sm flex-1" />
                <button onClick={() => setSrSupportStudents(prev => prev.filter(x => x.id !== sup.id))}
                  className="w-8 h-8 rounded-md border border-border text-muted-foreground hover:text-red-500 hover:border-red-300 flex items-center justify-center">
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Nhật ký dạy */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-2">
        <label className="font-semibold text-sm text-foreground flex items-center gap-2">
          <NotebookPen className="w-4 h-4 text-violet-600" /> Nhật ký dạy
        </label>
        <p className="text-xs text-muted-foreground">Ghi lại diễn biến, quan sát của học vụ trong buổi học</p>
        <Textarea rows={4} placeholder="VD: GV vào lớp đúng giờ, các bé khá hào hứng. Phần game kéo dài hơn plan 5 phút..."
          value={srDiary} onChange={e => setSrDiary(e.target.value)} />
      </div>

      {/* 5. Đánh giá giáo viên */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <label className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Award className="w-4 h-4 text-violet-600" /> Đánh giá giáo viên
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Chất lượng buổi dạy:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setSrTeacherRating(n)}
                className={`w-8 h-8 transition-colors ${srTeacherRating >= n ? "text-yellow-400" : "text-muted-foreground/30"}`}>
                <Star className="w-5 h-5 fill-current" />
              </button>
            ))}
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {srTeacherRating === 0 ? "Chưa đánh giá"
              : srTeacherRating <= 2 ? "Cần cải thiện"
              : srTeacherRating === 3 ? "Đạt yêu cầu"
              : srTeacherRating === 4 ? "Tốt" : "Xuất sắc"}
          </span>
        </div>
        <Textarea rows={3} placeholder="Nhận xét về GV: phong thái, quản lý lớp, truyền đạt, xử lý tình huống..."
          value={srTeacherFeedback} onChange={e => setSrTeacherFeedback(e.target.value)} />
      </div>

      {/* 6. Ghi chú khác */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-2">
        <label className="font-semibold text-sm text-foreground flex items-center gap-2">
          <UsersIcon className="w-4 h-4 text-violet-600" /> Ghi chú khác
        </label>
        <Textarea rows={2} placeholder="Thông tin khác cần báo cho admin: phản hồi phụ huynh, sự cố cơ sở vật chất, đề xuất..."
          value={srExtraNotes} onChange={e => setSrExtraNotes(e.target.value)} />
      </div>

      {/* Submit */}
      <div className="sticky bottom-4 bg-card border border-border rounded-xl p-3 shadow-lg flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Báo cáo này chỉ <span className="font-semibold text-violet-700">Học vụ và Admin</span> xem được
        </p>
        <Button onClick={saveStaffReport} className="gap-1.5 bg-violet-600 hover:bg-violet-700">
          <Send className="w-4 h-4" /> Gửi báo cáo học vụ
        </Button>
      </div>
    </motion.div>
  );
};

export default StaffReportTabContent;
