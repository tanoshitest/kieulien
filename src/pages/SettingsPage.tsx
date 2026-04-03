import React, { useState } from "react";
import { 
  Settings, Shield, Building, Bell, GraduationCap, 
  DollarSign, BarChart, Package, MessageSquare, 
  FileCheck, MapPin, Phone, Mail, Save, Plus, X,
  Trash2, PlusCircle, CheckCircle2, AlertTriangle, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "Thông tin chung", icon: Building },
    { id: "academic", label: "Học thuật", icon: GraduationCap },
    { id: "finance", label: "Tài chính", icon: DollarSign },
    { id: "crm", label: "CRM & Tuyển sinh", icon: MessageSquare },
    { id: "inventory", label: "Kho hàng", icon: Package },
    { id: "system", label: "Hệ thống", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Cấu hình Hệ thống</h1>
          <p className="text-sm text-slate-500 font-medium bg-slate-100/50 px-2 py-0.5 rounded-md inline-block mt-1 uppercase tracking-wider text-[10px]">Quản lý thiết lập trung tâm MENGLISH</p>
        </div>
        <button 
          onClick={() => toast.success("Đã lưu toàn bộ cấu hình!")}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg active:scale-95"
        >
          <Save className="w-4 h-4" />
          Lưu thay đổi
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar (Vertical Tabs) */}
        <div className="w-72 bg-white border-r border-slate-200 overflow-y-auto p-4 flex flex-col gap-1 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all relative ${
                activeTab === tab.id 
                  ? "bg-primary text-white shadow-xl shadow-primary/20" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-white" : "text-slate-400"}`} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute left-1 w-1 h-6 bg-white rounded-full" />
              )}
            </button>
          ))}
          <div className="mt-auto pt-4">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Phiên bản</p>
              <p className="text-xs font-bold text-slate-900">MENGLISH LMS v2.4.0</p>
              <div className="flex items-center gap-2 mt-3 text-[10px] text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full font-bold">
                <CheckCircle2 className="w-3 h-3" /> System Healthy
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl mx-auto space-y-8 pb-12"
            >
              {activeTab === "general" && <GeneralConfig />}
              {activeTab === "academic" && <AcademicConfig />}
              {activeTab === "finance" && <FinanceConfig />}
              {activeTab === "crm" && <CRMConfig />}
              {activeTab === "inventory" && <InventoryConfig />}
              {activeTab === "system" && <SystemConfig />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// --- Subsections ---

const GeneralConfig = () => (
  <div className="space-y-6">
    <SectionTitle title="Thông tin trung tâm" description="Quản lý nhận diện thương hiệu và thông tin liên lạc chính thức." />
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <InputGroup label="Tên trung tâm" placeholder="Tên hiển thị chính thức" defaultValue="MENGLISH Education" />
        <InputGroup label="Slogan / Khẩu hiệu" placeholder="Câu nói thương hiệu" defaultValue="We change - We lead" />
        <InputGroup label="Mã số thuế" placeholder="Điền MST" defaultValue="0108234567" />
      </div>
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-6 bg-white hover:bg-slate-50 transition-colors cursor-pointer group">
        <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <Building className="w-10 h-10 text-slate-400" />
        </div>
        <p className="text-sm font-bold text-slate-900">Tải lên Logo</p>
        <p className="text-xs text-slate-500">Kích thước khuyên dùng 512x512</p>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-6">
      <InputGroup icon={MapPin} label="Địa chỉ trụ sở" placeholder="Địa chỉ chính" defaultValue="15/172 Phố Ngọc Hà, quận Ba Đình, 23/209 Đội Cấn, Ba Đình, Hà Nội, Ngõ 55 Hoàng Hoa Thám, Ba Đình, Hà Nội, Hanoi, Vietnam, 100000" />
      <InputGroup icon={Phone} label="Hotline hỗ trợ" placeholder="Số điện thoại" defaultValue="+84 97 599 69 86" />
      <InputGroup icon={Mail} label="Email liên hệ" placeholder="hỗ trợ @email.com" defaultValue="hello@menglish.edu.vn" />
      <div className="space-y-1.5">
        <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Cơ sở (Branches)</label>
        <div className="flex gap-2 flex-wrap">
          {["Hà Nội - Cầu Giấy", "Hà Nội - Đống Đa", "TP.HCM - Quận 1"].map(b => (
            <span key={b} className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-100 flex items-center gap-1.5">
              {b} <X className="w-3 h-3 cursor-pointer hover:text-rose-500" />
            </span>
          ))}
          <button className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-slate-200 border border-slate-200">
            <Plus className="w-3 h-3" /> Thêm cơ sở
          </button>
        </div>
      </div>
    </div>
  </div>
);

const AcademicConfig = () => (
  <div className="space-y-6">
    <SectionTitle title="Thiết lập học thuật" description="Quy định các tiêu chuẩn giảng dạy và quy tắc quản lý học viên." />
    
    <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-6 shadow-sm">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
        <Layers className="w-4 h-4 text-blue-500" /> Danh mục Cấp độ (Levels)
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {["Kindy 1", "Kindy 2", "Kids 1", "Kids 2", "Super Stars", "IELTS Base", "IELTS 6.5+"].map(l => (
          <div key={l} className="group p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-primary/30 transition-all">
            <span className="text-sm font-bold text-slate-700">{l}</span>
            <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer" />
          </div>
        ))}
        <button className="flex items-center justify-center p-3 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400 hover:text-primary hover:border-primary transition-all gap-2 text-sm font-bold group">
          <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Thêm Level
        </button>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Quy định điểm danh</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Thời lượng cho phép đi muộn (phút)</span>
            <input type="number" defaultValue={15} className="w-20 bg-slate-100 border-none rounded-xl text-center font-bold p-2 focus:ring-2 focus:ring-primary h-10" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Tỉ lệ chuyên cần tối thiểu (%)</span>
            <input type="number" defaultValue={75} className="w-20 bg-slate-100 border-none rounded-xl text-center font-bold p-2 focus:ring-2 focus:ring-primary h-10" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Thiết lập tiết học</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Thời gian 1 tiết (phút)</span>
            <input type="number" defaultValue={90} className="w-20 bg-slate-100 border-none rounded-xl text-center font-bold p-2 focus:ring-2 focus:ring-primary h-10" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Số buổi học bù tối đa / khóa</span>
            <input type="number" defaultValue={3} className="w-20 bg-slate-100 border-none rounded-xl text-center font-bold p-2 focus:ring-2 focus:ring-primary h-10" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FinanceConfig = () => (
  <div className="space-y-6">
    <SectionTitle title="Cấu hình tài chính" description="Cài đặt ngân hàng, thuế và danh mục thu chi hệ thống." />
    
    <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-500" /> Tài khoản ngân hàng nhận học phí
        </h3>
      </div>
      <div className="p-6 space-y-4">
        {[
          { bank: "Vietcombank", name: "TRUNG TAM MENGLISH", account: "001123456789", branch: "Sở giao dịch" },
          { bank: "Techcombank", name: "MENGLISH EDUCATION", account: "19034567890123", branch: "Đông Đô" }
        ].map(acc => (
          <div key={acc.account} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-xs">BANK</div>
              <div>
                <p className="font-black text-slate-900 text-sm uppercase">{acc.bank}</p>
                <div className="flex gap-4 text-xs font-medium text-slate-500">
                  <span>STK: <b className="text-slate-900">{acc.account}</b></span>
                  <span>Chủ thẻ: <b className="text-slate-900">{acc.name}</b></span>
                </div>
              </div>
            </div>
            <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        <button className="w-full py-3 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-widest hover:text-emerald-500 hover:border-emerald-200 transition-all">
          + Thêm tài khoản ngân hàng
        </button>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white rounded-[2rem] p-6 border border-slate-200 space-y-4 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">Danh mục thu <CheckCircle2 className="w-3 h-3 text-emerald-500" /></h3>
        <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase text-slate-500">
          {["Học phí", "Phí học liệu", "Học bù", "Phí thi", "Đồng phục"].map(c => (
            <span key={c} className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
              {c} <X className="w-2.5 h-2.5 cursor-pointer hover:text-rose-500" />
            </span>
          ))}
          <button className="px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200">+ Thêm</button>
        </div>
      </div>
      <div className="bg-white rounded-[2rem] p-6 border border-slate-200 space-y-4 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">Danh mục chi <AlertTriangle className="w-3 h-3 text-rose-500" /></h3>
        <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase text-slate-500">
          {["Lương GV", "Lương NV", "Thuê mặt bằng", "Marketing", "Điện nước"].map(c => (
            <span key={c} className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
              {c} <X className="w-2.5 h-2.5 cursor-pointer hover:text-rose-500" />
            </span>
          ))}
          <button className="px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200">+ Thêm</button>
        </div>
      </div>
    </div>

    {/* Tuition Reminders Config - NEW SECTION */}
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" /> Quy trình nhắc nợ học phí tự động
        </h3>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-blue-900">Nhắc trước hạn</span>
            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border shadow-sm">
              <input type="number" defaultValue={3} className="w-8 border-none text-center font-bold text-sm outline-none" />
              <span className="text-[10px] font-bold text-slate-400">NGÀY</span>
            </div>
          </div>
          <p className="text-[11px] text-blue-700/70 leading-relaxed font-medium italic">Tự động gửi thông báo chuẩn bị đến hạn học phí cho Phụ huynh.</p>
        </div>

        <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-orange-900">Chu kỳ nhắc lại</span>
            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border shadow-sm">
              <input type="number" defaultValue={2} className="w-8 border-none text-center font-bold text-sm outline-none" />
              <span className="text-[10px] font-bold text-slate-400">NGÀY</span>
            </div>
          </div>
          <p className="text-[11px] text-orange-700/70 leading-relaxed font-medium italic">Tần suất gửi thông báo nhắc nhở sau khi đã quá hạn học phí.</p>
        </div>

        <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-rose-900">Giới hạn gia hạn</span>
            <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border shadow-sm">
              <input type="number" defaultValue={7} className="w-8 border-none text-center font-bold text-sm outline-none" />
              <span className="text-[10px] font-bold text-slate-400">NGÀY</span>
            </div>
          </div>
          <p className="text-[11px] text-rose-700/70 leading-relaxed font-medium italic">Số ngày tối đa cho phép chậm phí trước khi tạm dừng dịch vụ.</p>
        </div>
      </div>
    </div>
  </div>
);

const CRMConfig = () => (
  <div className="space-y-6">
    <SectionTitle title="CRM & Luồng tuyển sinh" description="Tùy chỉnh giai đoạn chăm sóc và nguồn dữ liệu khách hàng." />
    
    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
        <BarChart className="w-4 h-4 text-blue-500" /> Quy trình chăm sóc Lead (Pipeline)
      </h3>
      <div className="flex items-center gap-2 overflow-x-auto pb-4">
        {["Mới (Lead)", "Đang liên hệ", "Hẹn trải nghiệm", "Đã trải nghiệm", "Đóng phí"].map((s, i) => (
          <React.Fragment key={s}>
            <div className="shrink-0 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 shadow-sm hover:border-blue-200 transition-colors">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs">{i+1}</span>
              <span className="text-sm font-bold text-slate-700 whitespace-nowrap">{s}</span>
              <X className="w-3.5 h-3.5 text-slate-300 hover:text-rose-500 cursor-pointer" />
            </div>
            {i < 4 && <div className="w-6 h-0.5 bg-slate-100 shrink-0" />}
          </React.Fragment>
        ))}
        <button className="shrink-0 p-3 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-blue-500 transition-all ml-4">
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>

    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-purple-500" /> Nguồn khách hàng (Sources)
      </h3>
      <div className="flex flex-wrap gap-3">
        {["Facebook Ads", "Zalo OA", "Website", "Walk-in (Vãng lai)", "Giới thiệu (Referral)", "Hotline"].map(source => (
          <div key={source} className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100 font-bold text-slate-600 text-sm hover:bg-purple-50 hover:text-purple-700 transition-colors cursor-pointer group">
            {source}
            <Trash2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-rose-500 opacity-0 group-hover:opacity-100" />
          </div>
        ))}
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-dashed border-slate-300 rounded-xl font-bold text-slate-400 hover:text-purple-500 hover:border-purple-300 text-sm">
          <PlusCircle className="w-4 h-4" /> Thêm nguồn
        </button>
      </div>
    </div>
  </div>
);

const InventoryConfig = () => (
  <div className="space-y-6">
    <SectionTitle title="Cấu hình kho hàng" description="Thiết lập các danh mục sản phẩm và ngưỡng cảnh báo tồn kho." />
    
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <Layers className="w-4 h-4 text-orange-500" /> Danh mục sản phẩm
        </h3>
        <div className="space-y-2">
          {["Sách/Giáo trình", "Đồng phục", "Dụng cụ học tập", "Quà tặng sự kiện"].map(cat => (
            <div key={cat} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-200 transition-all group">
              <span className="text-sm font-bold text-slate-700">{cat}</span>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button className="p-1.5 text-slate-400 hover:text-blue-500"><Settings className="w-4 h-4" /></button>
                <button className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          <button className="w-full flex items-center justify-center p-3.5 bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-orange-500 hover:border-orange-200 transition-all">
            + Tạo danh mục mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500" /> Quy định cảnh báo
        </h3>
        <div className="space-y-6">
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 space-y-3">
             <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-rose-900">Mức tồn ngưỡng đỏ</span>
              <input type="number" defaultValue={10} className="w-16 bg-white border border-rose-200 rounded-lg text-center font-bold p-1 text-sm text-rose-900" />
            </div>
            <p className="text-xs text-rose-700/70 leading-relaxed font-medium">Hệ thống sẽ gửi thông báo khẩn cấp và đánh dấu đỏ sản phẩm khi số lượng dưới mức này.</p>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 space-y-3">
             <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-orange-900">Mức tồn ngưỡng vàng</span>
              <input type="number" defaultValue={25} className="w-16 bg-white border border-orange-200 rounded-lg text-center font-bold p-1 text-sm text-orange-900" />
            </div>
            <p className="text-xs text-orange-700/70 leading-relaxed font-medium">Cảnh báo "Sắp hết hàng" khi số lượng trong kho chạm ngưỡng này.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SystemConfig = () => (
  <div className="space-y-6">
    <SectionTitle title="Hệ thống & Tự động hóa" description="Bảo mật, thông báo và các thiết lập tự động hóa quy trình phần mềm." />
    
    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm grid grid-cols-2 gap-8">
      <div className="space-y-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" /> Kênh thông báo
        </h3>
        <div className="space-y-4">
          <ToggleItem label="Tự động gửi Zalo thông báo học phí" active={false} />
          <ToggleItem label="Cảnh báo sinh nhật học viên sắp tới" active={true} />
        </div>
      </div>
      <div className="space-y-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <Shield className="w-4 h-4 text-rose-500" /> Bảo mật & Sao lưu
        </h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-colors font-bold text-sm text-slate-700 group">
            <span className="flex items-center gap-2"><FileCheck className="w-4 h-4 text-slate-400 group-hover:text-primary" /> Xuất bản sao lưu (Backup)</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

// --- Small Utility Components ---

const SectionTitle = ({ title, description }: { title: string, description: string }) => (
  <div className="mb-6">
    <h2 className="text-lg font-black text-slate-900 tracking-tight">{title}</h2>
    <p className="text-sm text-slate-500 font-medium">{description}</p>
  </div>
);

const InputGroup = ({ label, placeholder, defaultValue, icon: Icon }: any) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
      <input 
        type="text" 
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${Icon ? "pl-10" : ""}`} 
      />
    </div>
  </div>
);

const ToggleItem = ({ label, active }: { label: string, active: boolean }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <span className="text-sm font-bold text-slate-700">{label}</span>
    <div className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${active ? "bg-primary" : "bg-slate-300"}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? "right-1" : "left-1"}`} />
    </div>
  </div>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default SettingsPage;
