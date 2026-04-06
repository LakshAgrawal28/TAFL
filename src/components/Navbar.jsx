import React from 'react';
import { Network, Settings, History } from 'lucide-react';
import './../index.css';

const Navbar = () => {
  return (
    <nav style={{
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-card)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 4px 20px -2px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          padding: '8px', 
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 10px var(--primary-glow)'
        }}>
          <Network size={22} color="white" />
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>
          <span style={{ color: 'var(--foreground)' }}>Automata</span>
          <span className="gradient-text">.studio</span>
        </h1>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
        <button className="btn-secondary btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem' }}>
          <History size={16} /> History
        </button>
        <button className="btn-secondary btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem' }}>
          <Settings size={16} /> Settings
        </button>
      </div>
    </nav>
  );
};
export default Navbar;
