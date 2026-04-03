import React, { useState, useEffect } from "react";
import { useRole } from "@/contexts/RoleContext";
import { 
  financeRecords, 
  timekeepingRecords,
  users, 
  FinanceRecord, 
  TimekeepingRecord,
  branches,
  classes,
  students
} from "@/data/mockData";
import { 
  DollarSign, Fingerprint, CircleDollarSign, 
  Search, Filter, Download, Calendar, 
  TrendingUp, Clock, CheckCircle2, AlertCircle,
  FileText, ArrowDownRight, ArrowUpRight, Plus, X,
  School, Laptop, Timer, ChevronLeft, ChevronRight,
  ArrowLeft, MapPin, BarChart3, Mail, Phone, GraduationCap,
  CheckCircle, XCircle, Paperclip, Loader2, UploadCloud, Pencil,
  CalendarCheck, ClipboardCheck
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n) + "đ";

const AdminReportsPage = () => {
  const { isAdmin } = useRole();
  const [activeTab, setActiveTab] = useState<"tuition" | "attendance" | "payroll" | "training" | "attendance_report">("tuition");

  // ---- TUITION STATES ----
  const [tuitionSearch, setTuitionSearch] = useState("");
  const [tuitionStatusFilter, setTuitionStatusFilter] = useState<"all" | FinanceRecord["status"]>("all");
  const [tuitionBranchFilter, setTuitionBranchFilter] = useState<string>("all");
  const [tuitionClassFilter, setTuitionClassFilter] = useState<string>("all");

  // ---- ATTENDANCE STATES ----
  const [records, setRecords] = useState(timekeepingRecords);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [reportDate, setReportDate] = useState(new Date(2025, 2, 1)); // March 2025

  // ---- PAYROLL STATES ----
  const [selectedStaffForPayroll, setSelectedStaffForPayroll] = useState<any>(null);
  const [selectedMonthPayroll, setSelectedMonthPayroll] = useState<any>(null);

  // ---- TRAINING RESULTS STATES ----
  const [trainingClassFilter, setTrainingClassFilter] = useState<string>("all");
  const [trainingTeacherFilter, setTrainingTeacherFilter] = useState<string>("all");
  const [selectedClassForTraining, setSelectedClassForTraining] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<number>(1);

  // ---- ATTENDANCE REPORT STATES ----
  const [attendanceReportClassFilter, setAttendanceReportClassFilter] = useState<string>("all");
  const [attendanceReportTeacherFilter, setAttendanceReportTeacherFilter] = useState<string>("all");
  const [selectedClassForAttendanceReport, setSelectedClassForAttendanceReport] = useState<string | null>(null);
  const [selectedAttendanceSession, setSelectedAttendanceSession] = useState<number>(1);

  if (!isAdmin) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-destructive underline decoration-2 underline-offset-4 mb-4">KHÔNG CÓ QUYỀN TRUY CẬP</h2>
        <p className="text-muted-foreground">Trang báo cáo này chỉ dành cho Quản trị viên hệ thống.</p>
      </div>
    );
  }

  // ---- FINANCIAL VIEW HELPERS ----
  const tuitionRecordsFiltered = financeRecords.filter(
    (r) => r.type === "income" && r.category === "Học phí"
  ).filter((r) => {
    const matchSearch = r.description.toLowerCase().includes(tuitionSearch.toLowerCase());
    const matchStatus = tuitionStatusFilter === "all" || r.status === tuitionStatusFilter;
    const matchBranch = tuitionBranchFilter === "all" || r.branchId === tuitionBranchFilter;
    const matchClass = tuitionClassFilter === "all" || r.classId === tuitionClassFilter;
    return matchSearch && matchStatus && matchBranch && matchClass;
  });

  const totalTuitionCollected = tuitionRecordsFiltered.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0);
  const totalTuitionPending = tuitionRecordsFiltered.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount, 0);
  const totalTuitionOverdue = tuitionRecordsFiltered.filter((r) => r.status === "overdue").reduce((s, r) => s + r.amount, 0);

  // ---- ATTENDANCE VIEW HELPERS ----
  const calculateDuration = (inTime: string | null, outTime: string | null) => {
    if (!inTime || !outTime) return 0;
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);
    return Math.max(0, ((outH * 60 + outM) - (inH * 60 + inM)) / 60);
  };

  const calculateLateMinutes = (inTime: string | null) => {
    if (!inTime) return 0;
    const [h, m] = inTime.split(':').map(Number);
    return Math.max(0, (h * 60 + m) - (8 * 60)); // 08:00
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Header & Tabs - CRM Style Sync */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab("tuition")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${
              activeTab === "tuition" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Học phí
          </button>
          <button 
            onClick={() => setActiveTab("attendance")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${
              activeTab === "attendance" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            Chấm công
          </button>
          <button 
            onClick={() => setActiveTab("payroll")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${
              activeTab === "payroll" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <CircleDollarSign className="w-3.5 h-3.5" />
            Báo cáo lương
          </button>
          <button 
            onClick={() => setActiveTab("attendance_report")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${
              activeTab === "attendance_report" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            Báo cáo chuyên cần
          </button>
          <button 
            onClick={() => setActiveTab("training")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${
              activeTab === "training" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Kết quả đào tạo
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200 text-xs font-bold h-10 px-5">
            <Calendar className="w-4 h-4 mr-2" /> Tháng 03/2026
          </Button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-black uppercase tracking-wider hover:opacity-90 transition-all shadow-md shadow-primary/20">
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        <AnimatePresence mode="wait">
          {activeTab === "tuition" && (
            <motion.div 
               key="tuition" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
               className="space-y-8 max-w-7xl mx-auto"
            >
                {/* KPIs - CRM Layout Sync */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
                                75% đạt chỉ tiêu
                            </span>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Đã xác nhận thanh toán</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tight">{formatVND(totalTuitionCollected)}</p>
                        <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[75%] rounded-full shadow-sm shadow-emerald-200" />
                        </div>
                    </div>
                    
                    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-500">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-[10px] font-black uppercase">
                                <AlertCircle className="w-3 h-3" /> Cần nhắc phí
                            </div>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Đang chờ phụ huynh đóng</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tight">{formatVND(totalTuitionPending)}</p>
                        <div className="mt-4 flex items-center gap-2">
                             <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 w-[20%] rounded-full" />
                             </div>
                        </div>
                    </div>

                    <div className="bg-white border border-rose-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-500">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <button className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-black uppercase hover:bg-rose-200 transition-colors">
                                <X className="w-3 h-3" /> Gửi cảnh báo
                            </button>
                        </div>
                        <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Chưa đóng / Quá hạn</p>
                        <p className="text-2xl font-black text-rose-600 tracking-tight">{formatVND(totalTuitionOverdue)}</p>
                        <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 w-[12%] rounded-full shadow-sm shadow-rose-200" />
                        </div>
                    </div>
                </div>

                {/* Filters - CRM Layout Sync */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-5 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input 
                            placeholder="Tìm tên học viên hoặc mã đóng phí..." 
                            value={tuitionSearch} 
                            onChange={(e) => setTuitionSearch(e.target.value)}
                            className="pl-10 bg-slate-50 border-slate-200 h-10 rounded-lg text-xs font-bold"
                          />
                        </div>
                        
                        <div className="md:col-span-3">
                            <select 
                                value={tuitionBranchFilter}
                                onChange={(e) => setTuitionBranchFilter(e.target.value)}
                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/10"
                            >
                                <option value="all">Tất cả chi nhánh</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name.replace("MENGLISH - ", "")}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-4">
                            <select 
                                value={tuitionClassFilter}
                                onChange={(e) => setTuitionClassFilter(e.target.value)}
                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/10"
                            >
                                <option value="all">Tất cả lớp học</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                          {(["all", "paid", "pending", "overdue"] as const).map(s => (
                            <button 
                              key={s} onClick={() => setTuitionStatusFilter(s)}
                              className={`px-4 py-1.5 text-[10px] font-black uppercase transition-all rounded-md ${
                                tuitionStatusFilter === s ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                              }`}
                            >
                              {s === "all" ? "Tất cả" : s === "paid" ? "Đã nộp" : s === "pending" ? "Chờ" : "Nợ"}
                            </button>
                          ))}
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                            Hiển thị {tuitionRecordsFiltered.length} kết quả
                        </div>
                    </div>
                </div>

                {/* Table - CRM Style Sync */}
                <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col mt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#f1f3f5] sticky top-0 z-10 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">Học sinh & Nội dung thu</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-wider">Phân loại / Lớp</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-wider text-center">Ngày lập</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-wider text-center">Tình trạng</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Học phí (VNĐ)</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Thao tác</th>
                        </tr>
                      </thead>
                    <tbody className="divide-y divide-slate-50">
                      {tuitionRecordsFiltered.map(r => {
                        const branch = branches.find(b => b.id === r.branchId);
                        const cls = classes.find(c => c.id === r.classId);
                        return (
                          <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-800 group-hover:text-primary transition-colors text-xs uppercase tracking-tight">{r.description}</p>
                              <p className="text-[9px] font-black text-slate-300 mt-0.5 italic tracking-widest lowercase opacity-60">Invoice: {r.id}</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1 text-[10px] font-black uppercase">
                                <div className="flex items-center gap-2 text-slate-500">
                                  {branch?.name === "MENGLISH - Online" ? <Laptop className="w-3 h-3 text-blue-500" /> : <School className="w-3 h-3 text-primary" />}
                                  {branch?.name.replace("MENGLISH - ", "")}
                                </div>
                                {cls && (
                                  <div className="text-[9px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full w-fit border border-primary/10 tracking-widest">
                                    {cls.name}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 italic">{r.date}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight ${
                                r.status === "paid" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                r.status === "pending" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                "bg-rose-50 text-rose-600 border border-rose-100"
                              }`}>
                                {r.status === "paid" ? "Đã xác nhận" : r.status === "pending" ? "Đang chờ" : "Quá hạn"}
                              </span>
                            </td>
                            <td className={`px-6 py-4 text-right text-base font-black tracking-tight ${
                              r.status === "paid" ? "text-emerald-600" : "text-rose-600"
                            }`}>{formatVND(r.amount)}</td>
                            <td className="px-6 py-4 text-right">
                              {(r.status === "pending" || r.status === "overdue") && (
                                <button
                                  onClick={() => {
                                    toast.success(`Đã gửi yêu cầu nhắc nợ qua Zalo cho phụ huynh học sinh!`, {
                                      description: `Thông báo học phí ${formatVND(r.amount)} đang được gửi đi...`,
                                      icon: <div className="p-1 bg-blue-500 rounded-full"><Plus className="w-3 h-3 text-white" /></div>
                                    });
                                  }}
                                  className="px-3 py-1.5 bg-[#0068ff] text-white rounded-lg text-[10px] font-black uppercase tracking-tight hover:opacity-90 transition-all shadow-sm shadow-blue-200 flex items-center gap-1.5 ml-auto"
                                >
                                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                  </div>
                                  Nhắc Nợ Zalo
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                </div>
            </motion.div>
          )}

          {activeTab === "attendance" && (
            <motion.div 
               key="attendance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
               className="space-y-8 max-w-7xl mx-auto"
            >
                {selectedTeacherId ? (
                   // MONTHLY DETAIL VIEW
                   <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
                       <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                           <div className="flex items-center gap-4">
                              <button onClick={() => setSelectedTeacherId(null)} className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all">
                                 <ArrowLeft className="w-4 h-4 text-slate-600" />
                              </button>
                              <div>
                                 <h2 className="text-lg font-black text-slate-800 tracking-tight">Chi tiết chấm công: {users.find(u => u.id === selectedTeacherId)?.name}</h2>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Mã giảng viên: {selectedTeacherId}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
                              <button onClick={() => setReportDate(new Date(reportDate.getFullYear(), reportDate.getMonth() - 1, 1))} className="p-1.5 hover:bg-white rounded-md transition-shadow"><ChevronLeft className="w-3.5 h-3.5" /></button>
                              <span className="text-[10px] font-black uppercase tracking-widest min-w-[100px] text-center italic">THÁNG {reportDate.getMonth() + 1} / {reportDate.getFullYear()}</span>
                              <button onClick={() => setReportDate(new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, 1))} className="p-1.5 hover:bg-white rounded-md transition-shadow"><ChevronRight className="w-3.5 h-3.5" /></button>
                           </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { label: "Tổng giờ làm", val: "176.5h", icon: Timer, color: "text-primary", bg: "bg-primary/5" },
                            { label: "Số phút muộn", val: "45p", icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
                            { label: "Đúng giờ", val: "24/26", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" }
                          ].map((s, i) => (
                             <div key={i} className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex items-center gap-4 group hover:bg-white hover:shadow-sm transition-all">
                                <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center ${s.color}`}>
                                   <s.icon className="w-5 h-5" />
                                </div>
                                <div>
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{s.label}</p>
                                   <p className={`text-lg font-black ${s.color}`}>{s.val}</p>
                                </div>
                             </div>
                          ))}
                       </div>

                       <div className="border border-slate-100 rounded-xl overflow-hidden">
                           <table className="w-full text-left border-collapse">
                              <thead className="bg-[#f1f3f5] text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                 <tr>
                                    <th className="px-6 py-3.5">Ngày tháng</th>
                                    <th className="px-6 py-3.5 text-center">Giờ vào</th>
                                    <th className="px-6 py-3.5 text-center">Giờ ra</th>
                                    <th className="px-6 py-3.5 text-center">Tổng giờ</th>
                                    <th className="px-6 py-3.5 text-center">Trạng thái</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                 {records.filter(r => r.teacherId === selectedTeacherId && new Date(r.date).getMonth() === reportDate.getMonth()).map(r => (
                                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                                       <td className="px-6 py-4 text-xs font-bold text-slate-700">{r.date}</td>
                                       <td className={`px-6 py-4 text-center font-black ${calculateLateMinutes(r.checkInTime) > 0 ? 'text-amber-500' : 'text-primary'}`}>{r.checkInTime || "--:--"}</td>
                                       <td className="px-6 py-4 text-center font-bold text-slate-600">{r.checkOutTime || "--:--"}</td>
                                       <td className="px-6 py-4 text-center font-bold text-slate-400 text-[10px] italic">{calculateDuration(r.checkInTime, r.checkOutTime).toFixed(1)}h</td>
                                       <td className="px-6 py-4 text-center">
                                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                                            r.status === 'on-time' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                          }`}>
                                             {r.status === 'on-time' ? 'Đúng giờ' : 'Đi muộn'}
                                          </span>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                       </div>
                   </div>
                ) : (
                   // MAIN ADMIN LIST VIEW
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                           {[
                             { label: "Lịch dạy hôm nay", val: "15", sub: "ca dạy", icon: Calendar, bg: "bg-slate-50", text: "text-slate-600" },
                             { label: "Đã Check-in", val: "12", sub: "giảng viên", color: "text-primary", icon: CheckCircle2, bg: "bg-primary/5", text: "text-primary" },
                             { label: "Đang đi muộn", val: "2", sub: "trường hợp", color: "text-amber-600", icon: Clock, bg: "bg-amber-50", text: "text-amber-600" },
                             { label: "Vắng / Nghỉ", val: "1", sub: "giảng viên", color: "text-rose-600", icon: X, bg: "bg-rose-50", text: "text-rose-600" }
                           ].map((k, i) => (
                              <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm group hover:shadow-md transition-all">
                                 <div className="flex justify-between items-start mb-3">
                                     <div className={`p-2 rounded-lg ${k.bg} ${k.text}`}>
                                         <k.icon className="w-4 h-4" />
                                     </div>
                                 </div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">{k.label}</p>
                                 <div className="flex items-end gap-2">
                                    <p className={`text-2xl font-black tracking-tight ${k.color || 'text-slate-800'}`}>{k.val}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase">{k.sub}</p>
                                 </div>
                              </div>
                           ))}
                        </div>

                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-0">
                           <div className="px-6 py-5 flex items-center justify-between border-b border-slate-50">
                              <div>
                                 <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase italic">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Lịch sử chấm công realtime
                                 </h3>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Dữ liệu tự động đồng bộ qua tọa độ GPS</p>
                              </div>
                              <div className="relative w-64">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                  <Input type="text" placeholder="Tìm giảng viên..." className="pl-9 bg-slate-50 border-slate-200 h-9 text-xs rounded-lg" />
                              </div>
                           </div>
                           <div className="overflow-x-auto">
                               <table className="w-full text-left border-collapse">
                                   <thead className="bg-[#f1f3f5] text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                       <tr>
                                           <th className="px-6 py-3.5">Nhân viên</th>
                                           <th className="px-6 py-3.5 text-center">Ngày</th>
                                           <th className="px-6 py-3.5 text-center">Giờ vào</th>
                                           <th className="px-6 py-3.5 text-center">Giờ ra</th>
                                           <th className="px-6 py-3.5 text-center">Tình trạng</th>
                                           <th className="px-6 py-3.5 text-right">Thao tác</th>
                                       </tr>
                                   </thead>
                                  <tbody className="divide-y divide-slate-50">
                                      {records.map(record => {
                                         const teacher = users.find(u => u.id === record.teacherId);
                                         return (
                                            <tr key={record.id} className="hover:bg-slate-50/80 transition-colors group">
                                               <td className="px-6 py-4">
                                                  <div className="flex items-center gap-3">
                                                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-500 uppercase">
                                                         {teacher?.name.charAt(0)}
                                                      </div>
                                                      <div>
                                                         <p className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">{teacher?.name}</p>
                                                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Mã GV: {record.teacherId}</p>
                                                      </div>
                                                  </div>
                                               </td>
                                               <td className="px-6 py-4 text-center text-[10px] font-bold text-slate-500">{record.date}</td>
                                               <td className="px-6 py-4 text-center font-black text-primary text-sm">{record.checkInTime || "--:--"}</td>
                                               <td className="px-6 py-4 text-center font-bold text-slate-400 text-xs">{record.checkOutTime || "--:--"}</td>
                                               <td className="px-6 py-4 text-center">
                                                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                                                     record.status === 'on-time' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                  }`}>
                                                     {record.status === 'on-time' ? 'Đúng giờ' : 'Đi muộn'}
                                                  </span>
                                               </td>
                                               <td className="px-6 py-4 text-right">
                                                  <button
                                                    onClick={() => setSelectedTeacherId(record.teacherId)} 
                                                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase text-slate-500 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                                                  >
                                                     Chi tiết
                                                  </button>
                                               </td>
                                            </tr>
                                         );
                                      })}
                                  </tbody>
                              </table>
                          </div>
                       </div>
                   </div>
                )}
            </motion.div>
          )}

          {activeTab === "payroll" && (
            <motion.div 
               key="payroll" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
               className="space-y-8 max-w-7xl mx-auto"
            >
                {selectedStaffForPayroll ? (
                    // DETAIL PAYROLL VIEW - CRM Style Sync
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <button 
                                onClick={() => setSelectedStaffForPayroll(null)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" /> Trở về danh sách
                            </button>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Profile Card (Left) */}
                            <div className="w-full lg:w-[320px] space-y-4">
                                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-6 text-center relative">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                                    <div className="w-20 h-20 rounded-full bg-slate-50 border-4 border-white shadow-sm mx-auto flex items-center justify-center text-xl font-black text-slate-400 mb-4">
                                       {selectedStaffForPayroll.name.split(' ').map((n: string) => n[0]).join('')}
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight mb-0.5">{selectedStaffForPayroll.name}</h3>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-6 px-3 py-1 bg-primary/5 rounded-full w-fit mx-auto border border-primary/10 italic">BỘ PHẬN VẬN HÀNH</p>
                                    
                                    <div className="grid grid-cols-2 gap-2 mb-6">
                                        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Giờ làm</p>
                                            <p className="text-sm font-black text-slate-700">176h</p>
                                        </div>
                                        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Số buổi</p>
                                            <p className="text-sm font-black text-slate-700">24</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-left border-t border-slate-50 pt-6">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                                            <p className="text-[11px] font-medium text-slate-600">{selectedStaffForPayroll.name.toLowerCase().replace(/ /g, '')}@menglish.edu.vn</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                                            <p className="text-[11px] font-medium text-slate-600">0966.xxx.xxx</p>
                                        </div>
                                        <div className="flex items-center gap-3 text-primary">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <p className="text-[11px] font-bold">Chi nhánh 01 - Cầu Giấy</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payroll History (Right) */}
                            <div className="flex-1">
                                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                                    <div className="px-6 py-4 bg-[#f8fafc] border-b border-slate-100">
                                        <h3 className="text-[10px] font-black text-slate-800 tracking-wider flex items-center gap-2 uppercase italic">
                                            <CircleDollarSign className="w-4 h-4 text-primary" />
                                            Lịch sử nhận lương chi tiết
                                        </h3>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-[#f1f3f5] text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-3.5">Kỳ lương</th>
                                                    <th className="px-6 py-3.5 text-center">Lương cứng</th>
                                                    <th className="px-6 py-3.5 text-center">Thưởng/PC</th>
                                                    <th className="px-6 py-3.5 text-center text-primary">Thực nhận</th>
                                                    <th className="px-6 py-3.5 text-right">Phiếu</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {[
                                                    { month: "03/2025", base: 15000000, e: 2500000, m: 1200000, net: 16300000, status: "ĐÃ THANH TOÁN" },
                                                    { month: "02/2025", base: 15000000, e: 1800000, m: 1200000, net: 15600000, status: "ĐÃ THANH TOÁN" },
                                                    { month: "01/2025", base: 15000000, e: 800000, m: 1100000, net: 14700000, status: "ĐÃ THANH TOÁN" },
                                                ].map((row, idx) => (
                                                    <tr 
                                                        key={idx} 
                                                        onClick={() => setSelectedMonthPayroll(row)}
                                                        className="hover:bg-slate-50/80 transition-all group cursor-pointer"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                                                    <FileText className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-slate-700 italic">Tháng {row.month}</p>
                                                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{row.status}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center text-xs font-medium text-slate-500">{formatVND(row.base)}</td>
                                                        <td className="px-6 py-4 text-center text-xs font-bold text-emerald-500">+{formatVND(row.e)}</td>
                                                        <td className="px-6 py-4 text-center text-sm font-black text-primary tracking-tight">{formatVND(row.net)}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-slate-50 rounded-lg">
                                                                <Download className="w-3.5 h-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // MAIN LIST VIEW - CRM Style Sync
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden p-0">
                        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-50">
                           <div>
                              <h3 className="text-sm font-black text-slate-800 tracking-tight italic uppercase">Bảng lương toàn hệ thống</h3>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Dữ liệu thanh toán kỳ tháng 03/2026</p>
                           </div>
                           <Button className="bg-primary rounded-lg font-black text-[10px] px-4 h-9 shadow-md shadow-primary/20 uppercase tracking-wider">
                              <Download className="w-3.5 h-3.5 mr-2" /> Xuất báo cáo tổng
                           </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#f1f3f5] text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3.5">Họ tên nhân viên</th>
                                        <th className="px-6 py-3.5 text-center">Lương cơ bản</th>
                                        <th className="px-6 py-3.5 text-center">Phụ cấp / Thưởng</th>
                                        <th className="px-6 py-3.5 text-center italic">Khấu trừ</th>
                                        <th className="px-6 py-3.5 text-right text-primary">Thực nhận (NET)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {[
                                      { name: "Lê Anh Tuấn", base: 15000000, e: 2500000, m: 500000, net: 17000000 },
                                      { name: "Nguyễn Thu Trang", base: 12000000, e: 1800000, m: 200000, net: 13600000 },
                                      { name: "Phạm Minh Hoàng", base: 18000000, e: 4500000, m: 1200000, net: 21300000 },
                                      { name: "Trần Bảo Ngọc", base: 10500000, e: 1000000, m: 0, net: 11500000 },
                                      { name: "Vũ Hải Đăng", base: 14000000, e: 2000000, m: 300000, net: 15700000 },
                                      { name: "Đỗ Thùy Linh", base: 12500000, e: 1500000, m: 100000, net: 13900000 },
                                    ].map((p, idx) => (
                                       <tr 
                                          key={idx} 
                                          onClick={() => setSelectedStaffForPayroll(p)}
                                          className="hover:bg-slate-50/80 transition-all group cursor-pointer"
                                       >
                                           <td className="px-6 py-4">
                                              <div className="flex items-center gap-3">
                                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-500 uppercase">{p.name.charAt(0)}</div>
                                          <p className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors italic">{p.name}</p>
                                              </div>
                                           </td>
                                           <td className="px-6 py-4 text-center text-xs font-bold text-slate-500 opacity-80">{formatVND(p.base)}</td>
                                           <td className="px-6 py-4 text-center text-xs font-bold text-emerald-500">+{formatVND(p.e)}</td>
                                           <td className="px-6 py-4 text-center text-xs font-bold text-rose-500 italic">-{formatVND(p.m)}</td>
                                           <td className="px-6 py-4 text-right font-black text-primary text-sm tracking-tight">{formatVND(p.net)}</td>
                                       </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </motion.div>
          )}

          {activeTab === "attendance_report" && (
            <motion.div 
               key="attendance_report" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
               className="h-full flex flex-col max-w-7xl mx-auto"
            >
                {selectedClassForAttendanceReport ? (
                   // ATTENDANCE REPORT DETAIL VIEW
                   <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col relative">
                       {/* Top Banner - Sticky relative to main page scroll */}
                       <div className="flex-none flex items-center justify-between border-b border-slate-50 p-6 bg-white z-[70] sticky top-[-2rem] rounded-t-xl shadow-sm">
                           <div className="flex items-center gap-4">
                              <button onClick={() => setSelectedClassForAttendanceReport(null)} className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all">
                                 <ArrowLeft className="w-4 h-4 text-slate-600" />
                              </button>
                              <div>
                                 <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none">Chi tiết điểm danh: {classes.find(c => c.id === selectedClassForAttendanceReport)?.name}</h2>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Báo cáo Ma trận Chuyên cần (20 Buổi học - Toàn khoá)</p>
                              </div>
                           </div>
                       </div>

                       <div className="p-6 pt-4">
                           <div className="bg-white border border-slate-100/50 rounded-xl relative overflow-x-auto no-scrollbar custom-scrollbar">
                               <table className="w-full text-left border-separate border-spacing-0 min-w-[1400px]">
                                  <thead className="relative z-50">
                                     <tr className="bg-slate-50/80">
                                        <th className="px-4 py-4 text-center w-12 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 sticky top-[48px] bg-[#f8fafc] z-50">STT</th>
                                        <th className="px-4 py-4 sticky top-[48px] left-0 bg-[#f8fafc] z-[55] w-56 border-b border-r border-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Học viên / Mã ID</span>
                                        </th>
                                        <th className="px-4 py-4 text-center w-24 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 sticky top-[48px] bg-[#f8fafc] z-50">% Có mặt</th>
                                        {Array.from({ length: 20 }).map((_, i) => (
                                           <th key={i} className="px-2 py-4 text-center w-12 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-r border-slate-100/50 sticky top-[48px] bg-[#f8fafc] z-50">B{i + 1}</th>
                                        ))}
                                     </tr>
                                  </thead>
                                  <tbody className="bg-white">
                                     {students.filter(s => s.classIds.includes(selectedClassForAttendanceReport!)).map((stu, idx) => {
                                        const attendanceRate = 85 + (idx % 3) * 5; 
                                        return (
                                           <tr key={stu.id} className="hover:bg-slate-50/50 transition-colors group">
                                              <td className="px-4 py-4 border-b border-slate-50 text-center font-black text-slate-200 text-[10px]">{idx + 1}</td>
                                              <td className="px-4 py-4 sticky left-0 bg-white group-hover:bg-slate-50 z-40 border-b border-r border-slate-50 transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                                 <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center font-black text-[9px] uppercase border border-slate-100 shrink-0">
                                                       {stu.avatar[0]}
                                                    </div>
                                                    <div className="min-w-0">
                                                       <p className="font-bold text-slate-700 uppercase tracking-tight text-[10px] truncate">{stu.name}</p>
                                                       <p className="text-[7px] font-black text-slate-300 tracking-widest uppercase truncate">{stu.id}</p>
                                                    </div>
                                                 </div>
                                              </td>
                                              <td className="px-4 py-4 text-center border-b border-r border-slate-100/50 bg-white/50">
                                                 <span className={`text-[10px] font-black px-2 py-1 rounded-md ${attendanceRate >= 90 ? 'text-emerald-500 bg-emerald-50' : attendanceRate >= 80 ? 'text-amber-500 bg-amber-50' : 'text-rose-500 bg-rose-50'}`}>
                                                    {attendanceRate}%
                                                 </span>
                                              </td>
                                              {Array.from({ length: 20 }).map((_, i) => {
                                                 const seed = (i + idx) % 15;
                                                 const status = seed === 0 ? "Vắng" : seed === 5 ? "Muộn" : "OK";
                                                 return (
                                                    <td key={i} className="px-1 py-4 text-center border-b border-r border-slate-100/50">
                                                       <div className="flex justify-center">
                                                          {status === "OK" ? (
                                                             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" title="Đúng giờ" />
                                                          ) : status === "Muộn" ? (
                                                             <div className="w-2 h-2 rounded-full bg-amber-500" title="Đi muộn" />
                                                          ) : (
                                                             <div className="w-2 h-2 rounded-full bg-rose-500" title="Vắng mặt" />
                                                          )}
                                                       </div>
                                                    </td>
                                                 );
                                              })}
                                           </tr>
                                        );
                                     })}
                                  </tbody>
                               </table>
                           </div>
                       </div>
                   </div>
                ) : (
                   <div className="space-y-6">
                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lọc theo lớp học</label>
                              <select 
                                 value={attendanceReportClassFilter}
                                 onChange={(e) => setAttendanceReportClassFilter(e.target.value)}
                                 className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 focus:outline-none"
                              >
                                 <option value="all">Tất cả lớp học</option>
                                 {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lọc theo giáo viên</label>
                              <select 
                                 value={attendanceReportTeacherFilter}
                                 onChange={(e) => setAttendanceReportTeacherFilter(e.target.value)}
                                 className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 focus:outline-none"
                              >
                                 <option value="all">Tất cả giáo viên</option>
                                 {users.filter(u => u.role === 'teacher').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                              </select>
                           </div>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                           <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Báo cáo chuyên cần theo lớp</h3>
                           </div>
                           <table className="w-full text-left border-collapse">
                              <thead className="bg-[#f1f3f5] text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                 <tr>
                                    <th className="px-6 py-4">Lớp học</th>
                                    <th className="px-6 py-4 text-center">Sĩ số</th>
                                    <th className="px-6 py-4 text-center">Đúng giờ TB</th>
                                    <th className="px-6 py-4 text-center">Vắng mặt TB</th>
                                    <th className="px-6 py-4 text-right">Chi tiết</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                 {classes.filter(c => 
                                    (attendanceReportClassFilter === 'all' || c.id === attendanceReportClassFilter) &&
                                    (attendanceReportTeacherFilter === 'all' || c.teacherId === attendanceReportTeacherFilter)
                                 ).map(cls => (
                                    <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors">
                                       <td className="px-6 py-4">
                                          <p className="font-bold text-slate-800 uppercase text-[11px]">{cls.name}</p>
                                          <p className="text-[9px] font-black text-slate-300 uppercase italic mt-0.5">GV: {users.find(u => u.id === cls.teacherId)?.name}</p>
                                       </td>
                                       <td className="px-6 py-4 text-center text-[11px] font-bold text-slate-500">{cls.studentCount} HV</td>
                                       <td className="px-6 py-4 text-center">
                                          <span className="text-emerald-600 font-black text-xs">92%</span>
                                       </td>
                                       <td className="px-6 py-4 text-center">
                                          <span className="text-rose-500 font-black text-xs">4%</span>
                                       </td>
                                       <td className="px-6 py-4 text-right">
                                          <button 
                                             onClick={() => setSelectedClassForAttendanceReport(cls.id)}
                                             className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm"
                                          >
                                             Chi tiết
                                          </button>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                   </div>
                )}
            </motion.div>
          )}

          {activeTab === "training" && (
            <motion.div 
               key="training" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
               className="space-y-8 max-w-7xl mx-auto"
            >
                {selectedClassForTraining ? (
                   <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col relative">
                       <div className="flex-none flex items-center justify-between border-b border-slate-50 p-6 bg-white z-[70] sticky top-[-32px] rounded-t-xl shadow-sm">
                           <div className="flex items-center gap-4">
                              <button onClick={() => setSelectedClassForTraining(null)} className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all">
                                 <ArrowLeft className="w-4 h-4 text-slate-600" />
                              </button>
                              <div>
                                 <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none">Chi tiết kết quả: {classes.find(c => c.id === selectedClassForTraining)?.name}</h2>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Giáo viên: {users.find(u => u.id === classes.find(c => c.id === selectedClassForTraining)?.teacherId)?.name}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black uppercase text-slate-400">Chọn ngày học:</span>
                              <select 
                                 value={selectedSession}
                                 onChange={(e) => setSelectedSession(Number(e.target.value))}
                                 className="h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-600 focus:outline-none"
                              >
                                 {[
                                    { s: 1, d: "22/03/2026" },
                                    { s: 2, d: "24/03/2026" },
                                    { s: 3, d: "26/03/2026" },
                                    { s: 4, d: "29/03/2026" },
                                    { s: 5, d: "31/03/2026" },
                                 ].map(item => (
                                    <option key={item.s} value={item.s}>Buổi {item.s} - {item.d}</option>
                                 ))}
                              </select>
                           </div>
                       </div>

                       <div className="p-6 pt-4">
                           <div className="bg-white border border-slate-100 rounded-xl shadow-2xl overflow-x-auto no-scrollbar relative transition-all">
                               <table className="w-full text-left border-collapse bg-white">
                                  <thead className="bg-[#f8fafc] border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 sticky top-[80px] z-50">
                                 <tr>
                                    <th className="px-6 py-4 text-center w-12 text-slate-300">STT</th>
                                    <th className="px-6 py-4 min-w-[200px]">Học viên</th>
                                    <th className="px-6 py-4 text-center w-32">Trạng thái</th>
                                    <th className="px-3 py-4 text-center w-16">TFL</th>
                                    <th className="px-3 py-4 text-center w-16">B2</th>
                                    <th className="px-3 py-4 text-center w-16">BGD</th>
                                    <th className="px-4 py-4 text-center w-32">BÀI TẬP NỘP</th>
                                    <th className="px-3 py-4 text-center w-16 bg-slate-100/30">HW/43</th>
                                    <th className="px-3 py-4 text-center w-16 bg-slate-100/30">L/28</th>
                                    <th className="px-3 py-4 text-center w-16 bg-primary/5 text-primary border-r border-slate-100 italic">MINI</th>
                                    <th className="px-6 py-4 min-w-[400px]">Nhận xét buổi {selectedSession}</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                 {students.filter(s => s.classIds.includes(selectedClassForTraining!)).map((stu, idx) => {
                                    const seed = (selectedSession + idx) % 10;
                                    const status = seed === 0 ? "Vắng mặt" : seed === 5 ? "Đi muộn" : "Đúng giờ";
                                    const feedbackSamples: Record<number, string> = {
                                      1: "Hôm nay con tiếp thu bài rất nhanh, nắm vững kiến thức về Unit 01. Trong giờ con hăng hái phát biểu và tương tác tốt với giáo viên. Phần bài tập về nhà con hoàn thành đầy đủ, trình bày sạch đẹp và không sai lỗi chính tả nào. Tuy nhiên con cần chú ý hơn về phần phát âm các âm đuôi (ending sounds) để hoàn thiện kỹ năng Speaking. Ba mẹ hãy tiếp tục động viên con duy trì tinh thần học tập tuyệt vời này nhé!",
                                      2: "Buổi học hôm nay tập trung vào ngữ pháp Unit 18, con đã hiểu bản chất vấn đề và áp dụng tốt vào các bài tập thực hành trên lớp. Con rất tích cực trong các hoạt động đội nhóm và dẫn dắt các bạn hoàn thành nhiệm vụ. Về nhà ba mẹ hãy nhắc con làm bài tập Quiz Online để củng cố lại kiến thức thì hiện tại hoàn thành. Chúc mừng con đã có một buổi học xuất sắc!",
                                      3: "Hôm nay lớp học về chủ đề Speaking: Pets, con rất tự tin khi chia sẻ về thú cưng của mình trước cả lớp. Vốn từ vựng của con ngày càng phong phú và cách diễn đạt tự nhiên hơn trước rất nhiều. Con đã biết cách sử dụng các từ nối để câu văn thêm sinh động. Phần bài tập ghi âm (Record Story) ba mẹ hãy giúp con quay video để giáo viên có thể nhận xét kỹ hơn về ngôn ngữ cơ thể. Con hãy tiếp tục phát huy sự tự tin này nhé!",
                                      4: "Trong buổi học Reading hôm nay, con đã thực hiện rất tốt các kỹ năng Skimming và Scanning để tìm thông tin nhanh trong đoạn văn. Tuy nhiên có một số từ vựng mới về chủ đề Fun Fair con còn hơi lúng túng, giáo viên đã hướng dẫn con cách đoán nghĩa từ ngữ cảnh. Con cần dành thời gian ôn lại danh sách từ vựng Unit 4 ở trang 12. Về nhà con hãy đọc lại bài khóa 3 lần để rèn luyện tốc độ đọc.",
                                      5: "Buổi học Writing về chủ đề My Day đã giúp con hệ thống lại cách viết về các hoạt động hàng ngày một cách logic. Con đã biết cách sử dụng các trạng từ chỉ tần suất (always, usually, sometimes) rất chính xác. Bài viết của con có độ dài vừa đủ, ý tưởng phong phú và có sự sáng tạo cá nhân. Con chỉ cần lưu ý thêm về cách dùng mạo từ 'a, an, the' để câu văn hoàn hảo hơn."
                                    };
                                    return (
                                       <tr key={stu.id} className="hover:bg-slate-50/50 transition-colors">
                                          <td className="px-6 py-5 border-r border-slate-50 text-center font-bold text-slate-300 text-[11px]">{idx + 1}</td>
                                          <td className="px-6 py-5 border-r border-slate-50">
                                             <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black text-[11px] uppercase border border-slate-200 shadow-sm shrink-0">
                                                   {stu.avatar[0]}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                   <span className="font-black text-slate-700 uppercase tracking-tight text-[11px] whitespace-nowrap">{stu.name}</span>
                                                   <span className="text-[8px] text-slate-300 font-black tracking-widest uppercase italic">[ ID: {stu.id} ]</span>
                                                </div>
                                             </div>
                                          </td>
                                          <td className="px-6 py-5 border-r border-slate-50 text-center">
                                             <span className={`px-3 py-1 whitespace-nowrap font-black uppercase text-[9px] border tracking-widest rounded-full ${
                                                status === 'Vắng mặt' ? 'bg-rose-50 text-rose-500 border-rose-100' : 
                                                status === 'Đi muộn' ? 'bg-amber-50 text-amber-500 border-amber-100' : 
                                                'bg-emerald-50 text-emerald-500 border-emerald-100'
                                             }`}>
                                                {status}
                                             </span>
                                          </td>
                                          <td className="px-3 py-5 border-r border-slate-50 text-center">
                                             {seed % 2 === 0 ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-200 mx-auto" />}
                                          </td>
                                          <td className="px-3 py-5 border-r border-slate-50 text-center">
                                             {seed % 3 !== 0 ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-200 mx-auto" />}
                                          </td>
                                          <td className="px-3 py-5 border-r border-slate-50 text-center">
                                             {seed % 4 === 0 ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-200 mx-auto" />}
                                          </td>
                                          <td className="px-4 py-5 border-r border-slate-50 text-center">
                                             {seed % 2 === 0 ? (
                                               <div className="inline-flex items-center gap-2 px-2 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-primary transition-all cursor-pointer group/file">
                                                  <Paperclip className="w-3 h-3 text-slate-400 group-hover:text-primary transition-colors" />
                                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 group-hover:text-primary transition-colors">ATTACH_B{selectedSession}</span>
                                               </div>
                                             ) : (
                                               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">N/A</span>
                                             )}
                                          </td>
                                          <td className="px-3 py-5 border-r border-slate-50 text-center font-black text-slate-500 bg-slate-50/50 text-[11px] font-mono">{43 - (seed % 5)}</td>
                                          <td className="px-3 py-5 border-r border-slate-50 text-center font-black text-slate-500 bg-slate-50/50 text-[11px] font-mono">{28 - (seed % 3)}</td>
                                          <td className="px-3 py-5 border-r border-slate-100 text-center font-black text-primary bg-primary/5 uppercase tracking-widest text-[11px]">{seed > 5 ? 'A+' : 'B'}</td>
                                          <td className="px-8 py-5 text-slate-600 leading-relaxed font-bold relative group bg-white">
                                             <div className="flex items-start justify-between gap-6 py-1">
                                                <span className="text-[10px] uppercase font-bold text-slate-600 leading-[1.6] text-justify">
                                                   {feedbackSamples[selectedSession] || feedbackSamples[1]}
                                                </span>
                                             </div>
                                          </td>
                                       </tr>
                                    );
                                 })}
                              </tbody>
                           </table>
                       </div>
                    </div>
                   </div>
                ) : (
                   // MAIN TRAINING LIST VIEW
                   <div className="space-y-6">
                        {/* Filters */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lọc theo lớp học</label>
                              <select 
                                 value={trainingClassFilter}
                                 onChange={(e) => setTrainingClassFilter(e.target.value)}
                                 className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/10"
                              >
                                 <option value="all">Tất cả lớp học</option>
                                 {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lọc theo giáo viên</label>
                              <select 
                                 value={trainingTeacherFilter}
                                 onChange={(e) => setTrainingTeacherFilter(e.target.value)}
                                 className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/10"
                              >
                                 <option value="all">Tất cả giáo viên</option>
                                 {users.filter(u => u.role === 'teacher').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                              </select>
                           </div>
                        </div>

                        {/* List Table */}
                        <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                           <div className="px-6 py-4 border-b border-slate-50 bg-[#f8fafc]/50">
                              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight italic">Danh sách tổng quan kết quả đào tạo</h3>
                           </div>
                           <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                 <thead className="bg-[#f1f3f5] text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                    <tr>
                                       <th className="px-6 py-3.5">Thông tin lớp học</th>
                                       <th className="px-6 py-3.5 text-center">Sĩ số</th>
                                       <th className="px-6 py-3.5 text-center">GPA Lớp</th>
                                       <th className="px-6 py-3.5 text-center">Trạng thái</th>
                                       <th className="px-6 py-3.5 text-right">Hành động</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-50">
                                    {classes.filter(c => 
                                       (trainingClassFilter === 'all' || c.id === trainingClassFilter) &&
                                       (trainingTeacherFilter === 'all' || c.teacherId === trainingTeacherFilter)
                                    ).map(cls => (
                                       <tr key={cls.id} className="hover:bg-slate-50/80 transition-colors group">
                                          <td className="px-6 py-4">
                                             <p className="font-bold text-slate-800 group-hover:text-primary transition-colors text-xs uppercase uppercase">{cls.name}</p>
                                             <p className="text-[9px] font-black text-slate-300 mt-0.5 uppercase">GV: {users.find(u => u.id === cls.teacherId)?.name}</p>
                                          </td>
                                          <td className="px-6 py-4 text-center text-xs font-bold text-slate-500">{cls.studentCount}/{cls.maxStudents}</td>
                                          <td className="px-6 py-4 text-center">
                                             <div className="flex flex-col items-center gap-1">
                                                <span className="text-sm font-black text-emerald-600">8.2</span>
                                                <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                   <div className="h-full bg-emerald-500 w-[82%] rounded-full" />
                                                </div>
                                             </div>
                                          </td>
                                          <td className="px-6 py-4 text-center">
                                             <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-100">Đang triển khai</span>
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                             <button 
                                                onClick={() => setSelectedClassForTraining(cls.id)}
                                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase text-slate-500 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                                             >
                                                Xem chi tiết
                                             </button>
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                   </div>
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payroll Month Detail Modal */}
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
                className="relative bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-100"
             >
                <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary">
                            <CircleDollarSign className="w-5 h-5" />
                        </div>
                        <div>
                           <h4 className="text-sm font-black text-slate-800 italic uppercase">Cấu trúc phiếu lương</h4>
                           <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Kỳ tháng {selectedMonthPayroll.month}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Income Section */}
                    <div className="space-y-3">
                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                             THU NHẬP (+)
                             <div className="h-px flex-1 bg-emerald-100" />
                        </div>
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="font-medium text-slate-500">Lương cơ bản</span>
                                <span className="font-bold text-slate-700">{formatVND(selectedMonthPayroll.base)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="font-medium text-slate-500">Thưởng giảng dạy (42h)</span>
                                <span className="font-bold text-slate-700">{formatVND(1200000)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="font-medium text-slate-500">KPI / Hiệu suất</span>
                                <span className="font-bold text-slate-700">{formatVND(800000)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Deduction Section */}
                    <div className="space-y-3">
                        <div className="text-[10px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
                             KHẤU TRỪ (-)
                             <div className="h-px flex-1 bg-rose-100" />
                        </div>
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="font-medium text-slate-500">Bảo hiểm & Phí Công đoàn</span>
                                <span className="font-bold text-rose-500">-{formatVND(800000)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="font-medium text-slate-500">Thuế (Tạm tính)</span>
                                <span className="font-bold text-rose-500">-{formatVND(400000)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Total Section */}
                    <div className="pt-6 border-t border-slate-100">
                        <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Thực nhận (NET)</p>
                                <p className="text-sm font-bold text-slate-600 uppercase">ĐÃ THANH TOÁN</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-primary tracking-tight">{formatVND(selectedMonthPayroll.net)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button className="flex-1 bg-primary rounded-lg h-10 font-black text-[10px] uppercase tracking-wider shadow-md shadow-primary/20">
                            <Download className="w-3.5 h-3.5 mr-2" /> Tải PDF
                        </Button>
                        <Button 
                          onClick={() => setSelectedMonthPayroll(null)}
                          variant="outline" className="flex-1 rounded-lg h-10 font-black text-[10px] uppercase tracking-wider border-slate-200"
                        >
                            Đóng
                        </Button>
                    </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminReportsPage;
