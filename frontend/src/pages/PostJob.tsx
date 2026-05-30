import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, AlertCircle } from 'lucide-react';

export const PostJob = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Full-time');
  const [experienceLevel, setExperienceLevel] = useState('Entry');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [skillsRequiredText, setSkillsRequiredText] = useState('');
  const [error, setError] = useState('');

  // Fetch recruiter company profile first
  const { data: profileData, isLoading: isProfileLoading, isError: isProfileError } = useQuery({
    queryKey: ['recruiterCompanyInfo'],
    queryFn: async () => {
      const res = await api.get('/profile/me');
      return res.data.data;
    }
  });

  const companyId = profileData?.company?._id;
  const canPost = Boolean(companyId);

  const postMutation = useMutation({
    mutationFn: async () => {
      const companyId = profileData?.company?._id;
      if (!companyId) {
        throw new Error('Please configure your Company Profile first before posting jobs.');
      }

      return await api.post('/jobs', {
        title,
        description,
        companyId,
        location,
        type,
        experienceLevel,
        salaryRange: {
          min: parseInt(minSalary, 10) || 0,
          max: parseInt(maxSalary, 10) || 0,
          currency: 'USD',
          visible: true
        },
        requirements: requirementsText.split('\n').filter(r => r.trim()),
        skillsRequired: skillsRequiredText.split(',').map(s => s.trim()).filter(Boolean)
      });
    },
    onSuccess: () => {
      navigate('/dashboard');
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to post vacancy.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const companyId = profileData?.company?._id;
    if (!companyId) {
      setError('Please configure your Company Profile first before posting jobs.');
      return;
    }
    postMutation.mutate();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="text-primary-500" />
          Post a New Vacancy
        </h2>
        <p className="text-sm text-slate-500 dark:text-dark-400">Fill in the specifications below to publish job descriptions matching candidate profiles.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900 shadow-sm">
        {isProfileError && (
          <div className="mb-6 rounded-xl bg-red-950/40 border border-red-500/50 p-4 text-xs font-bold text-red-400 flex items-center gap-2">
            <AlertCircle size={14} /> Unable to load recruiter profile. Please refresh or sign in again.
          </div>
        )}

        {!isProfileLoading && !profileData?.company?._id && (
          <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700 dark:bg-amber-950/20 dark:border-amber-700/30 dark:text-amber-300">
            <div className="font-semibold">Company profile is required</div>
            <p className="mt-1">Please configure your recruiter company profile first on your <Link to="/profile" className="font-semibold underline">Profile</Link> page before publishing job listings.</p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl bg-red-950/40 border border-red-500/50 p-4 text-xs font-bold text-red-400 flex items-center gap-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Job Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-4 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote / New York, NY"
                className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-4 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Job Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-3 text-sm focus:outline-none"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-3 text-sm focus:outline-none"
              >
                <option value="Entry">Entry</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Director">Director</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Minimum Annual Salary ($)</label>
              <input
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="e.g. 80000"
                className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-4 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Maximum Annual Salary ($)</label>
              <input
                type="number"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                placeholder="e.g. 120000"
                className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-4 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Description</label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State the core details, challenges, and context of the role..."
              className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-4 text-sm focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Skills Required (Comma separated)</label>
            <input
              type="text"
              value={skillsRequiredText}
              onChange={(e) => setSkillsRequiredText(e.target.value)}
              placeholder="e.g. React, Node.js, AWS, Redis"
              className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-4 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Role Requirements (One per line)</label>
            <textarea
              rows={4}
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
              placeholder="e.g. 3+ years experience with Javascript&#10;B.S. in Computer Science"
              className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-4 text-sm focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-dark-800/80">
            <button
              type="submit"
              disabled={postMutation.isPending || !canPost}
              className="rounded-xl bg-primary-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-500 disabled:opacity-50"
            >
              {postMutation.isPending ? 'Publishing...' : 'Publish Job Listing'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default PostJob;
