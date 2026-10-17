
import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import CreateTicket from "./pages/CreateTicket";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Users from "./pages/Users";
import AddUser from "./pages/AddUser";
import { AuthProvider } from "./context/AuthContext.jsx";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="tickets/new" element={<CreateTicket />} />
            <Route path="tickets/:ticketNumber/edit" element={<CreateTicket />} />
            <Route element={<AdminRoute />}>
              <Route path="users" element={<Users />} />
              <Route path="users/new" element={<AddUser />} />
              <Route path="users/:id/edit" element={<AddUser />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
