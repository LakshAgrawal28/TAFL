import React from 'react';

/**
 * Renders a grammar symbol with subscript support (e.g., S_a, N_1).
 * Symbols following the pattern Symbol_subscript are formatted with <sub>.
 */
export const renderSymbol = (symbol) => {
  if (!symbol) return null;
  if (symbol === '\\e' || symbol === 'EPSILON') return <span className="math-font" style={{ opacity: 0.7 }}>ε</span>;
  
  if (symbol.includes('_')) {
    const [main, sub] = symbol.split('_');
    return (
      <span className="math-font">
        {main}<sub>{sub}</sub>
      </span>
    );
  }
  
  // Highlighting specific characters for academic feel
  if (symbol === '->' || symbol === '→') {
    return <span className="math-arrow">→</span>;
  }

  // Check if it's a terminal (usually lowercase or single digit)
  const isTerminal = /^[a-z0-9]$/.test(symbol);
  return <span className={isTerminal ? "mono" : "math-font"}>{symbol}</span>;
};

/**
 * Parses a string of grammar symbols (e.g., "S_a N_1") and renders them.
 */
export const renderRhs = (rhsString) => {
  if (!rhsString || rhsString === '\\e' || rhsString === 'EPSILON') return renderSymbol('\\e');
  
  // Split by space or just handle as single if no spaces
  const parts = rhsString.split(/\s+/);
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {renderSymbol(part)}
      {i < parts.length - 1 ? ' ' : ''}
    </React.Fragment>
  ));
};
