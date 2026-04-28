import React, { useState } from "react";
import { 
  Building2, DollarSign, Percent, CalendarClock, 
  ChevronRight, Plus, Settings2, ShieldCheck, 
  Building, MapPin, Search, Filter, Download,
  ArrowUpRight, Users, GraduationCap, CheckCircle2,
  AlertCircle, Briefcase, History
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { branches, classes, users } from "@/data/mockData";
import { toast } from "sonner";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n) + "đ";

const CenterOperationPage = () => {
  const [activeSection, setActiveSection] = useState<"pricing" | "discounts" | "cycles" | "branches">("pricing");

  const sections = [
    { id: "pricing", label: "Biểu phí & Khóa học", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
    { id: "discounts", label: "Chính sách ưu đãi", icon: Percent, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "cycles", label: "Chu kỳ thanh toán", icon: CalendarClock, color: "text-amber-500", bg: "bg-amber-50" },
    { id: "branches", label: "Quản lý Chi nhánh", icon: Building2, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b px-8 py-5 flex items-center justify-between shrink-0 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Vận hành Trung tâm</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Cấu hình biểu phí, chính sách tài chính và hệ thống chi nhánh toàn diện.</p>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl border-slate-200 font-bold text-xs">
                <History className="w-4 h-4 mr-2" /> Lịch sử thay đổi
            </Button>
            <Button 
                onClick={() => toast.success("Đã lưu toàn bộ cấu hình vận hành!")}
                className="rounded-xl bg-primary shadow-lg shadow-primary/20 font-black text-xs uppercase tracking-widest px-6"
            >
                Lưu cấu hình
            </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <div className="w-72 bg-white border-r p-4 flex flex-col gap-2 shrink-0 overflow-y-auto">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id as any)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                activeSection === s.id 
                  ? "bg-slate-900 text-white shadow-xl" 
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <div className={`p-1.5 rounded-lg ${activeSection === s.id ? "bg-white/10" : s.bg}`}>
                <s.icon className={`w-4 h-4 ${activeSection === s.id ? "text-white" : s.color}`} />
              </div>
              {s.label}
              {activeSection === s.id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
            </button>
          ))}
          
          <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase text-slate-400">Trạng thái vận hành</span>
             </div>
             <p className="text-[11px] text-slate-600 leading-relaxed font-medium">Hệ thống đang áp dụng biểu phí Kỳ Xuân 2026 trên toàn bộ 5 chi nhánh.</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative scroll-smooth">
          {activeSection === "pricing" && <PricingMatrix />}
          {activeSection === "discounts" && <DiscountPolicies />}
          {activeSection === "cycles" && <PaymentCycles />}
          {activeSection === "branches" && <BranchManagement />}
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const PricingMatrix = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-6xl">
    <div className="flex items-center justify-between mb-2">
       <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Biểu phí học phí theo Chi nhánh</h2>
          <p className="text-sm text-slate-500 font-medium">Tùy chỉnh giá tiền cho từng khóa học tại các cơ sở khác nhau.</p>
       </div>
       <Button variant="outline" className="rounded-xl border-slate-200 text-xs font-bold px-4">
          <Plus className="w-4 h-4 mr-2" /> Thêm khóa học mới
       </Button>
    </div>

    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
       <table className="w-full text-left border-separate border-spacing-0">
          <thead className="bg-slate-50 border-b border-slate-100">
             <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Khóa học / Cấp độ</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Thời lượng</th>
                {branches.map(b => (
                  <th key={b.id} className="px-6 py-4 text-[10px] font-black uppercase text-slate-600 tracking-widest text-center bg-slate-100/30">
                    {b.name.replace("MENGLISH - ", "")}
                  </th>
                ))}
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
             {[
               { name: "Tiếng Anh Kindy (4-6 tuổi)", sessions: 24, prices: [2800000, 3200000, 2800000] },
               { name: "Tiếng Anh Kids (7-11 tuổi)", sessions: 36, prices: [4500000, 4800000, 4500000] },
               { name: "IELTS Intensive", sessions: 48, prices: [8500000, 9200000, 8500000] },
               { name: "Cambridge Starters", sessions: 24, prices: [3500000, 3800000, 3500000] },
             ].map((course, idx) => (
               <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                     <p className="font-bold text-slate-800 text-sm">{course.name}</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 italic">Học phí theo khóa</p>
                  </td>
                  <td className="px-6 py-5 text-center text-xs font-bold text-slate-500">{course.sessions} buổi</td>
                  {course.prices.map((p, i) => (
                    <td key={i} className="px-6 py-5 text-center">
                       <input 
                         type="text" 
                         defaultValue={formatVND(p)}
                         className="w-32 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-black text-slate-700 text-center focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                       />
                    </td>
                  ))}
               </tr>
             ))}
          </tbody>
       </table>
    </div>

    <div className="bg-amber-50 border border-amber-100 p-5 rounded-[2rem] flex gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
           <AlertCircle className="w-6 h-6 text-amber-500" />
        </div>
        <div>
           <p className="text-sm font-black text-amber-900 mb-1">Quy định áp dụng biểu phí</p>
           <p className="text-xs text-amber-700/80 leading-relaxed font-medium">Giá phí sẽ được tự động cập nhật cho các học sinh **đăng ký mới** từ thời điểm lưu cấu hình. Các học sinh đang theo học sẽ tiếp tục áp dụng biểu phí cũ cho đến khi kết thúc khóa hiện tại.</p>
        </div>
    </div>
  </motion.div>
);

