import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DeveloperCard } from '../components/DeveloperCard';
import { useAuth } from '../context/AuthContext';
import { Bookmark, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Bookmarks: React.FC = () => {
  const { token } = useAuth();

  // Fetch bookmarks
  const { data: bookmarks, isLoading, error } = useQuery<any[]>({
    queryKey: ['bookmarks'],
    queryFn: () =>
      fetch('/api/developers/bookmarks', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then((res) => res.json())
  });

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          My Saved Bookmarks
          <Bookmark size={20} className="text-indigo-400 fill-indigo-400/10" />
        </h1>
        <p className="text-slate-400 text-sm">Saved developer profiles in your active hiring pipeline.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-800 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <div className="w-2/3 h-4 bg-slate-800 rounded" />
                  <div className="w-1/2 h-3 bg-slate-800 rounded" />
                </div>
              </div>
              <div className="w-full h-12 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-400 text-sm">Failed to retrieve bookmarked talent list.</p>
      ) : bookmarks && bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((dev) => (
            <DeveloperCard key={dev.id} developer={dev} />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-16 rounded-3xl border border-white/5 text-center max-w-xl mx-auto">
          <Bookmark size={40} className="mx-auto text-slate-700 mb-4 animate-bounce" />
          <h3 className="font-semibold text-slate-300 text-sm">Your pipeline is empty</h3>
          <p className="text-slate-500 text-xs mt-2 px-6 leading-relaxed">
            Search developer profiles and click "Bookmark Developer" to save talent here for quick comparison.
          </p>
          <Link
            to="/developers"
            className="inline-flex items-center gap-1 px-4 py-2 mt-6 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all"
          >
            Explore Talent Directory &rarr;
          </Link>
        </div>
      )}
    </div>
  );
};
