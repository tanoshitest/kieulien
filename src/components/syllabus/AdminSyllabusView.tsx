import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
  BookOpen, Plus, Edit2, Trash2, GripVertical, ChevronDown, ChevronRight,
  Link2, Video, FileText, Zap, X, Save, Eye, ArrowLeft, Layers, Settings, TrendingUp, LayoutGrid
} from "lucide-react";
import ProgressTimelineView from "@/components/syllabus/shared/ProgressTimelineView";
import TeacherSyllabusView from "@/components/syllabus/TeacherSyllabusView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { syllabuses as initialSyllabuses, type Syllabus, type SyllabusSession, type SyllabusHomework, type HomeworkType } from "@/data/mockData";

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
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>(initialSyllabuses);
  const [selectedSyllabus, setSelectedSyllabus] = useState<Syllabus | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [adminTab, setAdminTab] = useState<"sessions" | "design" | "progress">("sessions");

  // Dialogs
  const [showSyllabusDialog, setShowSyllabusDialog] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState<Syllabus | null>(null);
  const [editingSession, setEditingSession] = useState<SyllabusSession | null>(null);

  // Syllabus form
  const [syllabusForm, setSyllabusForm] = useState({ name: "", description: "", level: "" });

  // Session form
  const [sessionForm, setSessionForm] = useState<Omit<SyllabusSession, "id" | "syllabusId" | "order" | "homeworks">>({
    title: "", vocab: "", grammar: "", teachingProcess: "", materialsLink: ""
  });
  const [homeworkForms, setHomeworkForms] = useState<Omit<SyllabusHomework, "id">[]>([]);

  // ── Syllabus CRUD ────────────────────────────────────────────
  const openCreateSyllabus = () => {
    setEditingSyllabus(null);
    setSyllabusForm({ name: "", description: "", level: "" });
    setShowSyllabusDialog(true);
  };

  const openEditSyllabus = (s: Syllabus) => {
    setEditingSyllabus(s);
    setSyllabusForm({ name: s.name, description: s.description, level: s.level });
    setShowSyllabusDialog(true);
  };

  const saveSyllabus = () => {
    if (!syllabusForm.name.trim()) { toast.error("Vui lòng nhập tên syllabus"); return; }
    if (editingSyllabus) {
      setSyllabuses(prev => prev.map(s => s.id === editingSyllabus.id
        ? { ...s, ...syllabusForm, updatedAt: new Date().toISOString().split("T")[0] }
        : s));
      if (selectedSyllabus?.id === editingSyllabus.id) {
        setSelectedSyllabus(prev => prev ? { ...prev, ...syllabusForm } : prev);
      }
      toast.success("Đã cập nhật syllabus");
    } else {
      const newS: Syllabus = {
        id: `SYL${Date.now()}`, ...syllabusForm, totalSessions: 0,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        sessions: []
      };
      setSyllabuses(prev => [...prev, newS]);
      toast.success("Đã tạo syllabus mới");
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {syllabuses.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer"
              onClick={() => setSelectedSyllabus(s)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{s.name}</h3>
                    <p className="text-xs text-muted-foreground">{s.level}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditSyllabus(s)}><Edit2 className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => deleteSyllabus(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{s.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">{s.sessions.length} sessions</span>
                </div>
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5 text-primary" onClick={() => setSelectedSyllabus(s)}>
                  <Eye className="w-3 h-3" /> Xem chi tiết
                </Button>
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
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editingSyllabus ? "Chỉnh sửa Syllabus" : "Tạo Syllabus mới"}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div><label className="text-sm font-medium mb-1 block">Tên Syllabus *</label>
                <Input placeholder="VD: Family & Friends 1" value={syllabusForm.name} onChange={e => setSyllabusForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-1 block">Cấp độ / Level</label>
                <Input placeholder="VD: 4CLC 1, IELTS..." value={syllabusForm.level} onChange={e => setSyllabusForm(p => ({ ...p, level: e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-1 block">Mô tả</label>
                <Textarea rows={3} placeholder="Mô tả ngắn về syllabus này..." value={syllabusForm.description} onChange={e => setSyllabusForm(p => ({ ...p, description: e.target.value }))} /></div>
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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setSelectedSyllabus(null)} className="h-9 w-9">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-foreground truncate">{selectedSyllabus.name}</h2>
            <Badge variant="secondary">{selectedSyllabus.level}</Badge>
            <Badge variant="outline">{selectedSyllabus.sessions.length} sessions</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{selectedSyllabus.description}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openEditSyllabus(selectedSyllabus)}>
            <Edit2 className="w-3.5 h-3.5" /> Sửa
          </Button>
          <Button size="sm" className="gap-1.5" onClick={openCreateSession}>
            <Plus className="w-3.5 h-3.5" /> Thêm Session
          </Button>
        </div>
      </div>

      {/* Render Teacher view với full tabs (Admin chỉ xem, không sửa) */}
      <div className="-mx-6 -mb-6">
        <TeacherSyllabusView showStaffReport hideCourseSelect readOnly />
      </div>

      {false && (<>

      {/* Drag-and-drop sessions */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sessions">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {selectedSyllabus.sessions.map((sess, index) => (
                <Draggable key={sess.id} draggableId={sess.id} index={index}>
                  {(drag, snapshot) => (
                    <div ref={drag.innerRef} {...drag.draggableProps}
                      className={`bg-card border border-border rounded-xl transition-all ${snapshot.isDragging ? "shadow-xl border-primary" : "hover:border-border/80"}`}>
                      {/* Session header */}
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div {...drag.dragHandleProps} className="text-muted-foreground cursor-grab active:cursor-grabbing flex-shrink-0">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">{sess.order}</span>
                        </div>
                        <button onClick={() => toggleExpand(sess.id)} className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground truncate">{sess.title}</span>
                            {sess.homeworks.length > 0 && (
                              <Badge variant="secondary" className="text-xs">{sess.homeworks.length} BT</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{sess.vocab.split(",").slice(0, 4).join(", ")}...</p>
                        </button>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditSession(sess)}><Edit2 className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={() => deleteSession(sess.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          <button onClick={() => toggleExpand(sess.id)} className="text-muted-foreground p-1">
                            {expandedSessions.has(sess.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Session expanded content */}
                      <AnimatePresence>
                        {expandedSessions.has(sess.id) && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="border-t border-border px-4 py-4 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Từ vựng</p>
                                  <p className="text-sm text-foreground leading-relaxed">{sess.vocab}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Ngữ pháp</p>
                                  <p className="text-sm text-foreground leading-relaxed">{sess.grammar}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Quy trình dạy</p>
                                <pre className="text-sm text-foreground font-sans whitespace-pre-wrap leading-relaxed bg-muted/50 p-3 rounded-lg">{sess.teachingProcess}</pre>
                              </div>
                              {sess.materialsLink && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Tài liệu</p>
                                  <a href={sess.materialsLink} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                                    <Link2 className="w-3.5 h-3.5" /> {sess.materialsLink}
                                  </a>
                                </div>
                              )}
                              {sess.homeworks.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Bài tập</p>
                                  <div className="space-y-2">
                                    {sess.homeworks.map(hw => {
                                      const Icon = hwTypeIcon[hw.type];
                                      return (
                                        <div key={hw.id} className="flex items-start gap-3 p-2.5 bg-muted/30 rounded-lg">
                                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium flex-shrink-0 ${hwTypeColor[hw.type]}`}>
                                            <Icon className="w-3 h-3" />{hwTypeLabel[hw.type]}
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-sm font-medium text-foreground">{hw.title}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{hw.description}</p>
                                            {hw.externalLink && <a href={hw.externalLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-0.5 flex items-center gap-1"><Link2 className="w-3 h-3" />Mở link</a>}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {selectedSyllabus.sessions.length === 0 && (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Chưa có session nào</p>
          <p className="text-sm mt-1">Bấm "Thêm Session" để bắt đầu xây dựng giáo trình</p>
        </div>
      )}
      </>)}

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
