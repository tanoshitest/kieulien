import { useRole } from "@/contexts/RoleContext";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { isParent } = useRole();
  
  // If parent, go to parent portal
  if (isParent) {
    return <Navigate to="/parent-portal" replace />;
  }
  
  // If admin/teacher, default to CRM for now as Dashboard is removed from menu
  return <Navigate to="/crm" replace />;
};

export default Dashboard;
