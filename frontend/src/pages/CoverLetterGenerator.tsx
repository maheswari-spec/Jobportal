import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { Sparkles, FileText, Copy, Check } from 'lucide-react';

export const CoverLetterGenerator = () => {
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jdText, setJdText] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [coverLetter, setCoverLetter] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: profileData } = useQuery({
    queryKey: ['profileCandidateResumesForCoverLetter'],
    queryFn: async () => {
      const res = await api.get('/profile/me');
      return res.data.data;
    }
  });

  const letterMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/ai/cover-letter', {
        resumeId: selectedResumeId,
        jdText,
        companyName
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      setCoverLetter(data);
    }
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId || !jdText.trim()) return;
    letterMutation.mutate();
  };

  const handleCopy = () => {
    if (!coverLetter) return;
    const fullText = `
${coverLetter.subject}

${coverLetter.salutation}

${coverLetter.bodyParagraphs.join('\n\n')}

${coverLetter.signOff}
    `.trim();

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resumes = profileData?.resumes || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="text-primary-500 animate-pulse" />
          AI Cover Letter Generator
        </h2>
        <p className="text-sm text-slate-500 dark:text-dark-400">Generate a custom, professional, ATS-friendly cover letter linking your achievements directly to target job requirements.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Form controls panel */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Source Resume</label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-3 text-sm focus:outline-none"
                >
                  <option value="">Select Resume...</option>
                  {resumes.map((res: any) => (
                    <option key={res._id} value={res._id}>{res.title} {res.isPrimary ? '(Primary)' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Paste Job Description</label>
                <textarea
                  rows={8}
                  required
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the target job description requirements here..."
                  className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-3 text-sm focus:outline-none resize-none placeholder-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={letterMutation.isPending || !selectedResumeId || !jdText.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white shadow-md hover:bg-primary-500 transition-all disabled:opacity-50"
              >
                {letterMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Writing Letter...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Cover Letter
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Output layout panel */}
        <div className="md:col-span-2">
          {coverLetter ? (
            <div className="space-y-4">
              <div className="flex justify-end gap-2 rounded-2xl bg-white border border-slate-200 p-3 dark:border-dark-800 dark:bg-dark-900">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold hover:bg-slate-50 dark:border-dark-800 dark:hover:bg-dark-850 transition-all"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>

              {/* Cover Letter layout view */}
              <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-dark-800 dark:bg-dark-900 shadow-lg text-slate-800 dark:text-dark-200 leading-relaxed text-sm max-w-xl mx-auto space-y-6">
                <div>
                  <p className="font-semibold text-slate-500">Subject: {coverLetter.subject}</p>
                </div>

                <div>
                  <p className="text-slate-800 dark:text-white font-semibold">{coverLetter.salutation}</p>
                </div>

                <div className="space-y-4">
                  {coverLetter.bodyParagraphs.map((para: string, idx: number) => (
                    <p key={idx} className="text-slate-650 dark:text-dark-300">{para}</p>
                  ))}
                </div>

                <div className="pt-4">
                  <p>{coverLetter.signOff}</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-1">
                    {profileData?.firstName} {profileData?.lastName}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-[450px] flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 dark:border-dark-850">
              <FileText size={48} className="mb-3 text-slate-350" />
              <p className="text-sm font-medium">Your customized cover letter will display here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
