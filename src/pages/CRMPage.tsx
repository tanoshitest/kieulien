import { useState, useMemo, useEffect } from "react";
import { leads, type Lead, type LeadStage, type CareLogEntry, salesData, classes as mockClasses } from "@/data/mockData";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import {
  Phone, Calendar, Plus, Loader2, CheckCircle2,
  UserPlus, Undo2, MousePointer2, Briefcase, LayoutGrid, List,
  LineChart, Search, MessageSquareText,
  RefreshCw, ClipboardList, Clock, X, BookOpen, ClipboardCheck,
  Send, GraduationCap, Wallet, StickyNote, Phone as PhoneIcon,
  Mail as MailIcon, Users, FileCheck2, AlertTriangle, Award
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { admissionsStore } from "@/lib/admissionsStore";

type Stage = LeadStage;

const stageConfig: Record<Stage, {
  label: string;
  short: string;
  colorClass: string;
  bgClass: string;
  badge: string;
  icon: typeof Clock;
}> = {
  new:             { label: "Lead mới",              short: "Lead mới",       colorClass: "bg-blue-100 text-blue-700",       bgClass: "bg-blue-50",       badge: "bg-blue-500",       icon: UserPlus },
  nurturing:       { label: "Đang chăm sóc",         short: "Chăm sóc",       colorClass: "bg-amber-100 text-amber-700",     bgClass: "bg-amber-50",      badge: "bg-amber-500",      icon: PhoneIcon },
  test_scheduled:  { label: "Đã hẹn lịch test",      short: "Hẹn test",       colorClass: "bg-indigo-100 text-indigo-700",   bgClass: "bg-indigo-50",     badge: "bg-indigo-500",     icon: Calendar },
  test_done:       { label: "Đã test - Chờ gửi KQ",  short: "Đã test",        colorClass: "bg-teal-100 text-teal-700",       bgClass: "bg-teal-50",       badge: "bg-teal-500",       icon: ClipboardCheck },
  result_sent:     { label: "Đã gửi KQ phụ huynh",   short: "Gửi KQ",         colorClass: "bg-cyan-100 text-cyan-700",       bgClass: "bg-cyan-50",       badge: "bg-cyan-500",       icon: Send },
  waiting_class:   { label: "Chờ xếp lớp",           short: "Chờ xếp lớp",    colorClass: "bg-purple-100 text-purple-700",   bgClass: "bg-purple-50",     badge: "bg-purple-500",     icon: Users },
  enrolled:        { label: "Đã chốt - Học viên",    short: "Đã chốt",        colorClass: "bg-emerald-100 text-emerald-700", bgClass: "bg-emerald-50",    badge: "bg-emerald-500",    icon: GraduationCap },
};

const stages: Stage[] = ["new", "nurturing", "test_scheduled", "test_done", "result_sent", "waiting_class", "enrolled"];

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n) + "đ";

const parseVND = (s: string) => Number(String(s).replace(/\D/g, "")) || 0;

const REPORT_MONTHS = Array.from({ length: 24 }).map((_, i) => {
  const d = new Date(2026, 2 - i, 1);
  return `${d.getMonth() + 1}/${d.getFullYear()}`;
});

const categoryLabels: Record<Stage | "all", string> = {
  all: "TẤT CẢ (HIỂN THỊ HẾT)",
  new: "LEAD MỚI",
  nurturing: "ĐANG CHĂM SÓC",
  test_scheduled: "ĐÃ HẸN LỊCH TEST",
  test_done: "ĐÃ TEST - CHỜ GỬI KQ",
  result_sent: "ĐÃ GỬI KQ PHỤ HUYNH",
  waiting_class: "CHỜ XẾP LỚP",
  enrolled: "ĐÃ CHỐT - HỌC VIÊN",
};

const careTypeIcon: Record<CareLogEntry["type"], typeof Clock> = {
  call: PhoneIcon,
  sms: MailIcon,
  zalo: MessageSquareText,
  meet: Users,
  test_result_sent: FileCheck2,
  note: StickyNote,
  stage_change: RefreshCw,
};

const careTypeLabel: Record<CareLogEntry["type"], string> = {
  call: "Gọi điện",
  sms: "SMS",
  zalo: "Zalo",
  meet: "Gặp mặt",
  test_result_sent: "Gửi KQ test",
  note: "Ghi chú",
  stage_change: "Chuyển trạng thái",
};

