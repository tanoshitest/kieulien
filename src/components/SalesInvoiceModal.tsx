import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, FileText, Save, Send } from "lucide-react";
import { toast } from "sonner";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n) + "đ";

// Mock customers
const mockCustomers = [
  { id: "KH001", name: "Công ty TNHH Mobile World", phone: "028-3856-3100" },
  { id: "KH002", name: "Lê Minh Hoàng", phone: "0901-234-567" },
  { id: "KH003", name: "Thế Giới Di Động Đà Nẵng", phone: "0236-382-1100" },
  { id: "KH004", name: "Nguyễn Văn An", phone: "0912-345-678" },
  { id: "KH005", name: "Trường TH Nguyễn Du", phone: "024-3825-6789" },
];

// Products with prices
const saleProducts = [
  { id: "BK001", name: "Cambridge English 1 - Student Book", price: 320000, stock: 55 },
  { id: "BK002", name: "IELTS Trainer 2nd Edition", price: 450000, stock: 15 },
  { id: "BK003", name: "Grammar in Use Intermediate", price: 280000, stock: 70 },
  { id: "BK004", name: "Oxford Phonics World 1", price: 195000, stock: 70 },
  { id: "BK005", name: "Tập vẽ A3 Menglish", price: 25000, stock: 50 },
  { id: "BK006", name: "Flashcard Alphabet Set", price: 120000, stock: 8 },
  { id: "BK007", name: "Balo Menglish Pro", price: 350000, stock: 40 },
  { id: "BK008", name: "Sticker Reward Menglish", price: 5000, stock: 700 },
];

interface InvoiceLine {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
}

interface SalesInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SalesInvoiceModal: React.FC<SalesInvoiceModalProps> = ({ isOpen, onClose }) => {
  const [customerId, setCustomerId] = useState("");
  const [saleType, setSaleType] = useState<"retail" | "wholesale">("retail");
  const [discountPercent, setDiscountPercent] = useState(5);
  const [lines, setLines] = useState<InvoiceLine[]>([
    { id: "L1", productId: "", productName: "", qty: 1, unitPrice: 0 },
  ]);

  const today = new Date();
  const invoiceNum = `HD-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 900) + 100)}`;

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      { id: `L${Date.now()}`, productId: "", productName: "", qty: 1, unitPrice: 0 },
    ]);
  };

  const removeLine = (id: string) => {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLine = (id: string, field: string, value: any) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        if (field === "productId") {
          const prod = saleProducts.find((p) => p.id === value);
          return { ...l, productId: value, productName: prod?.name || "", unitPrice: prod?.price || 0 };
        }
        return { ...l, [field]: value };
      })
    );
  };

  const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const discount = Math.round(subtotal * (discountPercent / 100));
  const afterDiscount = subtotal - discount;
  const vat = Math.round(afterDiscount * 0.1);
  const grandTotal = afterDiscount + vat;

  const selectedCustomer = mockCustomers.find((c) => c.id === customerId);

  const handleSave = (isExport: boolean) => {
    if (!customerId) { toast.error("Vui lòng chọn khách hàng!"); return; }
    if (lines.every((l) => !l.productId)) { toast.error("Vui lòng chọn ít nhất 1 sản phẩm!"); return; }
    toast.success(isExport ? "Đã xuất hóa đơn thành công!" : "Đã lưu nháp hóa đơn!");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl relative z-10 w-full max-w-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-sm">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Tạo hóa đơn bán hàng</h3>
                  <p className="text-[9px] font-bold text-slate-400 tracking-widest mt-0.5">
                    Hóa đơn {invoiceNum} — {today.toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all border border-transparent hover:border-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Customer + Sale Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">Khách hàng</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full h-11 bg-slate-50 border-2 border-indigo-100 rounded-xl px-3 text-xs font-bold text-slate-700 outline-none focus:border-indigo-400 transition-all"
                  >
                    <option value="">-- Chọn khách hàng --</option>
                    {mockCustomers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Loại bán</label>
                  <select
                    value={saleType}
                    onChange={(e) => setSaleType(e.target.value as any)}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-bold text-slate-600 outline-none focus:border-indigo-400 transition-all"
                  >
                    <option value="retail">Bán lẻ</option>
                    <option value="wholesale">Bán buôn</option>
                  </select>
                </div>
              </div>

              {/* Product Lines */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sản phẩm</label>
                  <button onClick={addLine} className="flex items-center gap-1 text-[10px] font-black text-indigo-500 hover:text-indigo-700 transition-colors uppercase tracking-wider">
                    <Plus className="w-3.5 h-3.5" /> Thêm dòng
                  </button>
                </div>

                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-0 bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 py-2.5 border-b border-slate-100">
                    <div className="col-span-5">Sản phẩm</div>
                    <div className="col-span-2 text-center">Số lượng</div>
                    <div className="col-span-2 text-right">Đơn giá</div>
                    <div className="col-span-2 text-right">Thành tiền</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Rows */}
                  {lines.map((line) => (
                    <div key={line.id} className="grid grid-cols-12 gap-0 items-center px-4 py-2.5 border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                      <div className="col-span-5 pr-2">
                        <select
                          value={line.productId}
                          onChange={(e) => updateLine(line.id, "productId", e.target.value)}
                          className="w-full h-9 bg-white border border-slate-200 rounded-lg px-2 text-[11px] font-bold text-slate-700 outline-none focus:border-indigo-400"
                        >
                          <option value="">Chọn sản phẩm...</option>
                          {saleProducts.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <input
                          type="number"
                          min={1}
                          value={line.qty}
                          onChange={(e) => updateLine(line.id, "qty", Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 h-9 text-center bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-700 outline-none focus:border-indigo-400"
                        />
                      </div>
                      <div className="col-span-2 text-right text-[11px] font-bold text-slate-500">
                        {line.unitPrice > 0 ? formatVND(line.unitPrice) : "—"}
                      </div>
                      <div className="col-span-2 text-right text-xs font-black text-slate-800">
                        {line.unitPrice > 0 ? formatVND(line.qty * line.unitPrice) : "—"}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => removeLine(line.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50"
                          disabled={lines.length <= 1}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 rounded-2xl p-5 space-y-3 border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Tạm tính</span>
                  <span className="text-sm font-black text-slate-700">{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Chiết khấu</span>
                    <select
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="h-7 px-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600 outline-none"
                    >
                      {[0, 3, 5, 7, 10, 15, 20].map((v) => (
                        <option key={v} value={v}>{v}%</option>
                      ))}
                    </select>
                  </div>
                  <span className="text-sm font-black text-rose-500">-{formatVND(discount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">VAT (10%)</span>
                  <span className="text-sm font-bold text-slate-500">{formatVND(vat)}</span>
                </div>
                <div className="pt-3 border-t-2 border-indigo-100 flex justify-between items-center">
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">Tổng cộng</span>
                  <span className="text-xl font-black text-indigo-600">{formatVND(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
              <button
                onClick={() => handleSave(false)}
                className="h-11 px-6 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Lưu nháp
              </button>
              <button
                onClick={() => handleSave(true)}
                className="h-11 px-6 bg-indigo-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Xuất hóa đơn
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SalesInvoiceModal;
