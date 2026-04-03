import React from "react";
import { classes, users } from "@/data/mockData";
import { 
  BookOpen, Users, Clock, ArrowRight, 
  Search, Filter, LayoutGrid, List,
  GraduationCap, Calendar, MapPin
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { motion } from "framer-motion";

const MyClassesPage = () => {
  const navigate = useNavigate();
  const { role } = useRole();
  
  // In a real app we'd get the current user ID from auth. 
  // For demo, we'll assume the "Teacher" role corresponds to a specific teacher ID (e.g., "USR002")
  const myClasses = classes.filter(c => c.id === "CLS001" || c.id === "CLS002"); 

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50/30 min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm border border-primary/20">
               <BookOpen className="w-6 h-6" />
            </div>
            Lớp học của tôi
          </h1>
          <p className="text-muted-foreground font-bold mt-2 ml-15">Danh sách các lớp học bạn đang trực tiếp giảng dạy và quản lý.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Thông tin lớp học</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Lịch học & Phòng</th>
                <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Sĩ số</th>
                <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {myClasses.map((cls) => (
                <tr 
                  key={cls.id} 
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/classes/${cls.id}`)}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0">
                        {cls.id.slice(-3)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 uppercase tracking-tight group-hover:text-primary transition-colors">{cls.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{cls.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-300" /> {cls.schedule}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5 text-slate-300" /> {cls.room}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <span className="text-sm font-black text-slate-700">{cls.studentCount} / {cls.maxStudents}</span>
                       <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(cls.studentCount / cls.maxStudents) * 100}%` }}></div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="inline-flex px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-lg border border-emerald-100 uppercase tracking-widest shadow-sm">
                      Đang diễn ra
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {myClasses.length === 0 && (
        <div className="p-20 text-center bg-card rounded-3xl border border-dashed">
           <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
           <p className="text-lg font-bold text-muted-foreground italic">Bạn hiện chưa được phân công lớp học nào.</p>
        </div>
      )}
    </div>
  );
};

export default MyClassesPage;
