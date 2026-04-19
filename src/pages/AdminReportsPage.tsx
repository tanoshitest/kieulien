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
import { AdminSurveyDashboard } from "@/components/survey/AdminSurveyDashboard";
import { admissionsStore, useEnrollments } from "@/lib/admissionsStore";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n) + "đ";

const AdminReportsPage = () => {
  const { isAdmin } = useRole();
  const [activeTab, setActiveTab] = useState<"tuition" | "attendance" | "payroll" | "training" | "attendance_report" | "survey">("tuition");

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
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedStaffForAction, setSelectedStaffForAction] = useState<any>(null);

  // Dynamic payroll data storage
  const [payrollList, setPayrollList] = useState([
    { 
      id: "P1", 
      name: "Lê Anh Tuấn", 
      role: "FULL_TIME", 
      base: 15000000, 
      e: 2500000, 
      m: 500000, 
      net: 17000000, 
      details: {
        baseSalary: 15000000,
        stdDays: 26,
        actDays: 26,
        policyBase: 15000000,
        policyStdDays: 26,
        policyActDays: 1,
        parking: 100000,
        phone: 300000,
        stationery: 100000,
        revenuePercent: 4,
        newStudentsCount: 18,
        testRevenue: 45000000,
        salesBonus: 1800000,
        // ---- Lương Doanh thu theo lớp tái tục (NEW) ----
        renewalClasses: [
          { id: "rc1", className: "Cam 10", studentCount: 18, droppedCount: 0, tuitionRevenue: 38913000, materialRevenue: 0, includeTuition: true, includeMaterial: false },
          { id: "rc2", className: "Cam 25", studentCount: 16, droppedCount: 1, tuitionRevenue: 28530000, materialRevenue: 0, includeTuition: true, includeMaterial: false },
          { id: "rc3", className: "Cam 33", studentCount: 17, droppedCount: 0, tuitionRevenue: 25370000, materialRevenue: 0, includeTuition: true, includeMaterial: false },
          { id: "rc4", className: "Cam 21", studentCount: 15, droppedCount: 2, tuitionRevenue: 21840000, materialRevenue: 0, includeTuition: true, includeMaterial: false },
          { id: "rc5", className: "Cam 34", studentCount: 19, droppedCount: 0, tuitionRevenue: 32400000, materialRevenue: 0, includeTuition: true, includeMaterial: false },
        ],
        kpiPool: 1500000,
        kpiScore: 82,
        manualKpi: 1230000,
        penalty: 50000,
        otherDeduction: 0,
        socialInsurance: 1150000
      }
    },
    { 
      id: "P2", 
      name: "Nguyễn Thu Trang", 
      role: "PART_TIME_TEACHER", 
      base: 12000000, 
      e: 1800000, 
      m: 200000, 
      net: 13600000, 
      details: {
        mainSessions: 32,
        mainRate: 250000,
        intlSessions: 8,
        intlRate: 350000,
        totalClasses: 4,
        reEnrollCount: 12,
        reEnrollRewardRate: 150000,
        otherSupport: 500000,
        parking: 100000,
        penalty: 50000
      } 
    },
    { 
      id: "P7", 
      name: "Trịnh Quang Sáng", 
      role: "ASSISTANT", 
      base: 8000000, 
      e: 1500000, 
      m: 0, 
      net: 9500000, 
      details: {
        taWorkDays: 22,
        totalHours: 195.5,
        hourlyRate: 45000,
        taTransport: 702500,
        taCommitment: 0,
        taOther: 0
      } 
    },
  ]);

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

  // ---- LƯƠNG DOANH THU - LỚP TÁI TỤC (NEW) ----
  type RenewalClass = {
    id: string;
    className: string;
    studentCount: number;     // Sĩ số → quyết định bậc % (3/4/5%)
    droppedCount: number;     // Số HS nghỉ → quyết định bonus tái tục
    tuitionRevenue: number;   // Doanh thu học phí
    materialRevenue: number;  // Doanh thu học liệu
    includeTuition: boolean;
    includeMaterial: boolean;
  };
  const [renewalClassesEntry, setRenewalClassesEntry] = useState<RenewalClass[]>([]);

  // Bridge từ CRM: lắng nghe enrollment events
  const allEnrollments = useEnrollments();
  // Tháng hiện tại để filter (YYYY-MM)
  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  // Đề xuất doanh số cho học vụ đang mở modal
  const suggestedFromCRM = React.useMemo(() => {
    if (!selectedStaffForAction || selectedStaffForAction.role !== "FULL_TIME") return [];
    return admissionsStore.aggregateByStaff(selectedStaffForAction.name, currentMonthKey);
  }, [selectedStaffForAction, currentMonthKey, allEnrollments]);

  // Sync khi mở modal cho FULL_TIME
  useEffect(() => {
    if (isEntryModalOpen && selectedStaffForAction?.role === "FULL_TIME") {
      const existing = selectedStaffForAction.details?.renewalClasses;
      if (Array.isArray(existing) && existing.length > 0) {
        setRenewalClassesEntry(existing.map((c: RenewalClass) => ({ ...c })));
      } else {
        setRenewalClassesEntry([]);
      }
    }
  }, [isEntryModalOpen, selectedStaffForAction]);

  // Helpers tính lương doanh thu
  const getBaseRate = (count: number) => {
    if (count >= 26) return 0.05;
    if (count >= 16) return 0.04;
    if (count >= 1) return 0.03;
    return 0;
  };
  const getRenewalBonus = (dropped: number) => {
    // 0 nghỉ → +1% ; 1 nghỉ → +0.7% ; 2 nghỉ → +0.5% ; ≥3 → 0
    if (dropped === 0) return 0.01;
    if (dropped === 1) return 0.007;
    if (dropped === 2) return 0.005;
    return 0;
  };
  const isKpiPenalized = (dropped: number) => dropped > 4;
  const calcClassCommission = (c: RenewalClass) => {
    const rev = (c.includeTuition ? c.tuitionRevenue : 0) + (c.includeMaterial ? c.materialRevenue : 0);
    const rate = getBaseRate(c.studentCount) + getRenewalBonus(c.droppedCount);
    return Math.round(rev * rate);
  };
  const calcTotalRenewalCommission = (list: RenewalClass[]) =>
    list.reduce((sum, c) => sum + calcClassCommission(c), 0);
  const hasAnyKpiPenalty = (list: RenewalClass[]) => list.some(c => isKpiPenalized(c.droppedCount));

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
          <button 
            onClick={() => setActiveTab("survey")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${
              activeTab === "survey" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            Khảo sát
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
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Dữ liệu thanh toán kỳ tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}</p>
                           </div>
                           <Button className="bg-primary rounded-lg font-black text-[10px] px-4 h-9 shadow-md shadow-primary/20 uppercase tracking-wider">
                              <Download className="w-3.5 h-3.5 mr-2" /> Xuất báo cáo tổng
                           </Button>
                        </div>

                        <div className="overflow-x-auto pb-4">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead className="bg-[#f1f3f5] text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Họ và tên</th>
                                        <th className="px-4 py-4 text-center">Chức vụ</th>
                                        <th className="px-4 py-4 text-center">Lớp tái tục</th>
                                        <th className="px-4 py-4 text-right">Doanh thu tính HH</th>
                                        <th className="px-4 py-4 text-right text-emerald-600">Hoa hồng</th>
                                        <th className="px-6 py-4 text-right text-primary">Lương thực nhận</th>
                                        <th className="px-6 py-4 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {payrollList.map((p) => {
                                       const isTeacher = p.role === "PART_TIME_TEACHER";
                                       const renewalList: RenewalClass[] = Array.isArray((p as any).details?.renewalClasses) ? (p as any).details.renewalClasses : [];
                                       const renewalCount = renewalList.length;
                                       const renewalIncludedRevenue = renewalList.reduce((sum, c) => sum + (c.includeTuition ? c.tuitionRevenue : 0) + (c.includeMaterial ? c.materialRevenue : 0), 0);
                                       const renewalCommission = calcTotalRenewalCommission(renewalList);

                                       return (
                                          <tr
                                             key={p.id}
                                             className="hover:bg-slate-50/80 transition-all group"
                                          >
                                              <td className="px-6 py-5" onClick={() => setSelectedStaffForPayroll(p)}>
                                                 <div className="flex items-center gap-3 cursor-pointer">
                                                     <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center font-black text-[10px] text-primary uppercase">{p.name.charAt(0)}</div>
                                                     <div>
                                                         <p className="text-xs font-black text-slate-700 group-hover:text-primary transition-colors uppercase tracking-tight">{p.name}</p>
                                                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{p.id}</p>
                                                     </div>
                                                 </div>
                                              </td>
                                              <td className="px-4 py-5 text-center">
                                                 <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${isTeacher ? 'bg-orange-50 text-orange-600' : p.role === 'ASSISTANT' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                                                    {isTeacher ? "Giáo viên" : p.role === "ASSISTANT" ? "Trợ giảng" : "Học vụ"}
                                                 </span>
                                              </td>
                                              <td className="px-4 py-5 text-center">
                                                 {p.role === "FULL_TIME" ? (
                                                    renewalCount > 0 ? (
                                                       <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md uppercase tracking-wider">
                                                          {renewalCount} lớp
                                                       </span>
                                                    ) : (
                                                       <span className="text-[10px] font-black text-slate-300">—</span>
                                                    )
                                                 ) : (
                                                    <span className="text-[10px] font-black text-slate-300">—</span>
                                                 )}
                                              </td>
                                              <td className="px-4 py-5 text-right text-xs font-bold text-slate-500">
                                                 {p.role === "FULL_TIME" && renewalCount > 0 ? formatVND(renewalIncludedRevenue) : <span className="text-slate-300">—</span>}
                                              </td>
                                              <td className="px-4 py-5 text-right text-xs font-black text-emerald-600">
                                                 {p.role === "FULL_TIME" && renewalCount > 0 ? `+${formatVND(renewalCommission)}` : <span className="text-slate-300">—</span>}
                                              </td>
                                              <td className="px-6 py-5 text-right font-black text-primary text-sm tracking-tight">
                                                 {formatVND(p.net)}
                                              </td>
                                              <td className="px-6 py-5 text-right">
                                                 <div className="flex items-center justify-end gap-2">
                                                     <button 
                                                       onClick={(e) => {
                                                           e.stopPropagation();
                                                           setSelectedStaffForAction(p);
                                                           setIsEntryModalOpen(true);
                                                       }}
                                                       className="w-8 h-8 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm flex items-center justify-center"
                                                       title="Nhập liệu"
                                                     >
                                                         <Pencil className="w-3.5 h-3.5" />
                                                     </button>
                                                     <button 
                                                       onClick={(e) => {
                                                           e.stopPropagation();
                                                           setSelectedStaffForAction(p);
                                                           setIsPayslipModalOpen(true);
                                                       }}
                                                       className="w-8 h-8 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-all shadow-sm flex items-center justify-center"
                                                       title="Phiếu lương"
                                                     >
                                                         <FileText className="w-3.5 h-3.5" />
                                                     </button>
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

        {/* Payroll Entry Modal (Dynamic Form) */}
        <AnimatePresence>
          {isEntryModalOpen && selectedStaffForAction && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsEntryModalOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-7xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-4"
              >
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Pencil className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 uppercase italic">Cập nhật chỉ số lương</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedStaffForAction.name} - {selectedStaffForAction.role === "FULL_TIME" ? "Học vụ" : selectedStaffForAction.role === "ASSISTANT" ? "Trợ giảng" : "Giáo viên"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/5 text-primary px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/10">
                      Kỳ lương: Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
                    </div>
                    <button onClick={() => setIsEntryModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors relative z-10 w-8 h-8 flex items-center justify-center">
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const data: any = {};
                    formData.forEach((value, key) => { data[key] = typeof value === 'string' ? Number(String(value).replace(/\./g, '')) : Number(value); });

                    let netValue = 0;
                    let extraValue = 0;
                    let minusValue = 0;

                    if (selectedStaffForAction.role === "PART_TIME_TEACHER") {
                      const teachingPay = (data.mainSessions * data.mainRate) + (data.intlSessions * data.intlRate);
                      const reEnrollReward = (data.reEnrollCount || 0) * (data.reEnrollRewardRate || 0);
                      const totalAdditions = data.parking + data.otherSupport + reEnrollReward;
                      
                      netValue = teachingPay + totalAdditions - data.penalty;
                      extraValue = totalAdditions;
                      minusValue = data.penalty;
                      
                      setPayrollList(prev => prev.map(p => p.id === selectedStaffForAction.id ? { 
                        ...p, 
                        base: teachingPay, 
                        e: extraValue, 
                        m: minusValue, 
                        net: netValue,
                        details: data
                      } : p));
                    } else if (selectedStaffForAction.role === "ASSISTANT") {
                      /* Teaching Assistant (TA) Logic */
                      const hourlyPay = (data.totalHours || 0) * (data.hourlyRate || 0);
                      const transport = data.taTransport || 0;
                      const commitment = data.taCommitment || 0;
                      const other = data.taOther || 0;
                      netValue = hourlyPay + transport - commitment - other;
                      extraValue = transport;
                      minusValue = commitment + other;
                      setPayrollList(prev => prev.map(p => p.id === selectedStaffForAction.id ? {
                        ...p,
                        base: hourlyPay,
                        e: extraValue,
                        m: minusValue,
                        net: netValue,
                        details: data
                      } : p));
                    } else {
                      /* Full-time Staff Logic */
                      // 1. Fixed Salary Logic
                      const baseDailyRate = (data.baseSalary || 0) / (data.stdDays || 26);
                      const baseTaskSalary = baseDailyRate * (data.actDays || 0);
                      const policyDailyRate = (data.policyBase || data.baseSalary || 0) / (data.policyStdDays || data.stdDays || 26);
                      const holidayPay = policyDailyRate * (data.policyActDays || 0);
                      const fixedAllowances = (data.parking || 0) + (data.phone || 0) + (data.stationery || 0);
                      const fixedTotal = baseTaskSalary + holidayPay + fixedAllowances;

                      // 2. KPI Bonus Logic
                      let kpiBonus = 0;
                      const kpiScore = data.kpiScore || 0;
                      const kpiPool = data.kpiPool || 0;
                      if (data.manualKpi > 0) {
                        kpiBonus = data.manualKpi;
                      } else {
                        if (kpiScore >= 95) kpiBonus = kpiPool + 300000;
                        else if (kpiScore >= 86) kpiBonus = kpiPool;
                        else if (kpiScore >= 81) kpiBonus = kpiPool * 0.9;
                        else if (kpiScore >= 75) kpiBonus = kpiPool * 0.85;
                        else if (kpiScore >= 65) kpiBonus = kpiPool * 0.8;
                        else kpiBonus = kpiPool * 0.6;
                      }

                      // 3. Sales Commission Logic — NEW: from renewalClasses array
                      const commission = calcTotalRenewalCommission(renewalClassesEntry);
                      const kpiPenalized = hasAnyKpiPenalty(renewalClassesEntry);
                      // If any class has dropped > 4, the KPI bonus is voided as a penalty
                      const effectiveKpiBonus = kpiPenalized ? 0 : kpiBonus;

                      // Persist the renewal classes back into details
                      data.renewalClasses = renewalClassesEntry;
                      data.commissionTotal = commission;
                      data.kpiPenalized = kpiPenalized;

                      // Final Calculation
                      extraValue = effectiveKpiBonus + commission;
                      minusValue = (data.penalty || 0) + (data.otherDeduction || 0) + (data.socialInsurance || 0);
                      netValue = fixedTotal + extraValue - minusValue;

                      setPayrollList(prev => prev.map(p => p.id === selectedStaffForAction.id ? { 
                        ...p, 
                        base: fixedTotal, 
                        e: extraValue, 
                        m: minusValue, 
                        net: netValue,
                        details: data
                      } : p));
                    }

                    toast.success("Cập nhật dữ liệu lương thành công!");
                    setIsEntryModalOpen(false);
                  }}>
                    <div className="grid grid-cols-3 gap-6 mb-8">
                      {selectedStaffForAction.role === "PART_TIME_TEACHER" ? (
                        /* Teacher (Giáo viên) Payroll Form - Rectangular 3-Column Layout */
                        <div className="col-span-3 grid grid-cols-3 gap-5">
                          {/* Row 1: Merged Công & Lớp dạy */}
                          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
                            <div className="text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-1">Dòng 1: Công & Lớp dạy</div>
                            <div className="grid grid-cols-4 gap-4">
                              <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter ml-1">Số ca không có GVNN</label>
                                <Input name="mainSessions" type="number" defaultValue={selectedStaffForAction.details?.mainSessions || 0} className="h-9 px-2 rounded-lg border-slate-200 text-xs" onChange={(e) => { const f=e.target.form; if(f && f.elements.namedItem('displayTotalSessions')){ (f.elements.namedItem('displayTotalSessions') as HTMLInputElement).value = String(Number(e.target.value||0) + Number((f.elements.namedItem('intlSessions') as HTMLInputElement).value||0)); } }} />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter ml-1">Số ca có GVNN</label>
                                <Input name="intlSessions" type="number" defaultValue={selectedStaffForAction.details?.intlSessions || 0} className="h-9 px-2 rounded-lg border-slate-200 text-xs" onChange={(e) => { const f=e.target.form; if(f && f.elements.namedItem('displayTotalSessions')){ (f.elements.namedItem('displayTotalSessions') as HTMLInputElement).value = String(Number((f.elements.namedItem('mainSessions') as HTMLInputElement).value||0) + Number(e.target.value||0)); } }} />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-primary uppercase tracking-tighter ml-1">Tổng số ca dạy</label>
                                <Input name="displayTotalSessions" readOnly type="number" defaultValue={(selectedStaffForAction.details?.mainSessions || 0) + (selectedStaffForAction.details?.intlSessions || 0)} className="h-9 px-2 rounded-lg border-primary/20 bg-primary/5 text-primary font-black text-xs cursor-not-allowed outline-none" tabIndex={-1} />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter ml-1">Tổng số lớp dạy</label>
                                <Input name="totalClasses" type="number" defaultValue={selectedStaffForAction.details?.totalClasses || 0} className="h-9 px-2 rounded-lg border-slate-200 text-xs" />
                              </div>
                            </div>
                          </div>

                          {/* Row 2: Rates & Allowances */}
                          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex flex-col gap-3">
                            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-1">Dòng 2: Lương & Phụ cấp</div>
                            <div className="grid grid-cols-4 gap-4">
                              <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter ml-1">Đơn giá dạy chính</label>
                                <Input name="mainRate" type="text" defaultValue={new Intl.NumberFormat("vi-VN").format(selectedStaffForAction.details?.mainRate || 250000)} className="h-9 px-2 rounded-lg border-emerald-200 text-xs" onInput={(e) => { const v = e.currentTarget.value.replace(/\D/g, ''); e.currentTarget.value = v ? new Intl.NumberFormat("vi-VN").format(Number(v)) : ''; }} />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter ml-1">Đơn giá có GNVN</label>
                                <Input name="intlRate" type="text" defaultValue={new Intl.NumberFormat("vi-VN").format(selectedStaffForAction.details?.intlRate || 350000)} className="h-9 px-2 rounded-lg border-emerald-200 text-xs" onInput={(e) => { const v = e.currentTarget.value.replace(/\D/g, ''); e.currentTarget.value = v ? new Intl.NumberFormat("vi-VN").format(Number(v)) : ''; }} />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter ml-1">Hỗ trợ khác</label>
                                <Input name="otherSupport" type="text" defaultValue={new Intl.NumberFormat("vi-VN").format(selectedStaffForAction.details?.otherSupport || 0)} className="h-9 px-2 rounded-lg border-emerald-200 text-xs" onInput={(e) => { const v = e.currentTarget.value.replace(/\D/g, ''); e.currentTarget.value = v ? new Intl.NumberFormat("vi-VN").format(Number(v)) : ''; }} />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter ml-1">Phụ cấp gửi xe</label>
                                <Input name="parking" type="text" defaultValue={new Intl.NumberFormat("vi-VN").format(selectedStaffForAction.details?.parking || 100000)} className="h-9 px-2 rounded-lg border-emerald-200 text-xs" onInput={(e) => { const v = e.currentTarget.value.replace(/\D/g, ''); e.currentTarget.value = v ? new Intl.NumberFormat("vi-VN").format(Number(v)) : ''; }} />
                              </div>
                            </div>
                          </div>

                          {/* Row 3: Merged Thưởng & Phạt */}
                          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col gap-3">
                            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-1">Dòng 3: Thưởng & Phạt</div>
                            <div className="grid grid-cols-4 gap-4">
                              <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-blue-600 uppercase tracking-tighter ml-1">HS tái nhập học</label>
                                <Input name="reEnrollCount" type="number" defaultValue={selectedStaffForAction.details?.reEnrollCount || 0} className="h-9 px-2 rounded-lg border-blue-200 text-xs" onChange={(e) => { const f=e.target.form; if(f && f.elements.namedItem('displayReEnrollTotal')){ const count = Number(e.target.value||0); const rate = Number((f.elements.namedItem('reEnrollRewardRate') as HTMLInputElement).value.replace(/\./g,'')||0); (f.elements.namedItem('displayReEnrollTotal') as HTMLInputElement).value = new Intl.NumberFormat('vi-VN').format(count * rate); } }} />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-blue-600 uppercase tracking-tighter ml-1">Mức Thưởng</label>
                                <Input name="reEnrollRewardRate" type="text" defaultValue={new Intl.NumberFormat("vi-VN").format(selectedStaffForAction.details?.reEnrollRewardRate || 50000)} className="h-9 px-2 rounded-lg border-blue-200 text-xs" onInput={(e) => { const v = e.currentTarget.value.replace(/\D/g, ''); e.currentTarget.value = v ? new Intl.NumberFormat("vi-VN").format(Number(v)) : ''; const f=e.currentTarget.form; if(f && f.elements.namedItem('displayReEnrollTotal')){ const count = Number((f.elements.namedItem('reEnrollCount') as HTMLInputElement).value||0); (f.elements.namedItem('displayReEnrollTotal') as HTMLInputElement).value = new Intl.NumberFormat('vi-VN').format(count * Number(v)); } }} />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-blue-600 uppercase tracking-tighter ml-1">T.Tiền thưởng</label>
                                <Input name="displayReEnrollTotal" readOnly type="text" defaultValue={new Intl.NumberFormat("vi-VN").format((selectedStaffForAction.details?.reEnrollCount || 0) * (selectedStaffForAction.details?.reEnrollRewardRate || 50000))} className="h-9 px-2 rounded-lg border-blue-200 bg-blue-100/50 font-black text-blue-700 text-xs cursor-not-allowed outline-none" tabIndex={-1} />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black text-rose-600 uppercase tracking-tighter ml-1">Khoản phạt</label>
                                <Input name="penalty" type="text" defaultValue={new Intl.NumberFormat("vi-VN").format(selectedStaffForAction.details?.penalty || 0)} className="h-9 px-2 rounded-lg border-rose-200 font-bold text-rose-600 text-xs" onInput={(e) => { const v = e.currentTarget.value.replace(/\D/g, ''); e.currentTarget.value = v ? new Intl.NumberFormat("vi-VN").format(Number(v)) : ''; }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : selectedStaffForAction.role === "ASSISTANT" ? (
                        /* Teaching Assistant (TA) Payroll Form */
                        <div className="col-span-3 flex flex-col gap-4">
                          <div className="grid grid-cols-3 gap-5">
                            {/* Block 1: Working Hours */}
                            <div className="space-y-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-1">1. Công & Giờ dạy</div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter ml-1">Tổng số ngày làm</label>
                                  <Input name="taWorkDays" type="number" defaultValue={selectedStaffForAction.details?.taWorkDays || 0} className="h-9 px-2 rounded-lg border-slate-200 text-xs" />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-black text-indigo-600 uppercase tracking-tighter ml-1">Tổng giờ dạy</label>
                                  <Input name="totalHours" type="number" step="0.1" defaultValue={selectedStaffForAction.details?.totalHours || 0} placeholder="VD: 23.5" className="h-9 px-2 rounded-lg border-indigo-200 text-indigo-700 font-bold text-xs" onChange={(e) => { const f=e.target.form; if(f && f.elements.namedItem('taNetDisplay')){ const h=Number(e.target.value||0); const r=Number((f.elements.namedItem('hourlyRate') as HTMLInputElement).value.replace(/\./g,'')||0); const t=Number((f.elements.namedItem('taTransport') as HTMLInputElement).value.replace(/\./g,'')||0); const c=Number((f.elements.namedItem('taCommitment') as HTMLInputElement).value.replace(/\./g,'')||0); const o=Number((f.elements.namedItem('taOther') as HTMLInputElement).value.replace(/\./g,'')||0); (f.elements.namedItem('taNetDisplay') as HTMLInputElement).value = new Intl.NumberFormat('vi-VN').format(Math.round(h*r+t-c-o)); } }} />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-black text-indigo-600 uppercase tracking-tighter ml-1">Đơn giá / giờ</label>
                                  <Input name="hourlyRate" type="text" defaultValue={new Intl.NumberFormat('vi-VN').format(selectedStaffForAction.details?.hourlyRate || 30000)} className="h-9 px-2 rounded-lg border-indigo-200 text-indigo-700 font-bold text-xs" onChange={(e) => { const raw=e.target.value.replace(/\./g,''); e.target.value=raw?new Intl.NumberFormat('vi-VN').format(Number(raw)):''; const f=e.target.form; if(f && f.elements.namedItem('taNetDisplay')){ const h=Number((f.elements.namedItem('totalHours') as HTMLInputElement).value||0); const t=Number((f.elements.namedItem('taTransport') as HTMLInputElement).value.replace(/\./g,'')||0); const c=Number((f.elements.namedItem('taCommitment') as HTMLInputElement).value.replace(/\./g,'')||0); const o=Number((f.elements.namedItem('taOther') as HTMLInputElement).value.replace(/\./g,'')||0); (f.elements.namedItem('taNetDisplay') as HTMLInputElement).value = new Intl.NumberFormat('vi-VN').format(Math.round(h*Number(raw||0)+t-c-o)); } }} />
                                </div>
                            </div>

                            {/* Block 2: Allowances */}
                            <div className="space-y-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-1">2. Hỗ trợ & Phụ cấp</div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter ml-1">Hỗ trợ đi lại</label>
                                  <Input name="taTransport" type="text" defaultValue={new Intl.NumberFormat('vi-VN').format(selectedStaffForAction.details?.taTransport || 0)} className="h-9 px-2 rounded-lg border-emerald-200 text-emerald-700 font-bold text-xs" onChange={(e) => { const raw=e.target.value.replace(/\./g,''); e.target.value=raw?new Intl.NumberFormat('vi-VN').format(Number(raw)):''; const f=e.target.form; if(f && f.elements.namedItem('taNetDisplay')){ const h=Number((f.elements.namedItem('totalHours') as HTMLInputElement).value||0); const r=Number((f.elements.namedItem('hourlyRate') as HTMLInputElement).value.replace(/\./g,'')||0); const c=Number((f.elements.namedItem('taCommitment') as HTMLInputElement).value.replace(/\./g,'')||0); const o=Number((f.elements.namedItem('taOther') as HTMLInputElement).value.replace(/\./g,'')||0); (f.elements.namedItem('taNetDisplay') as HTMLInputElement).value = new Intl.NumberFormat('vi-VN').format(Math.round(h*r+Number(raw||0)-c-o)); } }} />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter ml-1">Lương theo giờ chuẩn</label>
                                  <div className="h-9 flex items-center px-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[9px] font-black text-emerald-700 tracking-tighter uppercase">Theo giờ × Đơn giá</div>
                                </div>
                            </div>

                            {/* Block 3: Deductions */}
                            <div className="space-y-3 bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                                <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest border-b border-rose-100 pb-1">3. Giảm trừ</div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-black text-rose-500 uppercase tracking-tighter ml-1">Cam kết làm việc</label>
                                  <Input name="taCommitment" type="text" defaultValue={new Intl.NumberFormat('vi-VN').format(selectedStaffForAction.details?.taCommitment || 0)} className="h-9 px-2 rounded-lg border-rose-200 text-rose-600 font-bold text-xs" onChange={(e) => { const raw=e.target.value.replace(/\./g,''); e.target.value=raw?new Intl.NumberFormat('vi-VN').format(Number(raw)):''; const f=e.target.form; if(f && f.elements.namedItem('taNetDisplay')){ const h=Number((f.elements.namedItem('totalHours') as HTMLInputElement).value||0); const r=Number((f.elements.namedItem('hourlyRate') as HTMLInputElement).value.replace(/\./g,'')||0); const t=Number((f.elements.namedItem('taTransport') as HTMLInputElement).value.replace(/\./g,'')||0); const o=Number((f.elements.namedItem('taOther') as HTMLInputElement).value.replace(/\./g,'')||0); (f.elements.namedItem('taNetDisplay') as HTMLInputElement).value = new Intl.NumberFormat('vi-VN').format(Math.round(h*r+t-Number(raw||0)-o)); } }} />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-black text-rose-500 uppercase tracking-tighter ml-1">Khác</label>
                                  <Input name="taOther" type="text" defaultValue={new Intl.NumberFormat('vi-VN').format(selectedStaffForAction.details?.taOther || 0)} className="h-9 px-2 rounded-lg border-rose-200 text-rose-600 font-bold text-xs" onChange={(e) => { const raw=e.target.value.replace(/\./g,''); e.target.value=raw?new Intl.NumberFormat('vi-VN').format(Number(raw)):''; const f=e.target.form; if(f && f.elements.namedItem('taNetDisplay')){ const h=Number((f.elements.namedItem('totalHours') as HTMLInputElement).value||0); const r=Number((f.elements.namedItem('hourlyRate') as HTMLInputElement).value.replace(/\./g,'')||0); const t=Number((f.elements.namedItem('taTransport') as HTMLInputElement).value.replace(/\./g,'')||0); const c=Number((f.elements.namedItem('taCommitment') as HTMLInputElement).value.replace(/\./g,'')||0); (f.elements.namedItem('taNetDisplay') as HTMLInputElement).value = new Intl.NumberFormat('vi-VN').format(Math.round(h*r+t-c-Number(raw||0))); } }} />
                                </div>
                                <div className="pt-2 border-t border-rose-100">
                                  <label className="text-[8px] font-black text-rose-400 uppercase tracking-tighter ml-1">Tổng giảm trừ</label>
                                  <Input name="taTotalDeduction" readOnly type="text" defaultValue={new Intl.NumberFormat('vi-VN').format((selectedStaffForAction.details?.taCommitment || 0) + (selectedStaffForAction.details?.taOther || 0))} className="h-9 px-2 rounded-lg border-rose-100 bg-rose-50/80 text-rose-600 text-xs font-black cursor-not-allowed mt-1 outline-none" tabIndex={-1} />
                                </div>
                            </div>
                          </div>

                          {/* Net Summary */}
                          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex items-center gap-4">
                            <div className="flex-1">
                              <div className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1">Công thức</div>
                              <div className="text-[10px] text-slate-500 font-bold italic">Thực nhận = Tổng giờ × Đơn giá/giờ + Hỗ trợ gửi xe − Cam kết − Khác</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1">Thực nhận</div>
                              <Input name="taNetDisplay" readOnly type="text" defaultValue={new Intl.NumberFormat('vi-VN').format(Math.round((selectedStaffForAction.details?.totalHours || 0) * (selectedStaffForAction.details?.hourlyRate || 30000) + (selectedStaffForAction.details?.taTransport || 0) - (selectedStaffForAction.details?.taCommitment || 0) - (selectedStaffForAction.details?.taOther || 0)))} className="h-10 px-3 rounded-xl border-indigo-200 bg-white font-black text-indigo-600 text-sm cursor-not-allowed text-right w-44" tabIndex={-1} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="col-span-3 grid grid-cols-3 gap-8 items-start">
                          {/* Column 1: Administrative Salary & Allowances */}
                          <div className="space-y-3">
                            <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/10 pb-1 mb-2">1. Lương hành chính & Phụ cấp</div>
                            <div className="space-y-3">
                              <div className="grid grid-cols-3 gap-2">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter ml-1 truncate">Lương HĐ</label>
                                  <Input name="baseSalary" type="text" defaultValue={new Intl.NumberFormat("vi-VN").format(selectedStaffForAction.details?.baseSalary || 15000000)} className="h-9 px-2 rounded-lg border-slate-200 focus:ring-primary/20 text-xs" required  onInput={(e) => { const v = e.currentTarget.value.replace(/\D/g, ''); e.currentTarget.value = v ? new Intl.NumberFormat("vi-VN").format(Number(v)) : ''; }}/>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter ml-1 truncate">Công chuẩn</label>
                                  <Input name="stdDays" type="number" defaultValue={selectedStaffForAction.details?.stdDays || 26} className="h-9 px-2 rounded-lg border-slate-200 focus:ring-primary/20 text-xs" required />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter ml-1 truncate">Công thực</label>
                                  <Input name="actDays" type="number" defaultValue={selectedStaffForAction.details?.actDays || 26} className="h-9 px-2 rounded-lg border-slate-200 focus:ring-primary/20 text-xs" required />
                                </div>
                              </div>
                              
                              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 grid grid-cols-3 gap-2">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter ml-1 italic text-primary/60 truncate">Lương lễ</label>
                                  <Input name="policyBase" type="text" defaultValue={new Intl.NumberFormat("vi-VN").format(selectedStaffForAction.details?.policyBase || 15000000)} className="h-9 px-2 rounded-lg border-slate-200 focus:ring-primary/20 text-xs"  onInput={(e) => { const v = e.currentTarget.value.replace(/\D/g, ''); e.currentTarget.value = v ? new Intl.NumberFormat("vi-VN").format(Number(v)) : ''; }}/>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter ml-1 italic text-primary/60 truncate">Chuẩn lễ</label>
                                  <Input name="policyStdDays" type="number" defaultValue={selectedStaffForAction.details?.policyStdDays || 26} className="h-9 px-2 rounded-lg border-slate-200 focus:ring-primary/20 text-xs" />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter ml-1 italic text-primary/60 truncate">Thực lễ</label>
                                  <Input name="policyActDays" type="number" defaultValue={selectedStaffForAction.details?.policyActDays || 1} className="h-9 px-2 rounded-lg border-slate-200 focus:ring-primary/20 text-xs" />
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2 pt-1">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter ml-1">Gửi xe</label>
                                  <Input name="parking" type="text" defaultValue={new Intl.NumberFormat("vi-VN").format(selectedStaffForAction.details?.parking || 100000)} className="h-9 px-2 rounded-lg border-slate-200 text-xs"  onInput={(e) => { const v = e.currentTarget.value.replace(/\D/g, ''); e.currentTarget.value = v ? new Intl.NumberFormat("vi-VN").format(Number(v)) : ''; }}/>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter ml-1">Điện thoại</label>
                                  <Input name="phone" type="text" defaultValue={new Intl.NumberFormat("vi-VN").format(selectedStaffForAction.details?.phone || 300000)} className="h-9 px-2 rounded-lg border-slate-200 text-xs"  onInput={(e) => { const v = e.currentTarget.value.replace(/\D/g, ''); e.currentTarget.value = v ? new Intl.NumberFormat("vi-VN").format(Number(v)) : ''; }}/>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter ml-1">VPP</label>
                                  <Input name="stationery" type="text" defaultValue={new Intl.NumberFormat("vi-VN").format(selectedStaffForAction.details?.stationery || 100000)} className="h-9 px-2 rounded-lg border-slate-200 text-xs"  onInput={(e) => { const v = e.currentTarget.value.replace(/\D/g, ''); e.currentTarget.value = v ? new Intl.NumberFormat("vi-VN").format(Number(v)) : ''; }}/>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Column 2: Revenue & KPI Rewards */}
                          <div className="space-y-3">
                            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] border-b border-emerald-100 pb-1 mb-2">2. Lương Doanh Thu (Lớp Tái Tục) & KPI</div>

                            <div className="space-y-2 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                              {/* Header table */}
                              <div className="flex items-center justify-between">
                                <div className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Danh sách lớp tái tục</div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRenewalClassesEntry(prev => [...prev, {
                                      id: `rc-${Date.now()}`,
                                      className: `Lớp mới ${prev.length + 1}`,
                                      studentCount: 0,
                                      droppedCount: 0,
                                      tuitionRevenue: 0,
                                      materialRevenue: 0,
                                      includeTuition: true,
                                      includeMaterial: false,
                                    }]);
                                  }}
                                  className="px-2 py-1 rounded-md bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider hover:bg-emerald-700 transition-colors"
                                >
                                  + Thêm lớp
                                </button>
                              </div>

                              <div className="max-h-[280px] overflow-y-auto pr-1 space-y-2">
                                {suggestedFromCRM.length > 0 && (
                                  <div className="p-2 rounded-lg border border-dashed border-sky-300 bg-sky-50/70 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-black text-sky-700 uppercase tracking-wider flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                                        Đề xuất từ CRM ({suggestedFromCRM.length} lớp · {currentMonthKey})
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          // Merge: với mỗi lớp từ CRM, nếu đã có trong entry (theo className) thì cộng doanh số; nếu chưa thì thêm mới
                                          setRenewalClassesEntry(prev => {
                                            const next = [...prev];
                                            for (const s of suggestedFromCRM) {
                                              const existingIdx = next.findIndex(c => c.className === s.className);
                                              if (existingIdx >= 0) {
                                                const ex = next[existingIdx];
                                                next[existingIdx] = {
                                                  ...ex,
                                                  studentCount: Math.max(ex.studentCount, s.studentCount),
                                                  tuitionRevenue: ex.tuitionRevenue + s.tuitionRevenue,
                                                  materialRevenue: ex.materialRevenue + s.materialRevenue,
                                                  includeTuition: ex.includeTuition || s.includeTuition,
                                                  includeMaterial: ex.includeMaterial || s.includeMaterial,
                                                };
                                              } else {
                                                next.push({
                                                  id: `rc-crm-${s.classId}-${Date.now()}`,
                                                  className: s.className,
                                                  studentCount: s.studentCount,
                                                  droppedCount: 0,
                                                  tuitionRevenue: s.tuitionRevenue,
                                                  materialRevenue: s.materialRevenue,
                                                  includeTuition: s.includeTuition,
                                                  includeMaterial: s.includeMaterial,
                                                });
                                              }
                                            }
                                            return next;
                                          });
                                          toast.success(`Đã gộp ${suggestedFromCRM.length} lớp từ CRM vào lương doanh thu`);
                                        }}
                                        className="px-2 py-0.5 rounded-md bg-sky-600 text-white text-[9px] font-black uppercase tracking-wider hover:bg-sky-700 transition-colors"
                                      >
                                        Gộp tất cả
                                      </button>
                                    </div>
                                    <div className="space-y-1">
                                      {suggestedFromCRM.map(s => (
                                        <div key={s.classId} className="flex items-center justify-between text-[10px] bg-white/60 rounded px-2 py-1 border border-sky-100">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-black text-sky-800">{s.className}</span>
                                            <span className="text-slate-500">· {s.studentCount} HS</span>
                                          </div>
                                          <span className="font-bold text-emerald-600">
                                            +{new Intl.NumberFormat('vi-VN').format(s.tuitionRevenue + s.materialRevenue)} đ
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {renewalClassesEntry.length === 0 && (
                                  <div className="text-center text-[10px] text-slate-400 italic py-4 border border-dashed border-emerald-200 rounded-lg bg-white/40">
                                    Chưa có lớp tái tục — Bấm "Thêm lớp" để bắt đầu
                                  </div>
                                )}
                                {renewalClassesEntry.map((rc, idx) => {
                                  const commission = calcClassCommission(rc);
                                  const baseRate = getBaseRate(rc.studentCount);
                                  const bonusRate = getRenewalBonus(rc.droppedCount);
                                  const penalty = isKpiPenalized(rc.droppedCount);
                                  return (
                                    <div key={rc.id} className={`p-2 rounded-lg border bg-white/70 ${penalty ? 'border-rose-300' : 'border-emerald-200'} space-y-1.5`}>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={rc.className}
                                          onChange={(e) => {
                                            const v = e.target.value;
                                            setRenewalClassesEntry(prev => prev.map((c, i) => i === idx ? { ...c, className: v } : c));
                                          }}
                                          className="flex-1 h-7 px-2 rounded border border-emerald-200 text-[11px] font-black text-emerald-700 outline-none focus:ring-1 focus:ring-emerald-400"
                                          placeholder="Tên lớp"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => setRenewalClassesEntry(prev => prev.filter((_, i) => i !== idx))}
                                          className="w-7 h-7 rounded-md bg-rose-50 border border-rose-200 text-rose-500 text-[10px] font-black hover:bg-rose-100 transition-colors"
                                          title="Xóa lớp"
                                        >
                                          ×
                                        </button>
                                      </div>

                                      <div className="grid grid-cols-2 gap-1.5">
                                        <div className="flex flex-col gap-0.5">
                                          <label className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Sĩ số</label>
                                          <input
                                            type="number"
                                            value={rc.studentCount}
                                            onChange={(e) => {
                                              const v = Number(e.target.value) || 0;
                                              setRenewalClassesEntry(prev => prev.map((c, i) => i === idx ? { ...c, studentCount: v } : c));
                                            }}
                                            className="h-7 px-1.5 rounded border border-slate-200 text-[10px] font-bold outline-none focus:ring-1 focus:ring-emerald-400"
                                          />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                          <label className={`text-[8px] font-black uppercase tracking-tighter ${penalty ? 'text-rose-600' : 'text-slate-500'}`}>HS nghỉ</label>
                                          <input
                                            type="number"
                                            value={rc.droppedCount}
                                            onChange={(e) => {
                                              const v = Number(e.target.value) || 0;
                                              setRenewalClassesEntry(prev => prev.map((c, i) => i === idx ? { ...c, droppedCount: v } : c));
                                            }}
                                            className={`h-7 px-1.5 rounded border text-[10px] font-bold outline-none focus:ring-1 ${penalty ? 'border-rose-300 text-rose-600 focus:ring-rose-400 bg-rose-50/50' : 'border-slate-200 focus:ring-emerald-400'}`}
                                          />
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-[auto,1fr] items-center gap-1.5">
                                        <label className="flex items-center gap-1 cursor-pointer select-none">
                                          <input
                                            type="checkbox"
                                            checked={rc.includeTuition}
                                            onChange={(e) => {
                                              const v = e.target.checked;
                                              setRenewalClassesEntry(prev => prev.map((c, i) => i === idx ? { ...c, includeTuition: v } : c));
                                            }}
                                            className="w-3 h-3 accent-emerald-600"
                                          />
                                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Học phí</span>
                                        </label>
                                        <input
                                          type="text"
                                          value={new Intl.NumberFormat('vi-VN').format(rc.tuitionRevenue)}
                                          onChange={(e) => {
                                            const raw = Number(e.target.value.replace(/\D/g, '')) || 0;
                                            setRenewalClassesEntry(prev => prev.map((c, i) => i === idx ? { ...c, tuitionRevenue: raw } : c));
                                          }}
                                          className={`h-7 px-2 rounded border border-slate-200 text-[10px] font-bold outline-none focus:ring-1 focus:ring-emerald-400 text-right ${rc.includeTuition ? 'bg-white' : 'bg-slate-50 text-slate-400'}`}
                                          disabled={!rc.includeTuition}
                                        />
                                      </div>

                                      <div className="grid grid-cols-[auto,1fr] items-center gap-1.5">
                                        <label className="flex items-center gap-1 cursor-pointer select-none">
                                          <input
                                            type="checkbox"
                                            checked={rc.includeMaterial}
                                            onChange={(e) => {
                                              const v = e.target.checked;
                                              setRenewalClassesEntry(prev => prev.map((c, i) => i === idx ? { ...c, includeMaterial: v } : c));
                                            }}
                                            className="w-3 h-3 accent-emerald-600"
                                          />
                                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Học liệu</span>
                                        </label>
                                        <input
                                          type="text"
                                          value={new Intl.NumberFormat('vi-VN').format(rc.materialRevenue)}
                                          onChange={(e) => {
                                            const raw = Number(e.target.value.replace(/\D/g, '')) || 0;
                                            setRenewalClassesEntry(prev => prev.map((c, i) => i === idx ? { ...c, materialRevenue: raw } : c));
                                          }}
                                          className={`h-7 px-2 rounded border border-slate-200 text-[10px] font-bold outline-none focus:ring-1 focus:ring-emerald-400 text-right ${rc.includeMaterial ? 'bg-white' : 'bg-slate-50 text-slate-400'}`}
                                          disabled={!rc.includeMaterial}
                                        />
                                      </div>

                                      <div className="flex items-center justify-between pt-1 border-t border-emerald-100">
                                        <span className="text-[9px] font-black text-slate-500 italic">
                                          {(baseRate * 100).toFixed(0)}% + {(bonusRate * 100).toFixed(1)}% = <span className="text-emerald-700">{((baseRate + bonusRate) * 100).toFixed(1)}%</span>
                                        </span>
                                        <span className="text-[11px] font-black text-emerald-600">
                                          {new Intl.NumberFormat('vi-VN').format(commission)}
                                        </span>
                                      </div>

                                      {penalty && (
                                        <div className="text-[8px] font-black text-rose-600 uppercase tracking-wider bg-rose-50 border border-rose-200 px-2 py-1 rounded">
                                          ⚠ Nghỉ {'>'}4 bạn → Trừ KPI hiệu suất CV
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Summary */}
                              <div className="flex items-center justify-between pt-2 border-t border-emerald-200">
                                <div className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Tổng hoa hồng</div>
                                <div className="text-sm font-black text-emerald-700">
                                  {new Intl.NumberFormat('vi-VN').format(calcTotalRenewalCommission(renewalClassesEntry))} đ
                                </div>
                              </div>

                              <div className="flex justify-between gap-1 text-[8px] font-bold text-emerald-600/70 italic px-2 py-1 bg-white/50 rounded-lg">
                                <span>1-15: 3%</span>
                                <span>16-25: 4%</span>
                                <span>26-34: 5%</span>
                              </div>
                              <div className="flex justify-between gap-1 text-[8px] font-bold text-blue-600/70 italic px-2 py-1 bg-white/50 rounded-lg">
                                <span>100% TT: +1%</span>
                                <span>Nghỉ 1: +0.7%</span>
                                <span>Nghỉ 2: +0.5%</span>
                                <span>Nghỉ ≥3: 0</span>
                              </div>
                            </div>

                            <div className="space-y-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                              <div className="grid grid-cols-3 gap-2">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-black text-blue-600 uppercase tracking-tighter ml-1 truncate">Lương HS chuẩn</label>
                                  <Input name="kpiPool" type="text" defaultValue={new Intl.NumberFormat("vi-VN").format(selectedStaffForAction.details?.kpiPool || 1500000)} className="h-9 px-2 rounded-lg border-slate-200 text-xs" onChange={(e) => { const raw = e.target.value.replace(/\./g, ''); const formatted = raw ? new Intl.NumberFormat('vi-VN').format(Number(raw)) : ''; e.target.value = formatted; const f=e.target.form; if(f && f.elements.namedItem('manualKpi')){ (f.elements.namedItem('manualKpi') as HTMLInputElement).value = new Intl.NumberFormat('vi-VN').format(Math.round(Number(raw||0) * Number((f.elements.namedItem('kpiScore') as HTMLInputElement).value || 0) / 100)); } }} />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter ml-1">% đạt</label>
                                  <Input name="kpiScore" type="number" defaultValue={selectedStaffForAction.details?.kpiScore || 82} className="h-9 px-2 rounded-lg border-slate-200 text-xs" onChange={(e)=>{ const f=e.target.form; if(f && f.elements.namedItem('manualKpi')){ (f.elements.namedItem('manualKpi') as HTMLInputElement).value = new Intl.NumberFormat('vi-VN').format(Math.round(Number((f.elements.namedItem('kpiPool') as HTMLInputElement).value.replace(/\./g, '') || 0) * Number(e.target.value.replace(/\./g, '')||0) / 100)); } }} />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-tighter ml-1">Tiền KPI</label>
                                  <Input name="manualKpi" readOnly type="text" defaultValue={new Intl.NumberFormat("vi-VN").format((selectedStaffForAction.details?.kpiPool || 1500000) * (selectedStaffForAction.details?.kpiScore || 82) / 100)} className="h-9 px-2 rounded-lg border-blue-100 bg-blue-50/80 font-black text-blue-600 text-xs cursor-not-allowed outline-none" tabIndex={-1}  onInput={(e) => { const v = e.currentTarget.value.replace(/\D/g, ''); e.currentTarget.value = v ? new Intl.NumberFormat("vi-VN").format(Number(v)) : ''; }}/>
                                </div>
                              </div>
                              <div className="text-[8px] font-bold text-blue-600/70 italic p-2 bg-white/50 rounded-lg leading-tight uppercase text-center">
                                * Công thức: Tiền KPI = Lương HS chuẩn × % Đạt {hasAnyKpiPenalty(renewalClassesEntry) ? '— ⚠ Có lớp trừ KPI' : ''}
                              </div>
                            </div>
                          </div>

                          {/* Column 3: Reductions & Social Insurance */}
                          <div className="space-y-3">
                            <div className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] border-b border-rose-100 pb-1 mb-2">3. Các khoản giảm trừ</div>
                            <div className="space-y-3 bg-rose-50/50 p-4 rounded-xl border border-rose-100/50">
                              <div className="grid grid-cols-[1fr,1.2fr] items-center gap-2">
                                <label className="text-[8px] font-black text-rose-500 uppercase tracking-tighter ml-1">Phạt vi phạm</label>
                                <Input name="penalty" type="text" defaultValue={new Intl.NumberFormat("vi-VN").format(selectedStaffForAction.details?.penalty || 50000)} className="h-9 px-2 rounded-lg border-rose-200 text-rose-600 font-bold text-xs" onChange={(e) => { const raw = e.target.value.replace(/\./g, ''); e.target.value = raw ? new Intl.NumberFormat('vi-VN').format(Number(raw)) : ''; const f=e.target.form; if(f && f.elements.namedItem('displayDeduction')){ (f.elements.namedItem('displayDeduction') as HTMLInputElement).value = new Intl.NumberFormat('vi-VN').format(Number(raw||0) + Number((f.elements.namedItem('otherDeduction') as HTMLInputElement).value.replace(/\./g,'') || 0) + Number((f.elements.namedItem('socialInsurance') as HTMLInputElement).value.replace(/\./g,'') || 0)); } }} />
                              </div>
                              <div className="grid grid-cols-[1fr,1.2fr] items-center gap-2">
                                <label className="text-[8px] font-black text-rose-500 uppercase tracking-tighter ml-1">Khấu trừ khác</label>
                                <Input name="otherDeduction" type="text" defaultValue={new Intl.NumberFormat("vi-VN").format(selectedStaffForAction.details?.otherDeduction || 0)} className="h-9 px-2 rounded-lg border-rose-200 text-rose-600 font-bold text-xs" onChange={(e) => { const raw = e.target.value.replace(/\./g, ''); e.target.value = raw ? new Intl.NumberFormat('vi-VN').format(Number(raw)) : ''; const f=e.target.form; if(f && f.elements.namedItem('displayDeduction')){ (f.elements.namedItem('displayDeduction') as HTMLInputElement).value = new Intl.NumberFormat('vi-VN').format(Number((f.elements.namedItem('penalty') as HTMLInputElement).value.replace(/\./g,'') || 0) + Number(raw||0) + Number((f.elements.namedItem('socialInsurance') as HTMLInputElement).value.replace(/\./g,'') || 0)); } }} />
                              </div>
                              <div className="grid grid-cols-[1fr,1.2fr] items-center gap-2">
                                <label className="text-[8px] font-black text-rose-500 uppercase tracking-tighter ml-1">BHXH NLĐ</label>
                                <Input name="socialInsurance" type="text" defaultValue={new Intl.NumberFormat("vi-VN").format(selectedStaffForAction.details?.socialInsurance || 1150000)} className="h-9 px-2 rounded-lg border-rose-200 text-rose-600 font-bold text-xs" onChange={(e) => { const raw = e.target.value.replace(/\./g, ''); e.target.value = raw ? new Intl.NumberFormat('vi-VN').format(Number(raw)) : ''; const f=e.target.form; if(f && f.elements.namedItem('displayDeduction')){ (f.elements.namedItem('displayDeduction') as HTMLInputElement).value = new Intl.NumberFormat('vi-VN').format(Number((f.elements.namedItem('penalty') as HTMLInputElement).value.replace(/\./g,'') || 0) + Number((f.elements.namedItem('otherDeduction') as HTMLInputElement).value.replace(/\./g,'') || 0) + Number(raw||0)); } }} />
                              </div>
                              <div className="pt-3 border-t border-rose-100 mt-2 grid grid-cols-[1.2fr,1fr] items-center gap-2">
                                <label className="text-[8px] font-black text-rose-400 uppercase tracking-tighter ml-1">Tổng khấu trừ</label>
                                <Input name="displayDeduction" readOnly type="text" defaultValue={new Intl.NumberFormat("vi-VN").format((selectedStaffForAction.details?.penalty || 50000) + (selectedStaffForAction.details?.otherDeduction || 0) + (selectedStaffForAction.details?.socialInsurance || 1150000))} className="h-9 px-2 rounded-lg border-rose-100 bg-rose-50/80 text-rose-600 text-xs font-black cursor-not-allowed outline-none" tabIndex={-1}  onInput={(e) => { const v = e.currentTarget.value.replace(/\D/g, ''); e.currentTarget.value = v ? new Intl.NumberFormat("vi-VN").format(Number(v)) : ''; }}/>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-6 flex flex-col gap-1 w-full relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                      {selectedStaffForAction.role === "FULL_TIME" && (
                        <div className="flex items-center justify-between text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1 relative z-10">
                          <span>Hoa hồng tái tục (live)</span>
                          <span>+{formatVND(calcTotalRenewalCommission(renewalClassesEntry))}</span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-3 relative z-10">
                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Tổng Lương (đã lưu):</span>
                        <span className="text-xl font-black text-primary">
                          {new Intl.NumberFormat('vi-VN').format(selectedStaffForAction.net || 0)} <span className="text-sm">VNĐ</span>
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 italic relative z-10">
                        * Tổng lương = Lương hành chính + Lương doanh thu (học phí/học liệu được tick) - Các khoản giảm trừ
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" className="flex-1 bg-primary h-12 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/30">
                        Xác nhận & Lưu dữ liệu
                      </Button>
                      <Button type="button" onClick={() => setIsEntryModalOpen(false)} variant="outline" className="flex-1 h-12 rounded-xl font-black text-xs uppercase tracking-wider border-slate-200">
                        Hủy bỏ
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Detailed Payslip Modal (Odoo ERP Style) */}
        <AnimatePresence>
          {isPayslipModalOpen && selectedStaffForAction && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsPayslipModalOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-[#f8fafc] w-full max-w-5xl rounded-lg shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-4"
              >
                {/* Payslip Header */}
                <div className="bg-white p-10 border-b border-slate-200 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xl">M</div>
                      <span className="text-xl font-black text-slate-800 tracking-tighter">MENGLISH EDUCATION</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-1">Phiếu lương nhân viên</h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] italic">Thanh toán kỳ: Tháng 03 / 2026</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                      Trạng thái: Đã phê duyệt
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Mã nhân viên</p>
                    <p className="text-lg font-black text-slate-800">#{selectedStaffForAction.id}</p>
                  </div>
                </div>

                {/* Staff Info Card */}
                <div className="px-10 py-8 grid grid-cols-2 gap-12 bg-white">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Thông tin nhân sự</h4>
                    <div className="space-y-2 text-sm font-bold">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Họ và tên:</span>
                        <span className="text-slate-800 uppercase">{selectedStaffForAction.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Chức vụ:</span>
                        <span className="text-slate-800">{selectedStaffForAction.role === "FULL_TIME" ? "Quản lý Học vụ / Admin" : "Giảng viên Part-time"}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Phương thức trả lương</h4>
                    <div className="space-y-2 text-sm font-bold">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ngân hàng:</span>
                        <span className="text-slate-800">Techcombank</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Số tài khoản:</span>
                        <span className="text-slate-800">1903 **** **** 888</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculation Breakdown Table */}
                <div className="px-10 py-6">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung diễn giải</th>
                        <th className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Số lượng</th>
                        <th className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn giá</th>
                        <th className="py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedStaffForAction.role === "PART_TIME_TEACHER" ? (
                        <>
                          <tr>
                            <td className="py-5">
                              <p className="text-sm font-bold text-slate-800">Lương ca dạy chính</p>
                              <p className="text-[10px] text-slate-400 font-medium italic">Theo lịch dạy cố định</p>
                            </td>
                            <td className="py-5 text-center text-sm font-black text-slate-600">{selectedStaffForAction.details?.mainSessions || 0} ca</td>
                            <td className="py-5 text-center text-sm font-black text-slate-500">{formatVND(selectedStaffForAction.details?.mainRate || 250000)}</td>
                            <td className="py-5 text-right text-sm font-black text-slate-800">{formatVND((selectedStaffForAction.details?.mainSessions || 0) * (selectedStaffForAction.details?.mainRate || 250000))}</td>
                          </tr>
                          <tr>
                            <td className="py-5">
                              <p className="text-sm font-bold text-slate-800">Lương ca đan xen GVNN</p>
                              <p className="text-[10px] text-slate-400 font-medium italic">Hỗ trợ giảng dạy chuyên sâu</p>
                            </td>
                            <td className="py-5 text-center text-sm font-black text-slate-600">{selectedStaffForAction.details?.intlSessions || 0} ca</td>
                            <td className="py-5 text-center text-sm font-black text-slate-500">{formatVND(selectedStaffForAction.details?.intlRate || 350000)}</td>
                            <td className="py-5 text-right text-sm font-black text-slate-800">{formatVND((selectedStaffForAction.details?.intlSessions || 0) * (selectedStaffForAction.details?.intlRate || 350000))}</td>
                          </tr>
                          <tr>
                            <td className="py-5">
                              <p className="text-sm font-bold text-slate-800">Tổng số lớp giảng dạy</p>
                              <p className="text-[10px] text-slate-400 font-medium italic">Ghi nhận hiệu suất đứng lớp</p>
                            </td>
                            <td className="py-5 text-center text-sm font-black text-slate-600">{selectedStaffForAction.details?.totalClasses || 0} lớp</td>
                            <td className="py-5 text-center">---</td>
                            <td className="py-5 text-right text-sm font-black text-slate-400">---</td>
                          </tr>
                          <tr>
                            <td className="py-5">
                              <p className="text-sm font-bold text-emerald-600">Thưởng KPI Giữ học viên</p>
                              <p className="text-[10px] text-slate-400 font-medium italic">Thưởng dựa trên sĩ số thực tế</p>
                            </td>
                            <td className="py-5 text-center text-sm font-black text-slate-600">{selectedStaffForAction.details?.kpiStudents || 0} HS</td>
                            <td className="py-5 text-center text-sm font-black text-slate-500">{formatVND(15000)}</td>
                            <td className="py-5 text-right text-sm font-black text-emerald-600">+{formatVND((selectedStaffForAction.details?.kpiStudents || 0) * 15000)}</td>
                          </tr>
                          <tr>
                            <td className="py-5">
                              <p className="text-sm font-bold text-slate-800">Phụ cấp gửi xe</p>
                            </td>
                            <td className="py-5 text-center">---</td>
                            <td className="py-5 text-center">---</td>
                            <td className="py-5 text-right text-sm font-black text-slate-800">{formatVND(selectedStaffForAction.details?.parking || 100000)}</td>
                          </tr>
                          {selectedStaffForAction.details?.otherSupport > 0 && (
                            <tr>
                              <td className="py-5">
                                <p className="text-sm font-bold text-slate-800">Hỗ trợ khác</p>
                              </td>
                              <td className="py-5 text-center">---</td>
                              <td className="py-5 text-center">---</td>
                              <td className="py-5 text-right text-sm font-black text-slate-800">{formatVND(selectedStaffForAction.details?.otherSupport)}</td>
                            </tr>
                          )}
                          {selectedStaffForAction.details?.penalty > 0 && (
                            <tr>
                              <td className="py-5 text-rose-500">
                                <p className="text-sm font-black uppercase italic">Dự tính Phạt / Khấu trừ</p>
                              </td>
                              <td className="py-5 text-center">---</td>
                              <td className="py-5 text-center">---</td>
                              <td className="py-5 text-right text-sm font-black text-rose-500">-{formatVND(selectedStaffForAction.details?.penalty)}</td>
                            </tr>
                          )}
                        </>
                      ) : (
                        <>
                          <tr>
                            <td className="py-5">
                              <p className="text-sm font-bold text-slate-800">Lương hành chính (Theo công)</p>
                              <p className="text-[10px] text-slate-400 font-medium italic">Công thực: {selectedStaffForAction.details?.actDays || 26}/{selectedStaffForAction.details?.stdDays || 26} ngày</p>
                            </td>
                            <td className="py-5 text-center text-sm font-black text-slate-600">
                                {(((selectedStaffForAction.details?.actDays || 26) / (selectedStaffForAction.details?.stdDays || 26)) * 100).toFixed(0)}%
                            </td>
                            <td className="py-5 text-center text-sm font-black text-slate-500">{formatVND(selectedStaffForAction.details?.baseSalary || selectedStaffForAction.base)}</td>
                            <td className="py-5 text-right text-sm font-black text-slate-800">
                                {formatVND(((selectedStaffForAction.details?.baseSalary || selectedStaffForAction.base || 0) / (selectedStaffForAction.details?.stdDays || 26)) * (selectedStaffForAction.details?.actDays || 26))}
                            </td>
                          </tr>
                          {selectedStaffForAction.details?.holidayPay > 0 && (
                            <tr>
                              <td className="py-5">
                                <p className="text-sm font-bold text-slate-800">Lương ngày lễ</p>
                                <p className="text-[10px] text-slate-400 font-medium italic">Thanh toán cộng thêm cho ngày lễ</p>
                              </td>
                              <td className="py-5 text-center text-sm font-black text-slate-600">---</td>
                              <td className="py-5 text-center text-sm font-black text-slate-500">---</td>
                              <td className="py-5 text-right text-sm font-black text-emerald-600">
                                  +{formatVND(selectedStaffForAction.details?.holidayPay || 0)}
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td className="py-5">
                              <p className="text-sm font-bold text-slate-800">Tổng phụ cấp cố định</p>
                              <p className="text-[10px] text-slate-400 font-medium italic">Gửi xe, Điện thoại, Văn phòng phẩm</p>
                            </td>
                            <td className="py-5 text-center">---</td>
                            <td className="py-5 text-center">---</td>
                            <td className="py-5 text-right text-sm font-black text-emerald-600">
                                +{formatVND((selectedStaffForAction.details?.parking || 0) + (selectedStaffForAction.details?.phone || 0) + (selectedStaffForAction.details?.stationery || 0))}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-5">
                              <p className="text-sm font-bold text-emerald-600">Lương hiệu suất (KPI)</p>
                              <p className="text-[10px] text-slate-400 font-medium italic">Đạt {selectedStaffForAction.details?.kpiScore || 0}% điểm KPI</p>
                            </td>
                            <td className="py-5 text-center">---</td>
                            <td className="py-5 text-center">---</td>
                            <td className="py-5 text-right text-sm font-black text-emerald-600">
                                {(() => {
                                   let kpiBonus = 0;
                                   const kpiScore = selectedStaffForAction.details?.kpiScore || 0;
                                   const kpiPool = selectedStaffForAction.details?.kpiPool || 0;
                                   const manualKpi = selectedStaffForAction.details?.manualKpi || 0;

                                   if (manualKpi > 0) kpiBonus = manualKpi;
                                   else {
                                      if (kpiScore >= 95) kpiBonus = kpiPool + 300000;
                                      else if (kpiScore >= 86) kpiBonus = kpiPool;
                                      else if (kpiScore >= 81) kpiBonus = kpiPool * 0.9;
                                      else if (kpiScore >= 75) kpiBonus = kpiPool * 0.85;
                                      else if (kpiScore >= 65) kpiBonus = kpiPool * 0.8;
                                      else kpiBonus = kpiPool * 0.6;
                                   }
                                   return `+${formatVND(kpiBonus)}`;
                                })()}
                            </td>
                          </tr>
                          {Array.isArray(selectedStaffForAction.details?.renewalClasses) && selectedStaffForAction.details.renewalClasses.length > 0 && (
                            <>
                              <tr>
                                <td colSpan={4} className="py-3">
                                  <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest border-b border-emerald-200 pb-1">
                                    Lương Doanh Thu - Lớp Tái Tục
                                  </p>
                                </td>
                              </tr>
                              {selectedStaffForAction.details.renewalClasses.map((rc: RenewalClass) => {
                                const baseRate = getBaseRate(rc.studentCount);
                                const bonusRate = getRenewalBonus(rc.droppedCount);
                                const totalRate = baseRate + bonusRate;
                                const rev = (rc.includeTuition ? rc.tuitionRevenue : 0) + (rc.includeMaterial ? rc.materialRevenue : 0);
                                const commission = Math.round(rev * totalRate);
                                const sources = [rc.includeTuition && 'Học phí', rc.includeMaterial && 'Học liệu'].filter(Boolean).join(' + ') || '—';
                                const penalty = isKpiPenalized(rc.droppedCount);
                                return (
                                  <tr key={rc.id} className={penalty ? 'bg-rose-50/30' : ''}>
                                    <td className="py-3">
                                      <p className="text-sm font-bold text-slate-800">{rc.className}</p>
                                      <p className="text-[10px] text-slate-400 font-medium italic">
                                        Sĩ số: {rc.studentCount} • Nghỉ: {rc.droppedCount} • Nguồn: {sources}
                                        {penalty && <span className="text-rose-600 font-black"> • ⚠ Trừ KPI</span>}
                                      </p>
                                    </td>
                                    <td className="py-3 text-center text-xs font-black text-slate-600">
                                      {formatVND(rev)}
                                    </td>
                                    <td className="py-3 text-center text-xs font-black text-slate-500">
                                      {(totalRate * 100).toFixed(1)}%
                                    </td>
                                    <td className="py-3 text-right text-sm font-black text-emerald-600">
                                      +{formatVND(commission)}
                                    </td>
                                  </tr>
                                );
                              })}
                              <tr>
                                <td className="py-3 text-right" colSpan={3}>
                                  <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">Tổng hoa hồng tái tục</p>
                                </td>
                                <td className="py-3 text-right text-base font-black text-emerald-700 border-t border-emerald-200">
                                  +{formatVND(calcTotalRenewalCommission(selectedStaffForAction.details.renewalClasses))}
                                </td>
                              </tr>
                              {selectedStaffForAction.details?.kpiPenalized && (
                                <tr>
                                  <td colSpan={4} className="py-2">
                                    <div className="text-[10px] font-black text-rose-600 uppercase tracking-wider bg-rose-50 border border-rose-200 px-3 py-2 rounded">
                                      ⚠ Có lớp HS nghỉ {'>'}4 → KPI hiệu suất CV bị trừ về 0
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          )}
                          {(selectedStaffForAction.details?.penalty > 0 || selectedStaffForAction.details?.otherDeduction > 0 || selectedStaffForAction.details?.socialInsurance > 0) && (
                            <tr>
                              <td className="py-5 text-rose-500">
                                <p className="text-sm font-black uppercase italic">Deduction / Penalty</p>
                                <p className="text-[10px] text-slate-400 font-medium italic">Phạt, Khấu trừ khác & BHXH</p>
                              </td>
                              <td className="py-5 text-center">---</td>
                              <td className="py-5 text-center">---</td>
                              <td className="py-5 text-right text-sm font-black text-rose-500">
                                -{formatVND((selectedStaffForAction.details?.penalty || 0) + (selectedStaffForAction.details?.otherDeduction || 0) + (selectedStaffForAction.details?.socialInsurance || 0))}
                              </td>
                            </tr>
                          )}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Payslip Footer */}
                <div className="mt-auto bg-white p-10 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Lời nhắn từ BGD</p>
                      <p className="text-xs font-bold text-slate-500 italic max-w-xs">Cảm ơn bạn đã đồng hành và đóng góp vào sự phát triển của MENGLISH trong tháng qua.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2 italic">TỔNG THỰC NHẬN (NET)</p>
                      <p className="text-4xl font-black text-primary tracking-tighter shadow-primary/5">{formatVND(selectedStaffForAction.net)}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => window.print()}
                      className="flex-1 bg-slate-900 h-14 rounded-xl text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                    >
                      <Download className="w-4 h-4" /> In phiếu lương / Xuất PDF
                    </button>
                    <button 
                      onClick={() => setIsPayslipModalOpen(false)}
                      className="w-1/4 h-14 border-2 border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all text-slate-500"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  );
};

export default AdminReportsPage;
