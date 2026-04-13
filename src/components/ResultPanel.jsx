import React, { useState, useEffect } from 'react';
import { Copy, Check, Download, Book, Search } from 'lucide-react';
import { renderSymbol, renderRhs } from '../utils/formatters';
import { GrammarEngine } from '../logic/grammarEngine';
import CYKVisualizer from './CYKVisualizer';

const ResultPanel = ({ finalGrammar, type }) => {
  const [copied, setCopied] = useState(false);
  const [testString, setTestString] = useState('');
  const [parseResult, setParseResult] = useState(null);

  useEffect(() => {
    const engine = new GrammarEngine();
    if (finalGrammar) {
      if (type === 'CNF') {
        if (testString) {
          setParseResult(engine.cykParse(finalGrammar, testString));
        } else {
          setParseResult(null);
        }
      } else if (type === 'GNF') {
        if (testString) {
          setParseResult(engine.gnfVerify(finalGrammar, testString));
        } else {
          setParseResult(null);
        }
      }
    } else {
      setParseResult(null);
    }
  }, [testString, finalGrammar, type]);

  if (!finalGrammar) return null;

  const getRulesString = () => Object.entries(finalGrammar).map(([lhs, rhsList]) => {
    return `${lhs} -> ${rhsList.join(' | ') || 'ε'}`;
  }).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(getRulesString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([getRulesString()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grammar_${type.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    let md = `# Formal Grammar Transformation Report\n\n`;
    md += `**Protocol:** ${type} Transformation\n`;
    md += `**Date:** ${new Date().toLocaleDateString()}\n\n`;
    md += `## Final Ruleset\n\n`;
    
    Object.entries(finalGrammar).forEach(([lhs, rhsList]) => {
      md += `- **${lhs}** → ${rhsList.join(' | ') || 'ε'}\n`;
    });
    
    md += `\n**Q.E.D. Transformation complete.**\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proof_${type.toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. VERIFICATION AT THE TOP FOR BOTH MODES */}
      <section style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-blue)' }}></div>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Membership Verification ({type === 'CNF' ? 'CYK' : 'Grammar Matching'})</h3>
        </div>
        
        <p className="description-text" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
          {type === 'CNF' ? 'CYK algorithm performs an exhaustive O(n³) search.' : 'Direct recursive Matching on the Greibach grammar transitions.'}
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
            <input 
              type="text" 
              placeholder={`Enter string to verify (e.g. "aabb")`}
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              className="mono"
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                background: 'var(--bg-paper)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                fontSize: '1rem',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            />
          </div>
        </div>

        {type === 'CNF' ? (
          <CYKVisualizer result={parseResult} />
        ) : (
          <div style={{ marginTop: '16px' }}>
            {testString && parseResult && (
              <div style={{ 
                padding: '16px', 
                background: parseResult.accepted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                borderLeft: `4px solid ${parseResult.accepted ? '#10b981' : '#ef4444'}`,
                color: parseResult.accepted ? '#065f46' : '#991b1b',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem'
              }}>
                <strong>RESULT:</strong> {parseResult.accepted ? `ACCEPTED - String "${testString}" belongs to L(G)` : `REJECTED - String "${testString}" not in language`}
              </div>
            )}
          </div>
        )}
      </section>
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-blue)', opacity: 0.3 }}></div>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Synthesized Grammar Rules</h3>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleCopy} className="btn-academic btn-outline" style={{ padding: '4px 10px', fontSize: '0.55rem' }}>
              {copied ? 'COPIED' : 'COPY RULES'}
            </button>
            <button onClick={handleExportMarkdown} className="btn-academic btn-outline" style={{ padding: '4px 10px', fontSize: '0.55rem' }}>
              EXPORT MD
            </button>
          </div>
        </div>
        
        <div className="math-block" style={{ padding: '24px', border: '1px solid var(--border-subtle)', background: 'var(--bg-paper)' }}>
          {Object.entries(finalGrammar).map(([lhs, rhsList]) => (
            <div key={lhs} className="math-line" style={{ display: 'flex', gap: '16px', fontSize: '1.1rem' }}>
              <div style={{ fontWeight: 600, minWidth: '40px' }}>{renderSymbol(lhs)}</div>
              <div style={{ opacity: 0.3 }}>→</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {rhsList.map((rhs, i) => (
                  <React.Fragment key={i}>
                    <span>{renderRhs(rhs)}</span>
                    {i < rhsList.length - 1 && <span style={{ opacity: 0.2 }}>|</span>}
                  </React.Fragment>
                ))}
                {rhsList.length === 0 && renderSymbol('ε')}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ResultPanel;
