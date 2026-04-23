import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import {
  classSchedules as initialSchedules,
  type ClassSchedule,
} from "@/data/mockData";

// ─────────────────────────────────────────────────────────────
// Phase 3: Change Requests (đề xuất điều chỉnh lịch)
// ─────────────────────────────────────────────────────────────
export type ChangeRequestType = "split" | "insert" | "shift" | "merge";

export type ChangeRequestStatus = "pending" | "approved" | "rejected";

export type ChangeReason =
  | "hv_new"              // Học viên mới vào
  | "review_weak"         // Ôn lại vì kiểm tra kém
  | "holiday"             // Nghỉ lễ
  | "teacher_absent"      // Giáo viên ốm
  | "extend_content"      // Nội dung nặng, cần kéo dài
  | "other";              // Khác

export const reasonLabel: Record<ChangeReason, string> = {
  hv_new: "Học viên mới vào lớp",
  review_weak: "Cần ôn vì kiểm tra kém",
  holiday: "Nghỉ lễ / lịch trung tâm",
  teacher_absent: "Giáo viên vắng mặt",
  extend_content: "Nội dung nặng, cần kéo dài",
  other: "Khác",
};

/** Payload của request theo từng loại */
export interface SplitPayload {
  type: "split";
  scheduleId: string;          // buổi bị split
  partAPercent: number;        // % đã dạy được trong part A (ví dụ 60)
  partBDate: string;           // ngày buổi B mới
  partBStartTime: string;
  partBEndTime: string;
  partBRoom: string;
}

export interface InsertPayload {
  type: "insert";
  classId: string;
  afterScheduleId: string;     // insert sau buổi nào
  syllabusSessionId: string;   // session nào được dạy trong buổi bù (hoặc để ôn)
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  purpose: string;             // VD "Ôn Session 2"
}

export interface ShiftPayload {
  type: "shift";
  scheduleId: string;
  newDate: string;
  cascade: boolean;            // có dời các buổi sau cùng không
}

export interface MergePayload {
  type: "merge";
  classId: string;
  primaryScheduleId: string;   // buổi giữ lại
  removeScheduleId: string;    // buổi sẽ bị gộp vào primary
}

export type ChangeRequestPayload = SplitPayload | InsertPayload | ShiftPayload | MergePayload;

