import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
  BookOpen, Plus, Edit2, Trash2, GripVertical, ChevronDown, ChevronRight,
  Link2, Video, FileText, Zap, X, Save, Eye, ArrowLeft, Layers, Settings, TrendingUp, LayoutGrid, Calendar
} from "lucide-react";
import ProgressTimelineView from "@/components/syllabus/shared/ProgressTimelineView";
import ClassScheduleManager from "@/components/syllabus/shared/ClassScheduleManager";
import MaterialsViewer from "@/components/syllabus/shared/MaterialsViewer";
import TeacherSyllabusView from "@/components/syllabus/TeacherSyllabusView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { syllabuses as initialSyllabuses, type Syllabus, type SyllabusSession, type SyllabusHomework, type HomeworkType } from "@/data/mockData";
import { useSyllabusFeatures } from "@/contexts/SyllabusFeaturesContext";

const hwTypeLabel: Record<HomeworkType, string> = {
  video_speaking: "Video Speaking",
  quizizz: "Quizizz",
  writing: "Writing",
};

const hwTypeColor: Record<HomeworkType, string> = {
  video_speaking: "bg-purple-100 text-purple-700",
  quizizz: "bg-orange-100 text-orange-700",
  writing: "bg-blue-100 text-blue-700",
};

const hwTypeIcon: Record<HomeworkType, React.ElementType> = {
  video_speaking: Video,
  quizizz: Zap,
  writing: FileText,
};

