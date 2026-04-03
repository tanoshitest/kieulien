import React, { useState } from "react";
import { 
  courseCategories as initialCategories, 
  courseLevels as initialLevels, 
  classes as initialClasses, 
  users,
  CourseCategory, 
  CourseLevel, 
  ClassItem 
} from "@/data/mockData";
import { 
  BookOpen, ChevronDown, ChevronRight, 
  Users, Layers, GraduationCap, ArrowRight, Clock,
  Plus, Loader2, CheckCircle2, Calendar, MapPin,
  ClipboardList, User, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n) + "đ";

const CoursesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CourseCategory[]>([...initialCategories]);
  const [currentClasses, setCurrentClasses] = useState<ClassItem[]>([...initialClasses]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});
  
  // Interactive Demo State for Add Class
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formLevelId, setFormLevelId] = useState("");
  const [formClassName, setFormClassName] = useState("");
  const [formTeacherId, setFormTeacherId] = useState("");
  const [formSchedule, setFormSchedule] = useState("");
  const [formRoom, setFormRoom] = useState("");
  const [formMaxStudents, setFormMaxStudents] = useState("15");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");

  const teachers = users.filter(u => u.role === "teacher");

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClassName || !formLevelId) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const selectedLevel = initialLevels.find(l => l.id === formLevelId);
    
    const newClass: ClassItem = {
      id: `CLS_${Date.now()}`,
      name: formClassName,
      course: selectedLevel?.name || "Khóa học mới",
      teacherId: formTeacherId,
      schedule: formSchedule || "Chưa xếp lịch",
      room: formRoom || "Chưa xếp phòng",
      studentCount: 0,
      maxStudents: parseInt(formMaxStudents),
      startDate: formStartDate || "2024-03-28",
      endDate: formEndDate || "2024-09-28",
      status: "active",
      levelId: formLevelId
    };

    setCurrentClasses(prev => [...prev, newClass]);
    setIsSubmitting(false);
    setIsOpen(false);
    
    // Auto-expand the newly created class parent
    if (formCategoryId) {
      setExpandedCategories(prev => ({ ...prev, [formCategoryId]: true }));
    }
    setExpandedLevels(prev => ({ ...prev, [formLevelId]: true }));
    
    // Reset Form
    setFormCategoryId("");
    setFormLevelId("");
    setFormClassName("");
    setFormTeacherId("");
    setFormSchedule("");
    setFormRoom("");
    setFormMaxStudents("15");
    setFormStartDate("");
    setFormEndDate("");
    
    toast.success("Khởi tạo lớp học mới thành công!", {
      description: `Lớp ${formClassName} đã được thêm vào hệ thống.`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    });
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleLevel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedLevels(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getLevelsForCategory = (categoryId: string) => {
    return initialLevels.filter(l => l.categoryId === categoryId);
  };

  const getClassesForLevel = (levelId: string) => {
    return currentClasses.filter(c => c.levelId === levelId);
  };

  const availableLevels = formCategoryId 
    ? initialLevels.filter(l => l.categoryId === formCategoryId)
    : [];

  return (
    <div className="p-4 md:p-6 flex flex-col h-full bg-[#f8f9fa]">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-800">Quản lý lớp học</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5 ">Sơ đồ đào tạo & Lộ trình học viên</p>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-wider text-[10px] h-8 px-4 shadow-lg shadow-primary/20">
              <Plus className="w-3.5 h-3.5 mr-2" />
              Thêm lớp học
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="p-6 bg-white border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-black uppercase tracking-tight text-slate-800">Thêm lớp học mới</DialogTitle>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Khởi tạo lớp học theo danh mục chương trình</p>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleCreateClass} className="bg-slate-50/50">
              <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-5">
                {/* Section 1: Hierarchy */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary">Phân loại lớp học</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Hệ chương trình (*)</Label>
                    <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                      <SelectTrigger className="h-10 bg-white border-slate-200 rounded-xl font-bold text-xs uppercase cursor-pointer">
                        <SelectValue placeholder="Chọn hệ đào tạo" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id} className="font-bold text-xs uppercase cursor-pointer">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cấp độ / Trình độ (*)</Label>
                    <Select value={formLevelId} onValueChange={setFormLevelId} disabled={!formCategoryId}>
                      <SelectTrigger className="h-10 bg-white border-slate-200 rounded-xl font-bold text-xs uppercase cursor-pointer">
                        <SelectValue placeholder={formCategoryId ? "Chọn cấp độ" : "Vui lòng chọn hệ trước"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLevels.map(lvl => (
                          <SelectItem key={lvl.id} value={lvl.id} className="font-bold text-xs uppercase cursor-pointer">
                            {lvl.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tên lớp học (*)</Label>
                    <Input 
                      placeholder="Ví dụ: Starter A1 - Sáng T7/CN" 
                      value={formClassName}
                      onChange={(e) => setFormClassName(e.target.value)}
                      className="h-10 bg-white border-slate-200 rounded-xl font-bold text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Giảng viên</Label>
                    <Select value={formTeacherId} onValueChange={setFormTeacherId}>
                      <SelectTrigger className="h-10 bg-white border-slate-200 rounded-xl font-bold text-xs cursor-pointer">
                        <SelectValue placeholder="Chọn giảng viên" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map(t => (
                          <SelectItem key={t.id} value={t.id} className="font-bold text-xs cursor-pointer">
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Section 2: Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary">Thông tin vận hành</span>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Lịch học</Label>
                    <Input 
                      placeholder="Ví dụ: T2, T4, T6 | 18:30-20:00" 
                      value={formSchedule}
                      onChange={(e) => setFormSchedule(e.target.value)}
                      className="h-10 bg-white border-slate-200 rounded-xl font-bold text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phòng học</Label>
                      <Input 
                        placeholder="Room A1" 
                        value={formRoom}
                        onChange={(e) => setFormRoom(e.target.value)}
                        className="h-10 bg-white border-slate-200 rounded-xl font-bold text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sĩ số tối đa</Label>
                      <Input 
                        type="number"
                        value={formMaxStudents}
                        onChange={(e) => setFormMaxStudents(e.target.value)}
                        className="h-10 bg-white border-slate-200 rounded-xl font-bold text-xs text-center"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ngày bắt đầu</Label>
                      <Input 
                        type="date"
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="h-10 bg-white border-slate-200 rounded-xl font-bold text-[10px] uppercase"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ngày kết thúc</Label>
                      <Input 
                        type="date"
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                        className="h-10 bg-white border-slate-200 rounded-xl font-bold text-[10px] uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="p-6 bg-white border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-xl px-6"
                >
                  Hủy bỏ
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="h-11 rounded-xl font-black text-xs uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/20 px-10"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : "Khởi tạo lớp học"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories List */}
      <div className="flex-1 space-y-4 overflow-auto pb-6">
        <AnimatePresence mode="popLayout">
          {categories.map((category) => {
            const catLevels = getLevelsForCategory(category.id);
            const isCatExpanded = expandedCategories[category.id];
          
            const totalClassesInCat = catLevels.reduce((sum, lvl) => sum + getClassesForLevel(lvl.id).length, 0);
            const totalStudentsInCat = catLevels.reduce((sum, lvl) => {
              return sum + getClassesForLevel(lvl.id).reduce((s, c) => s + c.studentCount, 0);
            }, 0);

            return (
              <motion.div 
                key={category.id} 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Level 1 Header: Category */}
                <div 
                  onClick={() => toggleCategory(category.id)}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-all ${
                    isCatExpanded ? 'bg-slate-50 border-b border-slate-100 shadow-inner' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${category.color.replace('500', '600')} shadow-sm`}>
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">{category.name}</h2>
                      <p className="text-[10px] font-bold text-slate-400  font-mono">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="hidden md:flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-100"><BookOpen className="w-3 h-3 text-primary" /> {totalClassesInCat} Lớp</span>
                      <span className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-100"><Users className="w-3 h-3 text-emerald-500" /> {totalStudentsInCat} HS</span>
                    </div>
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300 ${isCatExpanded ? 'bg-primary text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Level 2: Sub-Levels */}
                <AnimatePresence>
                  {isCatExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-white mt-[-1px]"
                    >
                      <div className="p-3 bg-slate-50/30 space-y-3">
                        {catLevels.map(level => {
                          const levelClasses = getClassesForLevel(level.id);
                          const isLevelExpanded = expandedLevels[level.id];
                          const totalStudentsInLevel = levelClasses.reduce((s, c) => s + c.studentCount, 0);

                          return (
                            <div key={level.id} className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
                              {/* Level Section Header */}
                              <div 
                                onClick={(e) => toggleLevel(level.id, e)}
                                className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                                  isLevelExpanded ? 'bg-[#f1f3f5] border-b' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`transition-transform duration-200 ${isLevelExpanded ? 'rotate-90 text-primary' : 'text-slate-400'}`}>
                                    <ChevronRight className="w-4 h-4" />
                                  </div>
                                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-tight">{level.name}</h3>
                                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded border border-blue-100 tracking-tighter ml-1">
                                    {level.durationInMonths} Tháng
                                  </span>
                                </div>
                                <div className="flex items-center gap-6">
                                  <div className="text-[10px] font-black uppercase text-slate-400 border-r border-slate-200 pr-5 hidden md:block ">
                                    Học phí: <span className="text-slate-800 font-mono tracking-tighter">{formatVND(level.fee)}</span>
                                  </div>
                                  <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-400">
                                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {levelClasses.length} Lớp</span>
                                    <span className="flex items-center gap-1.5"><GraduationCap className="w-3 h-3" /> {totalStudentsInLevel} HS</span>
                                  </div>
                                </div>
                              </div>

                              {/* Level 3: Class Grid */}
                              <AnimatePresence>
                                {isLevelExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="bg-slate-50/50"
                                  >
                                    <div className="p-3 space-y-2">
                                      {levelClasses.map(cls => (
                                        <div 
                                          key={cls.id} 
                                          onClick={() => navigate(`/classes/${cls.id}`)}
                                          className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                                        >
                                          <div className="flex items-center gap-6 flex-1">
                                            <div className="w-1.5 h-8 bg-slate-100 rounded-full group-hover:bg-primary transition-colors" />
                                            
                                            <div className="min-w-[200px]">
                                              <h4 className="text-xs font-black text-slate-800 uppercase group-hover:text-primary transition-colors tracking-tight">
                                                {cls.name}
                                              </h4>
                                              <div className="flex items-center gap-2 mt-1">
                                                <div className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded border border-emerald-100 tracking-tighter">
                                                  Hoạt động
                                                </div>
                                              </div>
                                            </div>

                                            <div className="hidden lg:grid grid-cols-3 gap-x-12 gap-y-1 flex-1 max-w-2xl px-8">
                                              <div className="flex items-center gap-2 text-[10px]">
                                                <span className="font-black text-slate-400 uppercase tracking-widest min-w-[70px]">Lịch học:</span>
                                                <span className="font-bold text-slate-600 truncate">{cls.schedule}</span>
                                              </div>
                                              <div className="flex items-center gap-2 text-[10px]">
                                                <span className="font-black text-slate-400 uppercase tracking-widest min-w-[70px]">Bắt đầu:</span>
                                                <span className="font-bold text-slate-600 truncate">{cls.startDate}</span>
                                              </div>
                                              <div className="flex items-center gap-2 text-[10px]">
                                                <span className="font-black text-slate-400 uppercase tracking-widest min-w-[70px]">Sĩ số:</span>
                                                <span className="font-bold text-slate-800">{cls.studentCount} / {cls.maxStudents}</span>
                                              </div>
                                              <div className="flex items-center gap-2 text-[10px]">
                                                <span className="font-black text-slate-400 uppercase tracking-widest min-w-[70px]">Trạng thái:</span>
                                                <div className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded border border-emerald-100 tracking-tighter">
                                                  Hoạt động
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-2 text-[10px]">
                                                <span className="font-black text-slate-400 uppercase tracking-widest min-w-[70px]">Kết thúc:</span>
                                                <span className="font-bold text-slate-600 truncate">{cls.endDate}</span>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center gap-4 pl-4 border-l border-slate-50">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 group-hover:text-primary transition-colors hidden sm:block">Chi tiết</span>
                                            <ArrowRight className="w-3.5 h-3.5 text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                          </div>
                                        </div>
                                      ))}
                                      {levelClasses.length === 0 && (
                                        <div className="py-8 text-center text-[10px] font-black uppercase text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/50 ">
                                          Chưa có lớp học nào được khởi tạo
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                        {catLevels.length === 0 && (
                          <div className="text-center py-8 text-[10px] font-black uppercase text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/50 italic">
                            Hệ thống chưa thiết lập cấp độ đào tạo
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CoursesPage;
