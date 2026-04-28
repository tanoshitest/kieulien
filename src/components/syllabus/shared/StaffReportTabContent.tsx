import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList, BookOpen, Camera, Image as ImageIcon, X as XIcon,
  UserPlus, NotebookPen, Award, Star, Send, Users as UsersIcon,
  FileCheck2, CheckCircle2, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { students } from "@/data/mockData";
import { useRole } from "@/contexts/RoleContext";

type ReportStatus = "draft" | "pending" | "reviewed" | "published";

interface Props {
  classId?: string; // default CLS001
  readOnly?: boolean;
}

const StaffReportTabContent: React.FC<Props> = ({ classId = "CLS001", readOnly = false }) => {
  const { isAdmin, isTA } = useRole();
  const classStudents = students.filter(s => s.classIds.includes(classId)).slice(0, 15);

  // Workflow status: draft (TA tạo) → pending (TA gửi) → published (Học vụ duyệt)
  const [reportStatus, setReportStatus] = useState<ReportStatus>(readOnly ? "published" : "draft");
  const [reportMeta, setReportMeta] = useState<{ submittedAt?: string; reviewerName?: string; reviewedAt?: string }>(
    readOnly ? { submittedAt: "2026-04-22T18:30:00", reviewerName: "Ms. Linh Chi", reviewedAt: "2026-04-23T08:15:00" } : {}
  );

  // Mock data đầy đủ cho readOnly (admin/học vụ xem)
  const mockPhotos = readOnly ? [
    { id: "IMG_M1", url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400", caption: "Hoạt động flashcard nhóm 1" },
    { id: "IMG_M2", url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400", caption: "Bé Mimi thuyết trình family tree" },
    { id: "IMG_M3", url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400", caption: "Trò chơi 'Touch the shape' cuối giờ" },
  ] : [];
  const mockSupport = readOnly ? [
    { id: "SUP_M1", studentId: classStudents[2]?.id ?? "", reason: "Chưa thuộc 5/10 từ vựng tuần trước, cần kèm 30 phút" },
    { id: "SUP_M2", studentId: classStudents[5]?.id ?? "", reason: "Vắng buổi trước, cần học bù grammar 'to be'" },
  ] : [];

  const [srLessonContent, setSrLessonContent] = useState(readOnly
    ? "Buổi 4 - Colors & Shapes. GV đã dạy 10 từ vựng màu sắc và hình khối, hoạt động flashcard + trò chơi 'Touch the shape'. Các bé tham gia rất tích cực, đặc biệt phần trò chơi nhóm."
    : "");
  const [srPhotos, setSrPhotos] = useState<{ id: string; url: string; caption: string }[]>(mockPhotos);
  const [srSupportStudents, setSrSupportStudents] = useState<{ id: string; studentId: string; reason: string }[]>(mockSupport);
  const [srDiary, setSrDiary] = useState(readOnly
    ? "GV vào lớp đúng giờ 8:00. Các bé khá hào hứng với chủ đề màu sắc. Phần game kéo dài hơn plan 5 phút nhưng các bé rất vui. Bé Tom có dấu hiệu mệt cuối giờ, có thể do thiếu ngủ. GV xử lý tốt tình huống bé Mimi mất tập trung bằng cách cho làm trợ giảng."
    : "");
  const [srTeacherRating, setSrTeacherRating] = useState(readOnly ? 5 : 0);
  const [srTeacherFeedback, setSrTeacherFeedback] = useState(readOnly
    ? "GV phong thái tự tin, quản lý lớp tốt. Truyền đạt rõ ràng, biết cách kích hoạt sự tham gia của HS. Tình huống bé Tom mệt được xử lý nhẹ nhàng. Đề xuất: GV có thể chuẩn bị thêm 1-2 hoạt động dự phòng để linh hoạt thời gian."
    : "");
  const [srExtraNotes, setSrExtraNotes] = useState(readOnly
    ? "Phụ huynh bé Lily phản hồi tích cực về tiến bộ của con. Máy chiếu phòng A1 hơi mờ, đề xuất bảo trì. Đề xuất: in thêm flashcard A4 cho các bé tự luyện ở nhà."
    : "");
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
    setReportStatus("draft");
    toast.success("Đã lưu nháp báo cáo");
  };

  const submitForReview = () => {
    if (!srLessonContent.trim()) { toast.error("Vui lòng nhập 'Hôm nay học gì'"); return; }
    setReportStatus("pending");
    setReportMeta(m => ({ ...m, submittedAt: new Date().toISOString() }));
    toast.success("Đã gửi báo cáo cho Học vụ duyệt");
  };

  const reviewReport = () => {
    setReportStatus("reviewed");
    setReportMeta(m => ({ ...m, reviewerName: "Ms. Linh Chi", reviewedAt: new Date().toISOString() }));
    toast.success("Đã đánh dấu đã xem xét — có thể sửa rồi xuất bản");
  };

  const publishReport = () => {
    setReportStatus("published");
    setReportMeta(m => ({ ...m, reviewerName: "Ms. Linh Chi", reviewedAt: new Date().toISOString() }));
    toast.success("Đã xuất bản báo cáo — Admin có thể xem");
  };

  const overdue = reportStatus === "pending" && reportMeta.submittedAt
    && (Date.now() - new Date(reportMeta.submittedAt).getTime()) > 24 * 3600 * 1000;

  const statusConfig: Record<ReportStatus, { label: string; color: string; icon: React.ElementType }> = {
    draft:     { label: "Nháp",              color: "bg-slate-100 text-slate-700",    icon: NotebookPen },
    pending:   { label: "Chờ Học vụ duyệt", color: "bg-amber-100 text-amber-700",   icon: Clock },
    reviewed:  { label: "Học vụ đã xem",     color: "bg-blue-100 text-blue-700",     icon: FileCheck2 },
    published: { label: "Đã xuất bản",         color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl px-5 py-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground flex items-center gap-2 flex-wrap">
            Báo cáo học vụ
            <Badge className="bg-violet-100 text-violet-700 text-[10px]">Chỉ Học vụ / Admin</Badge>
            {(() => { const cfg = statusConfig[reportStatus]; const Icon = cfg.icon; return (
              <Badge className={`${cfg.color} text-[10px] gap-1`}>
                <Icon className="w-3 h-3" /> {cfg.label}
              </Badge>
            ); })()}
            {overdue && <Badge className="bg-rose-100 text-rose-700 text-[10px] animate-pulse">⚠ Quá 24h chưa duyệt</Badge>}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Workflow: TA tạo nháp → gửi Học vụ duyệt → Học vụ xem xét & sửa (nếu cần) → Xuất bản → Admin xem được
          </p>
          {reportMeta.submittedAt && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Gửi lúc {new Date(reportMeta.submittedAt).toLocaleString("vi-VN")}
              {reportMeta.reviewerName && ` · Duyệt bởi ${reportMeta.reviewerName} lúc ${reportMeta.reviewedAt ? new Date(reportMeta.reviewedAt).toLocaleString("vi-VN") : ""}`}
            </p>
          )}
        </div>
      </div>

      {/* 1. Hôm nay học gì */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-2">
        <label className="font-semibold text-sm text-foreground flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-violet-600" /> Hôm nay học gì <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-muted-foreground">Nội dung chính giáo viên đã dạy, hoạt động đã triển khai</p>
        <Textarea rows={4} placeholder="VD: Buổi 4 - Colors & Shapes. GV đã dạy 10 từ vựng màu sắc và hình khối..."
          value={srLessonContent} onChange={e => setSrLessonContent(e.target.value)} readOnly={readOnly} />
      </div>

      {/* 2. Ảnh lớp học */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Camera className="w-4 h-4 text-violet-600" /> Ảnh buổi học
          </label>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => fileInputRef.current?.click()} disabled={readOnly}>
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
                {!readOnly && (
                  <button onClick={() => setSrPhotos(prev => prev.filter(x => x.id !== p.id))}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                )}
                <Input value={p.caption}
                  onChange={e => setSrPhotos(prev => prev.map(x => x.id === p.id ? { ...x, caption: e.target.value } : x))}
                  placeholder="Ghi chú ảnh..." className="h-7 text-xs mt-1.5" readOnly={readOnly} />
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
          <Button size="sm" variant="outline" className="gap-1.5" onClick={addSupportStudent} disabled={readOnly}>
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
                  disabled={readOnly}
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
                  readOnly={readOnly}
                  className="h-9 text-sm flex-1" />
                {!readOnly && (
                  <button onClick={() => setSrSupportStudents(prev => prev.filter(x => x.id !== sup.id))}
                    className="w-8 h-8 rounded-md border border-border text-muted-foreground hover:text-red-500 hover:border-red-300 flex items-center justify-center">
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                )}
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
          value={srDiary} onChange={e => setSrDiary(e.target.value)} readOnly={readOnly} />
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
              <button key={n} onClick={() => !readOnly && setSrTeacherRating(n)}
                disabled={readOnly}
                className={`w-8 h-8 transition-colors ${srTeacherRating >= n ? "text-yellow-400" : "text-muted-foreground/30"} ${readOnly ? "cursor-default" : ""}`}>
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
          value={srTeacherFeedback} onChange={e => setSrTeacherFeedback(e.target.value)} readOnly={readOnly} />
      </div>

      {/* 6. Ghi chú khác */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-2">
        <label className="font-semibold text-sm text-foreground flex items-center gap-2">
          <UsersIcon className="w-4 h-4 text-violet-600" /> Ghi chú khác
        </label>
        <Textarea rows={2} placeholder="Thông tin khác cần báo cho admin: phản hồi phụ huynh, sự cố cơ sở vật chất, đề xuất..."
          value={srExtraNotes} onChange={e => setSrExtraNotes(e.target.value)} readOnly={readOnly} />
      </div>

      {/* Submit / Workflow */}
      {!readOnly && (
        <div className="sticky bottom-4 bg-card border border-border rounded-xl p-3 shadow-lg flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-muted-foreground">
            {reportStatus === "draft" && "TA: Lưu nháp hoặc gửi cho Học vụ duyệt"}
            {reportStatus === "pending" && "Đang chờ Học vụ duyệt"}
            {reportStatus === "reviewed" && "Học vụ đã xem xét — có thể sửa rồi xuất bản"}
            {reportStatus === "published" && "Báo cáo đã xuất bản"}
          </p>
          <div className="flex gap-2 flex-wrap">
            {reportStatus === "draft" && (
              <>
                <Button onClick={saveStaffReport} variant="outline" className="gap-1.5">
                  <Send className="w-4 h-4" /> Lưu nháp
                </Button>
                <Button onClick={submitForReview} className="gap-1.5 bg-violet-600 hover:bg-violet-700">
                  <Send className="w-4 h-4" /> Gửi Học vụ duyệt
                </Button>
              </>
            )}
            {reportStatus === "pending" && (isAdmin || (!isTA)) && (
              <>
                <Button onClick={reviewReport} variant="outline" className="gap-1.5 border-blue-300 text-blue-700">
                  <FileCheck2 className="w-4 h-4" /> Đánh dấu đã xem xét
                </Button>
                <Button onClick={publishReport} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  <FileCheck2 className="w-4 h-4" /> Duyệt & Xuất bản ngay
                </Button>
              </>
            )}
            {reportStatus === "reviewed" && (isAdmin || (!isTA)) && (
              <Button onClick={publishReport} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                <FileCheck2 className="w-4 h-4" /> Xuất bản
              </Button>
            )}
            {reportStatus === "published" && (
              <Badge className="bg-emerald-100 text-emerald-700 text-xs gap-1 px-3 py-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã xuất bản
              </Badge>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StaffReportTabContent;
