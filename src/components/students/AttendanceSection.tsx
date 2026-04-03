import React, { useState } from "react";
import { 
  Search, Filter, Download, Plus, Users, 
  Check, X, ChevronLeft, ChevronRight, 
  GraduationCap, ClipboardCheck, ArrowUpRight,
  MoreVertical, Calendar, Info, AlertCircle, History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { students, classes, attendanceRecords } from "@/data/mockData";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SESSIONS = [
  { id: "S1", label: "Buổi 311", day: "T2, 23/03", time: "17:45-19:15" },
  { id: "S2", label: "Buổi 310", day: "T5, 19/03", time: "18:00-19:30" },
  { id: "S3", label: "Buổi 309", day: "T2, 16/03", time: "17:45-19:15" },
  { id: "S4", label: "Buổi 308", day: "T5, 12/03", time: "18:00-19:30" },
  { id: "S5", label: "Buổi 307", day: "T2, 09/03", time: "17:45-19:15" },
  { id: "S6", label: "Buổi 306", day: "T5, 05/03", time: "18:00-19:30" },
  { id: "S7", label: "Buổi 305", day: "T2, 02/03", time: "17:45-19:15" },
  { id: "S8", label: "Buổi 304", day: "T5, 26/02", time: "18:00-19:30" },
  { id: "S9", label: "Buổi 303", day: "T2, 23/02", time: "17:45-19:15" },
  { id: "S10", label: "Buổi 302", day: "T5, 12/02", time: "18:00-19:30" },
];

interface AttendanceSectionProps {
  onGoToMakeUp: () => void;
}

const AttendanceSection: React.FC<AttendanceSectionProps> = ({ onGoToMakeUp }) => {
  const [showOnlyAbsent, setShowOnlyAbsent] = useState(false);
  const [selectedClass, setSelectedClass] = useState("CLS001");
  const [searchQuery, setSearchQuery] = useState("");

  const currentClass = classes.find(c => c.id === selectedClass);
  const classStudents = students.filter(s => s.classIds.includes(selectedClass));

  const getAttendanceStatus = (studentId: string, sessionId: string) => {
    if (studentId === "STU001" && (sessionId === "S2" || sessionId === "S5")) return "absent";
    if (studentId === "STU004" && sessionId === "S1") return "absent";
    if (studentId === "STU009" && (sessionId === "S3" || sessionId === "S8")) return "absent";
    return "present";
  };

  const filteredStudents = classStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (showOnlyAbsent) {
      const hasAbsent = SESSIONS.some(sess => getAttendanceStatus(s.id, sess.id) === "absent");
      return matchesSearch && hasAbsent;
    }
    return matchesSearch;
  });

  const handleAddToMakeUp = (studentName: string) => {
    toast.success(`Đã thêm ${studentName} vào danh sách học bù`, {
      description: "Học sinh sẽ xuất hiện trong tab 'Danh sách học bù'.",
      action: {
        label: "Xem học bù",
        onClick: onGoToMakeUp
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm tên học viên..." 
            className="pl-10 border-none bg-secondary/30 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-secondary/30 rounded-xl">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Từ ngày" className="bg-transparent border-none text-xs font-bold outline-none w-20" />
            <span className="text-muted-foreground">→</span>
            <input type="text" placeholder="đến ngày" className="bg-transparent border-none text-xs font-bold outline-none w-20" />
          </div>

          <div className="h-8 w-[1px] bg-border mx-1" />

          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${showOnlyAbsent ? "bg-destructive border-destructive" : "border-muted-foreground/30 bg-white group-hover:border-primary"}`}>
              {showOnlyAbsent && <Check className="w-3 h-3 text-white" />}
              <input 
                type="checkbox" 
                className="hidden" 
                checked={showOnlyAbsent} 
                onChange={() => setShowOnlyAbsent(!showOnlyAbsent)} 
              />
            </div>
            <span className="text-xs font-black text-muted-foreground group-hover:text-foreground">Hiển thị học viên nghỉ</span>
          </label>
        </div>
      </div>

      <div className="bg-white border rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f1f5f9]">
                <th className="sticky left-0 z-20 bg-[#f1f5f9] p-4 text-left border-b border-r min-w-[200px]">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Học viên</span>
                    <span className="text-[9px] text-primary italic">Hiển thị tỷ lệ chuyên cần</span>
                  </div>
                </th>
                {SESSIONS.map((sess) => (
                  <th key={sess.id} className="p-4 border-b border-r min-w-[120px] text-center">
                    <div className="flex flex-col gap-1 items-center">
                      <span className="text-xs font-black text-slate-700">{sess.label} - {sess.day.split(',')[0]}</span>
                      <span className="text-[10px] font-bold text-muted-foreground">{sess.day.split(',')[1]}</span>
                      <span className="text-[9px] text-slate-400 font-medium">{sess.time}</span>
                      <button className="text-[9px] font-black text-primary hover:underline mt-1">Sửa</button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredStudents.map((student) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={student.id} 
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 p-4 border-b border-r transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-700">{student.name}</span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{student.email}</span>
                        </div>
                        <div className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full">
                          147/154
                        </div>
                      </div>
                    </td>
                    {SESSIONS.map((sess) => {
                      const status = getAttendanceStatus(student.id, sess.id);
                      return (
                        <td key={sess.id} className="p-4 border-b border-r text-center">
                          {status === "present" ? (
                            <div className="flex justify-center">
                              <Check className="w-5 h-5 text-emerald-500 stroke-[3px]" />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-5 h-5 flex items-center justify-center rounded-sm bg-destructive/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="text-[8px] font-black text-destructive/80 hover:text-destructive underline leading-none uppercase">Nghỉ</button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="rounded-xl border-none shadow-2xl p-1 bg-white">
                                  <DropdownMenuItem 
                                    onClick={() => handleAddToMakeUp(student.name)}
                                    className="text-xs font-bold gap-2 p-2 rounded-lg cursor-pointer"
                                  >
                                    <History className="w-3.5 h-3.5" /> Thêm vào học bù
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-xs font-bold gap-2 p-2 rounded-lg text-destructive cursor-pointer">
                                    <AlertCircle className="w-3.5 h-3.5" /> Xóa điểm danh
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="outline" className="rounded-xl shadow-sm border-slate-200">
            Thêm
          </Button>
          <Button variant="outline" className="rounded-xl shadow-sm border-slate-200">
            <Download className="mr-2 w-4 h-4" /> Download
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            className="rounded-xl text-xs font-bold opacity-50 cursor-not-allowed"
          >
            Trang trước
          </Button>
          <div className="px-4 py-2 bg-secondary/50 rounded-xl text-xs font-black">1</div>
          <Button 
            variant="ghost" 
            className="rounded-xl text-xs font-bold opacity-50 cursor-not-allowed"
          >
            Trang tiếp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSection;
