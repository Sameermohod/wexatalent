import React from 'react';
import { Briefcase, MapPin, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    salaryRange: string;
    location: string;
    type: string;
    company: {
      id: string;
      name: string;
      logoUrl: string;
      location?: string;
    };
    skills?: string[];
    technologies?: string[];
  };
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  return (
    <div className="glass-panel glass-panel-hover flex flex-col p-6 rounded-2xl border border-white/5 relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={job.company.logoUrl}
            alt={job.company.name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-700/50 bg-slate-800"
          />
          <div className="text-left">
            <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider block">
              <Link to={`/companies/${job.company.id}`} className="hover:underline">{job.company.name}</Link>
            </span>
            <h3 className="font-semibold text-lg text-slate-100 hover:text-primary transition-colors leading-tight">
              {job.title}
            </h3>
          </div>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700/50">
          {job.type}
        </span>
      </div>

      {/* Description */}
      <p className="text-slate-400 text-sm mt-4 line-clamp-2 text-left">
        {job.description}
      </p>

      {/* Metadata */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs font-medium text-slate-300">
        <div className="flex items-center gap-1.5">
          <MapPin size={14} className="text-slate-500" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-slate-500" />
          <span className="text-emerald-400 font-semibold">{job.salaryRange}</span>
        </div>
      </div>

      {/* Skills Required */}
      {(job.skills || job.technologies) && (
        <div className="flex flex-wrap gap-1.5 mt-5">
          {job.skills?.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 text-[10px] font-semibold rounded bg-pink-500/10 text-pink-400 border border-pink-500/15"
            >
              {skill}
            </span>
          ))}
          {job.technologies?.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 text-[10px] font-semibold rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/15"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Footer CTA */}
      <div className="border-t border-white/5 mt-5 pt-4 flex items-center justify-end">
        <button
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-white bg-indigo-500/5 hover:bg-primary px-3.5 py-1.5 rounded-xl transition-all duration-200"
          onClick={() => alert('Application simulation: Resume and Wexa profile sent successfully!')}
        >
          Quick Apply
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
