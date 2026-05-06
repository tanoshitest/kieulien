import React, { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/contexts/RoleContext";
import { ClassScheduleProvider } from "@/contexts/ClassScheduleContext";
import { SyllabusFeaturesProvider } from "@/contexts/SyllabusFeaturesContext";
import { ForeignNoteProvider } from "@/contexts/ForeignNoteContext";
import AppLayout from "@/components/layout/AppLayout";

import { useRole } from "@/contexts/RoleContext";

// Lazy load all pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const CRMPage = lazy(() => import("@/pages/CRMPage"));
const StudentsPage = lazy(() => import("@/pages/StudentsPage"));
const StudentDetailPage = lazy(() => import("@/pages/StudentDetailPage"));
const UserManagementPage = lazy(() => import("@/pages/UserManagementPage"));
const UserHubPage = lazy(() => import("@/pages/UserHubPage"));
const UserDetailPage = lazy(() => import("@/pages/UserDetailPage"));
const ClassDetailPage = lazy(() => import("@/pages/ClassDetailPage"));
const FinancialManagementPage = lazy(() => import("@/pages/FinancialManagementPage"));
const TicketsPage = lazy(() => import("@/pages/TicketsPage"));
const TasksPage = lazy(() => import("@/pages/TasksPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const DocumentsPage = lazy(() => import("@/pages/DocumentsPage"));
const SchedulePage = lazy(() => import("@/pages/SchedulePage"));
const UnifiedSchedulePage = lazy(() => import("@/pages/UnifiedSchedulePage"));
const TimekeepingPage = lazy(() => import("@/pages/TimekeepingPage"));
const MyClassesPage = lazy(() => import("@/pages/MyClassesPage"));
const ParentDashboard = lazy(() => import("@/pages/ParentDashboard"));
const PronunciationManagementPage = lazy(() => import("@/pages/PronunciationManagementPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const AdminReportsPage = lazy(() => import("@/pages/AdminReportsPage"));
const InventoryPage = lazy(() => import("@/pages/InventoryPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const SurveyDemoPage = lazy(() => import("@/pages/SurveyDemoPage"));
const SyllabusPage = lazy(() => import("@/pages/SyllabusPage"));
const ForeignTeacherSchedulePage = lazy(() => import("@/pages/ForeignTeacherSchedulePage"));

const queryClient = new QueryClient();

const ProtectedApp = () => {
  const { isLoggedIn } = useRole();
  if (!isLoggedIn) return <Navigate to="/" replace />;
  return (
    <AppLayout>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crm" element={<CRMPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:id" element={<StudentDetailPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/user-hub" element={<UserHubPage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="/classes/:id" element={<ClassDetailPage />} />
          <Route path="/finance" element={<FinancialManagementPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/unified-schedule" element={<UnifiedSchedulePage />} />
          <Route path="/timekeeping" element={<TimekeepingPage />} />
          <Route path="/my-classes" element={<MyClassesPage />} />
          <Route path="/parent-portal" element={<ParentDashboard />} />
          <Route path="/pronunciation" element={<PronunciationManagementPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/admin-reports" element={<AdminReportsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/survey-demo" element={<SurveyDemoPage />} />
          <Route path="/syllabus" element={<SyllabusPage />} />
          <Route path="/schedule-foreign" element={<ForeignTeacherSchedulePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};

const App = () => {
  console.log("[App] Rendering App component");
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RoleProvider>
            <ClassScheduleProvider>
              <SyllabusFeaturesProvider>
                <ForeignNoteProvider>
                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/*" element={<ProtectedApp />} />
                    </Routes>
                  </Suspense>
                </ForeignNoteProvider>
              </SyllabusFeaturesProvider>
            </ClassScheduleProvider>
          </RoleProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
