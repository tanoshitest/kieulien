import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

// ═══════════════════════════════════════════════════════════════
// PHASE A2 — STUDENT STARS
// ═══════════════════════════════════════════════════════════════
export interface StarLog {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;          // +1 / -1
  reason: string;          // "Nộp BTVN đúng hạn" | "GV thưởng" | ...
  source: "auto-homework" | "teacher-tick" | "manual";
  classScheduleId?: string;
  by: string;              // tên người tặng (GV / system)
  at: string;              // ISO
}

// ═══════════════════════════════════════════════════════════════
// PHASE B1 — STAGE / MILESTONE
// ═══════════════════════════════════════════════════════════════
export interface SyllabusStage {
  id: string;
  syllabusId: string;
  order: number;            // 1..M
  name: string;             // "Chặng 1" | "Stage 2"
  sessionIds: string[];     // các session thuộc chặng này
  bigTestSessionId: string; // session cuối = Big Test
}

/** Trạng thái mở/khoá theo lớp. Key: `${classId}:${stageId}` */
export type StageStatus = "locked" | "unlocked" | "completed-locked";

// ═══════════════════════════════════════════════════════════════
// PHASE B2 — BIG TEST REPORT
// ═══════════════════════════════════════════════════════════════
export type BigTestStatus = "draft" | "pending" | "approved" | "sent" | "rejected";

export interface BigTestReport {
  id: string;
  classId: string;
  className: string;
  stageId: string;
  stageName: string;
  syllabusSessionId: string;     // session BigTest
  studentId: string;
  studentName: string;
  studentAvatar: string;
  testDate: string;              // ngày test
  videoUrl?: string;
  videoFileName?: string;
  comments: string;
  scores: { skill: string; score: number }[]; // [{skill:"Speaking",score:8}, ...]
  status: BigTestStatus;
  // Workflow
  teacherId: string;
  teacherName: string;
  teacherDeadline: string;       // 7 ngày từ testDate
  submittedAt?: string;          // GV chuyển Draft → Pending
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;           // duyệt = approved
  reviewNote?: string;           // nếu reject
  staffDeadline?: string;        // 24h sau approved → phải gửi PH
  sentAt?: string;
  sentBy?: string;
  parentReadAt?: string;         // optional
}

// ═══════════════════════════════════════════════════════════════
// PHASE B3 — TEACHER NOTE
// ═══════════════════════════════════════════════════════════════
export interface TeacherNote {
  id: string;
  classScheduleId: string;
  classId: string;
  syllabusSessionId: string;
  teacherId: string;
  teacherName: string;
  teachingProgress: string;      // tiến trình thực tế dạy
  extraHomework: string;         // BTVN bổ sung
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// PHASE C1 — SYLLABUS TEMPLATE EDIT REQUEST
// ═══════════════════════════════════════════════════════════════
export type SylEditStatus = "pending" | "approved" | "rejected";

export type SylEditField = "title" | "vocab" | "grammar" | "teachingProcess" | "materialsLink";

export interface SylFieldChange {
  field: SylEditField;
  oldValue: string;
  newValue: string;
}

export interface SyllabusEditRequest {
  id: string;
  syllabusId: string;
  syllabusName: string;
  sessionId: string;
  sessionTitle: string;
  /** @deprecated dùng cho legacy; request mới dùng `changes[]` */
  field: SylEditField;
  /** @deprecated */
  oldValue: string;
  /** @deprecated */
  newValue: string;
  /** Mảng các field thay đổi (hướng B/hybrid). Nếu undefined → fallback về field/oldValue/newValue */
  changes?: SylFieldChange[];
  /** Các field đã được duyệt áp dụng (subset của changes) */
  appliedFields?: SylEditField[];
  reason: string;
  status: SylEditStatus;
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewNote?: string;
}

// ═══════════════════════════════════════════════════════════════
// PHASE C3 — TEACHER EVALUATION
// ═══════════════════════════════════════════════════════════════
export interface EvaluationCriterion {
  id: string;
  label: string;
  maxScore: number;
}
export interface TeacherEvaluation {
  id: string;
  teacherId: string;
  teacherName: string;
  classScheduleId?: string;
  className?: string;
  date: string;                  // ngày dự giờ
  criteria: { criterionId: string; score: number; note?: string }[];
  overallNote: string;
  reviewerId: string;            // học vụ
  reviewerName: string;
  visibleToTeacher: boolean;     // mặc định false
  createdAt: string;
  publishedAt?: string;
}

// ─────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────
interface FeaturesCtx {
  // Stars
  studentStars: Record<string, number>;
  starLogs: StarLog[];
  awardStar: (studentId: string, studentName: string, amount: number, reason: string, source: StarLog["source"], by: string, classScheduleId?: string) => void;

