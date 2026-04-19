import React, { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { classes, students, users, documents } from "@/data/mockData";
import { 
  CheckCircle, XCircle, Clock, AlertCircle, 
  BookOpen, Star, MessageSquare, ClipboardList, LayoutDashboard,
  ArrowRight, Share2, Layout, Users, CalendarCheck, Award,
  Search, FileSpreadsheet, Calendar, FolderOpen, FileText, Download,
  MoreVertical, FileCode, FileImage, File, MousePointerClick, ChevronDown,
  Check, Pencil, Paperclip, UploadCloud, Loader2, Plus, Trash2,
  GraduationCap, BookMarked, Camera, AlertTriangle, ThumbsUp, ThumbsDown, ImageIcon, Send, ShieldCheck, Lightbulb
} from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ClassDetailContentProps {
  id?: string;
  backButton?: boolean;
}

const mockSessions = [
  { id: 1, title: "MOVERS: Unit 01", hw: "1. Movie Vids. 2. Toefl P.32", date: "24/03/2026" },
  { id: 2, title: "GRAMMAR: Unit 18", hw: "1. 10 Sentences. 2. Quiz Online", date: "28/03/2026" },
  { id: 3, title: "SPEAKING: Pets", hw: "1. Record Pet Story. 2. Vocab", date: "31/03/2026" },
  { id: 4, title: "READING: Fun Fair", hw: "1. Read P.12. 2. Answer Qs", date: "04/04/2026" },
  { id: 5, title: "WRITING: My Day", hw: "1. Write daily routine. 2. Review", date: "07/04/2026" },
  { id: 6, title: "LISTENING: Numbers", hw: "1. Dictation 1. 2. Listen P.5", date: "11/04/2026" },
  { id: 7, title: "REVIEW: Midterm", hw: "1. Review Unit 1-5. 2. Prep", date: "14/04/2026" },
  { id: 8, title: "TEST: Progress 1", hw: "1. Self-reflection. 2. Exam Correction", date: "18/04/2026" },
  { id: 9, title: "STORY: Red Riding", hw: "1. Retell story. 2. Character Drawing", date: "21/04/2026" },
  { id: 10, title: "PROJECT: World Map", hw: "1. Group poster. 2. Presentation", date: "25/04/2026" },
];

export const ClassDetailContent: React.FC<ClassDetailContentProps> = ({ id: propId }) => {
  const navigate = useNavigate();
  const { id: urlId } = useParams();
  const id = propId || urlId;
  const { role, isParent } = useRole();
  
  const [activeTab, setActiveTab] = useState<"overview" | "report" | "documents" | "academic">("report");
  const [selectedSessionId, setSelectedSessionId] = useState(1);
  const [showSessionMenu, setShowSessionMenu] = useState(false);
  const sessionMenuRef = useRef<HTMLDivElement>(null);
  
  const [submittingIds, setSubmittingIds] = useState<Record<number, boolean>>({});
  const [demoSubmittedIds, setDemoSubmittedIds] = useState<Record<number, boolean>>({});
  const [attendanceOverrides, setAttendanceOverrides] = useState<Record<string, string>>({});
  const [gradeOverrides, setGradeOverrides] = useState<Record<string, string>>({});
  
  // Dynamic Column State
  const [customColumns, setCustomColumns] = useState<{ id: string; name: string }[]>([]);
  const [isAddColModalOpen, setIsAddColModalOpen] = useState(false);
  const [newColName, setNewColName] = useState("");

  const handleAddColumn = () => {
    if (!newColName.trim()) return;
    const id = `col-${Date.now()}`;
    setCustomColumns(prev => [...prev, { id, name: newColName.trim().toUpperCase() }]);
    setNewColName("");
    setIsAddColModalOpen(false);
    toast.success(`Đã thêm cột điểm: ${newColName.toUpperCase()}`);
  };

  const handleDeleteColumn = (colId: string, colName: string) => {
    setCustomColumns(prev => prev.filter(c => c.id !== colId));
    toast.info(`Đã xoá cột: ${colName}`);
  };

  // HW Edit State
  const [hwOverrides, setHwOverrides] = useState<Record<number, string>>({});
  const [isHwDialogOpen, setIsHwDialogOpen] = useState(false);
  const [tempHwValue, setTempHwValue] = useState("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sessionMenuRef.current && !sessionMenuRef.current.contains(event.target as Node)) {
        setShowSessionMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleStatus = (idKey: string, studentName: string) => {
    if (isParent) return;
    const statuses = ["Đúng giờ", "Đi muộn", "Vắng mặt"];
    const current = attendanceOverrides[idKey] || "Đúng giờ";
    const next = statuses[(statuses.indexOf(current) + 1) % statuses.length];
    setAttendanceOverrides(prev => ({ ...prev, [idKey]: next }));
    toast.success(`Cập nhật: ${studentName} -> ${next}`);
  };

  const handleParentUpload = (sId: number) => {
    setSubmittingIds(prev => ({ ...prev, [sId]: true }));
    setTimeout(() => {
      setSubmittingIds(prev => ({ ...prev, [sId]: false }));
      setDemoSubmittedIds(prev => ({ ...prev, [sId]: true }));
      toast.success(`Nộp bài tập buổi ${sId} thành công!`);
    }, 1500);
  };


  const handleEditComment = (name: string) => {
    if (role === 'parent') return;
    toast.info(`Sửa nhận xét cho: ${name}`);
  };

  const handleOpenHwDialog = () => {
    setTempHwValue(hwOverrides[selectedSessionId] || selectedSession.hw);
    setIsHwDialogOpen(true);
  };

  const handleSaveHw = () => {
    setHwOverrides(prev => ({ ...prev, [selectedSessionId]: tempHwValue }));
    setIsHwDialogOpen(false);
    toast.success(`Đã cập nhật bài tập cho Buổi ${selectedSessionId}`);
  };

  const selectedSession = useMemo(() => 
    mockSessions.find(s => s.id === selectedSessionId) || mockSessions[0], 
  [selectedSessionId]);

  const classData = useMemo(() => {
    if (!id) return null;
    return classes.find((c) => c.id.toUpperCase() === id.toUpperCase());
  }, [id]);
  
  const classStudents = useMemo(() => {
    if (!classData) return [];
    const allInClass = students.filter((s) => 
      s.classIds && s.classIds.some(cid => cid.toUpperCase() === classData.id.toUpperCase())
    );
    if (isParent) return allInClass.filter(s => s.id === "STU011");
    return allInClass;
  }, [classData, isParent]);

  const classDocuments = useMemo(() => {
    if (!classData) return [];
    return documents.filter((doc) =>
      doc.classId === "all" || doc.classId.toUpperCase() === classData.id.toUpperCase()
    );
  }, [classData]);

  // ============ MOCK: Báo cáo học vụ (Admin check lớp) ============
  // Mỗi buổi học có 1 báo cáo học vụ do Admin/Học vụ tạo sau khi quan sát lớp
  const academicReportsData: Record<number, {
    id: string;
    sessionId: number;
    auditorName: string;          // Tên admin/học vụ check lớp
    auditorAvatar: string;
    visitedAt: string;            // "24/03/2026 18:15"
    overallRating: 1 | 2 | 3 | 4 | 5;  // Xếp loại tổng buổi học
    teachingProgress: string;      // GV dạy gì hôm nay
    studentEngagement: string;     // Nhận xét tiếp thu của HS
    classroomAtmosphere: string;   // Không khí lớp / kỷ luật
    diaryPhotos: { url: string; caption: string }[];   // Ảnh nhật ký lớp
    needSupportStudents: { studentId: string; reason: string; suggestedAction: string }[];  // HS cần bổ trợ
    teacherFeedback: string;       // Góp ý cho giáo viên
    nextActions: string[];         // Việc cần làm tiếp theo
    parentNoticeNeeded: boolean;   // Có cần thông báo PH không
    status: "draft" | "submitted" | "acknowledged"; // Trạng thái báo cáo
  }> = {
    1: {
      id: "AR-001",
      sessionId: 1,
      auditorName: "Ms. Phương Anh",
      auditorAvatar: "PA",
      visitedAt: "24/03/2026 18:15",
      overallRating: 4,
      teachingProgress: "GV đã hoàn thành 100% nội dung Movers Unit 01 (vocabulary + listening). Slide trình bày rõ ràng, có sử dụng flashcard tương tác. Tốc độ giảng phù hợp với trình độ lớp.",
      studentEngagement: "Đa số HS tiếp thu tốt 80–90% bài. Nhóm HS đầu lớp (Đăng Khoa, Bảo Thư) trả lời chính xác >90% câu hỏi vocab. Tuy nhiên có 2 HS bị xao nhãng giữa giờ, cần GV gọi tên thường xuyên hơn.",
      classroomAtmosphere: "Không khí sôi nổi, HS chủ động phát biểu. Phần warm-up chơi game 'Simon says' được hưởng ứng tích cực. Kỷ luật tốt, không có HS gây ồn.",
      diaryPhotos: [
        { url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop", caption: "HS làm bài tập nhóm Unit 01" },
        { url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&h=300&fit=crop", caption: "Bảng nội dung GV viết" },
        { url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=300&fit=crop", caption: "Góc trưng bày flashcard tự làm" },
      ],
      needSupportStudents: [
        { studentId: "STU003", reason: "Phát âm 'th' chưa chuẩn, hay nhầm với 't'", suggestedAction: "Bổ trợ 1-1 30 phút phonics tuần tới" },
        { studentId: "STU007", reason: "Không hoàn thành BTVN 2 buổi liên tiếp", suggestedAction: "Gọi PH trao đổi, kèm lại Unit 01 vocab" },
      ],
      teacherFeedback: "GV Thu Trang quản lớp tốt, năng lượng cao. Đề xuất: tăng thêm 5 phút phần ôn tập cuối buổi để chốt từ vựng cốt lõi. Cân nhắc ghép cặp HS yếu - HS giỏi để tăng tương tác.",
      nextActions: [
        "Lên lịch bổ trợ phonics cho STU003 vào thứ 5 tuần sau",
        "Gọi PH STU007 trong 24h tới",
        "Order thêm 10 bộ flashcard Unit 01 cho lớp",
      ],
      parentNoticeNeeded: true,
      status: "submitted",
    },
    2: {
      id: "AR-002",
      sessionId: 2,
      auditorName: "Mr. Quang Huy",
      auditorAvatar: "QH",
      visitedAt: "28/03/2026 17:50",
      overallRating: 5,
      teachingProgress: "Hoàn thành đầy đủ Grammar Unit 18 (Present Perfect). GV chuẩn bị bài giảng kỹ, có handout in sẵn cho mỗi HS.",
      studentEngagement: "100% HS tham gia, không khí tích cực. Test nhanh cuối giờ đạt trung bình 8.5/10.",
      classroomAtmosphere: "Lớp học rất tập trung, GV điều phối nhịp nhàng giữa giảng và practice.",
      diaryPhotos: [
        { url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop", caption: "Test nhanh cuối buổi" },
      ],
      needSupportStudents: [],
      teacherFeedback: "Buổi học mẫu mực, đề xuất quay video làm tư liệu training cho GV mới.",
      nextActions: ["Quay video tư liệu buổi học mẫu", "Khen thưởng GV tháng này"],
      parentNoticeNeeded: false,
      status: "acknowledged",
    },
  };
  const currentAcademicReport = academicReportsData[selectedSessionId];
  // ============ /MOCK ============

  const stats = [
    { label: "Sĩ số học sinh", value: `${classStudents.length}/12`, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Tỉ lệ chuyên cần", value: "94%", icon: CalendarCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Điểm trung bình", value: "8.2", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "BTVN hoàn thành", value: "88%", icon: ClipboardList, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  const recentActivity = [
    { time: "2 giờ trước", msg: `GV. Ms. Thu Trang đã cập nhật báo cáo học tập buổi ${selectedSessionId}.`, type: "report" },
    { time: "Hôm qua", msg: "Hệ thống đã tự động gửi báo cáo học tập tuần cho Phụ huynh.", type: "system" },
    { time: "2 ngày trước", msg: "Đã thiết lập lịch thi Mini Test 4 vào ngày 30/03.", type: "exam" },
  ];

  const allTabs = [
    { id: "overview", label: "Tổng quan", icon: LayoutDashboard, teacherOnly: true },
    { id: "report", label: "Báo cáo buổi học", icon: CalendarCheck },
    { id: "documents", label: "Tài liệu", icon: FolderOpen, teacherOnly: true },
    { id: "academic", label: "Báo cáo học vụ", icon: ShieldCheck, teacherOnly: true },
  ];

  const filteredTabs = allTabs.filter(tab => !isParent || !tab.teacherOnly);

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf": return <FileText className="w-5 h-5 text-rose-500" />;
      case "docx": return <FileText className="w-5 h-5 text-blue-500" />;
      case "xlsx": return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      case "pptx": return <FileText className="w-5 h-5 text-orange-500" />;
      default: return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  if (!classData) {
    return (
      <div className="p-10 text-center bg-background h-screen flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-amber-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800">Lớp học không tìm thấy</h2>
        <button onClick={() => navigate("/schedule")} className="px-8 py-3 mt-6 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:shadow-lg transition-all active:scale-95 text-xs">
          ← Quay lại danh sách lớp
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden relative font-sans">
      {/* HEADER SECTION */}
      <div className="bg-white border-b shadow-md z-[100] shrink-0">
        <div className="grid grid-cols-3 border-b border-slate-100 text-center">
          <div className="px-6 py-2 border-r border-slate-100 flex items-center justify-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lịch học</span>
            <span className="text-[11px] font-black uppercase tracking-tight text-slate-700">Thứ 3 - Thứ 7</span>
          </div>
          <div className="px-6 py-2 border-r border-slate-100 flex items-center justify-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Giảng viên</span>
            <span className="text-[11px] font-black uppercase tracking-tight text-primary">Ms. Thu Trang</span>
          </div>
          <div className="px-6 py-2 flex items-center justify-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày học</span>
            <span className="text-[11px] font-black uppercase tracking-tight text-slate-700">{selectedSession.date}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 bg-slate-50/30 border-b border-slate-100 h-[72px]">
          <div className="border-r border-slate-100 flex flex-col items-center justify-center px-4 overflow-hidden">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Tên lớp học</p>
            <span className="font-black text-slate-800 uppercase text-xs tracking-tight text-center truncate w-full">
              {classData.course}
            </span>
          </div>
          <div className="col-span-2 border-r border-slate-100 flex flex-col items-stretch relative">
            <div className="flex items-center justify-center pt-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Nội dung bài giảng</span>
            </div>
            <div className="flex-1 flex items-center justify-center px-10 gap-6">
              <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm relative" ref={sessionMenuRef}>
                 
                 <div className="min-w-[120px] text-center relative">
                   <button 
                    onClick={() => setShowSessionMenu(!showSessionMenu)}
                    className="flex items-center gap-2 group hover:bg-slate-50 px-3 py-1 rounded-lg transition-all w-full justify-center"
                   >
                     <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 leading-none">
                       Buổi {selectedSession.id} / 10
                     </span>
                     <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${showSessionMenu ? 'rotate-180 text-primary' : ''}`} />
                   </button>
                   
                   {showSessionMenu && (
                     <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[150] overflow-hidden p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                       <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                         <div className="px-3 py-2 border-b border-slate-50 mb-1 sticky top-0 bg-white z-10">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Danh sách buổi học</p>
                         </div>
                         {mockSessions.map((s) => (
                           <button 
                             key={s.id}
                             onClick={() => {
                               setSelectedSessionId(s.id);
                               setShowSessionMenu(false);
                               toast.success(`Chuyển sang Buổi ${s.id}`);
                             }}
                             className={`w-full px-4 py-3 rounded-xl flex items-center justify-between text-left hover:bg-slate-50 transition-all group ${selectedSessionId === s.id ? 'bg-primary/5' : ''}`}
                           >
                             <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors ${selectedSessionId === s.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                                   {s.id}
                                </div>
                                <div>
                                  <p className={`text-[10px] font-black uppercase tracking-tight ${selectedSessionId === s.id ? 'text-slate-900' : 'text-slate-500'}`}>{s.title}</p>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{s.date}</p>
                                </div>
                             </div>
                             {selectedSessionId === s.id && <CheckCircle className="w-4 h-4 text-primary" />}
                           </button>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>

              </div>

              <div className="flex items-center border-l border-slate-200 pl-6 ml-2">
                 <span className="font-black uppercase tracking-tight text-[11px] text-slate-700">
                   {selectedSession.title}
                 </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center px-4 relative group">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Bài tập về nhà</p>
            <div className="text-center w-full px-2">
               <p className="text-[10px] font-bold text-slate-600 tracking-tight uppercase line-clamp-2 leading-tight">
                 {hwOverrides[selectedSessionId] || selectedSession.hw}
               </p>
               {!isParent && (
                 <button 
                  onClick={handleOpenHwDialog}
                  className="absolute top-1 right-1 p-1 bg-white border border-slate-100 shadow-sm text-slate-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-all rounded-md"
                 >
                   <Pencil className="w-3 h-3" />
                 </button>
               )}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-white border-b border-slate-100">
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
            {filteredTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                }`}
              >
                <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? "text-primary" : "text-slate-500"}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT Area */}
      <div className="flex-1 bg-slate-50/50 overflow-hidden relative flex flex-col">
        <div className={`flex-1 flex flex-col w-full max-w-screen-2xl mx-auto ${activeTab === 'report' ? 'px-4 md:px-6 pt-0' : 'p-4 md:p-6'} space-y-6 pb-20 overflow-auto no-scrollbar`}>
          
          {/* Lesson Report Tab */}
          {activeTab === "report" && (
            <div className="flex-1 bg-white border border-b-0 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex-1 overflow-auto no-scrollbar relative min-h-[400px]">
                 <table className="w-full text-left border-collapse relative">
                   <thead className="z-40 sticky top-0">
                     <tr className="text-slate-400 font-black uppercase tracking-widest bg-slate-50 border-b border-slate-100 text-[10px]">
                       <th className="px-6 py-4 text-center w-12 text-slate-300">STT</th>
                       <th className="px-6 py-4 min-w-[180px]">
                         {isParent ? 'Buổi học' : 'Học viên'}
                       </th>
                        <th className="px-6 py-4 text-center w-32 relative group/status">
                          <div className="flex items-center justify-center gap-1">
                            <span>Trạng thái</span>
                            {!isParent && (
                              <button 
                                onClick={() => setIsAddColModalOpen(true)}
                                className="p-1 bg-primary text-white rounded-md opacity-0 group-hover/status:opacity-100 transition-all hover:scale-110 shadow-sm"
                                title="Thêm cột điểm"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </th>
                        {customColumns.map((col) => (
                           <th key={col.id} className="px-3 py-4 text-center min-w-[90px] bg-slate-100/30 text-slate-500 border-x border-slate-100 italic relative group/col">
                             {col.name}
                             {!isParent && (
                               <button 
                                onClick={() => handleDeleteColumn(col.id, col.name)}
                                className="absolute -top-1 -right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover/col:opacity-100 transition-all shadow-md"
                               >
                                 <Trash2 className="w-2 h-2" />
                               </button>
                             )}
                           </th>
                        ))}
                        <th className="px-4 py-4 text-center w-32">BÀI TẬP NỘP</th>
                       <th className="px-4 py-4 text-center w-28 bg-primary/5 text-primary border-x border-slate-100 italic">CHẤM ĐIỂM</th>
                       <th className="px-3 py-4 text-center w-16 bg-slate-100/30">HW/43</th>
                       <th className="px-3 py-4 text-center w-16 bg-slate-100/30">L/28</th>
                       <th className="px-3 py-4 text-center w-16 bg-primary/5 text-primary border-r border-slate-100">MINI</th>
                       <th className="px-6 py-4 min-w-[350px]">
                         {isParent ? 'Nhận xét của GV' : `Nhận xét buổi ${selectedSessionId}`}
                       </th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 bg-white">
                      {classStudents.map((item, idx) => {
                        const sId = selectedSessionId;
                        const studentId = (item as any).id;
                        const student = students.find(s => s.id === studentId);
                        const sIdx = students.findIndex(s => s.id === studentId);
                        const seed = (sId + sIdx) % 10;
                        const initialStatus = seed === 0 ? "Vắng mặt" : seed === 5 ? "Đi muộn" : "Đúng giờ";
                        const idKey = isParent ? `session-${sId}` : `student-${studentId}-b${sId}`;
                        const status = attendanceOverrides[idKey] || initialStatus;
                        const hasSubmittedFile = seed % 2 === 0 && seed % 3 !== 0;
                        const score_hw = 43 - (seed % 3);
                        const score_reading = 28 - (seed % 2);
                        const score_mini = seed > 5 ? 'A+' : 'B';
                        const getDetailedFeedback = (sessionId: number) => {
                          const feeedbackSamples: Record<number, string> = {
                            1: "Hôm nay con tiếp thu bài rất nhanh, nắm vững kiến thức về Unit 01. Trong giờ con hăng hái phát biểu và tương tác tốt với giáo viên. Phần bài tập về nhà con hoàn thành đầy đủ, trình bày sạch đẹp và không sai lỗi chính tả nào. Tuy nhiên con cần chú ý hơn về phần phát âm các âm đuôi (ending sounds) để hoàn thiện kỹ năng Speaking. Ba mẹ hãy tiếp tục động viên con duy trì tinh thần học tập tuyệt vời này nhé!",
                            2: "Buổi học hôm nay tập trung vào ngữ pháp Unit 18, con đã hiểu bản chất vấn đề và áp dụng tốt vào các bài tập thực hành trên lớp. Con rất tích cực trong các hoạt động đội nhóm và dẫn dắt các bạn hoàn thành nhiệm vụ. Về nhà ba mẹ hãy nhắc con làm bài tập Quiz Online để củng cố lại kiến thức thì hiện tại hoàn thành. Nhìn chung thái độ học tập của con rất nghiêm túc và cầu tiến. Chúc mừng con đã có một buổi học xuất sắc!",
                            3: "Hôm nay lớp học về chủ đề Speaking: Pets, con rất tự tin khi chia sẻ về thú cưng của mình trước cả lớp. Vốn từ vựng của con ngày càng phong phú và cách diễn đạt tự nhiên hơn trước rất nhiều. Con đã biết cách sử dụng các từ nối để câu văn thêm sinh động. Phần bài tập ghi âm (Record Story) ba mẹ hãy giúp con quay video để giáo viên có thể nhận xét kỹ hơn về ngôn ngữ cơ thể. Con hãy tiếp tục phát huy sự tự tin này nhé!",
                            4: "Trong buổi học Reading hôm nay, con đã thực hiện rất tốt các kỹ năng Skimming và Scanning để tìm thông tin nhanh trong đoạn văn. Tuy nhiên có một số từ vựng mới về chủ đề Fun Fair con còn hơi lúng túng, giáo viên đã hướng dẫn con cách đoán nghĩa từ ngữ cảnh. Con cần dành thời gian ôn lại danh sách từ vựng Unit 4 ở trang 12. Về nhà con hãy đọc lại bài khóa 3 lần để rèn luyện tốc độ đọc và sự trôi chảy. Cố gắng lên con nhé!",
                            5: "Buổi học Writing về chủ đề My Day đã giúp con hệ thống lại cách viết về các hoạt động hàng ngày một cách logic. Con đã biết cách sử dụng các trạng từ chỉ tần suất (always, usually, sometimes) rất chính xác. Bài viết của con có độ dài vừa đủ, ý tưởng phong phú và có sự sáng tạo cá nhân. Con chỉ cần lưu ý thêm về cách dùng mạo từ 'a, an, the' để câu văn hoàn hảo hơn. Đây là một sự tiến bộ lớn so với các tuần trước. Cô rất tự hào về con!",
                            6: "Hôm nay con đã hoàn thành xuất sắc các bài tập Listening về chủ đề Numbers, không bị nhầm lẫn giữa các con số lớn. Con có khả năng tập trung cao độ và phản xạ nghe rất tốt. Phần Dictation con viết gần như chính xác tuyệt đối, chỉ sai duy nhất một chỗ nhỏ về số thứ tự. Ba mẹ hãy cho con nghe thêm các podcast tiếng Anh ngắn dành cho trẻ em để duy trì phản xạ tai nghe. Con đang đi đúng lộ trình và tiến bộ rất đều đặn.",
                            7: "Buổi Review chuẩn bị cho kỳ thi Midterm đã giúp con rà soát lại toàn bộ kiến thức từ Unit 1 đến Unit 5. Con nắm vững khoảng 90% nội dung đã học, chỉ còn một chút nhầm lẫn ở phần giới từ chỉ thời gian. Giáo viên đã giúp con ghi chú lại các điểm cần lưu ý để con ôn tập kỹ hơn tại nhà. Ba mẹ hãy cùng con xem lại các ghi chú trong vở để con có tâm lý tự tin nhất trước kỳ thi sắp tới. Con đã chuẩn bị rất kỹ rồi!",
                            8: "Kết quả bài Test Progress 1 của con rất ấn tượng, đặc biệt là phần kỹ năng nói và đọc. Con đã sửa được hầu hết các lỗi sai từ lần kiểm tra trước và thể hiện sự cẩn thận trong từng câu trả lời. Sau khi chấm bài, giáo viên đã dành thời gian hướng dẫn con cách sửa lỗi và hoàn thiện bài làm. Đây là minh chứng rõ nhất cho sự nỗ lực không ngừng nghỉ của con suốt thời gian qua. Con xứng đáng nhận được một lời khen ngợi lớn từ gia đình!",
                            9: "Buổi học kể chuyện Red Riding Hood đã mang lại cho con nhiều hứng khởi, con hóa thân vào nhân vật rất nhập tâm và sinh động. Khả năng kể chuyện (Storytelling) của con là một thế mạnh cần được phát huy thêm. Con biết cách thay đổi tông giọng và thể hiện cảm xúc qua từng lời nói, khiến bài nói trở nên thu hút. Phần vẽ tranh nhân vật con cũng làm rất tỉ mỉ và sáng tạo. Con đã có một ngày học tập thật sự bùng nổ và hiệu quả!",
                            10: "Kết thúc khóa học với Project World Map, con đã thể hiện khả năng làm việc nhóm tuyệt vời và kỹ năng thuyết trình trước đám đông. Bản đồ của nhóm con không chỉ chính xác mà còn rất đẹp mắt và đầy màu sắc. Con đã thuyết trình tự tin, rõ ràng và trả lời tốt các câu hỏi vấn đáp từ phía giáo viên. Đây là một kết quả hoàn hảo để khép lại một chặng đường học tập đầy ý nghĩa. Chúc mừng con đã hoàn thành xuất sắc mục tiêu đề ra!"
                          };
                          return feeedbackSamples[sessionId] || feeedbackSamples[1];
                        };

                        const feedbackText = getDetailedFeedback(sId);
                        if (!student) return null;
                        return (
                          <tr key={isParent ? `session-${sId}` : `student-${studentId}`} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5 border-r border-slate-50 text-center font-bold text-slate-300 text-[11px]">{idx + 1}</td>
                            <td className="px-6 py-5 border-r border-slate-50">
                              <div className="flex items-center gap-3">
                                 <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-[11px] uppercase border border-slate-200">
                                   {student.avatar[0]}
                                 </div>
                                 <div className="flex flex-row items-center gap-2">
                                   <div className="font-black text-slate-700 uppercase tracking-tight text-[11px] whitespace-nowrap">{student.name}</div>
                                   <div className="text-[8px] text-slate-300 font-black tracking-widest uppercase italic whitespace-nowrap">
                                     {isParent ? `( Buổi ${sId} )` : `[ ID: ${student.id} ]`}
                                   </div>
                                 </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 border-r border-slate-50 text-center">
                               <button 
                                 onClick={() => handleToggleStatus(idKey, student.name)}
                                 disabled={isParent}
                                 className={`px-3 py-1 bg-white whitespace-nowrap font-black uppercase text-[9px] border tracking-widest transition-all rounded-full ${
                                   status === 'Vắng mặt' ? 'bg-rose-50 text-rose-500 border-rose-100' : 
                                   status === 'Đi muộn' ? 'bg-amber-50 text-amber-500 border-amber-100' : 
                                   'bg-emerald-50 text-emerald-500 border-emerald-100'
                                 } ${!isParent ? 'cursor-pointer hover:shadow-sm' : 'cursor-default'}`}
                               >
                                 {status}
                               </button>
                            </td>
                            {customColumns.map((col) => (
                              <td key={col.id} className="px-3 py-5 border-r border-slate-50 text-center bg-slate-50/20">
                                <input 
                                  type="text" 
                                  placeholder="..."
                                  value={gradeOverrides[`${studentId}-${sId}-${col.id}`] || ""}
                                  onChange={(e) => setGradeOverrides(prev => ({ ...prev, [`${studentId}-${sId}-${col.id}`]: e.target.value }))}
                                  className="w-14 h-8 text-center bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                                />
                              </td>
                            ))}
                            <td className="px-4 py-5 border-r border-slate-50 text-center">
                               {(hasSubmittedFile || demoSubmittedIds[sId]) ? (
                                 <div className="inline-flex items-center gap-2 px-2 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-primary transition-all cursor-pointer group/file">
                                    <Paperclip className={`w-3 h-3 ${demoSubmittedIds[sId] ? 'text-primary' : 'text-slate-400'}`} />
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${demoSubmittedIds[sId] ? 'text-primary' : 'text-slate-600'}`}>
                                      {demoSubmittedIds[sId] ? `FINAL_B${sId}` : `ATTACH_B${sId}`}
                                    </span>
                                 </div>
                               ) : isParent ? (
                                 <button onClick={() => handleParentUpload(sId)} disabled={submittingIds[sId]} className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50 whitespace-nowrap">
                                    {submittingIds[sId] ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                                    <span className="text-[9px] font-black uppercase tracking-widest">Nộp bài</span>
                                 </button>
                               ) : (
                                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">N/A</span>
                               )}
                            </td>
                            <td className="px-3 py-5 border-r border-slate-100 text-center bg-primary/5">
                               <input 
                                 type="text" 
                                 placeholder="..."
                                 value={gradeOverrides[`${studentId}-${sId}`] || ""}
                                 onChange={(e) => setGradeOverrides(prev => ({ ...prev, [`${studentId}-${sId}`]: e.target.value }))}
                                 className="w-14 h-8 text-center bg-white border border-primary/20 rounded-lg text-xs font-black text-primary placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                               />
                            </td>
                            <td className="px-3 py-5 border-r border-slate-50 text-center font-black text-slate-500 bg-slate-50/50 text-[11px]">{score_hw}</td>
                            <td className="px-3 py-5 border-r border-slate-50 text-center font-black text-slate-500 bg-slate-50/50 text-[11px]">{score_reading}</td>
                            <td className="px-3 py-5 border-r border-slate-100 text-center font-black text-primary bg-primary/5 uppercase tracking-widest text-[11px]">{score_mini}</td>
                            <td className="px-8 py-5 text-slate-600 leading-relaxed font-bold relative group">
                             <div className="flex items-start justify-between gap-6 py-1">
                                 <span className="text-[10px] uppercase font-bold text-slate-600 leading-[1.6] text-justify">{feedbackText}</span>
                                 {!isParent && (
                                   <button onClick={() => handleEditComment(student.name)} className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-400 hover:text-primary transition-all opacity-0 group-hover:opacity-100 shrink-0">
                                     <Pencil className="w-3 h-3" />
                                   </button>
                                 )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                   </tbody>
                 </table>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {!isParent && activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 {stats.map((stat, i) => (
                   <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow text-center justify-center">
                     <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6" />
                     </div>
                     <div className="text-center">
                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">{stat.label}</p>
                        <p className="text-xl font-black text-slate-800">{stat.value}</p>
                     </div>
                   </div>
                 ))}
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-center">
                    <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-6 border-b border-slate-50 pb-4 flex items-center justify-center gap-2">
                       <Layout className="w-3.5 h-3.5" /> Thông tin khoá học
                    </h3>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                       {[
                         { label: "Hệ đào tạo", val: classData.course },
                         { label: "Ngày khai giảng", val: classData.startDate },
                         { label: "Lịch học", val: classData.schedule },
                         { label: "Dự kiến kết thúc", val: "20/06/2026" },
                         { label: "Trạng thái", val: "Đang diễn ra", isTag: true, tagColor: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                         { label: "Phòng học", val: "Room 302", isTag: true, tagColor: "bg-blue-50 text-blue-600 border-blue-100" }
                       ].map((item, i) => (
                         <div key={i} className="flex flex-col gap-1 items-center">
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{item.label}</p>
                            {item.isTag ? (
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${item.tagColor}`}>{item.val}</span>
                            ) : (
                              <p className="text-sm font-bold text-slate-700 uppercase tracking-tight">{item.val}</p>
                            )}
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                    <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-6 border-b border-slate-50 pb-4 flex items-center justify-center gap-2">
                       <Clock className="w-3.5 h-3.5" /> Hoạt động gần đây
                    </h3>
                    <div className="space-y-6">
                       {recentActivity.map((act, i) => (
                         <div key={i} className="flex gap-4 group justify-center items-start text-left">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${i === 0 ? 'bg-primary ring-4 ring-primary/5' : 'bg-slate-200'}`} />
                            <div className="flex-1 min-w-0">
                               <p className="text-xs font-bold text-slate-700 uppercase tracking-tight leading-snug line-clamp-2 mb-1">{act.msg}</p>
                               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{act.time}</span>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               </div>
            </div>
          )}

          {/* Documents Tab */}
          {!isParent && activeTab === "documents" && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <FolderOpen className="w-5 h-5 text-primary" />
                     <h3 className="text-[11px] font-black uppercase text-slate-700 tracking-widest">Kho tài liệu lớp học</h3>
                  </div>
                  <button className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                     <Download className="w-3.5 h-3.5" /> Tải tất cả (.zip)
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 overflow-auto max-h-[60vh] no-scrollbar">
                 {classDocuments.map((doc) => (
                   <div key={doc.id} className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-primary/40 hover:shadow-md transition-all group flex items-start gap-4 cursor-pointer">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
                         {getFileIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                         <p className="font-black text-slate-800 text-sm truncate uppercase tracking-tight mb-1">{doc.title}</p>
                         <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-3 mt-3">
                            <span className="bg-slate-50 px-1.5 py-0.5 rounded">{doc.type}</span>
                            <span>•</span>
                            <span className="text-slate-500 font-mono tracking-tighter">{doc.size}</span>
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {!isParent && activeTab === "academic" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {!currentAcademicReport ? (
                /* ---- EMPTY STATE: Chưa có báo cáo học vụ cho buổi này ---- */
                <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-1">Chưa có báo cáo học vụ</h3>
                  <p className="text-xs text-slate-500 mb-5">Buổi học này chưa được Học vụ check & lập báo cáo.</p>
                  <button
                    onClick={() => toast.success("Đã mở form tạo báo cáo học vụ (demo)")}
                    className="px-5 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg transition-all inline-flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" /> Lập báo cáo học vụ
                  </button>
                </div>
              ) : (
                <>
                  {/* ---- HEADER: Auditor + Status + Rating ---- */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-50 bg-gradient-to-r from-violet-50/60 to-fuchsia-50/40 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center font-black text-sm shadow-md">
                          {currentAcademicReport.auditorAvatar}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Học vụ check lớp</p>
                          <p className="text-sm font-black text-slate-800">{currentAcademicReport.auditorName}</p>
                          <p className="text-[11px] text-slate-500">{currentAcademicReport.visitedAt} · Mã BC: <span className="font-mono text-violet-600">{currentAcademicReport.id}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Overall Rating Stars */}
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} className={`w-4 h-4 ${n <= currentAcademicReport.overallRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          ))}
                          <span className="ml-1 text-xs font-black text-amber-700">{currentAcademicReport.overallRating}/5</span>
                        </div>
                        {/* Status Badge */}
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          currentAcademicReport.status === "acknowledged" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          currentAcademicReport.status === "submitted" ? "bg-sky-50 text-sky-700 border-sky-200" :
                          "bg-slate-50 text-slate-500 border-slate-200"
                        }`}>
                          {currentAcademicReport.status === "acknowledged" ? "✓ Đã tiếp nhận" :
                           currentAcademicReport.status === "submitted" ? "● Đã gửi" : "○ Nháp"}
                        </span>
                        {currentAcademicReport.parentNoticeNeeded && (
                          <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-200 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Cần báo PH
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ---- 2 cột: Trái = nhận xét, Phải = ảnh + actions ---- */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* CỘT TRÁI (2/3) */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Hôm nay học gì */}
                      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-50 bg-blue-50/40 flex items-center gap-2">
                          <BookMarked className="w-4 h-4 text-blue-600" />
                          <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-widest">Tiến độ giảng dạy</h4>
                        </div>
                        <p className="px-5 py-4 text-sm text-slate-700 leading-relaxed">{currentAcademicReport.teachingProgress}</p>
                      </div>

                      {/* Nhận xét tiếp thu */}
                      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-50 bg-emerald-50/40 flex items-center gap-2">
                          <ThumbsUp className="w-4 h-4 text-emerald-600" />
                          <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-widest">Khả năng tiếp thu của HS</h4>
                        </div>
                        <p className="px-5 py-4 text-sm text-slate-700 leading-relaxed">{currentAcademicReport.studentEngagement}</p>
                      </div>

                      {/* Không khí lớp */}
                      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-50 bg-amber-50/40 flex items-center gap-2">
                          <Users className="w-4 h-4 text-amber-600" />
                          <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-widest">Không khí & Kỷ luật lớp</h4>
                        </div>
                        <p className="px-5 py-4 text-sm text-slate-700 leading-relaxed">{currentAcademicReport.classroomAtmosphere}</p>
                      </div>

                      {/* HS cần bổ trợ */}
                      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-50 bg-rose-50/40 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-widest">HS cần bổ trợ ({currentAcademicReport.needSupportStudents.length})</h4>
                          </div>
                          <button
                            onClick={() => toast.info("Mở form thêm HS cần bổ trợ (demo)")}
                            className="text-[10px] font-black uppercase tracking-widest text-rose-600 hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Thêm HS
                          </button>
                        </div>
                        {currentAcademicReport.needSupportStudents.length === 0 ? (
                          <p className="px-5 py-6 text-xs text-center text-slate-400 italic">Toàn bộ HS theo kịp tiến độ — không cần bổ trợ</p>
                        ) : (
                          <div className="divide-y divide-slate-50">
                            {currentAcademicReport.needSupportStudents.map((s, i) => {
                              const stu = students.find(st => st.id === s.studentId);
                              return (
                                <div key={i} className="px-5 py-3 flex items-start gap-3">
                                  <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-black text-xs shrink-0">
                                    {stu?.avatar || s.studentId.slice(-2)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-sm font-black text-slate-800">{stu?.name || s.studentId}</span>
                                      <span className="text-[9px] font-mono text-slate-400">{s.studentId}</span>
                                    </div>
                                    <p className="text-xs text-slate-600"><b className="text-rose-600">Vấn đề:</b> {s.reason}</p>
                                    <p className="text-xs text-emerald-700 mt-0.5"><b>Đề xuất:</b> {s.suggestedAction}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Góp ý cho GV */}
                      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-50 bg-violet-50/40 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-violet-600" />
                          <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-widest">Góp ý cho Giáo viên</h4>
                        </div>
                        <p className="px-5 py-4 text-sm text-slate-700 leading-relaxed italic border-l-4 border-violet-300 mx-5 my-4 pl-3 bg-violet-50/30 rounded-r">
                          "{currentAcademicReport.teacherFeedback}"
                        </p>
                      </div>
                    </div>

                    {/* CỘT PHẢI (1/3) */}
                    <div className="space-y-4">
                      {/* Ảnh nhật ký lớp */}
                      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-slate-600" />
                            <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-widest">Nhật ký lớp ({currentAcademicReport.diaryPhotos.length})</h4>
                          </div>
                          <button
                            onClick={() => toast.info("Mở upload ảnh (demo)")}
                            className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
                          >
                            <UploadCloud className="w-3 h-3" /> Tải lên
                          </button>
                        </div>
                        {currentAcademicReport.diaryPhotos.length === 0 ? (
                          <div className="p-8 text-center text-xs text-slate-400 italic flex flex-col items-center gap-2">
                            <ImageIcon className="w-8 h-8 text-slate-200" />
                            Chưa có ảnh
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 p-4">
                            {currentAcademicReport.diaryPhotos.map((p, i) => (
                              <div key={i} className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-100 cursor-pointer hover:shadow-md transition-all">
                                <img src={p.url} alt={p.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-2 py-1.5">
                                  <p className="text-[10px] font-bold text-white truncate">{p.caption}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Việc cần làm tiếp theo */}
                      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-50 bg-indigo-50/40 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-indigo-600" />
                          <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-widest">Next Actions ({currentAcademicReport.nextActions.length})</h4>
                        </div>
                        <ul className="px-5 py-4 space-y-2">
                          {currentAcademicReport.nextActions.map((a, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">{i+1}</span>
                              <span className="flex-1 leading-relaxed">{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Footer actions */}
                      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-4 space-y-2">
                        <button
                          onClick={() => toast.success("Đã gửi báo cáo cho phụ huynh các HS cần bổ trợ")}
                          className="w-full py-2.5 rounded-xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Send className="w-3.5 h-3.5" /> Gửi PH các HS cần bổ trợ
                        </button>
                        <button
                          onClick={() => toast.success("Đã chuyển task cho GV chủ nhiệm")}
                          className="w-full py-2.5 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all flex items-center justify-center gap-2"
                        >
                          <ArrowRight className="w-3.5 h-3.5" /> Chuyển GV xử lý
                        </button>
                        <button
                          onClick={() => toast.info("Mở form chỉnh sửa báo cáo")}
                          className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Sửa báo cáo
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isHwDialogOpen} onOpenChange={setIsHwDialogOpen}>
        {/* ... existing HW dialog ... */}
      </Dialog>

      <Dialog open={isAddColModalOpen} onOpenChange={setIsAddColModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-0 overflow-hidden border-none shadow-3xl bg-white">
          <DialogHeader className="p-8 pb-4">
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-primary flex items-center gap-3">
               <Plus className="w-6 h-6 p-1.5 bg-primary/10 rounded-lg" />
               Thêm cột điểm mới
            </DialogTitle>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">ĐẶT TÊN CHO CỘT ĐIỂM SẼ HIỂN THỊ TRÊN BẢNG</p>
          </DialogHeader>
          
          <div className="px-8 py-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tên cột điểm</Label>
              <input 
                value={newColName} 
                onChange={(e) => setNewColName(e.target.value)}
                placeholder="VD: READING, LISTENING, MINI TEST 4..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                autoFocus
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all placeholder:text-slate-300"
              />
            </div>
          </div>
          
          <DialogFooter className="p-6 px-8 bg-slate-50/50 border-t border-slate-100 flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setIsAddColModalOpen(false)} 
              className="rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 px-8 h-12"
            >
              Huỷ
            </Button>
            <Button 
              onClick={handleAddColumn} 
              disabled={!newColName.trim()}
              className="rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest px-10 h-12 shadow-xl shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all flex-1"
            >
              Tạo cột
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ClassDetailPage = () => {
  return <ClassDetailContent />;
};

export default ClassDetailPage;
