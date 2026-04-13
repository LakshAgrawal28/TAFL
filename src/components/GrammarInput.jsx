import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowRightLeft, Sparkles } from 'lucide-react';

const defaultRules = [
  { lhs: 'S', rhs: 'a B | b A' },
  { lhs: 'A', rhs: 'a | a S | b A A' },
  { lhs: 'B', rhs: 'b | b S | a B B' }
];

const GrammarInput = ({ onSubmit, examples = [] }) => {
  const [rules, setRules] = useState(defaultRules);

  const loadExample = (ex) => {
    const lines = ex.rules.split('\n').map(l => l.trim()).filter(l => l);
    const parsed = lines.map(line => {
      const parts = line.split(/->|=|→|:/).map(s => s.trim());
      return { lhs: parts[0], rhs: parts[1] || '' };
    });
    setRules(parsed);
  };

  const addRow = () => {
    setRules([...rules, { lhs: '', rhs: '' }]);
  };

  const removeRow = (index) => {
    if (rules.length === 1) return;
    const newRules = [...rules];
    newRules.splice(index, 1);
    setRules(newRules);
  };

  const updateRow = (index, field, value) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    setRules(newRules);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRow();
      setTimeout(() => {
        const nextRow = document.querySelector(`input[id="lhs-${index + 1}"]`);
        if (nextRow) nextRow.focus();
      }, 10);
    } else if (e.key === 'Backspace' && rules[index].lhs === '' && rules[index].rhs === '' && rules.length > 1) {
      e.preventDefault();
      const prevIndex = index - 1;
      removeRow(index);
      setTimeout(() => {
        const prevRow = document.querySelector(`input[id="rhs-${prevIndex}"]`);
        if (prevRow) prevRow.focus();
      }, 10);
    }
  };

  const executeSubmit = (type) => {
    const inputText = rules
      .filter(r => r.lhs.trim())
      .map(r => `${r.lhs.trim()} -> ${r.rhs.trim()}`)
      .join('\n');
    onSubmit(inputText, type);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Quick Scenarios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '4px' }}>
          Quick Proof Scenarios
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => loadExample(ex)}
              className="btn-academic btn-outline"
              style={{ padding: '6px 12px', fontSize: '0.65rem', borderRadius: '4px' }}
            >
              {ex.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '24px', background: 'var(--bg-paper)', border: '1px solid var(--border-subtle)' }}>
        {rules.map((rule, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <input
              id={`lhs-${index}`}
              className="mono"
              style={{
                width: '80px',
                padding: '8px 12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'right',
                fontWeight: 600,
                outline: 'none',
                color: 'var(--text-ink)'
              }}
              placeholder="S"
              value={rule.lhs}
              onChange={(e) => updateRow(index, 'lhs', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
            <span style={{ color: 'var(--text-annotation)', opacity: 0.5 }}>→</span>
            <input
              id={`rhs-${index}`}
              className="mono"
              style={{
                flex: 1,
                padding: '8px 12px',
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderWidth: '0 0 1px 0',
                outline: 'none',
                color: 'var(--text-ink)'
              }}
              placeholder="a B | b A | EPSILON"
              value={rule.rhs}
              onChange={(e) => updateRow(index, 'rhs', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
            <button 
              onClick={() => removeRow(index)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: rules.length > 1 ? 0.3 : 0 }}
              disabled={rules.length === 1}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        
        <button 
          onClick={addRow}
          className="btn-academic btn-outline"
          style={{ 
            marginTop: '12px',
            padding: '8px 16px', 
            fontSize: '0.7rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '8px',
            borderStyle: 'dashed',
            width: '100%'
          }}
        >
          <Plus size={14} /> Add New Production Rule
        </button>
      </div>

      <div style={{ 
        borderTop: '1px solid var(--border-subtle)', 
        paddingTop: '32px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '24px',
        alignItems: 'center',
        justifyContent: 'flex-end'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-academic" 
            onClick={() => executeSubmit('CNF')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <ArrowRightLeft size={16} /> Convert to CNF
          </button>
          <button 
            className="btn-academic btn-outline" 
            onClick={() => executeSubmit('GNF')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <Sparkles size={16} /> Convert to GNF
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrammarInput;

