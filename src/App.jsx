import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, ArrowDown, ExternalLink } from 'lucide-react';
import GrammarInput from './components/GrammarInput';
import StepVisualizer from './components/StepVisualizer';
import ResultPanel from './components/ResultPanel';
import { GrammarEngine } from './logic/grammarEngine';

const EXAMPLE_GRAMMARS = [
  { name: 'Language aⁿbⁿ', rules: 'S -> a S b | EPSILON' },
  { name: 'Palindromes', rules: 'S -> a S a | b S b | a | b | EPSILON' },
  { name: 'Balanced Pars', rules: 'S -> ( S ) | S S | EPSILON' },
  { name: 'Equal a & b', rules: 'S -> a S b | b S a | S S | EPSILON' },
  { name: 'Language a⁺b⁺', rules: 'S -> A B\nA -> a A | a\nB -> b B | b' },
  { name: 'Math Exprs', rules: 'E -> E + E | E * E | ( E ) | x | y' },
  { name: 'Nested AABB', rules: 'S -> a b S | a b' },
  { name: 'Nullable Var', rules: 'S -> A B | c\nA -> a | EPSILON\nB -> b | EPSILON' }
];

function App() {
  const [theme, setTheme] = useState('light');
  const [snapshots, setSnapshots] = useState([]);
  const [finalResult, setFinalResult] = useState(null);
  const [targetType, setTargetType] = useState(null);
  const [error, setError] = useState(null);
  const [activeSymbol, setActiveSymbol] = useState(null);
  const [showFinalResult, setShowFinalResult] = useState(false);

  const inputRef = useRef(null);
  const proofRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const scrollTo = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleConvert = (inputGrammar, type) => {
    setSnapshots([]);
    setFinalResult(null);
    setTargetType(type);
    setError(null);
    setActiveSymbol(null);
    setShowFinalResult(false);

    const engine = new GrammarEngine();
    try {
      const parsed = engine.parse(inputGrammar);
      let res;
      if (type === 'CNF') {
        res = engine.toCNF(parsed);
      } else {
        res = engine.toGNF(parsed);
      }

      setSnapshots(res.snapshots);
      setFinalResult(res.result);
      
      // Auto-scroll to proof after short delay
      setTimeout(() => scrollTo(proofRef), 500);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', paddingBottom: '40px', paddingTop: '80px' }}>
      {/* Dynamic Academic Navbar */}
      <nav style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: '64px', 
        background: 'var(--bg-paper)', 
        borderBottom: '1px solid var(--border-subtle)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        padding: '0 5%',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.01em' }}>Grammar Converter</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CFG & Formal Automata Synthesis</span>
          </div>
          
          <div className="nav-links-desktop" style={{ display: 'flex', gap: '20px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '24px' }}>
            <button onClick={() => scrollTo(inputRef)} className="nav-link">INPUT</button>
            {snapshots.length > 0 && <button onClick={() => scrollTo(proofRef)} className="nav-link">PROOF</button>}
            {finalResult && <button onClick={() => scrollTo(resultRef)} className="nav-link">VERIFY</button>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {finalResult && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="btn-academic btn-outline" 
                onClick={() => handleConvert('', 'CNF')}
                style={{ padding: '2px 8px', fontSize: '0.55rem' }}
              >
                NEW CNF
              </button>
              <button 
                className="btn-academic btn-outline"
                onClick={() => handleConvert('', 'GNF')}
                style={{ padding: '2px 8px', fontSize: '0.55rem' }}
              >
                NEW GNF
              </button>
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, opacity: 0.5 }}>{theme.toUpperCase()}</span>
            <label className="theme-switch">
              <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
              <span className="slider">
                <Sun size={12} style={{ opacity: theme === 'light' ? 1 : 0.3 }} />
                <Moon size={12} style={{ opacity: theme === 'dark' ? 1 : 0.3 }} />
              </span>
            </label>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <section ref={inputRef} className="academic-card" style={{ marginBottom: '40px' }}>
          <h2>Input Grammar</h2>
          <GrammarInput onSubmit={handleConvert} examples={EXAMPLE_GRAMMARS} />
          
          {error && (
            <div style={{ 
              marginTop: '32px', 
              padding: '24px', 
              border: '1px solid var(--accent-crimson)', 
              color: 'var(--accent-crimson)', 
              background: 'rgba(159, 18, 57, 0.05)', 
              fontSize: '0.9rem',
              borderRadius: '4px'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}
        </section>

        {snapshots.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
            <section ref={proofRef} className="animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <h2 style={{ margin: 0 }}>Derivation Proof</h2>
                <span className="badge-academic">{targetType} MODE</span>
              </div>
              <StepVisualizer 
                snapshots={snapshots} 
                setActiveSymbol={setActiveSymbol} 
                activeSymbol={activeSymbol}
                onComplete={() => {
                  setShowFinalResult(true);
                  setTimeout(() => scrollTo(resultRef), 800);
                }} 
              />
            </section>

            {showFinalResult && (
              <section ref={resultRef} className="academic-card animate-fade-in" style={{ borderTop: '2px solid var(--text-ink)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <h2 style={{ margin: 0 }}>Verification Suite</h2>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>TARGET: {targetType} FORM</div>
                  </div>
                </div>
                <ResultPanel finalGrammar={finalResult} type={targetType} />
              </section>
            )}
            
            {!showFinalResult && (
              <div style={{ textAlign: 'center', opacity: 0.5 }}>
                <button 
                  onClick={() => {
                    setShowFinalResult(true);
                    setTimeout(() => scrollTo(resultRef), 100);
                  }}
                  className="btn-academic btn-outline"
                  style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
                >
                  Skip Transformation Proof and Jump to Final Result <ExternalLink size={12} />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{ marginTop: '80px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px', opacity: 0.5, fontSize: '0.8rem' }}>
        <p>Theoretical Automata & Formal Languages Toolkit | Research Edition</p>
      </footer>
    </div>
  );
}

export default App;
