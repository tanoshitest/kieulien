import { useParams, useNavigate } from "react-router-dom";
import { students, classes, attendanceRecords, mockTuitions } from "@/data/mockData";
import { ArrowLeft, BookOpen, CalendarCheck, DollarSign, MessageSquare, User, BellRing, Receipt, CheckCircle2, Clock, ClipboardList, FilePlus, Plus, FileText, Printer, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n) + "đ";

const StudentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const student = students.find((s) => s.id === id);
  const [activeTab, setActiveTab] = useState("info");
  const [selectedReport, setSelectedReport] = useState<any>(null);

  if (!student) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Không tìm thấy học sinh.</p>
        <button onClick={() => navigate("/students")} className="mt-2 text-primary text-sm hover:underline">← Quay lại</button>
      </div>
    );
  }

  const studentClasses = student.classIds.map((cid) => classes.find((c) => c.id === cid)).filter(Boolean);

  const tabs = [
    { key: "info", label: "Thông tin chung" },
    { key: "history", label: "Lịch sử học" },
    { key: "attendance", label: "Điểm danh" },
    { key: "exams", label: "Kết quả thi" },
    { key: "tuition", label: "Học phí" },
    { key: "reports", label: "Báo cáo" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Breadcrumb */}
      <div className="odoo-breadcrumb">
        <button onClick={() => navigate("/students")} className="flex items-center gap-1 text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Học sinh
        </button>
        <span>/</span>
        <span className="text-foreground font-medium">{student.name}</span>
      </div>

      {/* Header: Avatar + Name + Smart Buttons */}
      <div className="bg-card rounded-lg border">
        <div className="p-5 flex flex-col md:flex-row md:items-start gap-5">
          {/* Avatar & Basic Info */}
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xl font-bold flex-shrink-0">
              {student.avatar}
            </div>
            <div>
              <h1 className="text-xl font-bold">{student.name}</h1>
              <p className="text-sm text-muted-foreground">{student.id} • {student.level}</p>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                student.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
              }`}>
                {student.status === "active" ? "Đang học" : student.status === "inactive" ? "Tạm nghỉ" : "Tốt nghiệp"}
              </span>
            </div>
          </div>

          {/* Smart Buttons */}
          <div className="flex flex-wrap gap-2">
            <div className="smart-button">
              <span className="smart-button-value">{student.classIds.length}</span>
              <span className="smart-button-label flex items-center gap-1"><BookOpen className="w-3 h-3" /> Lớp học</span>
            </div>
            <div className="smart-button">
              <span className="smart-button-value">{student.attendanceCount}</span>
              <span className="smart-button-label flex items-center gap-1"><CalendarCheck className="w-3 h-3" /> Điểm danh</span>
            </div>
            <div className="smart-button">
              <span className="smart-button-value">{formatVND(student.paidFee)}</span>
              <span className="smart-button-label flex items-center gap-1"><DollarSign className="w-3 h-3" /> Đã thanh toán</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t px-5">
          <div className="flex gap-6">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === t.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {activeTab === "info" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              {[
                ["Họ tên", student.name],
                ["Email", student.email],
                ["Điện thoại", student.phone],
                ["Ngày sinh", student.dob],
                ["Trình độ", student.level],
                ["Ngày ghi danh", student.enrollDate],
                ["Phụ huynh", student.parentName],
                ["SĐT phụ huynh", student.parentPhone],
                ["Tổng học phí", formatVND(student.totalFee)],
                ["Đã thanh toán", formatVND(student.paidFee)],
                ["Còn nợ", formatVND(student.totalFee - student.paidFee)],
              ].map(([label, value]) => (
                <div key={label} className="flex">
                  <span className="w-36 text-muted-foreground flex-shrink-0">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
              <div className="md:col-span-2 mt-2">
                <p className="text-muted-foreground mb-1">Lớp đang học:</p>
                <div className="flex flex-wrap gap-2">
                  {studentClasses.map((cls) => cls && (
                    <span key={cls.id} className="text-xs px-2 py-1 bg-secondary rounded-md">{cls.name} ({cls.schedule})</span>
                  ))}
                  {studentClasses.length === 0 && <span className="text-muted-foreground text-xs">Chưa có lớp</span>}
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-3">
              {studentClasses.map((cls) => cls && (
                <div key={cls.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                  <div>
                    <p className="font-medium text-sm">{cls.name}</p>
                    <p className="text-xs text-muted-foreground">{cls.course} • {cls.startDate} → {cls.endDate}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-success/10 text-success rounded-full">{cls.status}</span>
                </div>
              ))}
              {studentClasses.length === 0 && <p className="text-sm text-muted-foreground">Chưa có lịch sử học.</p>}
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-muted-foreground">Lớp học</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Ngày</th>
                    <th className="text-center py-2 font-medium text-muted-foreground">Trạng thái</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {attendanceRecords
                    .filter((r) => r.studentId === student.id)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((r) => {
                      const cls = classes.find((c) => c.id === r.classId);
                      return (
                        <tr key={r.id}>
                          <td className="py-2">{cls?.name || r.classId}</td>
                          <td className="py-2 text-muted-foreground">{r.date}</td>
                          <td className="py-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              r.status === "present" ? "bg-success/10 text-success" : 
                              r.status === "absent" ? "bg-destructive/10 text-destructive" : 
                              "bg-kpi-orange/10 text-kpi-orange"
                            }`}>
                              {r.status === "present" ? "Có mặt" : r.status === "absent" ? "Vắng" : "Muộn"}
                            </span>
                          </td>
                          <td className="py-2 text-xs text-muted-foreground italic">{r.note || "-"}</td>
                        </tr>
                      );
                    })}
                  {attendanceRecords.filter((r) => r.studentId === student.id).length === 0 && (
                    <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">Chưa có dữ liệu điểm danh.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "exams" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-muted-foreground">Bài thi</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Kỹ năng</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Ngày</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Điểm</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {student.examResults.map((ex, i) => (
                    <tr key={i}>
                      <td className="py-2">{ex.exam}</td>
                      <td className="py-2 text-muted-foreground">{ex.skill}</td>
                      <td className="py-2 text-muted-foreground">{ex.date}</td>
                      <td className="py-2 text-right font-bold">{ex.score}</td>
                    </tr>
                  ))}
                  {student.examResults.length === 0 && (
                    <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">Chưa có kết quả thi.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "tuition" && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-secondary/30 rounded-xl border border-dashed flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Tổng học phí</p>
                    <p className="text-sm font-bold">{formatVND(student.totalFee)}</p>
                  </div>
                </div>
                <div className="p-4 bg-success/5 rounded-xl border border-success/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Đã thanh toán</p>
                    <p className="text-sm font-bold text-success">{formatVND(student.paidFee)}</p>
                  </div>
                </div>
                <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Còn nợ (Công nợ)</p>
                    <p className="text-sm font-bold text-destructive">{formatVND(student.totalFee - student.paidFee)}</p>
                  </div>
                </div>
              </div>

              {/* History Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-[10px] uppercase font-black">
                      <th className="text-left py-3 px-2">Khoản thu (Tháng)</th>
                      <th className="text-center py-3">Hạn thanh toán</th>
                      <th className="text-right py-3">Số tiền</th>
                      <th className="text-right py-3">Đã đóng</th>
                      <th className="text-center py-3">Trạng thái</th>
                      <th className="text-right py-3 px-2">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mockTuitions.filter(t => t.studentId === student.id).map(t => (
                      <tr key={t.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="py-4 px-2 font-bold">{t.month}</td>
                        <td className="py-4 text-center text-muted-foreground">{t.dueDate}</td>
                        <td className="py-4 text-right font-mono font-bold">{formatVND(t.amount)}</td>
                        <td className="py-4 text-right font-mono font-bold text-success">
                          {t.status === "paid" ? formatVND(t.amount) : "0đ"}
                        </td>
                        <td className="py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                            t.status === "paid" ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}>
                            {t.status === "paid" ? "Đã đóng" : "Chưa đóng"}
                          </span>
                        </td>
                        <td className="py-4 text-right px-2">
                          {t.status === "unpaid" && (
                            <button 
                              onClick={() => toast.success(`Đã gửi yêu cầu nhắc thanh toán đến phụ huynh ${student.parentName}`)}
                              className="flex items-center gap-1.5 ml-auto px-3 py-1.5 bg-primary text-white text-[10px] font-black uppercase rounded-lg hover:opacity-90 shadow-sm shadow-primary/20 active:scale-95 transition-all"
                            >
                              <BellRing className="w-3.5 h-3.5" /> Nhắc thanh toán
                            </button>
                          )}
                          {t.status === "paid" && (
                            <span className="text-[10px] text-muted-foreground font-medium italic">Ngày đóng: {t.paymentDate}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" /> Danh sách báo cáo định kỳ
                </h3>
                <button 
                  onClick={() => toast.info("Tính năng demo: Đang mở form tạo báo cáo...")}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-[10px] font-black uppercase rounded-lg hover:opacity-90 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Tạo báo cáo mới
                </button>
              </div>

              {/* Demo Creation Form */}
              <div className="p-5 bg-primary/5 border border-primary/10 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <FilePlus className="w-4 h-4" />
                  <span className="text-xs font-black uppercase">Khởi tạo báo cáo nhanh</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Kỳ học / Giai đoạn</label>
                    <select className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none">
                      <option>Học kỳ 1 - 2024</option>
                      <option>Giữa kỳ 2 - 2024</option>
                      <option>Cuối kỳ 2 - 2024</option>
                      <option>Giai đoạn hè 2025</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Lớp học báo cáo</label>
                    <select className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none">
                      {studentClasses.map(cls => (
                        <option key={cls?.id}>{cls?.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={() => toast.success("Đã tạo báo cáo thành công và gửi thông báo tới phụ huynh!")}
                      className="w-full py-2 bg-primary text-white text-[11px] font-black uppercase rounded-md hover:bg-primary/90 transition-colors shadow-md"
                    >
                      Xác nhận tạo
                    </button>
                  </div>
                </div>
              </div>

              {/* Reports List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Báo cáo Tổng kết Học kỳ 1 - 2024", date: "15/01/2025", type: "Học kỳ" },
                  { title: "Báo cáo Học tập Tháng 12/2024", date: "30/12/2024", type: "Tháng" },
                  { title: "Báo cáo Giữa kỳ 1 - 2024", date: "15/10/2024", type: "Giữa kỳ" },
                  { title: "Báo cáo Đánh giá đầu vào", date: "01/09/2024", type: "Đầu vào" },
                ].map((report, i) => (
                  <div key={i} className="p-4 border rounded-xl hover:border-primary/40 transition-all group cursor-pointer bg-card hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black px-2 py-0.5 bg-secondary text-secondary-foreground rounded uppercase">
                        {report.type}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-bold italic">{report.date}</span>
                    </div>
                    <h4 className="text-sm font-bold group-hover:text-primary transition-colors mb-4">{report.title}</h4>
                    <div className="flex items-center gap-3">
                      <button 
                         onClick={() => setSelectedReport(report)}
                         className="text-[10px] font-black text-primary hover:underline uppercase"
                      >
                         Xem chi tiết
                      </button>
                      <button className="text-[10px] font-black text-muted-foreground hover:text-foreground uppercase">Tải PDF</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Detail Modal */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              {selectedReport?.title}
            </DialogTitle>
            <DialogDescription>
              Báo cáo định kỳ dành cho học sinh: {student.name} ({student.id})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4 pb-4">
            {/* KPI Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-secondary/30 rounded-lg text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Chuyên cần</p>
                <p className="text-lg font-bold text-success">98%</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Điểm trung bình</p>
                <p className="text-lg font-bold text-primary">8.5</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Thái độ</p>
                <p className="text-lg font-bold text-kpi-orange">Rất tốt</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Xếp loại</p>
                <p className="text-lg font-bold">Giỏi</p>
              </div>
            </div>

            {/* Skills Assessment */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-primary" /> Đánh giá kỹ năng
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {[
                  { skill: "Listening", level: "Tiến bộ nhanh", score: 8.5 },
                  { skill: "Speaking", level: "Tự tin, trôi chảy", score: 8.0 },
                  { skill: "Reading", level: "Đọc hiểu tốt", score: 9.0 },
                  { skill: "Writing", level: "Ngữ pháp vững", score: 8.5 },
                ].map((s, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold">{s.skill}</span>
                      <span className="text-muted-foreground">{s.level}</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                       <div className="h-full bg-primary" style={{ width: `${s.score * 10}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher's Comments */}
            <div className="space-y-3 p-4 bg-primary/5 border border-primary/10 rounded-xl relative">
              <h4 className="text-xs font-black uppercase text-primary flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Nhận xét từ giáo viên chủ nhiệm
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                "{student.name} thể hiện tinh thần tham gia lớp học rất tích cực. Bé có khả năng phản xạ nghe nói tốt, đặc biệt là trong các hoạt động trò chơi đội nhóm. Trong kỳ vừa rồi, kỹ năng Reading của bé đã có sự bứt phá rõ rệt với vốn từ vựng phong phú hơn. Ba mẹ nên duy trì khuyến khích bé xem phim tiếng Anh tại nhà để củng cố thêm phát âm tự nhiên."
              </p>
              <div className="flex items-center gap-2 mt-4">
                 <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">SM</div>
                 <div>
                    <p className="text-xs font-bold">Cô Sarah Miller</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black">Giáo viên chủ nhiệm</p>
                 </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-4 border border-dashed rounded-xl space-y-2">
              <h4 className="text-xs font-black uppercase text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" /> Lộ trình & Tư vấn tiếp theo
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Tiếp tục luyện tập các bài tập bổ trợ trên App hàng tuần.</li>
                <li>Đăng ký tham gia câu lạc bộ Speaking vào sáng Chủ nhật.</li>
                <li>Chuẩn bị cho kỳ thi Cambridge MOVERS vào tháng 06/2025.</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <button 
              onClick={() => setSelectedReport(null)}
              className="px-4 py-2 border rounded-lg text-xs font-bold uppercase hover:bg-secondary transition-colors"
            >
              Đóng
            </button>
            <button 
               onClick={() => toast.success("Đang chuẩn bị bản in...")}
               className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase rounded-lg hover:opacity-90 flex items-center gap-2 shadow-md shadow-primary/20"
            >
              <Printer className="w-3.5 h-3.5" /> In báo cáo
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chatter / Log Notes */}
      <div className="chatter-block">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Ghi chú nội bộ</h3>
        </div>
        <div className="space-y-3">
          {student.notes.map((note, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{note.author}</span>
                  <span className="text-xs text-muted-foreground">{note.date}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{note.content}</p>
              </div>
            </div>
          ))}
          {student.notes.length === 0 && <p className="text-sm text-muted-foreground">Chưa có ghi chú.</p>}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Thêm ghi chú..."
            className="flex-1 px-3 py-2 text-sm border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md font-medium hover:opacity-90 transition">
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;
