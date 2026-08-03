import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Users, ArrowRight } from 'lucide-react';

export const Companies: React.FC = () => {
  const { data: companies, isLoading, error } = useQuery<any[]>({
    queryKey: ['companies'],
    queryFn: () => fetch('/api/companies').then(res => res.json())
  });

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          Company Network
          <Building2 size={20} className="text-blue-400" />
        </h1>
        <p className="text-slate-400 text-sm">Explore node registries of active technology companies hiring in our network.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="w-2/3 h-4 bg-slate-800 rounded" />
                  <div className="w-1/2 h-3 bg-slate-800 rounded" />
                </div>
              </div>
              <div className="w-full h-10 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-400 text-sm">Failed to retrieve companies list</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies?.map((company) => (
            <div key={company.id} className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between border border-white/5 relative">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700/50"
                  />
                  <div>
                    <h3 className="font-semibold text-slate-100 hover:text-primary transition-colors">
                      <Link to={`/companies/${company.id}`}>{company.name}</Link>
                    </h3>
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/15 px-2 py-0.5 rounded mt-1">
                      {company.industry}
                    </span>
                  </div>
                </div>
                <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{company.description}</p>
              </div>

              <div className="border-t border-white/5 mt-6 pt-4 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-500" />
                  <span>{company.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-slate-500" />
                  <span>{company.size} employees</span>
                </div>
              </div>

              <Link
                to={`/companies/${company.id}`}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                title="View Company Node Profile"
              >
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
