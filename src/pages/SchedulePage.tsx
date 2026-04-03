import React, { useState } from "react";
import { useRole } from "@/contexts/RoleContext";
import { useNavigate } from "react-router-dom";
import { teacherSchedule, classes, users } from "@/data/mockData";
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  MapPin, Clock, Users, School, Info, Plus,
  Filter, Search, LayoutGrid, List, ChevronDown, Monitor,
  Loader2, CheckCircle2, X, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FULL_DAYS = [
  { label: "Thứ 2", date: "16/03", fullDate: "2026-03-16" },
  { label: "Thứ 3", date: "17/03", fullDate: "2026-03-17" },
  { label: "Thứ 4", date: "18/03", fullDate: "2026-03-18" },
  { label: "Thứ 5", date: "19/03", fullDate: "2026-03-19" },
  { label: "Thứ 6", date: "20/03", fullDate: "2026-03-20" },
  { label: "Thứ 7", date: "21/03", fullDate: "2026-03-21" },
  { label: "Chủ Nhật", date: "22/03", fullDate: "2026-03-22" },
];

const COMPACT_SLOTS = [
  { id: "M1", label: "Sáng 1", time: "08:00 - 09:30", session: "Morning" },
  { id: "M2", label: "Sáng 2", time: "10:00 - 11:30", session: "Morning" },
  { id: "A1", label: "Chiều 1", time: "14:00 - 15:30", session: "Afternoon" },
  { id: "A2", label: "Chiều 2", time: "16:00 - 17:30", session: "Afternoon" },
  { id: "E1", label: "Tối 1", time: "18:00 - 19:30", session: "Evening" },
  { id: "E2", label: "Tối 2", time: "20:00 - 21:30", session: "Evening" },
];