const AdminSyllabusView: React.FC = () => {
  const { configureSyllabusStages, getStagesBySyllabus } = useSyllabusFeatures();
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>(initialSyllabuses);
  const [selectedSyllabus, setSelectedSyllabus] = useState<Syllabus | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [adminTab, setAdminTab] = useState<"sessions" | "design" | "progress">("sessions");
  const [isEditMode, setIsEditMode] = useState(false);

  // Lắng nghe event "syllabus:apply-edit" từ panel duyệt đề xuất sửa
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        syllabusId: string; sessionId: string;
        field: "title" | "vocab" | "grammar" | "teachingProcess" | "materialsLink";
        newValue: string;
      };
      setSyllabuses(prev => prev.map(s => {
        if (s.id !== detail.syllabusId) return s;
        return {
          ...s,
          sessions: s.sessions.map(ss => ss.id === detail.sessionId
            ? { ...ss, [detail.field]: detail.newValue }
            : ss
          ),
        };
      }));
      // Update selectedSyllabus nếu đang mở
      setSelectedSyllabus(prev => {
        if (!prev || prev.id !== detail.syllabusId) return prev;
        return {
          ...prev,
          sessions: prev.sessions.map(ss => ss.id === detail.sessionId
            ? { ...ss, [detail.field]: detail.newValue }
            : ss
          ),
        };
      });
    };
    window.addEventListener("syllabus:apply-edit", handler);
    return () => window.removeEventListener("syllabus:apply-edit", handler);
  }, []);

  // Dialogs
  const [showSyllabusDialog, setShowSyllabusDialog] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState<Syllabus | null>(null);
  const [editingSession, setEditingSession] = useState<SyllabusSession | null>(null);

  // Syllabus form
  const [syllabusForm, setSyllabusForm] = useState({ name: "", description: "", level: "", totalSessions: 0 });

  // Stage config form (sử dụng khi sửa syllabus đã có session)
  const [stageCount, setStageCount] = useState(2);
  const [stageNames, setStageNames] = useState<string[]>(["Chặng 1 — Khởi đầu", "Chặng 2 — Mở rộng"]);

  // Session form
  const [sessionForm, setSessionForm] = useState<Omit<SyllabusSession, "id" | "syllabusId" | "order" | "homeworks">>({
    title: "", vocab: "", grammar: "", teachingProcess: "", materialsLink: ""
  });
  const [homeworkForms, setHomeworkForms] = useState<Omit<SyllabusHomework, "id">[]>([]);

  // ── Syllabus CRUD ────────────────────────────────────────────
  const openCreateSyllabus = () => {
    setEditingSyllabus(null);
    setSyllabusForm({ name: "", description: "", level: "", totalSessions: 24 });
    setShowSyllabusDialog(true);
  };

  const openEditSyllabus = (s: Syllabus) => {
    setEditingSyllabus(s);
    setSyllabusForm({ name: s.name, description: s.description, level: s.level, totalSessions: s.totalSessions });
    // Pre-fill stage config từ stages hiện tại (nếu có)
    const existing = getStagesBySyllabus(s.id);
    if (existing.length > 0) {
      setStageCount(existing.length);
      setStageNames(existing.map(st => st.name));
    } else {
      setStageCount(2);
      setStageNames(["Chặng 1 — Khởi đầu", "Chặng 2 — Mở rộng"]);
    }
    setShowSyllabusDialog(true);
  };

  const saveSyllabus = () => {
    if (!syllabusForm.name.trim()) { toast.error("Vui lòng nhập tên syllabus"); return; }
    if (editingSyllabus) {
      const updatedSyllabuses = syllabuses.map(s => s.id === editingSyllabus.id
        ? { ...s, ...syllabusForm, updatedAt: new Date().toISOString().split("T")[0] }
        : s);
      setSyllabuses(updatedSyllabuses);
      if (selectedSyllabus?.id === editingSyllabus.id) {
        setSelectedSyllabus({ ...selectedSyllabus, ...syllabusForm });
      }
      toast.success("Đã cập nhật thông tin syllabus");
    } else {
      const newS: Syllabus = {
        id: `SYL${Date.now()}`, 
        ...syllabusForm, 
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        sessions: []
      };
      setSyllabuses(prev => [...prev, newS]);
      toast.success("Đã tạo Syllabus mới");
    }
    setShowSyllabusDialog(false);
  };

  const deleteSyllabus = (id: string) => {
    setSyllabuses(prev => prev.filter(s => s.id !== id));
    if (selectedSyllabus?.id === id) setSelectedSyllabus(null);
    toast.success("Đã xóa syllabus");
  };

  // ── Session CRUD ─────────────────────────────────────────────
  const openCreateSession = () => {
    setEditingSession(null);
    setSessionForm({ title: "", vocab: "", grammar: "", teachingProcess: "", materialsLink: "" });
    setHomeworkForms([]);
    setShowSessionDialog(true);
  };

  const openEditSession = (sess: SyllabusSession) => {
    setEditingSession(sess);
    setSessionForm({
      title: sess.title, vocab: sess.vocab, grammar: sess.grammar,
      teachingProcess: sess.teachingProcess, materialsLink: sess.materialsLink ?? ""
    });
    setHomeworkForms(sess.homeworks.map(h => ({ type: h.type, title: h.title, description: h.description, externalLink: h.externalLink ?? "" })));
    setShowSessionDialog(true);
  };

  const saveSession = () => {
    if (!sessionForm.title.trim()) { toast.error("Vui lòng nhập tên session"); return; }
    if (!selectedSyllabus) return;

    const hwList: SyllabusHomework[] = homeworkForms.map((h, i) => ({
      id: `HW_${Date.now()}_${i}`, ...h, externalLink: h.externalLink || undefined
    }));

    if (editingSession) {
      const updatedSessions = selectedSyllabus.sessions.map(s => s.id === editingSession.id
        ? { ...s, ...sessionForm, materialsLink: sessionForm.materialsLink || undefined, homeworks: hwList }
        : s);
      const updated = { ...selectedSyllabus, sessions: updatedSessions };
      setSyllabuses(prev => prev.map(s => s.id === selectedSyllabus.id ? updated : s));
      setSelectedSyllabus(updated);
      toast.success("Đã cập nhật session");
    } else {
      const newSess: SyllabusSession = {
        id: `SS_${Date.now()}`, syllabusId: selectedSyllabus.id,
        order: selectedSyllabus.sessions.length + 1,
        ...sessionForm, materialsLink: sessionForm.materialsLink || undefined, homeworks: hwList
      };
      const updated = { ...selectedSyllabus, sessions: [...selectedSyllabus.sessions, newSess], totalSessions: selectedSyllabus.sessions.length + 1 };
      setSyllabuses(prev => prev.map(s => s.id === selectedSyllabus.id ? updated : s));
      setSelectedSyllabus(updated);
      toast.success("Đã thêm session mới");
    }
    setShowSessionDialog(false);
  };

  const deleteSession = (sessId: string) => {
    if (!selectedSyllabus) return;
    const filtered = selectedSyllabus.sessions.filter(s => s.id !== sessId).map((s, i) => ({ ...s, order: i + 1 }));
    const updated = { ...selectedSyllabus, sessions: filtered, totalSessions: filtered.length };
    setSyllabuses(prev => prev.map(s => s.id === selectedSyllabus.id ? updated : s));
    setSelectedSyllabus(updated);
    toast.success("Đã xóa session");
  };

  // ── Drag & Drop ───────────────────────────────────────────────
  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !selectedSyllabus) return;
    const sessions = Array.from(selectedSyllabus.sessions);
    const [moved] = sessions.splice(result.source.index, 1);
    sessions.splice(result.destination.index, 0, moved);
    const reordered = sessions.map((s, i) => ({ ...s, order: i + 1 }));
    const updated = { ...selectedSyllabus, sessions: reordered };
    setSyllabuses(prev => prev.map(s => s.id === selectedSyllabus.id ? updated : s));
    setSelectedSyllabus(updated);
  };

  // ── Homework form helpers ─────────────────────────────────────
  const addHomeworkForm = () => setHomeworkForms(prev => [...prev, { type: "video_speaking", title: "", description: "", externalLink: "" }]);
  const removeHomeworkForm = (i: number) => setHomeworkForms(prev => prev.filter((_, idx) => idx !== i));
  const updateHW = (i: number, field: string, value: string) =>
    setHomeworkForms(prev => prev.map((h, idx) => idx === i ? { ...h, [field]: value } : h));

  // ── Toggle session expand ─────────────────────────────────────
  const toggleExpand = (id: string) =>
    setExpandedSessions(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  // ─────────────────────────────────────────────────────────────
  // VIEW: Syllabus List
  // ─────────────────────────────────────────────────────────────
  if (!selectedSyllabus) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Quản lý Syllabus</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Tạo và quản lý giáo trình cho các lớp học</p>
          </div>
          <Button onClick={openCreateSyllabus} className="gap-2">
            <Plus className="w-4 h-4" /> Tạo Syllabus
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {syllabuses.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-card border border-border rounded-xl p-6 hover:border-violet-300 hover:shadow-lg transition-all group cursor-pointer relative"
              onClick={() => setSelectedSyllabus(s)}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center flex-shrink-0 border border-violet-100">
                    <BookOpen className="w-7 h-7 text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-violet-600 transition-colors truncate">{s.name}</h3>
                      <Badge variant="outline" className="text-[10px] font-black uppercase border-violet-200 text-violet-600">{s.level}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{s.description || "Chưa có mô tả giáo trình."}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8 px-6 border-l border-border/50 hidden md:flex">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tiến độ</p>
                    <p className="text-sm font-bold text-slate-700">{s.sessions.length} / {s.totalSessions || "--"} buổi</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cập nhật</p>
                    <p className="text-sm font-bold text-slate-700">{s.updatedAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-violet-600 hover:bg-violet-50" onClick={() => openEditSyllabus(s)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => deleteSyllabus(s.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="h-9 gap-1.5 text-xs font-bold border-violet-200 text-violet-600 hover:bg-violet-50 ml-2" onClick={() => setSelectedSyllabus(s)}>
                    <Eye className="w-3.5 h-3.5" /> Xem chi tiết
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}

          {syllabuses.length === 0 && (
            <div className="col-span-3 text-center py-16 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Chưa có syllabus nào</p>
              <p className="text-sm mt-1">Bấm "Tạo Syllabus" để bắt đầu</p>
            </div>
          )}
        </div>

        {/* Syllabus Dialog */}
        <Dialog open={showSyllabusDialog} onOpenChange={setShowSyllabusDialog}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingSyllabus ? "Chỉnh sửa Syllabus" : "Tạo Syllabus mới"}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div><label className="text-sm font-medium mb-1 block">Tên Syllabus *</label>
                <Input placeholder="VD: Family & Friends 1" value={syllabusForm.name} onChange={e => setSyllabusForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1 block">Cấp độ / Level</label>
                  <Input placeholder="VD: 4CLC 1..." value={syllabusForm.level} onChange={e => setSyllabusForm(p => ({ ...p, level: e.target.value }))} /></div>
                <div><label className="text-sm font-medium mb-1 block">Số buổi học (Dự kiến)</label>
                  <Input type="number" placeholder="24" value={syllabusForm.totalSessions} onChange={e => setSyllabusForm(p => ({ ...p, totalSessions: Number(e.target.value) }))} /></div>
              </div>
              <div><label className="text-sm font-medium mb-1 block">Mô tả giáo trình</label>
                <Textarea rows={3} placeholder="Mô tả ngắn gọn mục tiêu, đối tượng..." value={syllabusForm.description} onChange={e => setSyllabusForm(p => ({ ...p, description: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSyllabusDialog(false)}>Hủy</Button>
              <Button onClick={saveSyllabus}><Save className="w-4 h-4 mr-1.5" />Lưu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // VIEW: Session Detail (inside a Syllabus)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="-m-6">
      {/* Tab switcher: Giáo trình mẫu (template) vs Lịch học thực tế (instance) */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-6 pt-3 pb-0 flex items-center gap-2">
        <button
          onClick={() => setAdminTab("sessions")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            adminTab === "sessions"
              ? "border-violet-600 text-violet-700"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Giáo trình mẫu
        </button>
        <button
          onClick={() => setAdminTab("progress")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            adminTab === "progress"
              ? "border-violet-600 text-violet-700"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Lịch học thực tế (Class Schedule)
        </button>
      </div>

      {adminTab === "sessions" ? (
        <div className="relative">
          {/* View/Edit Toggle for Admin */}
          <div className="absolute top-4 right-6 z-40 flex items-center gap-2 bg-white/90 backdrop-blur shadow-sm border border-border p-1 rounded-full">
            <button
              onClick={() => setIsEditMode(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${!isEditMode ? "bg-violet-600 text-white" : "text-muted-foreground hover:bg-muted"}`}
            >
              <Eye className="w-3.5 h-3.5" /> Xem Preview
            </button>
            <button
              onClick={() => setIsEditMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isEditMode ? "bg-violet-600 text-white" : "text-muted-foreground hover:bg-muted"}`}
            >
              <Settings className="w-3.5 h-3.5" /> Chỉnh sửa
            </button>
          </div>

          {!isEditMode ? (
            /* PREVIEW MODE: Giống bản cũ (Teacher view) */
            <TeacherSyllabusView showStaffReport hideCourseSelect readOnly syllabus={selectedSyllabus} />
          ) : (
            /* BUILDER MODE: Giao diện sửa từng buổi học */
            <div className="p-6 pt-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-foreground uppercase tracking-tight">Cấu trúc giáo trình: {selectedSyllabus.name}</h2>
                  <p className="text-xs text-muted-foreground">Kéo thả để sắp xếp, bấm Sửa để cập nhật nội dung từng buổi</p>
                </div>
                <Button onClick={openCreateSession} className="bg-violet-600 hover:bg-violet-700 h-9">
                  <Plus className="w-4 h-4 mr-2" /> Thêm buổi học mới
                </Button>
              </div>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="sessions">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {selectedSyllabus.sessions.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
                          <div className="w-12 h-12 bg-violet-50 text-violet-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <h3 className="text-sm font-bold text-foreground mb-1">Chưa có buổi học nào</h3>
                          <p className="text-xs text-muted-foreground mb-6">Hãy bắt đầu xây dựng giáo trình bằng cách thêm buổi học đầu tiên</p>
                          <Button onClick={openCreateSession} variant="outline" className="border-violet-200 text-violet-600 hover:bg-violet-50">
                            Thêm buổi học đầu tiên
                          </Button>
                        </div>
                      ) : (
                        selectedSyllabus.sessions.map((sess, index) => (
                          <Draggable key={sess.id} draggableId={sess.id} index={index}>
                            {(drag, snapshot) => (
                              <div ref={drag.innerRef} {...drag.draggableProps}
                                className={`bg-card border border-border rounded-xl transition-all ${snapshot.isDragging ? "shadow-xl border-violet-500 scale-[1.02]" : "hover:border-violet-200 shadow-sm"}`}>
                                {/* Session header */}
                                <div className="flex items-center gap-3 px-4 py-4">
                                  <div {...drag.dragHandleProps} className="text-muted-foreground cursor-grab active:cursor-grabbing flex-shrink-0 p-1 hover:bg-muted rounded">
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0 border border-violet-100">
                                    <span className="text-xs font-black text-violet-600">{sess.order}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-sm text-foreground truncate">{sess.title}</span>
                                      {sess.homeworks.length > 0 && (
                                        <Badge variant="secondary" className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 border-indigo-100">{sess.homeworks.length} BÀI TẬP</Badge>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground truncate mt-0.5 font-medium uppercase tracking-wider">{sess.vocab || "Chưa có từ vựng"}</p>
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs font-bold text-slate-500 hover:text-violet-600" onClick={() => openEditSession(sess)}>
                                      <Edit2 className="w-3.5 h-3.5" /> Sửa
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => deleteSession(sess.id)}>
                                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                                    </Button>
                                    <button onClick={() => toggleExpand(sess.id)} className="text-muted-foreground p-1.5 hover:bg-muted rounded-lg transition-colors ml-1">
                                      {expandedSessions.has(sess.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </div>

                                {/* Session expanded content */}
                                <AnimatePresence>
                                  {expandedSessions.has(sess.id) && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-slate-50/30">
                                      <div className="border-t border-border px-6 py-6 space-y-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-violet-700">
                                              <BookOpen className="w-3.5 h-3.5" />
                                              <span className="text-[10px] font-black uppercase tracking-widest">Nội dung học tập</span>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                                              <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1 italic">Từ vựng</p>
                                                <p className="text-xs font-bold text-slate-700 leading-relaxed">{sess.vocab || "Trống"}</p>
                                              </div>
                                              <div className="pt-2 border-t border-slate-50">
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1 italic">Ngữ pháp</p>
                                                <p className="text-xs font-bold text-slate-700 leading-relaxed">{sess.grammar || "Trống"}</p>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-indigo-700">
                                              <FileText className="w-3.5 h-3.5" />
                                              <span className="text-[10px] font-black uppercase tracking-widest">Tài liệu buổi học</span>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm min-h-[100px] flex flex-col items-center justify-center text-center">
                                              {sess.materialsLink ? (
                                                <MaterialsViewer url={sess.materialsLink} title={sess.title} watermark="Admin" />
                                              ) : (
                                                <>
                                                  <Link2 className="w-6 h-6 text-slate-200 mb-2" />
                                                  <p className="text-[10px] font-bold text-slate-400 uppercase italic">Chưa gắn tài liệu giảng dạy</p>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2 text-slate-700">
                                            <LayoutGrid className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Quy trình giảng dạy (Teaching Process)</span>
                                          </div>
                                          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                            <pre className="text-xs font-medium text-slate-600 font-sans whitespace-pre-wrap leading-loose">
                                              {sess.teachingProcess || "Chưa có quy trình chi tiết."}
                                            </pre>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6">
          <ClassScheduleManager syllabus={selectedSyllabus} />
        </div>
      )}

      {/* Back to syllabus list — floating button for admin */}
      <button
        onClick={() => setSelectedSyllabus(null)}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-full shadow-2xl hover:bg-violet-700 hover:scale-105 transition-all text-sm font-bold border-2 border-white/20"
      >
        <ArrowLeft className="w-4 h-4" /> Về danh sách Syllabus
      </button>

      {/* Session Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingSession ? "Chỉnh sửa Session" : "Thêm Session mới"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><label className="text-sm font-medium mb-1 block">Tên bài học *</label>
              <Input placeholder="VD: Hello! My name is..." value={sessionForm.title} onChange={e => setSessionForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Từ vựng (Vocab)</label>
                <Textarea rows={3} placeholder="Liệt kê từ vựng, ngăn cách bằng dấu phẩy..." value={sessionForm.vocab} onChange={e => setSessionForm(p => ({ ...p, vocab: e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-1 block">Ngữ pháp (Grammar)</label>
                <Textarea rows={3} placeholder="Cấu trúc ngữ pháp chính của bài..." value={sessionForm.grammar} onChange={e => setSessionForm(p => ({ ...p, grammar: e.target.value }))} /></div>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Quy trình dạy</label>
              <Textarea rows={5} placeholder="1. Warm-up (5 min)&#10;2. Introduce vocabulary (10 min)&#10;..." value={sessionForm.teachingProcess} onChange={e => setSessionForm(p => ({ ...p, teachingProcess: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">Link tài liệu (PPT/Drive)</label>
              <Input placeholder="https://drive.google.com/..." value={sessionForm.materialsLink} onChange={e => setSessionForm(p => ({ ...p, materialsLink: e.target.value }))} /></div>

            {/* Homework section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Bài tập ({homeworkForms.length})</label>
                <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={addHomeworkForm}><Plus className="w-3 h-3" />Thêm BT</Button>
              </div>
              <div className="space-y-3">
                {homeworkForms.map((hw, i) => (
                  <div key={i} className="border border-border rounded-lg p-3 space-y-2 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Bài tập #{i + 1}</span>
                      <button onClick={() => removeHomeworkForm(i)} className="text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={hw.type} onValueChange={v => updateHW(i, "type", v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video_speaking">Video Speaking</SelectItem>
                          <SelectItem value="writing">Writing</SelectItem>
                          <SelectItem value="quizizz">Quizizz</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input className="h-8 text-xs" placeholder="Tiêu đề bài tập" value={hw.title} onChange={e => updateHW(i, "title", e.target.value)} />
                    </div>
                    <Input className="h-8 text-xs" placeholder="Mô tả yêu cầu..." value={hw.description} onChange={e => updateHW(i, "description", e.target.value)} />
                    {(hw.type === "quizizz") && (
                      <Input className="h-8 text-xs" placeholder="Link Quizizz..." value={hw.externalLink ?? ""} onChange={e => updateHW(i, "externalLink", e.target.value)} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSessionDialog(false)}>Hủy</Button>
            <Button onClick={saveSession}><Save className="w-4 h-4 mr-1.5" />Lưu Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSyllabusView;
