import React from 'react';

export default function HowVarasatWorks() {
  return (
    <div style={{
      background: 'rgba(15,28,55,0.8)',
      border: '1px solid rgba(212,160,23,0.15)',
      borderRadius: '20px',
      padding: '2rem',
      color: '#f0f4ff',
      fontFamily: "'Inter', sans-serif"
    }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center', color: '#d4a017' }}>
        How Varasat AI Works
      </h2>

      <p style={{ color: '#8fa4c8', textAlign: 'center', marginBottom: '2.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
        Varasat assists families in organizing documents, identifying possible assets, and preparing claim steps. It does not directly access bank databases or predict recovery guarantees.
      </p>

      {/* AI Pipeline Flow */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '3rem'
      }}>
        <FlowStep icon="🤖" title="Varasat AI Agent" desc="Understands intent and reasons securely" color="#10b981" />
        <FlowArrow />
        <FlowStep icon="📚" title="Knowledge Retrieval (RAG)" desc="Fetches verified legal procedures" color="#f59e0b" />
        <FlowArrow />
        <FlowStep icon="⚡" title="Financial Analysis" desc="Calculates inflation impact with Wolfram" color="#8b5cf6" />
        <FlowArrow />
        <FlowStep icon="📄" title="Document Assistance" desc="Analyzes statements & drafts legal forms" />
      </div>

      {/* Engine Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        
        {/* Claude Column */}
        <div style={{
          background: 'rgba(16,185,129,0.05)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '16px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🤖</span>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#10b981' }}>Agent & Reasoning</span>
          </div>
          <div style={{ color: '#a7f3d0', fontSize: '0.9rem', lineHeight: 1.8 }}>
            <div>✓ Orchestrates tool usage</div>
            <div>✓ Answers using verified RAG data</div>
            <div>✓ Empathetic user interaction</div>
            <div>✓ Explains financial calculations</div>
          </div>
        </div>

        {/* Wolfram Column */}
        <div style={{
          background: 'rgba(139,92,246,0.05)',
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: '16px',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#a78bfa' }}>Wolfram Language</span>
          </div>
          <div style={{ color: '#ddd6fe', fontSize: '0.9rem', lineHeight: 1.8 }}>
            <div>✓ Mathematical modelling</div>
            <div>✓ Financial calculations</div>
            <div>✓ Inflation & purchasing power</div>
            <div>✓ Confidence scoring</div>
          </div>
        </div>

      </div>
    </div>
  );
}

function FlowStep({ icon, title, desc, color = '#3b82f6' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      background: 'rgba(0,0,0,0.2)', border: `1px solid ${color}40`,
      padding: '0.8rem 1.5rem', borderRadius: '999px',
      minWidth: '320px', justifyContent: 'center'
    }}>
      <span style={{ fontSize: '1.25rem' }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f0f4ff' }}>{title}</div>
        <div style={{ fontSize: '0.75rem', color: '#8fa4c8' }}>{desc}</div>
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div style={{ color: '#4b5563', fontSize: '1.25rem' }}>↓</div>
  );
}
