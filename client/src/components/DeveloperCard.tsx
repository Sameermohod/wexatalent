import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Award, ArrowRight } from 'lucide-react';

interface DeveloperCardProps {
  developer: {
    id: string;
    name: string;
    role: string;
    avatarUrl: string;
    experienceYears: number;
    location: string;
    hourlyRate: number;
    verified: boolean;
    skills?: { name: string }[]; // Optional if fetched as a relation
  };
}

export const DeveloperCard: React.FC<DeveloperCardProps> = ({ developer }) => {
  return (
    <div className="glass-panel glass-panel-hover flex flex-col p-6 rounded-2xl relative overflow-hidden">
      {/* Top Header Card */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={developer.avatarUrl}
            alt={developer.name}
            className="w-14 h-14 rounded-2xl object-cover border border-slate-700/50"
          />
          <div className="text-left">
            <h3 className="font-semibold text-lg text-slate-100 flex items-center gap-1.5 hover:text-primary transition-colors">
              <Link to={`/developers/${developer.id}`}>{developer.name}</Link>
              {developer.verified && (
                <ShieldCheck size={16} className="text-emerald-500 fill-emerald-500/10" />
              )}
            </h3>
            <p className="text-slate-400 text-sm font-medium leading-tight">{developer.role}</p>
          </div>
        </div>
      </div>

      {/* Info Rows */}
      <div className="grid grid-cols-2 gap-4 my-5 py-4 border-y border-white/5 text-sm text-slate-300">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-indigo-400" />
          <span className="truncate">{developer.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Award size={16} className="text-pink-400" />
          <span>{developer.experienceYears} Years Exp</span>
        </div>
      </div>

      {/* Footer details */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <div className="text-left">
          <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Hourly Rate</span>
          <span className="text-slate-100 font-bold text-lg">${developer.hourlyRate}<span className="text-xs text-slate-400 font-normal">/hr</span></span>
        </div>
        
        <Link
          to={`/developers/${developer.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-primary hover:text-white bg-indigo-500/10 hover:bg-primary transition-all duration-200"
        >
          View Profile
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
