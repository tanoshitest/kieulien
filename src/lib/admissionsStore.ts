/**
 * Admissions Store - Cầu nối CRM ↔ AdminReports
 *
 * Pattern: Lightweight observable store (không cần Zustand)
 * - CRMPage: dispatch `enrollLead` khi chốt học viên
 * - AdminReportsPage: subscribe và cộng doanh số vào renewalClasses của học vụ phụ trách
 *
 * Data được persist vào localStorage để survive reload.
 */

import { useSyncExternalStore } from "react";

export interface EnrollmentEvent {
  id: string;                    // event id (uuid-ish)
  leadId: string;
  leadName: string;
  assignee: string;              // staff (học vụ) phụ trách
  classId: string;
  className: string;
  tuitionRevenue: number;        // Học phí đã thu
  materialRevenue: number;       // Học liệu đã thu
  includeTuition: boolean;       // PH có đóng HP không
  includeMaterial: boolean;      // PH có đóng học liệu không
  enrolledAt: string;            // ISO
  monthKey: string;              // "YYYY-MM" để cộng vào đúng kỳ lương
  applied: boolean;              // đã đẩy vào AdminReports chưa
}

const STORAGE_KEY = "kieulien.admissions.enrollments.v1";

const listeners = new Set<() => void>();
let state: EnrollmentEvent[] = loadFromStorage();

function loadFromStorage(): EnrollmentEvent[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist() {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function emit() {
  persist();
  listeners.forEach(l => l());
}

export const admissionsStore = {
  getEnrollments(): EnrollmentEvent[] {
    return state;
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /**
   * Push một lead đã chốt vào store.
   * AdminReports sẽ tự subscribe và cập nhật renewalClasses tương ứng.
   */
  recordEnrollment(evt: Omit<EnrollmentEvent, "id" | "applied" | "monthKey"> & { monthKey?: string }) {
    const d = new Date(evt.enrolledAt);
    const monthKey = evt.monthKey || `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const full: EnrollmentEvent = {
      ...evt,
      id: `enr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      applied: false,
      monthKey,
    };
    state = [full, ...state];
    emit();
    return full;
  },
  markApplied(id: string) {
    state = state.map(e => (e.id === id ? { ...e, applied: true } : e));
    emit();
  },
  /**
   * Aggregate doanh số theo assignee + className trong 1 tháng.
   * Dùng cho AdminReports để hiển thị "đề xuất renewalClasses" hoặc auto-merge.
   */
  aggregateByStaff(assignee: string, monthKey: string) {
    const rows = state.filter(e => e.assignee === assignee && e.monthKey === monthKey);
    const byClass = new Map<string, {
      classId: string;
      className: string;
      tuitionRevenue: number;
      materialRevenue: number;
      includeTuition: boolean;
      includeMaterial: boolean;
      studentCount: number;
    }>();
    for (const r of rows) {
      const prev = byClass.get(r.classId) || {
        classId: r.classId,
        className: r.className,
        tuitionRevenue: 0,
        materialRevenue: 0,
        includeTuition: false,
        includeMaterial: false,
        studentCount: 0,
      };
      prev.tuitionRevenue += r.tuitionRevenue;
      prev.materialRevenue += r.materialRevenue;
      prev.includeTuition = prev.includeTuition || r.includeTuition;
      prev.includeMaterial = prev.includeMaterial || r.includeMaterial;
      prev.studentCount += 1;
      byClass.set(r.classId, prev);
    }
    return Array.from(byClass.values());
  },
  reset() {
    state = [];
    emit();
  },
};

/** React hook để subscribe enrollments */
export function useEnrollments(): EnrollmentEvent[] {
  return useSyncExternalStore(
    admissionsStore.subscribe,
    admissionsStore.getEnrollments,
    admissionsStore.getEnrollments
  );
}
