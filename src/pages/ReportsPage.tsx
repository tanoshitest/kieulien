import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  BarChart3, TrendingUp, Users, DollarSign, 
  ArrowLeft, Download, Filter, Calendar,
  PieChart as PieIcon, LineChart as LineIcon,
  Search, FileText, ChevronRight, AlertCircle,
  MessageSquareX, Repeat, Layers, ShieldAlert,
  School, CalendarClock, ClipboardCheck, GraduationCap,
  Fingerprint, CircleDollarSign, Building2, Users2,
  Clock, BellRing, HandCoins, UserMinus, History as HistoryIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const reportMeta: Record<string, { label: string, icon: any, color: string }> = {
  "failed-sms": { label: "Tin chưa gửi được", icon: MessageSquareX, color: "text-destructive" },
  "student-charts": { label: "Biểu đồ học viên", icon: BarChart3, color: "text-primary" },
  "transfers": { label: "Báo cáo chuyển lớp", icon: Repeat, color: "text-blue-500" },
  "trials": { label: "Báo cáo học thử", icon: Layers, color: "text-amber-500" },
  "negative-tuition": { label: "Báo cáo âm học phí", icon: ShieldAlert, color: "text-rose-600" },
  "class-summary": { label: "Báo cáo tổng lớp", icon: School, color: "text-indigo-500" },
  "monthly-allocation": { label: "Phân bổ học phí tháng", icon: CalendarClock, color: "text-cyan-600" },
  "attendance-report": { label: "Báo cáo điểm danh", icon: ClipboardCheck, color: "text-emerald-500" },
  "academic-results": { label: "Kết quả học tập", icon: GraduationCap, color: "text-violet-500" },
  "timesheets": { label: "Bảng chấm công", icon: Fingerprint, color: "text-slate-600" },
  "payroll": { label: "Lương", icon: CircleDollarSign, color: "text-orange-500" },
  "room-usage": { label: "Báo cáo phòng", icon: Building2, color: "text-pink-500" },
  "class-students": { label: "Lớp, học viên", icon: Users2, color: "text-sky-500" },
  "daily-students": { label: "Học viên trong ngày", icon: Clock, color: "text-lime-600" },
  "tuition-reminder": { label: "Nhắc hạn học phí", icon: BellRing, color: "text-yellow-600" },
  "tuition-debt": { label: "Nợ học phí", icon: HandCoins, color: "text-red-500" },
  "deposit-debt": { label: "Nợ đặt cọc", icon: UserMinus, color: "text-orange-600" },
  "profit": { label: "Lợi nhuận", icon: TrendingUp, color: "text-emerald-600" },
};

const ReportsPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = React.useState<string | null>(null);
  const currentReport = type ? reportMeta[type] : null;

  // Reset selected class when switching report types
  React.useEffect(() => {
    setSelectedClass(null);
  }, [type]);

  if (!currentReport) {
    return (
      <div className="p-6 space-y-6 bg-[#f8fafc] min-h-full">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black text-foreground">Hỗ trợ Báo cáo & Phân tích</h1>
          <p className="text-sm text-muted-foreground font-medium">Trung tâm dữ liệu MENGLISH - 18 Module nghiệp vụ.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(reportMeta).map(([id, meta]) => (
            <motion.button
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={id}
              onClick={() => navigate(`/reports/${id}`)}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all text-left group"
            >
              <div className={`p-3 rounded-2xl bg-secondary/30 w-fit mb-4 group-hover:bg-primary/10 transition-colors`}>
                <meta.icon className={`w-6 h-6 ${meta.color}`} />
              </div>
              <h3 className="font-black text-sm text-slate-700 mb-1 group-hover:text-primary transition-colors">{meta.label}</h3>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest italic">Nhấn để xem chi tiết</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  const Icon = currentReport.icon;

  const renderClassDetail = () => {
    if (!selectedClass) return null;

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedClass(null)}
            className="rounded-xl hover:bg-white border-none shadow-none text-slate-500 font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
          </Button>
          <div className="flex gap-2">
             <Button variant="outline" className="rounded-xl border-slate-200 shadow-sm">
               <Download className="w-4 h-4 mr-2" /> Xuất Excel
             </Button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm overflow-hidden">
           <div className="mb-8 p-1 flex justify-between items-end">
              <div>
                <h3 className="font-black text-2xl mb-1 italic text-slate-800">{selectedClass}</h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                   Bảng điểm chi tiết - Kỳ thi giữa khóa 03/2026
                </p>
              </div>
              <div className="text-right">
                 <p className="text-3xl font-black text-primary">8.8</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase">Điểm trung bình lớp</p>
              </div>
           </div>
           
           <div className="overflow-x-auto -mx-8">
              <table className="w-full border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="text-left py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-100">Học viên</th>
                       <th className="text-center py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-100">Nghe</th>
                       <th className="text-center py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-100">Nói</th>
                       <th className="text-center py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-100">Đọc</th>
                       <th className="text-center py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-100">Viết</th>
                       <th className="text-center py-4 px-4 text-[10px] font-black text-primary uppercase tracking-widest border-y border-slate-100 bg-primary/5">Trung bình</th>
                       <th className="text-right py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-slate-100">Xếp loại</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {[
                      { name: "Nguyễn Minh Anh", s: [8.5, 9.0, 8.0, 8.5], status: "Xuất sắc" },
                      { name: "Lê Hoàng Nam", s: [7.5, 8.0, 7.5, 7.0], status: "Giỏi" },
                      { name: "Trần Thu Hà", s: [9.0, 8.5, 9.5, 9.0], status: "Xuất sắc" },
                      { name: "Phạm Đức Anh", s: [6.5, 7.0, 6.0, 6.5], status: "Khá" },
                      { name: "Đỗ Thùy Linh", s: [8.0, 8.0, 8.5, 8.0], status: "Giỏi" },
                      { name: "Vũ Hải Đăng", s: [8.5, 8.0, 8.0, 8.0], status: "Giỏi" },
                      { name: "Hoàng Gia Bảo", s: [7.0, 7.5, 7.0, 7.5], status: "Khá" },
                      { name: "Chu Tuấn Anh", s: [9.5, 9.5, 9.0, 9.0], status: "Xuất sắc" },
                    ].map((stu, idx) => {
                      const avg = (stu.s.reduce((a, b) => (a as any) + (b as any), 0) / 4).toFixed(1);
                      return (
                        <motion.tr 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={idx} 
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                           <td className="py-4 px-8">
                              <div className="flex items-center gap-3">
                                 <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                    {stu.name.split(' ').slice(-1)[0][0]}
                                 </div>
                                 <span className="font-bold text-sm text-slate-700">{stu.name}</span>
                              </div>
                           </td>
                           {stu.s.map((score, sIdx) => (
                             <td key={sIdx} className="text-center py-4 px-4 font-bold text-slate-600">{score}</td>
                           ))}
                           <td className="text-center py-4 px-4 bg-primary/5">
                              <span className="text-primary font-black">{avg}</span>
                           </td>
                           <td className="text-right py-4 px-8">
                              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                                stu.status === "Xuất sắc" ? "bg-emerald-50 text-emerald-600" : 
                                stu.status === "Giỏi" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                              }`}>
                                 {stu.status}
                              </span>
                           </td>
                        </motion.tr>
                      );
                    })}
                 </tbody>
              </table>
           </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-secondary/50 rounded-xl">
              <Icon className={`w-5 h-5 ${currentReport.color}`} />
            </div>
            <div>
              <h1 className="text-lg font-black text-foreground">{currentReport.label}</h1>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                <span>DỮ LIỆU THÁNG 03/2026</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-emerald-500">Live Update</span>
              </div>
            </div>
          </div>
        </div>
        {!selectedClass && (
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl border-slate-200 text-xs font-bold">
              <Filter className="w-4 h-4 mr-2" /> Lọc dữ liệu
            </Button>
            <Button className="rounded-xl font-bold bg-primary shadow-lg shadow-primary/20 text-xs">
              <Download className="w-4 h-4 mr-2" /> Xuất Excel
            </Button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
            {selectedClass ? renderClassDetail() : (
              (() => {
                if (type === "student-charts") {
                  return (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                          { label: "Tổng học sinh", value: "1,248", change: "+12%", icon: Users, color: "text-blue-500" },
                          { label: "Đang học", value: "956", change: "+5%", icon: GraduationCap, color: "text-emerald-500" },
                          { label: "Bảo lưu", value: "42", change: "-2%", icon: HistoryIcon, color: "text-amber-500" },
                          { label: "Tốt nghiệp", value: "250", change: "+18%", icon: TrendingUp, color: "text-violet-500" },
                        ].map((kpi, i) => (
                          <div key={i} className="bg-white p-6 rounded-3xl border shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <div className={`p-2 rounded-xl bg-secondary/50 ${kpi.color}`}>
                                {(kpi.icon as any) && <kpi.icon className="w-5 h-5" />}
                              </div>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${kpi.change.startsWith("+") ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                                {kpi.change}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">{kpi.label}</p>
                            <p className="text-2xl font-black">{kpi.value}</p>
                          </div>
                        ))}
                      </div>
      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl border shadow-sm">
                          <h3 className="font-black text-sm mb-6 uppercase tracking-widest text-slate-500">Tăng trưởng học viên (6 tháng)</h3>
                          <div className="h-64 flex items-end justify-between gap-4 px-4">
                            {[65, 45, 78, 92, 110, 85].map((val, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${val}%` }}
                                  className="w-full bg-primary/20 group-hover:bg-primary transition-colors rounded-t-xl relative"
                                >
                                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                                    {val + 200}
                                  </div>
                                </motion.div>
                                <span className="text-[10px] font-bold text-slate-400">T{i+10 > 12 ? i-2 : i+10}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col">
                          <h3 className="font-black text-sm mb-6 uppercase tracking-widest text-slate-500">Phân bổ trình độ</h3>
                          <div className="flex-1 flex items-center justify-center relative">
                            <div className="w-48 h-48 rounded-full border-[16px] border-slate-100 relative">
                               <div className="absolute inset-0 rounded-full border-[16px] border-primary border-t-transparent border-l-transparent rotate-45" />
                               <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-2xl font-black text-primary">68%</span>
                                  <span className="text-[8px] font-black text-muted-foreground tracking-tighter uppercase">IELTS/Toeic</span>
                               </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-6">
                             <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-primary" />
                               <span className="text-[10px] font-bold text-slate-600">IELTS/Toeic (68%)</span>
                             </div>
                             <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-blue-400" />
                               <span className="text-[10px] font-bold text-slate-600">Starter/Mover (22%)</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (type === "profit") {
                  return (
                    <div className="space-y-6">
                      <div className="bg-emerald-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                         <TrendingUp className="absolute right-[-20px] top-[-20px] w-64 h-64 text-white/5 rotate-12" />
                         <div className="relative z-10">
                           <p className="text-emerald-100 text-xs font-black uppercase tracking-[0.2em] mb-2">Lợi nhuận ròng dự kiến (Tháng 3)</p>
                           <h2 className="text-5xl font-black mb-4">425.800.000 <span className="text-2xl opacity-80">đ</span></h2>
                           <div className="flex items-center gap-4">
                             <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold transition-all hover:bg-white/30 cursor-pointer">
                               So với tháng trước: +12.4%
                             </div>
                             <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold transition-all hover:bg-white/30 cursor-pointer">
                               Điểm hòa vốn: 185.000.000 đ
                             </div>
                           </div>
                         </div>
                      </div>
      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl border shadow-sm">
                          <h3 className="font-black text-sm mb-6 uppercase tracking-widest text-slate-500">Cơ cấu Doanh thu</h3>
                          <div className="space-y-4">
                            {[
                              { label: "Học phí khóa học", val: "750M", p: 75, color: "bg-primary" },
                              { label: "Bán giáo trình/VPP", val: "120M", p: 12, color: "bg-blue-400" },
                              { label: "Phí thi cử/Chứng chỉ", val: "85M", p: 8, color: "bg-amber-400" },
                              { label: "Khác", val: "45.8M", p: 5, color: "bg-slate-300" },
                            ].map((item, i) => (
                              <div key={i} className="space-y-1.5">
                                <div className="flex justify-between text-[11px] font-black">
                                  <span>{item.label}</span>
                                  <span className="text-slate-400">{item.val}</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.p}%` }}
                                    className={`h-full ${item.color}`} 
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border shadow-sm">
                          <h3 className="font-black text-sm mb-6 uppercase tracking-widest text-slate-500">Cơ cấu Chi phí</h3>
                          <div className="space-y-4">
                            {[
                              { label: "Lương nhân sự", val: "320M", p: 60, color: "bg-rose-500" },
                              { label: "Mặt bằng/Điện nước", val: "85M", p: 15, color: "bg-rose-400" },
                              { label: "Marketing", val: "65M", p: 12, color: "bg-rose-300" },
                              { label: "Khác", val: "55.8M", p: 13, color: "bg-slate-200" },
                            ].map((item, i) => (
                              <div key={i} className="space-y-1.5">
                                <div className="flex justify-between text-[11px] font-black">
                                  <span>{item.label}</span>
                                  <span className="text-slate-400">{item.val}</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.p}%` }}
                                    className={`h-full ${item.color}`} 
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (type === "failed-sms" || type === "tuition-reminder") {
                  return (
                    <div className="space-y-4">
                      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-[#f8fafc]">
                            <tr>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Đối tượng</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Nội dung</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
                              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Hành động</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {[1, 2, 3, 4, 5].map((item) => (
                              <tr key={item} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-black text-xs">
                                      HV
                                    </div>
                                    <div>
                                      <p className="text-sm font-black">Nguyễn Văn {item}</p>
                                      <p className="text-[10px] text-muted-foreground font-bold">0908 123 {item}45</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-xs font-medium text-slate-600 truncate max-w-[200px]">
                                    {type === "failed-sms" ? "Thông báo lịch học bù ngày 28/03..." : "Thông báo nhắc hạn đóng học phí khóa K24..."}
                                  </p>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${type === "failed-sms" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"}`}>
                                    {type === "failed-sms" ? "LỖI GỬI" : "CHƯA GỬI"}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <Button size="sm" className="rounded-xl font-bold bg-primary px-4 h-8 text-[10px]">
                                    {type === "failed-sms" ? "GỬI LẠI" : "GỬI NGAY"}
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }

                if (type === "transfers" || type === "trials" || type === "room-usage" || type === "class-summary") {
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={item} 
                          className="bg-white p-6 rounded-[2rem] border shadow-sm hover:shadow-md transition-all group cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-secondary/30 group-hover:bg-primary/10 transition-colors">
                              <Icon className={`w-5 h-5 ${currentReport.color}`} />
                            </div>
                            <span className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded-lg text-slate-500">
                              {(() => {
                                 const classes = ["IELTS-01", "TOEIC-A", "KIDS-PLUS", "GIAO-TIEP-G1", "PRE-IELTS-P2", "STARTER-S1"];
                                 return type === "room-usage" ? `PHÒNG ${100+item}` : `LỚP ${classes[(item-1) % classes.length]}`;
                              })()}
                            </span>
                          </div>
                          <h3 className="font-black text-sm mb-2">
                             {type === "room-usage" 
                               ? "Phòng học đa năng" 
                               : type === "trials" 
                                 ? `Học thử ${["IELTS Basic", "TOEIC Starter", "Kids Adventure"][(item-1) % 3]}` 
                                 : `Báo cáo ${currentReport.label}`}
                          </h3>
                          <div className="space-y-3">
                             <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-muted-foreground uppercase">Tình trạng</span>
                                <span className="text-emerald-500 uppercase">Hoạt động</span>
                             </div>
                             <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[75%]" />
                             </div>
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground font-bold italic">
                                   {type === "room-usage" ? "Sử dụng: 6h/ngày" : "Cập nhật: 2 giờ trước"}
                                </span>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                             </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  );
                }

                if (type === "attendance-report" || type === "academic-results" || type === "class-students" || type === "daily-students") {
                  return (
                    <div className="space-y-6">
                       <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
                          <div className="flex items-center justify-between mb-8">
                            <div>
                              <h3 className="font-black text-lg mb-1 italic">Chi tiết {currentReport.label}</h3>
                              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Dữ liệu phân tích thời gian thực</p>
                            </div>
                            <div className="flex gap-2">
                               <div className="px-4 py-2 bg-secondary/50 rounded-xl text-xs font-black">Tuần này</div>
                               <div className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black">Tháng này</div>
                            </div>
                          </div>
                          <div className="space-y-4">
                              {[1, 2, 3, 4, 5, 6].map((i) => {
                                 const className = (() => {
                                   const classes = [
                                     "Lớp IELTS-01 (Sáng T2-T4-T6)",
                                     "Lớp TOEIC-A (Tối T3-T5)",
                                     "Lớp Kids-Plus (Chiều T7-CN)",
                                     "Lớp Giao tiếp G1 (Tối T2-T6)",
                                     "Lớp Pre-IELTS P2 (Chiều T3-T5)",
                                     "Lớp Starter S1 (Sáng T7-CN)"
                                   ];
                                   return classes[(i-1) % classes.length];
                                 })();

                                 return (
                                   <motion.div 
                                     whileHover={{ x: 4 }}
                                     key={i} 
                                     onClick={() => setSelectedClass(className)}
                                     className="flex items-center gap-6 p-4 hover:bg-slate-50 rounded-2xl transition-all border-b border-dashed last:border-0 cursor-pointer group"
                                    >
                                      <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                                         {i}
                                      </div>
                                      <div className="flex-1">
                                         <p className="font-black text-sm mb-1 group-hover:text-primary transition-colors">
                                           {className}
                                         </p>
                                         <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                               {[...Array(3)].map((_, j) => <div key={j} className="w-5 h-5 rounded-full border-2 border-white bg-slate-200" />)}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-bold">+ {12+i} HV khác</span>
                                         </div>
                                      </div>
                                      <div className="text-right">
                                         <p className="text-sm font-black text-primary">
                                            {type === "attendance-report" ? `${95 + i}%` : `${8.5 + (i * 0.1)} / 10`}
                                         </p>
                                         <p className="text-[10px] text-muted-foreground font-black uppercase">
                                           {type === "attendance-report" ? "Tỉ lệ chuyên cần" : "Điểm trung bình"}
                                         </p>
                                      </div>
                                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors ml-2" />
                                   </motion.div>
                                 );
                              })}
                          </div>
                       </div>
                    </div>
                  );
                }

                if (type === "negative-tuition" || type === "monthly-allocation" || type === "tuition-debt" || type === "deposit-debt") {
                  return (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                            <h3 className="font-black text-sm uppercase tracking-[0.2em] text-slate-400">Thống kê chung</h3>
                            <div className="space-y-4">
                               {[
                                 { label: "Tổng số ca", val: "128", p: 100, color: "bg-slate-100" },
                                 { label: "Đã xử lý", val: "84", p: 65, color: "bg-emerald-500" },
                                 { label: "Đang chờ", val: "44", p: 35, color: "bg-amber-500" },
                               ].map((stat, idx) => (
                                 <div key={idx} className="space-y-2">
                                    <div className="flex justify-between text-xs font-black">
                                       <span>{stat.label}</span>
                                       <span>{stat.val}</span>
                                    </div>
                                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                       <motion.div initial={{ width: 0 }} animate={{ width: `${stat.p}%` }} className={`h-full ${stat.color}`} />
                                     </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                         <div className="bg-rose-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-rose-500/20 relative overflow-hidden">
                            <DollarSign className="absolute right-[-20px] top-[-20px] w-48 h-48 opacity-10 rotate-12" />
                            <p className="text-rose-100 text-[10px] font-black uppercase tracking-widest mb-2">Tổng giá trị tồn đọng</p>
                            <h2 className="text-4xl font-black mb-6">1.425.000.000 <span className="text-sm opacity-60">VNĐ</span></h2>
                            <Button className="w-full bg-white text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-2xl font-black transition-all">
                               XUẤT BÁO CÁO NHẮC NỢ
                            </Button>
                         </div>
                      </div>
                      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                         <div className="p-6 border-b bg-slate-50/50 flex items-center justify-between">
                            <h3 className="font-black text-sm uppercase italic">Danh sách chi tiết nợ</h3>
                            <Search className="w-4 h-4 text-slate-400" />
                         </div>
                         <div className="divide-y">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="p-6 flex items-center gap-6 hover:bg-slate-50 transition-colors">
                                 <div className="w-12 h-12 rounded-full border-2 border-rose-100 flex items-center justify-center font-black text-rose-500">
                                    $
                                 </div>
                                 <div className="flex-1">
                                    <p className="font-black text-sm">Học viên: Trần Thị Bích {i}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground">Mã nợ: #INV-2026-00{i}</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-sm font-black text-rose-500">- 4.500.000 đ</p>
                                    <p className="text-[10px] font-bold text-muted-foreground">Quá hạn 1{i} ngày</p>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                  );
                }

                if (type === "timesheets" || type === "payroll") {
                  return (
                    <div className="space-y-6">
                      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                         <table className="w-full text-left border-collapse">
                           <thead className="bg-[#f8fafc]">
                             <tr>
                               <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Nhân viên</th>
                               <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{type === "payroll" ? "Lương cơ bản" : "Số giờ làm"}</th>
                               <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{type === "payroll" ? "Thưởng/Phụ cấp" : "Đi muộn"}</th>
                               <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{type === "payroll" ? "Thực nhận" : "Tình trạng"}</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y">
                             {[1, 2, 3, 4, 5, 6].map((i) => (
                               <tr key={i} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-xs">
                                          GV
                                       </div>
                                       <div>
                                          <p className="text-sm font-black text-slate-700">Lê Anh {i}</p>
                                          <p className="text-[10px] text-muted-foreground font-bold">Giáo viên Full-time</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 text-xs font-bold text-slate-600">
                                    {type === "payroll" ? "12,000,000 đ" : "176 giờ"}
                                 </td>
                                 <td className="px-6 py-4 text-xs font-bold text-emerald-500">
                                    {type === "payroll" ? "+ 1,500,000 đ" : "0 lần"}
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                       <span className="text-xs font-black text-slate-900">{type === "payroll" ? "13,500,000 đ" : "Đầy đủ"}</span>
                                       {type === "timesheets" && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                                    </div>
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                      </div>
                   </div>
                  );
                }

                return (
                  <div className="bg-white border rounded-[2.5rem] p-12 shadow-sm text-center space-y-6">
                    <div className="w-24 h-24 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      {(Icon as any) && <Icon className={`w-10 h-10 ${currentReport.color} opacity-40`} />}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-700">Dữ liệu đang được kết nối...</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Module <b>{currentReport.label}</b> đang trong quá trình đồng bộ SQL Server. Vui lòng quay lại sau ít phút hoặc liên hệ IT để được hỗ trợ.
                      </p>
                    </div>
                    <div className="flex justify-center gap-3">
                       <Button variant="outline" className="rounded-xl px-8" onClick={() => navigate("/reports")}>
                         Quay lại
                       </Button>
                       <Button className="rounded-xl px-8 bg-primary">
                         Yêu cầu đồng bộ
                       </Button>
                    </div>
                  </div>
                );
              })()
            )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
