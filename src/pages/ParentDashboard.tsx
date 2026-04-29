import React, { useState } from "react";
import { useRole } from "@/contexts/RoleContext";
import { ClassDetailContent } from "./ClassDetailPage";
import { useSearchParams } from "react-router-dom";
import { GraduationCap, BookOpen, Clock, MessageCircle, 
  UploadCloud, CheckCircle, AlertCircle, Send, CheckSquare, FileText, ChevronRight, Wallet, Bell, Calendar, ClipboardList, FilePlus, Printer, MessageSquare, Mic, Volume2, PlayCircle, History, Trophy, ClipboardCheck
} from "lucide-react";
import { mockGrades, timekeepingRecords, students, mockHomeworks, mockTuitions, mockPronunciations } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ParentSurveyForm } from "@/components/survey/ParentSurveyForm";

const ParentDashboard = () => {
  const { isParent } = useRole();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "info"; 
  const [selectedReport, setSelectedReport] = useState<any>(null); 
  const [message, setMessage] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);

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
    { id: "finance", label: "Học phí & Lịch sử", icon: Wallet },
    { id: "survey", label: "Khảo sát", icon: ClipboardCheck },
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

            {/* CONTENT: SURVEY (Khảo sát) */}
            {activeTab === "survey" && (
              <div className="p-0 md:p-4 animate-in fade-in slide-in-from-right-4 duration-300 focus:outline-none">
                <ParentSurveyForm />
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
