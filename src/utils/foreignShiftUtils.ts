/**
 * Foreign Teacher (GVNN) Shift Utilities
 *
 * Quy tắc giờ giảng GVNN (15-20 phút cuối buổi tối):
 * - Ca 1 (trước giải lao): kết thúc trước 19:25
 *   • 2 lớp: 30 phút/lớp, bắt đầu 18:20 → (18:20-18:50, 18:55-19:25)
 *   • 3 lớp: 25 phút/lớp, bắt đầu 18:00 → (18:00-18:25, 18:30-18:55, 19:00-19:25)
 * - Giải lao: 19:25 - 19:35 (10 phút)
 * - Ca 2 (sau giải lao):
 *   • 2 lớp: 30 phút/lớp, bắt đầu 19:35 → (19:35-20:05, 20:10-20:40)
 *   • 3 lớp: 25 phút/lớp, bắt đầu 19:35 → (19:35-20:00, 20:05-20:30, 20:35-21:00)
 * - 5 phút nghỉ giữa các lớp trong cùng ca
 * - 30 phút buffer giữa 2 chi nhánh khác nhau (di chuyển)
 */

import type { ClassSchedule } from "@/data/mockData";

export type ShiftId = "ca1" | "ca2";

export interface ShiftSlot {
  startTime: string; // "HH:MM"
  endTime: string;
  durationMin: number;
}

export interface ScheduledClassInput {
  classScheduleId: string;
  branchId: string;
  shift: ShiftId;
  priority?: number;
}

export interface AssignmentResult {
  classScheduleId: string;
  foreignTeacherId: string;
  foreignTeacherName: string;
  startTime: string;
  endTime: string;
  shift: ShiftId;
  branchId: string;
  warnings?: string[];
}

export interface ForeignTeacherInput {
  id: string;
  name: string;
  branchId: string;
  availability?: {
    days: number[];            // ISO weekday: 1=T2 … 7=CN
    shifts: ShiftId[];
    maxClassesPerWeek: number;
    unavailableDates: string[]; // ["YYYY-MM-DD"]
  };
}

/**
 * Tính toán slot time cho từng lớp trong 1 ca, dựa vào số lớp.
 */
export function calculateShiftSlots(shift: ShiftId, classCount: number): ShiftSlot[] {
  if (classCount < 1) return [];
  if (classCount > 3) classCount = 3;

  const dur = classCount === 3 ? 25 : 30;
  const gap = 5;

  let startMin = 0;
  if (shift === "ca1") {
    startMin = classCount === 3 ? toMin("18:00") : toMin("18:20");
  } else {
    startMin = toMin("19:35");
  }

  const slots: ShiftSlot[] = [];
  for (let i = 0; i < classCount; i++) {
    const s = startMin + i * (dur + gap);
    slots.push({
      startTime: fromMin(s),
      endTime: fromMin(s + dur),
      durationMin: dur,
    });
  }
  return slots;
}

