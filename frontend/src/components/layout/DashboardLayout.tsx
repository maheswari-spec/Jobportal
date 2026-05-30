import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  Briefcase, 
  FileText, 
  MessageSquare, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  ShieldAlert, 
  FileEdit,
  Sparkles,
  Building
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const candidateLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Search Jobs', path: '/jobs', icon: Briefcase },
    { label: 'AI Resume Analyzer', path: '/analyzer', icon: Sparkles },
    { label: 'Tailored Resume Builder', path: '/builder', icon: FileEdit },
    { label: 'AI Cover Letter', path: '/cover-letter', icon: FileText },
    { label: 'Chats', path: '/chats', icon: MessageSquare },
    { label: 'My Profile', path: '/profile', icon: UserIcon },
  ];

  const recruiterLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Post a Job', path: '/post-job', icon: Briefcase },
    { label: 'Chats', path: '/chats', icon: MessageSquare },
    { label: 'Company Profile', path: '/company', icon: Building },
    { label: 'My Profile', path: '/profile', icon: UserIcon },
  ];

  const adminLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Manage Users', path: '/admin/users', icon: ShieldAlert },
    { label: 'Chats', path: '/chats', icon: MessageSquare },
  ];

  const getLinks = () => {
    if (!user) return [];
    if (user.role === 'admin') return adminLinks;
    if (user.role === 'recruiter') return recruiterLinks;
    return candidateLinks;
  };

  const links = getLinks();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-dark-950 dark:text-dark-100">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="fixed top-4 left-4 z-50 rounded-lg bg-white p-2 shadow-md dark:bg-dark-800 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white/80 p-5 backdrop-blur-md transition-transform duration-300 dark:border-dark-800 dark:bg-dark-900/80 md:translate-x-0 md:static
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Logo */}
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md">
            <Sparkles size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="font-sans text-lg font-bold tracking-tight text-slate-800 dark:text-white">Kaira</h1>
            <p className="text-[10px] text-primary-500 font-semibold tracking-widest uppercase">Job Platform</p>
          </div>
        </div>

        {/* User Brief info */}
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-slate-100/50 p-3 dark:bg-dark-800/40">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400">
            <UserIcon size={18} />
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-xs font-semibold">{user?.email}</p>
            <span className="inline-block rounded bg-primary-100 px-1.5 py-0.5 text-[10px] font-bold text-primary-700 uppercase dark:bg-primary-950/40 dark:text-primary-400">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400' 
                    : 'text-slate-600 hover:bg-slate-100 dark:text-dark-400 dark:hover:bg-dark-800/50'}
                `}
              >
                <Icon size={18} className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'} />
                {link.label}
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="mt-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </nav>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
