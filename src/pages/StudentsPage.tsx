import React, { useState } from "react";
import { students as initialStudents, classes, type Student } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Plus, Loader2, CheckCircle2 } from "lucide-react";
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
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import AttendanceSection from "@/components/students/AttendanceSection";
import MakeUpSection from "@/components/students/MakeUpSection";
import { ClipboardList, ClipboardCheck, History } from "lucide-react";

type TabType = "list" | "attendance" | "makeup";

const StudentsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("list");
  const [items, setItems] = useState<Student[]>([...initialStudents]);
  const [search, setSearch] = useState("");
  
  // Interactive Demo State
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newLevel, setNewLevel] = useState("");

  const filtered = items.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newStudent: Student = {
      id: `STU${100 + items.length}`,
      name: newName,
      avatar: newName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
      email: `${newName.toLowerCase().replace(/\s+/g, '')}@email.com`,
      phone: newPhone,
      level: newLevel || "Chưa xếp lớp",
      enrollDate: new Date().toISOString().split('T')[0],
      status: "active",
      classIds: [],
      totalFee: 12000000,
      paidFee: 0,
      attendanceCount: 0,
      parentName: "Họ tên phụ huynh",
      parentPhone: newPhone,
      dob: "2015-01-01",
      notes: [],
      examResults: []
    };

    setItems(prev => [newStudent, ...prev]);
    setIsSubmitting(false);
    setIsOpen(false);
    
    setNewName("");
    setNewPhone("");
    setNewLevel("");
    
    toast.success("Hồ sơ học sinh đã được khởi tạo!", {
      description: `Học viên ${newName} đã được thêm vào hệ thống quản lý học tập.`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    });
  };

  const statusBadge = (status: Student["status"]) => {
    const map = {
      active: "bg-success/10 text-success",
      inactive: "bg-muted text-muted-foreground",
      graduated: "bg-primary/10 text-primary",
    };
    const labels = { active: "Đang học", inactive: "Tạm nghỉ", graduated: "Tốt nghiệp" };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Sticky Header Container */}
      <div className="sticky top-0 z-50 bg-[#f8fafc]/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-4 mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Quản lý học sinh</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Trung tâm điều phối học tập và chuyên cần.</p>
          </div>
          
          <div className="flex p-1 bg-slate-200/50 rounded-2xl overflow-hidden relative border border-slate-200/50 shadow-inner">
            {[
              { id: "list", label: "Danh sách", icon: ClipboardList },
              { id: "attendance", label: "Điểm danh", icon: ClipboardCheck },
              { id: "makeup", label: "Học bù", icon: History },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`relative px-5 py-2 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl flex items-center gap-2 ${active ? "text-primary z-10" : "text-slate-500 hover:text-slate-900"}`}
                >
                  {active && (
                    <motion.div 
                      layoutId="students-page-tab"
                      className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-100"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <tab.icon className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button className="h-10 px-6 bg-primary text-white text-[11px] rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Thêm học sinh
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Thêm Học sinh mới</DialogTitle>
                <p className="text-sm text-muted-foreground italic">Khởi tạo hồ sơ học viên để bắt đầu quản lý học tập.</p>
              </DialogHeader>
              <form onSubmit={handleCreateStudent} className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Họ và tên *</Label>
                    <Input 
                      id="name" 
                      placeholder="Nguyễn Văn A" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="rounded-xl border-slate-200 focus:ring-primary/20"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Số điện thoại *</Label>
                    <Input 
                      id="phone" 
                      placeholder="09xx xxx xxx" 
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="rounded-xl border-slate-200 focus:ring-primary/20"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="level" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Trình độ dự kiến</Label>
                    <Input 
                      id="level" 
                      placeholder="IELTS, Starter, 4CLC..." 
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value)}
                      className="rounded-xl border-slate-200 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : "Lưu hồ sơ"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="px-6 pb-10 max-w-[1600px] mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "list" && (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên học sinh, mã STU, số điện thoại..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 text-sm font-bold border border-slate-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                  />
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all shadow-sm">
                  <Filter className="w-4 h-4" /> Lọc nâng cao
                </button>
              </div>

              {/* Table Container */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <th className="px-6 py-4">Học viên</th>
                        <th className="px-6 py-4 hidden md:table-cell">Hệ trình độ</th>
                        <th className="px-6 py-4 hidden lg:table-cell">Lớp học hiện tại</th>
                        <th className="px-6 py-4">Trạng thái hồ sơ</th>
                        <th className="px-6 py-4 text-right">Tài chính (Đã đóng/Tổng)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filtered.length > 0 ? (
                        filtered.map((s) => (
                          <tr
                            key={s.id}
                            className="hover:bg-slate-50/80 cursor-pointer transition-all group"
                            onClick={() => navigate(`/students/${s.id}`)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-primary/5 text-primary flex items-center justify-center text-xs font-black shadow-inner border border-primary/10">
                                  {s.avatar}
                                </div>
                                <div>
                                  <p className="font-black text-slate-700 text-sm group-hover:text-primary transition-colors">{s.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{s.id} • {s.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
                               <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{s.level}</span>
                            </td>
                            <td className="px-6 py-4 hidden lg:table-cell text-xs font-bold text-slate-400 italic">
                              {s.classIds.map((cid) => classes.find((c) => c.id === cid)?.name).filter(Boolean).join(", ") || "Chưa có lớp"}
                            </td>
                            <td className="px-6 py-4">{statusBadge(s.status)}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex flex-col items-end">
                                <span className={`text-xs font-black ${s.paidFee < s.totalFee ? "text-rose-500" : "text-emerald-500"}`}>
                                  {new Intl.NumberFormat("vi-VN").format(s.paidFee)}đ
                                </span>
                                <span className="text-[10px] font-bold text-slate-300">/ {new Intl.NumberFormat("vi-VN").format(s.totalFee)}đ</span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                                <Search className="w-8 h-8 text-slate-200" />
                              </div>
                              <p className="text-sm font-bold text-slate-400">Không tìm thấy học sinh phù hợp với từ khóa "{search}"</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        {activeTab === "attendance" && (
          <motion.div
            key="attendance"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <AttendanceSection onGoToMakeUp={() => setActiveTab("makeup")} />
          </motion.div>
        )}

        {activeTab === "makeup" && (
          <motion.div
            key="makeup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <MakeUpSection />
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentsPage;