export interface ScheduleChangeRequest {
  id: string;
  type: ChangeRequestType;
  classId: string;
  className: string;
  syllabusId: string;
  payload: ChangeRequestPayload;
  reason: ChangeReason;
  reasonNote?: string;
  status: ChangeRequestStatus;
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

// ─────────────────────────────────────────────────────────────
// Phase 4: Audit Log
// ─────────────────────────────────────────────────────────────
export type AuditAction =
  | "progress_update"      // GV tick tiến độ
  | "request_submit"       // GV gửi request
  | "request_approve"      // Admin duyệt
  | "request_reject"       // Admin từ chối
  | "admin_direct_edit"    // Admin edit trực tiếp
  | "schedule_create"      // tạo buổi mới
  | "schedule_delete";     // xoá buổi

export interface AuditLog {
  id: string;
  classId: string;
  className: string;
  syllabusId: string;
  scheduleId?: string;
  action: AuditAction;
  actorName: string;
  actorRole: "admin" | "teacher" | "ta";
  detail: string;           // mô tả ngắn bằng tiếng Việt
  relatedRequestId?: string;
  at: string;
}

// ─────────────────────────────────────────────────────────────
// Seed mock: 1 request pending + 1 approved + 1 rejected
// ─────────────────────────────────────────────────────────────
const initialRequests: ScheduleChangeRequest[] = [
  {
    id: "REQ001",
    type: "insert",
    classId: "CLS001",
    className: "4CLC 2",
    syllabusId: "SYL001",
    payload: {
      type: "insert",
      classId: "CLS001",
      afterScheduleId: "CS001",
      syllabusSessionId: "SS002",
      date: "2026-04-24",
      startTime: "08:00",
      endTime: "09:30",
      room: "Phòng A1",
      purpose: "Ôn Session 2 (My family) trước khi kiểm tra giữa kỳ",
    },
    reason: "review_weak",
    reasonNote: "Các bé quên nhiều từ vựng về family, cần 1 buổi ôn trước khi kiểm tra",
    status: "pending",
    requestedBy: "USR001",
    requestedByName: "Ms. Thu Trang",
    requestedAt: "2026-04-21T14:30:00",
  },
  {
    id: "REQ002",
    type: "split",
    classId: "CLS001",
    className: "4CLC 2",
    syllabusId: "SYL001",
    payload: {
      type: "split",
      scheduleId: "CS003",
      partAPercent: 60,
      partBDate: "2026-04-17",
      partBStartTime: "08:00",
      partBEndTime: "09:30",
      partBRoom: "Phòng A1",
    },
    reason: "hv_new",
    reasonNote: "Có 2 HV mới vào, cần dành thời gian giới thiệu lại vocab",
    status: "approved",
    requestedBy: "USR001",
    requestedByName: "Ms. Thu Trang",
    requestedAt: "2026-04-15T11:20:00",
    reviewedBy: "USR_ADMIN",
    reviewedByName: "Admin",
    reviewedAt: "2026-04-15T14:00:00",
    reviewNote: "OK, cho phép tách. Ghi nhận phí phụ vào chi phí trung tâm.",
  },
  {
    id: "REQ003",
    type: "shift",
    classId: "CLS002",
    className: "ENGLISH A2",
    syllabusId: "SYL002",
    payload: {
      type: "shift",
      scheduleId: "CS_SHIFT_X",
      newDate: "2026-05-02",
      cascade: true,
    },
    reason: "other",
    reasonNote: "Không có lý do thuyết phục, cô đề xuất dời vì bận riêng",
    status: "rejected",
    requestedBy: "USR002",
    requestedByName: "Ms. Johnson",
    requestedAt: "2026-04-18T09:00:00",
    reviewedBy: "USR_ADMIN",
    reviewedByName: "Admin",
    reviewedAt: "2026-04-18T16:00:00",
    reviewNote: "Lý do không đủ, vui lòng bố trí dạy bù thay vì dời.",
  },
];

const initialAuditLogs: AuditLog[] = [
  {
    id: "LOG001",
    classId: "CLS001", className: "4CLC 2", syllabusId: "SYL001",
    scheduleId: "CS003",
    action: "request_submit",
    actorName: "Ms. Thu Trang", actorRole: "teacher",
    detail: "Gửi đề xuất Split Session 2 (60/40) — Lý do: HV mới vào",
    relatedRequestId: "REQ002",
    at: "2026-04-15T11:20:00",
  },
  {
    id: "LOG002",
    classId: "CLS001", className: "4CLC 2", syllabusId: "SYL001",
    scheduleId: "CS003",
    action: "request_approve",
    actorName: "Admin", actorRole: "admin",
    detail: "Duyệt request REQ002 — Split Session 2",
    relatedRequestId: "REQ002",
    at: "2026-04-15T14:00:00",
  },
  {
    id: "LOG003",
    classId: "CLS001", className: "4CLC 2", syllabusId: "SYL001",
    scheduleId: "CS003",
    action: "progress_update",
    actorName: "Ms. Thu Trang", actorRole: "teacher",
    detail: "Cập nhật tiến độ buổi 15/4: Xong 60% (Vocab + giới thiệu Grammar)",
    at: "2026-04-15T09:45:00",
  },
  {
    id: "LOG004",
    classId: "CLS001", className: "4CLC 2", syllabusId: "SYL001",
    scheduleId: "CS003B",
    action: "progress_update",
    actorName: "Ms. Thu Trang", actorRole: "teacher",
    detail: "Cập nhật tiến độ buổi 17/4: Xong 100% (40% còn lại của Session 2)",
    at: "2026-04-17T09:50:00",
  },
];

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────
interface ClassScheduleContextValue {
  schedules: ClassSchedule[];
  requests: ScheduleChangeRequest[];
  auditLogs: AuditLog[];

