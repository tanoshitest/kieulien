import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { users, classes, tasks, timekeepingRecords } from "@/data/mockData";
import { 
  ChevronLeft, ChevronRight, Mail, Phone, BookOpen, Star, Clock, 
  Calendar as CalendarIcon, MapPin, Info, ArrowRight, Fingerprint, CheckCircle,
  FileText, Download, Briefcase, User as UserIcon, DollarSign, X, CircleDollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n) + "đ";

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [selectedMonthPayroll, setSelectedMonthPayroll] = useState<any>(null);

  const user = users.find((u) => u.id === id);
  const userClasses = classes.filter((c) => c.teacherId === id);
  const userTasks = tasks.filter((t) => t.assignee === user?.name);
  const userTimekeeping = timekeepingRecords.filter((r) => r.teacherId === id);

  if (!user) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold">Không tìm thấy người dùng</h2>
        <button onClick={() => navigate("/users")} className="mt-4 text-primary hover:underline">Quay lại danh sách</button>
      </div>
    );
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "teacher": return "Giáo viên";
      case "ta": return "Trợ giảng";
      case "ops": return "Vận hành";
      case "accounting": return "Kế toán";
      case "admin": return "Admin";
      default: return role;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <button 
        onClick={() => navigate("/users")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Quay lại danh sách nhân sự
      </button>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Profile Card */}
        <div className="w-full md:w-80 space-y-6">
          <div className="bg-card rounded-2xl border p-6 shadow-xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-primary/20 to-primary/5" />
            <div className="relative pt-4">
              <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-black mx-auto border-4 border-card shadow-lg ring-4 ring-primary/5">
                {user.avatar}
              </div>
              <h1 className="text-xl font-black mt-4">{user.name}</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{getRoleLabel(user.role)}</p>
              
              {user.role === "teacher" && (
                <div className="flex items-center justify-center gap-1 mt-3">
                  <Star className="w-4 h-4 fill-kpi-orange text-kpi-orange" />
                  <span className="font-bold text-sm">{user.avgRating} / 5.0</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-8">
              <div className="bg-secondary/40 p-3 rounded-xl border border-black/5">
                <p className="text-[10px] uppercase font-black text-muted-foreground">Giờ làm</p>
                <p className="text-lg font-black text-primary">{user.hoursThisMonth || 0}h</p>
              </div>
              <div className="bg-secondary/40 p-3 rounded-xl border border-black/5">
                <p className="text-[10px] uppercase font-black text-muted-foreground">
                  {user.role === "teacher" ? "Lớp học" : "Công việc"}
                </p>
                <p className="text-lg font-black text-primary">
                  {user.role === "teacher" ? user.totalClasses || 0 : userTasks.length}
                </p>
              </div>
            </div>
            
            <div className="mt-6 space-y-3 pt-6 border-t font-medium text-sm text-left">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="text-xs">Chi nhánh HN - Cầu Giấy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="flex-1 space-y-6">
          <div className="flex border-b gap-6 overflow-x-auto no-scrollbar">
            {[
              { id: "info", label: "Thông tin & Hợp đồng", icon: Info },
              { id: "assignments", label: user.role === "teacher" ? "Lớp học phụ trách" : "Công việc phụ trách", icon: user.role === "teacher" ? BookOpen : Briefcase },
              { id: "timekeeping", label: "Chấm công hàng ngày", icon: Fingerprint },
              { id: "payroll", label: "Bảng lương", icon: DollarSign },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative whitespace-nowrap ${
                  activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {activeTab === "info" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
                  <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Thông tin cá nhân</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase opacity-70">Mã nhân viên</p>
                        <p className="text-sm font-bold mt-1">{user.id}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase opacity-70">Ngày sinh</p>
                        <p className="text-sm font-medium mt-1">15/05/1995</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase opacity-70">Chuyên môn / Vị trí</p>
                      <p className="text-sm font-medium mt-1">{user.specialty || getRoleLabel(user.role)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase opacity-70">Trạng thái</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase border ${
                        user.status === "active" ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"
                      }`}>
                        {user.status === "active" ? "Đang hoạt động" : "Tạm nghỉ"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
                   <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Lương & Hợp đồng</h3>
                   <div className="space-y-4">
                     <div>
                       <p className="text-xs font-bold text-muted-foreground uppercase opacity-70">Loại hợp đồng</p>
                       <p className="text-sm font-black text-primary mt-1">{user.contractInfo?.type || "Chưa cập nhật"}</p>
                     </div>
                     <div>
                       <p className="text-xs font-bold text-muted-foreground uppercase opacity-70">Lương cơ bản</p>
                       <p className="text-sm font-black text-destructive mt-1">
                         {user.contractInfo?.baseSalary 
                           ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user.contractInfo.baseSalary)
                           : "Thoả thuận"}
                       </p>
                     </div>
                     
                     <div className="pt-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase opacity-70 mb-2">File đính kèm</p>
                        {user.contractInfo?.contractFile ? (
                          <div className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg border border-dashed">
                             <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                <span className="text-xs font-medium truncate max-w-[150px]">{user.contractInfo.contractFile}</span>
                             </div>
                             <button className="p-1 hover:bg-primary/10 rounded text-primary transition-colors">
                                <Download className="w-4 h-4" />
                             </button>
                          </div>
                        ) : (
                          <p className="text-xs italic text-muted-foreground">Chưa có file đính kèm</p>
                        )}
                     </div>
                   </div>
                </div>

                <div className="bg-card rounded-xl border p-6 shadow-sm space-y-4 md:col-span-2">
                   <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Lịch sử hợp đồng</h3>
                   <div className="space-y-3">
                     <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                        <div>
                           <p className="text-xs font-bold">Hợp đồng thử việc - 2 tháng</p>
                           <p className="text-[10px] text-muted-foreground">Bắt đầu: {user.contractInfo?.startDate}</p>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Đã kết thúc</span>
                     </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === "assignments" && (
              <div className="space-y-4">
                {user.role === "teacher" ? (
                  <div className="grid grid-cols-1 gap-4">
                    {userClasses.map(cls => (
                      <div key={cls.id} className="bg-card rounded-xl border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow group cursor-pointer" onClick={() => navigate(`/classes/${cls.id}`)}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-black text-base">{cls.name}</h4>
                            <p className="text-xs text-muted-foreground">{cls.schedule} • {cls.room}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Sĩ số</p>
                            <p className="text-sm font-black">{cls.studentCount} / {cls.maxStudents}</p>
                          </div>
                          <button className="p-2 hover:bg-primary/5 rounded-full text-muted-foreground group-hover:text-primary transition-colors">
                            <ArrowRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {userClasses.length === 0 && (
                      <div className="text-center py-20 text-muted-foreground italic">Giáo viên chưa được phân công lớp học nào.</div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {userTasks.map(task => (
                      <div key={task.id} className="bg-card rounded-xl border p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{task.title}</h4>
                            <p className="text-[10px] text-muted-foreground">Hạn chót: {task.dueDate}</p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase border ${
                          task.stage === 'done' ? 'bg-success/10 text-success border-success/20' : 
                          task.stage === 'in_progress' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary text-muted-foreground'
                        }`}>
                          {task.stage}
                        </span>
                      </div>
                    ))}
                    {userTasks.length === 0 && (
                      <div className="text-center py-20 text-muted-foreground italic">Chưa có công việc nào được phân công.</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "timekeeping" && (
              <div className="bg-card rounded-xl border shadow-sm h-full overflow-hidden">
                 <div className="p-5 border-b flex justify-between items-center bg-secondary/10">
                    <h2 className="font-bold uppercase text-sm tracking-widest text-muted-foreground flex items-center gap-2">
                       <Fingerprint className="w-4 h-4" /> Báo cáo Chấm công theo tháng
                    </h2>
                    <div className="flex items-center gap-2">
                       <button className="p-1.5 hover:bg-background rounded border"><ChevronLeft className="w-4 h-4" /></button>
                       <span className="text-xs font-bold">Tháng 03/2025</span>
                       <button className="p-1.5 hover:bg-background rounded border"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                       <thead className="text-[10px] font-black uppercase text-muted-foreground bg-secondary/20">
                          <tr>
                             <th className="px-6 py-3 text-left">Ngày</th>
                             <th className="px-6 py-3 text-center">Vị trí</th>
                             <th className="px-6 py-3 text-center">Giờ Vào</th>
                             <th className="px-6 py-3 text-center">Giờ Ra</th>
                             <th className="px-6 py-3 text-right">Trạng thái</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y">
                          {userTimekeeping.length > 0 ? userTimekeeping.map(record => (
                            <tr key={record.id} className="hover:bg-primary/5">
                               <td className="px-6 py-4 font-bold">{record.date}</td>
                               <td className="px-6 py-4 text-center font-bold text-xs">{record.location?.name || '--'}</td>
                               <td className="px-6 py-4 text-center font-mono text-primary font-bold">{record.checkInTime || "--:--"}</td>
                               <td className="px-6 py-4 text-center font-mono font-bold">{record.checkOutTime || "--:--"}</td>
                               <td className="px-6 py-4 text-right">
                                  {record.status === 'late' ? (
                                     <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 uppercase">Đi muộn</span>
                                  ) : record.status === 'missing-checkout' ? (
                                     <span className="text-[10px] font-black text-destructive bg-destructive/10 px-2.5 py-1 rounded border border-destructive/20 uppercase">Quên Check-out</span>
                                  ) : (
                                     <span className="text-[10px] font-bold text-success bg-success/10 px-2.5 py-1 rounded border border-success/20 flex items-center justify-end gap-1 w-max ml-auto uppercase"><CheckCircle className="w-3 h-3"/> Đúng giờ</span>
                                  )}
                               </td>
                            </tr>
                          )) : (
                            <tr>
                               <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground italic">Chưa có dữ liệu chấm công cho tháng này.</td>
                            </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
            )}

            {activeTab === "payroll" && (
              <div className="bg-card rounded-xl border shadow-sm h-full overflow-hidden">
                 <div className="p-5 border-b flex justify-between items-center bg-secondary/10">
                    <h2 className="font-bold uppercase text-sm tracking-widest text-muted-foreground flex items-center gap-2">
                       <DollarSign className="w-4 h-4" /> Lịch sử nhận lương (Payroll)
                    </h2>
                    <div className="flex bg-secondary/30 p-1 rounded-lg">
                       <button className="px-3 py-1 text-[10px] font-bold bg-white rounded shadow-sm text-primary uppercase">Cá nhân</button>
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                       <thead className="text-[10px] font-black uppercase text-muted-foreground bg-secondary/20">
                          <tr>
                             <th className="px-6 py-3 text-left">Phiếu lương</th>
                             <th className="px-6 py-3 text-right">Lương cơ bản</th>
                             <th className="px-6 py-3 text-right">Phụ cấp/Thưởng</th>
                             <th className="px-6 py-3 text-right">Khấu trừ</th>
                             <th className="px-6 py-3 text-right text-primary">Thực nhận (Net)</th>
                             <th className="px-6 py-3 text-center w-24">File</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {[
                            { month: "03/2025", base: 15000000, extra: 2500000, minus: 1200000, net: 16300000 },
                            { month: "02/2025", base: 15000000, extra: 1800000, minus: 1200000, net: 15600000 },
                            { month: "01/2025", base: 15000000, extra: 800000, minus: 1100000, net: 14700000 },
                          ].map((pay, i) => (
                            <tr 
                                key={i} 
                                onClick={() => setSelectedMonthPayroll(pay)}
                                className="hover:bg-primary/5 transition-colors cursor-pointer group"
                            >
                               <td className="px-6 py-5">
                                  <div className="flex items-center gap-3">
                                     <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <FileText className="w-5 h-5" />
                                     </div>
                                     <div>
                                        <p className="font-black text-slate-700">Tháng {pay.month}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Đã thanh toán</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-6 py-4 text-right font-medium text-slate-500">
                                  {formatVND(pay.base)}
                               </td>
                               <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                  + {formatVND(pay.extra)}
                               </td>
                               <td className="px-6 py-4 text-right font-bold text-rose-500">
                                  - {formatVND(pay.minus)}
                               </td>
                               <td className="px-6 py-4 text-right font-black text-primary text-base">
                                  {formatVND(pay.net)}
                               </td>
                               <td className="px-6 py-4 text-center">
                                  <button className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors">
                                     <Download className="w-4 h-4" />
                                  </button>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
                 <div className="p-4 bg-slate-50/50 border-t text-[10px] font-bold text-muted-foreground uppercase text-center tracking-widest">
                    Mọi thắc mắc về bảng lương vui lòng liên hệ phòng kế toán để được hỗ trợ.
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payroll Month Detail Modal - Replicated for Consistency */}
      <AnimatePresence>
        {selectedMonthPayroll && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedMonthPayroll(null)}
               className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
             />
             <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
             >
                <div className="bg-primary/5 p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                            <CircleDollarSign className="w-6 h-6" />
                        </div>
                        <div>
                           <h4 className="text-xl font-black text-slate-800 italic">Phiếu lương Chi tiết</h4>
                           <p className="text-[10px] font-black text-primary uppercase tracking-widest">THÁNG {selectedMonthPayroll.month}</p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedMonthPayroll(null)} className="p-3 hover:bg-white rounded-2xl transition-colors text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Income Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100 italic">
                            THU NHẬP (+)
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-500">Lương cơ bản</span>
                                <span className="font-black text-slate-700">{formatVND(selectedMonthPayroll.base)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-500">Thưởng giảng dạy (42h)</span>
                                <span className="font-black text-slate-700">{formatVND(1200000)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-500">Thưởng KPI / Doanh số</span>
                                <span className="font-black text-slate-700">{formatVND(800000)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-500">Phụ cấp (Xăng xe, Ăn)</span>
                                <span className="font-black text-slate-700">{formatVND(selectedMonthPayroll.extra - 2000000)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Deduction Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 w-fit px-3 py-1 rounded-full border border-rose-100 italic">
                            KHẤU TRỪ (-)
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-500">Bảo hiểm Xã hội (BHXH)</span>
                                <span className="font-black text-rose-500 italic">-{formatVND(800000)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-500">Thuế TNCN</span>
                                <span className="font-black text-rose-500 italic">-{formatVND(400000)}</span>
                            </div>
                            {selectedMonthPayroll.minus > 1200000 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-slate-500">Phạt đi muộn / Về sớm</span>
                                    <span className="font-black text-rose-500 italic">-{formatVND(selectedMonthPayroll.minus - 1200000)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Total Section */}
                    <div className="pt-8 border-t border-slate-100">
                        <div className="bg-slate-50 p-6 rounded-[2rem] flex items-center justify-between border border-slate-100 relative overflow-hidden group">
                            <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-primary/5 rounded-full rotate-12 group-hover:scale-110 transition-transform" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">TÌNH TRẠNG: <span className="text-emerald-500">ĐÃ CHI TRẢ</span></p>
                                <p className="text-sm font-bold text-slate-600">THỰC NHẬN (NET)</p>
                            </div>
                            <div className="text-right relative z-10">
                                <p className="text-3xl font-black text-primary tracking-tighter">{formatVND(selectedMonthPayroll.net)}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Payment id: #PAY_03_2026</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button className="flex-1 bg-primary text-white rounded-2xl h-12 font-black text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                            <Download className="w-4 h-4" /> XUẤT PHIẾU LƯƠNG PDF
                        </button>
                        <button 
                          onClick={() => setSelectedMonthPayroll(null)}
                          className="flex-1 bg-white border border-slate-200 rounded-2xl h-12 font-black text-xs hover:bg-slate-50 transition-colors"
                        >
                            ĐÓNG
                        </button>
                    </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDetailPage;
