import React, { useState } from 'react';
import Navbar from './components/Navbar';
import GrammarInput from './components/GrammarInput';
import StepVisualizer from './components/StepVisualizer';
import ResultPanel from './components/ResultPanel';
import GrammarGraph from './components/GrammarGraph';
import { GrammarEngine } from './logic/grammarEngine';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [snapshots, setSnapshots] = useState([]);
  const [finalResult, setFinalResult] = useState(null);
  const [targetType, setTargetType] = useState(null);
  const [error, setError] = useState(null);
  const [activeSymbol, setActiveSymbol] = useState(null);

  const handleConvert = (inputGrammar, type) => {
    setSnapshots([]);
    setFinalResult(null);
    setTargetType(type);
    setError(null);
    setActiveSymbol(null);

    const engine = new GrammarEngine();
    const parsed = engine.parse(inputGrammar);
    
    try {
      let res;
      if (type === 'CNF') {
        res = engine.toCNF(parsed);
      } else {
        res = engine.toGNF(parsed);
      }

      setSnapshots(res.snapshots);
      setFinalResult(res.result);
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#8b5cf6']
      });
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '40px 30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: snapshots.length > 0 ? '450px 1fr' : '1fr', gap: '40px', alignItems: 'start' }}>
          
          {/* Left Column: Fixed Input Deck */}
          <div style={{ position: snapshots.length > 0 ? 'sticky' : 'relative', top: '100px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ marginBottom: '40px' }}>
                <h2 className="gradient-text-hero" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '10px' }}>TAFL.studio</h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>Ultimate Automata Engine & Grammar Visualizer.</p>
              </div>
              
              <div className="glass-card" style={{ padding: '4px' }}>
                <GrammarInput onSubmit={handleConvert} />
              </div>

              {error && (
                <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  {error}
                </div>
              )}

              {finalResult && (
                <div style={{ marginTop: '30px' }}>
                  <ResultPanel finalGrammar={finalResult} type={targetType} />
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column: Dynamic Output Visualization */}
          <AnimatePresence>
            {snapshots.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}
              >
                <div className="glass-card" style={{ padding: '30px', border: '1px solid var(--primary-glow)' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></span>
                    Architectural Graph
                  </h3>
                  <GrammarGraph grammar={finalResult} activeSymbol={activeSymbol} />
                </div>
                
                <StepVisualizer snapshots={snapshots} setActiveSymbol={setActiveSymbol} activeSymbol={activeSymbol} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}

export default App;
