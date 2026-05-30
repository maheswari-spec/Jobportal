import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { Sparkles, FileText, CheckCircle, AlertTriangle, ArrowRight, List } from 'lucide-react';

export const AIAnalyzer = () => {
  const [resumeText, setResumeText] = useState('');
  const [title, setTitle] = useState('');
  const [analysisResults, setAnalysisResults] = useState<any | null>(null);

  const normalizeStringArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string');
    }
    if (typeof value === 'string' && value.trim()) {
      return [value.trim()];
    }
    return [];
  };

  const normalizeExperienceSuggestions = (value: unknown) => {
    if (Array.isArray(value)) {
      const objects = value.filter((item) => item && typeof item === 'object' && !Array.isArray(item));
      if (objects.length === value.length) {
        return value as Array<Record<string, any>>;
      }
      return normalizeStringArray(value).map((text) => ({ description: text }));
    }
    if (typeof value === 'string' && value.trim()) {
      return [{ description: value.trim() }];
    }
    return [];
  };

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/ai/analyze', { resumeText, title: title || 'Scanned Resume' });
      return res.data.data;
    },
    onSuccess: (data) => {
      setAnalysisResults(data.analysis);
    }
  });

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;
    analyzeMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="text-primary-500 animate-pulse" />
          AI Resume Analyzer
        </h2>
        <p className="text-sm text-slate-500 dark:text-dark-400">Paste your resume content to extract skills, compute an ATS score, and receive targeted optimization suggestions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Input Panel */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Document Label</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Frontend developer CV"
                  className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-2.5 px-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Resume Plain Text</label>
                <textarea
                  rows={10}
                  required
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste the full content of your resume here..."
                  className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-3 text-sm focus:outline-none resize-none placeholder-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={analyzeMutation.isPending || !resumeText.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white shadow-md hover:bg-primary-500 transition-all disabled:opacity-50"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Scanning Document...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Run AI Analysis
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2">
          {analysisResults ? (
            <div className="space-y-6">
              
              {/* ATS Score & Summary Banner */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900 flex flex-col md:flex-row items-center gap-6">
                {/* Radial progress ring */}
                <div className="relative flex items-center justify-center h-28 w-28">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" className="stroke-slate-100 dark:stroke-dark-800 fill-none" strokeWidth="8" />
                    <circle cx="56" cy="56" r="48" 
                      className="stroke-primary-500 fill-none transition-all duration-1000" 
                      strokeWidth="8" 
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 * (1 - analysisResults.atsScore / 100)}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-slate-800 dark:text-white">{analysisResults.atsScore}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">ATS Score</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2 text-center md:text-left">
                  <h3 className="font-bold text-lg">AI Parsing Overview</h3>
                  <p className="text-sm text-slate-500 dark:text-dark-400">
                    Your resume has been parsed successfully. We computed a readiness index score based on keywords density and descriptions. See recommendations below.
                  </p>
                </div>
              </div>

              {/* Skills Extracted */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
                <h3 className="mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <List size={14} /> Extracted Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {normalizeStringArray(analysisResults.skills).map((skill: string, idx: number) => (
                    <span key={idx} className="rounded-full bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-600 dark:bg-dark-800 dark:text-dark-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggestions for Improvement */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
                  <h3 className="mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-green-500" /> Key Suggestions
                  </h3>
                  <ul className="space-y-3 text-xs text-slate-600 dark:text-dark-400">
                    {normalizeStringArray(analysisResults.suggestions).map((sug: string, idx: number) => (
                      <li key={idx} className="flex gap-2 items-start">
                        <ArrowRight size={12} className="mt-0.5 text-primary-500 shrink-0" />
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
                  <h3 className="mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-500" /> Missing Industry Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {normalizeStringArray(analysisResults.missingKeywords).map((kw: string, idx: number) => (
                      <span key={idx} className="rounded-full bg-amber-50 border border-amber-200/50 px-3 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description Optimizations */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-dark-800 dark:bg-dark-900">
                <h3 className="mb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Recommended Description Optimizations</h3>
                <div className="space-y-4">
                  {normalizeExperienceSuggestions(analysisResults.experienceSuggestions).map((exp: any, idx: number) => (
                    <div key={idx} className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0 dark:border-dark-800">
                      {exp.position || exp.company ? (
                        <h4 className="text-sm font-bold">{exp.position ? `${exp.position}${exp.company ? ` at ${exp.company}` : ''}` : exp.company}</h4>
                      ) : null}
                      <p className="mt-1 text-xs text-slate-500 dark:text-dark-400 line-clamp-2">{exp.description || exp.text || ''}</p>
                      {Array.isArray(exp.achievements) && exp.achievements.length > 0 ? (
                        <div className="mt-2.5 space-y-1.5">
                          <span className="inline-block text-[10px] font-bold text-primary-500 uppercase tracking-wider">Suggested Achievements:</span>
                          {exp.achievements.map((ach: string, aIdx: number) => (
                            <div key={aIdx} className="flex gap-2 items-start text-xs text-slate-600 dark:text-dark-400">
                              <span className="text-primary-500">•</span>
                              <span>{ach}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex h-[400px] flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 dark:border-dark-850">
              <FileText size={48} className="mb-3 text-slate-350" />
              <p className="text-sm font-medium">Input your resume content on the left panel to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAnalyzer;
