// @ts-nocheck
'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

export default function BildirimZili({ kullaniciId }: { kullaniciId: string }) {
  const [bildirimler, setBildirimler] = useState([])
  const [acik, setAcik] = useState(false)
  const [yukleniyor, setYukleniyor] = useState(true)
  const ref = useRef(null)

  const okunmamis = bildirimler.filter(b => !b.okundu).length

  useEffect(() => {
    if (!kullaniciId) return
    bildirimlerGetir()
    const disariTikla = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAcik(false)
    }
    document.addEventListener('mousedown', disariTikla)
    return () => document.removeEventListener('mousedown', disariTikla)
  }, [kullaniciId])

  async function bildirimlerGetir() {
    const res = await fetch('/api/bildirim', {
      headers: { 'x-kullanici-id': kullaniciId }
    })
    if (res.ok) {
      const data = await res.json()
      setBildirimler(data)
    }
    setYukleniyor(false)
  }

  async function zileBasildi() {
    setAcik(prev => !prev)
    if (!acik && okunmamis > 0) {
      await fetch('/api/bildirim', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kullanici_id: kullaniciId })
      })
      setBildirimler(prev => prev.map(b => ({ ...b, okundu: true })))
    }
  }

  function tipMetni(tip) {
  const ikonlar = { begeni: '❤️', yorum: '💬', takip: '👤', mesaj: '✉️' }
  const mesajlar = { 
    begeni: 'karakterini beğendi', 
    yorum: 'karakterine yorum yaptı', 
    takip: 'seni takip etmeye başladı',
    mesaj: 'sana mesaj gönderdi'
  }
  return { ikon: ikonlar[tip] || '🔔', mesaj: mesajlar[tip] || tip }
}

  function zamanFarki(tarih) {
    const fark = Date.now() - new Date(tarih).getTime()
    const dk = Math.floor(fark / 60000)
    if (dk < 1) return 'az önce'
    if (dk < 60) return `${dk} dk önce`
    const saat = Math.floor(dk / 60)
    if (saat < 24) return `${saat} saat önce`
    return `${Math.floor(saat / 24)} gün önce`
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={zileBasildi}
        style={{ background: 'transparent', border: '1px solid rgba(201,169,110,0.4)', color: '#c9a96e', width: '42px', height: '42px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transition: 'all 0.3s ease' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,110,0.1)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        🔔
        {okunmamis > 0 && (
          <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#7F77DD', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', fontFamily: 'Cinzel, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
            {okunmamis > 9 ? '9+' : okunmamis}
          </span>
        )}
      </button>

      {acik && (
        <div style={{ position: 'absolute', top: '50px', right: 0, width: '320px', background: 'linear-gradient(145deg, #12101a, #1a1228)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', zIndex: 999, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(201,169,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '11px', letterSpacing: '2px', color: '#c9a96e' }}>BİLDİRİMLER</span>
            {okunmamis > 0 && <span style={{ fontSize: '11px', color: '#7F77DD', fontFamily: 'EB Garamond, serif' }}>{okunmamis} yeni</span>}
          </div>

          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {yukleniyor ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#555', fontFamily: 'EB Garamond, serif' }}>Yükleniyor...</div>
            ) : bildirimler.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#444', fontFamily: 'EB Garamond, serif', fontStyle: 'italic' }}>Henüz bildirim yok</div>
            ) : (
              bildirimler.map(b => {
                const { ikon, mesaj } = tipMetni(b.tip)
                return (
                  <a key={b.id} href={b.karakter_id ? `/karakter/${b.karakter_id}` : '#'}
                    style={{ display: 'block', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', background: b.okundu ? 'transparent' : 'rgba(127,119,221,0.05)', textDecoration: 'none', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,110,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = b.okundu ? 'transparent' : 'rgba(127,119,221,0.05)'}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '16px', marginTop: '2px' }}>{ikon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', color: '#bbb', fontFamily: 'EB Garamond, serif', lineHeight: '1.5' }}>
                          <span style={{ color: '#c9a96e' }}>Biri</span> {mesaj}
                        </div>
                        <div style={{ fontSize: '11px', color: '#555', marginTop: '4px', fontFamily: 'EB Garamond, serif' }}>{zamanFarki(b.created_at)}</div>
                      </div>
                      {!b.okundu && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7F77DD', marginTop: '6px', flexShrink: 0 }} />}
                    </div>
                  </a>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}