import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../services/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Google Auth Failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8 bg-bg-secondary">
      <div className="max-w-4xl w-full grid md:grid-cols-2 bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-border">
        <div className="p-12 lg:p-16 flex flex-col justify-between border-r border-border bg-bg-secondary relative">
          <div>
            <span className="mono-label block mb-8 text-accent">Member Area</span>
            <h1 className="text-5xl font-serif font-bold mb-6 text-primary">Your Journey <br /> Continues</h1>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Sign in to manage your orders and explore your wellness profile. We're glad to see you again.
            </p>
          </div>
          <div className="mt-12 hidden md:block">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Secure Wellness Cloud<br />Active & Protected</p>
            </div>
          </div>
        </div>

        <div className="p-12 lg:p-16 flex flex-col justify-center bg-white">
          {error && (
            <div className="mb-8 p-4 border border-red-100 bg-red-50 text-red-500 text-xs rounded-2xl flex items-center gap-3">
              <ShieldAlert size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest font-bold text-slate-400 px-1">Username / ID</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-border rounded-2xl px-6 py-4 focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none text-sm transition-all text-primary placeholder-slate-300"
                placeholder="Ex. erwellness_admin"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest font-bold text-slate-400 px-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-border rounded-2xl px-6 py-4 focus:border-accent focus:ring-4 focus:ring-accent/5 outline-none text-sm transition-all text-primary placeholder-slate-300"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-primary text-white rounded-2xl text-xs uppercase tracking-widest font-bold hover:bg-accent transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="px-4 bg-white text-slate-400">Or continue with</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 border border-border rounded-2xl text-slate-600 text-xs uppercase tracking-widest font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
          >
            <div className="w-5 h-5 flex items-center justify-center font-bold text-accent">G</div>
            Google Account
          </button>

        </div>
      </div>
    </div>
  );
}
