import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Download } from 'lucide-react';

const ResultPanel = ({ finalGrammar, type }) => {
  const [copied, setCopied] = useState(false);

  if (!finalGrammar) return null;

  const rulesString = Object.entries(finalGrammar).map(([lhs, rhsList]) => {
    return `${lhs} -> ${rhsList.join(' | ')}`;
  }).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(rulesString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([rulesString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grammar_${type.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="glass-panel"
      style={{ padding: '32px', marginTop: '40px', border: '1px solid var(--accent-2)', boxShadow: '0 10px 40px rgba(6, 182, 212, 0.2)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }} className="gradient-text">
          Final {type} Result
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleCopy} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />} 
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={handleDownload} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={16} /> Export
          </button>
        </div>
      </div>
      
      <div style={{ 
        background: 'var(--bg-darker)',
        padding: '24px', 
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <pre className="grammar-text" style={{ fontSize: '1.1rem', color: '#fff', margin: 0, whiteSpace: 'pre-wrap' }}>
          {rulesString}
        </pre>
      </div>
    </motion.div>
  );
};

export default ResultPanel;
