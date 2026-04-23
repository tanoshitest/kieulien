import React, { useState } from "react";
import { ArrowLeft, BookOpen, ChevronRight, ChevronDown, Gamepad2, ListChecks, Lock, Trophy, Layers, Split, Plus, GitMerge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Syllabus, ClassSchedule } from "@/data/mockData";
import { useSyllabusFeatures } from "@/contexts/SyllabusFeaturesContext";
import { toast } from "sonner";

const TODAY = "2026-04-22";

export type NavItem = "syllabus" | "game" | "quiz";

interface Props {
  syllabus: Syllabus;
  classSchedules: ClassSchedule[];
  selectedSessionId: string | null;
  onSessionSelect: (id: string) => void;
  activeNavItem: NavItem;
  onNavItemChange: (v: NavItem) => void;
  breadcrumb?: string;
  teacherName?: string;
  onBack?: () => void;
  children: React.ReactNode;
}

type SessionStatus = "completed" | "in_progress" | "upcoming";

function getSessionStatus(sessionId: string, schedules: ClassSchedule[]): SessionStatus {
  const match = schedules.find(cs => cs.syllabusSessionId === sessionId);
  if (!match) return "upcoming";
  if (match.status) return match.status as SessionStatus;
  if (match.date < TODAY) return "completed";
  if (match.date === TODAY) return "in_progress";
  return "upcoming";
}

function getScheduleStatus(cs: ClassSchedule): SessionStatus {
  if (cs.status) return cs.status as SessionStatus;
  if (cs.date < TODAY) return "completed";
  if (cs.date === TODAY) return "in_progress";
  return "upcoming";
}

const dotClass: Record<SessionStatus, string> = {
  completed: "bg-green-500",
  in_progress: "bg-yellow-400 animate-pulse",
  upcoming: "bg-muted-foreground/30",
};