  // Stages
  stages: SyllabusStage[];
  configureSyllabusStages: (syllabusId: string, sessionIds: string[], stageCount: number, customNames?: string[]) => SyllabusStage[];
  getStagesBySyllabus: (syllabusId: string) => SyllabusStage[];
  stageStatusMap: Record<string, StageStatus>; // `${classId}:${stageId}`
  setStageStatus: (classId: string, stageId: string, status: StageStatus) => void;
  isSessionLocked: (classId: string, syllabusId: string, sessionId: string) => boolean;

  // Big Tests
  bigTests: BigTestReport[];
  upsertBigTest: (rep: BigTestReport) => void;
  submitBigTest: (id: string) => void;
  approveBigTest: (id: string, reviewerName: string, note?: string) => void;
  rejectBigTest: (id: string, reviewerName: string, note: string) => void;
  sendBigTest: (id: string, sentBy: string) => void;

  // Teacher notes
  teacherNotes: TeacherNote[];
  upsertTeacherNote: (note: TeacherNote) => void;

  // Syllabus edit requests
  sylEditRequests: SyllabusEditRequest[];
  submitSylEditRequest: (req: Omit<SyllabusEditRequest, "id" | "status" | "requestedAt">) => void;
  approveSylEdit: (id: string, reviewerName: string, note?: string, applyToTemplate?: (req: SyllabusEditRequest) => void, appliedFields?: SylEditField[]) => void;
  rejectSylEdit: (id: string, reviewerName: string, note: string) => void;

