import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Jobs } from './pages/Jobs';
import { AIAnalyzer } from './pages/AIAnalyzer';
import { ResumeBuilder } from './pages/ResumeBuilder';
import { CoverLetterGenerator } from './pages/CoverLetterGenerator';
import { Chat } from './pages/Chat';
import { Profile } from './pages/Profile';
import { PostJob } from './pages/PostJob';
import { AdminUsers } from './pages/AdminUsers';
import { JobApplicants } from './pages/JobApplicants';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { useSocket } from './hooks/useSocket';
import { AlertCircle } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

export const App = () => {
  const [socketNotification, setSocketNotification] = useState<any>(null);
  useSocket();

  useEffect(() => {
    const handler = (event: any) => {
      setSocketNotification(event.detail);
    };
    window.addEventListener('socket_notification', handler);
    return () => window.removeEventListener('socket_notification', handler);
  }, []);

  useEffect(() => {
    if (!socketNotification) return;
    const timeout = window.setTimeout(() => setSocketNotification(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [socketNotification]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {socketNotification && (
          <div className="fixed right-4 top-4 z-50 max-w-xs rounded-3xl border border-slate-200 bg-white p-4 shadow-xl dark:border-dark-800 dark:bg-dark-950">
            <div className="flex items-start gap-3 text-sm text-slate-900 dark:text-white">
              <AlertCircle size={18} className="mt-0.5 text-primary-600" />
              <div>
                <div className="font-semibold">{socketNotification.title || 'Notification'}</div>
                <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">{socketNotification.message || socketNotification?.message || 'You have a new update.'}</div>
              </div>
            </div>
          </div>
        )}
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected dashboard routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />

          <Route path="/jobs" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Jobs />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/analyzer" element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <DashboardLayout>
                <AIAnalyzer />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/builder" element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <DashboardLayout>
                <ResumeBuilder />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/cover-letter" element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <DashboardLayout>
                <CoverLetterGenerator />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/chats" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Chat />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/company" element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Recruiter specific */}
          <Route path="/post-job" element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <DashboardLayout>
                <PostJob />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/job/:jobId/applicants" element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <DashboardLayout>
                <JobApplicants />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Admin specific */}
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <AdminUsers />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Fallback to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
