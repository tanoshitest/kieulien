import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/contexts/RoleContext";
import { ClassScheduleProvider } from "@/contexts/ClassScheduleContext";
import { SyllabusFeaturesProvider } from "@/contexts/SyllabusFeaturesContext";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import CRMPage from "@/pages/CRMPage";
import StudentsPage from "@/pages/StudentsPage";
import StudentDetailPage from "@/pages/StudentDetailPage";
import UserManagementPage from "@/pages/UserManagementPage";
import UserHubPage from "@/pages/UserHubPage";
import UserDetailPage from "@/pages/UserDetailPage";
import ClassDetailPage from "@/pages/ClassDetailPage";
import FinancialManagementPage from "@/pages/FinancialManagementPage";
import TicketsPage from "@/pages/TicketsPage";
import TasksPage from "@/pages/TasksPage";
import SettingsPage from "@/pages/SettingsPage";
import DocumentsPage from "@/pages/DocumentsPage";
import SchedulePage from "@/pages/SchedulePage";
import TimekeepingPage from "@/pages/TimekeepingPage";
import MyClassesPage from "@/pages/MyClassesPage";
import ParentDashboard from "@/pages/ParentDashboard";
import PronunciationManagementPage from "@/pages/PronunciationManagementPage";
import ReportsPage from "@/pages/ReportsPage";
import AdminReportsPage from "@/pages/AdminReportsPage";
import InventoryPage from "@/pages/InventoryPage";
import LoginPage from "@/pages/LoginPage";
import LandingPage from "@/pages/LandingPage";
import NotFound from "@/pages/NotFound";
import SurveyDemoPage from "@/pages/SurveyDemoPage";
import SyllabusPage from "@/pages/SyllabusPage";
import { useRole } from "@/contexts/RoleContext";

const queryClient = new QueryClient();

const ProtectedApp = () => {
  const { isLoggedIn } = useRole();
  if (!isLoggedIn) return <Navigate to="/" replace />;
  return (
    <AppLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/crm" element={<CRMPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/students/:id" element={<StudentDetailPage />} />
        <Route path="/users" element={<UserHubPage />} />
        <Route path="/users-list" element={<UserManagementPage />} />
        <Route path="/users/:id" element={<UserDetailPage />} />
        <Route path="/classes/:id" element={<ClassDetailPage />} />
        <Route path="/financial" element={<FinancialManagementPage />} />
        <Route path="/teachers/:id" element={<UserDetailPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/timekeeping" element={<TimekeepingPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reports/:type" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/parent-portal" element={<ParentDashboard />} />
        <Route path="/my-classes" element={<MyClassesPage />} />
        <Route path="/pronunciation-management" element={<PronunciationManagementPage />} />
        <Route path="/admin-reports" element={<AdminReportsPage />} />
        <Route path="/survey-demo" element={<SurveyDemoPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/syllabus" element={<SyllabusPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RoleProvider>
          <ClassScheduleProvider>
            <SyllabusFeaturesProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/*" element={<ProtectedApp />} />
              </Routes>
            </SyllabusFeaturesProvider>
          </ClassScheduleProvider>
        </RoleProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
