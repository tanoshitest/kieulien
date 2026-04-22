import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Shield, GraduationCap, Users, Heart } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import AdminSyllabusView from "@/components/syllabus/AdminSyllabusView";
import TeacherSyllabusView from "@/components/syllabus/TeacherSyllabusView";
import TASyllabusView from "@/components/syllabus/TASyllabusView";
import ParentSyllabusView from "@/components/syllabus/ParentSyllabusView";

const roleConfig = {
  admin: {
    label: "Quản trị viên",
    sublabel: "Tạo & quản lý giáo trình",
    icon: Shield,
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  teacher: {
    label: "Giảng viên",
    sublabel: "Xem giáo án & chấm bài",
    icon: GraduationCap,
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  ta: {
    label: "Học vụ / Trợ giảng",
    sublabel: "Điểm danh & báo cáo buổi học",
    icon: Users,
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    text: "text-violet-700",
  },
  parent: {
    label: "Phụ huynh / Học sinh",
    sublabel: "Xem tiến độ & nộp bài tập",
    icon: Heart,
    gradient: "from-rose-500 to-pink-600",
    bg: "bg-rose-50",
    text: "text-rose-700",
  },
};

const SyllabusPage: React.FC = () => {
  const { role, isAdmin, isTeacher, isParent, isTA } = useRole();

  const cfg = roleConfig[role] ?? roleConfig.admin;
  const Icon = cfg.icon;

  const renderContent = () => {
    if (isAdmin) return <AdminSyllabusView />;
    if (isTeacher) return <TeacherSyllabusView />;
    if (isTA) return <TASyllabusView />;
    if (isParent) return <ParentSyllabusView />;
    return null;
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border"
      >
        <div className="flex items-center gap-3 px-6 py-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cfg.gradient} flex items-center justify-center flex-shrink-0`}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base text-foreground leading-tight">Syllabus</h1>
            <p className="text-xs text-muted-foreground">{cfg.sublabel}</p>
          </div>
          <div className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full ${cfg.bg}`}>
            <Icon className={`w-3.5 h-3.5 ${cfg.text}`} />
            <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
          </div>
        </div>
      </motion.div>

      {/* Role-specific content */}
      <motion.div
        key={role}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
};

export default SyllabusPage;
