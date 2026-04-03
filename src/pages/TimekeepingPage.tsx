import React, { useState, useEffect, useMemo } from "react";
import { useRole } from "@/contexts/RoleContext";
import { timekeepingRecords, users, TimekeepingRecord } from "@/data/mockData";
import { 
  Clock, Fingerprint, MapPin, CheckCircle, 
  XCircle, AlertCircle, Search, Filter,
  CalendarDays, Download, User, ChevronLeft,
  ChevronRight, ArrowLeft, BarChart3, Timer,
  Calendar as CalendarIcon
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const TimekeepingPage = () => {
  const { isAdmin } = useRole();
  const [records, setRecords] = useState(timekeepingRecords);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [reportDate, setReportDate] = useState(new Date(2025, 2, 1)); // March 2025
  
  // Teacher State
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Example current teacher ID for demo (in real app, this comes from auth context)
  const currentTeacherId = "TCH001";
  
  useEffect(() => {
    // Update live clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckInOut = (type: "in" | "out") => {
    setIsCheckingIn(true);
    toast.info("Đang lấy tọa độ GPS của bạn...");
    
    // Simulate GPS fetch delay
    setTimeout(() => {
      setIsCheckingIn(false);
      const newTime = currentTime.toTimeString().slice(0, 5); // HH:mm
      toast.success(`Đã ghi nhận giờ ${type === "in" ? "vào" : "ra"}: ${newTime}`);
      
      // Update local state for demo
      const todayDate = currentTime.toISOString().split('T')[0];
      const existingRecordIndex = records.findIndex(r => r.teacherId === currentTeacherId && r.date === todayDate);
      
      if (existingRecordIndex >= 0) {
         const updatedRecords = [...records];
         if (type === "out") updatedRecords[existingRecordIndex].checkOutTime = newTime;
         if (type === "in") updatedRecords[existingRecordIndex].checkInTime = newTime;
         setRecords(updatedRecords);
      } else {
         const newRecord: TimekeepingRecord = {
           id: `TK_NEW_${Date.now()}`,
           teacherId: currentTeacherId,
           date: todayDate,
           checkInTime: type === "in" ? newTime : null,
           checkOutTime: type === "out" ? newTime : null,
           location: { lat: 21.0285, lng: 105.8048, name: "Menglish Ba Đình" },
           status: "on-time"
         };
         setRecords([newRecord, ...records]);
      }
    }, 1500);
  };

  // ---- HELPER FUNCTIONS FOR STATS ----
  const calculateDuration = (inTime: string | null, outTime: string | null) => {
    if (!inTime || !outTime) return 0;
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);
    const diff = (outH * 60 + outM) - (inH * 60 + inM);
    return Math.max(0, diff / 60); // Hours
  };

  const calculateLateMinutes = (inTime: string | null) => {
    if (!inTime) return 0;
    const [h, m] = inTime.split(':').map(Number);
    const scheduledMinutes = 8 * 60; // 08:00
    const actualMinutes = h * 60 + m;
    return Math.max(0, actualMinutes - scheduledMinutes);
  };

  const teachersList = users.filter(u => u.role === "teacher" || u.role === "admin");

  // ---- RENDER REPORT VIEW ----
  const renderMonthlyReport = (teacherId: string) => {
    const teacher = users.find(u => u.id === teacherId);
    const month = reportDate.getMonth();
    const year = reportDate.getFullYear();
    
    const monthRecords = records.filter(r => {
      const d = new Date(r.date);
      return r.teacherId === teacherId && d.getMonth() === month && d.getFullYear() === year;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalHours = monthRecords.reduce((sum, r) => sum + calculateDuration(r.checkInTime, r.checkOutTime), 0);
    const totalLateMin = monthRecords.reduce((sum, r) => sum + calculateLateMinutes(r.checkInTime), 0);
    const onTimeCount = monthRecords.filter(r => r.status === 'on-time').length;

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedTeacherId(null)}
            className="p-2 hover:bg-secondary rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Báo cáo tháng: <span className="text-primary">{teacher?.name}</span>
            </h2>
            <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Mã nhân sự: {teacherId}</p>
          </div>

          <div className="ml-auto flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-xl border">
            <button 
              onClick={() => setReportDate(new Date(year, month - 1, 1))}
              className="p-1 hover:bg-card rounded-md"
            ><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs font-black min-w-[120px] text-center">Tháng {month + 1} / {year}</span>
            <button 
              onClick={() => setReportDate(new Date(year, month + 1, 1))}
              className="p-1 hover:bg-card rounded-md"
            ><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Report Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card p-5 rounded-2xl border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase">Tổng giờ làm</p>
              <p className="text-2xl font-black">{totalHours.toFixed(1)}h</p>
            </div>
          </div>
          <div className="bg-card p-5 rounded-2xl border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase">Số phút đi muộn</p>
              <p className="text-2xl font-black text-amber-600">{totalLateMin}m</p>
            </div>
          </div>
          <div className="bg-card p-5 rounded-2xl border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase">Số buổi đúng giờ</p>
              <p className="text-2xl font-black text-success">{onTimeCount}</p>
            </div>
          </div>
        </div>

        {/* Monthly Detail Table */}
        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-secondary/10 flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Chi tiết từng ngày
            </h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:opacity-90">
              <Download className="w-3.5 h-3.5" /> Xuất Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
                  <thead className="bg-secondary/30 text-muted-foreground font-black uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-3 text-left">Ngày</th>
                  <th className="px-6 py-3 text-center">Giờ vào</th>
                  <th className="px-6 py-3 text-center">Giờ ra</th>
                  <th className="px-6 py-3 text-center">Số giờ</th>
                  <th className="px-6 py-3 text-left">Vị trí</th>
                  <th className="px-6 py-3 text-center">Trạng thái</th>
                  <th className="px-6 py-3 text-left">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {monthRecords.map(r => (
                  <tr key={r.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 font-bold">{r.date}</td>
                    <td className={`px-6 py-4 text-center font-mono font-bold ${calculateLateMinutes(r.checkInTime) > 0 ? "text-amber-600" : "text-primary"}`}>
                      {r.checkInTime || "--:--"}
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold">{r.checkOutTime || "--:--"}</td>
                    <td className="px-6 py-4 text-center font-bold">
                      {calculateDuration(r.checkInTime, r.checkOutTime).toFixed(1)}h
                    </td>
                    <td className="px-6 py-4 text-left font-bold text-[10px] text-slate-500">
                       {r.location?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase border
                          ${r.status === 'on-time' ? 'bg-success/5 text-success border-success/20' : 
                            r.status === 'late' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                            r.status === 'early-leave' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                            'bg-destructive/10 text-destructive border-destructive/20'}`}
                        >
                          {r.status === 'on-time' ? 'Đúng giờ' : 
                           r.status === 'late' ? 'Đi muộn' : 
                           r.status === 'early-leave' ? 'Về sớm' : 'Vắng/Thiếu'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-left text-xs text-muted-foreground italic">{r.note || "-"}</td>
                  </tr>
                ))}
                {monthRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                      Không có dữ liệu chấm công cho tháng này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderAdminView = () => {
    if (selectedTeacherId) return renderMonthlyReport(selectedTeacherId);

    return (
      <div className="space-y-6">
        {/* Admin KPI Cards - Realtime Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card p-5 rounded-2xl border shadow-sm">
             <p className="text-[10px] uppercase font-black text-muted-foreground mb-1">Tổng lịch dạy hôm nay</p>
             <p className="text-3xl font-black text-foreground">15</p>
          </div>
          <div className="bg-card p-5 rounded-2xl border shadow-sm">
             <p className="text-[10px] uppercase font-black text-muted-foreground mb-1">Đã Check-in</p>
             <p className="text-3xl font-black text-primary">12</p>
          </div>
          <div className="bg-secondary/20 p-5 rounded-2xl border border-amber-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
             <p className="text-[10px] uppercase font-black text-amber-800 mb-1">Đi muộn</p>
             <p className="text-3xl font-black text-amber-600">2</p>
          </div>
          <div className="bg-destructive/5 p-5 rounded-2xl border shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
             <p className="text-[10px] uppercase font-black text-destructive mb-1">Thiếu mộc / Vắng</p>
             <p className="text-3xl font-black text-destructive">1</p>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 bg-secondary/10">
            <h2 className="font-bold flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" /> Lịch sử chấm công realtime
            </h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Tìm người..." className="pl-9 pr-4 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full md:w-64" />
              </div>
              <button className="p-2 border bg-background rounded-lg hover:bg-secondary"><Filter className="w-4 h-4" /></button>
              <button className="p-2 border bg-background rounded-lg hover:bg-secondary"><Download className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/30 text-muted-foreground font-black uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-3 text-left">Giáo viên</th>
                  <th className="px-6 py-3 text-center">Ngày</th>
                  <th className="px-6 py-3 text-center">Giờ vào</th>
                  <th className="px-6 py-3 text-center">Giờ ra</th>
                  <th className="px-6 py-3 text-center">Trạng thái</th>
                  <th className="px-6 py-3 text-left">Vị trí</th>
                  <th className="px-6 py-3 text-right">Tọa độ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map(record => {
                  const teacher = users.find(u => u.id === record.teacherId);
                  return (
                    <tr key={record.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div 
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => setSelectedTeacherId(record.teacherId)}
                        >
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs uppercase">{teacher?.name.charAt(0)}</div>
                          <div>
                            <p className="font-bold group-hover:text-primary transition-colors">{teacher?.name || record.teacherId}</p>
                            <p className="text-[10px] text-muted-foreground">Bấm để xem báo cáo tháng</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-xs font-medium">{record.date}</td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-primary">{record.checkInTime || "--:--"}</td>
                      <td className="px-6 py-4 text-center font-mono font-bold">{record.checkOutTime || "--:--"}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border
                          ${record.status === 'on-time' ? 'bg-success/10 text-success border-success/20' : 
                            record.status === 'late' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                            'bg-destructive/10 text-destructive border-destructive/20'}`}
                        >
                          {record.status === 'on-time' ? 'Đúng giờ' : 
                           record.status === 'late' ? 'Đi muộn' : 'Thiếu Checkout'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left font-bold text-xs">{record.location?.name || 'Chưa rõ'}</td>
                      <td className="px-6 py-4 text-right">
                        {record.location ? (
                          <button onClick={() => toast.info(`Tọa độ: ${record.location?.lat}, ${record.location?.lng}`)} className="text-primary hover:underline group inline-flex items-center gap-1 text-[10px] font-medium">
                            <MapPin className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" /> Xem GPS
                          </button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">Không có GPS</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderTeacherView = () => {
    const todayDate = currentTime.toISOString().split('T')[0];
    const todayRecord = records.find(r => r.teacherId === currentTeacherId && r.date === todayDate);

    return (
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Clocking UI */}
        <div className="w-full md:w-1/3 xl:w-1/4 space-y-6">
           <div className="bg-card rounded-3xl border shadow-xl p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/20 to-transparent" />
              <div className="relative pt-6 pb-2">
                 <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-1">{currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                 <div className="relative inline-block">
                    <motion.div 
                      key={currentTime.getSeconds()}
                      initial={{ opacity: 0.8, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-7xl font-black font-mono tracking-tighter text-slate-800 drop-shadow-sm"
                    >
                       {currentTime.toTimeString().slice(0, 5)}
                       <span className="text-3xl opacity-30 ml-1 font-bold">{currentTime.toTimeString().slice(6, 8)}</span>
                    </motion.div>
                    {isCheckingIn && (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0.3 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 bg-primary/20 rounded-full -z-10"
                      />
                    )}
                 </div>
                 <div className="flex items-center justify-center gap-2 mt-4">
                    <div className={`w-2 h-2 rounded-full ${isCheckingIn ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                       {isCheckingIn ? "Đang xác thực GPS..." : "Vị trí: Menglish Ba Đình"}
                    </span>
                 </div>
              </div>

              <div className="mt-10 space-y-4">
                 <button 
                  onClick={() => handleCheckInOut("in")}
                  disabled={isCheckingIn || !!todayRecord?.checkInTime}
                  className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg ${
                    todayRecord?.checkInTime 
                      ? "bg-secondary text-muted-foreground shadow-none cursor-not-allowed border"
                      : "bg-primary text-white hover:bg-primary/90 hover:scale-[1.02] active:scale-95 shadow-primary/25"
                  }`}
                 >
                    <Fingerprint className="w-5 h-5" />
                    {isCheckingIn ? "ĐANG LẤY GPS..." : (todayRecord?.checkInTime ? `ĐÃ VÀO: ${todayRecord.checkInTime}` : "CHECK IN CA DẠY")}
                 </button>

                 <button 
                  onClick={() => handleCheckInOut("out")}
                  disabled={isCheckingIn || !todayRecord?.checkInTime || !!todayRecord?.checkOutTime}
                  className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg border-2 ${
                    !todayRecord?.checkInTime || todayRecord?.checkOutTime
                      ? "bg-transparent text-muted-foreground/30 border-secondary shadow-none cursor-not-allowed"
                      : "bg-white text-destructive border-destructive/20 hover:bg-destructive/5 hover:scale-[1.02] active:scale-95 shadow-destructive/10"
                  }`}
                 >
                    <XCircle className="w-5 h-5" />
                    {todayRecord?.checkOutTime ? `ĐÃ RA: ${todayRecord.checkOutTime}` : "CHECK OUT RA VỀ"}
                 </button>
              </div>
           </div>

           <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-800 leading-relaxed font-medium">Bạn phải cấp quyền truy cập vị trí (Location) trong trình duyệt để tính năng Chấm công hoạt động hợp lệ.</p>
           </div>
        </div>

        {/* Right Column: Personal Monthly Report */}
        <div className="flex-1">
           {renderMonthlyReport(currentTeacherId)}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col min-h-0 bg-background">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">{isAdmin ? "Quản lý Chấm công" : "Chấm công Điện tử"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin ? "Báo cáo giờ vào/ra và thống kê chuyên cần của giảng viên." : "Ghi nhận giờ làm việc tự động với hệ thống nhận diện vị trí GPS."}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {isAdmin ? renderAdminView() : renderTeacherView()}
          </AnimatePresence>
      </div>
    </div>
  );
};

export default TimekeepingPage;