  /** Phase 2: cập nhật tiến độ 1 buổi */
  updateProgress: (scheduleId: string, patch: Partial<Pick<ClassSchedule, "progressStatus" | "progressPercent" | "progressNote" | "status">>, actor: { name: string; role: "admin" | "teacher" | "ta" }) => void;

  /** Phase 3: submit request (giáo viên) */
  submitRequest: (req: Omit<ScheduleChangeRequest, "id" | "status" | "requestedAt">) => string;
  /** Phase 3: admin duyệt */
  approveRequest: (id: string, reviewer: { id: string; name: string }, note?: string) => void;
  /** Phase 3: admin từ chối */
  rejectRequest: (id: string, reviewer: { id: string; name: string }, note: string) => void;

  /** Phase 4: admin edit trực tiếp — thêm / sửa / xoá schedule */
  addSchedule: (sched: ClassSchedule, actor: { name: string; role: "admin" | "teacher" | "ta" }, detail: string) => void;
  updateSchedule: (id: string, patch: Partial<ClassSchedule>, actor: { name: string; role: "admin" | "teacher" | "ta" }, detail: string) => void;
  removeSchedule: (id: string, actor: { name: string; role: "admin" | "teacher" | "ta" }, detail: string) => void;

  /** Helpers */
  pendingCount: number;
  getClassSchedules: (classId: string, syllabusId: string) => ClassSchedule[];
  getClassRequests: (classId: string) => ScheduleChangeRequest[];
  getClassLogs: (classId: string) => AuditLog[];
}

const ClassScheduleContext = createContext<ClassScheduleContextValue | null>(null);

export const ClassScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schedules, setSchedules] = useState<ClassSchedule[]>(initialSchedules);
  const [requests, setRequests] = useState<ScheduleChangeRequest[]>(initialRequests);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  const appendLog = useCallback((log: Omit<AuditLog, "id" | "at">) => {
    setAuditLogs(prev => [
      { ...log, id: `LOG_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, at: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const updateProgress: ClassScheduleContextValue["updateProgress"] = useCallback((scheduleId, patch, actor) => {
    setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, ...patch } : s));
    const target = schedules.find(s => s.id === scheduleId);
    if (target) {
      const ps = patch.progressStatus ?? target.progressStatus ?? "planned";
      const pct = patch.progressPercent ?? target.progressPercent;
      appendLog({
        classId: target.classId,
        className: target.className,
        syllabusId: target.syllabusId,
        scheduleId,
        action: "progress_update",
        actorName: actor.name,
        actorRole: actor.role,
        detail: `Cập nhật tiến độ buổi ${target.date}: ${ps}${pct !== undefined ? ` (${pct}%)` : ""}${patch.progressNote ? ` — ${patch.progressNote}` : ""}`,
      });
    }
  }, [schedules, appendLog]);

  const submitRequest: ClassScheduleContextValue["submitRequest"] = useCallback((req) => {
    const id = `REQ_${Date.now()}_${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    const newReq: ScheduleChangeRequest = {
      ...req,
      id,
      status: "pending",
      requestedAt: new Date().toISOString(),
    };
    setRequests(prev => [newReq, ...prev]);
    appendLog({
      classId: req.classId,
      className: req.className,
      syllabusId: req.syllabusId,
      scheduleId: ("scheduleId" in req.payload ? req.payload.scheduleId : undefined),
      action: "request_submit",
      actorName: req.requestedByName,
      actorRole: "teacher",
      detail: `Gửi đề xuất ${req.type.toUpperCase()} — Lý do: ${reasonLabel[req.reason]}`,
      relatedRequestId: id,
    });
    return id;
  }, [appendLog]);

  /** Áp dụng payload vào schedules khi duyệt */
  const applyRequestPayload = useCallback((req: ScheduleChangeRequest) => {
    const p = req.payload;
    if (p.type === "split") {
      setSchedules(prev => {
        const source = prev.find(s => s.id === p.scheduleId);
        if (!source) return prev;
        const partA: ClassSchedule = {
          ...source,
          kind: "split-a",
          progressStatus: "completed-partial",
          progressPercent: p.partAPercent,
          progressNote: `Split A — xong ${p.partAPercent}%, phần còn lại chuyển sang buổi mới.`,
        };
        const partB: ClassSchedule = {
          ...source,
          id: `${source.id}_SPLIT_${Date.now()}`,
          kind: "split-b",
          parentScheduleId: source.id,
          date: p.partBDate,
          startTime: p.partBStartTime,
          endTime: p.partBEndTime,
          room: p.partBRoom,
          status: "upcoming",
          progressStatus: "planned",
          progressPercent: 100 - p.partAPercent,
          progressNote: undefined,
        };
        return prev.map(s => s.id === source.id ? partA : s).concat(partB);
      });
    } else if (p.type === "insert") {
      const classSeed = schedules.find(s => s.classId === p.classId);
      if (!classSeed) return;
      const newSched: ClassSchedule = {
        id: `CS_INS_${Date.now()}`,
        classId: p.classId,
        className: classSeed.className,
        syllabusId: req.syllabusId,
        syllabusSessionId: p.syllabusSessionId,
        teacherId: classSeed.teacherId,
        teacherName: classSeed.teacherName,
        taId: classSeed.taId,
        taName: classSeed.taName,
        date: p.date,
        startTime: p.startTime,
        endTime: p.endTime,
        room: p.room,
        status: "upcoming",
        kind: "makeup",
        progressStatus: "planned",
        parentScheduleId: p.afterScheduleId,
        progressNote: p.purpose,
      };
      setSchedules(prev => [...prev, newSched]);
    } else if (p.type === "shift") {
      setSchedules(prev => {
        const target = prev.find(s => s.id === p.scheduleId);
        if (!target) return prev;
        const oldDate = target.date;
        // Số ngày chênh lệch = newDate - oldDate
        const diffDays = Math.round(
          (new Date(p.newDate).getTime() - new Date(oldDate).getTime()) / (24 * 3600 * 1000)
        );
        if (!p.cascade || diffDays === 0) {
          // Chỉ dời 1 buổi
          return prev.map(s => s.id === p.scheduleId ? { ...s, date: p.newDate } : s);
        }
        // Cascade: dời tất cả buổi cùng lớp có date >= oldDate cùng số ngày
        return prev.map(s => {
          if (s.classId !== target.classId || s.syllabusId !== target.syllabusId) return s;
          if (s.date < oldDate) return s;
          const shifted = new Date(s.date);
          shifted.setDate(shifted.getDate() + diffDays);
          return { ...s, date: shifted.toISOString().slice(0, 10) };
        });
      });
    } else if (p.type === "merge") {
      setSchedules(prev => {
        const primary = prev.find(s => s.id === p.primaryScheduleId);
        const removed = prev.find(s => s.id === p.removeScheduleId);
        if (!primary || !removed) return prev;
        const merged: ClassSchedule = {
          ...primary,
          kind: "merged",
          mergedSessionIds: [
            ...(primary.mergedSessionIds ?? []),
            removed.syllabusSessionId,
          ],
          progressNote: `Gộp thêm nội dung từ buổi ${removed.date} (Session ${removed.syllabusSessionId}).`,
        };
        return prev.filter(s => s.id !== removed.id).map(s => s.id === primary.id ? merged : s);
      });
    }
  }, [schedules]);

  const approveRequest: ClassScheduleContextValue["approveRequest"] = useCallback((id, reviewer, note) => {
    const req = requests.find(r => r.id === id);
    if (!req || req.status !== "pending") return;
    const updated: ScheduleChangeRequest = {
      ...req,
      status: "approved",
      reviewedBy: reviewer.id,
      reviewedByName: reviewer.name,
      reviewedAt: new Date().toISOString(),
      reviewNote: note,
    };
    setRequests(prev => prev.map(r => r.id === id ? updated : r));
    applyRequestPayload(updated);
    appendLog({
      classId: req.classId,
      className: req.className,
      syllabusId: req.syllabusId,
      scheduleId: ("scheduleId" in req.payload ? req.payload.scheduleId : undefined),
      action: "request_approve",
      actorName: reviewer.name,
      actorRole: "admin",
      detail: `Duyệt request ${id} — ${req.type.toUpperCase()}${note ? ` (${note})` : ""}`,
      relatedRequestId: id,
    });
  }, [requests, applyRequestPayload, appendLog]);

  const rejectRequest: ClassScheduleContextValue["rejectRequest"] = useCallback((id, reviewer, note) => {
    const req = requests.find(r => r.id === id);
    if (!req || req.status !== "pending") return;
    const updated: ScheduleChangeRequest = {
      ...req,
      status: "rejected",
      reviewedBy: reviewer.id,
      reviewedByName: reviewer.name,
      reviewedAt: new Date().toISOString(),
      reviewNote: note,
    };
    setRequests(prev => prev.map(r => r.id === id ? updated : r));
    appendLog({
      classId: req.classId,
      className: req.className,
      syllabusId: req.syllabusId,
      action: "request_reject",
      actorName: reviewer.name,
      actorRole: "admin",
      detail: `Từ chối request ${id}: ${note}`,
      relatedRequestId: id,
    });
  }, [requests, appendLog]);

  const addSchedule: ClassScheduleContextValue["addSchedule"] = useCallback((sched, actor, detail) => {
    setSchedules(prev => [...prev, sched]);
    appendLog({
      classId: sched.classId,
      className: sched.className,
      syllabusId: sched.syllabusId,
      scheduleId: sched.id,
      action: actor.role === "admin" ? "schedule_create" : "schedule_create",
      actorName: actor.name,
      actorRole: actor.role,
      detail,
    });
  }, [appendLog]);

  const updateSchedule: ClassScheduleContextValue["updateSchedule"] = useCallback((id, patch, actor, detail) => {
    const target = schedules.find(s => s.id === id);
    if (!target) return;
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    appendLog({
      classId: target.classId,
      className: target.className,
      syllabusId: target.syllabusId,
      scheduleId: id,
      action: "admin_direct_edit",
      actorName: actor.name,
      actorRole: actor.role,
      detail,
    });
  }, [schedules, appendLog]);

  const removeSchedule: ClassScheduleContextValue["removeSchedule"] = useCallback((id, actor, detail) => {
    const target = schedules.find(s => s.id === id);
    if (!target) return;
    setSchedules(prev => prev.filter(s => s.id !== id));
    appendLog({
      classId: target.classId,
      className: target.className,
      syllabusId: target.syllabusId,
      scheduleId: id,
      action: "schedule_delete",
      actorName: actor.name,
      actorRole: actor.role,
      detail,
    });
  }, [schedules, appendLog]);

  const pendingCount = useMemo(() => requests.filter(r => r.status === "pending").length, [requests]);

  const getClassSchedules = useCallback(
    (classId: string, syllabusId: string) =>
      schedules.filter(s => s.classId === classId && s.syllabusId === syllabusId)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [schedules],
  );

  const getClassRequests = useCallback(
    (classId: string) => requests.filter(r => r.classId === classId),
    [requests],
  );

  const getClassLogs = useCallback(
    (classId: string) => auditLogs.filter(l => l.classId === classId),
    [auditLogs],
  );

  const value: ClassScheduleContextValue = {
    schedules, requests, auditLogs,
    updateProgress,
    submitRequest, approveRequest, rejectRequest,
    addSchedule, updateSchedule, removeSchedule,
    pendingCount,
    getClassSchedules, getClassRequests, getClassLogs,
  };

  return <ClassScheduleContext.Provider value={value}>{children}</ClassScheduleContext.Provider>;
};

export function useClassSchedules(): ClassScheduleContextValue {
  const ctx = useContext(ClassScheduleContext);
  if (!ctx) throw new Error("useClassSchedules must be used inside ClassScheduleProvider");
  return ctx;
}
