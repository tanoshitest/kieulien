import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Link2, Video, FileText, Zap, Star, Clock,
  CheckCircle2, ChevronDown, ChevronRight, MessageSquare, Save,
  UserCheck, Check, X, Timer, ClipboardCheck, Plus, Trash2, Pencil, ClipboardList, Calendar
} from "lucide-react";
import StaffReportTabContent from "@/components/syllabus/shared/StaffReportTabContent";
import ClassScheduleManager from "@/components/syllabus/shared/ClassScheduleManager";
import MaterialsViewer from "@/components/syllabus/shared/MaterialsViewer";
import ContentSecurityWrapper from "@/components/syllabus/shared/ContentSecurityWrapper";
import BigTestPanel from "@/components/syllabus/shared/BigTestPanel";
import TeacherNotePanel from "@/components/syllabus/shared/TeacherNotePanel";
import VnToForeignNotePanel from "@/components/syllabus/shared/VnToForeignNotePanel";
import ClassObservationPanel from "@/components/syllabus/shared/ClassObservationPanel";
import SyllabusEditRequestPanel from "@/components/syllabus/shared/SyllabusEditRequestPanel";
import TeacherEvaluationPanel from "@/components/syllabus/shared/TeacherEvaluationPanel";
import ForeignTeacherEvaluationPanel from "@/components/syllabus/shared/ForeignTeacherEvaluationPanel";
import { useSyllabusFeatures } from "@/contexts/SyllabusFeaturesContext";
import SyllabusSidebarLayout, { type NavItem } from "@/components/syllabus/shared/SyllabusSidebarLayout";
import { GameTabContent, QuizTabContent } from "@/components/syllabus/shared/GameQuizContent";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  syllabuses, classSchedules, homeworkSubmissions as initialSubmissions,
  type HomeworkSubmission, type HomeworkType, type HomeworkStatus
} from "@/data/mockData";

const TODAY = "2026-04-22";

const hwTypeLabel: Record<HomeworkType, string> = {
  video_speaking: "Video Speaking", quizizz: "Quizizz", writing: "Writing"
};
const hwTypeColor: Record<HomeworkType, string> = {
  video_speaking: "bg-purple-100 text-purple-700", quizizz: "bg-orange-100 text-orange-700", writing: "bg-blue-100 text-blue-700"
};
const hwTypeIcon: Record<HomeworkType, React.ElementType> = {
  video_speaking: Video, quizizz: Zap, writing: FileText
};
const statusConfig: Record<HomeworkStatus, { label: string; color: string }> = {
  pending: { label: "Chờ nộp", color: "bg-gray-100 text-gray-600" },
  submitted: { label: "Đã nộp", color: "bg-yellow-100 text-yellow-700" },
  graded: { label: "Đã chấm", color: "bg-green-100 text-green-700" },
};
// Label hiển thị trạng thái cho admin/học vụ (readOnly): bài nộp chưa chấm thì hiển thị "Đợi chấm"
const readOnlyStatusConfig: Record<HomeworkStatus, { label: string; color: string }> = {
  pending: { label: "Chờ nộp", color: "bg-gray-100 text-gray-600" },
  submitted: { label: "Đợi chấm", color: "bg-orange-100 text-orange-700" },
  graded: { label: "Đã chấm", color: "bg-green-100 text-green-700" },
};

