import React from "react";
import { motion } from "framer-motion";
import { Shield, GraduationCap, Users, Heart, ArrowRight } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import type { Role } from "@/data/mockData";

const LoginPage = () => {
  const { login } = useRole();

  const handleLogin = (role: Role) => {
    login(role);
  };

  return (
    <div className="min-h-screen bg-[#2185d5] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 z-10 flex flex-col items-center"
      >
        <img 
          src="/logo_me.png" 
          alt="MENGLISH Logo" 
          className="h-40 w-auto object-contain"
        />
      </motion.div>

      {/* Central Login Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px] bg-white/10 backdrop-blur-md border-[3px] border-white/20 rounded-[3rem] p-8 shadow-2xl relative z-10"
      >
        <p className="text-[10px] font-black text-white/70 text-center uppercase tracking-[0.3em] mb-6">Vui lòng chọn vai trò</p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleLogin("admin")}
            className="w-full py-3 bg-white text-[#2185d5] rounded-2xl font-black text-base hover:scale-[1.02] active:scale-[0.98] transition-all border-none outline-none shadow-xl shadow-black/5"
          >
            Quản trị viên (Admin)
          </button>
          
          <button
            onClick={() => handleLogin("teacher")}
            className="w-full py-3 bg-white/20 text-white rounded-2xl font-black text-base hover:bg-white/30 hover:scale-[1.02] active:scale-[0.98] transition-all border-none outline-none shadow-lg"
          >
            Giảng viên (Teacher)
          </button>
          
          <button
            onClick={() => handleLogin("parent")}
            className="w-full py-3 bg-white/20 text-white rounded-2xl font-black text-base hover:bg-white/30 hover:scale-[1.02] active:scale-[0.98] transition-all border-none outline-none shadow-lg"
          >
            Phụ huynh (Parent)
          </button>
        </div>
      </motion.div>

      {/* Bottom Footer Branding */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center z-10"
      >
        <p className="text-[13px] font-medium text-white/70 tracking-wide">
          Prototype owned by <span className="font-bold text-white">Tanoshi Vietnam</span>
        </p>
      </motion.div>

      {/* Background Decorative Circles (Subtle) */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default LoginPage;
