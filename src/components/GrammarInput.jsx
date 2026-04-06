import React, { useState } from 'react';
import { Play, Sparkles } from 'lucide-react';

const defaultGrammar = `S -> aB | bA
A -> a | aS | bAA
B -> b | bS | aBB`;

const grammarExamples = {
  "CNF Example": `S -> AB | aB
A -> aA | EPSILON
B -> bB | a`,
  "GNF Example": `S -> AA | a
A -> SS | b`
};

const GrammarInput = ({ onSubmit }) => {
  const [input, setInput] = useState(defaultGrammar);

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} color="var(--accent-1)" />
          Define Grammar
        </h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {Object.entries(grammarExamples).map(([key, val]) => (
            <button 
              key={key}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '4px 10px' }}
              onClick={() => setInput(val)}
            >
              Load {key}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="grammar-text"
          style={{
            width: '100%',
            height: '180px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-1)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          placeholder={"Enter rules like:\nS -> aB | EPSILON"}
        />
        <div style={{ 
          position: 'absolute', 
          right: '12px', 
          bottom: '16px',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}>
          Use 'EPSILON' or '\e' for null
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button 
          className="btn-primary" 
          onClick={() => onSubmit(input, 'GNF')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-darker)', border: '1px solid var(--accent-2)' }}
        >
          <Play size={18} /> Convert to GNF
        </button>
        <button 
          className="btn-primary" 
          onClick={() => onSubmit(input, 'CNF')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Play size={18} /> Convert to CNF
        </button>
      </div>
    </div>
  );
};

export default GrammarInput;