const SchedulePage = () => {
  const { isAdmin } = useRole();
  const navigate = useNavigate();
  const [filterTeacher, setFilterTeacher] = useState("all");
  const [filterClass, setFilterClass] = useState("all");
  
  // Generating Demo Data (80% coverage)
  const initialDemoEvents = [
    // Monday
    { id: "DEMO1", title: "Lớp 4CLC", classId: "CLS001", room: "A1", date: "2026-03-16", startTime: "08:00", endTime: "09:30", type: "class" },
    { id: "DEMO2", title: "Lớp 5STAR", classId: "CLS002", room: "B2", date: "2026-03-16", startTime: "10:00", endTime: "11:30", type: "class" },
    { id: "DEMO3", title: "Lớp 3A", classId: "CLS003", room: "C1", date: "2026-03-16", startTime: "14:00", endTime: "15:30", type: "class" },
    { id: "DEMO4", title: "Lớp 2B", classId: "CLS004", room: "Online", date: "2026-03-16", startTime: "18:00", endTime: "19:30", type: "class" },
    { id: "DEMO5", title: "Lớp 6C", classId: "CLS005", room: "A1", date: "2026-03-16", startTime: "20:00", endTime: "21:30", type: "class" },
    
    // Tuesday
    { id: "DEMO6", title: "Lớp 4CLC", classId: "CLS001", room: "A1", date: "2026-03-17", startTime: "08:00", endTime: "09:30", type: "class" },
    { id: "DEMO7", title: "Lớp 5STAR", classId: "CLS002", room: "B2", date: "2026-03-17", startTime: "10:00", endTime: "11:30", type: "class" },
    { id: "DEMO8", title: "Lớp 3A", classId: "CLS003", room: "C1", date: "2026-03-17", startTime: "14:00", endTime: "15:30", type: "class" },
    { id: "DEMO9", title: "Lớp 2B", classId: "CLS004", room: "Online", date: "2026-03-17", startTime: "16:00", endTime: "17:30", type: "class" },
    { id: "DEMO10", title: "Lớp 6C", classId: "CLS005", room: "A1", date: "2026-03-17", startTime: "18:00", endTime: "19:30", type: "class" },

    // Wednesday
    { id: "DEMO11", title: "Lớp 4CLC", classId: "CLS001", room: "A1", date: "2026-03-18", startTime: "08:00", endTime: "09:30", type: "class" },
    { id: "DEMO12", title: "Lớp 5STAR", classId: "CLS002", room: "B2", date: "2026-03-18", startTime: "10:00", endTime: "11:30", type: "class" },
    { id: "DEMO13", title: "Lớp 3A", classId: "CLS003", room: "C1", date: "2026-03-18", startTime: "16:00", endTime: "17:30", type: "class" },
    { id: "DEMO14", title: "Lớp 2B", classId: "CLS004", room: "Online", date: "2026-03-18", startTime: "18:00", endTime: "19:30", type: "class" },
    { id: "DEMO15", title: "Lớp 6C", classId: "CLS005", room: "A1", date: "2026-03-18", startTime: "20:00", endTime: "21:30", type: "class" },

    // Thursday
    { id: "DEMO16", title: "Lớp 4CLC", classId: "CLS001", room: "A1", date: "2026-03-19", startTime: "08:00", endTime: "09:30", type: "class" },
    { id: "DEMO17", title: "Lớp 5STAR", classId: "CLS002", room: "B2", date: "2026-03-19", startTime: "14:00", endTime: "15:30", type: "class" },
    { id: "DEMO18", title: "Lớp 3A", classId: "CLS003", room: "C1", date: "2026-03-19", startTime: "16:00", endTime: "17:30", type: "class" },
    { id: "DEMO19", title: "Lớp 2B", classId: "CLS004", room: "Online", date: "2026-03-19", startTime: "18:00", endTime: "19:30", type: "class" },
    { id: "DEMO20", title: "Lớp 6C", classId: "CLS005", room: "A1", date: "2026-03-19", startTime: "20:00", endTime: "21:30", type: "class" },

    // Friday
    { id: "DEMO21", title: "Lớp 4CLC", classId: "CLS001", room: "A1", date: "2026-03-20", startTime: "08:00", endTime: "09:30", type: "class" },
    { id: "DEMO22", title: "Lớp 5STAR", classId: "CLS002", room: "B2", date: "2026-03-20", startTime: "10:00", endTime: "11:30", type: "class" },
    { id: "DEMO23", title: "Lớp 3A", classId: "CLS003", room: "C1", date: "2026-03-20", startTime: "14:00", endTime: "15:30", type: "class" },
    { id: "DEMO24", title: "Lớp 2B", classId: "CLS004", room: "Online", date: "2026-03-20", startTime: "16:00", endTime: "17:30", type: "class" },
    { id: "DEMO25", title: "Lớp 6C", classId: "CLS005", room: "A1", date: "2026-03-20", startTime: "18:00", endTime: "19:30", type: "class" },

    // Saturday
    { id: "DEMO26", title: "Lớp 4CLC", classId: "CLS001", room: "A1", date: "2026-03-21", startTime: "08:00", endTime: "09:30", type: "class" },
    { id: "DEMO27", title: "Lớp 5STAR", classId: "CLS002", room: "B2", date: "2026-03-21", startTime: "10:00", endTime: "11:30", type: "class" },
    { id: "DEMO28", title: "Lớp 3A", classId: "CLS003", room: "C1", date: "2026-03-21", startTime: "14:00", endTime: "15:30", type: "class" },
    { id: "DEMO29", title: "Lớp 2B", classId: "CLS004", room: "Online", date: "2026-03-21", startTime: "18:00", endTime: "19:30", type: "class" },
    { id: "DEMO30", title: "Lớp 6C", classId: "CLS005", room: "A1", date: "2026-03-21", startTime: "20:00", endTime: "21:30", type: "class" },

    // Sunday
    { id: "DEMO31", title: "Lớp 7A", classId: "CLS001", room: "A1", date: "2026-03-22", startTime: "08:00", endTime: "09:30", type: "class" },
    { id: "DEMO32", title: "Lớp 8B", classId: "CLS002", room: "B2", date: "2026-03-22", startTime: "10:00", endTime: "11:30", type: "class" },
    { id: "DEMO33", title: "Lớp 9C", classId: "CLS003", room: "C1", date: "2026-03-22", startTime: "14:00", endTime: "15:30", type: "class" },
    { id: "DEMO34", title: "Lớp 10D", classId: "CLS004", room: "Online", date: "2026-03-22", startTime: "18:00", endTime: "19:30", type: "class" },
  ];

  const [events, setEvents] = useState(initialDemoEvents);

  // Interactive Demo State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [pendingCell, setPendingCell] = useState<{clsId: string, day: string, slotId: string} | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState("TCH001");
  const [selectedRoom, setSelectedRoom] = useState("Room A1");

  const teachers = users.filter(u => u.role === "teacher");

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingCell) return;
    
    setIsAdding(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const day = FULL_DAYS.find(d => d.label === pendingCell.day);
    const slot = COMPACT_SLOTS.find(s => s.id === pendingCell.slotId);

    const newEvent = {
      id: `EVT${100 + events.length}`,
      title: `Lớp học mới - ${pendingCell.day}`,
      classId: filterClass !== "all" ? filterClass : "CLS001",
      room: selectedRoom,
      date: day?.fullDate || "2026-03-16",
      startTime: slot?.time.split(' - ')[0] || "08:00",
      endTime: slot?.time.split(' - ')[1] || "09:30",
      type: "class" as const
    };

    setEvents(prev => [...prev, newEvent]);
    setIsAdding(false);
    setIsAddOpen(false);
    
    toast.success("Đã xếp lịch dạy mới!", {
      description: `${pendingCell.day}, ${slot?.label} tại ${selectedRoom}`,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    });
  };

  const getEventsForSlot = (fullDate: string, slotId: string) => {
    const slot = COMPACT_SLOTS.find(s => s.id === slotId);
    if (!slot) return [];

    return events.filter(s => {
      const cls = classes.find(c => c.id === s.classId);
      const isCorrectDate = s.date === fullDate;
      
      // Basic time matching logic for the slots
      const startHour = parseInt(s.startTime.split(":")[0]);
      const slotStartHour = parseInt(slot.time.split(":")[0]);
      
      const teacherMatch = filterTeacher === "all" || cls?.teacherId === filterTeacher;
      const classMatch = filterClass === "all" || s.classId === filterClass;
      
      return isCorrectDate && (startHour === slotStartHour) && teacherMatch && classMatch;
    });
  };

  return (
    <div className="p-4 bg-background h-full flex flex-col gap-4 overflow-hidden">
      {/* Centralized Filters & Navigation Bar - More Compact */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border rounded-3xl p-4 shadow-sm border-slate-200/60 flex-shrink-0">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-100 shadow-sm">
            <button className="p-1 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400 hover:text-primary"><ChevronLeft className="w-4 h-4" /></button>
            <div className="flex flex-col items-center min-w-[130px]">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Tháng 3 / 2026</span>
              <span className="text-sm font-black text-slate-800 leading-tight">Tuần 4 (16/3 - 22/3)</span>
            </div>
            <button className="p-1 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-400 hover:text-primary"><ChevronRight className="w-4 h-4" /></button>
          </div>

          <div className="h-10 w-[1px] bg-slate-100 mx-1 hidden lg:block" />

          <div className="flex items-center gap-2">
            <div className="relative group">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <select 
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
                className="pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-tight appearance-none outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all cursor-pointer min-w-[160px]"
              >
                <option value="all">Tất cả Giáo viên</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative group">
              <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <select 
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-tight appearance-none outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all cursor-pointer min-w-[160px]"
              >
                <option value="all">Tất cả Lớp học</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-2xl border-slate-200 font-black text-[10px] uppercase tracking-widest h-10 px-6 hover:bg-slate-50">Hôm nay</Button>
          <Button className="rounded-2xl font-black text-[10px] uppercase tracking-widest h-10 px-6 shadow-lg shadow-primary/20">+ Xếp lịch mới</Button>
        </div>
      </div>

      {/* Google Calendar Style Grid Optimized for Height */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden relative border-separate flex-1">
        <div className="h-full flex flex-col">
            {/* Calendar Header */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)] bg-slate-50/50 border-b border-slate-100 flex-shrink-0">
              <div className="p-3 border-r border-slate-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-300" />
              </div>
              {FULL_DAYS.map((day) => (
                <div key={day.label} className="p-3 border-r border-slate-100 last:border-r-0 text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{day.label}</span>
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${day.date.startsWith("16") ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-800"}`}>
                    {day.date.split('/')[0]}
                  </span>
                </div>
              ))}
            </div>

            {/* Calendar Body - Using Flex-1 to fill space evenly */}
            <div className="flex-1 overflow-auto">
              <div className="min-w-[1000px] h-full flex flex-col">
              {COMPACT_SLOTS.map((slot) => (
                <div key={slot.id} className="grid grid-cols-[80px_repeat(7,1fr)] group border-b border-slate-50/80 last:border-b-0 flex-1 min-h-[85px]">
                  {/* Slot Label */}
                  <div className={`p-2 border-r border-slate-100 text-center flex flex-col justify-center items-center gap-0.5 ${slot.session === 'Morning' ? 'bg-amber-50/20' : slot.session === 'Afternoon' ? 'bg-blue-50/20' : 'bg-indigo-50/20'}`}>
                    <span className="text-[11px] font-black text-slate-800">{slot.label}</span>
                    <span className="text-[9px] font-bold text-slate-400 tracking-tighter whitespace-nowrap">{slot.time}</span>
                  </div>

                  {/* Day Slots */}
                  {FULL_DAYS.map((day) => {
                    const slotEvents = getEventsForSlot(day.fullDate, slot.id);
                    
                    return (
                      <div 
                        key={day.label} 
                        className="p-1 border-r border-slate-100/50 last:border-r-0 relative group/slot transition-colors hover:bg-slate-50/30 overflow-hidden"
                      >
                        {slotEvents.length > 0 ? (
                          <div className="flex flex-col gap-1 h-full h-full overflow-hidden">
                            {slotEvents.map((event) => {
                              const cls = classes.find(c => c.id === event.classId);
                              const teacher = users.find(u => u.id === cls?.teacherId);
                              
                              return (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.98 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  key={event.id}
                                  onClick={() => navigate(`/classes/${event.classId}`)}
                                  className={`p-2 rounded-2xl border shadow-sm cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between h-full min-h-0 ${
                                    slot.session === 'Morning' ? "bg-amber-50 border-amber-100 text-amber-800" :
                                    slot.session === 'Afternoon' ? "bg-blue-50 border-blue-100 text-blue-800" :
                                    "bg-indigo-50 border-indigo-100 text-indigo-800"
                                  }`}
                                >
                                  <div>
                                    <p className="text-[11px] font-black leading-tight uppercase group-hover/slot:text-primary transition-colors truncate">{cls?.name}</p>
                                  </div>
                                  <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-1">
                                      <Users className="w-3 h-3 opacity-60" />
                                      <span className="text-[9px] font-black opacity-80">{teacher?.name.split(" ").pop()}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-60 ring-white/50">
                                      <MapPin className="w-2.5 h-2.5" />
                                      <span className="text-[9px] font-bold uppercase tracking-tighter">{event.room.replace("Room ", "")}</span>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        ) : (
                          isAdmin && (
                            <button 
                              onClick={() => {
                                setPendingCell({ clsId: filterClass !== "all" ? filterClass : "CLS001", day: day.label, slotId: slot.id });
                                setIsAddOpen(true);
                              }}
                              className="w-full h-full rounded-xl flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-all hover:bg-slate-100/30"
                            >
                               <Plus className="w-4 h-4 text-primary" />
                            </button>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              </div>
            </div>
        </div>
      </div>

      {/* Add Schedule Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Xếp lịch dạy mới</DialogTitle>
            <p className="text-sm text-muted-foreground italic tracking-tight">Cấu hình thời gian và phòng học cho tiết học.</p>
          </DialogHeader>
          
          {pendingCell && (
            <div className="bg-secondary/20 p-4 rounded-2xl border border-dashed text-sm space-y-2 mb-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Lớp học:</span>
                <span className="font-black text-primary">{classes.find(c => c.id === pendingCell.clsId)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Thời gian:</span>
                <span className="font-black">{pendingCell.day}, {COMPACT_SLOTS.find(s => s.id === pendingCell.slotId)?.label}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleCreateSchedule} className="space-y-6 pt-2">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Giảng viên đảm nhận</Label>
                <select 
                  className="w-full h-11 px-3 py-2 border rounded-xl text-sm bg-card outline-none focus:ring-2 focus:ring-primary/20"
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Phòng học</Label>
                <select 
                  className="w-full h-11 px-3 py-2 border rounded-xl text-sm bg-card outline-none focus:ring-2 focus:ring-primary/20"
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                >
                  <option value="Room A1">Phòng A1 (Ba Đình)</option>
                  <option value="Room B2">Phòng B2 (Quận 1)</option>
                  <option value="Room C1">Phòng C1 (Online)</option>
                  <option value="Phòng họp 1">Phòng họp 1</option>
                </select>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isAdding}
                className="w-full h-12 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu lịch...
                  </>
                ) : "Xác nhận xếp lịch"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchedulePage;
