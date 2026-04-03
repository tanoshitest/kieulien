import { adminKPIs, revenueChartData, fillRateData } from "@/data/mockData";
import { TrendingUp, Users, BookOpen, DollarSign, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

const kpiCards = [
  { label: "Học sinh mới (tháng)", value: adminKPIs.newStudents, delta: adminKPIs.newStudentsDelta, icon: Users, variant: "blue" as const },
  { label: "Doanh thu tháng", value: formatVND(adminKPIs.totalRevenue), delta: adminKPIs.revenueDelta, icon: DollarSign, variant: "green" as const },
  { label: "Lớp đang hoạt động", value: adminKPIs.activeClasses, delta: "", icon: BookOpen, variant: "amber" as const },
  { label: "Thanh toán chờ", value: formatVND(adminKPIs.pendingPayments), delta: "", icon: AlertCircle, variant: "rose" as const },
];

const variantColors: Record<string, string> = {
  blue: "text-kpi-blue",
  green: "text-kpi-green",
  amber: "text-kpi-amber",
  rose: "text-kpi-rose",
};

const AdminDashboard = () => {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Dashboard Tổng quan</h1>
          <p className="text-sm text-muted-foreground">Xin chào, Admin! Đây là tổng quan hệ thống.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className={`kpi-card kpi-card-${kpi.variant}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                {kpi.delta && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-success mt-1">
                    <TrendingUp className="w-3 h-3" />
                    {kpi.delta} so với tháng trước
                  </span>
                )}
              </div>
              <div className={`p-2 rounded-md bg-secondary ${variantColors[kpi.variant]}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card rounded-lg border p-5">
          <h3 className="font-semibold mb-4">Dòng tiền Thu/Chi (6 tháng gần nhất)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueChartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v / 1000000}M`} />
              <Tooltip
                formatter={(value: number) => formatVND(value)}
                contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 13 }}
              />
              <Bar dataKey="revenue" name="Thu" fill="hsl(var(--kpi-blue))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Chi" fill="hsl(var(--kpi-rose))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fill Rate */}
        <div className="bg-card rounded-lg border p-5">
          <h3 className="font-semibold mb-4">Tỷ lệ lấp đầy lớp học</h3>
          <div className="space-y-4">
            {fillRateData.map((cls) => (
              <div key={cls.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{cls.name}</span>
                  <span className="font-medium">{cls.fill}%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cls.fill}%`,
                      background: cls.fill > 80 ? "hsl(var(--kpi-green))" : cls.fill > 60 ? "hsl(var(--kpi-blue))" : "hsl(var(--kpi-amber))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-3 rounded-md bg-secondary">
            <p className="text-sm font-medium">Tỷ lệ trung bình: {adminKPIs.fillRate}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Mục tiêu: 85%</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <h4 className="font-medium text-sm text-muted-foreground">Ticket mở</h4>
          <p className="text-3xl font-bold mt-1">{adminKPIs.ticketsOpen}</p>
          <p className="text-xs text-muted-foreground mt-1">cần xử lý</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <h4 className="font-medium text-sm text-muted-foreground">Lead mới (tuần)</h4>
          <p className="text-3xl font-bold mt-1">7</p>
          <p className="text-xs text-muted-foreground mt-1">từ CRM pipeline</p>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <h4 className="font-medium text-sm text-muted-foreground">Giáo viên hoạt động</h4>
          <p className="text-3xl font-bold mt-1">3</p>
          <p className="text-xs text-muted-foreground mt-1">tổng 124 giờ/tháng</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
