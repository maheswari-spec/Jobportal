import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Search, MapPin, Briefcase, DollarSign, Bookmark, Info, Check } from 'lucide-react';

export const Jobs = () => {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const location = '';
  const [type, setType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [coverLetterText, setCoverLetterText] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  // Fetch Jobs List
  const { data: jobsResponse, refetch } = useQuery({
    queryKey: ['jobs', search, location, type, experienceLevel],
    queryFn: async () => {
      const res = await api.get('/jobs', {
        params: { search, location, type, experienceLevel }
      });
      return res.data;
    }
  });

  const queryClient = useQueryClient();

  // Fetch Candidates Resumes (for application choose list)
  const { data: profileResponse } = useQuery({
    queryKey: ['profileCandidateResumes'],
    queryFn: async () => {
      const res = await api.get('/profile/me');
      return res.data.data;
    },
    enabled: user?.role === 'candidate'
  });

  const { data: candidateApplications } = useQuery({
    queryKey: ['myApplications'],
    queryFn: async () => {
      const res = await api.get('/applications/my-applications');
      return res.data.data;
    },
    enabled: user?.role === 'candidate'
  });

  // Fetch Selected Job Details
  const { data: jobDetailsResponse } = useQuery({
    queryKey: ['jobDetails', selectedJobId],
    queryFn: async () => {
      const res = await api.get(`/jobs/${selectedJobId}`);
      return res.data.data;
    },
    enabled: !!selectedJobId
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      return await api.post('/applications/apply', {
        jobId: selectedJobId,
        resumeId: selectedResumeId,
        coverLetter: coverLetterText
      });
    },
    onSuccess: async () => {
      setApplySuccess(true);
      await queryClient.invalidateQueries(['myApplications']);
      setTimeout(() => {
        setApplySuccess(false);
        setApplyModalOpen(false);
        setCoverLetterText('');
      }, 2000);
    }
  });

  const handleApply = () => {
    const defaultResume = profileResponse?.primaryResume?._id || profileResponse?.resumes?.[0]?._id;
    if (defaultResume) {
      setSelectedResumeId(defaultResume);
    }
    setApplyModalOpen(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const activeJob = jobDetailsResponse;
  const jobsList = jobsResponse?.data || [];
  const currentApplication = candidateApplications?.find((application: any) => application.job?._id === selectedJobId || application.job === selectedJobId);
  const alreadyApplied = Boolean(currentApplication);

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 overflow-hidden font-sans">
      
      {/* Jobs Search & list panel */}
      <div className="flex w-full flex-col md:w-5/12 bg-white rounded-3xl border border-slate-200 p-5 dark:bg-dark-900 dark:border-dark-800">
        
        {/* Search header Form */}
        <form onSubmit={handleSearchSubmit} className="space-y-3 mb-5">
          <div className="relative">
            <Search className="absolute top-3.5 left-3.5 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search job title, keywords..."
              className="w-full rounded-xl bg-slate-100 dark:bg-dark-800 border-none py-3 pl-11 pr-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-xl bg-slate-100 dark:bg-dark-800 border-none text-xs text-slate-600 dark:text-dark-300 py-2.5 px-3 focus:outline-none"
            >
              <option value="">Job Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Remote">Remote</option>
            </select>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="rounded-xl bg-slate-100 dark:bg-dark-800 border-none text-xs text-slate-600 dark:text-dark-300 py-2.5 px-3 focus:outline-none"
            >
              <option value="">Experience Level</option>
              <option value="Entry">Entry</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
              <option value="Director">Director</option>
            </select>
          </div>
        </form>

        {/* Jobs list */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {jobsList.map((job: any) => (
            <div
              key={job._id}
              onClick={() => setSelectedJobId(job._id)}
              className={`
                cursor-pointer rounded-2xl border p-4 transition-all hover:scale-[1.01]
                ${selectedJobId === job._id 
                  ? 'border-primary-500 bg-primary-500/5 dark:bg-primary-950/10' 
                  : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 dark:border-dark-800 dark:bg-dark-800/20'}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white line-clamp-1">{job.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-dark-400 font-semibold">{job.company?.name}</p>
                </div>
                <span className="rounded bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700 uppercase dark:bg-primary-950/40 dark:text-primary-400">
                  {job.type}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-dark-400">
                <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>
                {job.salaryRange && (
                  <span className="flex items-center gap-1">
                    <DollarSign size={12} />
                    {Math.round(job.salaryRange.min / 1000)}k - {Math.round(job.salaryRange.max / 1000)}k
                  </span>
                )}
              </div>
            </div>
          ))}
          {jobsList.length === 0 && (
            <div className="py-12 text-center text-slate-400">No job postings found matching criteria.</div>
          )}
        </div>
      </div>

      {/* Selected Job Details Panel */}
      <div className="hidden flex-1 flex-col bg-white rounded-3xl border border-slate-200 p-6 dark:bg-dark-900 dark:border-dark-800 md:flex overflow-y-auto">
        {activeJob ? (
          <div className="space-y-6">
            
            {/* Detail header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-5 dark:border-dark-800/80">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">{activeJob.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-dark-400">
                  <span className="font-semibold text-primary-600 dark:text-primary-400">{activeJob.company?.name}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} />{activeJob.location}</span>
                  <span className="flex items-center gap-1"><Briefcase size={14} />{activeJob.experienceLevel} Level</span>
                </div>
              </div>
              
              {user?.role === 'candidate' && (
                <div className="flex gap-2">
                  <button className="rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50 dark:border-dark-800 dark:hover:bg-dark-850">
                    <Bookmark size={18} className="text-slate-500" />
                  </button>
                  {alreadyApplied ? (
                    <button
                      disabled
                      className="flex items-center gap-2 rounded-xl bg-slate-200 px-5 py-2.5 text-xs font-bold text-slate-500 dark:bg-dark-800 dark:text-dark-300"
                    >
                      {currentApplication?.status === 'screening'
                        ? 'Shortlisted'
                        : currentApplication?.status === 'interviewing'
                        ? 'Interview Scheduled'
                        : currentApplication?.status === 'offered'
                        ? 'Offer Sent'
                        : currentApplication?.status === 'rejected'
                        ? 'Rejected'
                        : 'Applied'}
                    </button>
                  ) : (
                    <button 
                      onClick={handleApply}
                      className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-500"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-4 text-sm leading-relaxed">
              <div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-dark-200 uppercase tracking-wider mb-2">Job Description</h3>
                <p className="text-slate-600 dark:text-dark-400">{activeJob.description}</p>
              </div>

              {activeJob.requirements && activeJob.requirements.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 dark:text-dark-200 uppercase tracking-wider mb-2">Requirements</h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-dark-400">
                    {activeJob.requirements.map((req: string, idx: number) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeJob.skillsRequired && activeJob.skillsRequired.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 dark:text-dark-200 uppercase tracking-wider mb-2">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {activeJob.skillsRequired.map((skill: string, idx: number) => (
                      <span key={idx} className="rounded-full bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-600 dark:bg-dark-800 dark:text-dark-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <Info size={40} className="mb-3 text-slate-350" />
            <p>Select a job listing to view description and requirements.</p>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-dark-900 border border-slate-200 dark:border-dark-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Job Application</h3>
            <p className="text-xs text-slate-500 dark:text-dark-400 mb-6">Choose a resume format to send for this software position.</p>

            {applySuccess ? (
              <div className="flex flex-col items-center justify-center py-10 text-green-500">
                <Check size={48} className="animate-bounce mb-3" />
                <p className="font-bold">Application Sent Successfully!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">Select Resume</label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-4 text-sm focus:outline-none"
                  >
                    {profileResponse?.resumes?.map((res: any) => (
                      <option key={res._id} value={res._id}>{res.title} {res.isPrimary ? '(Primary)' : ''}</option>
                    ))}
                    {(!profileResponse?.resumes || profileResponse.resumes.length === 0) && (
                      <option value="">No resumes found. Please upload or tailor one.</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">Optional Cover Letter</label>
                  <textarea
                    rows={4}
                    value={coverLetterText}
                    onChange={(e) => setCoverLetterText(e.target.value)}
                    placeholder="Brief letter describing your motivation..."
                    className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-4 text-sm placeholder-slate-400 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-dark-800/80">
                  <button 
                    onClick={() => setApplyModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold hover:bg-slate-50 dark:border-dark-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => applyMutation.mutate()}
                    disabled={!selectedResumeId || applyMutation.isPending}
                    className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-500 disabled:opacity-50"
                  >
                    Submit Application
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Jobs;
