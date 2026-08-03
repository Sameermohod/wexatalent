import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DeveloperCard } from '../components/DeveloperCard';
import { Search, MapPin, SlidersHorizontal, Award, Sparkles } from 'lucide-react';

const locationsList = ['All', 'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA', 'Berlin, Germany', 'London, UK', 'Toronto, Canada', 'Remote'];
const commonSkills = ['react', 'typescript', 'graphql', 'node-js', 'python', 'docker', 'kubernetes', 'pytorch', 'aws'];

export const Developers: React.FC = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('All');
  const [experienceMin, setExperienceMin] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch developers
  const { data: developers, isLoading, error } = useQuery<any[]>({
    queryKey: ['developers', query, location, experienceMin, selectedSkills],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (location && location !== 'All') params.append('location', location);
      if (experienceMin > 0) params.append('experienceMin', experienceMin.toString());
      if (selectedSkills.length > 0) params.append('skills', selectedSkills.join(','));

      const response = await fetch(`/api/developers?${params.toString()}`);
      if (!response.ok) throw new Error('Network error');
      return response.json();
    }
  });

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleReset = () => {
    setQuery('');
    setLocation('All');
    setExperienceMin(0);
    setSelectedSkills([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            Talent Explorer
            <Sparkles size={18} className="text-indigo-400" />
          </h1>
          <p className="text-slate-400 text-sm">Explore graph-connected developers, their skills, and connections.</p>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search by name, role, bio..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:border-primary/50 text-slate-200 transition-all"
            />
            <Search size={14} className="absolute left-3 top-3 text-slate-500" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              showFilters || selectedSkills.length > 0 || location !== 'All' || experienceMin > 0
                ? 'bg-primary text-white border-primary shadow-lg shadow-indigo-600/15'
                : 'bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse-slow-once">
          {/* Location */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">Location Hub</label>
            <div className="relative">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-900 border border-white/5 rounded-xl focus:outline-none focus:border-primary/50 text-slate-300 transition-all appearance-none"
              >
                {locationsList.map((loc) => (
                  <option key={loc} value={loc} className="bg-slate-950 text-slate-200">{loc}</option>
                ))}
              </select>
              <MapPin size={14} className="absolute left-3 top-3 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Min Experience */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-2">
              Minimum Experience: <span className="text-indigo-400 font-bold">{experienceMin} Years</span>
            </label>
            <input
              type="range"
              min="0"
              max="15"
              value={experienceMin}
              onChange={(e) => setExperienceMin(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 mt-3"
            />
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={handleReset}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all"
            >
              Reset All Filters
            </button>
          </div>

          {/* Skill Filter Tags (Spans across all cols) */}
          <div className="md:col-span-3 border-t border-white/5 pt-4">
            <label className="text-xs font-semibold text-slate-400 block mb-2 flex items-center gap-1.5">
              <Award size={14} className="text-pink-400" />
              Filter by Skills (AND matching)
            </label>
            <div className="flex flex-wrap gap-2">
              {commonSkills.map((skill) => {
                const selected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                      selected
                        ? 'bg-pink-500/10 text-pink-400 border-pink-500/40 shadow-sm shadow-pink-500/5'
                        : 'bg-slate-900 border-white/5 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {skill.toUpperCase().replace('-', ' ')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Developers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-800 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <div className="w-2/3 h-4 bg-slate-800 rounded" />
                  <div className="w-1/2 h-3 bg-slate-800 rounded" />
                </div>
              </div>
              <div className="py-4 border-y border-white/5 space-y-2">
                <div className="w-full h-3 bg-slate-800 rounded" />
                <div className="w-5/6 h-3 bg-slate-800 rounded" />
              </div>
              <div className="flex justify-between items-center">
                <div className="w-16 h-5 bg-slate-800 rounded" />
                <div className="w-24 h-8 bg-slate-800 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center">
          <p className="text-red-400 font-semibold text-sm">Failed to retrieve developers</p>
          <p className="text-slate-500 text-xs mt-2">Please ensure the backend server and CognoDB database are reachable.</p>
        </div>
      ) : developers && developers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {developers.map((dev) => (
            <DeveloperCard key={dev.id} developer={dev} />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-16 rounded-3xl border border-white/5 text-center">
          <p className="text-slate-400 font-semibold text-sm">No developers found</p>
          <p className="text-slate-500 text-xs mt-2">Try adjusting your filters or search keywords.</p>
        </div>
      )}
    </div>
  );
};
