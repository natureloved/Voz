import React from 'react';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#FBF7EF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 100px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background accent */}
        <div style={{
          position: 'absolute',
          top: '-120px',
          right: '-120px',
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          background: 'rgba(255,107,92,0.08)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '60px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'rgba(245,200,66,0.07)',
          display: 'flex',
        }} />

        {/* Brand */}
        <div style={{
          fontSize: '22px',
          fontWeight: 700,
          color: '#0A2540',
          letterSpacing: '-0.5px',
          marginBottom: '48px',
          opacity: 0.5,
          display: 'flex',
        }}>
          Voz<span style={{ color: '#FF6B5C' }}>.</span>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {['Speak.', 'Send.', 'Heard.'].map((word) => (
            <div key={word} style={{
              fontSize: '110px',
              fontWeight: 800,
              color: '#0A2540',
              letterSpacing: '-4px',
              lineHeight: 0.92,
              display: 'flex',
            }}>
              {word}
            </div>
          ))}
        </div>

        {/* Subhead */}
        <div style={{
          marginTop: '36px',
          fontSize: '24px',
          color: '#0A2540',
          opacity: 0.5,
          fontWeight: 400,
          display: 'flex',
        }}>
          Voice-first remittance · Any EVM chain to Solana · Your language
        </div>

        {/* Coral CTA pill */}
        <div style={{
          marginTop: '40px',
          background: '#FF6B5C',
          color: '#FBF7EF',
          padding: '14px 28px',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: 600,
          display: 'flex',
        }}>
          voz.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