const TeacherSyllabusView: React.FC<{ 
  showStaffReport?: boolean; 
  hideCourseSelect?: boolean; 
  readOnly?: boolean; 
  foreignMode?: boolean;
  syllabus?: Syllabus; // Prop mới để hỗ trợ preview trực tiếp từ Admin
}> = ({ showStaffReport = false, hideCourseSelect = false, readOnly = false, foreignMode = false, syllabus: propSyllabus }) => {
  const featureCtx = useSyllabusFeatures();
  const { studentStars, awardStar } = featureCtx;
  const [selectedSyllabusId, setSelectedSyllabusId] = useState<string | null>(hideCourseSelect ? (syllabuses[0]?.id ?? null) : null);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>(initialSubmissions);
  const [activeTab, setActiveTab] = useState<"today" | "attendance" | "grading" | "classwork" | "staff_report" | "schedule">("today");
  const [expandedProcess, setExpandedProcess] = useState(false);
  const [processTab, setProcessTab] = useState<"vn" | "foreign">(foreignMode ? "foreign" : "vn");
  const [activeNavItem, setActiveNavItem] = useState<NavItem>("syllabus");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Attendance
  type AttendanceStatus = "present" | "late" | "absent";
  const attendanceStudents = [
    { id: "ST01", name: "Đăng Khoa Bing", avatar: "DK" },
    { id: "ST02", name: "Bảo Thư Mimi", avatar: "BT" },
    { id: "ST03", name: "Thành Vinh Brian", avatar: "TV" },
    { id: "ST04", name: "Thiện Nhân Tom", avatar: "TN" },
    { id: "ST05", name: "Hà Anh Kuromi", avatar: "HA" },
    { id: "ST06", name: "Minh Anh Mina", avatar: "MA" },
    { id: "ST07", name: "Quốc Bảo Leo", avatar: "QB" },
    { id: "ST08", name: "Phương Linh Luna", avatar: "PL" },
    { id: "ST09", name: "Gia Huy Max", avatar: "GH" },
    { id: "ST10", name: "Thanh Thảo Coco", avatar: "TT" },
    { id: "ST11", name: "Tuấn Kiệt Rex", avatar: "TK" },
    { id: "ST12", name: "Ngọc Hân Lily", avatar: "NH" },
    { id: "ST13", name: "Minh Quân Jack", avatar: "MQ" },
    { id: "ST14", name: "Khánh Ngân Sky", avatar: "KN" },
    { id: "ST15", name: "Hoàng Nam Bo", avatar: "HN" },
  ];

  // Mock attendance data (đầy đủ) - chỉ vắng/trễ ở 1 vài bé
  const mockAttendanceStatus: Record<string, AttendanceStatus> = {
    ST01: "present", ST02: "present", ST03: "late", ST04: "present", ST05: "present",
    ST06: "absent", ST07: "present", ST08: "present", ST09: "present", ST10: "late",
    ST11: "present", ST12: "present", ST13: "present", ST14: "absent", ST15: "present",
  };
  const mockAttendanceNotes: Record<string, string> = {
    ST03: "Trễ 5 phút do kẹt xe",
    ST06: "Phụ huynh xin nghỉ ốm",
    ST10: "Trễ 10 phút",
    ST14: "Vắng không phép",
  };

  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    () => readOnly ? { ...mockAttendanceStatus } : Object.fromEntries(attendanceStudents.map(s => [s.id, "present" as AttendanceStatus]))
  );
  const [attendanceNotes, setAttendanceNotes] = useState<Record<string, string>>(
    () => readOnly ? { ...mockAttendanceNotes } : {}
  );
  const [attendanceSaved, setAttendanceSaved] = useState(readOnly);

  const setAllAttendance = (status: AttendanceStatus) => {
    setAttendance(Object.fromEntries(attendanceStudents.map(s => [s.id, status])));
  };

  const saveAttendance = () => {
    const present = Object.values(attendance).filter(v => v === "present").length;
    const late = Object.values(attendance).filter(v => v === "late").length;
    const absent = Object.values(attendance).filter(v => v === "absent").length;
    setAttendanceSaved(true);
    toast.success(`Đã lưu điểm danh: ${present} có mặt, ${late} đi trễ, ${absent} vắng`);
  };

  // Classwork grading (teacher creates custom columns)
  type ClassworkColumn = { id: string; name: string; maxScore: number };

  // Mock classwork columns + scores đầy đủ
  const mockClassworkColumns: ClassworkColumn[] = [
    { id: "col1", name: "Speaking", maxScore: 10 },
    { id: "col2", name: "Listening", maxScore: 10 },
    { id: "col3", name: "Vocabulary", maxScore: 10 },
    { id: "col4", name: "Grammar", maxScore: 10 },
  ];
  const mockClassworkScores: Record<string, Record<string, number | "">> = {
    ST01: { col1: 9, col2: 8, col3: 10, col4: 9 },
    ST02: { col1: 8, col2: 9, col3: 8, col4: 8 },
    ST03: { col1: 7, col2: 7, col3: 8, col4: 7 },
    ST04: { col1: 10, col2: 9, col3: 10, col4: 10 },
    ST05: { col1: 8, col2: 8, col3: 9, col4: 8 },
    ST06: { col1: "", col2: "", col3: "", col4: "" },
    ST07: { col1: 9, col2: 10, col3: 9, col4: 9 },
    ST08: { col1: 7, col2: 8, col3: 7, col4: 8 },
    ST09: { col1: 8, col2: 7, col3: 9, col4: 8 },
    ST10: { col1: 6, col2: 7, col3: 7, col4: 6 },
    ST11: { col1: 9, col2: 9, col3: 10, col4: 9 },
    ST12: { col1: 10, col2: 10, col3: 10, col4: 9 },
    ST13: { col1: 8, col2: 8, col3: 8, col4: 8 },
    ST14: { col1: "", col2: "", col3: "", col4: "" },
    ST15: { col1: 9, col2: 8, col3: 9, col4: 9 },
  };

  const [classworkColumns, setClassworkColumns] = useState<ClassworkColumn[]>(
    () => readOnly ? mockClassworkColumns : [{ id: "col1", name: "Speaking", maxScore: 10 }]
  );
  const [classworkScores, setClassworkScores] = useState<Record<string, Record<string, number | "">>>(
    () => readOnly ? { ...mockClassworkScores } : {}
  );
  const [newColName, setNewColName] = useState("");
  const [newColMax, setNewColMax] = useState<number>(10);
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editingColName, setEditingColName] = useState("");

  const addClassworkColumn = () => {
    const name = newColName.trim();
    if (!name) { toast.error("Nhập tên cột điểm"); return; }
    const id = `col${Date.now()}`;
    setClassworkColumns(prev => [...prev, { id, name, maxScore: newColMax || 10 }]);
    setNewColName("");
    setNewColMax(10);
    toast.success(`Đã thêm cột "${name}"`);
  };

  const removeClassworkColumn = (id: string) => {
    setClassworkColumns(prev => prev.filter(c => c.id !== id));
    setClassworkScores(prev => {
      const next: typeof prev = {};
      for (const sid in prev) {
        const { [id]: _omit, ...rest } = prev[sid];
        next[sid] = rest;
      }
      return next;
    });
  };

  const renameClassworkColumn = (id: string) => {
    const name = editingColName.trim();
    if (!name) { toast.error("Tên cột không được trống"); return; }
    setClassworkColumns(prev => prev.map(c => c.id === id ? { ...c, name } : c));
    setEditingColId(null);
    setEditingColName("");
  };

  const setClassworkScore = (studentId: string, colId: string, value: string) => {
    const num = value === "" ? "" : Math.max(0, Math.min(100, Number(value)));
    setClassworkScores(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] ?? {}), [colId]: num as number | "" },
    }));
  };

  const saveClasswork = () => {
    if (classworkColumns.length === 0) { toast.error("Tạo ít nhất 1 cột điểm"); return; }
    const filled = Object.values(classworkScores).reduce((acc, row) => {
      return acc + Object.values(row).filter(v => v !== "" && v !== undefined).length;
    }, 0);
    toast.success(`Đã lưu ${filled} điểm ở ${classworkColumns.length} cột`);
  };

  // Grading dialog
  const [gradingItem, setGradingItem] = useState<HomeworkSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState<number | "">("");
  const [gradeFeedback, setGradeFeedback] = useState("");

  // Participation score
  const [showParticipation, setShowParticipation] = useState(false);
  const [participationScores, setParticipationScores] = useState<Record<string, number>>({});

  // Today's class
  const todaySchedule = classSchedules.find(cs => cs.date === TODAY);
  const todaySyllabus = todaySchedule ? syllabuses.find(s => s.id === todaySchedule.syllabusId) : null;
  const todaySession = todaySyllabus?.sessions.find(s => s.id === todaySchedule?.syllabusSessionId);

  // Submissions needing grading
  // Mock: khi ở chế độ readOnly (admin/học vụ xem), inject thêm vài bài đợi chấm + đã chấm để có data đầy đủ
  const mockExtraSubmissions: HomeworkSubmission[] = readOnly ? [
    {
      id: "HSUB_MOCK_001", studentId: "ST02", studentName: "Bảo Thư Mimi", studentAvatar: "BT",
      homeworkId: "HW_001", homeworkTitle: "Video giới thiệu bản thân", homeworkType: "video_speaking",
      classScheduleId: "CS001", sessionTitle: "Hello! My name is...",
      submittedAt: "2026-04-21T18:30:00", status: "submitted",
      submitUrl: "https://drive.google.com/mock-video-bt",
    },
    {
      id: "HSUB_MOCK_002", studentId: "ST04", studentName: "Thiện Nhân Tom", studentAvatar: "TN",
      homeworkId: "HW_002", homeworkTitle: "Quizizz Unit 3", homeworkType: "quizizz",
      classScheduleId: "CS002", sessionTitle: "My family",
      submittedAt: "2026-04-21T20:15:00", status: "submitted",
      submitUrl: "https://quizizz.com/mock-tom",
      submitText: "Điểm Quizizz: 85/100",
    },
    {
      id: "HSUB_MOCK_003", studentId: "ST07", studentName: "Quốc Bảo Leo", studentAvatar: "QB",
      homeworkId: "HW_003", homeworkTitle: "Writing about my family", homeworkType: "writing",
      classScheduleId: "CS002", sessionTitle: "My family",
      submittedAt: "2026-04-21T21:00:00", status: "submitted",
      submitText: "My family has 4 members: my dad, my mom, my sister and me. We love each other...",
    },
    {
      id: "HSUB_MOCK_004", studentId: "ST09", studentName: "Gia Huy Max", studentAvatar: "GH",
      homeworkId: "HW_001", homeworkTitle: "Video giới thiệu bản thân", homeworkType: "video_speaking",
      classScheduleId: "CS001", sessionTitle: "Hello! My name is...",
      submittedAt: "2026-04-20T19:00:00", status: "graded",
      submitUrl: "https://drive.google.com/mock-video-gh",
      score: 9, feedback: "Phát âm rõ ràng, tự tin. Cần luyện thêm intonation.",
      gradedAt: "2026-04-21T08:00:00", gradedByName: "Ms. Thu Trang",
    },
    {
      id: "HSUB_MOCK_005", studentId: "ST12", studentName: "Ngọc Hân Lily", studentAvatar: "NH",
      homeworkId: "HW_002", homeworkTitle: "Quizizz Unit 3", homeworkType: "quizizz",
      classScheduleId: "CS002", sessionTitle: "My family",
      submittedAt: "2026-04-20T17:30:00", status: "graded",
      submitText: "Điểm Quizizz: 95/100",
      score: 9.5, feedback: "Xuất sắc! Em nắm rất tốt từ vựng.",
      gradedAt: "2026-04-21T09:00:00", gradedByName: "Ms. Thu Trang",
    },
  ] : [];
  const allSubmissions = readOnly ? [...submissions, ...mockExtraSubmissions] : submissions;
  const pendingGrading = allSubmissions.filter(s => s.status === "submitted");
  const gradedList = allSubmissions.filter(s => s.status === "graded");

  const openGrading = (item: HomeworkSubmission) => {
    setGradingItem(item);
    setGradeScore(item.score ?? "");
    setGradeFeedback(item.feedback ?? "");
  };

  const submitGrade = () => {
    if (!gradingItem) return;
    if (gradeScore === "" || Number(gradeScore) < 0 || Number(gradeScore) > 10) {
      toast.error("Vui lòng nhập điểm từ 0-10"); return;
    }
    setSubmissions(prev => prev.map(s => s.id === gradingItem.id
      ? { ...s, status: "graded", score: Number(gradeScore), feedback: gradeFeedback, gradedAt: new Date().toISOString(), gradedByName: "Ms. Thu Trang" }
      : s));
    // Auto tích sao nếu điểm >= 7
    if (Number(gradeScore) >= 7) {
      const stuKey = gradingItem.studentId.startsWith("STU") ? gradingItem.studentId : `STU${gradingItem.studentId.slice(2).padStart(3, "0")}`;
      awardStar(stuKey, gradingItem.studentName, 1, `Nộp BTVN đúng hạn (${gradeScore}/10)`, "auto-homework", "Hệ thống", gradingItem.classScheduleId);
    }
    toast.success(`Đã chấm điểm ${gradingItem.studentName}: ${gradeScore}/10${Number(gradeScore) >= 7 ? " · ⭐ +1 sao" : ""}`);
    setGradingItem(null);
  };

  const currentSyllabus = propSyllabus || syllabuses.find(s => s.id === selectedSyllabusId);

  // Initialize selectedSessionId once syllabus loaded — pick today's or first
  // ⚠️ Hook MUST be called before any conditional return to satisfy Rules of Hooks
  React.useEffect(() => {
    if (currentSyllabus && !selectedSessionId) {
      const todaySched = classSchedules.find(cs => cs.date === TODAY && cs.syllabusId === currentSyllabus.id);
      const initial = todaySched?.syllabusSessionId ?? currentSyllabus.sessions[0]?.id ?? null;
      setSelectedSessionId(initial);
    }
  }, [currentSyllabus, selectedSessionId]);

  const tabs = [
    { id: "today", label: "Hôm nay", icon: Clock },
    { id: "schedule", label: "Lịch lớp & Tiến độ", icon: Calendar },
    { id: "attendance", label: `Điểm danh${attendanceSaved ? " ✓" : ""}`, icon: UserCheck },
    { id: "classwork", label: "Chấm bài tập trên lớp", icon: ClipboardCheck },
    { id: "grading", label: `Chấm bài tập về nhà ${pendingGrading.length > 0 ? `(${pendingGrading.length})` : ""}`, icon: CheckCircle2 },
    ...(showStaffReport ? [{ id: "staff_report", label: "Báo cáo học vụ", icon: ClipboardList }] : []),
  ] as const;

  // ====== COURSE SELECTION SCREEN ======
  if (!hideCourseSelect && !selectedSyllabusId) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-foreground">Chọn khóa học</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Chọn 1 khóa để xem chi tiết buổi học, điểm danh và chấm bài</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {syllabuses.map((syl, i) => (
            <motion.button
              key={syl.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedSyllabusId(syl.id)}
              className="text-left bg-card border border-border hover:border-primary/60 hover:shadow-md rounded-xl p-5 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground truncate">{syl.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Cấp độ: {syl.level}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{syl.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{syl.totalSessions} buổi</span>
                <span className="text-primary font-medium flex items-center gap-1">
                  Vào khóa <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (!currentSyllabus) return null;

  const selectedSession = currentSyllabus.sessions.find(s => s.id === selectedSessionId) ?? currentSyllabus.sessions[0];

  const roleLabel = readOnly ? "Quản trị viên" : (showStaffReport ? "Học vụ" : "Giảng viên");

  return (
    <SyllabusSidebarLayout
      syllabus={currentSyllabus}
      classSchedules={classSchedules}
      selectedSessionId={selectedSessionId}
      onSessionSelect={setSelectedSessionId}
      activeNavItem={activeNavItem}
      onNavItemChange={setActiveNavItem}
      teacherName="Ms. Thu Trang"
      breadcrumb={`${roleLabel} / Khoá học của tôi / ${currentSyllabus.id}`}
      onBack={hideCourseSelect ? undefined : () => { setSelectedSyllabusId(null); setSelectedSessionId(null); }}
    >
      {activeNavItem === "game" ? (
        <GameTabContent />
      ) : activeNavItem === "quiz" ? (
        <QuizTabContent />
      ) : (
        <>
      {/* Session header */}
      {selectedSession && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">BUỔI {selectedSession.order}</p>
          <h2 className="text-xl font-bold text-foreground mb-1.5">Buổi {selectedSession.order}: {selectedSession.title}</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>90 phút</span>
            <span>·</span>
            <span>Tuần {Math.ceil(selectedSession.order / 2)}</span>
          </div>
        </div>
      )}

      {/* Tài liệu giảng dạy của buổi đang chọn — luôn hiện inline */}
      {selectedSession?.materialsLink && (
        <div className="mb-6 bg-card border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">📂 Tài liệu giảng dạy</p>
          <MaterialsViewer url={selectedSession.materialsLink} title={`Buổi ${selectedSession.order}: ${selectedSession.title}`} watermark="Giảng viên" />
        </div>
      )}

      {/* Tabs */}
      {currentSyllabus.sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
          <BookOpen className="w-16 h-16 text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Khung giáo trình trống</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Bạn vừa tạo giáo trình mới. Hãy chuyển sang chế độ <strong>"Chỉnh sửa"</strong> ở góc trên bên phải để bắt đầu thêm các buổi học đầu tiên.
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-1 bg-muted/50 rounded-xl p-1 mb-6 overflow-x-auto">
            {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === t.id ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* TODAY TAB */}
      {activeTab === "today" && (
        <ContentSecurityWrapper watermarkText={`${roleLabel} · Ms. Thu Trang`}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 relative z-20">
          {todaySession && todaySyllabus ? (
            <>
              {/* Session info card */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="bg-primary/5 border-b border-border px-5 py-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-foreground">Session {todaySession.order}: {todaySession.title}</h3>
                        <Badge variant="secondary">{todaySyllabus.name}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {todaySchedule?.className} · {todaySchedule?.startTime} – {todaySchedule?.endTime} · {todaySchedule?.room}
                      </p>
                    </div>
                    {todaySchedule?.materialsLink && (
                      <div className="ml-auto">
                        <MaterialsViewer url={todaySchedule.materialsLink} title={`${todaySyllabus.name} – ${todaySession.title}`} watermark="Giảng viên" compact />
                      </div>
                    )}
                    {todaySession.materialsLink && !todaySchedule?.materialsLink && (
                      <div className="ml-auto">
                        <MaterialsViewer url={todaySession.materialsLink} title={todaySession.title} watermark="Giảng viên" compact />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">📚 Từ vựng</p>
                      <p className="text-sm text-foreground leading-relaxed">{todaySession.vocab}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">📝 Ngữ pháp</p>
                      <p className="text-sm text-foreground leading-relaxed">{todaySession.grammar}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <span className="text-sm font-semibold text-foreground">📋 Quy trình dạy</span>
                      {/* Sub-tabs: VN / GVNN — luôn hiện */}
                      <div className="inline-flex bg-muted/40 rounded-lg p-0.5 border border-border">
                        <button
                          onClick={() => { setProcessTab("vn"); setExpandedProcess(true); }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                            processTab === "vn" && expandedProcess
                              ? "bg-background shadow text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          🇻🇳 GV Việt Nam
                          <span className="text-[10px] font-normal opacity-70">(40-45′)</span>
                        </button>
                        <button
                          onClick={() => { setProcessTab("foreign"); setExpandedProcess(true); }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                            processTab === "foreign" && expandedProcess
                              ? "bg-background shadow text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          🌍 GV Nước ngoài
                          <span className="text-[10px] font-normal opacity-70">(15-20′)</span>
                        </button>
                        <button
                          onClick={() => setExpandedProcess(p => !p)}
                          className="px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                          title={expandedProcess ? "Thu gọn" : "Mở rộng"}
                        >
                          {expandedProcess ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    {expandedProcess && (
                      <>
                        {processTab === "foreign" && !todaySchedule?.foreignTeacherId && (
                          <div className="mb-2 px-3 py-2 rounded-lg border border-amber-300 bg-amber-50 text-xs text-amber-900 flex items-start gap-2">
                            <span>⚠️</span>
                            <div>
                              <b>Buổi này chưa gán GVNN.</b> GV Việt cần handle CẢ phần này (15-20 phút cuối). Liên hệ học vụ/admin nếu cần xếp GVNN.
                            </div>
                          </div>
                        )}
                        {/* Tài liệu riêng cho GVNN — chỉ hiện khi đang xem tab foreign */}
                        {processTab === "foreign" && (todaySession.foreignMaterialsLink || todaySchedule?.foreignMaterialsLink) && (
                          <div className="mb-2">
                            <p className="text-xs font-semibold text-emerald-700 mb-1.5 flex items-center gap-1.5">
                              🌍 Tài liệu GV Nước ngoài
                            </p>
                            <MaterialsViewer
                              url={(todaySchedule?.foreignMaterialsLink ?? todaySession.foreignMaterialsLink)!}
                              title={`GVNN: ${todaySession.title}`}
                              watermark="GVNN"
                              compact
                            />
                          </div>
                        )}
                        <pre className={`text-sm font-sans whitespace-pre-wrap leading-relaxed p-3 rounded-lg border ${
                          processTab === "foreign"
                            ? "bg-emerald-50/60 border-emerald-200 text-foreground"
                            : "bg-muted/30 border-border text-foreground"
                        }`}>
                          {processTab === "foreign"
                            ? (todaySession.foreignContent ?? "Buổi này chưa có nội dung dành cho GVNN. Liên hệ admin/TA để bổ sung.")
                            : (todaySession.vnContent ?? todaySession.teachingProcess)}
                        </pre>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 🌍 Bridge với GVNN — đặt ngay dưới session info để GV Việt thấy ngay */}
              {!foreignMode && todaySchedule && (
                <VnToForeignNotePanel
                  classId={todaySchedule.classId}
                  className={todaySchedule.className}
                  date={todaySchedule.date}
                  classScheduleId={todaySchedule.id}
                  sessionId={todaySession.id}
                  foreignTeacherId={todaySchedule.foreignTeacherId}
                  foreignTeacherName={todaySchedule.foreignTeacherName}
                  foreignStartTime={todaySchedule.foreignStartTime}
                  foreignEndTime={todaySchedule.foreignEndTime}
                  foreignContent={todaySession.foreignContent}
                  foreignMaterialsLink={todaySession.foreignMaterialsLink}
                  vnTeacherId={todaySchedule.teacherId}
                  vnTeacherName={todaySchedule.teacherName}
                />
              )}

              {/* Bài tập của session hôm nay */}
              {todaySession.homeworks.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <h4 className="font-semibold text-sm text-foreground mb-3">📤 Bài tập của session này</h4>
                  <div className="space-y-2">
                    {todaySession.homeworks.map(hw => {
                      const Icon = hwTypeIcon[hw.type];
                      return (
                        <div key={hw.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium flex-shrink-0 ${hwTypeColor[hw.type]}`}>
                            <Icon className="w-3 h-3" />{hwTypeLabel[hw.type]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{hw.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{hw.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Teacher Note (GV/Học vụ/Admin xem; PH ẩn) */}
              {todaySchedule && (
                <TeacherNotePanel
                  classScheduleId={todaySchedule.id}
                  classId={todaySchedule.classId}
                  syllabusSessionId={todaySession.id}
                  teacherName="Ms. Thu Trang"
                />
              )}

              {/* GV Việt chấm GVNN sau buổi dạy (nếu buổi này có GVNN) */}
              {todaySchedule?.foreignTeacherId && todaySchedule?.foreignTeacherName && (
                <ForeignTeacherEvaluationPanel
                  foreignTeacherId={todaySchedule.foreignTeacherId}
                  foreignTeacherName={todaySchedule.foreignTeacherName}
                  classScheduleId={todaySchedule.id}
                  className={todaySchedule.className}
                />
              )}

              {/* Đề xuất sửa Syllabus template */}
              <SyllabusEditRequestPanel syllabus={todaySyllabus} session={todaySession} />

              {/* Big Test panel — chỉ hiển thị nếu session này là Big Test của 1 chặng */}
              {todaySchedule && (() => {
                const stages = featureCtx.getStagesBySyllabus(todaySyllabus.id);
                const stage = stages.find(s => s.bigTestSessionId === todaySession.id);
                if (!stage) return null;
                return (
                  <BigTestPanel
                    syllabusSessionId={todaySession.id}
                    classId={todaySchedule.classId}
                    className={todaySchedule.className}
                    stageId={stage.id}
                    stageName={stage.name}
                    students={attendanceStudents}
                  />
                );
              })()}
            </>
          ) : (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Không có lịch dạy hôm nay</p>
              <p className="text-sm mt-1">Chuyển sang tab "Chấm bài" để xử lý bài nộp</p>
            </div>
          )}
        </motion.div>
        </ContentSecurityWrapper>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === "attendance" && (
        <ContentSecurityWrapper watermarkText={`${roleLabel} · Ms. Thu Trang`}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 border-b border-border px-5 py-4 flex items-center gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground">Điểm danh lớp học</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {todaySchedule?.className ?? "4CLC 2"} · {todaySchedule?.startTime ?? "08:00"} – {todaySchedule?.endTime ?? "09:30"} · {todaySchedule?.room ?? "Phòng A1"}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-green-700 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  {Object.values(attendance).filter(v => v === "present").length}
                </span>
                <span className="flex items-center gap-1 text-yellow-700 font-semibold">
                  <Timer className="w-3.5 h-3.5" />
                  {Object.values(attendance).filter(v => v === "late").length}
                </span>
                <span className="flex items-center gap-1 text-red-700 font-semibold">
                  <X className="w-3.5 h-3.5" />
                  {Object.values(attendance).filter(v => v === "absent").length}
                </span>
              </div>
            </div>

            {!readOnly && (
              <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground font-medium">Đánh dấu tất cả:</span>
                <button onClick={() => setAllAttendance("present")}
                  className="text-xs px-2.5 py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Có mặt
                </button>
                <button onClick={() => setAllAttendance("late")}
                  className="text-xs px-2.5 py-1 rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 font-medium flex items-center gap-1">
                  <Timer className="w-3 h-3" /> Đi trễ
                </button>
                <button onClick={() => setAllAttendance("absent")}
                  className="text-xs px-2.5 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 font-medium flex items-center gap-1">
                  <X className="w-3 h-3" /> Vắng
                </button>
              </div>
            )}

            <div className="divide-y divide-border">
              {attendanceStudents.map((s, i) => {
                const status = attendance[s.id];
                const stuKey = `STU${s.id.slice(2).padStart(3, "0")}`; // ST01 -> STU001
                const starCount = studentStars[stuKey] ?? 0;
                return (
                  <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                    className="px-5 py-3 flex items-center gap-3 hover:bg-muted/20">
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {s.avatar}
                      </div>
                      {starCount > 0 && (
                        <span title={`${starCount} sao`} className="absolute -top-1.5 -right-1.5 bg-amber-400 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow border border-white">
                          ⭐{starCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                      <p className="text-[11px] text-muted-foreground">{s.id}</p>
                    </div>
                    {!readOnly && (
                      <button
                        onClick={() => { awardStar(stuKey, s.name, 1, "GV thưởng sao trong lớp", "teacher-tick", "Ms. Thu Trang"); toast.success(`⭐ +1 sao cho ${s.name}`); }}
                        className="flex items-center gap-1 px-2 h-7 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-medium flex-shrink-0"
                        title="Tặng 1 sao"
                      >
                        <Star className="w-3 h-3" /> +1
                      </button>
                    )}
                    <div className="flex gap-1 flex-shrink-0">
                      {([
                        { key: "present" as const, icon: Check, label: "Có mặt", active: "bg-green-500 text-white border-green-500", inactive: "border-border text-muted-foreground hover:border-green-400" },
                        { key: "late" as const, icon: Timer, label: "Trễ", active: "bg-yellow-500 text-white border-yellow-500", inactive: "border-border text-muted-foreground hover:border-yellow-400" },
                        { key: "absent" as const, icon: X, label: "Vắng", active: "bg-red-500 text-white border-red-500", inactive: "border-border text-muted-foreground hover:border-red-400" },
                      ]).map(opt => {
                        const Icon = opt.icon;
                        const isActive = status === opt.key;
                        return (
                          <button key={opt.key} onClick={() => !readOnly && setAttendance(p => ({ ...p, [s.id]: opt.key }))}
                            disabled={readOnly}
                            title={opt.label}
                            className={`flex items-center gap-1 px-2.5 h-8 rounded-md border-2 text-xs font-medium transition-all ${isActive ? opt.active : opt.inactive} ${readOnly ? "cursor-default opacity-90" : ""}`}>
                            <Icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <Input
                      value={attendanceNotes[s.id] ?? ""}
                      onChange={e => setAttendanceNotes(p => ({ ...p, [s.id]: e.target.value }))}
                      placeholder="Ghi chú..."
                      readOnly={readOnly}
                      className="h-8 text-xs w-40 flex-shrink-0 hidden md:block"
                    />
                  </motion.div>
                );
              })}
            </div>

            <div className="px-5 py-4 border-t border-border bg-muted/10 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Tổng: <span className="font-semibold text-foreground">{attendanceStudents.length}</span> học sinh
                {readOnly && <span className="ml-2 text-green-600">✓ Đã điểm danh</span>}
              </p>
              {!readOnly && (
                <Button onClick={saveAttendance} className="gap-1.5">
                  <Save className="w-4 h-4" /> Lưu điểm danh
                </Button>
              )}
            </div>
          </div>
        </motion.div>
        </ContentSecurityWrapper>
      )}

      {/* GRADING TAB */}
      {activeTab === "grading" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {readOnly && (
            <div className="flex items-center gap-3 text-xs">
              <Badge className="bg-orange-100 text-orange-700">Đợi chấm: {pendingGrading.length}</Badge>
              <Badge className="bg-green-100 text-green-700">Đã chấm: {gradedList.length}</Badge>
              <span className="text-muted-foreground">Tổng bài nộp: {allSubmissions.filter(s => s.status !== "pending").length}</span>
            </div>
          )}

          {/* Pending / Đợi chấm list */}
          {(readOnly ? pendingGrading : pendingGrading).length === 0 && !readOnly ? (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Tất cả bài đã được chấm!</p>
            </div>
          ) : (
            pendingGrading.map((sub, i) => {
              const Icon = hwTypeIcon[sub.homeworkType];
              const cfg = readOnly ? readOnlyStatusConfig : statusConfig;
              return (
                <motion.div key={sub.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className={`bg-card border rounded-xl p-4 ${readOnly ? "border-orange-200" : "border-yellow-200"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {sub.studentAvatar}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-foreground">{sub.studentName}</p>
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${hwTypeColor[sub.homeworkType]}`}>
                            <Icon className="w-3 h-3" />{hwTypeLabel[sub.homeworkType]}
                          </div>
                          <Badge variant="secondary" className={cfg[sub.status].color}>{cfg[sub.status].label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{sub.homeworkTitle} · {sub.sessionTitle}</p>
                        {sub.submitText && <p className="text-xs text-foreground mt-1 bg-muted/50 px-2 py-1 rounded">{sub.submitText}</p>}
                        {sub.submitUrl && (
                          <a href={sub.submitUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                            <Link2 className="w-3 h-3" />
                            {sub.homeworkType === "video_speaking" ? "▶ Xem video" : "Mở link"}
                          </a>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Nộp lúc: {new Date(sub.submittedAt).toLocaleString("vi-VN")}</p>
                      </div>
                    </div>
                    {!readOnly && (
                      <Button size="sm" className="flex-shrink-0 gap-1.5" onClick={() => openGrading(sub)}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Chấm điểm
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}

          {/* Graded list — chỉ hiện trong readOnly (admin/học vụ) */}
          {readOnly && gradedList.length > 0 && (
            <>
              <div className="pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bài đã chấm</div>
              {gradedList.map((sub, i) => {
                const Icon = hwTypeIcon[sub.homeworkType];
                return (
                  <motion.div key={sub.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-card border border-green-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {sub.studentAvatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-foreground">{sub.studentName}</p>
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${hwTypeColor[sub.homeworkType]}`}>
                            <Icon className="w-3 h-3" />{hwTypeLabel[sub.homeworkType]}
                          </div>
                          <Badge className="bg-green-100 text-green-700">Đã chấm</Badge>
                          {sub.score !== undefined && (
                            <span className="text-sm font-bold text-green-700">{sub.score}/10</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{sub.homeworkTitle} · {sub.sessionTitle}</p>
                        {sub.feedback && <p className="text-xs text-foreground mt-1 bg-green-50 border border-green-100 px-2 py-1 rounded">💬 {sub.feedback}</p>}
                        {sub.gradedByName && <p className="text-[11px] text-muted-foreground mt-1">Chấm bởi: {sub.gradedByName}</p>}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </motion.div>
      )}

      {/* CLASSWORK TAB */}
      {activeTab === "classwork" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-primary/5 border-b border-border px-5 py-4 flex items-center gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground">Chấm bài tập trên lớp</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tự tạo cột điểm (VD: Speaking, Bài tập 1, Kiểm tra miệng...) và nhập điểm cho từng học sinh
                </p>
              </div>
            </div>

            {/* Add column form */}
            {!readOnly && (
              <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center gap-2 flex-wrap">
                <Input
                  value={newColName}
                  onChange={e => setNewColName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addClassworkColumn()}
                  placeholder="Tên cột điểm (VD: Speaking, Bài tập 1...)"
                  className="h-9 text-sm flex-1 min-w-[200px] bg-background"
                />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Thang điểm:</span>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={newColMax}
                    onChange={e => setNewColMax(Number(e.target.value))}
                    className="h-9 text-sm w-16 bg-background"
                  />
                </div>
                <Button size="sm" onClick={addClassworkColumn} className="h-9 gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Thêm cột
                </Button>
              </div>
            )}

            {/* Grade table */}
            {classworkColumns.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">Chưa có cột điểm nào</p>
                <p className="text-xs mt-1">Tạo cột điểm đầu tiên ở trên để bắt đầu chấm</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-semibold text-foreground sticky left-0 bg-muted/30 min-w-[200px]">
                        Học sinh
                      </th>
                      {classworkColumns.map(col => (
                        <th key={col.id} className="px-3 py-2.5 font-semibold text-foreground text-center min-w-[140px]">
                          <div className="flex items-center justify-center gap-1.5">
                            {editingColId === col.id ? (
                              <>
                                <Input
                                  value={editingColName}
                                  onChange={e => setEditingColName(e.target.value)}
                                  onKeyDown={e => e.key === "Enter" && renameClassworkColumn(col.id)}
                                  autoFocus
                                  className="h-7 text-xs"
                                />
                                <button onClick={() => renameClassworkColumn(col.id)}
                                  className="text-green-600 hover:text-green-700">
                                  <Check className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <div className="flex flex-col items-center">
                                  <span>{col.name}</span>
                                  <span className="text-[10px] font-normal text-muted-foreground">/{col.maxScore}</span>
                                </div>
                                {!readOnly && (
                                  <>
                                    <button onClick={() => { setEditingColId(col.id); setEditingColName(col.name); }}
                                      className="text-muted-foreground hover:text-primary" title="Sửa tên">
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => removeClassworkColumn(col.id)}
                                      className="text-muted-foreground hover:text-red-500" title="Xoá cột">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceStudents.map((s, i) => (
                      <tr key={s.id} className={`border-b border-border ${i % 2 === 0 ? "bg-background" : "bg-muted/10"}`}>
                        <td className="px-4 py-2 sticky left-0 bg-inherit">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary flex-shrink-0">
                              {s.avatar}
                            </div>
                            <span className="text-sm font-medium text-foreground">{s.name}</span>
                          </div>
                        </td>
                        {classworkColumns.map(col => {
                          const val = classworkScores[s.id]?.[col.id];
                          if (readOnly) {
                            return (
                              <td key={col.id} className="px-3 py-2 text-center">
                                {val === "" || val === undefined ? (
                                  <span className="text-xs text-muted-foreground italic">—</span>
                                ) : (
                                  <span className={`text-sm font-semibold ${Number(val) >= 8 ? "text-green-600" : Number(val) >= 6.5 ? "text-blue-600" : "text-orange-600"}`}>
                                    {val}
                                  </span>
                                )}
                              </td>
                            );
                          }
                          return (
                            <td key={col.id} className="px-3 py-2 text-center">
                              <Input
                                type="number"
                                min={0}
                                max={col.maxScore}
                                value={val ?? ""}
                                onChange={e => setClassworkScore(s.id, col.id, e.target.value)}
                                placeholder="—"
                                className="h-8 text-sm text-center w-20 mx-auto"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="px-5 py-4 border-t border-border bg-muted/10 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {attendanceStudents.length} học sinh · {classworkColumns.length} cột điểm
              </p>
              {!readOnly && (
                <Button onClick={saveClasswork} className="gap-1.5">
                  <Save className="w-4 h-4" /> Lưu điểm
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* SCHEDULE & PROGRESS TAB (Phase 2-5) */}
      {activeTab === "schedule" && (
        <ClassScheduleManager syllabus={currentSyllabus} />
      )}

      {/* STAFF REPORT TAB */}
      {activeTab === "staff_report" && showStaffReport && (
        <div className="space-y-4">
          <StaffReportTabContent readOnly={readOnly} />
          <TeacherEvaluationPanel teacherId="USR001" teacherName="Ms. Thu Trang" className={todaySchedule?.className} classScheduleId={todaySchedule?.id} />
          {/* Phếu dự giờ — GV chỉ thấy bản đã công bố */}
          <ClassObservationPanel
            teacherId="USR001"
            teacherName="Ms. Thu Trang"
            classId={todaySchedule?.classId ?? "CLS001"}
            className={todaySchedule?.className ?? "4CLC 2"}
            classScheduleId={todaySchedule?.id}
          />
        </div>
      )}
        </>
      )}
    </>
  )}

      {/* Grading Dialog */}
      <Dialog open={!!gradingItem} onOpenChange={() => setGradingItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chấm điểm bài nộp</DialogTitle>
          </DialogHeader>
          {gradingItem && (
            <div className="space-y-4 py-2">
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-semibold text-foreground">{gradingItem.studentName}</p>
                <p className="text-xs text-muted-foreground">{gradingItem.homeworkTitle} · {gradingItem.sessionTitle}</p>
                {gradingItem.submitUrl && (
                  <a href={gradingItem.submitUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
                    <Link2 className="w-3.5 h-3.5" />
                    {gradingItem.homeworkType === "video_speaking" ? "▶ Xem video bài nộp" : "Mở link bài nộp"}
                  </a>
                )}
                {gradingItem.submitText && <p className="text-xs mt-2 text-foreground bg-background p-2 rounded">{gradingItem.submitText}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Điểm (0-10) *</label>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <button key={n} onClick={() => setGradeScore(n)}
                      className={`w-9 h-9 rounded-lg text-sm font-bold border-2 transition-all ${gradeScore === n ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Nhận xét
                </label>
                <Textarea rows={3} placeholder="Viết nhận xét cho học sinh..." value={gradeFeedback} onChange={e => setGradeFeedback(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setGradingItem(null)}>Hủy</Button>
            <Button onClick={submitGrade} className="gap-1.5"><CheckCircle2 className="w-4 h-4" />Xác nhận chấm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SyllabusSidebarLayout>
  );
};

export default TeacherSyllabusView;
