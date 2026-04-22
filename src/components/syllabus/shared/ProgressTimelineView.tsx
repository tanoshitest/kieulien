import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Circle, Clock, BookOpen, ChevronRight, ChevronDown, Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  syllabuses, classSchedules, students, homeworkSubmissions,
} from "@/data/mockData";

interface Props {
  /** Limit timeline to a specific syllabus. Default = first syllabus in classSchedules */
  syllabusId?: string;
  /** Lock to a single student (Parent view passes their child). If omitted with showStudentPicker, defaults to "class overall". */
  studentId?: string;
  /** Show dropdown to switch between students (Teacher/TA/Admin). */
  showStudentPicker?: boolean;
  /** Restrict picker list to a class (default CLS001). */
  classId?: string;
}

const ProgressTimelineView: React.FC<Props> = ({
  syllabusId,
  studentId: lockedStudentId,
  showStudentPicker = false,
  classId = "CLS001",
}) => {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [pickedStudentId, setPickedStudentId] = useState<string>("__class__");

  const effectiveStudentId = lockedStudentId ?? (pickedStudentId === "__class__" ? undefined : pickedStudentId);

  const classStudents = useMemo(
    () => students.filter(s => s.classIds.includes(classId)),
    [classId]
  );

  const syllabus = useMemo(() => {
    if (syllabusId) return syllabuses.find(s => s.id === syllabusId);
    const firstSched = classSchedules[0];
    return firstSched ? syllabuses.find(s => s.id === firstSched.syllabusId) : undefined;
  }, [syllabusId]);

  const sessions = syllabus?.sessions ?? [];
  const mySchedules = classSchedules.filter(cs => cs.syllabusId === syllabus?.id);

  const completedScheduleIds = mySchedules.filter(s => s.status === "completed").map(s => s.syllabusSessionId);
  const currentScheduleId = mySchedules.find(s => s.status === "in_progress")?.syllabusSessionId;

  // Per-student stats (homework submission)
  const submissionStats = useMemo(() => {
    if (!effectiveStudentId) return null;
    const subs = homeworkSubmissions.filter(s => s.studentId === effectiveStudentId);
    const graded = subs.filter(s => s.status === "graded");
    const avgScore = graded.length === 0 ? 0
      : graded.reduce((sum, s) => sum + (s.score ?? 0), 0) / graded.length;
    return { total: subs.length, graded: graded.length, avgScore };
  }, [effectiveStudentId]);

  if (!syllabus) {
    return (
      <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Chưa có syllabus được phân công</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      {/* Student picker */}
      {showStudentPicker && !lockedStudentId && (
        <div className="bg-card border border-border rounded-xl p-3 mb-4 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Xem tiến độ:</span>
          </div>
          <select
            value={pickedStudentId}
            onChange={e => setPickedStudentId(e.target.value)}
            className="h-9 text-sm rounded-md border border-border bg-background px-3 min-w-[200px]"
          >
            <option value="__class__">📊 Toàn lớp</option>
            {classStudents.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {submissionStats && (
            <div className="ml-auto flex items-center gap-3 text-xs">
              <span className="text-muted-foreground">
                Bài tập: <span className="font-bold text-foreground">{submissionStats.graded}/{submissionStats.total}</span>
              </span>
              {submissionStats.graded > 0 && (
                <span className="text-muted-foreground">
                  TB: <span className="font-bold text-primary">{submissionStats.avgScore.toFixed(1)}/10</span>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Summary card */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">{syllabus.name}</h3>
          <p className="text-xs text-muted-foreground">{syllabus.level} · {sessions.length} buổi học</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-bold text-primary">{completedScheduleIds.length}/{sessions.length}</p>
          <p className="text-xs text-muted-foreground">buổi hoàn thành</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full mb-6 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${sessions.length === 0 ? 0 : (completedScheduleIds.length / sessions.length) * 100}%` }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="h-full bg-primary rounded-full"
        />
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-border" />
        <div className="space-y-3">
          {sessions.map((sess, i) => {
            const isCompleted = completedScheduleIds.includes(sess.id);
            const isCurrent = currentScheduleId === sess.id;
            const sched = mySchedules.find(s => s.syllabusSessionId === sess.id);
            const isExpanded = expandedSession === sess.id;

            // Per-student session homework summary
            let sessHwSummary: { graded: number; total: number; avg: number } | null = null;
            if (effectiveStudentId) {
              const hwIds = sess.homeworks.map(h => h.id);
              const subs = homeworkSubmissions.filter(
                s => s.studentId === effectiveStudentId && hwIds.includes(s.homeworkId)
              );
              const graded = subs.filter(s => s.status === "graded");
              if (sess.homeworks.length > 0) {
                sessHwSummary = {
                  graded: graded.length,
                  total: sess.homeworks.length,
                  avg: graded.length === 0 ? 0 : graded.reduce((a, s) => a + (s.score ?? 0), 0) / graded.length,
                };
              }
            }

            return (
              <motion.div key={sess.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="relative flex gap-4">
                {/* Timeline node */}
                <div className={`relative z-10 w-11 h-11 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isCompleted ? "bg-green-500 border-green-500" :
                  isCurrent ? "bg-primary border-primary animate-pulse" :
                  "bg-background border-border"}`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5 text-white" /> :
                   isCurrent ? <Clock className="w-4 h-4 text-white" /> :
                   <Circle className="w-4 h-4 text-muted-foreground/40" />}
                </div>

                {/* Content */}
                <div className={`flex-1 bg-card border rounded-xl overflow-hidden transition-all ${
                  isCurrent ? "border-primary shadow-sm shadow-primary/20" :
                  isCompleted ? "border-green-200" : "border-border"}`}>
                  <button onClick={() => setExpandedSession(isExpanded ? null : sess.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isCompleted ? "bg-green-100 text-green-700" : isCurrent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          Session {sess.order}
                        </span>
                        <span className="font-semibold text-sm text-foreground truncate">{sess.title}</span>
                        {isCurrent && <Badge className="bg-primary/10 text-primary text-xs">Hôm nay</Badge>}
                        {sessHwSummary && (
                          <Badge variant="secondary" className="text-[10px]">
                            BT: {sessHwSummary.graded}/{sessHwSummary.total}
                            {sessHwSummary.graded > 0 && ` · ${sessHwSummary.avg.toFixed(1)}đ`}
                          </Badge>
                        )}
                      </div>
                      {sched && <p className="text-xs text-muted-foreground mt-0.5">{new Date(sched.date).toLocaleDateString("vi-VN")}</p>}
                    </div>
                    {(isCompleted || isCurrent) ? (isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />) : null}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (isCompleted || isCurrent) && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="border-t border-border px-4 py-3 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-muted/30 rounded-lg p-2.5">
                              <p className="text-xs font-bold text-muted-foreground mb-1">📚 Từ vựng</p>
                              <p className="text-xs text-foreground leading-relaxed">{sess.vocab}</p>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-2.5">
                              <p className="text-xs font-bold text-muted-foreground mb-1">📝 Ngữ pháp</p>
                              <p className="text-xs text-foreground leading-relaxed">{sess.grammar}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressTimelineView;