/** ISO week key YYYY-Www (Monday-based) */
function getISOWeek(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day - 1));
  const thu = new Date(monday);
  thu.setDate(monday.getDate() + 3);
  const year = thu.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const week = Math.ceil(((thu.getTime() - jan1.getTime()) / 86400000 + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const fromMin = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/**
 * Xác định ca (ca1/ca2) dựa vào endTime của lớp gốc.
 * Lớp kết thúc trước 19:30 → ca1; sau → ca2.
 */
export function detectShift(classEndTime: string): ShiftId {
  return toMin(classEndTime) <= toMin("19:30") ? "ca1" : "ca2";
}

/** Convert JS getDay() (0=Sun) → ISO weekday (1=Mon … 7=Sun) */
function jsToISOWeekday(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}

/**
 * Kiểm tra GVNN có available cho ngày + ca đó không.
 * Nếu không có availability data → return true (backwards compatible).
 */
export function isAvailable(ft: ForeignTeacherInput, dateStr: string, shift: ShiftId): boolean {
  if (!ft.availability) return true;
  const { days, shifts, unavailableDates } = ft.availability;
  if (unavailableDates.includes(dateStr)) return false;
  const isoDay = jsToISOWeekday(new Date(dateStr).getDay());
  if (!days.includes(isoDay)) return false;
  if (!shifts.includes(shift)) return false;
  return true;
}

/**
 * Validate 1 assignment vs các assignment đã có của cùng GVNN trong cùng ngày.
 */
export function validateAssignment(
  candidate: { branchId: string; startTime: string; endTime: string },
  existing: Array<{ branchId: string; startTime: string; endTime: string }>
): string[] {
  const warnings: string[] = [];
  const cStart = toMin(candidate.startTime);
  const cEnd = toMin(candidate.endTime);

  for (const e of existing) {
    const eStart = toMin(e.startTime);
    const eEnd = toMin(e.endTime);

    if (cStart < eEnd && cEnd > eStart) {
      warnings.push(`Trùng giờ với buổi ${e.startTime}-${e.endTime} ở ${e.branchId}`);
      continue;
    }

    if (e.branchId !== candidate.branchId) {
      const gap = cStart >= eEnd ? cStart - eEnd : eStart - cEnd;
      if (gap < 30) {
        warnings.push(
          `Cần ≥30 phút di chuyển giữa ${e.branchId} và ${candidate.branchId} (chỉ có ${gap} phút)`
        );
      }
    }
  }
  return warnings;
}

/**
 * Auto-assign: gán GVNN tự động cho danh sách lớp.
 *
 * Thuật toán Greedy Branch-Clustering với availability filter:
 * 1. Enforce max 1 GVNN/lớp/tuần
 * 2. Group lớp theo (date, branchId, shift)
 * 3. Pre-filter GVNN theo availability (ngày, ca, unavailableDates)
 * 4. Enforce maxClassesPerWeek per GVNN
 * 5. Home-branch priority → greedy pick
 */
export function autoAssignForeignTeachers(input: {
  schedules: ClassSchedule[];
  foreignTeachers: ForeignTeacherInput[];
  existingAssignments?: Record<string, AssignmentResult[]>; // key = "FTxxx_YYYY-MM-DD"
}): {
  assignments: AssignmentResult[];
  unassigned: Array<{ classScheduleId: string; reason: string }>;
} {
  const { schedules, foreignTeachers, existingAssignments = {} } = input;
  const assignments: AssignmentResult[] = [];
  const unassigned: Array<{ classScheduleId: string; reason: string }> = [];

  // Track per (FT, date)
  const ftDailyMap: Record<string, AssignmentResult[]> = { ...existingAssignments };
  // Track weekly count per FT: ftId → count
  const ftWeeklyCount: Record<string, number> = {};

  // Pre-populate weekly counts from existingAssignments
  for (const [, assigns] of Object.entries(existingAssignments)) {
    for (const a of assigns) {
      ftWeeklyCount[a.foreignTeacherId] = (ftWeeklyCount[a.foreignTeacherId] ?? 0) + 1;
    }
  }

  // ───── Enforce: max 1 GVNN session per class per week ─────
  const seenClassWeek = new Set<string>();
  for (const s of schedules) {
    if (s.foreignTeacherId) {
      const wk = getISOWeek(s.date);
      seenClassWeek.add(`${s.classId}|${wk}`);
    }
  }
  const filteredSchedules: ClassSchedule[] = [];
  for (const s of schedules) {
    if (s.foreignTeacherId) continue;
    const wk = getISOWeek(s.date);
    const key = `${s.classId}|${wk}`;
    if (seenClassWeek.has(key)) {
      unassigned.push({ classScheduleId: s.id, reason: `Lớp đã có 1 buổi GVNN/tuần (${wk})` });
      continue;
    }
    seenClassWeek.add(key);
    filteredSchedules.push(s);
  }

  // Group by date+branch+shift
  type Group = { date: string; branchId: string; shift: ShiftId; items: ClassSchedule[] };
  const groups: Record<string, Group> = {};
  for (const s of filteredSchedules) {
    const shift = s.foreignShift ?? detectShift(s.endTime);
    const branchId = (s as any).branchId ?? "BR001";
    const realKey = `${s.date}|${branchId}|${shift}`;
    if (!groups[realKey]) groups[realKey] = { date: s.date, branchId, shift, items: [] };
    groups[realKey].items.push(s);
  }

  for (const g of Object.values(groups)) {
    const slots = calculateShiftSlots(g.shift, Math.min(g.items.length, 3));
    if (g.items.length > 3) {
      for (let i = 3; i < g.items.length; i++) {
        unassigned.push({
          classScheduleId: g.items[i].id,
          reason: `Quá 3 lớp/ca tại ${g.branchId} ngày ${g.date}`,
        });
      }
    }

    // Pre-filter: chỉ GVNN available ngày + ca này
    const availableFTs = foreignTeachers.filter((ft) => isAvailable(ft, g.date, g.shift));

    const limit = Math.min(g.items.length, 3);
    for (let i = 0; i < limit; i++) {
      const cls = g.items[i];
      const slot = slots[i];

      const home = availableFTs.filter((ft) => ft.branchId === g.branchId);
      const others = availableFTs.filter((ft) => ft.branchId !== g.branchId);
      const candidates = [...home, ...others];

      let picked: ForeignTeacherInput | null = null;
      let pickedWarnings: string[] = [];

      for (const ft of candidates) {
        // Check maxClassesPerWeek
        const maxPerWeek = ft.availability?.maxClassesPerWeek ?? 999;
        const weekCount = ftWeeklyCount[ft.id] ?? 0;
        if (weekCount >= maxPerWeek) continue;

        const dayKey = `${ft.id}_${g.date}`;
        const ftAssigns = ftDailyMap[dayKey] ?? [];

        // Max 3 lớp/shift cho 1 GVNN
        const sameShiftCount = ftAssigns.filter((a) => a.shift === g.shift).length;
        if (sameShiftCount >= 3) continue;

        const w = validateAssignment(
          { branchId: g.branchId, startTime: slot.startTime, endTime: slot.endTime },
          ftAssigns
        );
        if (w.some((m) => m.startsWith("Trùng giờ"))) continue;

        picked = ft;
        pickedWarnings = w;
        break;
      }

      if (!picked) {
        const hasAvailable = availableFTs.length > 0;
        unassigned.push({
          classScheduleId: cls.id,
          reason: hasAvailable
            ? `Không tìm được GVNN phù hợp (hết slot/conflict) cho ${g.branchId} ${g.date} ${slot.startTime}`
            : `Không có GVNN nào available ngày ${g.date} ca ${g.shift}`,
        });
        continue;
      }

      const assignment: AssignmentResult = {
        classScheduleId: cls.id,
        foreignTeacherId: picked.id,
        foreignTeacherName: picked.name,
        startTime: slot.startTime,
        endTime: slot.endTime,
        shift: g.shift,
        branchId: g.branchId,
        warnings: pickedWarnings.length ? pickedWarnings : undefined,
      };
      assignments.push(assignment);

      const dayKey = `${picked.id}_${g.date}`;
      if (!ftDailyMap[dayKey]) ftDailyMap[dayKey] = [];
      ftDailyMap[dayKey].push(assignment);

      ftWeeklyCount[picked.id] = (ftWeeklyCount[picked.id] ?? 0) + 1;
    }
  }

  return { assignments, unassigned };
}
