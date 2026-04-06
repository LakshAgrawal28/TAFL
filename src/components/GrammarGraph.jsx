import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

const GrammarGraph = ({ grammar, activeSymbol }) => {
  const { nodes, edges } = useMemo(() => {
    if (!grammar) return { nodes: [], edges: [] };

    const nodes = [];
    const edges = [];
    const seen = new Set();
    const variables = Object.keys(grammar);

    variables.forEach((lhs, idx) => {
      const isLhsActive = activeSymbol === null || activeSymbol === lhs;
      nodes.push({
        id: lhs,
        data: { label: lhs },
        position: { x: Math.cos(idx / variables.length * Math.PI * 2) * 200 + 250, y: Math.sin(idx / variables.length * Math.PI * 2) * 200 + 250 },
        style: { 
          background: isLhsActive ? 'var(--primary)' : 'rgba(59, 130, 246, 0.2)', 
          color: 'white', 
          borderRadius: '12px',
          width: 50, height: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '700', fontSize: '1.2rem', 
          border: isLhsActive && activeSymbol !== null ? '2px solid #fff' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: isLhsActive ? '0 0 20px var(--primary-glow)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }
      });
      seen.add(lhs);

      grammar[lhs].forEach((rhs, rIdx) => {
        // Correct variable extraction: uppercase letters, symbols in brackets, or S'
        const matches = rhs.match(/<[^>]+>|[A-Z]'?|./g) || [];
        const actualVars = matches.map(s => s.startsWith('<') ? s.slice(1, -1) : s)
                                 .filter(v => variables.includes(v));
        
        actualVars.forEach(v => {
          const isEdgeActive = activeSymbol === null || activeSymbol === lhs || activeSymbol === v;
          edges.push({
            id: `e-${lhs}-${v}-${rIdx}`,
            source: lhs,
            target: v,
            animated: isEdgeActive,
            style: {
              stroke: isEdgeActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
              strokeWidth: isEdgeActive ? 2 : 1,
              opacity: isEdgeActive ? 1 : 0.2
            }
          });
        });
      });
    });

    return { nodes, edges };
  }, [grammar, activeSymbol]);

  return (
    <div style={{ height: '500px', width: '100%', borderRadius: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
      >
        <Background color="#1e293b" gap={25} size={1} />
        <Controls 
          style={{ 
            background: '#111827', 
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }} 
        />
      </ReactFlow>
    </div>
  );
};

export default GrammarGraph;
