import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Search, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NodeData {
  id: string;
  name: string;
  type: string;
  role?: string;
  industry?: string;
  location?: string;
  avatarUrl?: string;
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
  type: string;
}

interface GraphExplorerProps {
  nodes: NodeData[];
  edges: EdgeData[];
  onNodeDoubleClicked?: (nodeId: string) => void;
  highlightPathNodeIds?: string[]; // IDs of nodes in shortest path
}

export const GraphExplorer: React.FC<GraphExplorerProps> = ({
  nodes,
  edges,
  onNodeDoubleClicked,
  highlightPathNodeIds = []
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Map data to Cytoscape elements format
  const elements = [
    ...nodes.map((n) => ({
      data: {
        id: n.id,
        label: n.name || n.id,
        name: n.name || n.id,
        type: n.type,
        role: n.role || '',
        industry: n.industry || '',
        location: n.location || '',
        avatarUrl: n.avatarUrl || ''
      }
    })),
    ...edges.map((e) => ({
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.type
      }
    }))
  ];

  // 2. Initialize and update Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    // Define stylesheet
    const style: any[] = [
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'color': '#cbd5e1',
          'font-size': '10px',
          'text-valign': 'bottom',
          'text-margin-y': 4,
          'background-color': '#475569',
          'width': '30px',
          'height': '30px',
          'transition-property': 'background-color, width, height, border-color, border-width',
          'transition-duration': 0.2
        }
      },
      {
        selector: 'node[type="Developer"]',
        style: {
          'background-color': '#6366f1',
          'width': '36px',
          'height': '36px',
          'border-color': '#4f46e5',
          'border-width': '2px'
        }
      },
      {
        selector: 'node[type="Company"]',
        style: {
          'background-color': '#3b82f6',
          'shape': 'hexagon',
          'width': '40px',
          'height': '40px',
          'border-color': '#2563eb',
          'border-width': '2px'
        }
      },
      {
        selector: 'node[type="Skill"]',
        style: {
          'background-color': '#ec4899',
          'shape': 'round-rectangle',
          'width': '28px',
          'height': '28px',
          'border-color': '#db2777',
          'border-width': '1.5px'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 1.5,
          'line-color': '#334155',
          'target-arrow-color': '#334155',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'label': 'data(label)',
          'font-size': '7px',
          'color': '#64748b',
          'text-rotation': 'autorotate',
          'text-background-opacity': 0.8,
          'text-background-color': '#0f172a',
          'text-background-padding': '2px',
          'text-background-shape': 'round-rectangle',
          'transition-property': 'width, line-color, target-arrow-color',
          'transition-duration': 0.2
        }
      },
      // Highlight selections
      {
        selector: '.highlighted',
        style: {
          'background-color': '#a855f7',
          'border-color': '#c084fc',
          'border-width': '4px',
          'width': '46px',
          'height': '46px'
        }
      },
      {
        selector: '.shortest-path-node',
        style: {
          'background-color': '#f59e0b',
          'border-color': '#fbbf24',
          'border-width': '3px',
          'width': '42px',
          'height': '42px'
        }
      },
      {
        selector: '.shortest-path-edge',
        style: {
          'line-color': '#f59e0b',
          'target-arrow-color': '#f59e0b',
          'width': 3.5
        }
      },
      {
        selector: '.dimmed',
        style: {
          'opacity': 0.15
        }
      }
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: style,
      layout: {
        name: 'cose',
        animate: true,
        fit: true,
        padding: 40,
        nodeOverlap: 20,
        componentSpacing: 80,
        refresh: 20,
        idealEdgeLength: () => 60,
        nodeRepulsion: () => 8000,
        edgeElasticity: () => 32,
        nestingFactor: 1.2,
        gravity: 1.0,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
      } as any
    });

    cyRef.current = cy;

    // Click handler
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const nodeData = node.data();
      setSelectedNode(nodeData);

      // Highlight current node + neighbors
      const neighbors = node.neighborhood();
      cy.elements().addClass('dimmed');
      node.removeClass('dimmed').addClass('highlighted');
      neighbors.removeClass('dimmed');
    });

    // Tap background - reset highlights
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        cy.elements().removeClass('dimmed').removeClass('highlighted');
        setSelectedNode(null);
      }
    });

    // Double click - expand/focus
    cy.on('dblclick', 'node', (evt) => {
      const nodeId = evt.target.id();
      if (onNodeDoubleClicked) {
        onNodeDoubleClicked(nodeId);
      }
    });

    // Apply Shortest Path highlights if specified
    if (highlightPathNodeIds && highlightPathNodeIds.length > 0) {
      cy.elements().addClass('dimmed');
      
      highlightPathNodeIds.forEach((id) => {
        const node = cy.getElementById(id);
        node.removeClass('dimmed').addClass('shortest-path-node');
      });

      // Highlight edges connecting path nodes in sequence
      for (let i = 0; i < highlightPathNodeIds.length - 1; i++) {
        const u = highlightPathNodeIds[i];
        const v = highlightPathNodeIds[i + 1];
        
        // Find edge between u and v
        const edge = cy.elements(`edge[source="${u}"][target="${v}"], edge[source="${v}"][target="${u}"]`);
        edge.removeClass('dimmed').addClass('shortest-path-edge');
      }
    }

    return () => {
      cy.destroy();
    };
  }, [nodes, edges, highlightPathNodeIds]);

  // Controls
  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.2);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit();
  const handleResetLayout = () => {
    setSelectedNode(null);
    cyRef.current?.elements().removeClass('dimmed').removeClass('highlighted');
    cyRef.current?.layout({
      name: 'cose',
      animate: true,
      fit: true
    } as any).run();
  };

  // Node Search Highlight
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !cyRef.current) return;

    const cy = cyRef.current;
    const match = cy.nodes().filter((n) => 
      n.data('label').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (match.length > 0) {
      cy.elements().addClass('dimmed');
      match.removeClass('dimmed').addClass('highlighted');
      cy.animate({
        center: { eles: match.first() },
        zoom: 1.5,
        duration: 500
      });
      setSelectedNode(match.first().data());
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px] w-full">
      {/* Visual Canvas */}
      <div className="lg:col-span-3 glass-panel rounded-2xl relative overflow-hidden flex flex-col h-full border border-white/5 bg-slate-950/40">
        
        {/* Controls Toolbar */}
        <div className="absolute top-4 left-4 z-10 flex gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-white/5 backdrop-blur-md">
          <button 
            onClick={handleZoomIn} 
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button 
            onClick={handleZoomOut} 
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button 
            onClick={handleFit} 
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
            title="Fit Canvas"
          >
            <Maximize2 size={16} />
          </button>
          <button 
            onClick={handleResetLayout} 
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
            title="Reset Layout & Highlights"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="absolute top-4 right-4 z-10 flex items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search graph nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-56 text-xs bg-slate-900/80 text-slate-200 border border-white/5 rounded-xl backdrop-blur-md focus:outline-none focus:border-primary/50 transition-all"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
          </div>
        </form>

        {/* Helper Tip */}
        <div className="absolute bottom-4 left-4 z-10 text-[10px] text-slate-500 pointer-events-none">
          💡 Click node to view neighbors. Double-click node to center focus.
        </div>

        {/* The Cytoscape Container */}
        <div ref={containerRef} className="w-full h-[520px] cursor-grab active:cursor-grabbing" />
      </div>

      {/* Info Sidebar Card */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-full border border-white/5">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 text-left border-b border-white/5 pb-3">
            Node Inspector
          </h2>

          {selectedNode ? (
            <div className="mt-5 space-y-4 text-left">
              {/* Node avatar/name header */}
              <div className="flex items-center gap-3">
                {selectedNode.type === 'Developer' && selectedNode.avatarUrl ? (
                  <img
                    src={selectedNode.avatarUrl}
                    alt={selectedNode.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700/50"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white border border-white/5 ${
                    selectedNode.type === 'Developer' ? 'bg-indigo-600' :
                    selectedNode.type === 'Company' ? 'bg-blue-600' : 'bg-pink-600'
                  }`}>
                    {selectedNode.name ? selectedNode.name[0] : 'S'}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-slate-100 leading-tight">
                    {selectedNode.name}
                  </h3>
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-1.5 ${
                    selectedNode.type === 'Developer' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15' :
                    selectedNode.type === 'Company' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/15' :
                    'bg-pink-500/10 text-pink-400 border border-pink-500/15'
                  }`}>
                    {selectedNode.type}
                  </span>
                </div>
              </div>

              {/* Subtitles based on node label */}
              {selectedNode.type === 'Developer' && (
                <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 font-medium block">Designation</span>
                    <span className="font-semibold">{selectedNode.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Location</span>
                    <span>{selectedNode.location}</span>
                  </div>
                  <div className="pt-2">
                    <Link
                      to={`/developers/${selectedNode.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                    >
                      View Profile Details &rarr;
                    </Link>
                  </div>
                </div>
              )}

              {selectedNode.type === 'Company' && (
                <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 font-medium block">Industry Sector</span>
                    <span className="font-semibold">{selectedNode.industry}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Office Location</span>
                    <span>{selectedNode.location}</span>
                  </div>
                  <div className="pt-2">
                    <Link
                      to={`/companies/${selectedNode.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                    >
                      Explore Company Page &rarr;
                    </Link>
                  </div>
                </div>
              )}

              {selectedNode.type === 'Skill' && (
                <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 font-medium block">Skill Reference</span>
                    <span className="font-semibold font-mono text-[11px] bg-slate-900 border border-white/5 px-1.5 py-0.5 rounded">
                      {selectedNode.id}
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed pt-1">
                    Select a developer connection to inspect their experience levels with this technical skill.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-20 text-center text-slate-500">
              <Compass size={40} className="mx-auto text-slate-700 animate-spin-slow mb-4" />
              <p className="text-sm">No node selected</p>
              <p className="text-xs text-slate-600 mt-2 px-4 leading-relaxed">
                Click any node on the graph canvas to inspect its metadata and connections.
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="border-t border-white/5 pt-4 text-[10px] space-y-1.5 text-slate-500 text-left">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Developer (Circle)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-500 rotate-45 transform origin-center" />
            <span>Company (Hexagon)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-pink-500" />
            <span>Skill (Square)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
