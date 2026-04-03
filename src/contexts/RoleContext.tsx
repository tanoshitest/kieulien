import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Role } from "@/data/mockData";

interface RoleContextType {
  role: Role;
  isLoggedIn: boolean;
  login: (r: Role) => void;
  logout: () => void;
  toggleRole: () => void;
  changeRole: (r: Role) => void;
  isAdmin: boolean;
  isTeacher: boolean;
  isParent: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("menglish_is_logged_in") === "true";
  });

  const [role, setRole] = useState<Role>(() => {
    try {
      const savedRole = localStorage.getItem("menglish_user_role");
      if (savedRole === "admin" || savedRole === "teacher" || savedRole === "parent") {
        return savedRole as Role;
      }
    } catch (e) {
      console.error("Failed to load role from localStorage", e);
    }
    return "admin";
  });

  useEffect(() => {
    localStorage.setItem("menglish_user_role", role);
    localStorage.setItem("menglish_is_logged_in", isLoggedIn.toString());
  }, [role, isLoggedIn]);

  const login = useCallback((r: Role) => {
    setRole(r);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  const toggleRole = useCallback(() => setRole((r) => {
    if (r === "admin") return "teacher";
    if (r === "teacher") return "parent";
    return "admin";
  }), []);

  const changeRole = useCallback((newRole: Role) => setRole(newRole), []);
  
  return (
    <RoleContext.Provider value={{ 
      role, 
      isLoggedIn,
      login,
      logout,
      toggleRole, 
      changeRole,
      isAdmin: role === "admin", 
      isTeacher: role === "teacher",
      isParent: role === "parent"
    }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
};
