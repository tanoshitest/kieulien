import React, { useState } from "react";
import { useRole } from "@/contexts/RoleContext";
import { 
  financeRecords, 
  transactions as mockTransactions, 
  FinanceRecord, 
  Transaction,
  branches,
  classes
} from "@/data/mockData";
import { 
  DollarSign, Wallet, Search, Filter, CreditCard, 
  Calendar, AlertCircle, CheckCircle2, Clock, 
  TrendingUp, TrendingDown, Plus, Download, 
  ArrowUpRight, ArrowDownRight, FileText, X,
  ChevronRight, School, Laptop
} from "lucide-react";
import { toast } from "sonner";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n) + "đ";

const FinancialManagementPage = () => {
  const { isAdmin } = useRole();
  
  // States for Tuition
  const [tuitionSearch, setTuitionSearch] = useState("");
  const [tuitionStatusFilter, setTuitionStatusFilter] = useState<"all" | FinanceRecord["status"]>("all");
  const [tuitionBranchFilter, setTuitionBranchFilter] = useState<string>("all");
  const [tuitionClassFilter, setTuitionClassFilter] = useState<string>("all");
  
  if (!isAdmin) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-destructive">Không có quyền truy cập</h2>
        <p className="text-muted-foreground mt-2">Tính năng Tài chính chỉ dành cho Quản trị viên.</p>
      </div>
    );
  }

  // ---- TUITION LOGIC ----
  const tuitionRecords = financeRecords.filter(
    (r) => r.type === "income" && r.category === "Học phí"
  );
  
  const filteredTuition = tuitionRecords.filter((r) => {
    const matchSearch = r.description.toLowerCase().includes(tuitionSearch.toLowerCase());
    const matchStatus = tuitionStatusFilter === "all" || r.status === tuitionStatusFilter;
    const matchBranch = tuitionBranchFilter === "all" || r.branchId === tuitionBranchFilter;
    const matchClass = tuitionClassFilter === "all" || r.classId === tuitionClassFilter;
    return matchSearch && matchStatus && matchBranch && matchClass;
  });
  
  const totalTuitionCollected = filteredTuition.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0);
  const totalTuitionPending = filteredTuition.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount, 0);
  const totalTuitionOverdue = filteredTuition.filter((r) => r.status === "overdue").reduce((s, r) => s + r.amount, 0);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background overflow-hidden font-sans">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white/50">
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Tuition Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <div>
                <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
                   <div className="p-2 bg-primary/10 rounded-xl">
                      <DollarSign className="w-6 h-6 text-primary" />
                   </div>
                   Báo cáo Học phí
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Hệ thống báo cáo và theo dõi tình trạng đóng học phí tự động.</p>
              </div>
              <button 
                onClick={() => toast.info("Tính năng xuất Excel đang được xử lý")}
                className="px-5 py-2.5 bg-secondary text-foreground rounded-xl font-bold text-xs hover:bg-secondary/80 transition-all flex items-center gap-2 border shadow-sm"
              >
                <Download className="w-4 h-4" /> Xuất báo cáo (Excel)
              </button>
            </div>

            {/* Tuition KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                   <CheckCircle2 className="w-16 h-16 text-success" />
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Đã thu học phí</p>
                <p className="text-3xl font-black text-success tracking-tighter">{formatVND(totalTuitionCollected)}</p>
                <div className="mt-4 flex items-center gap-2">
                   <div className="h-1.5 flex-1 bg-success/10 rounded-full overflow-hidden">
                      <div className="h-full bg-success w-[75%]" />
                   </div>
                   <span className="text-[10px] font-black text-success">75%</span>
                </div>
              </div>
              
              <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                   <Clock className="w-16 h-16 text-amber-600" />
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Đang chờ xử lý</p>
                <p className="text-3xl font-black text-amber-600 tracking-tighter">{formatVND(totalTuitionPending)}</p>
                <p className="text-[10px] font-bold text-amber-500/80 mt-4 flex items-center gap-1 italic">
                   <AlertCircle className="w-3 h-3" /> Cần nhắc phí trong tuần này
                </p>
              </div>

              <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                   <AlertCircle className="w-16 h-16 text-destructive" />
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Nợ quá hạn</p>
                <p className="text-3xl font-black text-destructive tracking-tighter">{formatVND(totalTuitionOverdue)}</p>
                <p className="text-[10px] font-bold text-destructive/80 mt-4 flex items-center gap-1 italic">
                   <X className="w-3 h-3" /> Gửi thông báo nhắc nợ tự động
                </p>
              </div>
            </div>

            {/* Tuition Filter Section */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[280px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" placeholder="Tìm kiếm tên học viên, mã hóa đơn..." 
                    value={tuitionSearch} onChange={(e) => setTuitionSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all outline-none"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <select 
                    value={tuitionBranchFilter}
                    onChange={(e) => setTuitionBranchFilter(e.target.value)}
                    className="h-11 px-4 bg-slate-50 border-slate-100 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-primary/10 outline-none min-w-[180px]"
                  >
                    <option value="all">Tất cả chi nhánh</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name.replace("MENGLISH - ", "")}</option>
                    ))}
                  </select>

                  <select 
                    value={tuitionClassFilter}
                    onChange={(e) => setTuitionClassFilter(e.target.value)}
                    className="h-11 px-4 bg-slate-50 border-slate-100 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-primary/10 outline-none min-w-[180px]"
                  >
                    <option value="all">Tất cả lớp học</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-xl ml-auto border border-slate-200">
                  {(["all", "paid", "pending", "overdue"] as const).map(s => (
                    <button 
                      key={s} onClick={() => setTuitionStatusFilter(s)}
                      className={`px-4 py-1.5 text-[10px] font-black uppercase transition-all rounded-lg ${
                        tuitionStatusFilter === s ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {s === "all" ? "Tất cả" : s === "paid" ? "Đã nộp" : s === "pending" ? "Chờ" : "Nợ"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tuition Table Section */}
            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden border-slate-100">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-5 text-left font-black">Thông tin học sinh & Nội dung</th>
                    <th className="px-6 py-5 text-left font-black">Hệ đào tạo / Lớp</th>
                    <th className="px-6 py-5 text-center font-black">Ngày lập</th>
                    <th className="px-6 py-5 text-center font-black">Trạng thái</th>
                    <th className="px-6 py-5 text-right font-black">Số tiền (VND)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTuition.map(r => {
                    const branch = branches.find(b => b.id === r.branchId);
                    const cls = classes.find(c => c.id === r.classId);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-bold text-slate-700 text-sm group-hover:text-primary transition-colors">{r.description}</p>
                            <p className="text-[10px] font-black text-slate-300 mt-1 uppercase tracking-widest">Mã HD: {r.id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase">
                              {branch?.name === "MENGLISH - Online" ? <Laptop className="w-3.5 h-3.5 text-blue-500" /> : <School className="w-3.5 h-3.5 text-primary" />}
                              {branch?.name.replace("MENGLISH - ", "")}
                            </div>
                            {cls && (
                              <div className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full w-fit border border-primary/10">
                                {cls.name}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center text-xs font-bold text-slate-500">{r.date}</td>
                        <td className="px-6 py-5 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm ${
                            r.status === "paid" ? "bg-success/5 text-success border-success/20 ring-4 ring-success/5" :
                            r.status === "pending" ? "bg-amber-50 text-amber-600 border-amber-200 ring-4 ring-amber-50" :
                            "bg-destructive/5 text-destructive border-destructive/20 ring-4 ring-destructive/5"
                          }`}>
                            {r.status === "paid" ? "Đã xác nhận" : r.status === "pending" ? "Đang chờ" : "Quá hạn"}
                          </span>
                        </td>
                        <td className={`px-6 py-5 text-right text-base font-black ${
                          r.status === "paid" ? "text-success" : "text-destructive"
                        }`}>{formatVND(r.amount)}</td>
                      </tr>
                    );
                  })}
                  {filteredTuition.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                           <AlertCircle className="w-12 h-12" />
                           <p className="text-sm font-bold italic tracking-tight">Không tìm thấy dữ liệu học phí phù hợp.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                     <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                     <p className="text-sm font-black text-slate-700">Tự động gửi thông báo học phí</p>
                     <p className="text-[11px] text-slate-500 font-medium">Hệ thống sẽ tự động thông báo qua Email/Zalo cho học viên khi đến hạn nộp phí.</p>
                  </div>
               </div>
               <button className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                  Cấu hình gửi tin
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialManagementPage;
