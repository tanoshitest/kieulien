import { useState } from "react";
import { useRole } from "@/contexts/RoleContext";
import { useForeignNotes } from "@/contexts/ForeignNoteContext";
import { foreignTeachers } from "@/data/mockData";
import SchedulePage from "@/pages/SchedulePage";
import ForeignTeacherSchedulePage from "@/pages/ForeignTeacherSchedulePage";
import { Calendar, CalendarClock } from "lucide-react";

type Tab = "vn" | "foreign";

export default function UnifiedSchedulePage() {
  const { isAdmin, isTA, isOps, isTeacher, isForeignTeacher } = useRole();
  const { unreadCount } = useForeignNotes();

  // Quyền xem 2 tab:
  // - Admin / TA / Ops / Teacher (VN) → thấy cả 2 tab
  // - Foreign teacher → chỉ tab GVNN
  const canSeeVn = isAdmin || isTA || isOps || isTeacher;
  const canSeeForeign = isAdmin || isTA || isOps || isTeacher || isForeignTeacher;

  const defaultTab: Tab = isForeignTeacher ? "foreign" : "vn";
  const [tab, setTab] = useState<Tab>(defaultTab);

  // Badge unread cho GVNN tab
  const foreignNoteUnread = isForeignTeacher
    ? unreadCount(foreignTeachers[0]?.id)
    : unreadCount();

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Tab bar */}
      <div className="flex-shrink-0 border-b border-border bg-card px-4 pt-3">
        <div className="flex items-center gap-1">
          {canSeeVn && (
            <button
              onClick={() => setTab("vn")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all ${
                tab === "vn"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Lịch GV Việt Nam
            </button>
          )}
          {canSeeForeign && (
            <button
              onClick={() => setTab("foreign")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all relative ${
                tab === "foreign"
                  ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <CalendarClock className="w-4 h-4" />
              Lịch GV Nước ngoài
              {foreignNoteUnread > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center animate-pulse">
                  {foreignNoteUnread}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === "vn" && canSeeVn && <SchedulePage />}
        {tab === "foreign" && canSeeForeign && <ForeignTeacherSchedulePage />}
      </div>
    </div>
  );
}
