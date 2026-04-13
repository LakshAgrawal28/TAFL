import React from 'react';
import { renderSymbol } from '../utils/formatters';
import { CheckCircle, XCircle } from 'lucide-react';

const CYKVisualizer = ({ result }) => {
  if (!result) return null;

  const { table, accepted, string } = result;
  const n = string.length;

  return (
    <div className="academic-card animate-fade-in" style={{ padding: '24px', marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 4px 0' }}>CYK Membership Table</h3>
          <p className="description-text" style={{ fontSize: '0.8rem' }}>
            Derivation path for string: <span className="mono" style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '2px', color: 'var(--text-ink)' }}>{string || 'ε'}</span>
          </p>
        </div>
        
        <div style={{ 
          padding: '8px 16px', 
          border: `1px solid ${accepted ? '#059669' : '#DC2626'}`,
          background: accepted ? 'rgba(5, 150, 105, 0.05)' : 'rgba(220, 38, 38, 0.05)',
          color: accepted ? '#059669' : '#DC2626',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 800,
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          borderRadius: '4px'
        }}>
          {accepted ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {accepted ? 'ACCEPTED' : 'REJECTED'}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          borderCollapse: 'collapse', 
          width: '100%', 
          minWidth: '500px',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem'
        }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid var(--border-subtle)', padding: '8px' }}>j / len</th>
              {string.split('').map((char, i) => (
                <th key={i} style={{ border: '1px solid var(--border-subtle)', padding: '8px', background: 'var(--bg-secondary)' }}>
                  {i + 1} ({char})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid var(--border-subtle)', padding: '8px', fontWeight: 700 }}>
                  Len {i + 1}
                </td>
                {row.map((cell, j) => (
                  <td 
                    key={j} 
                    style={{ 
                      border: '1px solid var(--border-subtle)', 
                      padding: '8px',
                      background: cell.length > 0 ? '#fff' : 'transparent',
                      color: 'var(--text-ink)',
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                      {cell.length > 0 ? cell.map((sym, k) => (
                        <span key={k}>{renderSymbol(sym)}{k < cell.length - 1 ? ',' : ''}</span>
                      )) : <span style={{ opacity: 0.1 }}>∅</span>}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '16px' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-annotation)', fontStyle: 'italic' }}>
          * Top-left cell contains roots for derivation.
        </p>
      </div>
    </div>
  );
};

export default CYKVisualizer;
