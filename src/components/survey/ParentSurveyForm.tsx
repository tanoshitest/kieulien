import React, { useState } from "react";
import { Star, Send, Loader2, PartyPopper } from "lucide-react";
import { SurveyTemplate, SurveySubmission, mockSurveyTemplates } from "@/data/mockData";
import { students } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const ParentSurveyForm = () => {
  const [template, setTemplate] = useState<SurveyTemplate>(mockSurveyTemplates[0]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const student = students[0];

  const handleRating = (questionId: string, rating: number) => {
    setRatings(prev => ({ ...prev, [questionId]: rating }));
  };

  const handleFeedback = (questionId: string, text: string) => {
    setFeedbacks(prev => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success("Cảm ơn Phụ huynh đã hoàn thành bài khảo sát!");
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[500px] bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <PartyPopper className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Đã gửi khảo sát thành công!</h2>
        <p className="text-slate-500 mb-8 max-w-md">
          Chân thành cảm ơn những ý kiến đóng góp quý báu của Phụ huynh. Trung tâm sẽ ghi nhận và cải thiện chất lượng để đồng hành cùng con tốt hơn.
        </p>
        <Button 
          onClick={() => {
            setIsSuccess(false);
            setRatings({});
            setFeedbacks({});
          }}
          className="bg-primary text-white font-bold px-8 rounded-full shadow-md hover:scale-105 transition-all"
        >
          Làm bài khảo sát khác
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-slate-100">
        <div className="border-b border-slate-100 pb-6 mb-6">
          <h2 className="text-xl md:text-2xl font-black text-primary mb-2 uppercase tracking-tight">{template.name}</h2>
          <p className="text-slate-500 text-sm">
            Học sinh: <span className="font-bold text-slate-800">{student.name}</span> | Lớp: <span className="font-bold text-slate-800">{student.level}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {template.questions.map((q, idx) => (
            <div key={q.id} className="space-y-4">
              <label className="text-sm md:text-base font-bold text-slate-800 flex items-start gap-2">
                <span className="text-primary font-black">{idx + 1}.</span> {q.content}
              </label>

              {q.type === "rating" ? (
                <div className="flex items-center gap-2 md:gap-4 pl-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRating(q.id, star)}
                      className="group relative transition-all"
                    >
                      <Star
                        className={`w-8 h-8 md:w-10 md:h-10 transition-colors ${
                          (ratings[q.id] || 0) >= star
                            ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                            : "fill-slate-100 text-slate-300 group-hover:fill-amber-100 group-hover:text-amber-200"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-4 text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:inline-block">
                    {ratings[q.id] === 5 ? "Rất hài lòng" :
                     ratings[q.id] === 4 ? "Hài lòng" :
                     ratings[q.id] === 3 ? "Bình thường" :
                     ratings[q.id] === 2 ? "Không hài lòng" :
                     ratings[q.id] === 1 ? "Rất tệ" : "Chưa chọn"}
                  </span>
                </div>
              ) : (
                <div className="pl-6">
                  <textarea
                    value={feedbacks[q.id] || ""}
                    onChange={(e) => handleFeedback(q.id, e.target.value)}
                    placeholder="Ghi chú thêm ý kiến của bạn ở đây..."
                    className="w-full text-sm p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all min-h-[120px] resize-y"
                  />
                </div>
              )}
            </div>
          ))}

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
             <div className="text-xs text-slate-400">
               * Ý kiến của bạn sẽ được bảo mật và chỉ dùng để cải thiện chất lượng.
             </div>
             <Button
              type="submit"
              disabled={isSubmitting || Object.keys(ratings).length < template.questions.filter(q => q.type === "rating").length}
              className={`h-12 px-8 rounded-full font-black uppercase tracking-wider text-sm shadow-lg transition-all
                 ${isSubmitting ? 'bg-primary/80 opacity-80' : 'bg-primary hover:bg-primary/95 hover:shadow-primary/20 active:scale-95'}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Đang gửi...
                </>
              ) : (
                <>
                  Gửi khảo sát <Send className="w-5 h-5 ml-3" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
