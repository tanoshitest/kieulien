import React, { useState } from "react";
import { financeRecords, type FinanceRecord } from "@/data/mockData";
import { Search, Filter, CreditCard, Calendar, AlertCircle, CheckCircle2, Clock } from "lucide-react";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n) + "đ";

const statusBadge = (s: FinanceRecord["status"]) => {
  const map = {
    paid: "bg-success/10 text-success border-success/20",
    pending: "bg-amber-50 text-amber-600 border-amber-200",
    overdue: "bg-destructive/10 text-destructive border-destructive/20",
  };
  const labels = { paid: "Đã nộp", pending: "Chờ nộp", overdue: "Quá hạn" };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase ${map[s]}`}>
      {labels[s]}
    </span>
  );
};

const FinancePage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | FinanceRecord["status"]>("all");

  // Only show tuition (income, category = Học phí)
  const tuitionRecords = financeRecords.filter(
    (r) => r.type === "income" && r.category === "Học phí"
  );

  const filtered = tuitionRecords.filter((r) => {
    const matchSearch = r.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalCollected = tuitionRecords.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0);
  const totalPending = tuitionRecords.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount, 0);
  const totalOverdue = tuitionRecords.filter((r) => r.status === "overdue").reduce((s, r) => s + r.amount, 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Quản lý Học phí</h1>
          <p className="text-xs text-muted-foreground mt-1">Theo dõi tình trạng đóng học phí của học viên tại trung tâm</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-bold hover:opacity-90 transition shadow-md active:scale-95">
          <CreditCard className="w-4 h-4" />
          Tạo phiếu thu mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="bg-card border rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-success"
          onClick={() => setStatusFilter("paid")}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Tổng đã thu</p>
              <p className="text-2xl font-black text-success">{formatVND(totalCollected)}</p>
              <p className="text-xs text-muted-foreground mt-1">{tuitionRecords.filter(r => r.status === "paid").length} phiếu</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-success opacity-20" />
          </div>
        </div>

        <div
          className="bg-card border rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-amber-400"
          onClick={() => setStatusFilter("pending")}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Chờ nộp</p>
              <p className="text-2xl font-black text-amber-600">{formatVND(totalPending)}</p>
              <p className="text-xs text-muted-foreground mt-1">{tuitionRecords.filter(r => r.status === "pending").length} phiếu</p>
            </div>
            <Clock className="w-8 h-8 text-amber-400 opacity-20" />
          </div>
        </div>

        <div
          className="bg-card border rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-destructive"
          onClick={() => setStatusFilter("overdue")}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Quá hạn</p>
              <p className="text-2xl font-black text-destructive">{formatVND(totalOverdue)}</p>
              <p className="text-xs text-muted-foreground mt-1">{tuitionRecords.filter(r => r.status === "overdue").length} học viên cần nhắc</p>
            </div>
            <AlertCircle className="w-8 h-8 text-destructive opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo tên học viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "paid", "pending", "overdue"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-full font-bold border transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "text-muted-foreground hover:bg-secondary border-transparent"
              }`}
            >
              {s === "all" ? "Tất cả" : s === "paid" ? "Đã nộp" : s === "pending" ? "Chờ nộp" : "Quá hạn"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-secondary/10 text-[10px] font-black uppercase tracking-wider">
                <th className="text-left px-5 py-4 text-muted-foreground">Mã phiếu</th>
                <th className="text-left px-5 py-4 text-muted-foreground">Học viên / Mô tả</th>
                <th className="text-center px-5 py-4 text-muted-foreground hidden md:table-cell">Ngày lập</th>
                <th className="text-center px-5 py-4 text-muted-foreground">Trạng thái</th>
                <th className="text-right px-5 py-4 text-muted-foreground">Học phí</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-primary/5 transition-colors cursor-pointer">
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{r.id}</td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-foreground/90 leading-tight">{r.description}</p>
                  </td>
                  <td className="px-5 py-4 text-center text-xs font-mono text-muted-foreground hidden md:table-cell">
                    {r.date}
                  </td>
                  <td className="px-5 py-4 text-center">{statusBadge(r.status)}</td>
                  <td className={`px-5 py-4 text-right font-black text-base ${r.status === "paid" ? "text-success" : r.status === "overdue" ? "text-destructive" : "text-amber-600"}`}>
                    {formatVND(r.amount)}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-muted-foreground italic text-sm">
                    Không có dữ liệu học phí phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
