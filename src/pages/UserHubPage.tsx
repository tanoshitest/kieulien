import React, { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, UserCog } from "lucide-react";
import StudentsPage from "@/pages/StudentsPage";
import UserManagementPage from "@/pages/UserManagementPage";

type Tab = "students" | "ops";

const UserHubPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>("students");

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Tab switcher bar */}
      <div className="sticky top-0 z-[60] bg-[#f8fafc]/90 backdrop-blur-md border-b border-slate-200/60 px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <h1 className="text-sm font-black text-slate-700 uppercase tracking-widest">
            Quản lý người dùng
          </h1>
          <div className="flex p-1 bg-slate-200/50 rounded-2xl relative border border-slate-200/50 shadow-inner">
            {[
              { id: "students" as const, label: "Học sinh", icon: GraduationCap },
              { id: "ops" as const, label: "Vận hành", icon: UserCog },
            ].map(t => {
              const active = tab === t.id;
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`relative px-5 py-2 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl flex items-center gap-2 ${
                    active ? "text-primary z-10" : "text-slate-500 hover:text-slate-900"
                  }`}>
                  {active && (
                    <motion.div
                      layoutId="user-hub-tab"
                      className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-100"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Page content (each page renders its own header inside) */}
      <div>
        {tab === "students" ? <StudentsPage /> : <UserManagementPage />}
      </div>
    </div>
  );
};

export default UserHubPage;
