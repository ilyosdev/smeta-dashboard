import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '@/lib/auth';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// Auth pages
import LoginPage from '@/pages/auth/login';
import RegisterPage from '@/pages/auth/register';

// Dashboard pages
import HomePage from '@/pages/dashboard/index';
import ProjectsPage from '@/pages/dashboard/projects';
import ProjectDetailPage from '@/pages/dashboard/projects/[id]';
import SubProjectDetailPage from '@/pages/dashboard/projects/[id]/sub-projects/[projectId]';
import RequestsPage from '@/pages/dashboard/requests';
import PendingRequestsPage from '@/pages/dashboard/requests/pending';
import UsersPage from '@/pages/dashboard/users';
import WorkersPage from '@/pages/dashboard/workers';
import SuppliersPage from '@/pages/dashboard/suppliers';
import WarehousePage from '@/pages/dashboard/warehouse';
import FinancePage from '@/pages/dashboard/finance';
import ReportsPage from '@/pages/dashboard/reports';
import SettingsPage from '@/pages/dashboard/settings';
import ValidationPage from '@/pages/dashboard/validation';
import SmetaDetailPage from '@/pages/dashboard/smetas/[id]';

function App() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Dashboard routes (protected) */}
      <Route
        element={
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/projects/:id/projects/:projectId" element={<SubProjectDetailPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/requests/pending" element={<PendingRequestsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/workers" element={<WorkersPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/warehouse" element={<WarehousePage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/validation" element={<ValidationPage />} />
        <Route path="/smetas/:id" element={<SmetaDetailPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
