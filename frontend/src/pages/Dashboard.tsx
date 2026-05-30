import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { 
  Sparkles, 
  Briefcase, 
  Send, 
  Clock, 
  TrendingUp, 
  CheckCircle,
  Users,
  MessageSquare,
  FileText
  , XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuthStore();

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profileMe'],
    queryFn: async () => {
      const res = await api.get('/profile/me');
      return res.data.data;
    },
    enabled: user?.role !== 'admin'
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data.data;
    },
    enabled: user?.role === 'admin'
  });

  const { data: candidateApplications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['myApplications'],
    queryFn: async () => {
      const res = await api.get('/applications/my-applications');
      return res.data.data;
    },
    enabled: user?.role === 'candidate'
  });

  const { data: userChats, isLoading: chatsLoading } = useQuery({
    queryKey: ['userChats'],
    queryFn: async () => {
      const res = await api.get('/chat');
      return res.data.data;
    },
    enabled: user?.role !== 'admin'
  });

  const { data: recruiterStats, isLoading: recruiterStatsLoading } = useQuery({
    queryKey: ['recruiterStats'],
    queryFn: async () => {
      const res = await api.get('/applications/recruiter/stats');
      return res.data.data;
    },
    enabled: user?.role === 'recruiter'
  });

  if (profileLoading || statsLoading || applicationsLoading || chatsLoading || recruiterStatsLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  // --- CANDIDATE VIEW ---
  const renderCandidateDashboard = () => {
    const resumesCount = profileData?.resumes?.length || 0;
    const skillsCount = profileData?.skills?.length || 0;
    const applicationsSent = candidateApplications?.length || 0;
    const interviewsScheduled = candidateApplications?.filter((application: any) => application.status === 'interviewing').length || 0;
    const offersReceived = candidateApplications?.filter((application: any) => application.status === 'offered').length || 0;
    const declinesReceived = candidateApplications?.filter((application: any) => application.status === 'rejected').length || 0;
    const chatThreads = userChats?.length || 0;
    const latestApplication = candidateApplications?.[0];
    const latestStatus = latestApplication?.status || 'applied';
    const isRejected = latestStatus === 'rejected';
    const statusOrder = ['applied', 'screening', 'interviewing', 'offered', 'hired'];
    const activeStepIndex = isRejected ? statusOrder.length : Math.max(0, statusOrder.indexOf(latestStatus));

    return (
      <div className="space-y-8 font-sans">
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-primary-600 to-indigo-600 p-6 text-white shadow-xl md:p-8">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold md:text-3xl">Hello, {profileData?.firstName || 'User'}!</h2>
            <p className="mt-2 text-sm text-primary-100">
              Welcome to your personal AI career hub. Optimize your resume for specific Job Descriptions, generate tailored cover letters, and find your perfect role today.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link 
                to="/builder" 
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-primary-600 shadow-md hover:bg-slate-50 transition-all"
              >
                <Sparkles size={14} />
                Tailor Resume with AI
              </Link>
              <Link 
                to="/jobs" 
                className="flex items-center gap-2 rounded-xl bg-primary-700/50 border border-primary-400/30 px-4 py-2.5 text-xs font-semibold hover:bg-primary-700 transition-all"
              >
                Search Jobs
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400">
              <FileText size={20} />
            </div>
            <p className="mt-4 text-2xl font-bold">{resumesCount}</p>
            <p className="text-xs text-slate-500 dark:text-dark-400">Saved Resumes</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400">
              <Send size={20} />
            </div>
            <p className="mt-4 text-2xl font-bold">{applicationsSent}</p>
            <p className="text-xs text-slate-500 dark:text-dark-400">Applications Sent</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
              <Clock size={20} />
            </div>
            <p className="mt-4 text-2xl font-bold">{interviewsScheduled}</p>
            <p className="text-xs text-slate-500 dark:text-dark-400">Interviews Scheduled</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
              <TrendingUp size={20} />
            </div>
            <p className="mt-4 text-2xl font-bold">{skillsCount}</p>
            <p className="text-xs text-slate-500 dark:text-dark-400">Profile Skills Listed</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
              <MessageSquare size={20} />
            </div>
            <p className="mt-4 text-2xl font-bold">{chatThreads}</p>
            <p className="text-xs text-slate-500 dark:text-dark-400">Chat Threads</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <CheckCircle size={20} />
            </div>
            <p className="mt-4 text-2xl font-bold">{offersReceived}</p>
            <p className="text-xs text-slate-500 dark:text-dark-400">Offers Received</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
              <XCircle size={20} />
            </div>
            <p className="mt-4 text-2xl font-bold">{declinesReceived}</p>
            <p className="text-xs text-slate-500 dark:text-dark-400">Declines Received</p>
          </div>
        </div>

        {/* Application status timeline tracker */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
          <h3 className="mb-6 text-sm font-bold text-slate-700 dark:text-dark-200 uppercase tracking-wider">Active Job Application Progress</h3>
          <div className="relative flex flex-col gap-6 md:flex-row md:justify-between md:gap-0">
            {/* Timeline connectors (horizontal in md, vertical on mobile) */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-dark-800 md:left-0 md:right-0 md:top-5 md:bottom-auto md:h-0.5 md:w-full"></div>
            
            {[
              { label: 'Applied', desc: 'Application received' },
              { label: 'Screening', desc: 'Resume review' },
              { label: 'Interviewing', desc: 'Live video panels' },
              { label: isRejected ? 'Rejected' : 'Offered / Decision', desc: isRejected ? 'Application was declined' : 'Final contract status' },
            ].map((step, idx) => {
              const isDone = idx < activeStepIndex || idx === activeStepIndex;
              const isActive = idx === activeStepIndex;
              return (
                <div key={idx} className="relative z-10 flex gap-4 md:flex-col md:items-center md:gap-0 md:text-center">
                  <div className={`
                    flex h-9 w-9 items-center justify-center rounded-full border-4 border-white shadow-sm dark:border-dark-900
                    ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-primary-500 text-white animate-pulse' : 'bg-slate-200 text-slate-400 dark:bg-dark-800'}
                  `}>
                    {isDone ? <CheckCircle size={14} /> : <Clock size={14} />}
                  </div>
                  <div className="md:mt-3">
                    <p className="text-sm font-bold">{step.label}</p>
                    <p className="text-[11px] text-slate-500 dark:text-dark-400">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // --- RECRUITER VIEW ---
  const renderRecruiterDashboard = () => {
    const jobsCount = profileData?.company?.jobs?.length || 0;
    const totalApplicants = profileData?.company?.jobs?.reduce((total: number, job: any) => total + (job.applicantsCount || 0), 0) || 0;
    const shortlistedResumes = recruiterStats?.shortlistedResumes ?? 0;
    const chatThreads = userChats?.length || 0;

    return (
      <div className="space-y-8 font-sans">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Recruiter Console</h2>
            <p className="text-sm text-slate-500 dark:text-dark-400">Manage candidates and post job vacancies for {profileData?.company?.name || 'your company'}</p>
          </div>
          <Link 
            to="/post-job"
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-500 transition-all"
          >
            Create Job Post
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400">
              <Briefcase size={20} />
            </div>
            <p className="mt-4 text-2xl font-bold">{jobsCount}</p>
            <p className="text-xs text-slate-500 dark:text-dark-400">Active Openings</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400">
              <Users size={20} />
            </div>
            <p className="mt-4 text-2xl font-bold">{totalApplicants}</p>
            <p className="text-xs text-slate-500 dark:text-dark-400">Total Applicants</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
              <CheckCircle size={20} />
            </div>
            <p className="mt-4 text-2xl font-bold">{shortlistedResumes}</p>
            <p className="text-xs text-slate-500 dark:text-dark-400">Shortlisted Resume</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
              <MessageSquare size={20} />
            </div>
            <p className="mt-4 text-2xl font-bold">{chatThreads}</p>
            <p className="text-xs text-slate-500 dark:text-dark-400">Chat Threads</p>
          </div>
        </div>

        {/* Company Jobs summary table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
          <h3 className="mb-4 text-sm font-bold text-slate-700 dark:text-dark-200 uppercase tracking-wider">Active Listings Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase dark:border-dark-800">
                  <th className="py-3 font-semibold">Job Title</th>
                  <th className="py-3 font-semibold">Applicants</th>
                  <th className="py-3 font-semibold">Views</th>
                  <th className="py-3 font-semibold">Status</th>
                  <th className="py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm dark:divide-dark-800/50">
                {profileData?.company?.jobs?.map((job: any, idx: number) => {
                  const jobId = job?._id || job;
                  const jobTitle = job?.title || 'Job Listing';
                  return (
                    <tr key={idx}>
                      <td className="py-3.5 font-semibold text-slate-800 dark:text-white">{jobTitle}</td>
                      <td className="py-3.5">{job?.applicantsCount || 0}</td>
                      <td className="py-3.5">{job?.viewsCount || 0}</td>
                      <td className="py-3.5">
                        <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700 dark:bg-green-950/30 dark:text-green-400">
                          {job?.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <Link
                          to={`/job/${jobId}/applicants`}
                          className="rounded-full bg-primary-600 px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-primary-500"
                        >
                          View Applicants
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {(!profileData?.company?.jobs || profileData.company.jobs.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">No active job listings. Click &quot;Create Job Post&quot; to add one.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- ADMIN VIEW ---
  const renderAdminDashboard = () => {
    return (
      <div className="space-y-8 font-sans">
        <div>
          <h2 className="text-2xl font-bold">Platform Administration</h2>
          <p className="text-sm text-slate-500 dark:text-dark-400">System overview stats and user reports monitoring</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400">
              <Users size={20} />
            </div>
            <p className="mt-4 text-2xl font-bold">{statsData?.counts?.users || 0}</p>
            <p className="text-xs text-slate-500 dark:text-dark-400">Registered Users</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400">
              <Briefcase size={20} />
            </div>
            <p className="mt-4 text-2xl font-bold">{statsData?.counts?.jobs || 0}</p>
            <p className="text-xs text-slate-500 dark:text-dark-400">Job Vacancies</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
              <FileText size={20} />
            </div>
            <p className="mt-4 text-2xl font-bold">{statsData?.counts?.resumes || 0}</p>
            <p className="text-xs text-slate-500 dark:text-dark-400">Resumes Analyzed</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
              <Send size={20} />
            </div>
            <p className="mt-4 text-2xl font-bold">{statsData?.counts?.applications || 0}</p>
            <p className="text-xs text-slate-500 dark:text-dark-400">Applications Sent</p>
          </div>
        </div>

        {/* User moderating quick menu */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
          <h3 className="mb-4 text-sm font-bold text-slate-700 dark:text-dark-200 uppercase tracking-wider">Quick Controls</h3>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/admin/users" 
              className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold hover:bg-slate-100 dark:border-dark-850 dark:bg-dark-850 dark:hover:bg-dark-800 transition-all"
            >
              Manage / Block Users
            </Link>
          </div>
        </div>
      </div>
    );
  };

  if (user?.role === 'admin') return renderAdminDashboard();
  if (user?.role === 'recruiter') return renderRecruiterDashboard();
  return renderCandidateDashboard();
};

export default Dashboard;
