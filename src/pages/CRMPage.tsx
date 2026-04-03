import { useState, useMemo } from "react";
import { leads, type Lead, salesData } from "@/data/mockData";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { 
  Phone, Mail, Calendar, DollarSign, Plus, Loader2, CheckCircle2, 
  UserPlus, Undo2, MousePointer2, Briefcase, LayoutGrid, List,
  LineChart, Download, Search, Filter, RotateCcw, MessageSquareText,
  RefreshCw, User, ClipboardList, Clock, ChevronDown, X, BookOpen
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Stage = Lead["stage"];

const stageConfig: Record<Stage, { label: string; colorClass: string }> = {
  new: { label: "Lead mới", colorClass: "bg-blue-100 text-blue-700" },
  nurturing: { label: "Đang chăm sóc", colorClass: "bg-amber-100 text-amber-700" },
  test: { label: "Đã chốt (chờ xếp lớp)", colorClass: "bg-purple-100 text-purple-700" },
  closed: { label: "Đã xếp lớp (Học viên)", colorClass: "bg-emerald-100 text-emerald-700" },
};

const stages: Stage[] = ["new", "nurturing", "test", "closed"];

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n) + "đ";

const REPORT_MONTHS = Array.from({ length: 24 }).map((_, i) => {
  const d = new Date(2026, 2 - i, 1);
  return `${d.getMonth() + 1}/${d.getFullYear()}`;
});

const categoryLabels: Record<Stage | "all", string> = {
  all: "TẤT CẢ (HIỂN THỊ HẾT)",
  new: "LEAD MỚI",
  nurturing: "ĐANG CHÂM SÓC",
  test: "ĐÃ CHỐT (CHỜ XẾP LỚP)",
  closed: "ĐÃ XẾP LỚP (HỌC VIÊN)"
};

