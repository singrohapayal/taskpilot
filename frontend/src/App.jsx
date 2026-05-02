import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { AuthProvider } from "./contexts/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Tasks from "./pages/Tasks";

import Sidebar from "./components/Sidebar";

// 🔓 PUBLIC ROUTE (Login/Register)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

// 🔐 PROTECTED ROUTE
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// 📦 LAYOUT
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

// 🚀 MAIN APP
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ✅ FIX: ROOT ROUTE */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* PUBLIC */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          {/* PROTECTED */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/projects" element={
            <ProtectedRoute>
              <AppLayout>
                <Projects />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/projects/:id" element={
            <ProtectedRoute>
              <AppLayout>
                <ProjectDetail />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/tasks" element={
            <ProtectedRoute>
              <AppLayout>
                <Tasks />
              </AppLayout>
            </ProtectedRoute>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
