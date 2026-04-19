import { useParams, useNavigate } from "react-router-dom";
import { students, classes, attendanceRecords, mockTuitions, branches } from "@/data/mockData";
import { ArrowLeft, BookOpen, CalendarCheck, DollarSign, MessageSquare, User, BellRing, Receipt, CheckCircle2, Clock, ClipboardList, FilePlus, Plus, FileText, Printer, CheckCircle, Wallet, Landmark, QrCode, Banknote, Percent, StickyNote } from "lucide-react";
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

  // ---- RECEIPT (Phiếu thu học phí) STATE ----
  const [receiptTuition, setReceiptTuition] = useState<any>(null); // tuition row đang tạo phiếu (null = đóng)
  const [receiptForm, setReceiptForm] = useState({
    receiptCode: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    // Các khoản thu
    tuitionAmount: 0,         // Học phí gốc
    materialAmount: 0,        // Học liệu / sách vở
    examFee: 0,               // Phí thi (Cambridge/IELTS nội bộ)
    otherFee: 0,              // Khoản khác (đồng phục, hoạt động...)
    otherFeeNote: "",
    // Giảm trừ
    discountAmount: 0,
    discountReason: "",        // Lý do giảm (ưu đãi sớm, anh em, renew...)
    // Thanh toán
    paymentMethod: "cash" as "cash" | "transfer" | "qr" | "card",
    bankRef: "",               // Mã giao dịch (nếu CK/QR)
    payerName: "",             // Người nộp (thường là phụ huynh)
    payerPhone: "",
    // Kỳ thu
    forMonth: "",              // Tháng áp dụng
    classId: "",               // Lớp áp dụng
    // Thông tin phát hành
    branchId: "BR001",
    collectedBy: "Admin",      // Thu ngân / Học vụ
    note: "",
    issueInvoice: false,       // Có xuất hoá đơn VAT không
  });
  const openReceiptDialog = (tuition: any) => {
    const now = new Date();
    const code = `PT-${student?.id || "STU"}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 900) + 100)}`;
    setReceiptForm(f => ({
      ...f,
      receiptCode: code,
      paymentDate: now.toISOString().slice(0, 10),
      tuitionAmount: tuition.amount || 0,
      materialAmount: 0,
      examFee: 0,
      otherFee: 0,
      otherFeeNote: "",
      discountAmount: 0,
      discountReason: "",
      paymentMethod: "cash",
      bankRef: "",
      payerName: student?.parentName || "",
      payerPhone: student?.parentPhone || "",
      forMonth: tuition.month || "",
      classId: student?.classIds?.[0] || "",
      branchId: "BR001",
      collectedBy: "Admin",
      note: "",
      issueInvoice: false,
    }));
    setReceiptTuition(tuition);
  };
  const receiptSubtotal = receiptForm.tuitionAmount + receiptForm.materialAmount + receiptForm.examFee + receiptForm.otherFee;
  const receiptTotal = Math.max(0, receiptSubtotal - receiptForm.discountAmount);
  const handleConfirmReceipt = () => {
    if (receiptTotal <= 0) { toast.error("Tổng thanh toán phải lớn hơn 0"); return; }
    if ((receiptForm.paymentMethod === "transfer" || receiptForm.paymentMethod === "qr") && !receiptForm.bankRef.trim()) {
      toast.error("Vui lòng nhập mã giao dịch chuyển khoản"); return;
    }
    toast.success(`Đã tạo phiếu thu ${receiptForm.receiptCode} · ${new Intl.NumberFormat("vi-VN").format(receiptTotal)}đ`);
    setReceiptTuition(null);
  };

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
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <Receipt className="w-4 h-4" /> Chi tiết các khoản thu
                </h3>
                <button
                  onClick={() => {
                    const firstUnpaid = mockTuitions.find(t => t.studentId === student.id && t.status === "unpaid");
                    openReceiptDialog(firstUnpaid || { id: "adhoc", studentId: student.id, month: "Thu khác", amount: 0, dueDate: new Date().toISOString().slice(0, 10), status: "unpaid" });
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20"
                >
                  <Receipt className="w-3.5 h-3.5" /> Tạo phiếu thu học phí
                </button>
              </div>

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
                          <div className="flex items-center justify-end gap-2">
                            {t.status === "unpaid" && (
                              <>
                                <button
                                  onClick={() => toast.success(`Đã gửi yêu cầu nhắc thanh toán đến phụ huynh ${student.parentName}`)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-primary/30 text-primary text-[10px] font-black uppercase rounded-lg hover:bg-primary/5 active:scale-95 transition-all"
                                >
                                  <BellRing className="w-3.5 h-3.5" /> Nhắc TT
                                </button>
                                <button
                                  onClick={() => openReceiptDialog(t)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
                                >
                                  <Receipt className="w-3.5 h-3.5" /> Tạo phiếu thu
                                </button>
                              </>
                            )}
                            {t.status === "paid" && (
                              <span className="text-[10px] text-muted-foreground font-medium italic">Ngày đóng: {t.paymentDate}</span>
                            )}
                          </div>
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

      {/* ============ RECEIPT DIALOG - Tạo phiếu thu học phí ============ */}
      <Dialog open={!!receiptTuition} onOpenChange={(o) => !o && setReceiptTuition(null)}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              Tạo phiếu thu học phí
            </DialogTitle>
            <DialogDescription className="flex items-center gap-3 text-xs">
              <span>HS: <b className="text-foreground">{student.name}</b> ({student.id})</span>
              <span className="text-muted-foreground">·</span>
              <span>Mã phiếu: <b className="font-mono text-emerald-700">{receiptForm.receiptCode}</b></span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* ---- Block: Kỳ thu & Lớp ---- */}
            <div className="col-span-2 grid grid-cols-3 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Kỳ thu (tháng)</label>
                <input
                  type="text"
                  value={receiptForm.forMonth}
                  onChange={e => setReceiptForm(f => ({ ...f, forMonth: e.target.value }))}
                  placeholder="Ví dụ: Tháng 04/2025"
                  className="mt-1 w-full h-9 px-2 rounded-md border border-slate-200 text-sm bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Lớp áp dụng</label>
                <select
                  value={receiptForm.classId}
                  onChange={e => setReceiptForm(f => ({ ...f, classId: e.target.value }))}
                  className="mt-1 w-full h-9 px-2 rounded-md border border-slate-200 text-sm bg-white"
                >
                  {student.classIds.map(cid => {
                    const c = classes.find(x => x.id === cid);
                    return <option key={cid} value={cid}>{c?.name || cid}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Ngày thu</label>
                <input
                  type="date"
                  value={receiptForm.paymentDate}
                  onChange={e => setReceiptForm(f => ({ ...f, paymentDate: e.target.value }))}
                  className="mt-1 w-full h-9 px-2 rounded-md border border-slate-200 text-sm bg-white"
                />
              </div>
            </div>

            {/* ---- Block: Các khoản thu ---- */}
            <div className="col-span-2 p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 space-y-2">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5" /> Các khoản thu
              </h4>
              {[
                { key: "tuitionAmount", label: "Học phí", required: true },
                { key: "materialAmount", label: "Học liệu / sách vở" },
                { key: "examFee", label: "Phí thi (Cambridge/IELTS nội bộ)" },
              ].map(row => (
                <div key={row.key} className="grid grid-cols-[1fr,180px] items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">{row.label}{row.required && <span className="text-rose-500"> *</span>}</span>
                  <input
                    type="text"
                    value={new Intl.NumberFormat("vi-VN").format((receiptForm as any)[row.key] || 0)}
                    onChange={e => {
                      const v = Number(e.target.value.replace(/\D/g, "")) || 0;
                      setReceiptForm(f => ({ ...f, [row.key]: v } as any));
                    }}
                    className="h-9 px-2 rounded-md border border-emerald-200 text-sm text-right font-mono font-bold bg-white"
                  />
                </div>
              ))}
              <div className="grid grid-cols-[1fr,180px] items-start gap-2">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700">Khoản khác (đồng phục, hoạt động...)</span>
                  <input
                    type="text"
                    value={receiptForm.otherFeeNote}
                    onChange={e => setReceiptForm(f => ({ ...f, otherFeeNote: e.target.value }))}
                    placeholder="Ghi chú khoản khác"
                    className="w-full h-8 px-2 rounded-md border border-slate-200 text-xs bg-white"
                  />
                </div>
                <input
                  type="text"
                  value={new Intl.NumberFormat("vi-VN").format(receiptForm.otherFee)}
                  onChange={e => {
                    const v = Number(e.target.value.replace(/\D/g, "")) || 0;
                    setReceiptForm(f => ({ ...f, otherFee: v }));
                  }}
                  className="h-9 px-2 rounded-md border border-emerald-200 text-sm text-right font-mono font-bold bg-white"
                />
              </div>
            </div>

            {/* ---- Block: Giảm trừ ---- */}
            <div className="col-span-2 p-3 rounded-lg border border-amber-200 bg-amber-50/40 grid grid-cols-[1fr,180px] gap-2 items-start">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5" /> Giảm trừ / Ưu đãi
                </label>
                <input
                  type="text"
                  value={receiptForm.discountReason}
                  onChange={e => setReceiptForm(f => ({ ...f, discountReason: e.target.value }))}
                  placeholder="Lý do: ưu đãi tái tục, anh em ruột, voucher..."
                  className="w-full h-9 px-2 rounded-md border border-amber-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-amber-700">Số tiền giảm</label>
                <input
                  type="text"
                  value={new Intl.NumberFormat("vi-VN").format(receiptForm.discountAmount)}
                  onChange={e => {
                    const v = Number(e.target.value.replace(/\D/g, "")) || 0;
                    setReceiptForm(f => ({ ...f, discountAmount: v }));
                  }}
                  className="mt-1 h-9 px-2 rounded-md border border-amber-200 text-sm text-right font-mono font-bold bg-white w-full"
                />
              </div>
            </div>

            {/* ---- Block: Phương thức thanh toán ---- */}
            <div className="col-span-2 p-3 rounded-lg border border-sky-200 bg-sky-50/40 space-y-2">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" /> Phương thức thanh toán
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { v: "cash", label: "Tiền mặt", icon: Banknote },
                  { v: "transfer", label: "Chuyển khoản", icon: Landmark },
                  { v: "qr", label: "QR / Ví", icon: QrCode },
                  { v: "card", label: "Thẻ (POS)", icon: Wallet },
                ].map(({ v, label, icon: Icon }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setReceiptForm(f => ({ ...f, paymentMethod: v as any }))}
                    className={`h-11 rounded-md border-2 flex flex-col items-center justify-center gap-0.5 text-[10px] font-black uppercase transition-all ${
                      receiptForm.paymentMethod === v
                        ? "border-sky-500 bg-sky-500 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-sky-300"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
              {(receiptForm.paymentMethod === "transfer" || receiptForm.paymentMethod === "qr" || receiptForm.paymentMethod === "card") && (
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500">
                    Mã giao dịch / 4 số cuối thẻ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={receiptForm.bankRef}
                    onChange={e => setReceiptForm(f => ({ ...f, bankRef: e.target.value }))}
                    placeholder="VD: FT25110098765 hoặc ****1234"
                    className="mt-1 w-full h-9 px-2 rounded-md border border-sky-200 text-sm font-mono bg-white"
                  />
                </div>
              )}
            </div>

            {/* ---- Block: Người nộp & Phát hành ---- */}
            <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Người nộp tiền
              </h4>
              <input
                type="text"
                value={receiptForm.payerName}
                onChange={e => setReceiptForm(f => ({ ...f, payerName: e.target.value }))}
                placeholder="Họ tên người nộp"
                className="w-full h-9 px-2 rounded-md border border-slate-200 text-sm"
              />
              <input
                type="text"
                value={receiptForm.payerPhone}
                onChange={e => setReceiptForm(f => ({ ...f, payerPhone: e.target.value }))}
                placeholder="SĐT người nộp"
                className="w-full h-9 px-2 rounded-md border border-slate-200 text-sm"
              />
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-2">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Phát hành phiếu
              </h4>
              <select
                value={receiptForm.branchId}
                onChange={e => setReceiptForm(f => ({ ...f, branchId: e.target.value }))}
                className="w-full h-9 px-2 rounded-md border border-slate-200 text-sm bg-white"
              >
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <input
                type="text"
                value={receiptForm.collectedBy}
                onChange={e => setReceiptForm(f => ({ ...f, collectedBy: e.target.value }))}
                placeholder="Người lập phiếu / Thu ngân"
                className="w-full h-9 px-2 rounded-md border border-slate-200 text-sm"
              />
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={receiptForm.issueInvoice}
                  onChange={e => setReceiptForm(f => ({ ...f, issueInvoice: e.target.checked }))}
                  className="w-4 h-4 accent-emerald-600"
                />
                Xuất hóa đơn VAT kèm theo
              </label>
            </div>

            {/* ---- Ghi chú ---- */}
            <div className="col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5" /> Ghi chú nội bộ
              </label>
              <textarea
                value={receiptForm.note}
                onChange={e => setReceiptForm(f => ({ ...f, note: e.target.value }))}
                rows={2}
                placeholder="VD: Đóng bù tháng 3, còn nợ học liệu..."
                className="mt-1 w-full px-2 py-1.5 rounded-md border border-slate-200 text-sm resize-none"
              />
            </div>

            {/* ---- Tổng kết ---- */}
            <div className="col-span-2 p-4 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 text-white space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="opacity-80">Tạm tính (học phí + học liệu + phí khác)</span>
                <span className="font-mono font-bold">{new Intl.NumberFormat("vi-VN").format(receiptSubtotal)}đ</span>
              </div>
              {receiptForm.discountAmount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="opacity-80">Giảm trừ</span>
                  <span className="font-mono font-bold text-amber-200">- {new Intl.NumberFormat("vi-VN").format(receiptForm.discountAmount)}đ</span>
                </div>
              )}
              <div className="h-px bg-white/20 my-1" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider">Tổng thanh toán</span>
                <span className="text-2xl font-black font-mono">{new Intl.NumberFormat("vi-VN").format(receiptTotal)}đ</span>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-3 mt-4 flex-row justify-end gap-2">
            <button
              onClick={() => setReceiptTuition(null)}
              className="px-4 py-2 rounded-md border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Huỷ
            </button>
            <button
              onClick={() => { toast.info("Đã lưu nháp phiếu thu (demo)"); }}
              className="px-4 py-2 rounded-md border border-primary/30 text-sm font-bold text-primary hover:bg-primary/5"
            >
              Lưu nháp
            </button>
            <button
              onClick={handleConfirmReceipt}
              className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-black uppercase hover:bg-emerald-700 flex items-center gap-2 shadow-sm shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-4 h-4" /> Xác nhận & In phiếu
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDetailPage;
