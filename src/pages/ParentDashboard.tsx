import React, { useState } from "react";
import { useRole } from "@/contexts/RoleContext";
import { mockGrades, timekeepingRecords, students, mockHomeworks, mockTuitions } from "@/data/mockData";
import { ClassDetailContent } from "./ClassDetailPage";
import { useSearchParams } from "react-router-dom";
import { 
  GraduationCap, BookOpen, Clock, MessageCircle, 
  UploadCloud, CheckCircle, AlertCircle, Send, CheckSquare, FileText, ChevronRight, Wallet, Bell, Calendar, ClipboardList, FilePlus, Printer, MessageSquare
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ParentDashboard = () => {
  const { isParent } = useRole();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "info"; 
  const [selectedReport, setSelectedReport] = useState<any>(null); 
  const [message, setMessage] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const child = students[0]; 

  if (!isParent) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-destructive">Không có quyền truy cập</h2>
        <p className="text-muted-foreground mt-2">Tính năng này dành riêng cho Phụ huynh.</p>
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    toast.success("Đã gửi tin nhắn thành công tới Trung tâm!");
    setMessage("");
  };

  const handleUpload = (hwId: string) => {
    setUploadingId(hwId);
    setTimeout(() => {
      setUploadingId(null);
      toast.success("Tải bài tập lên thành công!");
    }, 1500);
  };

  const tabs = [
    { id: "info", label: "Thông tin học viên", icon: GraduationCap },
    { id: "grades", label: "Lớp học & Kết quả", icon: BookOpen },
    { id: "finance", label: "Học phí & Lịch sử", icon: Wallet },
    { id: "reports", label: "Báo cáo định kỳ", icon: ClipboardList },
    { id: "contact", label: "Liên hệ Trung tâm", icon: MessageCircle }
  ];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50/30">
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Main Content Area - NOW FULL WIDTH */}
        <div className="flex-1 bg-transparent overflow-hidden flex flex-col min-h-0">

          <div className="overflow-y-auto flex-1 h-full no-scrollbar px-6 py-4">
            
            {/* CONTENT: INFO */}
            {activeTab === "info" && (
              <div className="p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="font-bold text-lg flex items-center gap-2 mb-4 border-b pb-2">
                  <GraduationCap className="w-5 h-5 text-primary" /> Thông tin hồ sơ học viên
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  {[
                    { label: "Họ và tên học viên", value: child.name, icon: "User" },
                    { label: " Mã định danh (ID)", value: child.id, icon: "Fingerprint" },
                    { label: "Lớp đang theo học", value: child.level, icon: "School", highlight: true },
                    { label: "Giáo viên phụ trách", value: "Cô Sarah Miller", icon: "UserCheck" },
                    { label: "Ngày nhập học", value: "15/01/2025", icon: "Calendar" },
                    { label: "Ngày sinh", value: child.dob, icon: "Baby" },
                    { label: "Người giám hộ", value: "Nguyễn Văn Hùng", icon: "Users" },
                    { label: "Trạng thái tài chính", value: "Đã hoàn tất học phí", icon: "Wallet", badge: true },
                  ].map((item, i) => (
                    <div key={i} className="border-b border-dashed pb-2 hover:bg-primary/5 transition-colors rounded px-1">
                      <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-0.5">{item.label}</p>
                      <div className="flex items-center justify-between">
                        <p className={`font-black text-sm ${item.highlight ? 'text-primary' : ''}`}>{item.value}</p>
                        {item.badge && (
                          <span className="text-[8px] font-black bg-success/10 text-success px-2 py-0.5 rounded-full border border-success/20 uppercase">
                            Đã hoàn tất học phí
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 bg-primary/5 border border-primary/10 p-4 rounded-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
                  <p className="font-black text-[10px] text-primary uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <MessageCircle className="w-3 h-3" /> Ghi chú từ Trung tâm:
                  </p>
                  <p className="text-xs italic text-muted-foreground leading-relaxed">
                    "Học viên có tinh thần học tập tốt, rất tích cực trong các hoạt động ngoại khóa. Phụ huynh vui lòng theo dõi tab Bài tập để nhắc nhở bé hoàn thành bài đúng hạn."
                  </p>
                </div>
              </div>
            )}

            {/* CONTENT: GRADES & CLASS DETAIL */}
            {activeTab === "grades" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                <ClassDetailContent id={child.classIds && child.classIds[0] ? child.classIds[0] : "CLS001"} backButton={false} />
              </div>
            )}

            {/* CONTENT: FINANCE (Học phí) */}
            {activeTab === "finance" && (
              <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300 focus:outline-none">
                <h2 className="font-bold text-xl flex items-center gap-2 mb-8 border-b pb-3">
                  <Wallet className="w-6 h-6 text-primary" /> Lịch sử thanh toán học phí
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="p-6 bg-primary/5 border rounded-md shadow-sm">
                        <p className="text-xs font-bold text-muted-foreground mb-1 uppercase">Gói học phí hiện tại</p>
                        <p className="text-lg font-black text-primary">IELTS Mastery (6 tháng)</p>
                    </div>
                    <div className="p-6 bg-success/5 border border-success/20 rounded-md shadow-sm">
                        <p className="text-xs font-bold text-muted-foreground mb-1 uppercase">Đã thanh toán (Năm nay)</p>
                        <p className="text-lg font-black text-success">45.000.000 VNĐ</p>
                    </div>
                    <div className="p-6 bg-secondary/20 border rounded-md shadow-sm">
                        <p className="text-xs font-bold text-muted-foreground mb-1 uppercase">Trạng thái hiện tại</p>
                        <p className="text-lg font-black text-foreground">Không có nợ phí</p>
                    </div>
                </div>

                <h3 className="font-bold text-sm mb-4 uppercase text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Danh sách hóa đơn chi tiết
                </h3>
                <div className="overflow-x-auto rounded-md shadow-sm border">
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-secondary/40 text-muted-foreground border-b">
                            <tr>
                                <th className="px-5 py-4 text-left font-bold uppercase text-[10px] tracking-widest border-r">Kỳ hạn đóng phí</th>
                                <th className="px-5 py-4 text-right font-bold uppercase text-[10px] tracking-widest border-r">Số tiền</th>
                                <th className="px-5 py-4 text-center font-bold uppercase text-[10px] tracking-widest border-r">Hạn chót</th>
                                <th className="px-5 py-4 text-center font-bold uppercase text-[10px] tracking-widest border-r">Trạng thái</th>
                                <th className="px-5 py-4 text-left font-bold uppercase text-[10px] tracking-widest">Ngày nộp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {mockTuitions.map((bill) => (
                                <tr key={bill.id} className="hover:bg-primary/5 transition-colors">
                                    <td className="px-5 py-4 font-bold border-r">{bill.month}</td>
                                    <td className="px-5 py-4 text-right font-black border-r text-foreground">{bill.amount.toLocaleString()} đ</td>
                                    <td className="px-5 py-4 text-center border-r font-medium text-muted-foreground">{bill.dueDate}</td>
                                    <td className="px-5 py-4 text-center border-r">
                                        <span className="inline-block px-2 py-0.5 bg-success/10 text-success text-[10px] font-black rounded border border-success/30 uppercase">
                                            Đã nộp
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-muted-foreground font-medium italic">{bill.paymentDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="leading-relaxed">
                        <strong>Lưu ý:</strong> Hóa đơn chính thức sẽ được gửi trực tiếp qua Email đăng ký ngay khi hệ thống xác nhận thanh toán thành công. Nếu có sai sót về số tiền, vui lòng liên hệ bộ phận Kế toán của MENGLISH qua hotline 1900 6789.
                    </p>
                </div>
              </div>
            )}

            {/* CONTENT: REPORTS (Báo cáo) */}
            {activeTab === "reports" && (
              <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300 focus:outline-none">
                <h2 className="font-bold text-xl flex items-center gap-2 mb-8 border-b pb-3">
                  <ClipboardList className="w-6 h-6 text-primary" /> Báo cáo học tập & Đánh giá định kỳ
                </h2>

                <div className="mb-8 p-6 bg-primary/5 border border-primary/10 rounded-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <FilePlus className="w-16 h-16 text-primary" />
                   </div>
                   <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="max-w-md">
                         <p className="font-black text-xs text-primary uppercase tracking-widest mb-1.5">Yêu cầu báo cáo mới</p>
                         <p className="text-sm text-muted-foreground leading-relaxed">
                            Quý phụ huynh có thể yêu cầu Trung tâm tổng hợp và gửi báo cáo học tập mới nhất theo giai đoạn mong muốn.
                         </p>
                      </div>
                      <button 
                         onClick={() => toast.success("Yêu cầu của bạn đã được gửi tới giáo viên chủ nhiệm!")}
                         className="px-6 py-2.5 bg-primary text-white text-[11px] font-black uppercase rounded-xl hover:scale-105 transition-all shadow-md shadow-primary/20"
                      >
                         Gửi yêu cầu ngay
                      </button>
                   </div>
                </div>

                <h3 className="font-bold text-sm mb-6 uppercase text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Danh sách báo cáo đã hoàn thành
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { title: "Báo cáo Tổng kết Học kỳ 1 - 2024", date: "15/01/2025", type: "Học kỳ", status: "Mới" },
                        { title: "Báo cáo Học tập Tháng 12/2024", date: "30/12/2024", type: "Tháng", status: "Vừa đọc" },
                        { title: "Báo cáo Giữa kỳ 1 - 2024", date: "15/10/2024", type: "Giữa kỳ", status: "Đã xem" },
                        { title: "Báo cáo Đánh giá đầu vào", date: "01/09/2024", type: "Đầu vào", status: "Lưu trữ" },
                    ].map((report, i) => (
                        <div key={i} className="group p-6 border rounded-2xl hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg bg-card relative overflow-hidden">
                            {report.status === "Mới" && (
                               <div className="absolute top-0 right-0 bg-rose-500 text-white text-[8px] font-black uppercase px-3 py-1 rounded-bl-xl shadow-sm">
                                  {report.status}
                               </div>
                            )}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                                    <ClipboardList className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{report.type}</span>
                                    <h4 className="font-bold text-sm leading-tight mt-0.5">{report.title}</h4>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-dashed">
                                <span className="text-[10px] text-muted-foreground font-medium italic">Ngày nhận: {report.date}</span>
                                <div className="flex items-center gap-3">
                                   <button 
                                      onClick={() => setSelectedReport(report)}
                                      className="text-[10px] font-black text-primary hover:underline uppercase tracking-tight"
                                   >
                                      XEM ONLINE
                                   </button>
                                   <button className="text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-tight">TẢI VỀ</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            )}
            {/* CONTENT: NEWS (Tin tức) */}
            {activeTab === "news" && (
              <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300 focus:outline-none h-full">
                <h2 className="font-bold text-xl flex items-center gap-2 mb-8 border-b pb-3">
                  <Bell className="w-6 h-6 text-primary" /> Tin tức & Sự kiện nội bộ
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
                    {[
                        { title: "Chào mừng Ngày Giải phóng 30/04 & 01/05", date: "24/03/2026", desc: "Trung tâm thông báo lịch nghỉ lễ cho học sinh từ ngày 30/04 đến hết 03/05. Các lớp sẽ quay lại học bình thường vào 04/05.", type: "Thông báo" },
                        { title: "Workshop: Luyện kỹ năng Speaking cùng chuyên gia", date: "22/03/2026", desc: "Sự kiện đặc biệt dành riêng cho học viên IELTS Mastery vào sáng Chủ Nhật này. Đăng ký tham gia ngay tại quầy lễ tân.", type: "Sự kiện" },
                        { title: "Ra mắt tính năng Cổng thông tin Phụ huynh Pro", date: "20/03/2026", desc: "MENGLISH chính thức cập nhật giao diện dashboard mới giúp phụ huynh theo dõi con em dễ dàng hơn trên thiết bị di động.", type: "Cập nhật" },
                        { title: "Tin tuyển sinh: Khoá học hè Summer Fun 2026", date: "15/03/2026", desc: "Đăng ký sớm nhận ưu đãi 20% học phí trọn gói cùng bộ quà tặng độc quyền từ Menglish.", type: "Khuyến mãi" },
                    ].map((news, i) => (
                        <div key={i} className="group border rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col hover:border-primary/50 transition-all cursor-pointer hover:shadow-md">
                            <div className="h-32 bg-secondary/30 relative flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/20" />
                                <Bell className="w-12 h-12 text-primary/20 group-hover:scale-110 transition-transform" />
                                <span className="absolute top-4 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-black rounded uppercase shadow-sm">
                                    {news.type}
                                </span>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="text-[10px] text-muted-foreground font-bold mb-2 uppercase tracking-widest">{news.date}</div>
                                <h3 className="font-bold text-lg mb-3 leading-snug group-hover:text-primary transition-colors">{news.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-6">{news.desc}</p>
                                <button className="mt-auto flex items-center gap-2 text-xs font-black text-primary hover:underline self-start">
                                    CHI TIẾT <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            )}

            {/* CONTENT: CONTACT */}
            {activeTab === "contact" && (
              <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col focus:outline-none">
                <h2 className="font-bold text-xl flex items-center gap-2 mb-6 border-b pb-3 shrink-0">
                  <MessageCircle className="w-6 h-6 text-primary" /> Hỗ trợ & Giải đáp thắc mắc
                </h2>
                
                <div className="flex-1 flex flex-col md:flex-row gap-8 min-h-0">
                  <div className="md:w-1/3 space-y-6 shrink-0">
                    <div className="bg-primary/5 border border-primary/20 p-6 rounded-md shadow-sm">
                      <h3 className="font-bold text-sm mb-4 text-primary uppercase tracking-widest border-b pb-2">Thông tin liên hệ</h3>
                      <div className="space-y-5">
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Địa điểm theo học</p>
                            <p className="text-sm font-bold">Cơ sở Menglish Ba Đình - 45 Liễu Giai</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Cán bộ giáo vụ (Sarah Miller)</p>
                            <p className="text-sm font-bold">Hotline: 090 123 4567</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Văn phòng tư vấn</p>
                            <p className="text-sm font-bold">Giờ làm việc: 08:30 - 21:00</p>
                          </div>
                      </div>
                    </div>
                    
                    <div className="p-5 text-center border-2 border-dashed border-muted rounded-md opacity-60">
                        <p className="text-xs font-medium text-muted-foreground">Bạn cần thay đổi thông tin liên lạc hoặc đăng ký xe đưa đón?</p>
                        <button className="mt-3 text-xs font-black text-primary hover:underline">LIÊN HỆ PHÒNG ĐÀO TẠO</button>
                    </div>
                  </div>

                  <form onSubmit={handleSendMessage} className="flex-1 flex flex-col gap-5 min-h-[400px]">
                    <div className="flex-1 border rounded-md p-6 bg-secondary/5 flex flex-col overflow-y-auto space-y-6 overflow-hidden shadow-inner relative">
                      <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-secondary/50 to-transparent pointer-events-none" />
                      
                      <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest relative py-4">
                        <span className="bg-secondary/5 px-4 relative z-10 font-black">Lịch sử hội thoại</span>
                        <span className="absolute left-0 right-0 top-1/2 h-px bg-border -z-0"></span>
                      </p>
                      
                      <div className="flex gap-4 max-w-[90%]">
                        <div className="w-9 h-9 rounded-md bg-primary flex shrink-0 items-center justify-center text-primary-foreground font-black text-sm shadow-md">
                          TT
                        </div>
                        <div className="bg-background border p-4 rounded-md rounded-tl-none text-sm shadow-sm leading-relaxed border-primary/20">
                          Xin chào Phụ huynh, tôi là Sarah Miller - cố vấn học tập của bé <strong>{child.name}</strong>. Rất vui được hỗ trợ gia đình mình qua kênh trò chuyện mới này. Anh/chị cần hỏi về tình hình hôm nay hay muốn trao đổi thêm về lộ trình sắp tới ạ?
                        </div>
                      </div>

                      <div className="flex gap-4 max-w-[90%] self-end flex-row-reverse">
                        <div className="w-9 h-9 rounded-md bg-secondary flex shrink-0 items-center justify-center text-secondary-foreground font-black text-sm shadow-md">
                          PH
                        </div>
                        <div className="bg-primary/5 border border-primary/20 p-4 rounded-md rounded-tr-none text-sm shadow-sm leading-relaxed">
                          Chào cô Sarah, cô cho mẹ hỏi bài thi thử hôm qua của Minh Anh kết quả như thế nào cô nhỉ?
                        </div>
                      </div>

                      <div className="flex gap-4 max-w-[90%]">
                        <div className="w-9 h-9 rounded-md bg-primary flex shrink-0 items-center justify-center text-primary-foreground font-black text-sm shadow-md">
                          TT
                        </div>
                        <div className="bg-background border p-4 rounded-md rounded-tl-none text-sm shadow-sm leading-relaxed border-primary/20">
                          Dạ bé được 7.5 IELTS Speaking rồi mẹ nhé, phần Listening cần cố gắng hơn chút ạ. Mẹ xem chi tiết ở Tab ĐIỂM SỐ nhé.
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 shrink-0 mt-2 p-1">
                      <input 
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Gửi yêu cầu hoặc thắc mắc cho giáo viên tại đây..."
                        className="flex-1 border-2 border-primary/10 rounded-md px-5 py-3.5 text-sm font-medium focus:outline-none focus:border-primary/50 shadow-sm transition-all focus:ring-1 focus:ring-primary/20"
                      />
                      <button 
                        type="submit"
                        disabled={!message.trim()}
                        className="px-8 bg-primary text-primary-foreground font-black text-sm rounded-md flex items-center justify-center gap-3 hover:bg-primary/95 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                      >
                        Gửi Ngay <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
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
              Báo cáo định kỳ dành cho học sinh: Đăng Khoa Bing (STU001)
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
                "Đăng Khoa Bing thể hiện tinh thần tham gia lớp học rất tích cực. Bé có khả năng phản xạ nghe nói tốt, đặc biệt là trong các hoạt động trò chơi đội nhóm. Trong kỳ vừa rồi, kỹ năng Reading của bé đã có sự bứt phá rõ rệt với vốn từ vựng phong phú hơn. Ba mẹ nên duy trì khuyến khích bé xem phim tiếng Anh tại nhà để củng cố thêm phát âm tự nhiên."
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
    </div>
  );
};

export default ParentDashboard;
