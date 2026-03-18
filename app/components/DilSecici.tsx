// @ts-nocheck
'use client'
import { useState, useEffect } from 'react'

export default function DilSecici() {
  const [dil, setDil] = useState('TR')
  const [acik, setAcik] = useState(false)

  useEffect(() => {
    const kayitliDil = localStorage.getItem('dil') || 'TR'
    setDil(kayitliDil)
  }, [])

  function dilDegistir(yeniDil) {
    localStorage.setItem('dil', yeniDil)
    setDil(yeniDil)
    setAcik(false)
    window.location.reload()
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setAcik(prev => !prev)}
        style={{ background: 'transparent', border: '1px solid rgba(201,169,110,0.4)', color: '#c9a96e', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: '12px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.3s ease' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,110,0.1)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        🌐 {dil}
      </button>

      {acik && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '6px', background: 'linear-gradient(145deg, #12101a, #1a1228)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '10px', overflow: 'hidden', zIndex: 9999, boxShadow: '0 10px 40px rgba(0,0,0,0.6)', minWidth: '120px' }}>
          {['TR', 'EN'].map(d => (
            <div key={d} onClick={() => dilDegistir(d)}
              style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.2s', background: dil === d ? 'rgba(201,169,110,0.1)' : 'transparent', borderBottom: d === 'TR' ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,110,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = dil === d ? 'rgba(201,169,110,0.1)' : 'transparent'}
            >
              <span style={{ fontSize: '16px' }}>{d === 'TR' ? '🇹🇷' : '🇬🇧'}</span>
              <span style={{ fontSize: '13px', fontFamily: 'Cinzel, serif', color: dil === d ? '#c9a96e' : '#888', letterSpacing: '1px' }}>
                {d === 'TR' ? 'Türkçe' : 'English'}
              </span>
              {dil === d && <span style={{ marginLeft: 'auto', color: '#c9a96e', fontSize: '12px' }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
``