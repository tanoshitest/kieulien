import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2, ListChecks, Play, Trophy, Timer, CheckCircle2, Star, Users, Lock,
  ArrowLeft, ArrowRight, Flag, XCircle, Award, RotateCcw, Send, Clock, Sparkles, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ─────────────────────────── GAME ─────────────────────────── */

interface GameMeta {
  id: string;
  title: string;
  type: string;
  difficulty: "Dễ" | "TB" | "Khó";
  duration: string;
  players: number;
  bestScore: number;
  icon: string;
  unlocked: boolean;
}

const mockGames: GameMeta[] = [
  { id: "G1", title: "Memory Match: Colors & Shapes", type: "Matching", difficulty: "Dễ", duration: "5 phút", players: 124, bestScore: 95, icon: "🎨", unlocked: true },
  { id: "G2", title: "Vocabulary Race", type: "Speed", difficulty: "TB", duration: "3 phút", players: 86, bestScore: 87, icon: "🏃", unlocked: true },
  { id: "G3", title: "Grammar Ninja", type: "Action", difficulty: "TB", duration: "7 phút", players: 56, bestScore: 72, icon: "🥷", unlocked: true },
  { id: "G4", title: "Spelling Bee Championship", type: "Spelling", difficulty: "Khó", duration: "10 phút", players: 34, bestScore: 68, icon: "🐝", unlocked: true },
  { id: "G5", title: "Listening Adventure", type: "Audio", difficulty: "TB", duration: "8 phút", players: 72, bestScore: 84, icon: "🎧", unlocked: false },
  { id: "G6", title: "Speaking Battle Royale", type: "Speaking", difficulty: "Khó", duration: "15 phút", players: 12, bestScore: 0, icon: "🎤", unlocked: false },
];

/* ─────────── Memory Match game (demo cho mọi game) ─────────── */

const CARD_EMOJIS = ["🎨", "🌟", "🎵", "🍎", "🚀", "🐶", "🌈", "⚽"];

interface Card { id: number; emoji: string; flipped: boolean; matched: boolean; }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(): Card[] {
  const pairs = CARD_EMOJIS.flatMap((e, i) => [
    { id: i * 2, emoji: e, flipped: false, matched: false },
    { id: i * 2 + 1, emoji: e, flipped: false, matched: false },
  ]);
  return shuffle(pairs);
}