  // Evaluations
  evaluations: TeacherEvaluation[];
  evaluationCriteria: EvaluationCriterion[];
  upsertEvaluation: (evalu: TeacherEvaluation) => void;
  publishEvaluation: (id: string) => void;
}

const FeaturesContext = createContext<FeaturesCtx | null>(null);

// Default evaluation criteria
const DEFAULT_CRITERIA: EvaluationCriterion[] = [
  { id: "C1", label: "Phát âm chuẩn, rõ ràng", maxScore: 10 },
  { id: "C2", label: "Bám sát giáo án", maxScore: 10 },
  { id: "C3", label: "Tương tác & quản lý lớp", maxScore: 10 },
  { id: "C4", label: "Sử dụng đồ dùng dạy học", maxScore: 10 },
  { id: "C5", label: "Thái độ & năng lượng", maxScore: 10 },
  { id: "C6", label: "Đúng giờ & tác phong", maxScore: 10 },
  { id: "C7", label: "Kết quả học tập của HS", maxScore: 10 },
  { id: "C8", label: "Phản hồi PH & học vụ", maxScore: 10 },
];

const today = () => new Date().toISOString();

// Mock initial stars
const INITIAL_STARS: Record<string, number> = {
  STU001: 12, STU002: 9, STU003: 5, STU004: 18, STU005: 7,
  STU006: 0, STU007: 11, STU008: 6, STU009: 8, STU010: 3,
};

export const SyllabusFeaturesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studentStars, setStudentStars] = useState<Record<string, number>>(INITIAL_STARS);
  const [starLogs, setStarLogs] = useState<StarLog[]>([
    { id: "STAR_LOG_1", studentId: "STU004", studentName: "Thiện Nhân Tom", amount: 1, reason: "Nộp BTVN đúng hạn", source: "auto-homework", by: "Hệ thống", at: "2026-04-19T20:00:00" },
    { id: "STAR_LOG_2", studentId: "STU001", studentName: "Đăng Khoa Bing", amount: 1, reason: "Tích cực phát biểu", source: "teacher-tick", by: "Ms. Thu Trang", at: "2026-04-19T09:30:00" },
  ]);

  // Seed mặc định: SYL001 (10 buổi) chia 2 chặng × 5 buổi
  const SYL001_SESSIONS = ["SS001","SS002","SS003","SS004","SS005","SS006","SS007","SS008","SS009","SS010"];
  const [stages, setStages] = useState<SyllabusStage[]>([
    { id: "STG_SYL001_1", syllabusId: "SYL001", order: 1, name: "Chặng 1 — Khởi đầu", sessionIds: SYL001_SESSIONS.slice(0, 5), bigTestSessionId: "SS005" },
    { id: "STG_SYL001_2", syllabusId: "SYL001", order: 2, name: "Chặng 2 — Mở rộng", sessionIds: SYL001_SESSIONS.slice(5, 10), bigTestSessionId: "SS010" },
  ]);
  const [stageStatusMap, setStageStatusMap] = useState<Record<string, StageStatus>>({
    "CLS001:STG_SYL001_1": "unlocked",
    "CLS001:STG_SYL001_2": "locked",
  });

  const [bigTests, setBigTests] = useState<BigTestReport[]>([
    {
      id: "BT_001", classId: "CLS001", className: "4CLC 2", stageId: "STG_SYL001_1", stageName: "Chặng 1",
      syllabusSessionId: "SS005", studentId: "STU001", studentName: "Đăng Khoa Bing", studentAvatar: "DK",
      testDate: "2026-04-20",
      comments: "Em phát âm tốt, tự tin trình bày. Cần luyện thêm phần Listening Part 2.",
      scores: [{ skill: "Speaking", score: 8 }, { skill: "Listening", score: 7 }, { skill: "Reading", score: 9 }, { skill: "Writing", score: 7.5 }],
      status: "pending",
      teacherId: "USR001", teacherName: "Ms. Thu Trang",
      teacherDeadline: "2026-04-27",
      submittedAt: "2026-04-22T09:00:00",
      videoUrl: "https://drive.google.com/mock-bt-dk",
    },
    {
      id: "BT_002", classId: "CLS001", className: "4CLC 2", stageId: "STG_SYL001_1", stageName: "Chặng 1",
      syllabusSessionId: "SS005", studentId: "STU002", studentName: "Bảo Thư Mimi", studentAvatar: "BT",
      testDate: "2026-04-20",
      comments: "Em làm bài cẩn thận, ngữ pháp chắc. Speaking cần tự tin hơn.",
      scores: [{ skill: "Speaking", score: 7 }, { skill: "Listening", score: 8 }, { skill: "Reading", score: 8.5 }, { skill: "Writing", score: 9 }],
      status: "approved",
      teacherId: "USR001", teacherName: "Ms. Thu Trang",
      teacherDeadline: "2026-04-27",
      submittedAt: "2026-04-21T10:00:00",
      reviewerId: "USR_OPS", reviewerName: "Ms. Linh Chi", reviewedAt: "2026-04-21T15:00:00",
      staffDeadline: "2026-04-22T15:00:00",
      videoUrl: "https://drive.google.com/mock-bt-bt",
    },
    {
      id: "BT_003", classId: "CLS001", className: "4CLC 2", stageId: "STG_SYL001_1", stageName: "Chặng 1",
      syllabusSessionId: "SS005", studentId: "STU003", studentName: "Thành Vinh Brian", studentAvatar: "TV",
      testDate: "2026-04-20",
      comments: "Em cần ôn lại Unit 7-9, đặc biệt là từ vựng family.",
      scores: [{ skill: "Speaking", score: 6 }, { skill: "Listening", score: 7 }, { skill: "Reading", score: 7 }, { skill: "Writing", score: 6.5 }],
      status: "draft",
      teacherId: "USR001", teacherName: "Ms. Thu Trang",
      teacherDeadline: "2026-04-27",
    },
  ]);

  const [teacherNotes, setTeacherNotes] = useState<TeacherNote[]>([
    {
      id: "TN_001", classScheduleId: "CS001", classId: "CLS001", syllabusSessionId: "SS001",
      teacherId: "USR001", teacherName: "Ms. Thu Trang",
      teachingProgress: "Buổi 1 dạy đủ phần vocab + grammar. Phần role-play kéo dài hơn 5p do HS hứng thú.",
      extraHomework: "Yêu cầu HS quay thêm 1 video chào hỏi với người thân ở nhà.",
      createdAt: "2026-04-10T10:00:00", updatedAt: "2026-04-10T10:00:00",
    },
  ]);

  const [sylEditRequests, setSylEditRequests] = useState<SyllabusEditRequest[]>([
    {
      id: "SER_001", syllabusId: "SYL001", syllabusName: "Family & Friends 1",
      sessionId: "SS003", sessionTitle: "My toys",
      field: "vocab", oldValue: "Ball, Doll, Car, Train, Robot, Teddy bear, Bike",
      newValue: "Ball, Doll, Car, Train, Robot, Teddy bear, Bike, Puzzle, Lego",
      reason: "Nên thêm Puzzle và Lego vì HS rất quen thuộc, dễ liên hệ",
      status: "pending",
      requestedBy: "USR001", requestedByName: "Ms. Thu Trang",
      requestedAt: "2026-04-20T15:00:00",
    },
  ]);

  const [evaluations, setEvaluations] = useState<TeacherEvaluation[]>([
    {
      id: "EVAL_001", teacherId: "USR001", teacherName: "Ms. Thu Trang",
      classScheduleId: "CS002", className: "4CLC 2", date: "2026-04-19",
      criteria: [
        { criterionId: "C1", score: 9 }, { criterionId: "C2", score: 8 },
        { criterionId: "C3", score: 9 }, { criterionId: "C4", score: 7 },
        { criterionId: "C5", score: 9 }, { criterionId: "C6", score: 10 },
        { criterionId: "C7", score: 8 }, { criterionId: "C8", score: 9 },
      ],
      overallNote: "GV năng lượng tốt, HS hợp tác. Cần dùng thêm flashcard ở phần warmup.",
      reviewerId: "USR_OPS", reviewerName: "Ms. Linh Chi",
      visibleToTeacher: false,
      createdAt: "2026-04-19T11:00:00",
    },
  ]);

  // ─── Star helpers ──────────────────────────────────────────
  const awardStar = useCallback<FeaturesCtx["awardStar"]>((studentId, studentName, amount, reason, source, by, classScheduleId) => {
    setStudentStars(prev => ({ ...prev, [studentId]: Math.max(0, (prev[studentId] ?? 0) + amount) }));
    setStarLogs(prev => [
      { id: `STAR_${Date.now()}`, studentId, studentName, amount, reason, source, by, classScheduleId, at: today() },
      ...prev,
    ]);
  }, []);

  // ─── Stage helpers ─────────────────────────────────────────
  const configureSyllabusStages = useCallback<FeaturesCtx["configureSyllabusStages"]>((syllabusId, sessionIds, stageCount, customNames) => {
    const total = sessionIds.length;
    const perStage = Math.ceil(total / stageCount);
    const result: SyllabusStage[] = [];
    for (let i = 0; i < stageCount; i++) {
      const startIdx = i * perStage;
      const endIdx = Math.min(startIdx + perStage, total);
      const slice = sessionIds.slice(startIdx, endIdx);
      const bigTestSessionId = slice[slice.length - 1] ?? "";
      result.push({
        id: `STG_${syllabusId}_${i + 1}`,
        syllabusId, order: i + 1,
        name: customNames?.[i] ?? `Chặng ${i + 1}`,
        sessionIds: slice,
        bigTestSessionId,
      });
    }
    setStages(prev => [...prev.filter(s => s.syllabusId !== syllabusId), ...result]);
    return result;
  }, []);

  const getStagesBySyllabus = useCallback((syllabusId: string) => stages.filter(s => s.syllabusId === syllabusId).sort((a, b) => a.order - b.order), [stages]);

  const setStageStatus = useCallback<FeaturesCtx["setStageStatus"]>((classId, stageId, status) => {
    setStageStatusMap(prev => ({ ...prev, [`${classId}:${stageId}`]: status }));
  }, []);

  const isSessionLocked = useCallback<FeaturesCtx["isSessionLocked"]>((classId, syllabusId, sessionId) => {
    const stage = stages.find(s => s.syllabusId === syllabusId && s.sessionIds.includes(sessionId));
    if (!stage) return false;
    const key = `${classId}:${stage.id}`;
    const st = stageStatusMap[key];
    if (st === "unlocked" || st === "completed-locked") return false;
    if (st === "locked") return true;
    // default: chặng 1 mở, các chặng sau khoá
    return stage.order > 1;
  }, [stages, stageStatusMap]);

  // ─── BigTest helpers ───────────────────────────────────────
  const upsertBigTest = useCallback<FeaturesCtx["upsertBigTest"]>((rep) => {
    setBigTests(prev => {
      const idx = prev.findIndex(b => b.id === rep.id);
      if (idx === -1) return [rep, ...prev];
      const next = [...prev]; next[idx] = rep; return next;
    });
  }, []);

  const submitBigTest = useCallback((id: string) => {
    setBigTests(prev => prev.map(b => b.id === id ? { ...b, status: "pending", submittedAt: today() } : b));
  }, []);

  const approveBigTest = useCallback((id: string, reviewerName: string, note?: string) => {
    const now = new Date();
    const staffDeadline = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
    setBigTests(prev => prev.map(b => b.id === id ? { ...b, status: "approved", reviewerName, reviewedAt: today(), reviewNote: note, staffDeadline } : b));
  }, []);

  const rejectBigTest = useCallback((id: string, reviewerName: string, note: string) => {
    setBigTests(prev => prev.map(b => b.id === id ? { ...b, status: "rejected", reviewerName, reviewedAt: today(), reviewNote: note } : b));
  }, []);

  const sendBigTest = useCallback((id: string, sentBy: string) => {
    setBigTests(prev => prev.map(b => b.id === id ? { ...b, status: "sent", sentAt: today(), sentBy } : b));
  }, []);

  // ─── Teacher Notes ─────────────────────────────────────────
  const upsertTeacherNote = useCallback<FeaturesCtx["upsertTeacherNote"]>((note) => {
    setTeacherNotes(prev => {
      const idx = prev.findIndex(n => n.id === note.id);
      if (idx === -1) return [note, ...prev];
      const next = [...prev]; next[idx] = { ...note, updatedAt: today() }; return next;
    });
  }, []);

  // ─── Syllabus Edit Requests ────────────────────────────────
  const submitSylEditRequest = useCallback<FeaturesCtx["submitSylEditRequest"]>((req) => {
    setSylEditRequests(prev => [
      { ...req, id: `SER_${Date.now()}`, status: "pending", requestedAt: today() },
      ...prev,
    ]);
  }, []);

  const approveSylEdit = useCallback((id: string, reviewerName: string, note?: string, applyToTemplate?: (req: SyllabusEditRequest) => void, appliedFields?: SylEditField[]) => {
    setSylEditRequests(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated: SyllabusEditRequest = {
        ...r,
        status: "approved" as SylEditStatus,
        reviewerName,
        reviewedAt: today(),
        reviewNote: note,
        appliedFields: appliedFields ?? (r.changes ? r.changes.map(c => c.field) : [r.field]),
      };
      if (applyToTemplate) {
        try { applyToTemplate(updated); } catch (e) { console.error("[approveSylEdit] applyToTemplate failed:", e); }
      }
      return updated;
    }));
  }, []);

  const rejectSylEdit = useCallback((id: string, reviewerName: string, note: string) => {
    setSylEditRequests(prev => prev.map(r => r.id === id ? { ...r, status: "rejected", reviewerName, reviewedAt: today(), reviewNote: note } : r));
  }, []);

  // ─── Evaluations ───────────────────────────────────────────
  const upsertEvaluation = useCallback<FeaturesCtx["upsertEvaluation"]>((evalu) => {
    setEvaluations(prev => {
      const idx = prev.findIndex(e => e.id === evalu.id);
      if (idx === -1) return [evalu, ...prev];
      const next = [...prev]; next[idx] = evalu; return next;
    });
  }, []);

  const publishEvaluation = useCallback((id: string) => {
    setEvaluations(prev => prev.map(e => e.id === id ? { ...e, visibleToTeacher: true, publishedAt: today() } : e));
  }, []);

  const value = useMemo<FeaturesCtx>(() => ({
    studentStars, starLogs, awardStar,
    stages, configureSyllabusStages, getStagesBySyllabus, stageStatusMap, setStageStatus, isSessionLocked,
    bigTests, upsertBigTest, submitBigTest, approveBigTest, rejectBigTest, sendBigTest,
    teacherNotes, upsertTeacherNote,
    sylEditRequests, submitSylEditRequest, approveSylEdit, rejectSylEdit,
    evaluations, evaluationCriteria: DEFAULT_CRITERIA, upsertEvaluation, publishEvaluation,
  }), [
    studentStars, starLogs, awardStar,
    stages, configureSyllabusStages, getStagesBySyllabus, stageStatusMap, setStageStatus, isSessionLocked,
    bigTests, upsertBigTest, submitBigTest, approveBigTest, rejectBigTest, sendBigTest,
    teacherNotes, upsertTeacherNote,
    sylEditRequests, submitSylEditRequest, approveSylEdit, rejectSylEdit,
    evaluations, upsertEvaluation, publishEvaluation,
  ]);

  return <FeaturesContext.Provider value={value}>{children}</FeaturesContext.Provider>;
};

export const useSyllabusFeatures = (): FeaturesCtx => {
  const ctx = useContext(FeaturesContext);
  if (!ctx) throw new Error("useSyllabusFeatures must be inside <SyllabusFeaturesProvider>");
  return ctx;
};
