import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Plus, Minus, Search, Filter, 
  ArrowUpRight, ArrowDownRight, History, 
  Book, ShoppingBag, FileText, AlertCircle,
  MoreVertical, Download, Printer, Settings2, X,
  Calendar, User, Tag, Layers, Database, ChevronRight
} from "lucide-react";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n) + "đ";

interface Product {
  id: string;
  name: string;
  category: string;
  initialStock: number;
  importQty: number;
  exportQty: number;
  currentStock: number;
  alertLevel: number;
}

const mockProducts: Product[] = [
  { id: "BK001", name: "Cambridge English 1 - Student Book", category: "Sách giáo trình", initialStock: 50, importQty: 20, exportQty: 15, currentStock: 55, alertLevel: 10 },
  { id: "BK002", name: "IELTS Trainer 2nd Edition", category: "Sách tham khảo", initialStock: 30, importQty: 10, exportQty: 25, currentStock: 15, alertLevel: 5 },
  { id: "BK003", name: "Grammar in Use Intermediate", category: "Sách ngữ pháp", initialStock: 100, importQty: 50, exportQty: 80, currentStock: 70, alertLevel: 20 },
  { id: "BK004", name: "Oxford Phonics World 1", category: "Sách giáo trình", initialStock: 40, importQty: 60, exportQty: 30, currentStock: 70, alertLevel: 15 },
  { id: "BK005", name: "Tập vẽ A3 Menglish", category: "Văn phòng phẩm", initialStock: 200, importQty: 0, exportQty: 150, currentStock: 50, alertLevel: 100 },
  { id: "BK006", name: "Flashcard Alphabet Set", category: "Học cụ", initialStock: 45, importQty: 25, exportQty: 62, currentStock: 8, alertLevel: 10 },
  { id: "BK007", name: "Balo Menglish Pro", category: "Quà tặng", initialStock: 20, importQty: 30, exportQty: 10, currentStock: 40, alertLevel: 5 },
  { id: "BK008", name: "Sticker Reward Menglish", category: "Học cụ", initialStock: 1000, importQty: 500, exportQty: 800, currentStock: 700, alertLevel: 200 },
];

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [activeModal, setActiveModal] = useState<null | "product" | "import" | "export">(null);

  const filteredProducts = mockProducts.filter(p => 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterCategory === "all" || p.category === filterCategory)
  );

  const Modal = ({ isOpen, onClose, title, children, icon: Icon, colorClass }: any) => (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl relative z-10 w-full max-w-xl overflow-hidden border border-slate-100"
          >
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 tracking-tight uppercase">{title}</h3>
                  <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase italic mt-0.5">Menglish Inventory System</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 transition-all border border-transparent hover:border-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
               {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Kiểm kê xuất nhập tồn</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic flex items-center gap-2">
            <Package className="w-3 h-3 text-primary/60" /> Quản lý hàng hoá & Vật tư trung tâm
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
             onClick={() => setActiveModal("product")}
             className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
          >
            <Settings2 className="w-3.5 h-3.5" /> Quản lý sản phẩm
          </button>
          <button 
             onClick={() => setActiveModal("export")}
             className="h-10 px-4 bg-rose-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 flex items-center gap-2"
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Xuất kho
          </button>
          <button 
             onClick={() => setActiveModal("import")}
             className="h-10 px-4 bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" /> Nhập kho
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { icon: Book, label: "Tổng loại hàng", value: mockProducts.length, color: "bg-blue-50 text-blue-500" },
          { icon: ArrowDownRight, label: "Nhập kho (tháng)", value: "115", color: "bg-emerald-50 text-emerald-500" },
          { icon: ArrowUpRight, label: "Xuất kho (tháng)", value: "392", color: "bg-rose-50 text-rose-500" },
          { icon: AlertCircle, label: "Cảnh báo hết hàng", value: mockProducts.filter(p => p.currentStock <= p.alertLevel).length, color: "bg-amber-50 text-amber-500" },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-xl font-black text-slate-700 mt-0.5">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Inventory Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
        {/* Table Filters */}
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm tên sách, mã hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
            >
              <option value="all">Tất cả danh mục</option>
              <option value="Sách giáo trình">Sách giáo trình</option>
              <option value="Sách tham khảo">Sách tham khảo</option>
              <option value="Văn phòng phẩm">Văn phòng phẩm</option>
              <option value="Quà tặng">Quà tặng</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-slate-400 hover:text-primary transition-colors"><Printer className="w-5 h-5" /></button>
            <button className="p-2.5 text-slate-400 hover:text-primary transition-colors"><Download className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8fafc] border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-6 py-4">Mã hàng</th>
                <th className="px-6 py-4">Tên sản phẩm</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4 text-center">Tồn đầu</th>
                <th className="px-6 py-4 text-center text-emerald-500">Nhập</th>
                <th className="px-6 py-4 text-center text-rose-500">Xuất</th>
                <th className="px-6 py-4 text-center bg-slate-50 font-black">Tồn cuối</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((p) => {
                const isLow = p.currentStock <= p.alertLevel;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="font-black text-slate-400 text-[10px] uppercase tracking-tighter">{p.id}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-bold text-slate-700 text-xs mb-0.5">{p.name}</p>
                        {isLow && (
                          <span className="text-[7px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-1">
                            <AlertCircle className="w-2 h-2" /> Cảnh báo: Sắp hết kho
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase italic whitespace-nowrap">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center font-bold text-slate-400 text-xs">{p.initialStock}</td>
                    <td className="px-6 py-5 text-center font-black text-emerald-500 text-xs">+{p.importQty}</td>
                    <td className="px-6 py-5 text-center font-black text-rose-500 text-xs">-{p.exportQty}</td>
                    <td className="px-6 py-5 text-center bg-slate-50/50">
                      <span className={`font-black text-sm ${isLow ? 'text-rose-500 underline decoration-rose-200 underline-offset-4' : 'text-slate-700'}`}>
                        {p.currentStock}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-1.5 rounded-lg hover:bg-white text-slate-300 hover:text-primary transition-all opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Custom Pagination Style Footer */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hiển thị {filteredProducts.length} / {mockProducts.length} mặt hàng</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 disabled:opacity-50">Trước</button>
            <button className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-primary bg-white shadow-sm rounded-md border border-slate-100">1</button>
            <button className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">Sau</button>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* Product Management Modal */}
      <Modal 
        isOpen={activeModal === "product"} 
        onClose={() => setActiveModal(null)} 
        title="Quản lý sản phẩm"
        icon={Database}
        colorClass="bg-slate-600"
      >
        <div className="space-y-4">
           {mockProducts.slice(0, 4).map(p => (
             <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-primary/20 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm transition-colors border border-slate-100 font-black text-[10px] uppercase">
                      {p.id.slice(-2)}
                   </div>
                   <div>
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-tight leading-none">{p.name}</h4>
                      <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-1.5 italic">{p.category}</p>
                   </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
             </div>
           ))}
           <button className="w-full py-3.5 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2 mt-4">
              <Plus className="w-4 h-4" /> Thêm sản phẩm mới
           </button>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal 
        isOpen={activeModal === "import"} 
        onClose={() => setActiveModal(null)} 
        title="Nhập kho hàng hoá"
        icon={Plus}
        colorClass="bg-emerald-500"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chọn sản phẩm</label>
              <select className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-600 outline-none focus:border-emerald-500/50 transition-all">
                 <option>Chọn mã hàng hoặc tên sách...</option>
                 {mockProducts.map(p => <option key={p.id}>{p.name} ({p.id})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số lượng nhập</label>
                  <input type="number" placeholder="0" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-600 outline-none focus:border-emerald-500/50 transition-all" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Đơn vị</label>
                  <input type="text" placeholder="Cuốn/Bộ..." className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-600 outline-none focus:border-emerald-500/50 transition-all" />
               </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ghi chú nhập kho</label>
              <textarea placeholder="Nhập từ nhà cung cấp nào, tình trạng..." className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold text-slate-600 outline-none focus:border-emerald-500/50 transition-all resize-none" />
            </div>
          </div>
          <button className="w-full h-12 bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-[0.98]">
             Xác nhận nhập kho
          </button>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal 
        isOpen={activeModal === "export"} 
        onClose={() => setActiveModal(null)} 
        title="Xuất kho hàng hoá"
        icon={ArrowUpRight}
        colorClass="bg-rose-500"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chọn sản phẩm</label>
              <select className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-600 outline-none focus:border-rose-500/50 transition-all">
                 <option>Chọn mặt hàng cần xuất...</option>
                 {mockProducts.map(p => <option key={p.id}>{p.name} - Tồn: {p.currentStock}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số lượng xuất</label>
                  <input type="number" placeholder="0" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-600 outline-none focus:border-rose-500/50 transition-all" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Người nhận/Lớp</label>
                  <input type="text" placeholder="Tên lớp hoặc giáo viên..." className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-600 outline-none focus:border-rose-500/50 transition-all" />
               </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lý do xuất kho</label>
              <textarea placeholder="Ví dụ: Cấp giáo trình cho lớp 4CLC2 tháng 3..." className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold text-slate-600 outline-none focus:border-rose-500/50 transition-all resize-none" />
            </div>
          </div>
          <button className="w-full h-12 bg-rose-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all active:scale-[0.98]">
             Xác nhận xuất kho
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default InventoryPage;
