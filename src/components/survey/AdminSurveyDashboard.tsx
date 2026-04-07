import React, { useMemo } from "react";
import { mockSurveySubmissions } from "@/data/mockData";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from "recharts";
import { Star, MessageSquare, AlertTriangle, CheckCircle2, TrendingUp, Users, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AdminSurveyDashboard = () => {

  const totalSubmissions = mockSurveySubmissions.length;
  const avgScore = totalSubmissions > 0 
    ? mockSurveySubmissions.reduce((sum, sub) => sum + sub.totalScore, 0) / totalSubmissions 
    : 0;
  
  const satisfiedCount = mockSurveySubmissions.filter(sub => sub.totalScore >= 4.0).length;
  const satisfactionRate = totalSubmissions > 0 ? (satisfiedCount / totalSubmissions) * 100 : 0;

  // Pie Chart Data: Promoter (4-5), Passive (3-3.9), Detractor (<3)
  const pieData = useMemo(() => {
    let promoters = 0;
    let passives = 0;
    let detractors = 0;
    mockSurveySubmissions.forEach(sub => {
      if (sub.totalScore >= 4.0) promoters++;
      else if (sub.totalScore >= 3.0) passives++;
      else detractors++;
    });

    return [
      { name: "Promoter (4-5đ)", value: promoters, color: "#10b981" },
      { name: "Passive (3-4đ)", value: passives, color: "#f59e0b" },
      { name: "Detractor (<3đ)", value: detractors, color: "#ef4444" },
    ];
  }, []);

  // Bar Chart Data: Avg Score by Segment
  const barData = useMemo(() => {
    const segments: Record<string, { total: number, count: number }> = {};
    mockSurveySubmissions.forEach(sub => {
      if (!segments[sub.segment]) segments[sub.segment] = { total: 0, count: 0 };
      segments[sub.segment].total += sub.totalScore;
      segments[sub.segment].count += 1;
    });

    return Object.keys(segments).map(seg => ({
      name: seg,
      score: Number((segments[seg].total / segments[seg].count).toFixed(1))
    }));
  }, []);

  // Alert Table Data: Score < 3.0 or contains keywords like "tệ", "chậm", "nóng", "không hài lòng"
  const alertSubmissions = mockSurveySubmissions.filter(sub => {
    if (sub.totalScore < 3.0) return true;
    const fb = sub.feedback.toLowerCase();
    if (fb.includes("tệ") || fb.includes("chậm") || fb.includes("nóng") || fb.includes("ồn")) return true;
    return false;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-primary/50 transition-colors">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Tổng số phiếu</p>
            <h3 className="text-3xl font-black text-slate-800">{totalSubmissions} <span className="text-sm text-emerald-500 ml-2 font-bold">+12%</span></h3>
          </div>
          <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-emerald-500/50 transition-colors">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">CSAT Trung bình</p>
            <h3 className="text-3xl font-black text-slate-800">{avgScore.toFixed(1)} <Star className="w-6 h-6 inline-block text-amber-400 fill-amber-400 -mt-1" /></h3>
          </div>
          <div className="w-14 h-14 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-primary/50 transition-colors">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Tỷ lệ hài lòng</p>
            <h3 className="text-3xl font-black text-emerald-500">{satisfactionRate.toFixed(0)}%</h3>
          </div>
          <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <HeartHandshake className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* 2. Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase mb-6 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-primary" /> Phân khúc & Điểm trung bình
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} domain={[0, 5]} />
                <RechartsTooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 4.0 ? '#10b981' : entry.score >= 3.0 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" /> Phân loại Khách hàng
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Alert Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-rose-50/30">
          <div>
            <h3 className="text-sm font-black text-rose-600 tracking-tight uppercase flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Danh sách cần xử lý
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Các khảo sát có điểm {'<'} 3.0 hoặc chứa từ khóa nhạy cảm.</p>
          </div>
          <div className="px-3 py-1 bg-white border rounded-full text-xs font-bold shadow-sm">
            {alertSubmissions.length} cảnh báo
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8fafc] text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Học viên</th>
                <th className="px-6 py-4">Phân khúc</th>
                <th className="px-6 py-4 text-center">Điểm số</th>
                <th className="px-6 py-4 w-1/3">Nhận xét / Phàn nàn</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {alertSubmissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-800">{sub.studentName}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase">{sub.className}</p>
                  </td>
                  <td className="px-6 py-4">
                     <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full uppercase">{sub.segment}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={`inline-flex items-center gap-1 text-xs font-black px-2 py-1 rounded-md ${
                      sub.totalScore < 3.0 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {sub.totalScore} <Star className="w-3 h-3 fill-current" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="p-3 bg-rose-50/50 border border-rose-100/50 rounded-lg text-xs text-slate-600 italic flex gap-2">
                       <MessageSquare className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                       "{sub.feedback}"
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" variant="outline" className="text-[10px] font-black uppercase text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 h-8">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Đã xử lý
                    </Button>
                  </td>
                </tr>
              ))}
              {alertSubmissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 text-sm font-medium">
                    Không có cảnh báo nào trong thời gian này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
