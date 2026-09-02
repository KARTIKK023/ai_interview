import React from 'react';

const Footer = () => {
  return (
    <footer
      className="mt-auto px-4 py-3 position-relative flex-shrink-0"
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 1px, transparent 1px), linear-gradient(90deg, #050B2E 0%, #17105A 50%, #4C1D95 100%)',
        backgroundSize: '24px 24px, 100% 100%',
        boxShadow: '0 -6px 25px -2px rgba(139, 92, 246, 0.25), 0 -2px 10px rgba(5, 11, 46, 0.4)',
        zIndex: 10
      }}
    >
      {/* THIN GRADIENT TOP BORDER */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
          opacity: 0.85
        }}
      />

      <div className="container-fluid p-0 text-center">
        <p className="small mb-0" style={{ color: '#cbd5e1', fontSize: '0.85rem', letterSpacing: '0.01em' }}>
          © {new Date().getFullYear()} <span className="fw-bold text-white">HireSmart AI</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