const GamePlayer: React.FC<{ game: GameMeta; onExit: () => void }> = ({ game, onExit }) => {
  const [cards, setCards] = useState<Card[]>(() => buildDeck());
  const [flippedIdx, setFlippedIdx] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);

  const matchedCount = cards.filter(c => c.matched).length;
  const totalPairs = CARD_EMOJIS.length;
  const won = matchedCount === cards.length;

  useEffect(() => {
    if (won) return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [won]);

  const handleFlip = (idx: number) => {
    if (busy || won) return;
    if (cards[idx].flipped || cards[idx].matched) return;
    if (flippedIdx.length === 2) return;

    const next = cards.map((c, i) => i === idx ? { ...c, flipped: true } : c);
    setCards(next);
    const nowFlipped = [...flippedIdx, idx];
    setFlippedIdx(nowFlipped);

    if (nowFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = nowFlipped;
      if (next[a].emoji === next[b].emoji) {
        // match
        setTimeout(() => {
          setCards(cs => cs.map((c, i) => i === a || i === b ? { ...c, matched: true } : c));
          setFlippedIdx([]);
        }, 400);
      } else {
        setBusy(true);
        setTimeout(() => {
          setCards(cs => cs.map((c, i) => i === a || i === b ? { ...c, flipped: false } : c));
          setFlippedIdx([]);
          setBusy(false);
        }, 800);
      }
    }
  };

  const reset = () => {
    setCards(buildDeck()); setFlippedIdx([]); setMoves(0); setSeconds(0); setBusy(false);
  };

  // score: 100 - moves penalty
  const score = Math.max(20, Math.min(100, 100 - Math.max(0, moves - totalPairs) * 4 - Math.floor(seconds / 10)));
  const stars = score >= 90 ? 3 : score >= 70 ? 2 : 1;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Top bar */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <button onClick={onExit} className="p-2 rounded-lg hover:bg-white/60 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-2xl flex-shrink-0">
          {game.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-foreground truncate">{game.title}</h3>
          <p className="text-[11px] text-muted-foreground">{game.type} · {game.difficulty} · Tìm các cặp giống nhau</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-white border border-emerald-200 font-mono font-bold text-sm text-emerald-700 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> {formatTime(seconds)}
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white border border-emerald-200 font-bold text-sm text-emerald-700 flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> {moves}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Cặp đã tìm: {matchedCount / 2} / {totalPairs}</span>
          <span>{Math.round((matchedCount / cards.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
            initial={{ width: 0 }} animate={{ width: `${(matchedCount / cards.length) * 100}%` }}
            transition={{ duration: 0.3 }} />
        </div>
      </div>

      {/* Win overlay */}
      {won && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-8 text-center border-2 bg-gradient-to-br from-yellow-50 via-amber-50 to-emerald-50 border-amber-300">
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold mt-4 text-foreground flex items-center gap-2 justify-center">
            <Sparkles className="w-5 h-5 text-amber-500" /> Hoàn thành!
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{game.title}</p>

          <div className="flex justify-center gap-1 mt-4">
            {[1, 2, 3].map(i => (
              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + i * 0.15, type: "spring" }}>
                <Star className={`w-10 h-10 ${i <= stars ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 max-w-md mx-auto">
            <div className="bg-white/70 rounded-lg p-3">
              <p className="text-2xl font-black text-emerald-600">{score}</p>
              <p className="text-[10px] text-muted-foreground">Điểm</p>
            </div>
            <div className="bg-white/70 rounded-lg p-3">
              <p className="text-2xl font-black text-blue-600">{moves}</p>
              <p className="text-[10px] text-muted-foreground">Lượt lật</p>
            </div>
            <div className="bg-white/70 rounded-lg p-3">
              <p className="text-2xl font-black text-purple-600">{formatTime(seconds)}</p>
              <p className="text-[10px] text-muted-foreground">Thời gian</p>
            </div>
          </div>

          <div className="flex gap-2 justify-center mt-5">
            <Button variant="outline" onClick={onExit}>Đóng</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 gap-1.5" onClick={reset}>
              <RotateCcw className="w-4 h-4" /> Chơi lại
            </Button>
          </div>
        </motion.div>
      )}

      {/* Board */}
      {!won && (
        <div className="bg-gradient-to-br from-emerald-50/40 to-teal-50/40 border border-emerald-200 rounded-2xl p-5">
          <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {cards.map((card, idx) => {
              const isShown = card.flipped || card.matched;
              return (
                <button key={card.id} onClick={() => handleFlip(idx)}
                  className="aspect-square perspective-1000 group"
                  disabled={card.matched}>
                  <motion.div
                    animate={{ rotateY: isShown ? 180 : 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative w-full h-full preserve-3d"
                    style={{ transformStyle: "preserve-3d" }}>
                    {/* Back */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow"
                      style={{ backfaceVisibility: "hidden" }}>
                      <Sparkles className="w-6 h-6 text-white/80" />
                    </div>
                    {/* Front */}
                    <div className={`absolute inset-0 rounded-xl flex items-center justify-center text-4xl shadow-md ${
                        card.matched ? "bg-gradient-to-br from-green-100 to-emerald-100 ring-2 ring-green-400" : "bg-white"
                      }`}
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                      {card.emoji}
                    </div>
                  </motion.div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-center mt-5">
            <Button variant="outline" size="sm" onClick={reset} className="gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" /> Bắt đầu lại
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export const GameTabContent: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameMeta | null>(null);

  if (activeGame) {
    return <GamePlayer game={activeGame} onExit={() => setActiveGame(null)} />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl px-5 py-4 flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
          <Gamepad2 className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            Game Zone <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">6 games</Badge>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Luyện tập tiếng Anh qua trò chơi tương tác — vui, nhanh, hiệu quả
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">4</p>
          <p className="text-[10px] text-muted-foreground">Game đã chơi</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">82</p>
          <p className="text-[10px] text-muted-foreground">Điểm TB</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <Timer className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">2h 15m</p>
          <p className="text-[10px] text-muted-foreground">Tổng thời gian</p>
        </div>
      </div>

      {/* Game list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {mockGames.map((g, i) => (
          <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className={`bg-card border rounded-xl p-4 ${g.unlocked ? "border-border hover:border-emerald-300 hover:shadow-md" : "border-border opacity-60"} transition-all`}>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl flex-shrink-0">
                {g.unlocked ? g.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground">{g.title}</h4>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <Badge variant="secondary" className="text-[10px] h-5">{g.type}</Badge>
                  <Badge className={`text-[10px] h-5 ${g.difficulty === "Dễ" ? "bg-green-100 text-green-700" : g.difficulty === "TB" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{g.difficulty}</Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Timer className="w-3 h-3" />{g.duration}</span>
                </div>
                <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{g.players}</span>
                  {g.bestScore > 0 && <span className="flex items-center gap-1 text-amber-600 font-semibold"><Trophy className="w-3 h-3" />{g.bestScore}</span>}
                </div>
              </div>
            </div>
            <Button size="sm" onClick={() => g.unlocked && setActiveGame(g)}
              className="w-full mt-3 gap-1.5 bg-emerald-600 hover:bg-emerald-700" disabled={!g.unlocked}>
              {g.unlocked ? <><Play className="w-3.5 h-3.5" /> Bắt đầu chơi</> : <><Lock className="w-3.5 h-3.5" /> Cần mở khoá</>}
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

/* ─────────────────────────── QUIZ ─────────────────────────── */

type QuizStatus = "completed" | "in_progress" | "pending";

interface QuizMeta {
  id: string;
  title: string;
  type: string;
  questions: number;
  duration: string;
  durationMinutes: number;
  attempts: number;
  avgScore: number;
  myScore?: number;
  status: QuizStatus;
}

const mockQuizzes: QuizMeta[] = [
  { id: "Q1", title: "Đề thi thử số 1 — Unit 1-3", type: "Full test", questions: 30, duration: "45 phút", durationMinutes: 45, attempts: 128, avgScore: 78, myScore: 85, status: "completed" },
  { id: "Q2", title: "Quiz nhanh — Từ vựng Buổi 4", type: "Mini", questions: 15, duration: "15 phút", durationMinutes: 15, attempts: 92, avgScore: 82, myScore: 93, status: "completed" },
  { id: "Q3", title: "Đề thi thử số 2 — Unit 4-6", type: "Full test", questions: 30, duration: "45 phút", durationMinutes: 45, attempts: 76, avgScore: 75, status: "in_progress" },
  { id: "Q4", title: "Thử thách Nghe — Buổi 5", type: "Listening", questions: 20, duration: "25 phút", durationMinutes: 25, attempts: 54, avgScore: 71, status: "pending" },
  { id: "Q5", title: "Đề kiểm tra giữa kỳ", type: "Midterm", questions: 50, duration: "90 phút", durationMinutes: 90, attempts: 0, avgScore: 0, status: "pending" },
  { id: "Q6", title: "Luyện Ngữ pháp — Thì hiện tại", type: "Grammar", questions: 25, duration: "30 phút", durationMinutes: 30, attempts: 112, avgScore: 80, myScore: 76, status: "completed" },
];

interface Question {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

// Sample bank — in demo we slice depending on quiz length
const QUESTION_BANK: Question[] = [
  { id: "q1", prompt: "Choose the correct form: She ___ to school every day.", options: ["go", "goes", "going", "gone"], correctIndex: 1, explanation: "Chủ ngữ ngôi thứ 3 số ít → động từ thêm 's/es'." },
  { id: "q2", prompt: "What is the opposite of 'happy'?", options: ["Glad", "Sad", "Angry", "Tired"], correctIndex: 1, explanation: "'Sad' (buồn) là từ trái nghĩa với 'happy' (vui)." },
  { id: "q3", prompt: "Pick the correct article: I saw ___ elephant at the zoo.", options: ["a", "an", "the", "no article"], correctIndex: 1, explanation: "'Elephant' bắt đầu bằng nguyên âm → dùng 'an'." },
  { id: "q4", prompt: "Which sentence is in past tense?", options: ["I eat rice.", "I am eating rice.", "I ate rice.", "I will eat rice."], correctIndex: 2, explanation: "'Ate' là dạng quá khứ của 'eat'." },
  { id: "q5", prompt: "Choose the correct preposition: The cat is ___ the table.", options: ["in", "on", "at", "by"], correctIndex: 1, explanation: "'On' dùng cho vật ở trên bề mặt." },
  { id: "q6", prompt: "Find the synonym of 'big':", options: ["Tiny", "Small", "Large", "Short"], correctIndex: 2, explanation: "'Large' đồng nghĩa với 'big'." },
  { id: "q7", prompt: "Complete: They ___ playing football now.", options: ["is", "am", "are", "be"], correctIndex: 2, explanation: "'They' đi với 'are' trong thì hiện tại tiếp diễn." },
  { id: "q8", prompt: "What color is the sky on a clear day?", options: ["Green", "Blue", "Yellow", "Red"], correctIndex: 1, explanation: "Bầu trời ngày nắng có màu xanh dương." },
  { id: "q9", prompt: "Plural of 'child' is:", options: ["childs", "childes", "children", "childrens"], correctIndex: 2, explanation: "'Child' có dạng số nhiều bất quy tắc 'children'." },
  { id: "q10", prompt: "Choose the correct: How ___ apples do you have?", options: ["much", "many", "lot", "any"], correctIndex: 1, explanation: "'Apples' là danh từ đếm được → 'many'." },
];

function buildQuestions(count: number): Question[] {
  const out: Question[] = [];
  for (let i = 0; i < count; i++) {
    const base = QUESTION_BANK[i % QUESTION_BANK.length];
    out.push({ ...base, id: `${base.id}-${i}`, prompt: `Câu ${i + 1}. ${base.prompt}` });
  }
  return out;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

/* ─────────────── Quiz Player ─────────────── */

const QuizPlayer: React.FC<{ quiz: QuizMeta; onExit: () => void }> = ({ quiz, onExit }) => {
  // Demo: dùng tối đa 10 câu cho gọn
  const questions = useMemo(() => buildQuestions(Math.min(quiz.questions, 10)), [quiz.id, quiz.questions]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => new Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(quiz.durationMinutes * 60);

  useEffect(() => {
    if (submitted) return;
    if (secondsLeft <= 0) { setSubmitted(true); return; }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, submitted]);

  const q = questions[current];
  const answered = answers.filter(a => a !== null).length;
  const correctCount = answers.reduce((acc: number, a, i) => acc + (a === questions[i].correctIndex ? 1 : 0), 0);
  const score = Math.round((correctCount / questions.length) * 100);

  const pickOption = (idx: number) => {
    if (submitted) return;
    setAnswers(prev => {
      const next = [...prev];
      next[current] = idx;
      return next;
    });
  };

  /* RESULT SCREEN */
  if (submitted) {
    const passed = score >= 65;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <button onClick={onExit} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách quiz
        </button>

        <div className={`rounded-2xl p-8 text-center border-2 ${passed ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300" : "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300"}`}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${passed ? "bg-green-500" : "bg-orange-500"}`}>
            <Award className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold mt-4 text-foreground">
            {passed ? "Xuất sắc!" : "Cần cố gắng thêm!"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{quiz.title}</p>
          <div className="mt-6 inline-flex items-baseline gap-1">
            <span className={`text-6xl font-black ${passed ? "text-green-600" : "text-orange-600"}`}>{score}</span>
            <span className="text-2xl font-bold text-muted-foreground">/100</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Trả lời đúng {correctCount}/{questions.length} câu
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{correctCount}</p>
            <p className="text-[10px] text-muted-foreground">Đúng</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{answered - correctCount}</p>
            <p className="text-[10px] text-muted-foreground">Sai</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <Flag className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{questions.length - answered}</p>
            <p className="text-[10px] text-muted-foreground">Bỏ trống</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{formatTime(quiz.durationMinutes * 60 - secondsLeft)}</p>
            <p className="text-[10px] text-muted-foreground">Thời gian</p>
          </div>
        </div>

        {/* Review questions */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-1.5">
            <ListChecks className="w-4 h-4 text-orange-600" /> Xem lại đáp án
          </h3>
          <div className="space-y-3">
            {questions.map((qq, idx) => {
              const userAns = answers[idx];
              const isCorrect = userAns === qq.correctIndex;
              return (
                <div key={qq.id} className={`rounded-lg border p-3 ${isCorrect ? "bg-green-50/40 border-green-200" : userAns === null ? "bg-gray-50/40 border-gray-200" : "bg-red-50/40 border-red-200"}`}>
                  <div className="flex items-start gap-2">
                    {isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      : userAns === null ? <Flag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-foreground">{qq.prompt}</p>
                      <p className="mt-1 text-muted-foreground">
                        Đáp án đúng: <span className="font-semibold text-green-700">{qq.options[qq.correctIndex]}</span>
                        {userAns !== null && userAns !== qq.correctIndex && (
                          <> · Bạn chọn: <span className="font-semibold text-red-700">{qq.options[userAns]}</span></>
                        )}
                      </p>
                      {qq.explanation && (
                        <p className="mt-1 text-[11px] text-muted-foreground italic">💡 {qq.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onExit}>Đóng</Button>
          <Button className="bg-orange-600 hover:bg-orange-700 gap-1.5" onClick={() => {
            setCurrent(0); setAnswers(new Array(questions.length).fill(null));
            setSubmitted(false); setSecondsLeft(quiz.durationMinutes * 60);
          }}>
            <RotateCcw className="w-4 h-4" /> Làm lại
          </Button>
        </div>
      </motion.div>
    );
  }

  /* QUIZ SCREEN */
  const lowTime = secondsLeft <= 60;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Top bar */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
        <button onClick={onExit} className="p-2 rounded-lg hover:bg-white/60 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-foreground truncate">{quiz.title}</h3>
          <p className="text-[11px] text-muted-foreground">{quiz.type} · {questions.length} câu · Đã trả lời {answered}/{questions.length}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${lowTime ? "bg-red-100 text-red-700 animate-pulse" : "bg-white text-orange-700 border border-orange-200"}`}>
          <Clock className="w-4 h-4" />
          {formatTime(secondsLeft)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Câu {current + 1} / {questions.length}</span>
          <span>{Math.round(((current + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
            initial={{ width: 0 }} animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }} />
        </div>
      </div>

      {/* Question card */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
        <div>
          <AnimatePresence mode="wait">
            <motion.div key={q.id}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-card border border-border rounded-xl p-6">
              <p className="text-base font-semibold text-foreground leading-relaxed">{q.prompt}</p>
              <div className="mt-5 space-y-2">
                {q.options.map((opt, idx) => {
                  const selected = answers[current] === idx;
                  return (
                    <button key={idx} onClick={() => pickOption(idx)}
                      className={`w-full text-left rounded-lg border-2 px-4 py-3 transition-all flex items-center gap-3 ${
                        selected ? "border-orange-500 bg-orange-50" : "border-border hover:border-orange-300 hover:bg-muted/30"
                      }`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        selected ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-sm text-foreground">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" disabled={current === 0} onClick={() => setCurrent(c => c - 1)} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Câu trước
            </Button>
            {current < questions.length - 1 ? (
              <Button onClick={() => setCurrent(c => c + 1)} className="gap-1.5 bg-orange-600 hover:bg-orange-700">
                Câu tiếp <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={() => setSubmitted(true)} className="gap-1.5 bg-green-600 hover:bg-green-700">
                <Send className="w-4 h-4" /> Nộp bài
              </Button>
            )}
          </div>
        </div>

        {/* Question palette */}
        <div className="bg-card border border-border rounded-xl p-4 h-fit">
          <p className="text-xs font-bold text-foreground mb-2">Bảng câu hỏi</p>
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((_, idx) => {
              const isCurrent = idx === current;
              const isAnswered = answers[idx] !== null;
              return (
                <button key={idx} onClick={() => setCurrent(idx)}
                  className={`aspect-square rounded-md text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-orange-600 text-white ring-2 ring-orange-300 ring-offset-1"
                      : isAnswered
                        ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}>
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-3 space-y-1 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-600 inline-block" /> Hiện tại</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-100 inline-block" /> Đã trả lời ({answered})</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-muted inline-block" /> Chưa làm ({questions.length - answered})</div>
          </div>
          <Button onClick={() => setSubmitted(true)} size="sm" className="w-full mt-3 gap-1.5 bg-green-600 hover:bg-green-700">
            <Send className="w-3.5 h-3.5" /> Nộp bài
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────── Quiz Tab ─────────────── */

export const QuizTabContent: React.FC = () => {
  const [activeQuiz, setActiveQuiz] = useState<QuizMeta | null>(null);

  if (activeQuiz) {
    return <QuizPlayer quiz={activeQuiz} onExit={() => setActiveQuiz(null)} />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl px-5 py-4 flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-orange-600 flex items-center justify-center flex-shrink-0">
          <ListChecks className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            Quiz luyện đề <Badge className="bg-orange-100 text-orange-700 text-[10px]">6 đề</Badge>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ngân hàng đề thi thử — luyện tập trước kỳ thi, tự đánh giá năng lực
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-foreground">3</p>
          <p className="text-[10px] text-muted-foreground">Đã hoàn thành</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-blue-600">1</p>
          <p className="text-[10px] text-muted-foreground">Đang làm</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-orange-600">2</p>
          <p className="text-[10px] text-muted-foreground">Chưa làm</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-green-600">85</p>
          <p className="text-[10px] text-muted-foreground">Điểm TB</p>
        </div>
      </div>

      {/* Quiz list */}
      <div className="space-y-2">
        {mockQuizzes.map((q, i) => {
          const statusBadge = q.status === "completed"
            ? <Badge className="bg-green-100 text-green-700 text-[10px]"><CheckCircle2 className="w-3 h-3 mr-0.5" />Đã làm</Badge>
            : q.status === "in_progress"
              ? <Badge className="bg-blue-100 text-blue-700 text-[10px]">Đang làm</Badge>
              : <Badge className="bg-gray-100 text-gray-600 text-[10px]">Chưa làm</Badge>;
          return (
            <motion.div key={q.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-card border border-border hover:border-orange-300 rounded-xl p-4 flex items-center gap-3 transition-all">
              <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <ListChecks className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-sm text-foreground">{q.title}</h4>
                  {statusBadge}
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground flex-wrap">
                  <span>{q.type}</span>
                  <span>·</span>
                  <span>{q.questions} câu</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><Timer className="w-3 h-3" />{q.duration}</span>
                  {q.attempts > 0 && <><span>·</span><span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{q.attempts} lượt</span></>}
                  {q.attempts > 0 && <><span>·</span><span>TB: <strong>{q.avgScore}</strong></span></>}
                </div>
              </div>
              {q.myScore !== undefined && (
                <div className="text-center flex-shrink-0">
                  <p className={`text-xl font-bold ${q.myScore >= 80 ? "text-green-600" : q.myScore >= 65 ? "text-blue-600" : "text-orange-600"}`}>{q.myScore}</p>
                  <p className="text-[10px] text-muted-foreground">Điểm của tôi</p>
                </div>
              )}
              <Button size="sm" onClick={() => setActiveQuiz(q)}
                className="gap-1.5 bg-orange-600 hover:bg-orange-700 flex-shrink-0">
                {q.status === "completed" ? "Làm lại" : q.status === "in_progress" ? "Tiếp tục" : "Bắt đầu"}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
