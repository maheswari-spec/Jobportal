import { create } from 'zustand';

export interface ResumeData {
  summary?: string;
  skills: string[];
  experience: Array<{
    company: string;
    position: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
  }>;
  certifications?: string[];
  projects?: Array<{
    title: string;
    description: string;
    technologies: string[];
  }>;
  atsScore?: number;
  suggestions?: string[];
}

interface ResumeState {
  originalResume: ResumeData | null;
  tailoredResume: ResumeData | null;
  analysisResults: any | null;
  coverLetter: any | null;
  isLoading: boolean;
  setOriginalResume: (resume: ResumeData | null) => void;
  setTailoredResume: (resume: ResumeData | null) => void;
  setAnalysisResults: (results: any) => void;
  setCoverLetter: (coverLetter: any) => void;
  setLoading: (loading: boolean) => void;
}

export const useResumeStore = create<ResumeState>((set) => ({
  originalResume: null,
  tailoredResume: null,
  analysisResults: null,
  coverLetter: null,
  isLoading: false,
  setOriginalResume: (resume) => set({ originalResume: resume }),
  setTailoredResume: (resume) => set({ tailoredResume: resume }),
  setAnalysisResults: (results) => set({ analysisResults: results }),
  setCoverLetter: (coverLetter) => set({ coverLetter }),
  setLoading: (loading) => set({ isLoading: loading })
}));

export default useResumeStore;
