import React, { useState } from "react";
import { useRole } from "@/contexts/RoleContext";
import { documents, classes, teachers } from "@/data/mockData";
import { 
  FileText, Download, Eye, Trash2, Search, Filter, Plus, 
  ShieldCheck, X, Check, Users, School, Globe, Loader2, CheckCircle2,
  Printer, EyeOff, FileText as FileIcon, AlertCircle, ChevronLeft, ChevronRight,
  Maximize2, Minimize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
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

const DocumentsPage = () => {
  const { isAdmin, isTeacher } = useRole();
  const activeTeacherId = "TCH001"; 
  const [items, setItems] = useState([...documents].map(doc => ({ ...doc, type: "pptx" })));
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedDocForView, setSelectedDocForView] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const slides = [
    { title: "WELCOME TO MENGLISH", subtitle: "Chương trình IELTS B1 Foundation", type: "intro" },
    { title: "MỤC TIÊU BÀI HỌC", subtitle: "Learning Objectives", type: "goals" },
    { title: "SƠ ĐỒ TƯ DUY", subtitle: "Topic: Environment & Ecology", type: "visual" },
    { title: "BÀI TẬP VẬN DỤNG", subtitle: "Practice Session", type: "practice" },
  ];

  // Interactive Demo State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState<"pdf" | "docx" | "xlsx" | "pptx">("pdf");
  const [uploadClass, setUploadClass] = useState("all");

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle) return;
    
    setIsUploading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newDoc = {
      id: `DOC${100 + items.length}`,
      title: uploadTitle,
      type: uploadType,
      size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      addedBy: "Admin",
      classId: uploadClass,
      url: "#"
    };

    setItems(prev => [newDoc, ...prev]);
    setDocPermissions(prev => ({
      ...prev,
      [newDoc.id]: { classId: uploadClass, allowedTeachers: ["all"] }
    }));
    
    setIsUploading(false);
    setIsUploadOpen(false);
    setUploadTitle("");
    
    toast.success("Tài liệu đã được tải lên thành công!", {
      description: `Tệp "${uploadTitle}.${uploadType}" đã sẵn sàng để sử dụng.`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    });
  };

  // Mock permission state for the demo
  const [docPermissions, setDocPermissions] = useState<Record<string, { classId: string, allowedTeachers: string[] }>>(() => {
    const initial: Record<string, any> = {};
    documents.forEach(doc => {
      initial[doc.id] = { 
        classId: doc.classId, 
        allowedTeachers: doc.addedBy.includes("Admin") ? ["all"] : [teachers.find(t => doc.addedBy.includes(t.name))?.id || "TCH001"]
      };
    });
    return initial;
  });

  const teacherClassIds = classes
    .filter((cls) => cls.teacherId === activeTeacherId)
    .map((cls) => cls.id);

  const filteredDocuments = items.filter((doc) => {
    if (isAdmin) return true;
    if (isTeacher) {
      const perms = docPermissions[doc.id];
      return perms.classId === "all" || teacherClassIds.includes(perms.classId) || perms.allowedTeachers.includes(activeTeacherId) || perms.allowedTeachers.includes("all");
    }
    return false;
  });

  const getClassName = (classId: string) => {
    if (classId === "all") return "Tất cả lớp";
    return classes.find((c) => c.id === classId)?.name || classId;
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "pdf": return "text-red-500";
      case "docx": return "text-blue-500";
      case "xlsx": return "text-green-500";
      case "pptx": return "text-orange-500";
      default: return "text-gray-500";
    }
  };

  const handleOpenPermissions = (doc: any) => {
    setSelectedDoc(doc);
    setShowPermissionModal(true);
  };

  const handleSavePermissions = () => {
    toast.success("Đã cập nhật phân quyền cho tài liệu: " + selectedDoc.title);
    setShowPermissionModal(false);
  };

  const viewerRef = React.useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    if (!viewerRef.current) return;

    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  React.useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedDocForView) {
        if (e.key.toLowerCase() === 'f') toggleFullScreen();
        if (e.key === 'ArrowRight' || e.key === ' ') setCurrentSlide(prev => (prev + 1) % slides.length);
        if (e.key === 'ArrowLeft') setCurrentSlide(prev => Math.max(0, prev - 1));
        if (e.key === 'Escape' && isFullScreen) setIsFullScreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [selectedDocForView, isFullScreen, slides.length]);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold italic underline decoration-primary/20 underline-offset-8">
            {isAdmin ? "Quản lý tài liệu" : "Tài liệu của tôi"}
          </h1>
          <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold tracking-wider">
            {isAdmin 
              ? "Hệ thống quản lý tài liệu tập trung" 
              : `Tài liệu lớp: ${teacherClassIds.join(", ")}`}
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" />
                Tải tài liệu lên
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Tải tài liệu mới</DialogTitle>
                <p className="text-sm text-muted-foreground italic">Tải lên học liệu, bài tập hoặc đề thi cho hệ thống.</p>
              </DialogHeader>
              <form onSubmit={handleUploadDocument} className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="docTitle" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Tiêu đề tài liệu *</Label>
                    <Input 
                      id="docTitle" 
                      placeholder="Ví dụ: Đề thi thử cuối kỳ B1" 
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="rounded-xl border-slate-200 focus:ring-primary/20 h-11"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Định dạng</Label>
                      <select 
                        className="w-full h-11 px-3 py-2 border rounded-xl text-sm bg-card outline-none focus:ring-2 focus:ring-primary/20"
                        value={uploadType}
                        onChange={(e) => setUploadType(e.target.value as any)}
                      >
                        <option value="pdf">PDF Document</option>
                        <option value="docx">Word File</option>
                        <option value="xlsx">Excel Sheet</option>
                        <option value="pptx">PowerPoint</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Phạm vi lớp</Label>
                      <select 
                        className="w-full h-11 px-3 py-2 border rounded-xl text-sm bg-card outline-none focus:ring-2 focus:ring-primary/20"
                        value={uploadClass}
                        onChange={(e) => setUploadClass(e.target.value)}
                      >
                        <option value="all">Tất cả lớp</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={isUploading}
                    className="w-full h-12 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 relative overflow-hidden"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tải lên...
                      </>
                    ) : "Bắt đầu tải tệp"}
                    {isUploading && (
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5 }}
                        className="absolute bottom-0 left-0 h-1 bg-white/30"
                      />
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-4">
          <div className="bg-card rounded-lg border overflow-hidden shadow-sm">
            <div className="p-4 border-b flex items-center gap-3 bg-secondary/10">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm tài liệu..." 
                  className="w-full pl-9 pr-4 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button className="p-2 border rounded-md hover:bg-secondary transition-colors">
                <Filter className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-secondary/5 font-bold uppercase text-[10px] tracking-tight">
                    <th className="text-left px-4 py-4 text-muted-foreground">Tài liệu</th>
                    <th className="text-left px-4 py-4 text-muted-foreground hidden md:table-cell">Lớp học</th>
                    <th className="text-left px-4 py-4 text-muted-foreground hidden lg:table-cell text-center">Ngày tải</th>
                    <th className="text-left px-4 py-4 text-muted-foreground hidden sm:table-cell text-center">Dung lượng</th>
                    <th className="text-right px-4 py-4 text-muted-foreground">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y relative">
                  <AnimatePresence mode="popLayout">
                    {filteredDocuments.map((doc) => (
                      <motion.tr 
                        key={doc.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="hover:bg-primary/5 transition-colors group"
                      >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-lg bg-secondary/30 ${getIconColor(doc.type)} shadow-sm`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm leading-tight text-foreground/90">{doc.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-muted-foreground font-mono bg-secondary px-1.5 rounded">{doc.type}</span>
                              <span className="text-[10px] text-muted-foreground">Bởi: {doc.addedBy}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-[10px] px-2.5 py-1 bg-primary/10 text-primary rounded-full font-bold border border-primary/20 uppercase">
                          {getClassName(docPermissions[doc.id].classId)}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell text-muted-foreground text-xs text-center font-mono">
                        {doc.uploadDate}
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell text-muted-foreground text-xs text-center font-mono">
                        {doc.size}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => setSelectedDocForView(doc)}
                            className="p-2 hover:bg-secondary rounded-md transition-colors text-muted-foreground hover:text-foreground" 
                            title="Xem"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button 
                              onClick={() => handleOpenPermissions(doc)}
                              className="p-2 hover:bg-amber-100 hover:text-amber-600 rounded-md transition-all text-muted-foreground hover:shadow-inner" 
                              title="Phân quyền"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button className="p-2 hover:bg-success/10 hover:text-success rounded-md transition-colors text-muted-foreground" title="Tải về">
                            <Download className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors text-muted-foreground" title="Xóa">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-5 shadow-sm">
            <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4">Thống kê lưu trữ</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end text-sm">
                <span className="text-muted-foreground">Tổng số tài liệu:</span>
                <span className="text-2xl font-black text-primary leading-none">{filteredDocuments.length}</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '24%' }}></div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-secondary/40 p-2 rounded text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">PDFs</p>
                  <p className="text-lg font-black">{filteredDocuments.filter(d => d.type === 'pdf').length}</p>
                </div>
                <div className="bg-secondary/40 p-2 rounded text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Khác</p>
                  <p className="text-lg font-black">{filteredDocuments.filter(d => d.type !== 'pdf').length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5">
            <h3 className="font-bold text-sm text-indigo-900 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Ghi chú phân quyền
            </h3>
            <p className="text-xs text-indigo-800 leading-relaxed font-medium">
              {isAdmin 
                ? "Tài liệu được phân quyền 'Tất cả lớp' sẽ hiển thị cho mọi giáo viên. Bạn có thể giới hạn tài liệu cho từng giáo viên cụ thể."
                : "Bạn chỉ thấy tài liệu được chỉ định cho các lớp của bạn hoặc tài liệu chung của trung tâm."}
            </p>
          </div>
        </div>
      </div>

      {/* Permission Modal */}
      <AnimatePresence>
        {showPermissionModal && selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPermissionModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-card border rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b bg-secondary/10 flex items-center justify-between">
                <span className="font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  Phân quyền tài liệu
                </span>
                <button 
                  onClick={() => setShowPermissionModal(false)}
                  className="p-1 hover:bg-secondary rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 bg-secondary/20 p-3 rounded-lg border border-dashed">
                  <div className={`p-2 rounded bg-card ${getIconColor(selectedDoc.type)}`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold truncate max-w-[250px]">{selectedDoc.title}</h4>
                    <p className="text-[10px] text-muted-foreground">ID: {selectedDoc.id} • {selectedDoc.size}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                      <School className="w-3 h-3" /> Chỉ định lớp học
                    </label>
                    <select 
                      className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      defaultValue={docPermissions[selectedDoc.id].classId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setDocPermissions(prev => ({
                          ...prev,
                          [selectedDoc.id]: { ...prev[selectedDoc.id], classId: newId }
                        }));
                      }}
                    >
                      <option value="all">Tất cả lớp học (Công khai)</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                      <Users className="w-3 h-3" /> Giới hạn giáo viên
                    </label>
                    <div className="border rounded-md divide-y max-h-[160px] overflow-y-auto">
                      <div className="flex items-center gap-3 p-3 hover:bg-secondary/20 transition-colors">
                        <input 
                          type="checkbox" 
                          id="tch-all"
                          checked={docPermissions[selectedDoc.id].allowedTeachers.includes("all")}
                          onChange={(e) => {
                             const checked = e.target.checked;
                             setDocPermissions(prev => ({
                               ...prev,
                               [selectedDoc.id]: { 
                                 ...prev[selectedDoc.id], 
                                 allowedTeachers: checked ? ["all"] : [] 
                               }
                             }));
                          }}
                        />
                        <label htmlFor="tch-all" className="flex-1 text-sm font-medium cursor-pointer">Tất cả giáo viên</label>
                      </div>
                      {teachers.map(t => (
                        <div key={t.id} className="flex items-center gap-3 p-3 hover:bg-secondary/20 transition-colors">
                          <input 
                            type="checkbox" 
                            id={`tch-${t.id}`}
                            checked={docPermissions[selectedDoc.id].allowedTeachers.includes(t.id) || docPermissions[selectedDoc.id].allowedTeachers.includes("all")}
                            disabled={docPermissions[selectedDoc.id].allowedTeachers.includes("all")}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const current = docPermissions[selectedDoc.id].allowedTeachers;
                              setDocPermissions(prev => {
                                let newList = [...current];
                                if (checked) newList.push(t.id);
                                else newList = newList.filter(id => id !== t.id);
                                return {
                                  ...prev,
                                  [selectedDoc.id]: { ...prev[selectedDoc.id], allowedTeachers: newList }
                                };
                              });
                            }}
                          />
                          <div className="flex-1 flex items-center gap-2 cursor-pointer">
                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                              {t.avatar}
                            </div>
                            <label htmlFor={`tch-${t.id}`} className="text-sm cursor-pointer">{t.name}</label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t bg-secondary/10 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setShowPermissionModal(false)}
                  className="px-4 py-2 text-xs font-medium hover:bg-secondary rounded-md transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleSavePermissions}
                  className="px-6 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-md hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" /> Lưu cập nhật
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Document Viewer Modal - Demo for Teachers vs Admin */}
      <AnimatePresence>
        {selectedDocForView && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedDocForView(null)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            <motion.div 
              ref={viewerRef}
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className={`relative w-full ${isFullScreen ? 'h-screen max-w-none rounded-none border-none' : 'max-w-5xl h-[85vh] rounded-[3rem] border border-slate-200'} bg-white shadow-2xl overflow-hidden flex flex-col`}
            >
              {/* Toolbar */}
              <div className="bg-slate-50/80 border-b p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl bg-white shadow-sm ${getIconColor(selectedDocForView.type)}`}>
                    <FileIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{selectedDocForView.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{selectedDocForView.type} Document</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Added by: {selectedDocForView.addedBy}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={toggleFullScreen}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                    title="Toàn màn hình (F)"
                  >
                    {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    {isFullScreen ? "Thu nhỏ" : "Toàn màn hình"}
                  </button>

                  <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-1.5 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-3 italic">Slide {currentSlide + 1} / {slides.length}</span>
                    <div className="flex gap-1 border-l pl-3 border-slate-100">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => Math.max(0, prev - 1)) }}
                        disabled={currentSlide === 0}
                        className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1)) }}
                        disabled={currentSlide === slides.length - 1}
                        className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="w-px h-8 bg-slate-200 mx-2" />
                  <button 
                    onClick={() => { setSelectedDocForView(null); setCurrentSlide(0); }}
                    className="p-3 hover:bg-slate-200 transition-colors rounded-2xl text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Slide Content Area (16:9) */}
              <div 
                className="flex-1 bg-slate-100 flex items-center justify-center p-8 sm:p-12 relative overflow-hidden group/slide cursor-pointer"
                onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
              >
                  {/* PPTX Layout Container */}
                  <div className="w-full h-full max-w-[1200px] max-h-[675px] aspect-video bg-white shadow-2xl rounded-sm overflow-hidden relative flex flex-col group">
                     
                     <AnimatePresence mode="wait">
                        <motion.div 
                          key={currentSlide}
                          initial={{ x: 300, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -300, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="flex-1 flex flex-col"
                        >
                           {/* Slide Styles Based on Content */}
                           {slides[currentSlide].type === "intro" ? (
                              <div className="flex-1 bg-slate-900 flex flex-col items-center justify-center text-center p-20 relative overflow-hidden">
                                 <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
                                 <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                    className="w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center mb-8 border border-white/20"
                                 >
                                    <FileIcon className="w-10 h-10 text-white" />
                                 </motion.div>
                                 <h1 className="text-6xl font-black text-white italic tracking-tighter mb-4">{slides[currentSlide].title}</h1>
                                 <div className="w-20 h-1 bg-primary mb-6" />
                                 <p className="text-xl font-bold text-slate-400 uppercase tracking-widest italic">{slides[currentSlide].subtitle}</p>
                                 <div className="absolute bottom-10 right-10 text-[10px] font-black text-white/20 tracking-widest uppercase italic font-mono">Internal ID: #DOC_X0421</div>
                              </div>
                           ) : slides[currentSlide].type === "goals" ? (
                              <div className="flex-1 p-20 flex flex-col space-y-12">
                                 <div className="flex justify-between items-start">
                                    <div>
                                       <h2 className="text-4xl font-black text-slate-800 italic underline decoration-primary/30 underline-offset-8 leading-none mb-4">{slides[currentSlide].title}</h2>
                                       <p className="text-sm font-black text-primary uppercase tracking-widest">{slides[currentSlide].subtitle}</p>
                                    </div>
                                    <FileIcon className="w-8 h-8 text-slate-200" />
                                 </div>
                                 <div className="grid grid-cols-2 gap-12 pt-4">
                                    <div className="space-y-6">
                                       {[1,2,3].map(i => (
                                          <div key={i} className="flex gap-4">
                                             <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-black text-xs text-primary shrink-0 mt-0.5">{i}</div>
                                             <p className="text-lg font-bold text-slate-600 leading-snug">Hệ thống hoá kiến thức từ vựng trọng tâm cấp độ B1.</p>
                                          </div>
                                       ))}
                                    </div>
                                    <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 flex flex-col justify-between">
                                       <p className="text-sm font-bold text-slate-400 italic">"Lưu ý cho giảng viên: Cần phân bổ thời gian tối thiểu 15 phút cho phần này để học viên nắm vững lý thuyết."</p>
                                       <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-slate-200" />
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Supervisor</p>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           ) : (
                              <div className="flex-1 flex flex-col p-20 space-y-8">
                                 <h2 className="text-4xl font-black text-slate-800 italic">{slides[currentSlide].title}</h2>
                                 <div className="flex-1 bg-slate-100 rounded-[3rem] border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden">
                                    <div className="text-center relative z-10 transition-transform hover:scale-105 duration-500">
                                       <FileIcon className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                                       <p className="text-sm font-black text-slate-400 italic uppercase tracking-widest">Minh họa trực quan bài giảng</p>
                                    </div>
                                    <div className="absolute top-10 right-10 w-40 h-40 bg-primary/5 rounded-full" />
                                    <div className="absolute bottom-[-20px] left-[-20px] w-64 h-64 bg-slate-300/10 rounded-full" />
                                 </div>
                                 <div className="grid grid-cols-3 gap-6">
                                    {[1,2,3].map(i => (
                                       <div key={i} className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                          <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.8, delay: i * 0.2 }} className="h-full bg-primary/20" />
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </motion.div>
                     </AnimatePresence>

                     {/* Progress Indicator */}
                     <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {slides.map((_, i) => (
                           <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentSlide ? "w-8 bg-primary" : "w-1.5 bg-slate-300"}`} />
                        ))}
                     </div>
                  </div>

                  {/* Watermark for Teachers */}
                  {!isAdmin && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-[0.03] flex items-center justify-center rotate-45">
                       <p className="text-8xl font-black text-slate-900 whitespace-nowrap">MENGLISH ACADEMIC CENTER • PPTX PROTECTED • VIEW ONLY</p>
                    </div>
                  )}

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/5 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-0 group-hover/slide:opacity-100 transition-all cursor-default">
                    Click anywhere on slide to advance
                  </div>
              </div>

              {/* View Status Footer */}
              {!isAdmin && (
                <div className="bg-amber-50 p-4 border-t border-amber-100 flex items-center justify-center gap-2">
                   <AlertCircle className="w-4 h-4 text-amber-500" />
                   <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest italic">Bạn đang ở chế độ xem học liệu trực tuyến. Download bị vô hiệu hóa để bảo mật quyền sở hữu trí tuệ.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentsPage;
