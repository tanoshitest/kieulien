import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingDown, AlertTriangle, CheckCircle2, Lightbulb,
  ArrowRight, Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { classes, type Syllabus } from "@/data/mockData";
import { useClassSchedules, reasonLabel } from "@/contexts/ClassScheduleContext";
import { computeClassScheduleSummary, statusTone } from "@/utils/classScheduleUtils";

interface Props {
  syllabus: Syllabus;
}

const SyllabusAnalytics: React.FC<Props> = ({ syllabus }) => {
  const { schedules, requests } = useClassSchedules();

  // Lớp đang dùng syllabus
  const classesUsingSyllabus = useMemo(() => {
    const ids = Array.from(new Set(schedules.filter(cs => cs.syllabusId === syllabus.id).map(cs => cs.classId)));
    return ids.map(id => classes.find(c => c.id === id)).filter((c): c is NonNullable<typeof c> => Boolean(c));
  }, [schedules, syllabus.id]);

  const summaries = classesUsingSyllabus.map(c => ({
    classItem: c,
    summary: computeClassScheduleSummary(c.id, c.name, syllabus, schedules),
  }));

  // Session nào bị split nhiều nhất
  const sessionStats = useMemo(() => {
    const stats: Record<string, { splits: number; merges: number; makeups: number; total: number }> = {};
    for (const s of syllabus.sessions) {
      stats[s.id] = { splits: 0, merges: 0, makeups: 0, total: 0 };
    }
    for (const cs of schedules.filter(x => x.syllabusId === syllabus.id)) {
      const sid = cs.syllabusSessionId;
      if (!stats[sid]) continue;
      stats[sid].total += 1;
      if (cs.kind === "split-a" || cs.kind === "split-b") stats[sid].splits += 1;
      if (cs.kind === "merged") stats[sid].merges += 1;
      if (cs.kind === "makeup") stats[sid].makeups += 1;
    }
    return stats;
  }, [schedules, syllabus]);

  // Reason frequency (từ requests đã được approved)
  const reasonStats = useMemo(() => {
    const approved = requests.filter(r => r.syllabusId === syllabus.id && r.status === "approved");
    const counts: Record<string, number> = {};
    for (const r of approved) {
      counts[r.reason] = (counts[r.reason] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [requests, syllabus.id]);

  // Gợi ý
  const suggestions = useMemo(() => {
    const list: { sessionId: string; sessionTitle: string; reason: string; hint: string }[] = [];
    for (const s of syllabus.sessions) {
      const st = sessionStats[s.id];
      if (!st) continue;
      const splitRate = st.total > 0 ? st.splits / st.total : 0;
      if (st.splits >= 2 || splitRate >= 0.4) {
        list.push({
          sessionId: s.id,
          sessionTitle: s.title,
          reason: `Bị split ở ${st.splits} buổi (${Math.round(splitRate * 100)}%)`,
          hint: "Cân nhắc tách Session này thành 2 phần nhỏ hơn ngay trong template gốc.",
        });
      }
    }
    return list;
  }, [sessionStats, syllabus]);

  const totalClasses = summaries.length;
  const onTrack = summaries.filter(s => s.summary.status === "on-track").length;
  const slightDelay = summaries.filter(s => s.summary.status === "slight-delay").length;
  const seriousDelay = summaries.filter(s => s.summary.status === "serious-delay").length;
  const avgDeviation = totalClasses > 0
    ? summaries.reduce((sum, s) => sum + s.summary.deviation, 0) / totalClasses
    : 0;

  return (
    <div className="space-y-5">
      {/* Explainer */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 flex items-start gap-3">
        <BarChart3 className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-violet-900">Phân tích & Feedback loop</p>
          <p className="text-violet-800 mt-0.5">
            Dữ liệu tổng hợp từ tất cả lớp đang/đã dùng syllabus này, để cải thiện template gốc cho các khoá sau.
          </p>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={CheckCircle2} color="emerald" label="Đúng tiến độ" value={`${onTrack}/${totalClasses}`} />
        <MetricCard icon={AlertTriangle} color="amber" label="Chậm nhẹ" value={`${slightDelay}/${totalClasses}`} />
        <MetricCard icon={TrendingDown} color="rose" label="Chậm nặng" value={`${seriousDelay}/${totalClasses}`} />
        <MetricCard icon={BarChart3} color="blue" label="Deviation TB" value={`${avgDeviation >= 0 ? "+" : ""}${avgDeviation.toFixed(1)}`} />
      </div>

      {/* Session hotspot */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Session nào hay bị điều chỉnh?
        </h3>
        <div className="space-y-2">
          {syllabus.sessions.map(s => {
            const st = sessionStats[s.id];
            if (!st) return null;
            const total = st.splits + st.merges + st.makeups;
            const maxTotal = Math.max(1, ...Object.values(sessionStats).map(x => x.splits + x.merges + x.makeups));
            const widthPct = (total / maxTotal) * 100;
            return (
              <div key={s.id} className="grid grid-cols-[auto_1fr_auto] gap-3 items-center">
                <div className="text-xs font-mono text-muted-foreground w-14">S{s.order}</div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{s.title}</p>
                  <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full flex">
                      {st.splits > 0 && <div className="bg-amber-400" style={{ width: `${(st.splits / maxTotal) * 100}%` }} />}
                      {st.merges > 0 && <div className="bg-violet-400" style={{ width: `${(st.merges / maxTotal) * 100}%` }} />}
                      {st.makeups > 0 && <div className="bg-blue-400" style={{ width: `${(st.makeups / maxTotal) * 100}%` }} />}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {st.splits > 0 && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Split×{st.splits}</Badge>}
                  {st.merges > 0 && <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 text-[10px]">Merge×{st.merges}</Badge>}
                  {st.makeups > 0 && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">Bù×{st.makeups}</Badge>}
                  {total === 0 && <span className="text-[10px] text-muted-foreground italic">Ổn định</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lý do phổ biến */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-bold text-sm text-foreground mb-3">Lý do điều chỉnh phổ biến</h3>
        {reasonStats.length === 0 ? (
          <p className="text-xs text-muted-foreground">Chưa có dữ liệu</p>
        ) : (
          <div className="space-y-2">
            {reasonStats.map(([reason, count]) => (
              <div key={reason} className="flex items-center justify-between text-xs">
                <span>{reasonLabel[reason as keyof typeof reasonLabel]}</span>
                <Badge variant="outline" className="bg-muted">{count} lần</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5"
        >
          <h3 className="font-bold text-sm text-amber-900 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> Gợi ý cải thiện template
          </h3>
          <div className="space-y-2">
            {suggestions.map((sug, idx) => (
              <div key={idx} className="bg-white/80 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-amber-900">Session: {sug.sessionTitle}</p>
                    <p className="text-amber-800 mt-0.5">{sug.reason}</p>
                    <p className="text-foreground mt-1 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 text-amber-600" />
                      {sug.hint}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-amber-700 mt-3 italic">
            * Gợi ý tự động dựa trên dữ liệu điều chỉnh lớp. Admin quyết định có apply vào template gốc hay không.
          </p>
        </motion.div>
      )}

      {/* Per-class summary table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <h3 className="font-bold text-sm text-foreground p-4 border-b border-border">
          Tổng hợp theo lớp
        </h3>
        <table className="w-full text-xs">
          <thead className="bg-muted/30">
            <tr className="text-left">
              <th className="px-4 py-2 font-semibold">Lớp</th>
              <th className="px-4 py-2 font-semibold text-center">Mẫu</th>
              <th className="px-4 py-2 font-semibold text-center">Thực tế</th>
              <th className="px-4 py-2 font-semibold text-center">Đã hoàn tất</th>
              <th className="px-4 py-2 font-semibold text-center">Sai lệch</th>
              <th className="px-4 py-2 font-semibold text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map(({ classItem, summary }) => {
              const tone = statusTone(summary.status);
              return (
                <tr key={classItem.id} className="border-t border-border">
                  <td className="px-4 py-2 font-medium">{classItem.name}</td>
                  <td className="px-4 py-2 text-center">{summary.templateSessions}</td>
                  <td className="px-4 py-2 text-center text-blue-700 font-semibold">{summary.actualSchedules}</td>
                  <td className="px-4 py-2 text-center">{summary.completedSessions}/{summary.templateSessions}</td>
                  <td className={`px-4 py-2 text-center font-semibold ${
                    summary.deviation > 0 ? "text-rose-600" : summary.deviation < 0 ? "text-emerald-600" : "text-slate-600"
                  }`}>
                    {summary.deviation > 0 ? `+${summary.deviation}` : summary.deviation}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Badge variant="outline" className={`${tone.cls} text-[10px] font-semibold`}>{tone.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  icon: React.ElementType;
  color: "emerald" | "amber" | "rose" | "blue";
  label: string;
  value: string;
}> = ({ icon: Icon, color, label, value }) => {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  }[color];
  return (
    <div className={`${colors} border rounded-xl p-4`}>
      <Icon className="w-5 h-5 mb-2" />
      <p className="text-xs opacity-80">{label}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
    </div>
  );
};

export default SyllabusAnalytics;