const careTypeColor: Record<CareLogEntry["type"], string> = {
  call: "bg-blue-100 text-blue-700 border-blue-200",
  sms: "bg-slate-100 text-slate-700 border-slate-200",
  zalo: "bg-cyan-100 text-cyan-700 border-cyan-200",
  meet: "bg-amber-100 text-amber-700 border-amber-200",
  test_result_sent: "bg-emerald-100 text-emerald-700 border-emerald-200",
  note: "bg-slate-100 text-slate-600 border-slate-200",
  stage_change: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

const formatDateTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
};

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const CRMPage = () => {
  const [items, setItems] = useState<Lead[]>([...leads]);
  const [viewMode, setViewMode] = useState<"table" | "kanban" | "sales">("kanban");
  const [activeCategory, setActiveCategory] = useState<Stage | "all">("all");
  const [selectedSalesMonth, setSelectedSalesMonth] = useState(REPORT_MONTHS[0]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Stage action dialogs
  const [testScheduleOpen, setTestScheduleOpen] = useState(false);
  const [testResultOpen, setTestResultOpen] = useState(false);
  const [sendResultOpen, setSendResultOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [careLogOpen, setCareLogOpen] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");
  const [filterStaff, setFilterStaff] = useState("all");

  // Keep selectedLead in sync with items
  useEffect(() => {
    if (selectedLead) {
      const fresh = items.find(i => i.id === selectedLead.id);
      if (fresh && fresh !== selectedLead) setSelectedLead(fresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // -------- Update helpers --------
  const updateLead = (id: string, patch: Partial<Lead> | ((l: Lead) => Partial<Lead>)) => {
    setItems(prev => prev.map(l => {
      if (l.id !== id) return l;
      const p = typeof patch === "function" ? patch(l) : patch;
      return { ...l, ...p };
    }));
  };

  const appendCareLog = (id: string, entry: Omit<CareLogEntry, "id" | "timestamp">) => {
    const full: CareLogEntry = {
      ...entry,
      id: uid("cl"),
      timestamp: new Date().toISOString(),
    };
    setItems(prev => prev.map(l => l.id === id ? { ...l, careLog: [full, ...(l.careLog || [])] } : l));
  };

  const changeStage = (id: string, next: Stage, note?: string) => {
    setItems(prev => prev.map(l => {
      if (l.id !== id) return l;
      const entry: CareLogEntry = {
        id: uid("cl"),
        timestamp: new Date().toISOString(),
        by: l.assignee,
        type: "stage_change",
        content: `${stageConfig[l.stage].label} → ${stageConfig[next].label}${note ? ` — ${note}` : ""}`,
      };
      return { ...l, stage: next, careLog: [entry, ...(l.careLog || [])] };
    }));
    toast.success(`Chuyển sang: ${stageConfig[next].label}`);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const targetStage = result.destination.droppableId as Stage;
    const lead = items.find(l => l.id === result.draggableId);
    if (!lead || lead.stage === targetStage) return;
    // Guard: không cho kéo thẳng vào "enrolled" — phải qua dialog thu học phí
    if (targetStage === "enrolled") {
      setSelectedLead(lead);
      setEnrollOpen(true);
      return;
    }
    changeStage(lead.id, targetStage);
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchCat = activeCategory === "all" ? true : item.stage === activeCategory;
      const matchSearch = searchTerm
        ? (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.phone.includes(searchTerm))
        : true;
      const matchSource = filterSource !== "all" ? item.source === filterSource : true;
      const matchGroup = filterGroup !== "all" ? item.customerGroup === filterGroup : true;
      const matchProgram = filterProgram !== "all" ? item.program.name === filterProgram : true;
      const matchStaff = filterStaff !== "all" ? item.assignee === filterStaff : true;
      return matchCat && matchSearch && matchSource && matchGroup && matchProgram && matchStaff;
    });
  }, [items, activeCategory, searchTerm, filterSource, filterGroup, filterProgram, filterStaff]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) setSelectedIds([]);
    else setSelectedIds(filteredItems.map(i => i.id));
  };
  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  // -------- Create lead (wired) --------
  const [createForm, setCreateForm] = useState({
    name: "", gender: "nam", dob: "", phone: "",
    parentName: "", parentPhone: "",
    program: "Mẫu giáo", sessions: "", fee: "",
    source: "FACEBOOK", assignee: "Nguyễn Bích Ngọc",
    customerGroup: "Chưa phân nhóm",
    note: "",
  });
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.phone.trim()) {
      toast.error("Vui lòng nhập Họ tên và Số điện thoại");
      return;
    }
    const newLead: Lead = {
      id: uid("L"),
      stt: items.length + 1,
      name: createForm.name.toUpperCase(),
      dob: createForm.dob || "—",
      phone: createForm.phone,
      parentName: createForm.parentName || undefined,
      parentPhone: createForm.parentPhone || undefined,
      customerGroup: createForm.customerGroup,
      program: {
        name: createForm.program,
        sessions: Number(createForm.sessions) || 0,
        fee: parseVND(createForm.fee),
        collectionDate: "—",
      },
      assignee: createForm.assignee,
      followUpHistory: "",
      source: createForm.source,
      category: "nurturing",
      stage: "new",
      careLog: [{
        id: uid("cl"),
        timestamp: new Date().toISOString(),
        by: createForm.assignee,
        type: "note",
        content: createForm.note ? `Ghi chú khởi tạo: ${createForm.note}` : `Tạo lead mới từ nguồn ${createForm.source}`,
      }],
      createdAt: new Date().toISOString(),
    };
    setItems(prev => [newLead, ...prev]);
    toast.success(`Đã thêm lead "${newLead.name}"`);
    setIsCreateOpen(false);
    setCreateForm({ ...createForm, name: "", phone: "", parentName: "", parentPhone: "", sessions: "", fee: "", note: "" });
  };

  // -------- Stage action: Schedule test --------
  const [scheduleDate, setScheduleDate] = useState("");
  const openScheduleTest = (l: Lead) => { setSelectedLead(l); setScheduleDate(l.test?.scheduledDate || ""); setTestScheduleOpen(true); };
  const submitScheduleTest = () => {
    if (!selectedLead || !scheduleDate) return;
    updateLead(selectedLead.id, l => ({ test: { ...(l.test || {}), scheduledDate: scheduleDate } }));
    appendCareLog(selectedLead.id, { by: selectedLead.assignee, type: "call", content: `Đã hẹn lịch test ngày ${scheduleDate}` });
    changeStage(selectedLead.id, "test_scheduled");
    setTestScheduleOpen(false);
  };

  // -------- Stage action: Test result --------
  const [testForm, setTestForm] = useState({ actualDate: "", score: "", level: "Starters", feedback: "", suggestedProgram: "" });
  const openTestResult = (l: Lead) => {
    setSelectedLead(l);
    setTestForm({
      actualDate: l.test?.actualDate || l.test?.scheduledDate || "",
      score: l.test?.score?.toString() || "",
      level: l.test?.level || "Starters",
      feedback: l.test?.teacherFeedback || "",
      suggestedProgram: l.test?.suggestedProgram || "",
    });
    setTestResultOpen(true);
  };
  const submitTestResult = () => {
    if (!selectedLead) return;
    updateLead(selectedLead.id, l => ({
      test: {
        ...(l.test || {}),
        actualDate: testForm.actualDate,
        score: Number(testForm.score) || 0,
        level: testForm.level,
        teacherFeedback: testForm.feedback,
        suggestedProgram: testForm.suggestedProgram,
      }
    }));
    appendCareLog(selectedLead.id, { by: selectedLead.assignee, type: "note", content: `Nhập KQ test: ${testForm.score}/10 • ${testForm.level} • ${testForm.feedback}` });
    changeStage(selectedLead.id, "test_done");
    setTestResultOpen(false);
  };

  // -------- Stage action: Send result to parent --------
  const openSendResult = (l: Lead) => { setSelectedLead(l); setSendResultOpen(true); };
  const submitSendResult = () => {
    if (!selectedLead) return;
    updateLead(selectedLead.id, l => ({
      test: { ...(l.test || {}), sentToParentAt: new Date().toISOString(), parentResponse: "pending" }
    }));
    appendCareLog(selectedLead.id, { by: selectedLead.assignee, type: "test_result_sent", content: `Đã gửi KQ test cho phụ huynh ${selectedLead.parentName || "—"}` });
    changeStage(selectedLead.id, "result_sent");
    setSendResultOpen(false);
  };

  // -------- Stage action: Parent response --------
  const parentResponded = (l: Lead, resp: "agree" | "decline") => {
    updateLead(l.id, old => ({ test: { ...(old.test || {}), parentResponse: resp } }));
    if (resp === "agree") {
      appendCareLog(l.id, { by: l.assignee, type: "note", content: "PH đồng ý → Chờ xếp lớp" });
      changeStage(l.id, "waiting_class", "PH đồng ý");
    } else {
      appendCareLog(l.id, { by: l.assignee, type: "note", content: "PH từ chối — quay lại chăm sóc" });
      changeStage(l.id, "nurturing", "PH từ chối");
    }
  };

  // -------- Stage action: Enroll + Payment --------
  const [enrollForm, setEnrollForm] = useState({
    classId: "",
    className: "",
    tuitionFee: "",
    materialFee: "",
    paidTuition: true,
    paidMaterial: true,
  });
  const openEnroll = (l: Lead) => {
    setSelectedLead(l);
    setEnrollForm({
      classId: l.enrollment?.classId || "",
      className: l.enrollment?.className || "",
      tuitionFee: (l.payment?.tuitionFee || l.program.fee || 0).toString(),
      materialFee: (l.payment?.materialFee || 0).toString(),
      paidTuition: true,
      paidMaterial: true,
    });
    setEnrollOpen(true);
  };
  const submitEnroll = () => {
    if (!selectedLead) return;
    if (!enrollForm.classId || !enrollForm.className) {
      toast.error("Vui lòng chọn lớp xếp vào");
      return;
    }
    if (!enrollForm.paidTuition && !enrollForm.paidMaterial) {
      toast.error("Phải thu tối thiểu 1 khoản (học phí hoặc học liệu)");
      return;
    }
    const now = new Date().toISOString();
    const tuitionFee = parseVND(enrollForm.tuitionFee);
    const materialFee = parseVND(enrollForm.materialFee);

    updateLead(selectedLead.id, {
      enrollment: { classId: enrollForm.classId, className: enrollForm.className, enrolledAt: now },
      payment: {
        tuitionFee, materialFee,
        paidTuition: enrollForm.paidTuition,
        paidMaterial: enrollForm.paidMaterial,
        paidAt: now,
        receiptCode: "RC-" + selectedLead.id,
      },
      customerGroup: "ĐÃ CHỐT THÀNH CÔNG",
      category: "completed",
    });
    appendCareLog(selectedLead.id, {
      by: selectedLead.assignee,
      type: "note",
      content: `Chốt lớp ${enrollForm.className} • HP: ${enrollForm.paidTuition ? formatVND(tuitionFee) : "—"} • HL: ${enrollForm.paidMaterial ? formatVND(materialFee) : "—"}`,
    });
    changeStage(selectedLead.id, "enrolled", "Thu học phí");

    // === BRIDGE: đẩy doanh số vào AdminReports ===
    admissionsStore.recordEnrollment({
      leadId: selectedLead.id,
      leadName: selectedLead.name,
      assignee: selectedLead.assignee,
      classId: enrollForm.classId,
      className: enrollForm.className,
      tuitionRevenue: enrollForm.paidTuition ? tuitionFee : 0,
      materialRevenue: enrollForm.paidMaterial ? materialFee : 0,
      includeTuition: enrollForm.paidTuition,
      includeMaterial: enrollForm.paidMaterial,
      enrolledAt: now,
    });

    toast.success(`🎉 ${selectedLead.name} đã chốt lớp ${enrollForm.className} — Doanh số đã đẩy cho ${selectedLead.assignee}`);
    setEnrollOpen(false);
  };

  // -------- Care log add --------
  const [logForm, setLogForm] = useState({ type: "call" as CareLogEntry["type"], content: "" });
  const submitLog = () => {
    if (!selectedLead || !logForm.content.trim()) return;
    appendCareLog(selectedLead.id, { by: selectedLead.assignee, type: logForm.type, content: logForm.content });
    toast.success("Đã ghi log chăm sóc");
    setLogForm({ type: "call", content: "" });
    setCareLogOpen(false);
  };

  // ---------------- Sales Report ----------------
  const renderSalesReport = () => {
    const filteredSales = salesData.filter(d => d.month === selectedSalesMonth);
    const displaySales = filteredSales.length > 0 ? filteredSales : salesData.slice(0, 4);
    const totalStaff = displaySales.length;
    const totalCustomers = displaySales.reduce((a, c) => a + c.customers, 0);
    const totalSales = displaySales.reduce((a, c) => a + c.saleAmount, 0);
    const totalCommission = displaySales.reduce((a, c) => a + c.totalCommission, 0);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            <span className="font-black text-sm text-slate-700 uppercase italic">Bảng tổng hợp doanh số nhân viên</span>
          </div>
          <Select value={selectedSalesMonth} onValueChange={setSelectedSalesMonth}>
            <SelectTrigger className="h-8 w-[140px] text-[10px] font-black bg-white rounded-lg border-slate-200 text-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_MONTHS.map(m => <SelectItem key={m} value={m} className="text-[10px] font-bold">{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 sticky top-0 z-10">
                <th className="p-3 text-[10px] font-black uppercase text-slate-400 border-b">STT</th>
                <th className="p-3 text-[10px] font-black uppercase text-slate-400 border-b">Nhân viên</th>
                <th className="p-3 text-[10px] font-black uppercase text-slate-400 border-b text-center">Khách hàng</th>
                <th className="p-3 text-[10px] font-black uppercase text-slate-400 border-b text-right text-blue-600">Doanh số</th>
                <th className="p-3 text-[10px] font-black uppercase text-slate-400 border-b text-center">Hoa hồng (%)</th>
                <th className="p-3 text-[10px] font-black uppercase text-slate-400 border-b text-center">KPI (%)</th>
                <th className="p-3 text-[10px] font-black uppercase text-slate-400 border-b text-right text-emerald-600">Tổng nhận</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displaySales.map((it, i) => (
                <tr key={it.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-xs text-slate-400">{i + 1}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                        {it.staffName.split(" ").pop()?.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{it.staffName}</span>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-center font-bold text-primary">{it.customers}</td>
                  <td className="p-3 text-xs text-right font-black text-blue-600">{formatVND(it.saleAmount)}</td>
                  <td className="p-3 text-xs text-center text-slate-400">{it.commissionRate}%</td>
                  <td className="p-3 text-xs text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`font-black ${it.kpi >= 80 ? "text-emerald-500" : it.kpi >= 50 ? "text-amber-500" : "text-rose-500"}`}>{it.kpi}%</span>
                      <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${it.kpi >= 80 ? "bg-emerald-500" : it.kpi >= 50 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${it.kpi}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-right font-black text-emerald-600">{formatVND(it.totalCommission)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/80 font-bold border-t-2 border-slate-100">
              <tr>
                <td className="p-3 text-[10px] text-slate-500 uppercase">TỔNG CỘNG</td>
                <td className="p-3 text-xs text-slate-600">{totalStaff} nhân viên</td>
                <td className="p-3 text-xs text-center text-primary">{totalCustomers} KH</td>
                <td className="p-3 text-xs text-right text-blue-600">{formatVND(totalSales)}</td>
                <td className="p-3 text-xs text-center text-slate-400">---</td>
                <td className="p-3 text-xs text-center text-slate-400">---</td>
                <td className="p-3 text-xs text-right text-emerald-600">{formatVND(totalCommission)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  // -------- Stage Action Button inside detail modal --------
  const renderStageActionButtons = (l: Lead) => {
    const btnBase = "rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-5 shadow-lg flex items-center gap-2";
    switch (l.stage) {
      case "new":
        return (
          <Button onClick={() => { setIsDetailOpen(false); changeStage(l.id, "nurturing"); }}
            className={`${btnBase} bg-amber-500 text-white shadow-amber-500/20`}>
            <PhoneIcon className="w-3.5 h-3.5" /> Bắt đầu chăm sóc
          </Button>
        );
      case "nurturing":
        return (
          <Button onClick={() => { setIsDetailOpen(false); openScheduleTest(l); }}
            className={`${btnBase} bg-indigo-500 text-white shadow-indigo-500/20`}>
            <Calendar className="w-3.5 h-3.5" /> Hẹn lịch test
          </Button>
        );
      case "test_scheduled":
        return (
          <Button onClick={() => { setIsDetailOpen(false); openTestResult(l); }}
            className={`${btnBase} bg-teal-500 text-white shadow-teal-500/20`}>
            <ClipboardCheck className="w-3.5 h-3.5" /> Nhập kết quả test
          </Button>
        );
      case "test_done":
        return (
          <Button onClick={() => { setIsDetailOpen(false); openSendResult(l); }}
            className={`${btnBase} bg-cyan-500 text-white shadow-cyan-500/20`}>
            <Send className="w-3.5 h-3.5" /> Gửi KQ cho phụ huynh
          </Button>
        );
      case "result_sent":
        return (
          <div className="flex gap-2">
            <Button onClick={() => { setIsDetailOpen(false); parentResponded(l, "decline"); }}
              className={`${btnBase} bg-rose-50 text-rose-600 border border-rose-200 shadow-none`}>
              PH từ chối
            </Button>
            <Button onClick={() => { setIsDetailOpen(false); parentResponded(l, "agree"); }}
              className={`${btnBase} bg-purple-500 text-white shadow-purple-500/20`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> PH đồng ý → Chờ xếp lớp
            </Button>
          </div>
        );
      case "waiting_class":
        return (
          <Button onClick={() => { setIsDetailOpen(false); openEnroll(l); }}
            className={`${btnBase} bg-emerald-500 text-white shadow-emerald-500/20`}>
            <GraduationCap className="w-3.5 h-3.5" /> Xếp lớp & Thu học phí
          </Button>
        );
      case "enrolled":
        return (
          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
            <Award className="w-4 h-4" /> Đã chốt thành công — Doanh số đã đẩy cho {l.assignee}
          </div>
        );
    }
  };

  // ============== RENDER ==============
  return (
    <div className="p-4 flex flex-col h-full bg-[#f8f9fa]">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <Select value={activeCategory} onValueChange={(v) => setActiveCategory(v as Stage | "all")}>
            <SelectTrigger className="w-[260px] border-none shadow-none bg-slate-100/50 rounded-xl h-10 font-black text-slate-800 focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200">
              {Object.entries(categoryLabels).map(([k, l]) => (
                <SelectItem key={k} value={k} className="font-bold text-xs">{l.toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
            {[
              { v: "kanban", label: "Kanban", icon: LayoutGrid },
              { v: "table", label: "Danh sách", icon: List },
              { v: "sales", label: "Báo cáo DS", icon: LineChart },
            ].map(o => {
              const Icon = o.icon;
              return (
                <button key={o.v}
                  onClick={() => setViewMode(o.v as typeof viewMode)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === o.v ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  <Icon className="w-3.5 h-3.5" /> {o.label}
                </button>
              );
            })}
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-black uppercase tracking-wider hover:opacity-90 transition-all shadow-md shadow-primary/20">
                <Plus className="w-4 h-4" /> Thêm Lead
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-tight text-primary border-b pb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5" /> Thêm Lead / Hồ sơ mới
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateLead}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5 py-6">
                  {/* Col 1 */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Họ tên học viên (*)</Label>
                      <Input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} placeholder="VD: Nguyễn Minh An" className="h-10 bg-slate-50 border-slate-200 rounded-xl" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Giới tính</Label>
                      <RadioGroup value={createForm.gender} onValueChange={(v) => setCreateForm({ ...createForm, gender: v })} className="flex items-center gap-6">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="nam" id="nam" /><Label htmlFor="nam" className="text-xs font-bold text-slate-600">Nam</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="nu" id="nu" /><Label htmlFor="nu" className="text-xs font-bold text-slate-600">Nữ</Label></div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày sinh</Label>
                      <Input value={createForm.dob} onChange={(e) => setCreateForm({ ...createForm, dob: e.target.value })} placeholder="VD: 26/04/2018" className="h-10 bg-slate-50 border-slate-200 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Điện thoại HS (*)</Label>
                      <Input value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} placeholder="09xxxxxxxx" className="h-10 bg-slate-50 border-slate-200 rounded-xl" required />
                    </div>
                  </div>
                  {/* Col 2 */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tên phụ huynh</Label>
                      <Input value={createForm.parentName} onChange={(e) => setCreateForm({ ...createForm, parentName: e.target.value })} placeholder="Nhập tên PH" className="h-10 bg-slate-50 border-slate-200 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SĐT phụ huynh</Label>
                      <Input value={createForm.parentPhone} onChange={(e) => setCreateForm({ ...createForm, parentPhone: e.target.value })} placeholder="08xxxxxxxx" className="h-10 bg-slate-50 border-slate-200 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nguồn khách</Label>
                      <Select value={createForm.source} onValueChange={(v) => setCreateForm({ ...createForm, source: v })}>
                        <SelectTrigger className="h-10 bg-slate-50 border-slate-200 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["FACEBOOK", "PHỤ HUYNH CŨ GIỚI THIỆU", "VÃNG LAI", "MARKETING", "TIKTOK", "GOOGLE ADS"].map(s => (
                            <SelectItem key={s} value={s} className="font-bold text-xs">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nhân viên phụ trách</Label>
                      <Select value={createForm.assignee} onValueChange={(v) => setCreateForm({ ...createForm, assignee: v })}>
                        <SelectTrigger className="h-10 bg-slate-50 border-slate-200 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Nguyễn Bích Ngọc", "Nguyễn Thuỳ Linh", "Trần Minh Quân", "Phạm Hồng Nhung", "Lê Gia Huy"].map(s => (
                            <SelectItem key={s} value={s} className="font-bold text-xs">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Col 3 */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chương trình học</Label>
                      <Select value={createForm.program} onValueChange={(v) => setCreateForm({ ...createForm, program: v })}>
                        <SelectTrigger className="h-10 bg-slate-50 border-slate-200 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Mẫu giáo", "Tiểu học", "Trung học cơ sở"].map(s => <SelectItem key={s} value={s} className="font-bold text-xs">{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nhóm khách</Label>
                      <Select value={createForm.customerGroup} onValueChange={(v) => setCreateForm({ ...createForm, customerGroup: v })}>
                        <SelectTrigger className="h-10 bg-slate-50 border-slate-200 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Chưa phân nhóm", "TIỀM NĂNG CAO", "KHÁCH HÀNG VIP", "CHỜ XẾP LỚP"].map(s => <SelectItem key={s} value={s} className="font-bold text-xs">{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Số buổi</Label>
                        <Input value={createForm.sessions} onChange={(e) => setCreateForm({ ...createForm, sessions: e.target.value })} placeholder="VD: 32" className="h-10 bg-slate-50 border-slate-200 rounded-xl text-center" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Học phí dự kiến</Label>
                        <Input value={createForm.fee} onChange={(e) => setCreateForm({ ...createForm, fee: e.target.value })} placeholder="VD: 3.000.000" className="h-10 bg-slate-50 border-slate-200 rounded-xl text-right" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ghi chú khởi tạo</Label>
                      <Textarea value={createForm.note} onChange={(e) => setCreateForm({ ...createForm, note: e.target.value })} placeholder="Ghi chú khởi tạo..." className="min-h-[60px] bg-slate-50 border-slate-200 rounded-xl" />
                    </div>
                  </div>
                </div>
                <DialogFooter className="border-t pt-4">
                  <Button variant="ghost" type="button" onClick={() => setIsCreateOpen(false)} className="rounded-xl text-slate-500 font-bold uppercase tracking-widest">Hủy</Button>
                  <Button type="submit" className="rounded-xl bg-primary text-white font-black uppercase tracking-widest px-8 shadow-lg shadow-primary/20">Tạo Lead</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter Bar */}
      {viewMode !== "sales" && (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Từ khóa (tên, sđt)" className="pl-9 bg-slate-50 border-slate-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Select value={activeCategory} onValueChange={(v) => setActiveCategory(v as Stage | "all")}>
              <SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([k, l]) => <SelectItem key={k} value={k} className="text-xs font-bold">{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Nguồn" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nguồn</SelectItem>
                {["FACEBOOK", "PHỤ HUYNH CŨ GIỚI THIỆU", "VÃNG LAI", "MARKETING", "TIKTOK", "GOOGLE ADS"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterGroup} onValueChange={setFilterGroup}>
              <SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Nhóm KH" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nhóm</SelectItem>
                {["ĐÃ CHỐT THÀNH CÔNG", "CHỜ XẾP LỚP", "Chưa phân nhóm", "TIỀM NĂNG CAO", "KHÁCH HÀNG VIP"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterProgram} onValueChange={setFilterProgram}>
              <SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Chương trình" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả CT</SelectItem>
                {["Mẫu giáo", "Tiểu học", "Trung học cơ sở"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStaff} onValueChange={setFilterStaff}>
              <SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Nhân viên" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả NV</SelectItem>
                {["Nguyễn Bích Ngọc", "Nguyễn Thuỳ Linh", "Trần Minh Quân", "Phạm Hồng Nhung", "Lê Gia Huy"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Main View */}
      <div className="flex-1 min-h-0 flex flex-col">
        {viewMode === "sales" ? renderSalesReport() : viewMode === "table" ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f1f3f5] sticky top-0 z-10">
                  <tr>
                    <th className="p-3 w-10">
                      <input type="checkbox" checked={selectedIds.length === filteredItems.length && filteredItems.length > 0} onChange={toggleSelectAll} className="rounded border-slate-300" />
                    </th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">STT</th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Tên HS</th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">SĐT</th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Trạng thái</th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Chương trình</th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Nhân viên CS</th>
                    <th className="p-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Cập nhật gần nhất</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map(item => {
                    const lastLog = item.careLog?.[0];
                    const cfg = stageConfig[item.stage];
                    return (
                      <tr key={item.id} className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${selectedIds.includes(item.id) ? "bg-primary/5" : ""}`} onClick={() => { setSelectedLead(item); setIsDetailOpen(true); }}>
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} className="rounded border-slate-300" />
                        </td>
                        <td className="p-3 text-xs font-medium text-slate-600">{item.stt}</td>
                        <td className="p-3">
                          <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">{item.name}</p>
                          {item.parentName && <p className="text-[10px] text-slate-400 mt-0.5">PH: {item.parentName}</p>}
                        </td>
                        <td className="p-3 text-xs font-bold text-slate-700">{item.phone}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter ${cfg.colorClass}`}>{cfg.short}</span>
                        </td>
                        <td className="p-3">
                          <p className="text-xs font-bold text-slate-700">{item.program.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.program.sessions} buổi • {formatVND(item.program.fee || 0)}</p>
                        </td>
                        <td className="p-3 text-xs font-bold text-slate-600">{item.assignee}</td>
                        <td className="p-3 text-[10px] text-slate-500 font-medium">
                          {lastLog ? (
                            <>
                              <span className="text-slate-400">{formatDateTime(lastLog.timestamp)}</span>
                              <br />
                              <span className="text-slate-600">{lastLog.content.slice(0, 50)}{lastLog.content.length > 50 ? "…" : ""}</span>
                            </>
                          ) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredItems.length === 0 && (
                    <tr><td colSpan={8} className="p-12 text-center text-slate-400"><Briefcase className="w-12 h-12 opacity-10 mb-2 mx-auto" /><p className="text-sm font-medium">Không tìm thấy lead phù hợp</p></td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-auto p-4 bg-slate-50 border-t flex items-center justify-end border-slate-100">
              <div className="text-xs text-slate-500 font-bold">HIỂN THỊ {filteredItems.length} / {items.length} HỒ SƠ</div>
            </div>
          </div>
        ) : (
          // ---------- Kanban ----------
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-3 flex-1 h-full min-h-0 overflow-x-auto pb-4">
              {stages.map(stage => {
                const stageItems = filteredItems.filter(l => l.stage === stage);
                const cfg = stageConfig[stage];
                const Icon = cfg.icon;
                return (
                  <Droppable droppableId={stage} key={stage}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex flex-col rounded-xl bg-slate-100 shadow-inner w-72 flex-shrink-0 border-2 border-transparent transition-colors ${snapshot.isDraggingOver ? "bg-slate-200 border-primary/20" : ""}`}
                      >
                        <div className={`px-3 py-3 rounded-t-xl ${cfg.colorClass} border-b border-white/20 flex items-center justify-between`}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span className="font-black text-xs uppercase tracking-wider">{cfg.short}</span>
                          </div>
                          <span className="text-[10px] bg-white/40 rounded-lg px-2 py-0.5 font-black">{stageItems.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2 thin-scrollbar min-h-[100px]">
                          <AnimatePresence mode="popLayout">
                            {stageItems.map((lead, index) => (
                              <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                {(prov, snap) => (
                                  <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className={`${snap.isDragging ? "z-50" : ""}`}>
                                    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                      onClick={() => { setSelectedLead(lead); setIsDetailOpen(true); }}
                                      className={`bg-white p-3 rounded-xl shadow-sm border border-slate-200 hover:border-primary/50 transition-all cursor-pointer ${snap.isDragging ? "shadow-2xl ring-2 ring-primary/20" : ""}`}
                                    >
                                      <div className="flex justify-between items-start mb-1.5">
                                        <p className="font-black text-[11px] text-slate-800 uppercase tracking-tight flex-1">{lead.name}</p>
                                        <div className="bg-slate-50 px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-400 ml-1">#{lead.stt}</div>
                                      </div>
                                      <p className="text-[10px] font-bold text-slate-500 mb-2">{lead.program.name} • {lead.phone}</p>

                                      {/* Stage-specific mini info */}
                                      {lead.stage === "test_scheduled" && lead.test?.scheduledDate && (
                                        <div className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-2 py-1 rounded mb-2 flex items-center gap-1">
                                          <Calendar className="w-3 h-3" /> {lead.test.scheduledDate}
                                        </div>
                                      )}
                                      {lead.stage === "test_done" && lead.test?.score !== undefined && (
                                        <div className="bg-teal-50 text-teal-700 text-[9px] font-bold px-2 py-1 rounded mb-2 flex items-center gap-1">
                                          <Award className="w-3 h-3" /> {lead.test.score}/10 • {lead.test.level}
                                        </div>
                                      )}
                                      {lead.stage === "result_sent" && (
                                        <div className="bg-cyan-50 text-cyan-700 text-[9px] font-bold px-2 py-1 rounded mb-2 flex items-center gap-1">
                                          <Send className="w-3 h-3" /> Gửi {lead.test?.sentToParentAt ? formatDateTime(lead.test.sentToParentAt).split(",")[0] : "—"}
                                        </div>
                                      )}
                                      {lead.stage === "waiting_class" && (
                                        <div className="bg-purple-50 text-purple-700 text-[9px] font-bold px-2 py-1 rounded mb-2 flex items-center gap-1">
                                          <Users className="w-3 h-3" /> Sẵn sàng xếp lớp
                                        </div>
                                      )}
                                      {lead.stage === "enrolled" && lead.enrollment && (
                                        <div className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-1 rounded mb-2 flex items-center gap-1">
                                          <GraduationCap className="w-3 h-3" /> {lead.enrollment.className}
                                        </div>
                                      )}

                                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                        <div className="flex items-center gap-1.5">
                                          <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-500">
                                            {lead.assignee.split(" ").pop()?.charAt(0)}
                                          </div>
                                          <span className="text-[9px] font-bold text-slate-500 truncate max-w-[80px]">{lead.assignee}</span>
                                        </div>
                                        <span className="text-[8px] text-slate-300 italic">{lead.careLog?.[0] ? formatDateTime(lead.careLog[0].timestamp).split(",")[0] : ""}</span>
                                      </div>

                                      {/* Quick action per stage */}
                                      {lead.stage !== "enrolled" && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedLead(lead);
                                            if (lead.stage === "new") changeStage(lead.id, "nurturing");
                                            else if (lead.stage === "nurturing") openScheduleTest(lead);
                                            else if (lead.stage === "test_scheduled") openTestResult(lead);
                                            else if (lead.stage === "test_done") openSendResult(lead);
                                            else if (lead.stage === "result_sent") parentResponded(lead, "agree");
                                            else if (lead.stage === "waiting_class") openEnroll(lead);
                                          }}
                                          className={`w-full mt-2 py-1.5 text-white text-[9px] font-black uppercase rounded-md transition-all flex items-center justify-center gap-1 ${cfg.badge} hover:opacity-90`}
                                        >
                                          <RefreshCw className="w-2.5 h-2.5" /> Sang bước tiếp theo
                                        </button>
                                      )}
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

      {/* ============ DETAIL MODAL ============ */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] gap-0 p-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-[#f8f9fa]">
          {selectedLead && (
            <div className="flex flex-col max-h-[90vh]">
              <div className="bg-white p-5 border-b border-slate-100 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-black uppercase tracking-tight text-slate-800">{selectedLead.name}</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                    Hồ sơ #{selectedLead.stt} • {selectedLead.source}
                  </p>
                </div>
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider ${stageConfig[selectedLead.stage].colorClass}`}>
                  {stageConfig[selectedLead.stage].label}
                </span>
                <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="p-5 grid grid-cols-2 gap-5 overflow-y-auto flex-1">
                {/* Left: Info + Test + Enrollment */}
                <div className="space-y-4">
                  <section className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2.5">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><PhoneIcon className="w-3.5 h-3.5" /> Liên hệ</h3>
                    <div className="flex justify-between text-xs"><span className="text-slate-400 font-bold">SĐT HS</span><span className="font-black text-slate-700">{selectedLead.phone}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-400 font-bold">Ngày sinh</span><span className="font-black text-slate-700">{selectedLead.dob}</span></div>
                    {selectedLead.parentName && <div className="flex justify-between text-xs"><span className="text-slate-400 font-bold">Phụ huynh</span><span className="font-black text-slate-700">{selectedLead.parentName}</span></div>}
                    {selectedLead.parentPhone && <div className="flex justify-between text-xs"><span className="text-slate-400 font-bold">SĐT PH</span><span className="font-black text-slate-700">{selectedLead.parentPhone}</span></div>}
                    <div className="flex justify-between text-xs"><span className="text-slate-400 font-bold">Nhân viên CS</span><span className="font-black text-primary">{selectedLead.assignee}</span></div>
                  </section>

                  <section className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2.5">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" /> Chương trình</h3>
                    <div className="flex justify-between text-xs"><span className="text-slate-400 font-bold">Hệ</span><span className="font-black text-primary uppercase">{selectedLead.program.name}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-400 font-bold">Số buổi</span><span className="font-black text-slate-700">{selectedLead.program.sessions}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-400 font-bold">HP dự kiến</span><span className="font-black text-emerald-600">{formatVND(selectedLead.program.fee || 0)}</span></div>
                  </section>

                  {selectedLead.test && (
                    <section className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 space-y-2.5">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-teal-700 flex items-center gap-2"><ClipboardCheck className="w-3.5 h-3.5" /> Kết quả test</h3>
                      {selectedLead.test.scheduledDate && <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold">Lịch hẹn</span><span className="font-black text-slate-700">{selectedLead.test.scheduledDate}</span></div>}
                      {selectedLead.test.actualDate && <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold">Ngày test</span><span className="font-black text-slate-700">{selectedLead.test.actualDate}</span></div>}
                      {selectedLead.test.score !== undefined && <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold">Điểm</span><span className="font-black text-teal-700">{selectedLead.test.score}/10 • {selectedLead.test.level}</span></div>}
                      {selectedLead.test.teacherFeedback && <div className="text-[10px] italic text-slate-600 bg-white p-2 rounded-lg">💬 {selectedLead.test.teacherFeedback}</div>}
                      {selectedLead.test.sentToParentAt && <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold">Đã gửi PH</span><span className="font-black text-cyan-700">{formatDateTime(selectedLead.test.sentToParentAt)}</span></div>}
                      {selectedLead.test.parentResponse && <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold">PH phản hồi</span><span className={`font-black uppercase ${selectedLead.test.parentResponse === "agree" ? "text-emerald-600" : selectedLead.test.parentResponse === "decline" ? "text-rose-600" : "text-amber-600"}`}>{selectedLead.test.parentResponse === "agree" ? "Đồng ý" : selectedLead.test.parentResponse === "decline" ? "Từ chối" : "Chưa phản hồi"}</span></div>}
                    </section>
                  )}

                  {selectedLead.enrollment && selectedLead.payment && (
                    <section className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-2.5">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-700 flex items-center gap-2"><Wallet className="w-3.5 h-3.5" /> Xếp lớp & Thu phí</h3>
                      <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold">Lớp</span><span className="font-black text-emerald-700">{selectedLead.enrollment.className}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold">Ngày chốt</span><span className="font-black text-slate-700">{formatDateTime(selectedLead.enrollment.enrolledAt)}</span></div>
                      {selectedLead.payment.paidTuition && <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold">Học phí</span><span className="font-black text-emerald-700">✓ {formatVND(selectedLead.payment.tuitionFee)}</span></div>}
                      {selectedLead.payment.paidMaterial && <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold">Học liệu</span><span className="font-black text-emerald-700">✓ {formatVND(selectedLead.payment.materialFee)}</span></div>}
                      {selectedLead.payment.receiptCode && <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold">Mã biên lai</span><span className="font-mono font-black text-slate-700">{selectedLead.payment.receiptCode}</span></div>}
                    </section>
                  )}
                </div>

                {/* Right: Care log timeline */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><MessageSquareText className="w-3.5 h-3.5" /> Timeline chăm sóc ({selectedLead.careLog?.length || 0})</h3>
                    <Button onClick={() => { setCareLogOpen(true); }} size="sm" className="h-7 px-3 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary/20 shadow-none">
                      <Plus className="w-3 h-3 mr-1" /> Thêm log
                    </Button>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-100 p-3 max-h-[500px] overflow-y-auto space-y-2">
                    {(selectedLead.careLog || []).map(log => {
                      const Icon = careTypeIcon[log.type];
                      return (
                        <div key={log.id} className={`p-2.5 rounded-lg border ${careTypeColor[log.type]}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <Icon className="w-3 h-3" />
                              <span className="text-[9px] font-black uppercase tracking-widest">{careTypeLabel[log.type]}</span>
                            </div>
                            <span className="text-[9px] font-bold opacity-70">{formatDateTime(log.timestamp)}</span>
                          </div>
                          <p className="text-[11px] text-slate-700 font-medium leading-snug">{log.content}</p>
                          <div className="text-[9px] text-slate-400 italic mt-1">— {log.by}</div>
                        </div>
                      );
                    })}
                    {(selectedLead.careLog?.length || 0) === 0 && (
                      <div className="text-center py-8 text-[10px] text-slate-400 italic">Chưa có log chăm sóc</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                <div className="text-[10px] text-slate-400 font-bold italic">
                  Tạo {formatDateTime(selectedLead.createdAt)}
                </div>
                <div className="flex gap-3 items-center">
                  <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Đóng</Button>
                  {renderStageActionButtons(selectedLead)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ============ SCHEDULE TEST DIALOG ============ */}
      <Dialog open={testScheduleOpen} onOpenChange={setTestScheduleOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-indigo-700">
              <Calendar className="w-5 h-5" /> Hẹn lịch test
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-indigo-50 p-3 rounded-lg text-xs font-bold text-indigo-700">
              Học viên: <span className="uppercase">{selectedLead?.name}</span>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ngày test</Label>
              <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="h-10 rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTestScheduleOpen(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={submitScheduleTest} className="rounded-xl bg-indigo-500 text-white hover:bg-indigo-600"><Calendar className="w-4 h-4 mr-2" />Xác nhận lịch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ TEST RESULT DIALOG ============ */}
      <Dialog open={testResultOpen} onOpenChange={setTestResultOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-teal-700">
              <ClipboardCheck className="w-5 h-5" /> Nhập kết quả test
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-teal-50 p-3 rounded-lg text-xs font-bold text-teal-700">
              {selectedLead?.name} • Lịch hẹn: {selectedLead?.test?.scheduledDate || "—"}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ngày test thực tế</Label>
                <Input type="date" value={testForm.actualDate} onChange={(e) => setTestForm({ ...testForm, actualDate: e.target.value })} className="h-10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Điểm / 10</Label>
                <Input type="number" step="0.1" max={10} min={0} value={testForm.score} onChange={(e) => setTestForm({ ...testForm, score: e.target.value })} className="h-10 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Level</Label>
                <Select value={testForm.level} onValueChange={(v) => setTestForm({ ...testForm, level: v })}>
                  <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Starters", "Movers", "Flyers", "KET", "PET", "Pre-A1", "A1", "A2", "B1"].map(l => <SelectItem key={l} value={l} className="font-bold text-xs">{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Đề xuất lộ trình</Label>
                <Input value={testForm.suggestedProgram} onChange={(e) => setTestForm({ ...testForm, suggestedProgram: e.target.value })} placeholder="VD: Cambridge YL" className="h-10 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nhận xét của GV</Label>
              <Textarea value={testForm.feedback} onChange={(e) => setTestForm({ ...testForm, feedback: e.target.value })} rows={3} className="rounded-xl" placeholder="Nhận xét bé sau bài test..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTestResultOpen(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={submitTestResult} className="rounded-xl bg-teal-500 text-white hover:bg-teal-600"><ClipboardCheck className="w-4 h-4 mr-2" />Lưu kết quả</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ SEND RESULT TO PARENT DIALOG ============ */}
      <Dialog open={sendResultOpen} onOpenChange={setSendResultOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-cyan-700">
              <Send className="w-5 h-5" /> Gửi kết quả cho phụ huynh
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100 text-[11px] text-slate-700 space-y-2">
              <p className="font-black text-cyan-700 uppercase text-[10px]">Preview tin nhắn gửi PH {selectedLead?.parentName || "—"} ({selectedLead?.parentPhone || selectedLead?.phone})</p>
              <div className="bg-white p-3 rounded-lg border border-cyan-100 leading-relaxed">
                <p>Kính gửi quý phụ huynh của bé <b>{selectedLead?.name}</b>,</p>
                <p className="mt-2">Trung tâm Anh ngữ Kiều Liên xin gửi kết quả bài test đầu vào:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Điểm: <b>{selectedLead?.test?.score ?? "—"}/10</b></li>
                  <li>Trình độ: <b>{selectedLead?.test?.level ?? "—"}</b></li>
                  <li>Nhận xét: <i>{selectedLead?.test?.teacherFeedback ?? "—"}</i></li>
                  <li>Đề xuất: <b>{selectedLead?.test?.suggestedProgram ?? "—"}</b></li>
                </ul>
                <p className="mt-2">Xin quý PH phản hồi để trung tâm sắp xếp lớp phù hợp. Trân trọng!</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>Sau khi gửi, lead sẽ chuyển sang trạng thái "Đã gửi KQ phụ huynh" và chờ phản hồi.</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSendResultOpen(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={submitSendResult} className="rounded-xl bg-cyan-500 text-white hover:bg-cyan-600"><Send className="w-4 h-4 mr-2" />Gửi ngay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ ENROLL + PAYMENT DIALOG ============ */}
      <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-emerald-700">
              <GraduationCap className="w-5 h-5" /> Xếp lớp & Thu học phí
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-emerald-50 p-3 rounded-lg text-xs font-bold text-emerald-700 flex items-center justify-between">
              <span>{selectedLead?.name}</span>
              <span className="text-[10px] text-slate-500">Phụ trách: {selectedLead?.assignee}</span>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Chọn lớp xếp vào</Label>
              <Select
                value={enrollForm.classId}
                onValueChange={(v) => {
                  const cls = mockClasses.find(c => c.id === v);
                  setEnrollForm({ ...enrollForm, classId: v, className: cls?.name || v });
                }}
              >
                <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="-- Chọn lớp --" /></SelectTrigger>
                <SelectContent>
                  {mockClasses.map(c => (
                    <SelectItem key={c.id} value={c.id} className="font-bold text-xs">
                      {c.name} • {c.studentCount}/{c.maxStudents} HS
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 p-3 rounded-xl border border-emerald-100 bg-emerald-50/30">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={enrollForm.paidTuition}
                    onChange={(e) => setEnrollForm({ ...enrollForm, paidTuition: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Thu học phí</span>
                </label>
                <Input
                  value={enrollForm.tuitionFee ? new Intl.NumberFormat("vi-VN").format(Number(String(enrollForm.tuitionFee).replace(/\D/g, ''))) : ''}
                  onChange={(e) => setEnrollForm({ ...enrollForm, tuitionFee: e.target.value.replace(/\D/g, '') })}
                  placeholder="0"
                  disabled={!enrollForm.paidTuition}
                  className={`h-10 rounded-xl text-right font-bold ${enrollForm.paidTuition ? "text-emerald-700" : "text-slate-400 bg-slate-50"}`}
                />
              </div>
              <div className="space-y-2 p-3 rounded-xl border border-blue-100 bg-blue-50/30">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={enrollForm.paidMaterial}
                    onChange={(e) => setEnrollForm({ ...enrollForm, paidMaterial: e.target.checked })}
                    className="w-4 h-4 accent-blue-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Thu học liệu</span>
                </label>
                <Input
                  value={enrollForm.materialFee ? new Intl.NumberFormat("vi-VN").format(Number(String(enrollForm.materialFee).replace(/\D/g, ''))) : ''}
                  onChange={(e) => setEnrollForm({ ...enrollForm, materialFee: e.target.value.replace(/\D/g, '') })}
                  placeholder="0"
                  disabled={!enrollForm.paidMaterial}
                  className={`h-10 rounded-xl text-right font-bold ${enrollForm.paidMaterial ? "text-blue-700" : "text-slate-400 bg-slate-50"}`}
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tổng thu</span>
              <span className="text-lg font-black text-emerald-700">
                {formatVND(
                  (enrollForm.paidTuition ? parseVND(enrollForm.tuitionFee) : 0) +
                  (enrollForm.paidMaterial ? parseVND(enrollForm.materialFee) : 0)
                )}
              </span>
            </div>

            <div className="flex items-start gap-2 text-[10px] text-emerald-700 bg-emerald-50 p-3 rounded-lg">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Khi xác nhận, doanh số sẽ được <b>tự động đẩy vào báo cáo lương</b> của {selectedLead?.assignee} — lớp {enrollForm.className || "..."} trong tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}.</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEnrollOpen(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={submitEnroll} className="rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"><GraduationCap className="w-4 h-4 mr-2" />Chốt & Đẩy doanh số</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ ADD CARE LOG DIALOG ============ */}
      <Dialog open={careLogOpen} onOpenChange={setCareLogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-primary">
              <MessageSquareText className="w-5 h-5" /> Thêm log chăm sóc
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Loại</Label>
              <Select value={logForm.type} onValueChange={(v) => setLogForm({ ...logForm, type: v as CareLogEntry["type"] })}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["call", "sms", "zalo", "meet", "note"] as CareLogEntry["type"][]).map(t => (
                    <SelectItem key={t} value={t} className="font-bold text-xs">{careTypeLabel[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nội dung</Label>
              <Textarea value={logForm.content} onChange={(e) => setLogForm({ ...logForm, content: e.target.value })} rows={4} className="rounded-xl" placeholder="VD: Đã gọi 2 lần không bắt máy, để lại tin nhắn..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCareLogOpen(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={submitLog} className="rounded-xl bg-primary text-white"><Plus className="w-4 h-4 mr-2" />Lưu log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRMPage;