const CRMPage = () => {
  const [items, setItems] = useState<Lead[]>([...leads]);
  const [viewMode, setViewMode] = useState<"table" | "kanban" | "sales">("table");
  const [activeCategory, setActiveCategory] = useState<Stage | "all">("all");
  const [selectedSalesMonth, setSelectedSalesMonth] = useState(REPORT_MONTHS[0]);
   const [isOpen, setIsOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterStaff, setFilterStaff] = useState("all");

  const moveLeadToNextStage = (id: string) => {
    setItems((prev) => {
      return prev.map((l) => {
        if (l.id === id) {
          const currentIndex = stages.indexOf(l.stage);
          const nextIndex = (currentIndex + 1) % stages.length;
          const nextStage = stages[nextIndex];
          toast.success(`Đã chuyển ${l.name} sang ${stageConfig[nextStage].label}`);
          return { ...l, stage: nextStage };
        }
        return l;
      });
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const targetStage = result.destination.droppableId as Lead["stage"];
    setItems((prev) =>
      prev.map((l) => (l.id === result.draggableId ? { ...l, stage: targetStage } : l))
    );
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchCat = activeCategory === "all" ? true : item.stage === activeCategory;
      const matchSearch = searchTerm ? 
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         item.phone.includes(searchTerm)) : true;
      const matchSource = filterSource !== "all" ? item.source === filterSource : true;
      const matchGroup = filterGroup !== "all" ? item.customerGroup === filterGroup : true;
      const matchProgram = filterProgram !== "all" ? item.program.name === filterProgram : true;
      const matchStaff = filterStaff !== "all" ? item.assignee === filterStaff : true;
      
      return matchCat && matchSearch && matchSource && matchGroup && matchProgram && matchStaff;
    });
  }, [items, activeCategory, searchTerm, filterSource, filterGroup, filterProgram, filterStaff]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(item => item.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Đã thêm khách hàng mới!");
    setIsOpen(false);
  };

  const openDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);
  };

  const renderSalesReport = () => {
    const filteredSales = salesData.filter(d => d.month === selectedSalesMonth);
    const displaySales = filteredSales.length > 0 ? filteredSales : salesData.slice(0, 4); // Default to some data if empty for demo

    const totalStaff = displaySales.length;
    const totalCustomers = displaySales.reduce((acc, curr) => acc + curr.customers, 0);
    const totalSales = displaySales.reduce((acc, curr) => acc + curr.saleAmount, 0);
    const totalCommission = displaySales.reduce((acc, curr) => acc + curr.totalCommission, 0);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            <span className="font-black text-sm text-slate-700 uppercase italic">Bảng tổng hợp doanh số nhân viên</span>
          </div>
          <div className="flex items-center gap-2">
             <Select value={selectedSalesMonth} onValueChange={(val) => setSelectedSalesMonth(val)}>
               <SelectTrigger className="h-8 w-[140px] text-[10px] font-black bg-white rounded-lg border-slate-200 text-slate-700">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 {REPORT_MONTHS.map(m => (
                   <SelectItem key={m} value={m} className="text-[10px] font-bold">
                     {m}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 sticky top-0 z-10">
                <th className="p-3 text-[10px] font-black uppercase text-slate-400 border-b">STT</th>
                <th className="p-3 text-[10px] font-black uppercase text-slate-400 border-b">Nhân viên</th>
                <th className="p-3 text-[10px] font-black uppercase text-slate-400 border-b text-center">Khách hàng</th>
                <th className="p-3 text-[10px] font-black uppercase text-slate-400 border-b text-right text-blue-600">Doanh số (Sale)</th>
                <th className="p-3 text-[10px] font-black uppercase text-slate-400 border-b text-center">Hoa hồng (%)</th>
                <th className="p-3 text-[10px] font-black uppercase text-slate-400 border-b text-center">KPI (%)</th>
                <th className="p-3 text-[10px] font-black uppercase text-slate-400 border-b text-right text-emerald-600">Tổng nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displaySales.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-xs text-slate-400">{index + 1}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                        {item.staffName.split(' ').pop()?.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{item.staffName}</span>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-center font-bold text-primary">{item.customers}</td>
                  <td className="p-3 text-xs text-right font-black text-blue-600">{formatVND(item.saleAmount)}</td>
                   <td className="p-3 text-xs text-center text-slate-400">{item.commissionRate}%</td>
                  <td className="p-3 text-xs text-center">
                    <div className="flex flex-col items-center gap-1">
                        <span className={`font-black ${item.kpi >= 80 ? 'text-emerald-500' : item.kpi >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{item.kpi}%</span>
                        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${item.kpi >= 80 ? 'bg-emerald-500' : item.kpi >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${item.kpi}%` }}></div>
                        </div>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-right font-black text-emerald-600">{formatVND(item.totalCommission)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/80 font-bold border-t-2 border-slate-100">
              <tr>
                <td className="p-3 text-[10px] text-slate-500 uppercase">TỔNG CỘNG</td>
                <td className="p-3 text-xs text-slate-600">{totalStaff} nhân viên</td>
                <td className="p-3 text-xs text-center text-primary underline underline-offset-4 decoration-dotted">{totalCustomers} khách hàng</td>
                <td className="p-3 text-xs text-right text-blue-600">{formatVND(totalSales)}</td>
                 <td className="p-3 text-xs text-center text-slate-400">---</td>
                <td className="p-3 text-xs text-center text-slate-400">---</td>
                <td className="p-3 text-xs text-right text-emerald-600 underline underline-offset-4">{formatVND(totalCommission)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 flex flex-col h-full bg-[#f8f9fa]">
      <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Select value={activeCategory} onValueChange={(val) => setActiveCategory(val as Stage | "all")}>
              <SelectTrigger className="w-[240px] border-none shadow-none bg-slate-100/50 rounded-xl h-10 font-black text-slate-800 focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="font-bold text-xs">{label.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
            <button 
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === "table" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <List className="w-3.5 h-3.5" />
              Danh sách
            </button>
            <button 
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === "kanban" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button 
              onClick={() => setViewMode("sales")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === "sales" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <LineChart className="w-3.5 h-3.5" />
              Báo cáo doanh số
            </button>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-black uppercase tracking-wider hover:opacity-90 transition-all shadow-md shadow-primary/20">
                <Plus className="w-4 h-4" />
                Thêm mới
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-tight text-primary border-b pb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Đăng ký học / Hồ sơ mới
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5 py-6">
                {/* Section 1: Thông tin cá nhân */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Họ tên (*)</Label>
                    <Input placeholder="Nhập tên của bạn" className="h-10 bg-slate-50 border-slate-200 rounded-xl" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Giới tính</Label>
                    <RadioGroup defaultValue="nam" className="flex items-center gap-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nam" id="nam" />
                        <Label htmlFor="nam" className="text-xs font-bold text-slate-600">Nam</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nu" id="nu" />
                        <Label htmlFor="nu" className="text-xs font-bold text-slate-600">Nữ</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày sinh</Label>
                    <Input placeholder="Nhập ngày sinh của bạn" className="h-10 bg-slate-50 border-slate-200 rounded-xl" />
                    <p className="text-[9px] text-slate-400 italic">Ví dụ: 26/04/2009</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Điện thoại (*)</Label>
                    <Input placeholder="Nhập điện thoại của bạn" className="h-10 bg-slate-50 border-slate-200 rounded-xl" />
                  </div>
                </div>

                {/* Section 2: Thông tin liên hệ & giáo dục */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</Label>
                    <Input placeholder="Nhập email của bạn" className="h-10 bg-slate-50 border-slate-200 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Địa chỉ</Label>
                    <Input placeholder="Nhập địa chỉ của bạn" className="h-10 bg-slate-50 border-slate-200 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trường</Label>
                    <Input placeholder="Nhập tên trường" className="h-10 bg-slate-50 border-slate-200 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phụ huynh</Label>
                    <Input placeholder="Nhập tên phụ huynh" className="h-10 bg-slate-50 border-slate-200 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Facebook</Label>
                    <Input placeholder="Nhập facebook" className="h-10 bg-slate-50 border-slate-200 rounded-xl" />
                  </div>
                </div>

                {/* Section 3: Thông tin khóa học & tài chính */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chọn chương trình học</Label>
                    <Select>
                      <SelectTrigger className="h-10 bg-slate-50 border-slate-200 rounded-xl">
                        <SelectValue placeholder="Chọn chương trình" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mg" className="font-bold text-xs uppercase cursor-pointer">Mẫu giáo</SelectItem>
                        <SelectItem value="th" className="font-bold text-xs uppercase cursor-pointer">Tiểu học</SelectItem>
                        <SelectItem value="thcs" className="font-bold text-xs uppercase cursor-pointer">Trung học cơ sở</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Số khóa học</Label>
                    <Input placeholder="Nhập số khóa học" className="h-10 bg-slate-50 border-slate-200 rounded-xl" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chọn nhóm khách hàng</Label>
                    <Select>
                      <SelectTrigger className="h-10 bg-slate-50 border-slate-200 rounded-xl">
                        <SelectValue placeholder="Chọn nhóm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dv" className="font-bold text-xs uppercase cursor-pointer">ĐANG TƯ VẤN</SelectItem>
                        <SelectItem value="dc" className="font-bold text-xs uppercase cursor-pointer">ĐÃ CHỐT THÀNH CÔNG</SelectItem>
                        <SelectItem value="tk" className="font-bold text-xs uppercase cursor-pointer">TIỀM NĂNG CAO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Số buổi học</Label>
                      <Input placeholder="Số buổi" className="h-10 bg-slate-50 border-slate-200 rounded-xl text-center" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Học phí</Label>
                      <Input placeholder="Học phí" className="h-10 bg-slate-50 border-slate-200 rounded-xl text-right" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày thu học phí</Label>
                    <Input placeholder="Ngày thu học phí dự kiến" className="h-10 bg-slate-50 border-slate-200 rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ghi chú</Label>
                <Textarea placeholder="Nhập ghi chú thêm..." className="min-h-[80px] bg-slate-50 border-slate-200 rounded-xl" />
              </div>

              <DialogFooter className="border-t pt-4">
                <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl text-slate-500 font-bold uppercase tracking-widest">Hủy bỏ</Button>
                <Button onClick={handleCreateLead} className="rounded-xl bg-primary text-white font-black uppercase tracking-widest px-8 shadow-lg shadow-primary/20">Lưu thông tin</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {viewMode !== "sales" && (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Từ khóa" 
                className="pl-9 bg-slate-50 border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={activeCategory} onValueChange={(val) => setActiveCategory(val as Stage | "all")}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-xs font-bold">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Chọn nguồn khách hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nguồn</SelectItem>
                <SelectItem value="FACEBOOK">FACEBOOK</SelectItem>
                <SelectItem value="PHỤ HUYNH CŨ GIỚI THIỆU">PHỤ HUYNH CŨ GIỚI THIỆU</SelectItem>
                <SelectItem value="VÃNG LAI">VÃNG LAI</SelectItem>
                <SelectItem value="MARKETING">MARKETING</SelectItem>
                <SelectItem value="TIKTOK">TIKTOK</SelectItem>
                <SelectItem value="GOOGLE ADS">GOOGLE ADS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterGroup} onValueChange={setFilterGroup}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Chọn nhóm khách hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nhóm</SelectItem>
                <SelectItem value="ĐÃ CHỐT THÀNH CÔNG">ĐÃ CHỐT THÀNH CÔNG</SelectItem>
                <SelectItem value="CHỜ XẾP LỚP">CHỜ XẾP LỚP</SelectItem>
                <SelectItem value="Chưa phân nhóm">Chưa phân nhóm</SelectItem>
                <SelectItem value="TIỀM NĂNG CAO">TIỀM NĂNG CAO</SelectItem>
                <SelectItem value="KHÁCH HÀNG VIP">KHÁCH HÀNG VIP</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterProgram} onValueChange={setFilterProgram}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Chọn chương trình" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chương trình</SelectItem>
                <SelectItem value="Mẫu giáo">Mẫu giáo</SelectItem>
                <SelectItem value="Tiểu học">Tiểu học</SelectItem>
                <SelectItem value="Trung học cơ sở">Trung học cơ sở</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStaff} onValueChange={setFilterStaff}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Tất cả nhân viên" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">Tất cả nhân viên</SelectItem>
                  <SelectItem value="Nguyễn Bích Ngọc">Nguyễn Bích Ngọc</SelectItem>
                  <SelectItem value="Nguyễn Thuỳ Linh">Nguyễn Thuỳ Linh</SelectItem>
                  <SelectItem value="Trần Minh Quân">Trần Minh Quân</SelectItem>
                  <SelectItem value="Phạm Hồng Nhung">Phạm Hồng Nhung</SelectItem>
                  <SelectItem value="Lê Gia Huy">Lê Gia Huy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col">
        {viewMode === "sales" ? (
          renderSalesReport()
        ) : viewMode === "table" ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f1f3f5] sticky top-0 z-10">
                  <tr>
                    <th className="p-3 w-10">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.length === filteredItems.length && filteredItems.length > 0} 
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300"
                      />
                    </th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      STT
                    </th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      Tên
                    </th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider text-center">
                      Ngày sinh
                    </th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      Điện thoại
                    </th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      Nhóm khách hàng
                    </th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      Chương trình
                    </th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      Nhân viên CS
                    </th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      Lịch sử chăm sóc
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        selectedIds.includes(item.id) ? "bg-primary/5" : ""
                      }`}
                      onClick={() => openDetail(item)}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="rounded border-slate-300"
                        />
                      </td>
                      <td className="p-3 text-xs font-medium text-slate-600">
                        {item.stt}
                      </td>
                      <td className="p-3">
                        <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                          {item.name}
                        </p>
                        <div
                          className="flex items-center gap-1.5 mt-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-primary transition-colors">
                            <MessageSquareText className="w-3 h-3" />
                          </button>
                          <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-primary transition-colors">
                            <RefreshCw className="w-3 h-3" />
                          </button>
                          <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-primary transition-colors">
                            <Undo2 className="w-3 h-3" />
                          </button>
                          <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-primary transition-colors">
                            <MousePointer2 className="w-3 h-3" />
                          </button>
                          <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-primary transition-colors">
                            <UserPlus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-xs text-slate-600 text-center">
                        {item.dob}
                      </td>
                      <td className="p-3">
                        <p className="text-xs font-bold text-slate-700">
                          {item.phone}
                        </p>
                        <button className="flex items-center gap-1 text-[10px] font-black text-primary uppercase mt-1">
                          <Phone className="w-2.5 h-2.5" /> Chăm sóc
                        </button>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter ${
                            item.customerGroup === "ĐÃ CHỐT THÀNH CÔNG"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : item.customerGroup === "Chưa phân nhóm"
                              ? "bg-slate-50 text-slate-500 border border-slate-100"
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}
                        >
                          {item.customerGroup}
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="text-xs font-bold text-slate-700">
                          {item.program.name}
                        </p>
                        {item.program.sessions && (
                          <div className="text-[10px] text-slate-500 mt-1 leading-tight font-medium">
                            Số buổi: {item.program.sessions}
                            <br />
                            Học phí:{" "}
                            {new Intl.NumberFormat("vi-VN").format(
                              item.program.fee || 0
                            )}
                            đ
                            <br />
                            Ngày thu: {item.program.collectionDate}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-xs font-bold text-slate-600">
                        {item.assignee}
                      </td>
                      <td className="p-3 text-xs text-slate-500 font-medium">
                        26/12 15:25:
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="p-12 text-center text-slate-400 flex flex-col items-center"
                      >
                        <Briefcase className="w-12 h-12 opacity-10 mb-2" />
                        <p className="text-sm font-medium">
                          Không tìm thấy khách hàng phù hợp
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-auto p-4 bg-slate-50 border-t flex items-center justify-end border-slate-100">
              <div className="text-xs text-slate-500 font-bold">
                HIỂN THỊ {filteredItems.length} / {items.length} HỒ SƠ
              </div>
            </div>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 flex-1 h-full min-h-0 overflow-x-auto pb-4">
              {stages.map((stage) => {
                const stageItems = filteredItems.filter(
                  (l) => l.stage === stage
                );
                const cfg = stageConfig[stage];
                return (
                  <Droppable droppableId={stage} key={stage}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex flex-col rounded-xl bg-slate-100 shadow-inner w-80 flex-shrink-0 border-2 border-transparent transition-colors ${
                          snapshot.isDraggingOver
                            ? "bg-slate-200 border-primary/20"
                            : ""
                        }`}
                      >
                        <div
                          className={`px-4 py-3 rounded-t-xl ${cfg.colorClass} border-b border-white/20 flex items-center justify-between`}
                        >
                          <span className="font-black text-sm uppercase tracking-wider">
                            {cfg.label}
                          </span>
                          <span className="text-xs bg-white/20 rounded-lg px-2 py-0.5 font-bold">
                            {stageItems.length}
                          </span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 thin-scrollbar">
                          <AnimatePresence mode="popLayout">
                            {stageItems.map((lead, index) => (
                              <Draggable
                                key={lead.id}
                                draggableId={lead.id}
                                index={index}
                              >
                                {(prov, snap) => (
                                  <div
                                    ref={prov.innerRef}
                                    {...prov.draggableProps}
                                    {...prov.dragHandleProps}
                                    className={`${snap.isDragging ? "z-50" : ""}`}
                                  >
                                    <motion.div
                                      layout
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      onClick={() => openDetail(lead)}
                                      className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-primary/50 transition-all cursor-pointer ${
                                        snap.isDragging
                                          ? "shadow-2xl ring-2 ring-primary/20"
                                          : ""
                                      }`}
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <p className="font-black text-xs text-slate-800 uppercase tracking-tight">
                                          {lead.name}
                                        </p>
                                        <div className="bg-slate-50 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400">
                                          #{lead.stt}
                                        </div>
                                      </div>
                                      <p className="text-xs font-bold text-slate-500 mb-2">
                                        {lead.program.name}
                                      </p>
                                      <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                                        <Phone className="w-3 h-3 text-primary" />
                                        <span>{lead.phone}</span>
                                      </div>
                                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                            {lead.assignee
                                              .split(" ")
                                              .pop()
                                              ?.charAt(0)}
                                          </div>
                                          <span className="text-[10px] font-bold text-slate-400 truncate max-w-[80px]">
                                            {lead.assignee}
                                          </span>
                                        </div>
                                        <span
                                          className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                                            lead.customerGroup ===
                                            "ĐÃ CHỐT THÀNH CÔNG"
                                              ? "text-emerald-500"
                                              : "text-amber-500"
                                          }`}
                                        >
                                          {lead.customerGroup.split(" ").pop()}
                                        </span>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          moveLeadToNextStage(lead.id);
                                        }}
                                        className="w-full mt-3 py-2 bg-slate-50 hover:bg-primary hover:text-white text-primary text-[10px] font-black uppercase rounded-lg border border-primary/10 transition-all flex items-center justify-center gap-2 group"
                                      >
                                        <RefreshCw className="w-3 h-3 animate-spin-slow group-hover:rotate-180 transition-transform duration-500" />
                                        Chuyển trạng thái
                                      </button>
                                    </motion.div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </AnimatePresence>
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px] gap-0 p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-[#f8f9fa]">
          {selectedLead && (
            <div className="flex flex-col">
              {/* Header section - Clean White */}
              <div className="bg-white p-6 border-b border-slate-100 relative">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">
                      {selectedLead.name}
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                      Hồ sơ khách hàng tiềm năng <span className="text-primary ml-1">#{selectedLead.stt}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Metrics Overview Bar */}
              <div className="bg-white px-6 py-4 border-b border-slate-100 grid grid-cols-4 gap-4">
                <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Nguồn khách</p>
                  <span className="text-[10px] font-black text-blue-600 uppercase">{selectedLead.source}</span>
                </div>
                <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Cấp độ nhóm</p>
                  <span className="text-[10px] font-black text-emerald-600 uppercase">{selectedLead.customerGroup.split(' ').pop()}</span>
                </div>
                <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Trạng thái</p>
                  <span className="text-[10px] font-black text-amber-600 uppercase">{stageConfig[selectedLead.stage].label}</span>
                </div>
                <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Nhân viên CS</p>
                  <span className="text-[10px] font-black text-slate-700 uppercase">{selectedLead.assignee.split(' ').pop()}</span>
                </div>
              </div>

              {/* Main Content Areas */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto thin-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column: Contact & Program */}
                  <div className="space-y-6">
                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-primary">
                        <Phone className="w-4 h-4" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest">Thông tin liên hệ</h3>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Số điện thoại</span>
                          <span className="text-xs font-bold text-slate-700">{selectedLead.phone}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày sinh</span>
                          <span className="text-xs font-bold text-slate-700">{selectedLead.dob}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Giới tính</span>
                          <span className="text-xs font-bold text-slate-700">Nam</span>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-3">
                      <div className="flex items-center gap-2 text-primary">
                        <BookOpen className="w-4 h-4" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest">Chương trình học</h3>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hệ đào tạo</span>
                          <span className="text-xs font-black text-primary uppercase">{selectedLead.program.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Số buổi dự kiến</span>
                          <span className="text-xs font-bold text-slate-700">{selectedLead.program.sessions}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mức phí</span>
                          <span className="text-xs font-black text-emerald-600">{formatVND(selectedLead.program.fee || 3500000)}</span>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Right Column: History & Staff */}
                  <div className="space-y-6">
                    <section className="space-y-3 h-full flex flex-col">
                      <div className="flex items-center gap-2 text-primary">
                        <MessageSquareText className="w-4 h-4" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest">Lịch sử chăm sóc</h3>
                      </div>
                      <div className="flex-1 bg-blue-50/50 p-4 rounded-xl border border-blue-100 relative group min-h-[150px]">
                        <div className="absolute -left-1 top-4 w-2 h-2 bg-blue-50 rotate-45 border-l border-b border-blue-100" />
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Cập nhật lúc 26/12 15:00</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                          "Khách hàng quan tâm đến lộ trình học tiểu học cho bé lớp 2. Cần thêm tư vấn về lịch học cuối tuần. Tiếp tục chăm sóc vào thứ 2 tới."
                        </p>
                        <div className="mt-3 flex items-center gap-2 pt-3 border-t border-blue-100/50">
                          <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-[9px] font-black text-blue-600">
                            {selectedLead.assignee.split(' ').pop()?.charAt(0)}
                          </div>
                          <span className="text-[10px] font-black text-blue-600 uppercase">{selectedLead.assignee}</span>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 px-3 py-2 rounded-lg transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> Xóa Lead
                </button>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">
                    Đóng
                  </Button>
                  <Button className="rounded-xl bg-primary text-white font-black uppercase tracking-widest text-[10px] h-10 px-8 shadow-lg shadow-primary/20">
                    Chăm sóc
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRMPage;
