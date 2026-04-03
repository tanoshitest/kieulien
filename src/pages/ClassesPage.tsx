import { classes, teachers } from "@/data/mockData";
import { MapPin, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ClassesPage = () => {
  const navigate = useNavigate();
  return (
  <div className="p-4 md:p-6 space-y-4">
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-bold">Lớp học</h1>
      <button className="px-3 py-2 bg-primary text-primary-foreground text-sm rounded-md font-medium hover:opacity-90 transition">
        + Tạo lớp mới
      </button>
    </div>
    <div className="bg-card rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Lớp</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Giáo viên</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Lịch học</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sĩ số</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {classes.map((cls) => {
              const teacher = teachers.find((t) => t.id === cls.teacherId);
              return (
                <tr 
                  key={cls.id} 
                  className="hover:bg-secondary/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/classes/${cls.id}`)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{cls.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{cls.room}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{teacher?.name || "—"}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{cls.schedule}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium">{cls.studentCount}/{cls.maxStudents}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs px-2 py-0.5 bg-success/10 text-success rounded-full font-medium">{cls.status}</span>
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

export default ClassesPage;
