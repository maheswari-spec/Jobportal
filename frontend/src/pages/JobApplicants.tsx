import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { ArrowLeft, CheckCircle, FileText, Mail, ClipboardList } from 'lucide-react';

export const JobApplicants = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [feedback, setFeedback] = useState('');

  const { data: applicantsResponse, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['jobApplicants', jobId],
    queryFn: async () => {
      const res = await api.get(`/applications/job/${jobId}`);
      return res.data.data;
    },
    enabled: !!jobId
  });

  const { data: jobDetailsResponse } = useQuery({
    queryKey: ['jobDetails', jobId],
    queryFn: async () => {
      const res = await api.get(`/jobs/${jobId}`);
      return res.data.data;
    },
    enabled: !!jobId
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status, comment }: { applicationId: string; status: string; comment: string }) => {
      const res = await api.patch(`/applications/${applicationId}/status`, { status, comment });
      return res.data.data;
    },
    onSuccess: () => {
      setFeedback('Applicant status updated successfully. Candidate has been notified.');
      refetch();
      setTimeout(() => setFeedback(''), 4500);
    },
    onError: (err: any) => {
      setFeedback(err?.message || 'Unable to update applicant status.');
      setTimeout(() => setFeedback(''), 4500);
    }
  });

  const applicants = applicantsResponse || [];
  const jobTitle = jobDetailsResponse?.title || 'Job Applicants';

  const handleShortlist = (applicationId: string) => {
    updateStatusMutation.mutate({
      applicationId,
      status: 'screening',
      comment: 'Candidate shortlisted for screening.'
    });
  };

  const handleScheduleInterview = (applicationId: string) => {
    updateStatusMutation.mutate({
      applicationId,
      status: 'interviewing',
      comment: 'Interview scheduled for candidate.'
    });
  };

  const handleOffer = (applicationId: string) => {
    updateStatusMutation.mutate({
      applicationId,
      status: 'offered',
      comment: 'Job offer sent to candidate.'
    });
  };

  const handleDecline = (applicationId: string) => {
    updateStatusMutation.mutate({
      applicationId,
      status: 'rejected',
      comment: 'Candidate declined after interview.'
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 hover:text-slate-700 dark:text-dark-300 dark:hover:text-white"
          >
            <ArrowLeft size={14} /> Back to dashboard
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Applicants for "{jobTitle}"</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-dark-400">Review resumes submitted for this role and shortlist candidates for the next stage.</p>
        </div>
      </div>

      {feedback && (
        <div className="rounded-3xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-300">
          <CheckCircle size={16} className="inline-block align-middle" /> <span className="ml-2">{feedback}</span>
        </div>
      )}

      {isError && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 dark:border-rose-800 dark:bg-rose-950/20 dark:text-rose-300">
          <p className="font-semibold">Unable to load applicants</p>
          <p className="mt-2 text-sm">{(error as any)?.message || 'Please try again later.'}</p>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-300">
            Loading applicants...
          </div>
        ) : applicants.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-300">
            No applications have been received for this opening yet.
          </div>
        ) : (
          applicants.map((application: any) => {
            const resumeTitle = application.resume?.title || 'Resume';
            const candidateEmail = application.candidate?.email || 'Candidate';
            const statusLabel = application.status?.charAt(0).toUpperCase() + application.status?.slice(1);
            return (
              <div key={application._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-dark-800 dark:bg-dark-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-dark-400">Applicant</p>
                    <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{candidateEmail}</h2>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-dark-800 dark:text-dark-300">
                    {statusLabel}
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-dark-300">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>{candidateEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    <a
                      href={application.resume?.url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-primary-600 hover:underline dark:text-primary-400"
                    >
                      {resumeTitle}
                    </a>
                  </div>
                  {application.coverLetter && (
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-dark-950">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-dark-400">Cover Letter</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-dark-200">{application.coverLetter}</p>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {application.status === 'applied' && (
                    <button
                      type="button"
                      onClick={() => handleShortlist(application._id)}
                      disabled={updateStatusMutation.isPending}
                      className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Shortlist Candidate
                    </button>
                  )}
                  {application.status === 'screening' && (
                    <button
                      type="button"
                      onClick={() => handleScheduleInterview(application._id)}
                      disabled={updateStatusMutation.isPending}
                      className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Schedule Interview
                    </button>
                  )}
                  {application.status === 'interviewing' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOffer(application._id)}
                        disabled={updateStatusMutation.isPending}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Offer Candidate
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecline(application._id)}
                        disabled={updateStatusMutation.isPending}
                        className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Decline Candidate
                      </button>
                    </>
                  )}
                  {application.status === 'interviewing' && (
                    <div className="inline-flex items-center rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 dark:bg-dark-800 dark:text-dark-300">
                      Interview Scheduled
                    </div>
                  )}
                  <Link
                    to={`/chats?recipient=${encodeURIComponent(candidateEmail)}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-dark-800 dark:text-dark-200 dark:hover:bg-dark-950"
                  >
                    <ClipboardList size={14} /> Message candidate
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default JobApplicants;
