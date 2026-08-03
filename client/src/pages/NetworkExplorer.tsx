import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GraphExplorer } from '../components/GraphExplorer';
import { Network, Compass, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const NetworkExplorer: React.FC = () => {
  const [focusedDevId, setFocusedDevId] = useState<string | undefined>(undefined);
  const [pathFrom, setPathFrom] = useState('');
  const [pathTo, setPathTo] = useState('');
  const [shortestPathData, setShortestPathData] = useState<any>(null);
  const [pathError, setPathError] = useState<string | null>(null);
  const [calculatingPath, setCalculatingPath] = useState(false);

  // 1. Fetch Graph Data
  const { data: graphData, isLoading: loadingGraph, refetch: reloadGraph } = useQuery<any>({
    queryKey: ['subGraph', focusedDevId],
    queryFn: async () => {
      const url = focusedDevId ? `/api/graph?devId=${focusedDevId}` : '/api/graph';
      try {
        const res = await fetch(url);
        if (!res.ok) return { nodes: [], edges: [] };
        const data = await res.json();
        return data && data.nodes && data.edges ? data : { nodes: [], edges: [] };
      } catch (err) {
        console.error('Error fetching graph data:', err);
        return { nodes: [], edges: [] };
      }
    }
  });

  // 2. Fetch list of developers for dropdown selects (e.g. top 50 for selection)
  const { data: selectDevelopers } = useQuery<any[]>({
    queryKey: ['selectDevs'],
    queryFn: () => fetch('/api/developers?limit=50').then((res) => res.json())
  });

  // 3. Solve Shortest Path
  const handleSolvePath = async (e: React.FormEvent) => {
    e.preventDefault();
    setPathError(null);
    setShortestPathData(null);

    if (!pathFrom || !pathTo) {
      setPathError('Please select both starting and target developers.');
      return;
    }

    if (pathFrom === pathTo) {
      setPathError('Starting and target nodes must be different.');
      return;
    }

    setCalculatingPath(true);
    try {
      const response = await fetch(`/api/recommendations/shortest-path?from=${pathFrom}&to=${pathTo}`);
      const data = await response.json();

      if (response.ok) {
        if (data.nodes && data.nodes.length > 0) {
          setShortestPathData(data);
          
          // Force center graph around starting node and trigger reload if not currently visible
          // In cytoscape, this highlights nodes on the path
        } else {
          setPathError('No connection path exists between these two developer nodes.');
        }
      } else {
        setPathError(data.error || 'Failed to compute connection path.');
      }
    } catch (err) {
      setPathError('Network connection error.');
      console.error(err);
    } finally {
      setCalculatingPath(false);
    }
  };

  const handleClearPath = () => {
    setShortestPathData(null);
    setPathError(null);
  };

  const handleNodeDoubleClicked = (nodeId: string) => {
    // If the double clicked node is a developer, focus graph on them
    if (nodeId.startsWith('dev-')) {
      setFocusedDevId(nodeId);
      handleClearPath();
    }
  };

  const handleResetFocus = () => {
    setFocusedDevId(undefined);
    handleClearPath();
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            Interactive Network Canvas
            <Compass size={20} className="text-indigo-400" />
          </h1>
          <p className="text-slate-400 text-sm">Visualize multi-hop connections, query shortest paths, and drill into relationships.</p>
        </div>

        {focusedDevId && (
          <button
            onClick={handleResetFocus}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
          >
            Reset Graph Focus
          </button>
        )}
      </div>

      {/* Control Grid: Graph visualizer + Path Solver */}
      <div className="space-y-6">
        
        {/* Shortest Path Solver Box */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-r from-slate-900/60 to-indigo-950/10">
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Network size={16} className="text-amber-400 animate-pulse" />
            Recursive connection Path Finder (openCypher shortestPath)
          </h3>

          <form onSubmit={handleSolvePath} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* From Selector */}
            <div className="text-left">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 pl-1">Start Node (Developer)</label>
              <select
                value={pathFrom}
                onChange={(e) => setPathFrom(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-white/5 rounded-xl focus:outline-none focus:border-primary/50 text-slate-300 transition-all appearance-none"
              >
                <option value="">-- Select starting developer --</option>
                {selectDevelopers?.map((dev) => (
                  <option key={dev.id} value={dev.id} className="bg-slate-950 text-slate-200">
                    👤 {dev.name} ({dev.role.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* To Selector */}
            <div className="text-left">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 pl-1">Target Node (Developer)</label>
              <select
                value={pathTo}
                onChange={(e) => setPathTo(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-white/5 rounded-xl focus:outline-none focus:border-primary/50 text-slate-300 transition-all appearance-none"
              >
                <option value="">-- Select destination developer --</option>
                {selectDevelopers?.map((dev) => (
                  <option key={dev.id} value={dev.id} className="bg-slate-950 text-slate-200">
                    👤 {dev.name} ({dev.role.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Submit CTA */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={calculatingPath}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-1.5 disabled:bg-indigo-600/50"
              >
                {calculatingPath ? 'Computing Path...' : 'Find Connection Path'}
              </button>
              {shortestPathData && (
                <button
                  type="button"
                  onClick={handleClearPath}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Path solver alerts / displays */}
          {pathError && (
            <p className="text-red-400 text-xs mt-3 pl-1 font-medium">⚠️ {pathError}</p>
          )}

          {shortestPathData && (
            <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-left text-xs">
              <span className="text-amber-400 font-semibold block mb-2 uppercase tracking-wide text-[10px]">
                🔑 Connection Path Discovered (Total hops: {shortestPathData.edges.length})
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {shortestPathData.nodes.map((node: any, idx: number) => {
                  const isLast = idx === shortestPathData.nodes.length - 1;
                  const edge = shortestPathData.edges[idx];
                  return (
                    <React.Fragment key={node.id}>
                      <span className="font-bold text-slate-200 bg-slate-900 border border-white/5 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                        <img src={node.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                        {node.name}
                      </span>
                      {!isLast && (
                        <span className="text-amber-400 font-bold px-1 flex items-center gap-1">
                          &mdash;
                          <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-slate-500">
                            {edge?.type || 'KNOWS'}
                          </span>
                          &rarr;
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Visual Graph Area */}
        <div className="w-full">
          {loadingGraph ? (
            <div className="glass-panel w-full h-[600px] rounded-3xl border border-white/5 flex flex-col items-center justify-center bg-slate-950/40">
              <Compass size={48} className="text-indigo-500 animate-spin-slow mb-4" />
              <p className="text-slate-400 font-semibold text-sm">Mapping graph node indexes...</p>
              <p className="text-slate-500 text-xs mt-2">Computing connection weights and drawing force maps.</p>
            </div>
          ) : graphData ? (
            <GraphExplorer
              nodes={graphData.nodes}
              edges={graphData.edges}
              onNodeDoubleClicked={handleNodeDoubleClicked}
              highlightPathNodeIds={shortestPathData?.nodes.map((n: any) => n.id) || []}
            />
          ) : (
            <div className="glass-panel w-full h-[600px] rounded-3xl border border-white/5 flex items-center justify-center">
              <p className="text-slate-400 text-sm">Failed to retrieve network graph data.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
