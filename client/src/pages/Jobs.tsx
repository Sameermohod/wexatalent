import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { JobCard } from '../components/JobCard';
import { Briefcase, Search, Sparkles } from 'lucide-react';

export const Jobs: React.FC = () => {
  const [query, setQuery] = useState('');

  // Fetch jobs
  const { data: jobs, isLoading, error } = useQuery<any[]>({
    queryKey: ['jobs', query],
    queryFn: () => {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      return fetch(`/api/jobs?${params.toString()}`).then(res => res.json());
    }
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            Active Job Openings
            <Briefcase size={20} className="text-indigo-400" />
          </h1>
          <p className="text-slate-400 text-sm">Explore employment nodes seeking expertise across our graph network.</p>
        </div>

        {/* Search */}
        <div className="relative md:w-64">
          <input
            type="text"
            placeholder="Search roles, skills, descriptions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:border-primary/50 text-slate-200 transition-all"
          />
          <Search size={14} className="absolute left-3 top-3 text-slate-500" />
        </div>
      </div>

      {/* Jobs list view */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="w-2/3 h-4 bg-slate-800 rounded" />
                  <div className="w-1/2 h-3 bg-slate-800 rounded" />
                </div>
              </div>
              <div className="w-full h-16 bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-400 text-sm">Failed to retrieve job board postings.</p>
      ) : jobs && jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-16 rounded-3xl border border-white/5 text-center">
          <p className="text-slate-400 font-semibold text-sm">No job openings found</p>
          <p className="text-slate-500 text-xs mt-2">Adjust your keywords or check seed parameters.</p>
        </div>
      )}
    </div>
  );
};
