import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar 
} from 'recharts';
import { Network, Users, Building2, Briefcase, Award, TrendingUp, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#6366f1', '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

export const Dashboard: React.FC = () => {
  // Fetch Analytics Queries
  const { data: topConnected, isLoading: loadingTop } = useQuery<any[]>({
    queryKey: ['topConnected'],
    queryFn: () => fetch('/api/recommendations/analytics/top-connected').then(res => res.json())
  });

  const { data: trendingSkills, isLoading: loadingSkills } = useQuery<any[]>({
    queryKey: ['trendingSkills'],
    queryFn: () => fetch('/api/recommendations/analytics/trending-skills').then(res => res.json())
  });

  const { data: heatmapData, isLoading: loadingHeatmap } = useQuery<any[]>({
    queryKey: ['heatmapData'],
    queryFn: () => fetch('/api/recommendations/analytics/heatmap').then(res => res.json())
  });

  // Calculate stat cards
  const stats = [
    { name: 'Developers (Nodes)', value: '300+', icon: Users, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/15' },
    { name: 'Companies (Nodes)', value: '50+', icon: Building2, color: 'text-blue-400 bg-blue-500/10 border-blue-500/15' },
    { name: 'Skills (Nodes)', value: '100+', icon: Award, color: 'text-pink-400 bg-pink-500/10 border-pink-500/15' },
    { name: 'Relationships (Edges)', value: '5,000+', icon: Network, color: 'text-violet-400 bg-violet-500/10 border-violet-500/15' },
  ];

  // Map trending skills for Pie Chart
  const skillChartData = trendingSkills?.slice(0, 7).map((s) => ({
    name: s.skill.name,
    value: s.count
  })) || [];

  // Map top connected developers for Bar Chart
  const devChartData = topConnected?.slice(0, 8).map((d) => ({
    name: d.name.split(' ')[0], // first name for spacing
    Connections: d.connectionCount
  })) || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-indigo-950/20 via-slate-900/40 to-pink-950/10 text-left relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="max-w-2xl">
          <span className="text-primary font-semibold text-xs uppercase tracking-wider block mb-2">⚡ Wexa AI Graph Intel</span>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Discover Talent Relationships Beyond standard SQL Tables
          </h1>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            Welcome to the AI Talent Network Explorer. This system uses CognoDB Cloud to analyze graph relationships. Track shortest paths, mutual referents, and network hubs instantly using recursive openCypher traversals.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/network-explorer"
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/15"
            >
              Open Graph Canvas
            </Link>
            <Link
              to="/developers"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
            >
              Search Developers
            </Link>
          </div>
        </div>
      </div>

      {/* Network Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="glass-panel p-5 rounded-2xl border border-white/5 text-left flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block mb-1.5">{stat.name}</span>
                <span className="text-2xl font-bold text-slate-100">{stat.value}</span>
              </div>
              <div className={`p-3 rounded-xl border ${stat.color}`}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Connected Developers (Hubs) */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-between min-h-[380px]">
          <div className="text-left mb-6">
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-indigo-400" />
              <h3 className="font-semibold text-slate-100">Top Connected Talent (Degree Centrality)</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">Developers with the highest number of mutual connections and collaborations in the network.</p>
          </div>

          <div className="flex-1 w-full min-h-[220px]">
            {loadingTop ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={devChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: 11, fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff', fontSize: 11 }}
                  />
                  <Bar dataKey="Connections" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Trending Skills distribution */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-between min-h-[380px]">
          <div className="text-left mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-pink-400" />
              <h3 className="font-semibold text-slate-100">In-Demand Network Skills (Volume)</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">Skills most commonly mapped across developers and requested by active jobs.</p>
          </div>

          <div className="flex-1 w-full min-h-[220px] flex items-center justify-center">
            {loadingSkills ? (
              <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="w-full h-full flex flex-col md:flex-row items-center justify-between">
                <div className="w-full md:w-1/2 h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={skillChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {skillChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontSize: 11 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 flex flex-col items-start gap-2 pl-6 mt-4 md:mt-0 text-xs">
                  {skillChartData.map((entry, idx) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-slate-300 font-medium">{entry.name}</span>
                      <span className="text-slate-500">({entry.value} devs)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Relationship Heatmap Section */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 text-left">
        <h3 className="font-semibold text-slate-100 mb-2">Worked-At Distribution Analysis</h3>
        <p className="text-xs text-slate-500 mb-6">Aggregate density of past/present developer placements grouped by corporate industry and geography.</p>

        {loadingHeatmap ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-300">
              <thead>
                <tr className="border-b border-white/5 text-slate-400">
                  <th className="py-3 px-4 font-semibold text-left">Industry Sector</th>
                  <th className="py-3 px-4 font-semibold text-left">Talent Location Hub</th>
                  <th className="py-3 px-4 font-semibold text-right">Placement Count</th>
                  <th className="py-3 px-4 font-semibold text-right">Heat Density</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {heatmapData?.slice(0, 8).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-200">{item.group}</td>
                    <td className="py-3.5 px-4 text-slate-400">{item.variable}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-100">{item.value}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/50">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full" 
                            style={{ width: `${Math.min((item.value / 12) * 100, 100)}%` }} 
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {Math.round(Math.min((item.value / 12) * 100, 100))}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
