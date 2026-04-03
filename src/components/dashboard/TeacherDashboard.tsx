import { teacherKPIs, teacherSchedule, classes } from "@/data/mockData";
import { Calendar, BookOpen, ClipboardCheck, Bell } from "lucide-react";

const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const getWeekDays = () => {
  const today = new Date(2025, 2, 24); // Mon March 24 2025
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + 1);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

const formatDate = (d: Date) => d.toISOString().split("T")[0];

const typeColors: Record<string, string> = {
  class: "bg-primary/10 border-primary/30 text-primary",
  meeting: "bg-warning/10 border-warning/30 text-warning",
  exam: "bg-destructive/10 border-destructive/30 text-destructive",
};

const TeacherDashboard = () => {
  const weekDays = getWeekDays();
  const teacherClasses = classes.filter((c) => c.teacherId === "TCH001");

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Xin chào, Thầy Nam!</h1>
        <p className="text-sm text-muted-foreground">Đây là lịch dạy và thông tin cá nhân của bạn.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Lớp hôm nay", value: teacherKPIs.classesToday, icon: Calendar, color: "text-kpi-blue" },
          { label: "Bài cần chấm", value: teacherKPIs.homeworkToGrade, icon: ClipboardCheck, color: "text-kpi-amber" },
          { label: "Kỳ thi sắp tới", value: teacherKPIs.upcomingExams, icon: BookOpen, color: "text-kpi-rose" },
          { label: "Thông báo", value: teacherKPIs.notifications, icon: Bell, color: "text-kpi-green" },
        ].map((k) => (
          <div key={k.label} className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <k.icon className={`w-5 h-5 ${k.color}`} />
              <span className="text-2xl font-bold">{k.value}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly Calendar */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <h3 className="font-semibold">Lịch dạy tuần này</h3>
          <span className="text-xs text-muted-foreground">24/03 - 30/03/2025</span>
        </div>
        <div className="grid grid-cols-7 border-b">
          {weekDays.map((d, i) => {
            const isToday = formatDate(d) === "2025-03-24";
            return (
              <div key={i} className={`text-center py-2 text-xs border-r last:border-r-0 ${isToday ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"}`}>
                <div>{dayNames[(i + 1) % 7]}</div>
                <div className="text-lg font-semibold">{d.getDate()}</div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-7 min-h-[180px]">
          {weekDays.map((d, i) => {
            const dateStr = formatDate(d);
            const events = teacherSchedule.filter((e) => e.date === dateStr);
            return (
              <div key={i} className="border-r last:border-r-0 p-1 space-y-1">
                {events.map((evt) => (
                  <div key={evt.id} className={`p-1.5 rounded text-xs border ${typeColors[evt.type]}`}>
                    <div className="font-medium truncate">{evt.title}</div>
                    <div className="opacity-70">{evt.startTime}-{evt.endTime}</div>
                    <div className="opacity-60 truncate">{evt.room}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* My Classes */}
      <div className="bg-card rounded-lg border">
        <div className="px-5 py-3 border-b">
          <h3 className="font-semibold">Lớp đang phụ trách</h3>
        </div>
        <div className="divide-y">
          {teacherClasses.map((cls) => (
            <div key={cls.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{cls.name}</p>
                <p className="text-xs text-muted-foreground">{cls.schedule} • {cls.room}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{cls.studentCount}/{cls.maxStudents}</p>
                <p className="text-xs text-muted-foreground">học sinh</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-lg border">
        <div className="px-5 py-3 border-b">
          <h3 className="font-semibold">Thông báo nội bộ</h3>
        </div>
        <div className="divide-y">
          {[
            { text: "Họp review giáo trình IELTS ngày 25/03 lúc 14h", time: "2 giờ trước", type: "meeting" },
            { text: "Chuẩn bị đề thi cuối kỳ B1 trước 28/03", time: "1 ngày trước", type: "exam" },
            { text: "Phụ huynh STU001 yêu cầu báo cáo tiến độ", time: "2 ngày trước", type: "class" },
          ].map((n, i) => (
            <div key={i} className="px-5 py-3 flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "exam" ? "bg-destructive" : n.type === "meeting" ? "bg-warning" : "bg-primary"}`} />
              <div>
                <p className="text-sm">{n.text}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
