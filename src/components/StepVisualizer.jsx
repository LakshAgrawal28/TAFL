import React from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

const StepVisualizer = ({ snapshots, activeSymbol, setActiveSymbol }) => {
  if (!snapshots || snapshots.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        Transformation Steps
      </h3>
      
      <LayoutGroup>
        {snapshots.map((snap, index) => (
          <React.Fragment key={index}>
            <motion.div 
              layout
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.15, type: 'spring', bounce: 0.4 }}
              className="glass-panel"
              style={{ padding: '24px', position: 'relative' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div className="gradient-bg" style={{
                  width: '36px', height: '36px',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', fontSize: '1.1rem',
                    boxShadow: '0 4px 10px var(--primary-glow)'
                }}>
                  {index + 1}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>{snap.stepName}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', margin: 0 }}>{snap.description}</p>
                </div>
              </div>
              
              <div style={{ 
                background: 'var(--bg-main)',
                padding: '16px', 
                borderRadius: '10px', 
                border: '1px solid var(--border)',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.entries(snap.grammar).map(([lhs, rhsList]) => (
                    <motion.div 
                      layout
                      key={lhs} 
                      onMouseEnter={() => setActiveSymbol(lhs)}
                      onMouseLeave={() => setActiveSymbol(null)}
                      style={{ 
                        display: 'flex', 
                        gap: '8px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: activeSymbol === lhs ? 'var(--primary-glow)' : 'transparent',
                        transition: 'background 0.2s ease',
                        cursor: 'default'
                      }}
                    >
                      <span className="mono-text" style={{ 
                        color: activeSymbol === lhs ? 'var(--primary)' : 'var(--foreground)',
                        fontWeight: 600,
                        minWidth: '30px'
                      }}>
                        {lhs}
                      </span>
                      <span className="mono-text" style={{ color: 'var(--text-dim)' }}>→</span>
                      <span className="mono-text" style={{ color: 'var(--foreground)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {rhsList.length > 0 ? rhsList.map((rhs, i) => (
                          <React.Fragment key={i}>
                            <motion.span 
                              layout
                              style={{ 
                                background: 'var(--border-light)',
                                padding: '2px 6px', 
                                borderRadius: '4px',
                                border: '1px solid var(--border)'
                              }}
                            >
                              {rhs}
                            </motion.span>
                            {i < rhsList.length - 1 && <span style={{ color: 'var(--text-dim)' }}>|</span>}
                          </React.Fragment>
                        )) : (
                          <span style={{ color: 'var(--text-dim)' }}>∅</span>
                        )}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {index < snapshots.length - 1 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.15 + 0.3 }}
                style={{ display: 'flex', justifyContent: 'center', color: 'var(--primary)', margin: '-10px 0' }}
              >
                <ArrowDown size={28} style={{ opacity: 0.6 }} />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </LayoutGroup>
    </div>
  );
};

export default StepVisualizer;
