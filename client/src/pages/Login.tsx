import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Network, Mail, Lock, ArrowRight, ShieldAlert } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection to backend failed. Please ensure backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl relative">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-2xl bg-indigo-600/10 text-primary mb-3">
            <Network size={32} className="animate-spin-slow" />
          </div>
          <h2 className="font-extrabold text-2xl bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">
            Welcome to Wexa Talent
          </h2>
          <p className="text-slate-400 text-xs mt-1.5">Sign in to access your graph-connected recruiting workspace</p>
        </div>

        {/* Errors */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-3 text-left">
            <ShieldAlert className="text-red-400 flex-shrink-0" size={18} />
            <span className="text-xs text-red-200">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="text-xs font-semibold text-slate-400 block mb-1.5 pl-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@wexa.ai"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:border-primary/50 text-slate-200 transition-all"
              />
              <Mail size={16} className="absolute left-3.5 top-3 text-slate-500" />
            </div>
          </div>

          <div className="text-left">
            <div className="flex justify-between mb-1.5 pl-1">
              <label className="text-xs font-semibold text-slate-400">Password</label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:border-primary/50 text-slate-200 transition-all"
              />
              <Lock size={16} className="absolute left-3.5 top-3 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-primary hover:bg-primary-hover disabled:bg-indigo-600/40 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-500">
          New to Wexa?{' '}
          <Link to="/register" className="text-primary hover:underline font-semibold">
            Create an Account
          </Link>
        </div>

        {/* Demo Hint */}
        <div className="mt-6 p-3 rounded-xl bg-slate-900/50 border border-white/5 text-[11px] text-slate-500 leading-normal text-left">
          💡 <strong>Seed account:</strong> Use any seeded developer email (e.g. <code>james.smith1@wexa.ai</code>) with the password <code>password123</code> to login.
        </div>
      </div>
    </div>
  );
};
