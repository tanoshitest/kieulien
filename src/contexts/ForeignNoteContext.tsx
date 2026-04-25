import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { foreignTeachingNotes as seedNotes, type ForeignTeachingNote } from "@/data/mockData";

interface CreateNoteInput {
  classId: string;
  className: string;
  date: string;
  classScheduleId?: string;
  sessionId?: string;
  vnTeacherId: string;
  vnTeacherName: string;
  foreignTeacherId: string;
  foreignTeacherName: string;
  content: string;
  priority?: "normal" | "important";
  highlightTopics?: string[];
  attachmentUrl?: string;
}

interface ForeignNoteCtx {
  notes: ForeignTeachingNote[];
  /** Notes cho 1 buổi cụ thể (class+date) */
  getNotesForSession: (classId: string, date: string) => ForeignTeachingNote[];
  /** Notes cho 1 schedule instance */
  getNotesForSchedule: (classScheduleId: string) => ForeignTeachingNote[];
  /** Tổng số note chưa đọc (nếu truyền foreignTeacherId → chỉ của GVNN đó) */
  unreadCount: (foreignTeacherId?: string) => number;
  createNote: (input: CreateNoteInput) => ForeignTeachingNote;
  markAsRead: (noteId: string) => void;
  /** Mark tất cả note gửi cho GVNN trong 1 buổi */
  markAllReadForSchedule: (classScheduleId: string, foreignTeacherId: string) => void;
  markAllReadForSession: (classId: string, date: string, foreignTeacherId: string) => void;
  deleteNote: (noteId: string) => void;
}

const Ctx = createContext<ForeignNoteCtx | null>(null);

export const ForeignNoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<ForeignTeachingNote[]>(seedNotes);

  const getNotesForSession = useCallback(
    (classId: string, date: string) =>
      notes
        .filter((n) => n.classId === classId && n.date === date)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [notes]
  );

  const getNotesForSchedule = useCallback(
    (classScheduleId: string) =>
      notes
        .filter((n) => n.classScheduleId === classScheduleId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [notes]
  );

  const unreadCount = useCallback(
    (foreignTeacherId?: string) =>
      notes.filter(
        (n) => !n.readAt && (!foreignTeacherId || n.foreignTeacherId === foreignTeacherId)
      ).length,
    [notes]
  );

  const createNote = useCallback((input: CreateNoteInput) => {
    const note: ForeignTeachingNote = {
      id: `FN${Date.now()}`,
      priority: "normal",
      ...input,
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [note, ...prev]);
    return note;
  }, []);

  const markAsRead = useCallback((noteId: string) => {
    const now = new Date().toISOString();
    setNotes((prev) => prev.map((n) => (n.id === noteId && !n.readAt ? { ...n, readAt: now } : n)));
  }, []);

  const markAllReadForSchedule = useCallback((classScheduleId: string, foreignTeacherId: string) => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) =>
        n.classScheduleId === classScheduleId && n.foreignTeacherId === foreignTeacherId && !n.readAt
          ? { ...n, readAt: now }
          : n
      )
    );
  }, []);

  const markAllReadForSession = useCallback(
    (classId: string, date: string, foreignTeacherId: string) => {
      const now = new Date().toISOString();
      setNotes((prev) =>
        prev.map((n) =>
          n.classId === classId &&
          n.date === date &&
          n.foreignTeacherId === foreignTeacherId &&
          !n.readAt
            ? { ...n, readAt: now }
            : n
        )
      );
    },
    []
  );

  const deleteNote = useCallback((noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  const value = useMemo<ForeignNoteCtx>(
    () => ({
      notes,
      getNotesForSession,
      getNotesForSchedule,
      unreadCount,
      createNote,
      markAsRead,
      markAllReadForSchedule,
      markAllReadForSession,
      deleteNote,
    }),
    [
      notes,
      getNotesForSession,
      getNotesForSchedule,
      unreadCount,
      createNote,
      markAsRead,
      markAllReadForSchedule,
      markAllReadForSession,
      deleteNote,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useForeignNotes() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useForeignNotes must be used within ForeignNoteProvider");
  return ctx;
}
