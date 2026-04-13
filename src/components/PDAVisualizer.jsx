import React, { useEffect, useRef } from 'react';
import { renderSymbol } from '../utils/formatters';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'Inter'
});

const PDAVisualizer = ({ pda }) => {
  const mermaidRef = useRef(null);

  useEffect(() => {
    if (pda && mermaidRef.current) {
      const { transitions } = pda;
      
      let definition = `graph LR\n`;
      definition += `  START(( )) --> q_start\n`;
      
      const groupedArr = transitions.reduce((acc, t) => {
        const key = `${t.from}->${t.to}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(`${t.input}, ${t.pop} / ${t.push}`);
        return acc;
      }, {});

      Object.entries(groupedArr).forEach(([path, labels]) => {
        const [from, to] = path.split('->');
        
        // Sanitize for Mermaid IDs (no braces)
        const idFrom = from.replace(/[{}]/g, '').replace(/_/g, '');
        const idTo = to.replace(/[{}]/g, '').replace(/_/g, '');
        
        const displayLabels = labels.length > 3 
          ? [...labels.slice(0, 3), `... (+${labels.length - 3})`]
          : labels;
        
        // Escape quotes in labels and use <br/>
        const edgeLabel = displayLabels.join(' | ').replace(/"/g, "'");
        
        definition += `  ${idFrom}["${from}"] -- "${edgeLabel}" --> ${idTo}["${to}"]\n`;
      });

      definition += `  style START fill:none,stroke:none\n`;
      definition += `  style qaccept stroke-width:4px\n`;
      
      mermaid.render('pda-diagram', definition).then(({ svg }) => {
        mermaidRef.current.innerHTML = svg;
      });
    }
  }, [pda]);

  if (!pda) return null;

  const { states, alphabet, stackAlphabet, transitions, initialState, initialStack, finalStates } = pda;

  return (
    <div className="academic-card animate-fade-in" style={{ padding: '40px', marginTop: '40px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h3>Pushdown Automaton (PDA) Machine</h3>
        <p className="description-text">
          Synthesized machine representation $M = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)$ derived from binary Greibach Normal Form.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '48px' }}>
        <div className="math-block" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '16px' }}>Formal Tuple Definition</h4>
          <div style={{ fontSize: '1rem', lineHeight: '2' }}>
            <div>$Q = {'{'} {states.map((s, i) => <React.Fragment key={i}>{renderSymbol(s)}{i < states.length - 1 ? ', ' : ''}</React.Fragment>)} {'}'}$</div>
            <div>$\Sigma = {'{'} {alphabet.map((a, i) => <React.Fragment key={i}>{renderSymbol(a)}{i < alphabet.length - 1 ? ', ' : ''}</React.Fragment>)} {'}'}$</div>
            <div>$\Gamma = {'{'} {stackAlphabet.map((s, i) => <React.Fragment key={i}>{renderSymbol(s)}{i < stackAlphabet.length - 1 ? ', ' : ''}</React.Fragment>)} {'}'}$</div>
            <div>$q_0 = {renderSymbol(initialState)}$</div>
            <div>$Z_0 = {renderSymbol(initialStack)}$</div>
            <div>$F = {'{'} {finalStates.map((s, i) => <React.Fragment key={i}>{renderSymbol(s)}{i < finalStates.length - 1 ? ', ' : ''}</React.Fragment>)} {'}'}$</div>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '16px' }}>State Diagram</h4>
          <div ref={mermaidRef} style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '4px' }}></div>
        </div>
      </div>

      <h4 style={{ fontSize: '0.9rem', marginBottom: '24px' }}>Transition Functions (δ)</h4>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)' }}>
              <th style={{ padding: '12px', border: '1px solid var(--border-subtle)' }}>Step</th>
              <th style={{ padding: '12px', border: '1px solid var(--border-subtle)' }}>Transition Function δ(q, a, X)</th>
              <th style={{ padding: '12px', border: '1px solid var(--border-subtle)' }}>Result (p, γ)</th>
            </tr>
          </thead>
          <tbody>
            {transitions.map((t, i) => (
              <tr key={i}>
                <td style={{ padding: '12px', border: '1px solid var(--border-subtle)', opacity: 0.5 }}>{i + 1}</td>
                <td style={{ padding: '12px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)' }}>
                  δ({renderSymbol(t.from)}, {renderSymbol(t.input)}, {renderSymbol(t.pop)})
                </td>
                <td style={{ padding: '12px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)' }}>
                  = ({renderSymbol(t.to)}, {renderSymbol(t.push)})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PDAVisualizer;
