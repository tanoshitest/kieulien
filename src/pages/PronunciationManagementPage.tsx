import React, { useState } from "react";
import { 
  Plus, Search, Filter, Mic, Volume2, 
  PlayCircle, History, CheckCircle, Clock, 
  MessageSquare, User, BookOpen, AlertCircle, Trash2, Edit3, Send, Trophy
} from "lucide-react";
import { mockPronunciations, classes } from "@/data/mockData";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription, DialogFooter, DialogTrigger 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const PronunciationManagementPage = () => {
  const [activeTab, setActiveTab] = useState<"assignments" | "pending" | "completed">("assignments");
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ word: "", phonetic: "", audioUrl: "" });
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  const pendingSubmissions = mockPronunciations.flatMap(p => 
    p.attempts.filter(a => a.score === 0).map(a => ({ ...a, assignment: p }))
  );

  const completedSubmissions = mockPronunciations.flatMap(p => 
    p.attempts.filter(a => a.score > 0).map(a => ({ ...a, assignment: p }))
  );

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Đã tạo đề bài mới: ${newAssignment.word}`);
    setIsCreateModalOpen(false);
    setNewAssignment({ word: "", phonetic: "", audioUrl: "" });
  };

  const handleGradeSubmission = () => {
    toast.success(`Đã hoàn thành chấm điểm cho ${selectedSubmission.studentName}`);
    setSelectedSubmission(null);
    setScore("");
    setFeedback("");
  };

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50/30 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm border border-primary/20">
               <Mic className="w-6 h-6" />
            </div>
            Quản lý phát âm
          </h1>
          <p className="text-muted-foreground font-bold mt-2 ml-15">Ra đề bài và chấm điểm phát âm cho học viên.</p>
        </div>

        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-sm uppercase shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" /> Tạo đề bài mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tổng số đề bài</p>
            <p className="text-2xl font-black text-slate-800">{mockPronunciations.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center animate-pulse">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cần chấm điểm</p>
            <p className="text-2xl font-black text-slate-800">{pendingSubmissions.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Đã hoàn thành</p>
            <p className="text-2xl font-black text-slate-800">{completedSubmissions.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-2xl border w-fit">
          {[
            { id: "assignments", label: "Danh sách đề bài", icon: ListIcon },
            { id: "pending", label: "Chờ chấm điểm", icon: Clock },
            { id: "completed", label: "Lịch sử chấm", icon: History }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
                activeTab === tab.id ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-500 hover:bg-white"
              }`}
            >
              {tab.label}
              {tab.id === "pending" && pendingSubmissions.length > 0 && (
                <span className="w-5 h-5 flex items-center justify-center bg-rose-500 text-white rounded-full text-[10px]">
                  {pendingSubmissions.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "assignments" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockPronunciations.map((p) => (
                  <div key={p.id} className="bg-white p-6 rounded-3xl border hover:shadow-lg transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                       <Volume2 className="w-20 h-20 text-primary" />
                    </div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-800">{p.word}</h3>
                        <p className="text-sm font-medium text-muted-foreground italic">{p.phonetic}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 bg-slate-50 text-slate-400 hover:text-primary rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                        <button className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Lớp: {p.classId}</span>
                        <span>Hạn: {p.deadline}</span>
                      </div>
                      <button 
                        onClick={() => {
                          const audio = new Audio(p.audioExample);
                          audio.play();
                        }}
                        className="w-full py-3 bg-secondary/30 rounded-xl flex items-center justify-center gap-2 text-xs font-black text-slate-600 hover:bg-secondary/50 transition-all border border-dashed"
                      >
                        <Volume2 className="w-4 h-4" /> Nghe mẫu chuẩn
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "pending" && (
              <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
                {pendingSubmissions.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50 border-b">
                        <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Học viên</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Từ vựng</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày nộp</th>
                        <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {pendingSubmissions.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/30 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs uppercase">{s.studentName.slice(0, 2)}</div>
                              <span className="font-bold text-sm text-slate-700">{s.studentName}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 font-black text-slate-700">{s.assignment.word}</td>
                          <td className="px-8 py-5 text-xs text-muted-foreground italic">{s.submittedAt}</td>
                          <td className="px-8 py-5 text-right">
                            <button 
                              onClick={() => setSelectedSubmission(s)}
                              className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase rounded-lg shadow-sm hover:scale-105 transition-all"
                            >
                              Chấm điểm
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-20 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-500/20 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold italic text-sm">Tuyệt vời! Không còn bài nộp nào đợi chấm.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "completed" && (
              <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 border-b">
                      <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Học viên</th>
                      <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Từ vựng</th>
                      <th className="px-8 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Điểm số</th>
                      <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Nhận xét</th>
                      <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {completedSubmissions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-8 py-5 font-bold text-sm text-slate-700">{s.studentName}</td>
                        <td className="px-8 py-5 font-black text-slate-700 text-sm">{s.assignment.word}</td>
                        <td className="px-8 py-5 text-center">
                           <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-black text-xs rounded-lg border border-primary/20">{s.score}</span>
                        </td>
                        <td className="px-8 py-5 text-xs text-muted-foreground italic max-w-xs truncate">{s.feedback}</td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => setSelectedSubmission(s)}
                            className="p-2 text-slate-400 hover:text-primary transition-colors"
                          >
                             <Edit3 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CREATE MODAL */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               <Plus className="w-5 h-5 text-primary" /> Tạo đề bài phát âm mới
            </DialogTitle>
            <DialogDescription>
              Nhập từ vựng và phiên âm để học sinh luyện tập.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAssignment} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Từ vựng / Câu</label>
              <input 
                value={newAssignment.word}
                onChange={(e) => setNewAssignment({...newAssignment, word: e.target.value})}
                placeholder="Ví dụ: Beautiful"
                className="w-full px-4 py-3 bg-secondary/30 border border-transparent focus:border-primary/50 focus:bg-white rounded-xl outline-none font-bold transition-all"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Phiên âm IPA</label>
              <input 
                value={newAssignment.phonetic}
                onChange={(e) => setNewAssignment({...newAssignment, phonetic: e.target.value})}
                placeholder="Ví dụ: /ˈbjuːtɪfl/"
                className="w-full px-4 py-3 bg-secondary/30 border border-transparent focus:border-primary/50 focus:bg-white rounded-xl outline-none font-bold transition-all italic"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Link âm thanh mẫu (URL)</label>
              <input 
                value={newAssignment.audioUrl}
                onChange={(e) => setNewAssignment({...newAssignment, audioUrl: e.target.value})}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-secondary/30 border border-transparent focus:border-primary/50 focus:bg-white rounded-xl outline-none font-bold transition-all text-xs"
                required
              />
            </div>
            <DialogFooter className="pt-4">
              <button 
                type="button" 
                onClick={() => setIsCreateModalOpen(false)}
                className="px-6 py-2.5 text-xs font-black uppercase text-muted-foreground hover:bg-slate-100 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                className="px-8 py-2.5 bg-primary text-white text-[11px] font-black uppercase rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                Tạo ngay
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* GRADE MODAL */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-xl bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               <Trophy className="w-5 h-5 text-primary" /> Chấm điểm & Nhận xét phát âm
            </DialogTitle>
            <DialogDescription>
               Học viên: <span className="font-bold text-foreground underline underline-offset-4">{selectedSubmission?.studentName}</span> • Từ vựng: <span className="font-bold text-foreground">"{selectedSubmission?.assignment.word}"</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
             {/* Audio Review Section */}
             <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex flex-col items-center gap-4">
                <p className="text-[10px] font-black uppercase text-primary tracking-widest">Bản ghi của học sinh</p>
                <div className="flex items-center gap-4">
                   <button 
                     onClick={() => toast.info("Đang phát bản ghi của học sinh...")}
                     className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                   >
                      <PlayCircle className="w-8 h-8" />
                   </button>
                </div>
                <p className="text-xs text-muted-foreground italic">Nộp vào: {selectedSubmission?.submittedAt}</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Điểm số (0-100)</label>
                  <input 
                    type="number"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="90"
                    className="w-full px-4 py-3 bg-secondary/30 border border-transparent focus:border-primary/50 focus:bg-white rounded-xl outline-none font-black text-xl transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Trạng thái so với mẫu</label>
                   <div className="h-12 flex items-center px-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-[10px] font-black uppercase tracking-tighter">
                      Hệ thống gợi ý: Khớp 85%
                   </div>
                </div>
             </div>

             <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Nhận xét chi tiết cho lượt đọc này</label>
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Nhận xét của bạn giúp học viên tiến bộ hơn..."
                  className="w-full px-4 py-3 bg-secondary/30 border border-transparent focus:border-primary/50 focus:bg-white rounded-xl outline-none font-medium transition-all min-h-[100px] text-sm leading-relaxed"
                />
             </div>
          </div>

          <DialogFooter className="">
             <button 
                onClick={() => setSelectedSubmission(null)}
                className="px-6 py-2.5 text-xs font-black uppercase text-muted-foreground hover:bg-slate-100 rounded-xl"
              >
                Hủy
              </button>
              <button 
                onClick={handleGradeSubmission}
                className="px-8 py-2.5 bg-primary text-white text-[11px] font-black uppercase rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
              >
                Lưu kết quả <Send className="w-3.5 h-3.5" />
              </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ListIcon = ({ className }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;

export default PronunciationManagementPage;