const DiscountPolicies = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl">
    <div className="flex items-center justify-between">
       <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Chính sách ưu đãi & Giảm trừ</h2>
          <p className="text-sm text-slate-500 font-medium">Thiết lập các bộ quy tắc giảm giá tự động khi tạo phiếu thu.</p>
       </div>
       <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-xs">
          <Plus className="w-4 h-4 mr-2" /> Thêm chính sách
       </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {[
         { title: "Ưu đãi Anh/Chị/Em", type: "Tỉ lệ (%)", value: "5%", condition: "Cùng hộ khẩu / Phụ huynh", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
         { title: "Học bổng Tiềm năng", type: "Cố định (VNĐ)", value: "500.000đ", condition: "Dựa trên điểm Entrance Test > 8.0", icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50" },
         { title: "Ưu đãi Học sinh cũ (Renew)", type: "Tỉ lệ (%)", value: "10%", condition: "Đóng phí trước khi kết thúc khóa cũ 15 ngày", icon: History, color: "text-emerald-600", bg: "bg-emerald-50" },
         { title: "Đăng ký nhóm (3+)", type: "Cố định (VNĐ)", value: "300.000đ", condition: "Nhóm từ 3 bạn trở lên cùng đăng ký", icon: Briefcase, color: "text-amber-600", bg: "bg-amber-50" },
       ].map((policy, idx) => (
         <div key={idx} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
               <div className={`p-3 rounded-2xl ${policy.bg} ${policy.color}`}>
                  <policy.icon className="w-6 h-6" />
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Loại giảm trừ</span>
                  <span className="text-xs font-black text-slate-600 uppercase">{policy.type}</span>
               </div>
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-1">{policy.title}</h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight mb-4 italic">Điều kiện: {policy.condition}</p>
            
            <div className="flex items-center justify-between border-t border-slate-50 pt-4">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-slate-400">Mức giảm</span>
                  <span className={`text-xl font-black ${policy.color}`}>{policy.value}</span>
               </div>
               <div className="flex gap-2">
                  <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-500 transition-all"><Settings2 className="w-4 h-4" /></button>
                  <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">Tắt</button>
               </div>
            </div>
         </div>
       ))}
    </div>
  </motion.div>
);

const PaymentCycles = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl">
    <div className="flex items-center justify-between">
       <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Chu kỳ Thanh toán Linh hoạt</h2>
          <p className="text-sm text-slate-500 font-medium">Định nghĩa các phương thức đóng học phí (Hàng tháng, Theo kỳ, Toàn khóa).</p>
       </div>
    </div>

    <div className="space-y-4">
       {[
         { name: "Đóng toàn khóa (Full Course)", desc: "Học sinh đóng phí 1 lần cho toàn bộ 24-48 buổi học.", bonus: "Thường kèm ưu đãi 10-15%", active: true },
         { name: "Đóng theo Kỳ (Quarterly)", desc: "Chia khóa học thành 2-3 kỳ đóng phí (mỗi kỳ 12 buổi).", bonus: "Thanh toán linh hoạt", active: true },
         { name: "Đóng hàng tháng (Monthly)", desc: "Thu học phí cố định vào ngày 05 hàng tháng.", bonus: "Phù hợp khóa dài hạn", active: false },
       ].map((cycle, idx) => (
         <div key={idx} className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between ${
           cycle.active ? "bg-white border-slate-100 shadow-sm" : "bg-slate-50/50 border-dashed border-slate-200 opacity-60"
         }`}>
            <div className="flex items-center gap-5">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cycle.active ? "bg-amber-50 text-amber-500" : "bg-slate-200 text-slate-400"}`}>
                  <CalendarClock className="w-7 h-7" />
               </div>
               <div>
                  <h4 className="text-base font-black text-slate-800">{cycle.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{cycle.desc}</p>
                  <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-2 tracking-widest">{cycle.bonus}</span>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <button className="text-xs font-black uppercase tracking-widest text-primary hover:underline">Chỉnh sửa</button>
               <div className={`w-12 h-6 rounded-full relative cursor-pointer ${cycle.active ? "bg-primary" : "bg-slate-300"}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${cycle.active ? "right-1" : "left-1"}`} />
               </div>
            </div>
         </div>
       ))}
       <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
          + Tạo chu kỳ thanh toán mới
       </button>
    </div>
  </motion.div>
);