const SyllabusSidebarLayout: React.FC<Props> = ({
  syllabus, classSchedules, selectedSessionId, onSessionSelect,
  activeNavItem, onNavItemChange, breadcrumb, teacherName, onBack, children,
}) => {
  const { getStagesBySyllabus, isSessionLocked } = useSyllabusFeatures();
  const sylSchedules = classSchedules.filter(cs => cs.syllabusId === syllabus.id);
  const classId = sylSchedules[0]?.classId ?? "CLS001";
  const stages = getStagesBySyllabus(syllabus.id);

  // Map: parent syllabusSessionId → derived schedules (split-a, split-b, makeup, merged)
  const derivedBySession = React.useMemo(() => {
    const map = new Map<string, typeof sylSchedules>();
    for (const cs of sylSchedules) {
      const kind = cs.kind ?? "regular";
      if (kind === "regular") continue;
      // Tìm parent session: dùng parentScheduleId → tra ngược syllabusSessionId
      const parent = cs.parentScheduleId ? sylSchedules.find(p => p.id === cs.parentScheduleId) : null;
      const parentSid = parent?.syllabusSessionId ?? cs.syllabusSessionId;
      if (!map.has(parentSid)) map.set(parentSid, []);
      map.get(parentSid)!.push(cs);
    }
    // Sort derived rows by date để hiển thị theo thứ tự thời gian
    for (const arr of map.values()) arr.sort((a, b) => a.date.localeCompare(b.date));
    return map;
  }, [sylSchedules]);

  const derivedKindLabel: Record<string, { icon: typeof Split; label: string; cls: string }> = {
    "split-a": { icon: Split, label: "Tách A", cls: "text-amber-600" },
    "split-b": { icon: Split, label: "Tách B", cls: "text-amber-600" },
    "makeup": { icon: Plus, label: "Bù", cls: "text-blue-600" },
    "merged": { icon: GitMerge, label: "Gộp", cls: "text-violet-600" },
  };
  const completedCount = syllabus.sessions.filter(
    s => getSessionStatus(s.id, sylSchedules) === "completed"
  ).length;

  // Group sessions by stage if stages defined
  const sessionsByStage = React.useMemo(() => {
    if (stages.length === 0) return null;
    const map = new Map<string, typeof syllabus.sessions>();
    for (const stg of stages) map.set(stg.id, []);
    const orphan: typeof syllabus.sessions = [];
    // Chia theo order: mỗi chặng có perStage buổi
    const per = Math.ceil(syllabus.sessions.length / stages.length);
    syllabus.sessions.forEach((s, idx) => {
      const stgIdx = Math.min(Math.floor(idx / per), stages.length - 1);
      const stg = stages[stgIdx];
      map.get(stg.id)?.push(s);
    });
    return { map, orphan };
  }, [stages, syllabus.sessions]);

  // Syllabus expand/collapse — mặc định mở, click icon chevron để thu/mở
  const [syllabusExpanded, setSyllabusExpanded] = useState(true);

  const handleSyllabusClick = () => {
    if (activeNavItem === "syllabus") {
      setSyllabusExpanded(e => !e);
    } else {
      onNavItemChange("syllabus");
      setSyllabusExpanded(true);
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] min-h-[600px] bg-background">
      {/* SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-[300px] shrink-0 border-r border-border bg-card overflow-y-auto">
        {/* Course header card */}
        <div className="px-4 pt-6 pb-4 border-b border-border flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-3 shadow-sm">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-sm text-foreground leading-tight break-words">{syllabus.name}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{syllabus.totalSessions} buổi · {completedCount} đã học</p>
          <div className="flex items-center justify-center gap-1.5 flex-wrap mt-2">
            <Badge variant="secondary" className="text-[10px] h-5 bg-violet-100 text-violet-700">{syllabus.id}</Badge>
            <Badge variant="secondary" className="text-[10px] h-5">{syllabus.level}</Badge>
          </div>
          {teacherName && (
            <p className="text-[11px] text-muted-foreground mt-2">GV: {teacherName}</p>
          )}
        </div>

        {/* Nav items: Syllabus (có thu gọn) | Game | Quiz */}
        <div className="px-2 pt-3 pb-2">
          {/* Syllabus */}
          <button
            onClick={handleSyllabusClick}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeNavItem === "syllabus"
                ? "bg-blue-50 text-blue-700"
                : "text-foreground hover:bg-muted/50"
            }`}
          >
            {syllabusExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <BookOpen className="w-4 h-4" />
            <span className="flex-1 text-left">Giáo trình</span>
          </button>

          {/* Session list — chỉ hiện khi expanded */}
          {syllabusExpanded && (
            <div className="py-1">
              {sessionsByStage ? (
                stages.map((stg, sIdx) => {
                  const stgSessions = sessionsByStage.map.get(stg.id) ?? [];
                  if (stgSessions.length === 0) return null;
                  const stageDoneCount = stgSessions.filter(
                    s => getSessionStatus(s.id, sylSchedules) === "completed"
                  ).length;
                  const stageLocked = stgSessions.length > 0 && isSessionLocked(classId, syllabus.id, stgSessions[0].id);
                  return (
                    <div key={stg.id} className="mb-1">
                      <div className="px-3 py-1.5 flex items-center gap-2 bg-muted/30 border-l-2 border-violet-300 mt-1">
                        <Layers className="w-3 h-3 text-violet-600 flex-shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-wide text-violet-700 flex-1 truncate">
                          Chặng {sIdx + 1}: {stg.name}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {stageDoneCount}/{stgSessions.length}
                        </span>
                        {stageLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                      </div>
                      {stgSessions.map((sess, idx) => {
                        const status = getSessionStatus(sess.id, sylSchedules);
                        const active = activeNavItem === "syllabus" && selectedSessionId === sess.id;
                        const locked = isSessionLocked(classId, syllabus.id, sess.id);
                        const isBigTest = idx === stgSessions.length - 1;
                        const derived = derivedBySession.get(sess.id) ?? [];
                        return (
                          <React.Fragment key={sess.id}>
                            <button
                              onClick={() => {
                                if (locked) {
                                  toast.error(`Chặng "${stg.name}" chưa mở khoá. Hoàn thành chặng trước để tiếp tục.`);
                                  return;
                                }
                                onNavItemChange("syllabus");
                                onSessionSelect(sess.id);
                              }}
                              className={`w-full flex items-center gap-2 pl-8 pr-3 py-1.5 text-left text-xs transition-colors border-l-2 ${
                                active
                                  ? "bg-blue-50 text-blue-700 border-blue-600 font-semibold"
                                  : locked
                                    ? "text-muted-foreground/60 border-transparent cursor-not-allowed"
                                    : "text-foreground border-transparent hover:bg-muted/40"
                              }`}
                            >
                              {locked ? (
                                <Lock className="w-3 h-3 flex-shrink-0 text-muted-foreground/60" />
                              ) : isBigTest ? (
                                <Trophy className="w-3 h-3 flex-shrink-0 text-amber-500" />
                              ) : (
                                <ChevronRight className="w-3 h-3 flex-shrink-0 text-muted-foreground/60" />
                              )}
                              <span className="text-[10px] font-bold text-muted-foreground w-6 flex-shrink-0">B{sess.order}</span>
                              <span className="flex-1 min-w-0 truncate">{sess.title}</span>
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotClass[status]}`} title={status} />
                            </button>
                            {derived.map((d, dIdx) => {
                              const info = derivedKindLabel[d.kind ?? ""] ?? { icon: ChevronRight, label: d.kind ?? "", cls: "text-muted-foreground" };
                              const DIcon = info.icon;
                              const dStatus = getScheduleStatus(d);
                              const isSplit = d.kind === "split-a" || d.kind === "split-b";
                              const splitIdx = isSplit
                                ? derived.filter(x => (x.kind === "split-a" || x.kind === "split-b")).findIndex(x => x.id === d.id) + 1
                                : 0;
                              return (
                                <div key={d.id} className="relative pl-12 pr-3 py-1 flex items-center gap-1.5 text-[11px] text-muted-foreground hover:bg-muted/30">
                                  <span className="absolute left-9 top-0 bottom-1/2 w-2 border-l border-b border-dashed border-muted-foreground/30 rounded-bl"></span>
                                  <DIcon className={`w-3 h-3 flex-shrink-0 ${info.cls}`} />
                                  {isSplit ? (
                                    <span className={`text-[9px] font-bold ${info.cls}`}>B{sess.order}.{splitIdx} TÁCH</span>
                                  ) : (
                                    <span className={`text-[9px] font-bold uppercase ${info.cls}`}>{info.label} từ B{sess.order}</span>
                                  )}
                                  <span className="flex-1 truncate text-foreground/70">{d.date}</span>
                                  {dStatus !== "upcoming" && (
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotClass[dStatus]}`} title={dStatus} />
                                  )}
                                </div>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                syllabus.sessions.map((sess) => {
                  const status = getSessionStatus(sess.id, sylSchedules);
                  const active = activeNavItem === "syllabus" && selectedSessionId === sess.id;
                  const derived = derivedBySession.get(sess.id) ?? [];
                  return (
                    <React.Fragment key={sess.id}>
                      <button
                        onClick={() => {
                          onNavItemChange("syllabus");
                          onSessionSelect(sess.id);
                        }}
                        className={`w-full flex items-center gap-2 pl-8 pr-3 py-1.5 text-left text-xs transition-colors border-l-2 ${
                          active
                            ? "bg-blue-50 text-blue-700 border-blue-600 font-semibold"
                            : "text-foreground border-transparent hover:bg-muted/40"
                        }`}
                      >
                        <ChevronRight className="w-3 h-3 flex-shrink-0 text-muted-foreground/60" />
                        <span className="text-[10px] font-bold text-muted-foreground w-6 flex-shrink-0">B{sess.order}</span>
                        <span className="flex-1 min-w-0 truncate">{sess.title}</span>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotClass[status]}`} title={status} />
                      </button>
                      {derived.map((d, dIdx) => {
                        const info = derivedKindLabel[d.kind ?? ""] ?? { icon: ChevronRight, label: d.kind ?? "", cls: "text-muted-foreground" };
                        const DIcon = info.icon;
                        const dStatus = getScheduleStatus(d);
                        const isSplit = d.kind === "split-a" || d.kind === "split-b";
                        const splitIdx = isSplit
                          ? derived.filter(x => (x.kind === "split-a" || x.kind === "split-b")).findIndex(x => x.id === d.id) + 1
                          : 0;
                        return (
                          <div key={d.id} className="relative pl-12 pr-3 py-1 flex items-center gap-1.5 text-[11px] text-muted-foreground hover:bg-muted/30">
                            <span className="absolute left-9 top-0 bottom-1/2 w-2 border-l border-b border-dashed border-muted-foreground/30 rounded-bl"></span>
                            <DIcon className={`w-3 h-3 flex-shrink-0 ${info.cls}`} />
                            {isSplit ? (
                              <span className={`text-[9px] font-bold ${info.cls}`}>B{sess.order}.{splitIdx} TÁCH</span>
                            ) : (
                              <span className={`text-[9px] font-bold uppercase ${info.cls}`}>{info.label} từ B{sess.order}</span>
                            )}
                            <span className="flex-1 truncate text-foreground/70">{d.date}</span>
                            {dStatus !== "upcoming" && (
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotClass[dStatus]}`} title={dStatus} />
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              )}
            </div>
          )}

          {/* GAME */}
          <button
            onClick={() => onNavItemChange("game")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors mt-0.5 ${
              activeNavItem === "game"
                ? "bg-emerald-50 text-emerald-700"
                : "text-foreground hover:bg-muted/50"
            }`}
          >
            <span className="w-4" />
            <Gamepad2 className="w-4 h-4" />
            <span className="flex-1 text-left">Game</span>
          </button>

          {/* QUIZ luyện đề */}
          <button
            onClick={() => onNavItemChange("quiz")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors mt-0.5 ${
              activeNavItem === "quiz"
                ? "bg-orange-50 text-orange-700"
                : "text-foreground hover:bg-muted/50"
            }`}
          >
            <span className="w-4" />
            <ListChecks className="w-4 h-4" />
            <span className="flex-1 text-left">Quiz luyện đề</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-3 flex items-center justify-between gap-3">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại danh sách khoá
            </button>
          ) : <div />}
          {breadcrumb && (
            <p className="text-xs text-muted-foreground truncate">{breadcrumb}</p>
          )}
        </div>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SyllabusSidebarLayout;
