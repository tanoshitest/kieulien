import React, { useState } from "react";
import { tasks as initialTasks, type Task } from "@/data/mockData";
import { useRole } from "@/contexts/RoleContext";
import { 
  ClipboardList, CheckCircle2, Clock, AlertCircle, 
  Search, Filter, Plus, MoreVertical, Calendar,
  LayoutGrid, List as ListIcon, User, Loader2,
  Building2, Tag, Clock3, AlignLeft, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Stage = Task["stage"];

const stageConfig: Record<Stage, { label: string; color: string; icon: any }> = {
  todo: { label: "Cần làm", color: "bg-kanban-new", icon: ClipboardList },
  in_progress: { label: "Đang làm", color: "bg-kanban-progress", icon: Clock },
  done: { label: "Hoàn thành", color: "bg-kanban-done", icon: CheckCircle2 },
};

const priorityConfig = {
  low: { label: "Thấp", color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  medium: { label: "Trung bình", color: "bg-amber-50 text-amber-600", dot: "bg-amber-400" },
  high: { label: "Cao", color: "bg-rose-50 text-rose-600", dot: "bg-rose-500" },
};

const stages: Stage[] = ["todo", "in_progress", "done"];

const TasksPage = () => {
  const { isTeacher, isAdmin } = useRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [taskList, setTaskList] = useState([...initialTasks]);

  // Interactive Demo State
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState("Admin");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("medium");
  const [newDept, setNewDept] = useState("Vận hành");
  const [newTaskType, setNewTaskType] = useState("Hành chính");
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEndDate, setNewEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDesc, setNewDesc] = useState("");

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newTask: Task = {
      id: `TSK${100 + taskList.length}`,
      title: newTitle,
      assignee: newAssignee,
      priority: newPriority,
      dueDate: new Date().toISOString().split('T')[0],
      stage: "todo"
    };

    setTaskList(prev => [newTask, ...prev]);
    setIsSubmitting(false);
    setIsOpen(false);
    setNewTitle("");
    setNewDesc("");
    setNewDept("Vận hành");
    setNewTaskType("Hành chính");
    
    toast.success("Nhiệm vụ mới đã được phân công!", {
      description: `Task "${newTitle}" đã được thêm vào cột Cần làm.`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    });
  };

  const handleUpdateStage = (taskId: string, newStage: Stage) => {
    setTaskList(prev => prev.map(t => 
      t.id === taskId ? { ...t, stage: newStage } : t
    ));
    const label = stageConfig[newStage].label;
    toast.success(`Nhiệm vụ đã chuyển sang "${label}"`, {
      description: "Hệ thống đã cập nhật tiến độ công việc của bạn.",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    });
  };
  
  // For demo, if teacher, show only Sarah Johnson's tasks
  const filteredTasks = taskList.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (isTeacher) {
      return t.assignee === "Sarah Johnson" && matchesSearch;
    }
    return matchesSearch;
  });

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50/30 min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border ${isTeacher ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-primary/10 text-primary border-primary/20'}`}>
               <ClipboardList className="w-6 h-6" />
            </div>
            {isTeacher ? "Công việc của tôi" : "Phân công công việc"}
          </h1>
          <p className="text-muted-foreground font-bold mt-2 ml-15">
            {isTeacher 
              ? "Quản lý và theo dõi các nhiệm vụ giảng dạy được phân công." 
              : "Quản lý hệ thống nhiệm vụ và tiến độ công việc của toàn bộ nhân viên."}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Tìm kiếm công việc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 shadow-sm"
              />
           </div>

           {isAdmin && (
             <Dialog open={isOpen} onOpenChange={setIsOpen}>
               <DialogTrigger asChild>
                 <button className="px-5 py-2.5 bg-primary text-primary-foreground text-sm rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2">
                   <Plus className="w-4 h-4" /> Nhiệm vụ
                 </button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0 bg-white">
                  <div className="bg-primary/5 p-8 border-b border-primary/10">
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-black text-slate-800 tracking-tight">Tạo nhiệm vụ mới</DialogTitle>
                      <p className="text-sm text-slate-500 font-bold italic tracking-tight mt-1">Phân công công việc chi tiết cho nhân sự trên hệ thống.</p>
                    </DialogHeader>
                  </div>

                  <form onSubmit={handleCreateTask} className="p-8 space-y-8">
                    <div className="space-y-6">
                      {/* Full Width Field */}
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                          <Info className="w-3.5 h-3.5" /> Tiêu đề công việc *
                        </Label>
                        <Input 
                          id="title" 
                          placeholder="Ví dụ: Chuẩn bị tài liệu ôn tập lớp CLC..." 
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="rounded-2xl border-slate-200 focus:ring-primary/20 h-14 text-base font-bold shadow-sm"
                          required
                        />
                      </div>

                      {/* 2-Column Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                             <User className="w-3.5 h-3.5" /> Người thực hiện
                          </Label>
                          <select 
                            className="w-full h-12 px-4 py-2 border border-slate-200 rounded-2xl text-sm bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                            value={newAssignee}
                            onChange={(e) => setNewAssignee(e.target.value)}
                          >
                            <option value="Admin">Admin</option>
                            <option value="Sarah Johnson">Sarah Johnson</option>
                            <option value="Nguyễn Thị Phượng">Nguyễn Thị Phượng</option>
                            <option value="Lê Hoàng Nam">Lê Hoàng Nam</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                             <Building2 className="w-3.5 h-3.5" /> Phòng ban
                          </Label>
                          <select 
                            className="w-full h-12 px-4 py-2 border border-slate-200 rounded-2xl text-sm bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                            value={newDept}
                            onChange={(e) => setNewDept(e.target.value)}
                          >
                            <option value="Đào tạo">Phòng Đào tạo</option>
                            <option value="Kinh doanh">Phòng Tuyển sinh</option>
                            <option value="Vận hành">Phòng Vận hành</option>
                            <option value="Kế toán">Phòng Kế toán</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                             <Tag className="w-3.5 h-3.5" /> Loại công việc
                          </Label>
                          <select 
                            className="w-full h-12 px-4 py-2 border border-slate-200 rounded-2xl text-sm bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                            value={newTaskType}
                            onChange={(e) => setNewTaskType(e.target.value)}
                          >
                            <option value="Hành chính">Công việc Hành chính</option>
                            <option value="Chuyên môn">Chuyên môn giảng dạy</option>
                            <option value="Tài chính">Tài chính / Học phí</option>
                            <option value="Họp">Họp / Event</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                             <AlertCircle className="w-3.5 h-3.5" /> Ưu tiên
                          </Label>
                          <select 
                            className="w-full h-12 px-4 py-2 border border-slate-200 rounded-2xl text-sm bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                            value={newPriority}
                            onChange={(e) => setNewPriority(e.target.value as any)}
                          >
                            <option value="low">Thấp</option>
                            <option value="medium">Trung bình</option>
                            <option value="high">Cao</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                             <Clock3 className="w-3.5 h-3.5" /> Ngày bắt đầu
                          </Label>
                          <Input 
                            type="date"
                            value={newStartDate}
                            onChange={(e) => setNewStartDate(e.target.value)}
                            className="rounded-2xl border-slate-200 focus:ring-primary/20 h-12 font-bold bg-slate-50"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                             <Clock3 className="w-3.5 h-3.5" /> Hạn chót
                          </Label>
                          <Input 
                            type="date"
                            value={newEndDate}
                            onChange={(e) => setNewEndDate(e.target.value)}
                            className="rounded-2xl border-slate-200 focus:ring-primary/20 h-12 font-bold bg-slate-50"
                          />
                        </div>
                      </div>

                      {/* Textarea Description */}
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                           <AlignLeft className="w-3.5 h-3.5" /> Chi tiết công việc
                        </Label>
                        <textarea 
                          className="w-full min-h-[100px] p-4 border border-slate-200 rounded-3xl text-sm bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="Mô tả cụ thể các đầu việc cần làm..."
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                        />
                      </div>
                    </div>

                    <DialogFooter className="pt-4">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full h-16 rounded-[1.5rem] font-black text-base uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 bg-primary overflow-hidden relative"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Đang phân công...
                          </div>
                        ) : (
                          "Giao việc ngay"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
             </Dialog>
           )}
        </div>
      </div>

      {isTeacher && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                 {filteredTasks.filter(t => t.stage === 'todo').length}
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase opacity-50">Cần làm</p>
                 <p className="text-sm font-black">Nhiệm vụ mới</p>
              </div>
           </div>
           <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                 {filteredTasks.filter(t => t.stage === 'in_progress').length}
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase opacity-50">Đang làm</p>
                 <p className="text-sm font-black">Tiến độ</p>
              </div>
           </div>
           <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                 {filteredTasks.filter(t => t.stage === 'done').length}
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase opacity-50">Hoàn thành</p>
                 <p className="text-sm font-black">Đã xong</p>
              </div>
           </div>
           <div className="bg-primary p-4 rounded-3xl shadow-lg shadow-primary/20 flex items-center gap-4 text-white">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                 <Calendar className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase opacity-70">Hôm nay</p>
                 <p className="text-sm font-black">Thứ 5, 26/03</p>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stages.map((stage) => {
          const items = filteredTasks.filter((t) => t.stage === stage);
          const cfg = stageConfig[stage];
          return (
            <div key={stage} className={`flex flex-col h-full rounded-lg border overflow-hidden`}>
              <div className={`px-3 py-2 ${cfg.color} flex items-center justify-between`}>
                 <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{cfg.label}</span>
                 </div>
                 <span className="text-xs bg-card rounded-full px-2 py-0.5 font-bold">
                    {items.length}
                 </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-secondary/30 min-h-[300px]">
                <AnimatePresence mode="popLayout">
                  {items.map((t) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      key={t.id} 
                      className="kanban-card group"
                    >
                      <div className="flex items-start justify-between mb-2">
                         <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${priorityConfig[t.priority].color}`}>
                            {priorityConfig[t.priority].label}
                         </span>
                         
                         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {stage !== 'in_progress' && stage !== 'done' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleUpdateStage(t.id, 'in_progress'); }}
                                className="p-1 hover:bg-amber-100 text-amber-600 rounded-md transition-all active:scale-90"
                                title="Đang làm"
                              >
                                 <Clock className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {stage !== 'done' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleUpdateStage(t.id, 'done'); }}
                                className="p-1 hover:bg-emerald-100 text-emerald-600 rounded-md transition-all active:scale-90"
                                title="Đã xong"
                              >
                                 <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                         </div>
                      </div>
                      
                      <h3 className="font-bold text-sm leading-snug mb-3">
                         {t.title}
                      </h3>
                      
                      <div className="flex items-center justify-between pt-2 border-t text-muted-foreground">
                         <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="text-[10px] font-medium">{t.assignee}</span>
                         </div>
                         <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-medium">{t.dueDate}</span>
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {items.length === 0 && (
                   <div className="flex flex-col items-center justify-center py-10 opacity-20 filter grayscale">
                      <cfg.icon className="w-10 h-10 mb-2" />
                      <span className="text-xs font-bold">Trống</span>
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TasksPage;
