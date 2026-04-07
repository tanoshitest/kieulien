import React, { useState } from "react";
import { ParentSurveyForm } from "@/components/survey/ParentSurveyForm";
import { AdminSurveyDashboard } from "@/components/survey/AdminSurveyDashboard";
import { ShieldCheck, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SurveyDemoPage = () => {
  const [activeTab, setActiveTab] = useState<"parent" | "admin">("parent");

  return (
    <div className="min-h-screen bg-slate-50 overflow-y-auto">
      {/* Dev Mode Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-black text-xs">
             Dev
           </div>
           <div>
             <h1 className="font-black text-sm text-slate-800 uppercase tracking-tight">Survey Module Demo</h1>
             <p className="text-[10px] text-slate-500 font-medium">Bản test tích hợp cả 2 vai trò Phụ huynh & Quản trị</p>
           </div>
        </div>

        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 shadow-inner">
          <button
             onClick={() => setActiveTab("parent")}
             className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
               activeTab === "parent" 
                 ? "bg-white text-primary shadow-sm" 
                 : "text-slate-400 hover:text-slate-600"
             }`}
          >
             <User className="w-4 h-4" /> Góc Phụ huynh
          </button>
          <button
             onClick={() => setActiveTab("admin")}
             className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
               activeTab === "admin" 
                 ? "bg-white text-purple-600 shadow-sm" 
                 : "text-slate-400 hover:text-slate-600"
             }`}
          >
             <ShieldCheck className="w-4 h-4" /> Báo cáo Admin
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
         <AnimatePresence mode="wait">
            {activeTab === "parent" ? (
               <motion.div 
                 key="parent-dash" 
                 initial={{ opacity: 0, y: 10 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
               >
                 <ParentSurveyForm />
               </motion.div>
            ) : (
               <motion.div 
                 key="admin-dash" 
                 initial={{ opacity: 0, y: 10 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
               >
                 <AdminSurveyDashboard />
               </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
};

export default SurveyDemoPage;
