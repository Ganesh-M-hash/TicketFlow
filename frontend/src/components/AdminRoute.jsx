import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function AdminRoute() {
  const { user } = useAuth();

  return user?.role === "Administrator" ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

export default AdminRoute;
