import React, { useState } from "react";
import { useRole } from "@/contexts/RoleContext";
import { transactions as mockTransactions, Transaction } from "@/data/mockData";
import { 
  Wallet, TrendingUp, TrendingDown, Plus, 
  Search, Filter, Download, ArrowUpRight, ArrowDownRight,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const AccountingPage = () => {
  const { isAdmin } = useRole();
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [showModal, setShowModal] = useState<"none" | "income" | "expense">("none");

  // If not admin, shouldn't really be here due to route protection, but just in case:
  if (!isAdmin) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-destructive">Không có quyền truy cập</h2>
        <p className="text-muted-foreground mt-2">Tính năng Kế toán chỉ dành cho Quản trị viên.</p>
      </div>
    );
  }

  // Calculate KPIs
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const filteredTransactions = transactions.filter(t => filterType === "all" || t.type === filterType);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const category = form.category.value;
    const amount = Number(form.amount.value);
    const description = form.description.value;
    const date = new Date().toISOString().split('T')[0];

    const newTrx: Transaction = {
      id: `TRX_NEW_${Date.now()}`,
      type: showModal as "income" | "expense",
      category: category as any,
      amount,
      date,
      description,
      createdBy: "Admin"
    };

    setTransactions([newTrx, ...transactions]);
    setShowModal("none");
    toast.success(`Đã tạo Phiếu ${newTrx.type === 'income' ? 'Thu' : 'Chi'} thành công!`);
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col min-h-0 bg-background relative">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" /> Kế toán & Thu chi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý dòng tiền, học phí, trả lương và báo cáo lợi nhuận.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowModal("income")}
            className="px-4 py-2 bg-success text-white rounded-lg font-bold text-sm hover:bg-success/90 transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Báo Thu
          </button>
          <button 
            onClick={() => setShowModal("expense")}
            className="px-4 py-2 bg-destructive text-white rounded-lg font-bold text-sm hover:bg-destructive/90 transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Báo Chi
          </button>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-card p-6 rounded-2xl border shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="flex items-center gap-2 text-success mb-2">
              <TrendingUp className="w-4 h-4" />
              <p className="text-[10px] uppercase font-black tracking-widest">Tổng Thu (Tháng này)</p>
            </div>
            <p className="text-3xl font-black break-words">{formatCurrency(totalIncome)}</p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <TrendingDown className="w-4 h-4" />
              <p className="text-[10px] uppercase font-black tracking-widest">Tổng Chi (Tháng này)</p>
            </div>
            <p className="text-3xl font-black break-words">{formatCurrency(totalExpense)}</p>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden group ${netProfit >= 0 ? 'bg-primary text-primary-foreground border-primary/20' : 'bg-destructive text-destructive-foreground border-destructive/20'}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <Wallet className="w-4 h-4" />
              <p className="text-[10px] uppercase font-black tracking-widest">Lợi Nhuận Ròng (Net Profit)</p>
            </div>
            <p className="text-3xl font-black break-words">{formatCurrency(netProfit)}</p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="flex-1 bg-card rounded-2xl border shadow-sm flex flex-col min-h-0 overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 bg-secondary/10">
          <div className="flex gap-2">
            {(["all", "income", "expense"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg border transition-colors ${
                  filterType === type 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-background text-muted-foreground hover:bg-secondary"
                }`}
              >
                {type === "all" ? "Tất cả" : type === "income" ? "Khoản Thu" : "Khoản Chi"}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Tìm giao dịch..." className="pl-9 pr-4 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full md:w-64" />
            </div>
            <button className="p-2 border bg-background rounded-lg hover:bg-secondary text-muted-foreground"><Filter className="w-4 h-4" /></button>
            <button className="p-2 border bg-background rounded-lg hover:bg-secondary text-muted-foreground"><Download className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/30 text-muted-foreground font-black uppercase text-[10px] sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="px-6 py-4">Sổ phụ / Diễn giải</th>
                <th className="px-6 py-4">Phân loại</th>
                <th className="px-6 py-4">Ngày chứng từ</th>
                <th className="px-6 py-4 text-right">Số tiền (VND)</th>
                <th className="px-6 py-4 text-center">Người lập</th>
              </tr>
            </thead>
            <tbody className="divide-y relative">
              <AnimatePresence>
                {filteredTransactions.map(trx => (
                  <motion.tr 
                    key={trx.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="hover:bg-primary/5 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          trx.type === 'income' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                        }`}>
                          {trx.type === 'income' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">{trx.description}</p>
                          <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-70 mt-0.5">{trx.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-secondary text-secondary-foreground border">
                        <FileText className="w-3 h-3" /> {trx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-muted-foreground text-xs">{trx.date}</td>
                    <td className={`px-6 py-4 text-right font-mono font-black text-base ${
                      trx.type === 'income' ? 'text-success' : 'text-destructive'
                    }`}>
                      {trx.type === 'income' ? '+' : '-'}{formatCurrency(trx.amount).replace('₫', '')}
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-bold text-muted-foreground">{trx.createdBy}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-muted-foreground italic">Không có giao dịch nào khớp với điều kiện.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Modal */}
      <AnimatePresence>
        {showModal !== "none" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden"
            >
              <div className={`p-4 border-b flex justify-between items-center ${
                showModal === 'income' ? 'bg-success/10' : 'bg-destructive/10'
              }`}>
                <h2 className={`font-black uppercase tracking-widest text-sm flex items-center gap-2 ${
                  showModal === 'income' ? 'text-success' : 'text-destructive'
                }`}>
                  {showModal === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  Lập Phiếu {showModal === 'income' ? 'Thu' : 'Chi'}
                </h2>
                <button onClick={() => setShowModal("none")} className="p-1 hover:bg-black/5 rounded-full"><X className="w-5 h-5 opacity-50" /></button>
              </div>
              <form onSubmit={handleCreateTransaction} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase">Danh mục</label>
                  <select name="category" required className="w-full p-2.5 bg-background border rounded-xl font-medium focus:ring-2 focus:ring-primary outline-none appearance-none">
                    {showModal === 'income' ? (
                      <>
                        <option value="Học phí">Học phí</option>
                        <option value="Khác">Khác</option>
                      </>
                    ) : (
                      <>
                        <option value="Lương">Lương giảng viên / Nhân viên</option>
                        <option value="Mặt bằng">Chi phí Mặt bằng</option>
                        <option value="Marketing">Chi phí Marketing / Ads</option>
                        <option value="Khác">Khác</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase">Số tiền (VND)</label>
                  <input type="number" name="amount" required min="1000" step="1000" placeholder="VD: 5000000" className="w-full p-2.5 bg-background border rounded-xl font-mono focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase">Diễn giải chi tiết</label>
                  <textarea name="description" required rows={3} placeholder={`Lý do ${showModal === 'income' ? 'thu' : 'chi'} tiền...`} className="w-full p-2.5 bg-background border rounded-xl font-medium focus:ring-2 focus:ring-primary outline-none resize-none" />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowModal("none")} className="px-4 py-2 font-bold text-muted-foreground hover:bg-secondary rounded-xl transition-colors">Hủy bỏ</button>
                  <button type="submit" className={`px-6 py-2 font-black text-white rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 ${
                    showModal === 'income' ? 'bg-success hover:bg-success/90' : 'bg-destructive hover:bg-destructive/90'
                  }`}>
                    Lưu Phiếu
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountingPage;
