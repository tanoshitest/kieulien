import React, { useState } from "react";
import { useRole } from "@/contexts/RoleContext";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, UserCog,
  Headphones, DollarSign, ClipboardList, Settings, Menu, X,
  ChevronRight, School, FileText, Bell, Calendar, Option,
  Fingerprint, Wallet, MessageCircle, ClipboardCheck, History,
  PieChart, MessageSquareX, BarChart3, Repeat, GraduationCap as StudentIcon,
  CircleDollarSign, Layers, CalendarClock, TrendingUp, HandCoins, Building2,
  Users2, Clock, BellRing, UserMinus, ShieldAlert, LineChart, LogOut
} from "lucide-react";
import { notifications } from "@/data/mockData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  parentOnly?: boolean;
  teacherOnly?: boolean;
}

const navItems: NavItem[] = [
  // Dashboard removed as per user request
  { label: "Lớp học của tôi", path: "/my-classes", icon: BookOpen, teacherOnly: true },
  { label: "Quản lý lớp học", path: "/courses", icon: BookOpen, adminOnly: true },
  { label: "Quản lý học sinh", path: "/students", icon: GraduationCap, adminOnly: true },
  { label: "Quản lý User", path: "/users", icon: UserCog, adminOnly: true },
  { label: "Lịch dạy", path: "/schedule", icon: Calendar },
  { label: "Quản lý tài liệu", path: "/documents", icon: FileText, adminOnly: true },
  { label: "Quản lý hàng hoá", path: "/inventory", icon: Layers, adminOnly: true },
  { label: "Phân công công việc", path: "/tasks", icon: ClipboardList },
  { label: "Ghi chú chấm công", path: "/timekeeping", icon: Fingerprint, teacherOnly: true },
  { label: "Báo cáo", path: "/admin-reports", icon: BarChart3, adminOnly: true },
  { label: "Cấu hình", path: "/settings", icon: Settings, adminOnly: true },
  // Parent Items
  { label: "Thông tin học viên", path: "/parent-portal", icon: GraduationCap, parentOnly: true },
  { label: "Lớp học & Kết quả", path: "/parent-portal?tab=grades", icon: BookOpen, parentOnly: true },
  { label: "Học phí & Lịch sử", path: "/parent-portal?tab=finance", icon: Wallet, parentOnly: true },
  { label: "Báo cáo học tập", path: "/parent-portal?tab=reports", icon: ClipboardList, parentOnly: true },
  { label: "Liên hệ Trung tâm", path: "/parent-portal?tab=contact", icon: MessageCircle, parentOnly: true },
];


const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, login, logout, isAdmin, isTeacher, isParent } = useRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
   const [showNotifications, setShowNotifications] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [crmOpen, setCrmOpen] = useState(true);

  const filteredNav = navItems.filter((item) => {
    if (isParent) return item.parentOnly;
    if (item.parentOnly) return false;
    if (item.adminOnly && !isAdmin) return false;
    if (item.teacherOnly && !isTeacher) return false;
    return true;
  });
  const currentPage = navItems.find((n) => n.path === location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Universal Sidebar - (Admin Style for All) */}
      <aside className={`hidden lg:flex flex-col ${isCollapsed ? 'w-16' : 'w-60'} bg-sidebar border-r border-sidebar-border flex-shrink-0 transition-all duration-300 ease-in-out relative group`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} px-4 py-4 border-b border-sidebar-border h-14`}>
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-sidebar-border overflow-hidden p-1">
            <img src="/logo_me.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-bold text-sidebar-primary text-sm truncate"
            >
              MENGLISH
            </motion.span>
          )}
          
          {/* Collapse Toggle Button - Floating on edge or in header */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 bg-white border border-sidebar-border shadow-sm rounded-full p-1 text-sidebar-foreground hover:text-primary transition-colors z-50 lg:flex hidden"
          >
            <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${isCollapsed ? "" : "rotate-180"}`} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 font-medium">
            {/* CRM Collapsible - NOW ON TOP */}
            {isAdmin && (
              <button
                onClick={() => navigate("/crm")}
                title={isCollapsed ? "CRM tuyển sinh" : ""}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-md font-bold text-sm transition-colors ${
                  location.pathname.startsWith("/crm")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <Users2 className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span>CRM tuyển sinh</span>}
              </button>
            )}

            {filteredNav.map((item) => {
              const active = item.path.includes('?') 
                ? (location.pathname + location.search) === item.path
                : location.pathname === item.path && !location.search;
              
              // Special case: if we are at exactly /parent-portal without any tab param, highlight the first tab
              const isFirstParentTab = item.path === "/parent-portal" && location.pathname === "/parent-portal" && !location.search;
              const isTrulyActive = active || isFirstParentTab;

              const label = item.path === "/tasks"
                ? (isAdmin ? "Phân công công việc" : "Công việc của tôi")
                : item.path === "/courses" 
                ? (isAdmin ? "Quản lý lớp học" : "Lớp đc phân công")
                : item.path === "/schedule"
                ? (isAdmin ? "Quản lý lịch dạy" : "Lịch dạy của tôi")
                : item.path === "/timekeeping"
                ? (isAdmin ? "Quản lý chấm công" : "Chấm công của tôi")
                : item.label;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  title={isCollapsed ? label : ""}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-md text-sm transition-colors ${
                    isTrulyActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-bold shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {!isCollapsed && <span>{label}</span>}
                </button>
              );
            })}

        </nav>
        <div className="p-3 border-t border-sidebar-border relative">
          {!isCollapsed && <div className="text-xs text-sidebar-muted mb-1 px-3">Vai trò hiện tại</div>}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2 px-3'} py-2 rounded-md text-sm bg-sidebar-accent text-sidebar-accent-foreground hover:bg-primary hover:text-primary-foreground transition-colors outline-none cursor-pointer`}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isAdmin ? "bg-kpi-blue" : isTeacher ? "bg-kpi-green" : "bg-purple-500"}`} />
                {!isCollapsed && (
                  <>
                    {isAdmin ? "Admin" : isTeacher ? "Giảng viên" : "Phụ huynh"}
                    <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] mb-2 z-[60]">
              <DropdownMenuLabel>Chọn Vai trò</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { logout(); navigate("/"); toast.info("Đã đăng xuất"); }}>
                <LogOut className="w-4 h-4 mr-2 text-rose-500" />
                <span className="text-rose-500 font-bold">Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-64 bg-sidebar z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-sidebar-border overflow-hidden p-1">
                    <img src="/logo_me.png" alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-bold text-sidebar-primary text-sm">MENGLISH</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-sidebar-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
                {filteredNav.map((item) => {
                  const active = location.pathname === item.path;
                      const label = item.path === "/tasks"
                        ? (isAdmin ? "Phân công công việc" : "Công việc của tôi")
                      : item.path === "/schedule"
                        ? (isAdmin ? "Quản lý lịch dạy" : "Lịch dạy của tôi")
                      : item.path === "/users"
                        ? "Quản lý User"
                      : item.label;
                  return (
                    <button
                      key={item.path}
                      onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-bold"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {label}
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Floating Toggle Button for Mobile Menu */}
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="lg:hidden fixed top-4 right-4 z-50 p-2.5 bg-primary text-white rounded-full shadow-2xl active:scale-90 transition-transform"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page content - Full Screen Mode */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
