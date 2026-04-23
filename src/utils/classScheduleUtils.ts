import type { ClassSchedule, Syllabus } from "@/data/mockData";

export interface ClassScheduleSummary {
  classId: string;
  className: string;
  syllabusId: string;
  syllabusName: string;
  templateSessions: number;
  /** Số buổi calendar thực tế (đã xếp lịch, bao gồm split/makeup) */
  actualSchedules: number;
  /** Số buổi đã học (completed-full + completed-partial + skipped) */
  completedSchedules: number;
  /** Số session đã hoàn tất 100% (unique session_ids đã có progressStatus=completed-full hoặc tổng progressPercent ≥ 100) */
  completedSessions: number;
  /** Deviation theo buổi: actualSchedules - templateSessions (dương = chậm) */
  deviation: number;
  /** Trạng thái tổng quan */
  status: "on-track" | "slight-delay" | "serious-delay";
}

/**
 * Tính tình trạng deviation của 1 lớp so với template syllabus gốc.
 */
export function computeClassScheduleSummary(
  classId: string,
  className: string,
  syllabus: Syllabus,
  schedules: ClassSchedule[],
): ClassScheduleSummary {
  const classScheds = schedules.filter(cs => cs.classId === classId && cs.syllabusId === syllabus.id);
  const templateSessions = syllabus.totalSessions;
  const actualSchedules = classScheds.length;

  const completedSchedules = classScheds.filter(
    cs => cs.progressStatus === "completed-full"
      || cs.progressStatus === "completed-partial"
      || cs.progressStatus === "skipped"
      || cs.status === "completed",
  ).length;

  // Tính % hoàn thành theo từng syllabusSessionId: cộng dồn progressPercent
  const percentBySession: Record<string, number> = {};
  for (const cs of classScheds) {
    const sid = cs.syllabusSessionId;
    if (!sid) continue;
    const p = cs.progressPercent ?? (cs.progressStatus === "completed-full" ? 100 : 0);
    percentBySession[sid] = (percentBySession[sid] ?? 0) + p;
  }
  const completedSessions = Object.values(percentBySession).filter(p => p >= 100).length;

  const deviation = actualSchedules - templateSessions;

  let status: ClassScheduleSummary["status"] = "on-track";
  if (deviation >= 2) status = "serious-delay";
  else if (deviation >= 1) status = "slight-delay";

  return {
    classId,
    className,
    syllabusId: syllabus.id,
    syllabusName: syllabus.name,
    templateSessions,
    actualSchedules,
    completedSchedules,
    completedSessions,
    deviation,
    status,
  };
}

export const kindBadge: Record<NonNullable<ClassSchedule["kind"]>, { label: string; color: string }> = {
  regular:   { label: "Buổi chính",   color: "bg-slate-100 text-slate-700 border-slate-200" },
  "split-a": { label: "Split A",      color: "bg-amber-100 text-amber-700 border-amber-200" },
  "split-b": { label: "Split B",      color: "bg-amber-100 text-amber-700 border-amber-200" },
  makeup:    { label: "Bù",           color: "bg-blue-100 text-blue-700 border-blue-200" },
  merged:    { label: "Gộp session",  color: "bg-violet-100 text-violet-700 border-violet-200" },
};

export const progressStatusBadge: Record<NonNullable<ClassSchedule["progressStatus"]>, { label: string; color: string }> = {
  planned:             { label: "Chưa dạy",     color: "bg-slate-100 text-slate-600" },
  "completed-full":    { label: "Xong 100%",   color: "bg-emerald-100 text-emerald-700" },
  "completed-partial": { label: "Xong 1 phần", color: "bg-amber-100 text-amber-700" },
  skipped:             { label: "Bỏ qua",      color: "bg-rose-100 text-rose-700" },
};

export function statusTone(status: ClassScheduleSummary["status"]): { label: string; cls: string } {
  if (status === "on-track") return { label: "Đúng tiến độ", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (status === "slight-delay") return { label: "Chậm nhẹ", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  return { label: "Chậm nặng", cls: "bg-rose-50 text-rose-700 border-rose-200" };
}