const BranchManagement = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-6xl">
    <div className="flex items-center justify-between">
       <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Quản lý Chi nhánh</h2>
          <p className="text-sm text-slate-500 font-medium">Thiết lập thông tin và cấu hình đặc thù cho từng cơ sở.</p>
       </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       {branches.map(b => (
         <div key={b.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:border-primary/50 transition-all">
            <div className="h-24 bg-slate-900 p-6 flex items-start justify-between relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
               <div className="z-10">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Cơ sở vận hành</p>
                  <h3 className="text-white font-black text-sm uppercase">{b.name.replace("MENGLISH - ", "")}</h3>
               </div>
               <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white z-10">
                  <MapPin className="w-5 h-5" />
               </div>
            </div>
            <div className="p-6 space-y-4">
               <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                     <span className="font-bold text-slate-400">Giám đốc cơ sở:</span>
                     <span className="font-black text-slate-700">Nguyễn Văn A</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                     <span className="font-bold text-slate-400">Tổng học sinh:</span>
                     <span className="font-black text-slate-700">142 học viên</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                     <span className="font-bold text-slate-400">Doanh thu tháng:</span>
                     <span className="font-black text-emerald-600">{formatVND(385000000)}</span>
                  </div>
               </div>
               <Button variant="outline" className="w-full rounded-2xl border-slate-100 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 group-hover:border-primary/30">
                  Quản lý chi tiết
               </Button>
            </div>
         </div>
       ))}
       <button className="h-auto min-h-[250px] bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-slate-300 hover:text-primary hover:border-primary/50 transition-all">
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
             <Plus className="w-6 h-6" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Thêm chi nhánh mới</span>
       </button>
    </div>
  </motion.div>
);

export default CenterOperationPage;
