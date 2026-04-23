import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Clock, MapPin, User, FileText, ChevronDown, ChevronRight,
  TrendingUp, AlertTriangle, CheckCircle2, CircleDashed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { classes, classSchedules, type ClassSchedule, type Syllabus } from "@/data/mockData";
import {
  computeClassScheduleSummary,
  kindBadge,
  progressStatusBadge,
  statusTone,
} from "@/utils/classScheduleUtils";

interface Props {
  syllabus: Syllabus;
}

/**
 * Phase 1: hiển thị "Lịch học thực tế" của các lớp đang dùng syllabus này.
 * Admin chỉ xem (read-only) — Phase 3+ sẽ thêm action chỉnh sửa.
 */
const ClassScheduleTimeline: React.FC<Props> = ({ syllabus }) => {
  const classesUsingSyllabus = useMemo(() => {
    const classIds = Array.from(new Set(
      classSchedules.filter(cs => cs.syllabusId === syllabus.id).map(cs => cs.classId),
    ));
    return classIds
      .map(id => classes.find(c => c.id === id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
  }, [syllabus.id]);

  const [selectedClassId, setSelectedClassId] = useState<string | null>(
    classesUsingSyllabus[0]?.id ?? null,
  );
  const [expandedSchedule, setExpandedSchedule] = useState<string | null>(null);

  if (classesUsingSyllabus.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
        <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Chưa có lớp nào dùng syllabus này</p>
        <p className="text-sm mt-1">Khi xếp lớp xong, lịch học thực tế sẽ hiển thị tại đây.</p>
      </div>
    );
  }

  const selectedClass = classesUsingSyllabus.find(c => c.id === selectedClassId);
  const summaries = classesUsingSyllabus.map(c => ({
    classItem: c,
    summary: computeClassScheduleSummary(c.id, c.name, syllabus, classSchedules),
  }));
  const selectedSummary = summaries.find(s => s.classItem.id === selectedClassId)?.summary;

  // Schedules của lớp đang chọn — sort theo ngày tăng dần
  const classSchedulesSorted: ClassSchedule[] = useMemo(() => {
    if (!selectedClassId) return [];
    return classSchedules
      .filter(cs => cs.classId === selectedClassId && cs.syllabusId === syllabus.id)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedClassId, syllabus.id]);

  return (
    <div className="space-y-5">
      {/* Header explainer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-blue-900">Lịch học thực tế (Class Schedule)</p>
          <p className="text-blue-800 mt-0.5">
            Mỗi lớp có lịch riêng được clone từ syllabus mẫu. Khi lớp dạy chậm, hệ thống sẽ
            ghi nhận deviation so với template gốc.
          </p>
        </div>
      </div>

      {/* Class selector + summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {summaries.map(({ classItem, summary }) => {
          const tone = statusTone(summary.status);
          const isActive = classItem.id === selectedClassId;
          return (
            <button
              key={classItem.id}
              onClick={() => setSelectedClassId(classItem.id)}
              className={`text-left bg-card rounded-xl p-4 border transition-all ${
                isActive ? "border-primary ring-2 ring-primary/20 shadow" : "border-border hover:border-primary/40"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm text-foreground">{classItem.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{classItem.schedule}</p>
                </div>
                <Badge variant="outline" className={`${tone.cls} text-[10px] font-semibold`}>
                  {tone.label}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Mẫu</p>
                  <p className="text-sm font-bold text-slate-700">{summary.templateSessions}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Thực tế</p>
                  <p className="text-sm font-bold text-blue-700">{summary.actualSchedules}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Chênh</p>
                  <p className={`text-sm font-bold ${
                    summary.deviation > 0 ? "text-rose-600" : summary.deviation < 0 ? "text-emerald-600" : "text-slate-600"
                  }`}>
                    {summary.deviation > 0 ? `+${summary.deviation}` : summary.deviation}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected class detail */}
      {selectedClass && selectedSummary && (
        <motion.div
          key={selectedClass.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl"
        >
          {/* Class header */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-bold text-base text-foreground">{selectedClass.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedClass.schedule} · {selectedClass.studentCount}/{selectedClass.maxStudents} HV ·
                Khai giảng {selectedClass.startDate}
              </p>
            </div>
            {selectedSummary.deviation > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-amber-800 font-medium">
                  Chậm {selectedSummary.deviation} buổi so với syllabus mẫu
                </span>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="p-5">
            <div className="space-y-2">
              {classSchedulesSorted.map((cs, idx) => {
                const sess = syllabus.sessions.find(s => s.id === cs.syllabusSessionId);
                const isExpanded = expandedSchedule === cs.id;
                const kind = cs.kind ?? "regular";
                const kindInfo = kindBadge[kind];
                const ps = cs.progressStatus ?? "planned";
                const psInfo = progressStatusBadge[ps];

                return (
                  <div key={cs.id} className="relative">
                    {/* Connector line */}
                    {idx < classSchedulesSorted.length - 1 && (
                      <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-border" />
                    )}

                    <div className="flex gap-3">
                      {/* Status dot */}
                      <div className="flex-shrink-0 w-10 flex items-start justify-center pt-2">
                        {ps === "completed-full" ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 bg-card rounded-full" />
                        ) : ps === "completed-partial" ? (
                          <CheckCircle2 className="w-6 h-6 text-amber-500 bg-card rounded-full" />
                        ) : ps === "skipped" ? (
                          <CircleDashed className="w-6 h-6 text-rose-400 bg-card rounded-full" />
                        ) : (
                          <CircleDashed className="w-6 h-6 text-slate-300 bg-card rounded-full" />
                        )}
                      </div>

                      {/* Content card */}
                      <div className="flex-1 bg-muted/20 border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedSchedule(isExpanded ? null : cs.id)}
                          className="w-full p-3 flex items-center gap-3 text-left hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono text-muted-foreground">
                                Buổi {idx + 1}
                              </span>
                              <span className="text-sm font-semibold text-foreground">
                                {sess ? `Session ${sess.order}: ${sess.title}` : "(không xác định)"}
                              </span>
                              <Badge variant="outline" className={`${kindInfo.color} text-[10px]`}>
                                {kindInfo.label}
                              </Badge>
                              <Badge variant="outline" className={`${psInfo.color} text-[10px] border-transparent`}>
                                {psInfo.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{cs.date}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{cs.startTime}–{cs.endTime}</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{cs.room}</span>
                            </div>
                          </div>
                          {cs.progressPercent !== undefined && cs.progressPercent < 100 && (
                            <div className="flex-shrink-0 text-right">
                              <p className="text-[10px] text-muted-foreground">% nội dung</p>
                              <p className="text-sm font-bold text-amber-600">{cs.progressPercent}%</p>
                            </div>
                          )}
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        </button>

                        {isExpanded && (
                          <div className="border-t border-border p-3 bg-background space-y-2">
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-muted-foreground">GV:</span>
                                <span className="font-medium">{cs.teacherName}</span>
                              </div>
                              {cs.taName && (
                                <div className="flex items-center gap-2">
                                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="text-muted-foreground">TA:</span>
                                  <span className="font-medium">{cs.taName}</span>
                                </div>
                              )}
                            </div>
                            {cs.parentScheduleId && (
                              <p className="text-xs text-muted-foreground">
                                ↳ Tiếp nối từ buổi <code className="font-mono">{cs.parentScheduleId}</code>
                              </p>
                            )}
                            {cs.progressNote && (
                              <div className="bg-amber-50/50 border border-amber-100 rounded-md p-2">
                                <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                                  <FileText className="w-3 h-3" /> Ghi chú tiến độ
                                </p>
                                <p className="text-xs text-foreground">{cs.progressNote}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats footer */}
            <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Buổi mẫu</p>
                <p className="text-lg font-bold text-slate-700">{selectedSummary.templateSessions}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Buổi thực tế</p>
                <p className="text-lg font-bold text-blue-700">{selectedSummary.actualSchedules}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Đã hoàn tất</p>
                <p className="text-lg font-bold text-emerald-700">{selectedSummary.completedSessions}/{selectedSummary.templateSessions} session</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sai lệch</p>
                <p className={`text-lg font-bold ${
                  selectedSummary.deviation > 0 ? "text-rose-600" : selectedSummary.deviation < 0 ? "text-emerald-600" : "text-slate-600"
                }`}>
                  {selectedSummary.deviation > 0 ? `+${selectedSummary.deviation}` : selectedSummary.deviation} buổi
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ClassScheduleTimeline;
