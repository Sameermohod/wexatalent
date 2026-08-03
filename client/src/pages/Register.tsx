import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Network, Mail, Lock, User, Briefcase, Calendar, MapPin, DollarSign, ShieldAlert } from 'lucide-react';

export const Register: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    experienceYears: 2,
    location: '',
    hourlyRate: 60,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'experienceYears' || name === 'hourlyRate' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Connection to backend failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />

      <div className="w-full max-w-lg glass-panel p-8 rounded-3xl border border-white/5 shadow-2xl relative">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-2xl bg-indigo-600/10 text-primary mb-3">
            <Network size={32} className="animate-spin-slow" />
          </div>
          <h2 className="font-extrabold text-2xl bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">
            Join Wexa AI Network
          </h2>
          <p className="text-slate-400 text-xs mt-1.5">Create your developer identity node on our open talent graph</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-3 text-left">
            <ShieldAlert className="text-red-400 flex-shrink-0" size={18} />
            <span className="text-xs text-red-200">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 pl-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:border-primary/50 text-slate-200 transition-all"
                />
                <User size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 pl-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@wexa.ai"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:border-primary/50 text-slate-200 transition-all"
                />
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 pl-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:border-primary/50 text-slate-200 transition-all"
                />
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 pl-1">Primary Designation</label>
              <div className="relative">
                <input
                  type="text"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="Senior React Engineer"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:border-primary/50 text-slate-200 transition-all"
                />
                <Briefcase size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 pl-1">Years of Experience</label>
              <div className="relative">
                <input
                  type="number"
                  name="experienceYears"
                  required
                  min={0}
                  value={formData.experienceYears}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:border-primary/50 text-slate-200 transition-all"
                />
                <Calendar size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 pl-1">Hourly Ask ($)</label>
              <div className="relative">
                <input
                  type="number"
                  name="hourlyRate"
                  required
                  min={1}
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:border-primary/50 text-slate-200 transition-all"
                />
                <DollarSign size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 pl-1">Location</label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="San Francisco, CA"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:border-primary/50 text-slate-200 transition-all"
                />
                <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-primary hover:bg-primary-hover disabled:bg-indigo-600/40 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
