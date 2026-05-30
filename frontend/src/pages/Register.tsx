import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { Sparkles, Mail, Lock, User as UserIcon, Building } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};
try {
  initializeApp(firebaseConfig);
} catch (e) {}

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Option A: create user via backend
      const res = await api.post('/auth/register', { email, password, role });
      setAuth(res.data.user, res.data.accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFirebaseSignup = async () => {
    setError('');
    setLoading(true);
    try {
      const appAuth = getAuth();
      const userCred = await createUserWithEmailAndPassword(appAuth, email, password);
      const idToken = await userCred.user.getIdToken();
      if (typeof window !== 'undefined') localStorage.setItem('firebaseIdToken', idToken);
      // Exchange/verify on backend
      const res = await api.post('/auth/firebase-login', { role });
      setAuth(res.data.user, res.data.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('firebaseIdToken');
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Firebase signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 dark:bg-slate-950 font-sans">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-slate-800 p-8 shadow-2xl border border-slate-700">
        
        {/* Brand */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-lg shadow-primary-500/30">
            <Sparkles size={24} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Create Account</h2>
          <p className="text-xs text-slate-400">Join the AI-powered portal and builder</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-950/40 border border-red-500/50 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector buttons */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-300 uppercase">Select Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`
                  flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold border transition-all
                  ${role === 'candidate' 
                    ? 'border-primary-500 bg-primary-500/10 text-primary-400' 
                    : 'border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-900/80'}
                `}
              >
                <UserIcon size={16} />
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setRole('recruiter')}
                className={`
                  flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold border transition-all
                  ${role === 'recruiter' 
                    ? 'border-primary-500 bg-primary-500/10 text-primary-400' 
                    : 'border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-900/80'}
                `}
              >
                <Building size={16} />
                Recruiter
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute top-3.5 left-3.5 text-slate-500" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl bg-slate-900 border border-slate-700 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300 uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute top-3.5 left-3.5 text-slate-500" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-slate-900 border border-slate-700 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/30 hover:bg-primary-500 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
          <button
            type="button"
            onClick={handleFirebaseSignup}
            disabled={loading}
            className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-900/80 active:scale-[0.98] transition-all"
          >
            {loading ? 'Signing up with Firebase...' : 'Sign up with Firebase'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-400 hover:text-primary-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
