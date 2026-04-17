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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { users as appUsers, classes as allClasses, branches as allBranches } from "@/data/mockData";

type Stage = Task["stage"];

const stageConfig: Record<Task["stage"], { label: string; color: string; icon: any; textColor: string }> = {
  todo: { label: "Cần làm", color: "bg-blue-50", textColor: "text-blue-600", icon: ClipboardList },
  in_progress: { label: "Đang làm", color: "bg-amber-50", textColor: "text-amber-600", icon: Clock },
  done: { label: "Hoàn thành", color: "bg-emerald-50", textColor: "text-emerald-600", icon: CheckCircle2 },
  overdue: { label: "Trễ hạn", color: "bg-rose-50", textColor: "text-rose-600", icon: AlertCircle },
  pending: { label: "Tạm dừng", color: "bg-slate-50", textColor: "text-slate-600", icon: Clock3 },
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

  // Filters State
  const [branchFilter, setBranchFilter] = useState("Tất cả");
  const [deptFilter, setDeptFilter] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  // Interaction State
  const [isOpen, setIsOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"task" | "order">("task");
  
  // Common fields
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState(appUsers[0]?.name || "Admin");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("medium");
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDesc, setNewDesc] = useState("");
  
  // Task specific
  const [newDept, setNewDept] = useState("Vận hành");
  const [newTaskType, setNewTaskType] = useState("Hành chính");
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Order specific
  const [useDate, setUseDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(allBranches[0]?.name || "Đội Cấn");
  const [orderType, setOrderType] = useState("Order đạo cụ lớp học");
  const [orderContent, setOrderContent] = useState("Flashcard");
  const [printSpecs, setPrintSpecs] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [lesson, setLesson] = useState("");
  const [resourceLink, setResourceLink] = useState("");

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle && activeTab === 'task') return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newTask: Task = {
      id: `${activeTab === 'task' ? 'TSK' : 'ORD'}${100 + taskList.length}`,
      title: activeTab === 'task' ? newTitle : `Order ${orderContent} - ${selectedClass}`,
      assignee: newAssignee,
      priority: newPriority,
      dueDate: activeTab === 'task' ? newDueDate : useDate,
      stage: "todo",
      type: activeTab,
      createdBy: isTeacher ? "Sarah Johnson" : "Admin", // Demo logic
      ...(activeTab === 'order' ? {
        useDate,
        className: selectedClass,
        branch: selectedBranch,
        orderType,
        orderContent,
        printSpecs,
        quantity,
        lesson,
        resourceLink
      } : {})
    };

    setTaskList(prev => [newTask, ...prev]);
    setIsSubmitting(false);
    setIsOpen(false);
    resetForm();
    
    toast.success(activeTab === 'task' ? "Nhiệm vụ mới đã được phân công!" : "Yêu cầu order đã được gửi!", {
      description: `Đã thêm vào cột Cần làm.`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    });
  };

  const resetForm = () => {
    setNewTitle("");
    setNewDesc("");
    setNewDept("Vận hành");
    setNewTaskType("Hành chính");
    setOrderContent("Flashcard");
    setQuantity(1);
    setLesson("");
    setResourceLink("");
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
  
  // Filtering logic
  const filteredTasks = taskList.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (t.className && t.className.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBranch = branchFilter === "Tất cả" || t.branch === branchFilter;
    const matchesDept = deptFilter === "Tất cả" || t.dept === deptFilter;
    const matchesStatus = statusFilter === "Tất cả" || t.stage === statusFilter;
    
    if (isTeacher) {
      // Giảng viên thấy việc được giao cho mình HOẶC việc do mình tạo ra (Order)
      return (t.assignee === "Sarah Johnson" || t.createdBy === "Sarah Johnson") && 
             matchesSearch && matchesBranch && matchesDept && matchesStatus;
    }
    return matchesSearch && matchesBranch && matchesDept && matchesStatus;
  });

  // Chỉ hiện các phòng ban có trong danh sách việc hiện tại của user
  const visibleTasksForDept = isTeacher 
    ? taskList.filter(t => t.assignee === "Sarah Johnson" || t.createdBy === "Sarah Johnson")
    : taskList;
  const departments = Array.from(new Set(visibleTasksForDept.map(t => t.dept))).filter(Boolean);

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

           {(isAdmin || isTeacher) && (
             <Dialog open={isOpen} onOpenChange={setIsOpen}>
               <DialogTrigger asChild>
                 <button className="px-5 py-2.5 bg-primary text-primary-foreground text-sm rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2">
                   <Plus className="w-4 h-4" /> Nhiệm vụ
                 </button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[1000px] rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0 bg-white">
                  <div className="bg-primary/5 p-8 border-b border-primary/10">
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-black text-slate-800 tracking-tight">Tạo nhiệm vụ mới</DialogTitle>
                      <p className="text-sm text-slate-500 font-bold italic tracking-tight mt-1">Phân công công việc chi tiết cho nhân sự trên hệ thống.</p>
                    </DialogHeader>
                  </div>

                   <form onSubmit={handleCreateTask} className="p-8 space-y-6">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 rounded-2xl p-1 bg-slate-100 mb-6">
                        <TabsTrigger value="task" className="rounded-xl font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Nhiệm vụ</TabsTrigger>
                        <TabsTrigger value="order" className="rounded-xl font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">Order giáo cụ</TabsTrigger>
                      </TabsList>

                      <TabsContent value="task" className="space-y-6 mt-0">
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
                            required={activeTab === 'task'}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                               <Building2 className="w-3.5 h-3.5" /> Phòng ban
                            </Label>
                            <select 
                              className="w-full h-12 px-4 py-2 border border-slate-200 rounded-2xl text-sm bg-slate-50 font-bold"
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
                              className="w-full h-12 px-4 py-2 border border-slate-200 rounded-2xl text-sm bg-slate-50 font-bold"
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
                               <Clock3 className="w-3.5 h-3.5" /> Ngày bắt đầu
                            </Label>
                            <Input 
                              type="date"
                              value={newStartDate}
                              onChange={(e) => setNewStartDate(e.target.value)}
                              className="rounded-2xl border-slate-200 h-12 font-bold bg-slate-50"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="order" className="space-y-6 mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                              <Calendar className="w-3.5 h-3.5" /> Ngày cần SD *
                            </Label>
                            <Input 
                              type="date"
                              value={useDate}
                              onChange={(e) => setUseDate(e.target.value)}
                              className="rounded-2xl border-slate-200 h-12 font-bold bg-slate-50"
                              required={activeTab === 'order'}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                              <Building2 className="w-3.5 h-3.5" /> Cơ sở
                            </Label>
                            <select 
                              className="w-full h-12 px-4 py-2 border border-slate-200 rounded-2xl text-sm bg-slate-50 font-bold"
                              value={selectedBranch}
                              onChange={(e) => setSelectedBranch(e.target.value)}
                            >
                              {allBranches.map(b => (
                                <option key={b.id} value={b.name}>{b.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                              <LayoutGrid className="w-3.5 h-3.5" /> Lớp học
                            </Label>
                            <select 
                              className="w-full h-12 px-4 py-2 border border-slate-200 rounded-2xl text-sm bg-slate-50 font-bold"
                              value={selectedClass}
                              onChange={(e) => setSelectedClass(e.target.value)}
                              required={activeTab === 'order'}
                            >
                              <option value="">Chọn lớp học...</option>
                              {allClasses.map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                              <Tag className="w-3.5 h-3.5" /> Loại order
                            </Label>
                            <select 
                              className="w-full h-12 px-4 py-2 border border-slate-200 rounded-2xl text-sm bg-slate-50 font-bold"
                              value={orderType}
                              onChange={(e) => setOrderType(e.target.value)}
                            >
                              <option value="Order đạo cụ lớp học">Order đạo cụ lớp học</option>
                              <option value="Order in ấn">Order in ấn</option>
                              <option value="Khác">Khác</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Nội dung
                            </Label>
                            <select 
                              className="w-full h-12 px-4 py-2 border border-slate-200 rounded-2xl text-sm bg-slate-50 font-bold"
                              value={orderContent}
                              onChange={(e) => setOrderContent(e.target.value)}
                            >
                              <option value="Flashcard">Flashcard</option>
                              <option value="Worksheet">Worksheet</option>
                              <option value="Check test">Check test</option>
                              <option value="Bigtest">Bigtest</option>
                              <option value="Phiếu ôn tập">Phiếu ôn tập</option>
                              <option value="Minitest">Minitest</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                               <Info className="w-3.5 h-3.5" /> Số lượng
                            </Label>
                            <Input 
                              type="number"
                              value={quantity}
                              onChange={(e) => setQuantity(parseInt(e.target.value))}
                              className="rounded-2xl border-slate-200 h-12 font-bold bg-slate-50"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                            <AlignLeft className="w-3.5 h-3.5" /> Bài học & Link tài liệu
                          </Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                              placeholder="Tên bài học..." 
                              value={lesson}
                              onChange={(e) => setLesson(e.target.value)}
                              className="rounded-2xl border-slate-200 h-12 font-bold bg-slate-50"
                            />
                            <Input 
                              placeholder="Link tải tài liệu (Google Drive...)" 
                              value={resourceLink}
                              onChange={(e) => setResourceLink(e.target.value)}
                              className="rounded-2xl border-slate-200 h-12 font-bold bg-slate-50"
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="space-y-6 pt-4 border-t border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                             <User className="w-3.5 h-3.5" /> Người thực hiện
                          </Label>
                          <select 
                            className="w-full h-12 px-4 py-2 border border-slate-200 rounded-2xl text-sm bg-slate-50 font-bold"
                            value={newAssignee}
                            onChange={(e) => setNewAssignee(e.target.value)}
                          >
                            {appUsers.map(user => (
                              <option key={user.id} value={user.name}>{user.name} ({user.role})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                             <AlertCircle className="w-3.5 h-3.5" /> Ưu tiên
                          </Label>
                          <select 
                            className="w-full h-12 px-4 py-2 border border-slate-200 rounded-2xl text-sm bg-slate-50 font-bold"
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
                             <Clock3 className="w-3.5 h-3.5" /> Hạn chót
                          </Label>
                          <Input 
                            type="date"
                            value={newDueDate}
                            onChange={(e) => setNewDueDate(e.target.value)}
                            className="rounded-2xl border-slate-200 h-12 font-bold bg-slate-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 px-1">
                           <AlignLeft className="w-3.5 h-3.5" /> Ghi chú thêm
                        </Label>
                        <textarea 
                          className="w-full min-h-[80px] p-4 border border-slate-200 rounded-3xl text-sm bg-slate-50 font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          placeholder="Mô tả cụ thể các yêu cầu đính kèm..."
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                        />
                      </div>
                    </div>

                    <DialogFooter className="pt-4">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full h-16 rounded-[1.5rem] font-black text-base uppercase tracking-widest shadow-xl shadow-primary/20 bg-primary"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Đang xử lý...
                          </div>
                        ) : (
                          activeTab === 'task' ? "Giao việc ngay" : "Gửi yêu cầu Order"
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

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="space-y-2 flex-1 min-w-[200px]">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tìm kiếm</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Tiêu đề, lớp học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-2 w-48">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cơ sở</Label>
          <select 
            className="w-full h-10 px-3 border border-slate-100 rounded-xl text-sm bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-primary/20"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="Tất cả">Tất cả chi nhánh</option>
            {allBranches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>
        </div>

        <div className="space-y-2 w-48">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phòng ban</Label>
          <select 
            className="w-full h-10 px-3 border border-slate-100 rounded-xl text-sm bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-primary/20"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="Tất cả">Tất cả phòng ban</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="space-y-2 w-48">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Trạng thái</Label>
          <select 
            className="w-full h-10 px-3 border border-slate-100 rounded-xl text-sm bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-primary/20"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Tất cả">Tất cả trạng thái</option>
            {Object.entries(stageConfig).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="font-black text-[10px] uppercase tracking-widest w-[100px] text-center">Mã</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest">Nhiệm vụ / Nội dung</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest">Phòng ban</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest">Người thực hiện</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest">Yêu cầu bởi</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest">Thời hạn</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-center">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((t) => {
              const cfg = stageConfig[t.stage];
              return (
                <TableRow 
                  key={t.id} 
                  className="group cursor-pointer hover:bg-slate-50/80 transition-all border-slate-50"
                  onClick={() => {
                    setSelectedTask(t);
                    setIsDetailOpen(true);
                  }}
                >
                  <TableCell className="text-center">
                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                      {t.id}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 flex items-center gap-2">
                        {t.type === 'order' && <Tag className="w-3 h-3 text-purple-500" />}
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2">
                         <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${priorityConfig[t.priority].color}`}>
                            {priorityConfig[t.priority].label}
                         </span>
                         {t.branch && <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1"><Building2 className="w-3 h-3" /> {t.branch}</span>}
                         {t.className && <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded uppercase">{t.className}</span>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                      {t.dept}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary">
                        {t.assignee.charAt(0)}
                      </div>
                      {t.assignee}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-slate-500 italic">
                      {t.createdBy || "System"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className={`text-xs font-black ${t.stage === 'overdue' ? 'text-rose-600' : 'text-slate-700'}`}>
                        {t.type === 'order' ? t.useDate : t.dueDate}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">Tạo: {t.createdAt}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${cfg.color} ${cfg.textColor}`}>
                      <cfg.icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        {filteredTasks.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-300">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-bold text-lg">Không tìm thấy kết quả nào</p>
            <p className="text-sm">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0 bg-white">
          {selectedTask && (
            <>
              <div className={`p-8 border-b ${stageConfig[selectedTask.stage].color}`}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{selectedTask.id} • {selectedTask.type === 'order' ? 'Order Giáo cụ' : 'Nhiệm vụ'}</span>
                    <DialogTitle className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
                      {selectedTask.title}
                    </DialogTitle>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${stageConfig[selectedTask.stage].color} ${stageConfig[selectedTask.stage].textColor} border border-current/10`}>
                    {stageConfig[selectedTask.stage].label}
                  </span>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Người thực hiện</Label>
                    <p className="font-bold text-slate-700 flex items-center gap-2"><User className="w-4 h-4" /> {selectedTask.assignee}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phòng ban</Label>
                    <p className="font-bold text-slate-700 flex items-center gap-2"><Building2 className="w-4 h-4" /> {selectedTask.dept}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ưu tiên</Label>
                    <p className={`font-bold flex items-center gap-2 ${priorityConfig[selectedTask.priority].color.split(' ')[1]}`}>
                      <AlertCircle className="w-4 h-4" /> {priorityConfig[selectedTask.priority].label}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-slate-50">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                       <Clock className="w-4 h-4" /> Tiến độ thời gian
                    </Label>
                    <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                       <div className="flex justify-between text-xs">
                          <span className="text-slate-400 font-medium">Ngày tạo:</span>
                          <span className="font-bold">{selectedTask.createdAt}</span>
                       </div>
                       <div className="flex justify-between text-xs">
                          <span className="text-slate-400 font-medium">Hạn chót/Ngày dùng:</span>
                          <span className="font-black text-rose-500">{selectedTask.type === 'order' ? selectedTask.useDate : selectedTask.dueDate}</span>
                       </div>
                    </div>
                  </div>

                  {selectedTask.type === 'order' && (
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                         <LayoutGrid className="w-4 h-4" /> Thông tin bổ sung
                      </Label>
                      <div className="bg-blue-50/50 p-4 rounded-2xl space-y-2">
                         <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-medium">Lớp:</span>
                            <span className="font-black text-blue-600 uppercase">{selectedTask.className}</span>
                         </div>
                         <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-medium">Cơ sở:</span>
                            <span className="font-bold">{selectedTask.branch}</span>
                         </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <AlignLeft className="w-4 h-4" /> Chi tiết nội dung
                   </Label>
                   <div className="p-5 bg-slate-50 rounded-2xl min-h-[100px] text-sm text-slate-600 leading-relaxed font-medium">
                      {selectedTask.orderContent && (
                        <p className="mb-2 pb-2 border-b border-slate-200">
                          <strong>Yêu cầu:</strong> {selectedTask.orderContent} 
                          {selectedTask.quantity && <span> (SL: {selectedTask.quantity})</span>}
                          {selectedTask.lesson && <span> - Bài học: {selectedTask.lesson}</span>}
                        </p>
                      )}
                      {selectedTask.resourceLink && (
                        <p className="mb-2 text-blue-600 underline">
                          <strong>Link tài liệu:</strong> <a href={selectedTask.resourceLink} target="_blank" rel="noreferrer">Click để xem</a>
                        </p>
                      )}
                      {selectedTask.printSpecs && (
                        <p className="mb-2"><strong>Quy cách:</strong> {selectedTask.printSpecs}</p>
                      )}
                      {selectedTask.createdBy && (
                        <p className="mt-4 pt-4 border-t border-slate-200 text-xs italic opacity-70">
                          Yêu cầu bởi: {selectedTask.createdBy}
                        </p>
                      )}
                   </div>
                </div>
              </div>

              <DialogFooter className="p-8 bg-slate-50/50 pt-0">
                 <div className="flex gap-3 w-full">
                    {selectedTask.stage !== 'done' && (
                      <Button 
                        onClick={() => {
                          handleUpdateStage(selectedTask.id, 'done');
                          setIsDetailOpen(false);
                        }}
                        className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black uppercase tracking-widest text-[10px]"
                      >
                         Hoàn thành nhiệm vụ
                      </Button>
                    )}
                    <Button 
                      variant="outline"
                      onClick={() => setIsDetailOpen(false)}
                      className="h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-[10px] border-slate-200"
                    >
                       Đóng
                    </Button>
                 </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksPage;
