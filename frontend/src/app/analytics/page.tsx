"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import api from "@/store/api";
import { Plus, BrainCircuit, Activity, ZoomIn, ZoomOut, Zap } from "lucide-react";
import dynamic from 'next/dynamic';
import SubmitRecordModal from "@/components/analytics/SubmitRecordModal";

// Dynamically import react-force-graph-2d since it relies on browser APIs (canvas)
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function Analytics() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeNode, setActiveNode] = useState<any>(null);
  const graphRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      const res = await Promise.all([
        api.get("/genome/graph")
      ]);
      setGraphData(res[0].data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    
    // Auto-resize graph to container
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleNodeClick = useCallback((node: any) => {
    setActiveNode(node);
    
    // Focus graph on clicked node
    if (graphRef.current) {
      const distance = 40;
      const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z || 0);
      graphRef.current.centerAt(node.x, node.y, 1000);
      graphRef.current.zoom(8, 2000);
    }
  }, []);

  return (
    <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden">
      
      {/* Sidebar: Details & Actions */}
      <div className="w-80 flex-shrink-0 bg-card border-r border-border p-6 flex flex-col h-full overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Knowledge Genome</h1>
          <p className="text-sm text-muted">Your living digital brain. Submit evidence and watch it evolve.</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-white text-black px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors shadow-lg mb-8"
        >
          <Plus className="w-4 h-4" />
          <span>Log Learning Record</span>
        </button>

        {activeNode ? (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                activeNode.group === 'user' ? 'bg-purple-500/20 text-purple-400' :
                activeNode.group === 'domain' ? 'bg-blue-500/20 text-blue-400' :
                activeNode.group === 'skill' ? 'bg-green-500/20 text-green-400' :
                activeNode.group === 'concept' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-pink-500/20 text-pink-400'
              }`}>
                {activeNode.group}
              </div>
            </div>
            
            <h2 className="text-xl font-bold mb-6">{activeNode.name}</h2>
            
            {activeNode.group !== 'user' && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted">Mastery Score</span>
                    <span className="font-medium text-white">{activeNode.score}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${activeNode.score}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted flex items-center gap-1">Confidence</span>
                    <span className="font-medium text-yellow-400">{activeNode.confidence}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${activeNode.confidence}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-xs text-muted">Total XP</p>
                    <p className="font-mono text-lg">{activeNode.xp}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Evidence Count</p>
                    <p className="font-mono text-lg">{activeNode.evidence_count || 0}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-red-500/20">
                  <button 
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete this knowledge node?")) {
                        try {
                          await api.delete(`/genome/node/${activeNode.id}`);
                          setActiveNode(null);
                          loadData();
                        } catch (err) {
                          console.error("Failed to delete node", err);
                        }
                      }
                    }}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete Node
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20 text-muted opacity-50">
            <BrainCircuit className="w-12 h-12 mb-4" />
            <p className="text-sm">Click any node on the graph to view details and stats.</p>
          </div>
        )}
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 relative bg-black" ref={containerRef}>
        
        {/* Floating Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white/5 backdrop-blur-md p-2 rounded-xl border border-white/10">
          <button onClick={() => { if(graphRef.current) { const z = graphRef.current.zoom(); graphRef.current.zoom(z * 1.5, 400); } }} className="p-2 hover:bg-white/10 rounded-lg text-muted hover:text-white transition-colors">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button onClick={() => { if(graphRef.current) { const z = graphRef.current.zoom(); graphRef.current.zoom(z / 1.5, 400); } }} className="p-2 hover:bg-white/10 rounded-lg text-muted hover:text-white transition-colors">
            <ZoomOut className="w-5 h-5" />
          </button>
          <button onClick={() => { if(graphRef.current) { graphRef.current.zoomToFit(400); } }} className="p-2 hover:bg-white/10 rounded-lg text-muted hover:text-white transition-colors">
            <Activity className="w-5 h-5" />
          </button>
        </div>

        {/* The Graph */}
        {graphData.nodes.length > 0 && typeof window !== 'undefined' && (
          <ForceGraph2D
            ref={graphRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeLabel="name"
            nodeColor={(node: any) => {
              if (node.id === activeNode?.id) return '#ffffff';
              if (node.group === 'user') return '#a855f7'; // purple
              if (node.group === 'domain') return '#3b82f6'; // blue
              if (node.group === 'skill') return '#22c55e'; // green
              if (node.group === 'concept') return '#eab308'; // yellow
              return '#ec4899'; // pink
            }}
            nodeRelSize={1}
            linkColor={() => 'rgba(255,255,255,0.15)'}
            linkWidth={1.5}
            linkDirectionalArrowLength={0}
            onNodeClick={handleNodeClick}
            backgroundColor="#000000"
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            onEngineStop={() => {
              if(graphRef.current) {
                graphRef.current.zoomToFit(400);
              }
            }}
            cooldownTicks={100}
            // Use clustering force configuration natively supported
            d3Force={(d3: any, data: any) => {
              if(graphRef.current) {
                // Shorten link distance so sub-nodes tightly cluster around domains
                graphRef.current.d3Force('link').distance(40);
                // Increase charge to prevent nodes from overlapping
                graphRef.current.d3Force('charge').strength(-200);
              }
            }}
          />
        )}
        
        {graphData.nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4 opacity-50" />
              <p className="text-muted">Loading your Knowledge Genome...</p>
            </div>
          </div>
        )}
      </div>

      <SubmitRecordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadData}
      />
    </div>
  );
}
