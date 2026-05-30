import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { Sparkles, FileText, Check, Printer } from 'lucide-react';

export const ResumeBuilder = () => {
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jdText, setJdText] = useState('');
  const [title, setTitle] = useState('');
  const [tailoredVersion, setTailoredVersion] = useState<any | null>(null);

  // Fetch Candidate Profile to list existing resumes
  const { data: profileData } = useQuery({
    queryKey: ['profileCandidateResumesForBuilder'],
    queryFn: async () => {
      const res = await api.get('/profile/me');
      return res.data.data;
    }
  });

  const tailorMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/ai/tailor', {
        resumeId: selectedResumeId,
        jdText,
        title: title || 'Tailored Resume'
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      setTailoredVersion(data);
    }
  });

  const handleTailor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId || !jdText.trim()) return;
    tailorMutation.mutate();
  };

  const handlePrint = () => {
    // Open a print window specifically for the styled resume preview container
    const printContent = document.getElementById('printable-resume');
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${tailoredVersion?.title || 'Tailored Resume'}</title>
          <style>
            body {
              font-family: "Times New Roman", Times, serif;
              color: #111;
              line-height: 1.4;
              margin: 40px;
              font-size: 11pt;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .name {
              font-size: 18pt;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .contact {
              font-size: 9.5pt;
              margin-top: 5px;
            }
            .section-title {
              font-size: 11pt;
              font-weight: bold;
              text-transform: uppercase;
              border-bottom: 1px solid #111;
              margin-top: 15px;
              margin-bottom: 8px;
              letter-spacing: 0.5px;
            }
            .item-header {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              margin-top: 6px;
            }
            .item-sub {
              display: flex;
              justify-content: space-between;
              font-style: italic;
              font-size: 10pt;
              margin-bottom: 4px;
            }
            .bullets {
              margin: 0;
              padding-left: 20px;
              font-size: 10pt;
            }
            .bullets li {
              margin-bottom: 3px;
            }
            .skills-list {
              font-size: 10pt;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="name">${profileData?.firstName || ''} ${profileData?.lastName || ''}</div>
            <div class="contact">
              ${profileData?.location || ''} | ${profileData?.phone || ''} | ${profileData?.user?.email || ''}
            </div>
          </div>
          
          <div class="section-title">Professional Summary</div>
          <p style="font-size: 10pt; margin: 0 0 10px 0;">${tailoredVersion.parsedData.summary}</p>

          <div class="section-title">Skills</div>
          <div class="skills-list">
            <strong>Core Competencies:</strong> ${tailoredVersion.parsedData.skills.join(', ')}
          </div>

          <div class="section-title">Professional Experience</div>
          ${tailoredVersion.parsedData.experience.map((exp: any) => `
            <div class="item-header">
              <div>${exp.company}</div>
              <div>${exp.location || ''}</div>
            </div>
            <div class="item-sub">
              <div>${exp.position}</div>
              <div>${exp.startDate || ''} - ${exp.endDate || (exp.current ? 'Present' : '')}</div>
            </div>
            <ul class="bullets">
              <li>${exp.description}</li>
              ${exp.achievements ? exp.achievements.map((ach: string) => `<li>${ach}</li>`).join('') : ''}
            </ul>
          `).join('')}

          ${tailoredVersion.parsedData.projects && tailoredVersion.parsedData.projects.length > 0 ? `
            <div class="section-title">Projects</div>
            ${tailoredVersion.parsedData.projects.map((proj: any) => `
              <div class="item-header">
                <div>${proj.title}</div>
                <div style="font-weight: normal; font-size: 9.5pt; font-style: italic;">
                  ${proj.technologies ? proj.technologies.join(', ') : ''}
                </div>
              </div>
              <p style="font-size: 10pt; margin: 3px 0 10px 0; padding-left: 20px;">${proj.description}</p>
            `).join('')}
          ` : ''}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const resumes = profileData?.resumes || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="text-primary-500 animate-pulse" />
          AI JD-Based Resume Builder
        </h2>
        <p className="text-sm text-slate-500 dark:text-dark-400">Optimize and rewrite your resume points specifically to align with target job description keywords.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Form controls */}
        <div className="md:col-span-4 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900">
            <form onSubmit={handleTailor} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Target Resume Version</label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-100 border-none dark:bg-dark-800 py-3 px-3 text-sm focus:outline-none"
                >
                  <option value="">Choose Resume...</option>
                  {resumes.map((res: any) => (
                    <option key={res._id} value={res._id}>{res.title} {res.isPrimary ? '(Primary)' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Output Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Node.js Dev tailored version"
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
                disabled={tailorMutation.isPending || !selectedResumeId || !jdText.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white shadow-md hover:bg-primary-500 transition-all disabled:opacity-50"
              >
                {tailorMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Generating Custom CV...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Tailor Resume
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Output Preview */}
        <div className="md:col-span-8">
          {tailoredVersion ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center rounded-2xl bg-white border border-slate-200 p-4 dark:border-dark-800 dark:bg-dark-900">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Check className="text-green-500" size={16} /> Custom Resume Ready
                  </h3>
                  <p className="text-xs text-slate-400">ATS optimized version saved to your profile.</p>
                </div>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-800 dark:bg-dark-850 dark:hover:bg-dark-800 transition-all"
                >
                  <Printer size={14} /> Export ATS PDF
                </button>
              </div>

              {/* Printable container rendering ATS style */}
              <div 
                id="printable-resume" 
                className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-dark-800 dark:bg-white dark:text-slate-900 shadow-lg text-slate-900 min-h-[600px] leading-relaxed text-sm max-w-2xl mx-auto"
                style={{ fontFamily: '"Times New Roman", Times, serif' }}
              >
                {/* Header */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold uppercase tracking-wide">
                    {profileData?.firstName} {profileData?.lastName}
                  </h2>
                  <p className="text-xs mt-1 text-slate-600">
                    {profileData?.location} | {profileData?.phone} | {profileData?.user?.email}
                  </p>
                </div>

                {/* Summary */}
                <div className="mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider border-b border-slate-800 pb-0.5 mb-2">Professional Summary</h3>
                  <p className="text-xs text-slate-700 leading-normal">{tailoredVersion.parsedData.summary}</p>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider border-b border-slate-800 pb-0.5 mb-2">Skills</h3>
                  <p className="text-xs text-slate-700">
                    <strong className="text-slate-900 font-semibold">Core Competencies:</strong> {tailoredVersion.parsedData.skills.join(', ')}
                  </p>
                </div>

                {/* Work Experience */}
                <div className="mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider border-b border-slate-800 pb-0.5 mb-2">Professional Experience</h3>
                  {tailoredVersion.parsedData.experience.map((exp: any, idx: number) => (
                    <div key={idx} className="mb-4">
                      <div className="flex justify-between text-xs font-bold text-slate-900">
                        <span>{exp.company}</span>
                        <span>{exp.location || ''}</span>
                      </div>
                      <div className="flex justify-between text-xs italic text-slate-600">
                        <span>{exp.position}</span>
                        <span>{exp.startDate} - {exp.endDate || (exp.current ? 'Present' : '')}</span>
                      </div>
                      <ul className="list-disc pl-5 mt-1 text-xs text-slate-700 space-y-1">
                        <li>{exp.description}</li>
                        {exp.achievements?.map((ach: string, aIdx: number) => (
                          <li key={aIdx}>{ach}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Projects */}
                {tailoredVersion.parsedData.projects && tailoredVersion.parsedData.projects.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider border-b border-slate-800 pb-0.5 mb-2">Projects</h3>
                    {tailoredVersion.parsedData.projects.map((proj: any, idx: number) => (
                      <div key={idx} className="mb-3">
                        <div className="flex justify-between text-xs font-bold text-slate-900">
                          <span>{proj.title}</span>
                          <span className="font-normal italic text-slate-600">{proj.technologies?.join(', ')}</span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1 pl-4">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="flex h-[500px] flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 dark:border-dark-850">
              <FileText size={48} className="mb-3 text-slate-350" />
              <p className="text-sm font-medium">Scaffolded tailoring results will print here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
