import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, MapPin, Users, Globe, Briefcase, Network, User } from 'lucide-react';
import { JobCard } from '../components/JobCard';

export const CompanyProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch company details
  const { data: company, isLoading, error } = useQuery<any>({
    queryKey: ['company', id],
    queryFn: () => fetch(`/api/companies/${id}`).then(res => {
      if (!res.ok) throw new Error('Company not found');
      return res.json();
    })
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-white/5 text-center max-w-xl mx-auto">
        <p className="text-red-400 font-semibold text-sm">Failed to retrieve company profile</p>
        <p className="text-slate-500 text-xs mt-2">Verify node index or connection variables.</p>
        <Link to="/companies" className="inline-block mt-6 px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl border border-slate-700">
          Back to Companies
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-blue-950/10 via-slate-900/40 to-slate-950 relative overflow-hidden flex flex-col md:flex-row gap-6">
        <img
          src={company.logoUrl}
          alt={company.name}
          className="w-20 h-20 rounded-2xl object-cover border border-slate-700/60 bg-slate-800"
        />
        <div className="space-y-2 flex-1">
          <h1 className="text-2xl font-bold text-slate-100">{company.name}</h1>
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/15 px-2.5 py-0.5 rounded">
            {company.industry}
          </span>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <MapPin size={14} className="text-slate-500" />
              <span>{company.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} className="text-slate-500" />
              <span>{company.size} employees</span>
            </div>
            {company.websiteUrl && (
              <div className="flex items-center gap-1">
                <Globe size={14} className="text-slate-500" />
                <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary">
                  {company.websiteUrl}
                </a>
              </div>
            )}
          </div>

          <p className="text-slate-300 text-xs leading-relaxed pt-2 max-w-2xl">{company.description}</p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left main: Posted Jobs & Employees */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Job Openings */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-semibold text-slate-100 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-400">
              <Briefcase size={16} className="text-blue-400" />
              Active Job Openings
            </h3>
            
            {company.jobs && company.jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.jobs.map((job: any) => (
                  <JobCard 
                    key={job.id} 
                    job={{
                      ...job,
                      company: {
                        id: company.id,
                        name: company.name,
                        logoUrl: company.logoUrl,
                        location: company.location
                      }
                    }} 
                  />
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-xs py-2">No active job openings posted for this company node.</p>
            )}
          </div>

          {/* Current Employees */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-semibold text-slate-100 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-400">
              <User size={16} className="text-pink-400" />
              Placements & Employees
            </h3>

            {company.employees && company.employees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.employees.map((emp: any) => (
                  <Link 
                    key={emp.id}
                    to={`/developers/${emp.id}`}
                    className="p-3 rounded-xl bg-slate-900/40 border border-white/5 flex items-center gap-3 hover:border-slate-800 transition-colors group"
                  >
                    <img
                      src={emp.avatarUrl}
                      alt={emp.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-800"
                    />
                    <div className="text-left">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-primary transition-colors block">
                        {emp.name}
                      </span>
                      <span className="text-[10px] text-slate-500 block leading-tight">{emp.role}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-xs py-2">No employee connections registered in seed files.</p>
            )}
          </div>

        </div>

        {/* Right Sidebar: Tech Stack */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 h-fit">
          <h3 className="font-semibold text-slate-100 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-400">
            <Network size={16} className="text-indigo-400" />
            Infrastructure Stack
          </h3>
          <p className="text-[10px] text-slate-500">Infrastructure tools used by the company to deploy product pipelines.</p>
          
          {company.technologies && company.technologies.length > 0 ? (
            <div className="flex flex-wrap gap-2.5 pt-2">
              {company.technologies.map((tech: string) => (
                <span 
                  key={tech}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-white/5 text-slate-300"
                >
                  💻 {tech}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-xs py-2">No technology stack variables seeded.</p>
          )}
        </div>

      </div>
    </div>
  );
};
