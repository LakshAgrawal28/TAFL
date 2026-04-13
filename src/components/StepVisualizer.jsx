import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, BookOpen, Settings2, SkipForward, SkipBack } from 'lucide-react';
import { renderSymbol, renderRhs } from '../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';

const StepVisualizer = ({ snapshots, activeSymbol, setActiveSymbol, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(2000);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(false);
  }, [snapshots]);

  useEffect(() => {
    if (isPlaying) {
      setProgress(0);
      const startTime = Date.now();
      
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / playbackSpeed) * 100, 100);
        setProgress(newProgress);
      }, 50);

      timerRef.current = setTimeout(() => {
        if (currentStep < snapshots.length - 1) {
          setCurrentStep(c => c + 1);
        } else {
          setIsPlaying(false);
          if (onComplete) onComplete();
        }
      }, playbackSpeed);
    }

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, currentStep, snapshots.length, playbackSpeed, onComplete]);

  if (!snapshots || snapshots.length === 0 || currentStep >= snapshots.length) return null;

  const snap = snapshots[currentStep];
  const prevSnap = currentStep > 0 && currentStep < snapshots.length ? snapshots[currentStep - 1] : null;

  const handleTogglePlay = () => setIsPlaying(!isPlaying);
  const handleNext = () => { 
    setIsPlaying(false); 
    if (currentStep < snapshots.length - 1) {
      setCurrentStep(c => c + 1);
      if (currentStep + 1 === snapshots.length - 1 && onComplete) onComplete();
    } 
  };
  const handlePrev = () => { setIsPlaying(false); if (currentStep > 0) setCurrentStep(c => c - 1); };

  const isRuleModified = (lhs, rhsList) => {
    if (!prevSnap) return true;
    const prevRhsList = prevSnap.grammar[lhs];
    if (!prevRhsList) return true;
    return JSON.stringify(prevRhsList) !== JSON.stringify(rhsList);
  };

  return (
    <div className="presentation-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div 
        className="academic-card stage-active" 
        style={{ 
          padding: '24px', 
          background: 'var(--bg-paper)',
          position: 'relative',
          minHeight: '320px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)'
        }}
      >
        {/* Subtle Progress Bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
          <motion.div 
            style={{ height: '100%', background: 'var(--accent-blue)', width: isPlaying ? '100%' : '0%' }}
            animate={isPlaying ? { width: '100%' } : { width: `${(currentStep / (snapshots.length - 1)) * 100}%` }}
            transition={isPlaying ? { duration: playbackSpeed / 1000, ease: "linear" } : { duration: 0.3 }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
          <span className="mono" style={{ opacity: 0.4, fontSize: '0.7rem', letterSpacing: '0.2em' }}>
            STEP {String(currentStep + 1).padStart(2, '0')} / {String(snapshots.length).padStart(2, '0')}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[3000, 2000, 1000].map(s => (
              <button 
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`btn-academic btn-outline ${playbackSpeed === s ? 'active' : ''}`}
                style={{ padding: '2px 6px', fontSize: '0.55rem', opacity: playbackSpeed === s ? 1 : 0.3 }}
              >
                {s === 3000 ? '0.5x' : s === 2000 ? '1x' : '2x'}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{snap.stepName}</h3>
              <p className="description-text" style={{ maxWidth: '700px', margin: '0 auto', fontSize: '0.9rem', lineHeight: '1.4' }}>
                {snap.description}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '500px', margin: '0 auto' }}>
              {Object.entries(snap.grammar).map(([lhs, rhsList]) => {
                const modified = isRuleModified(lhs, rhsList);
                return (
                  <div key={lhs} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: '4px 16px',
                    fontSize: '1.1rem',
                    borderLeft: modified ? '3px solid var(--accent-blue)' : '3px solid transparent',
                    background: modified ? 'var(--bg-secondary)' : 'transparent',
                    transition: 'all 0.5s ease'
                  }}>
                    <div style={{ fontWeight: 600 }}>{renderSymbol(lhs)}</div>
                    <div style={{ margin: '0 12px', opacity: 0.3 }}>→</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {rhsList.length === 0 ? renderSymbol('ε') : rhsList.map((rhs, i) => (
                        <React.Fragment key={i}>
                          <span>{renderRhs(rhs)}</span>
                          {i < rhsList.length - 1 && <span style={{ opacity: 0.2 }}>|</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Control Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: '24px',
        background: 'var(--bg-paper)',
        padding: '12px',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px'
      }}>
        <button onClick={handlePrev} className="control-btn" disabled={currentStep === 0}>
          <SkipBack size={20} />
        </button>

        <button 
          onClick={handleTogglePlay} 
          style={{ 
            background: 'var(--text-ink)', 
            color: 'var(--bg-paper)', 
            width: '44px', 
            height: '44px', 
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '4px' }} />}
        </button>

        <button onClick={handleNext} className="control-btn" disabled={currentStep === snapshots.length - 1}>
          <SkipForward size={20} />
        </button>
      </div>
    </div>
  );
};

export default StepVisualizer;


