// @ts-nocheck
'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function Home() {
  const [kullanici, setKullanici] = useState(null)
  const [karakterler, setKarakterler] = useState([])
  const [arama, setArama] = useState('')
  const [begeniler, setBegeniler] = useState({})

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setKullanici(data.user))
    supabase.from('karakterler').select('*, begeniler(count)').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setKarakterler(data)
    })
  }, [])

  useEffect(() => {
    if (!kullanici) return
    supabase.from('begeniler').select('karakter_id').eq('kullanici_id', kullanici.id).then(({ data }) => {
      if (data) {
        const obj = {}
        data.forEach(b => obj[b.karakter_id] = true)
        setBegeniler(obj)
      }
    })
  }, [kullanici])

  async function cikisYap() {
    await supabase.auth.signOut()
    setKullanici(null)
  }

  async function toggleBegeni(karakterId) {
    if (!kullanici) { window.location.href = '/giris'; return }
    if (begeniler[karakterId]) {
      await supabase.from('begeniler').delete().eq('karakter_id', karakterId).eq('kullanici_id', kullanici.id)
      setBegeniler(prev => ({ ...prev, [karakterId]: false }))
      setKarakterler(prev => prev.map(k => k.id === karakterId ? { ...k, begeniler: [{ count: Math.max(0, (k.begeniler?.[0]?.count || 1) - 1) }] } : k))
    } else {
      await supabase.from('begeniler').insert({ karakter_id: karakterId, kullanici_id: kullanici.id })
      setBegeniler(prev => ({ ...prev, [karakterId]: true }))
      setKarakterler(prev => prev.map(k => k.id === karakterId ? { ...k, begeniler: [{ count: (k.begeniler?.[0]?.count || 0) + 1 }] } : k))
    }
  }

  const filtrelenmis = karakterler.filter(k =>
    k.karakter_adi.toLowerCase().includes(arama.toLowerCase()) ||
    k.kitap_adi.toLowerCase().includes(arama.toLowerCase())
  )

  const renkler = ['#1a1a3e','#2d0a1a','#1a1a1a','#1a0000','#1a2d0a','#1a0a2d']

  return (
    <main style={{minHeight:'100vh', background:'#0f0f0f', color:'white', fontFamily:'sans-serif'}}>
      <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 32px', borderBottom:'1px solid #222'}}>
        <span style={{fontSize:'22px', fontWeight:'600'}}>char<span style={{color:'#7F77DD'}}>faces</span></span>
        <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
          {kullanici ? (
            <>
              <Link href="/karakter-ekle"><button style={{background:'#7F77DD', border:'none', color:'white', padding:'8px 16px', borderRadius:'8px', cursor:'pointer'}}>+ Karakter ekle</button></Link>
              <span style={{fontSize:'14px', color:'#888'}}>{kullanici.email}</span>
              <button onClick={cikisYap} style={{background:'transparent', border:'1px solid #444', color:'white', padding:'8px 16px', borderRadius:'8px', cursor:'pointer'}}>Çıkış yap</button>
            </>
          ) : (
            <>
              <Link href="/giris"><button style={{background:'transparent', border:'1px solid #444', color:'white', padding:'8px 16px', borderRadius:'8px', cursor:'pointer'}}>Giriş yap</button></Link>
              <Link href="/giris"><button style={{background:'#7F77DD', border:'none', color:'white', padding:'8px 16px', borderRadius:'8px', cursor:'pointer'}}>Üye ol</button></Link>
            </>
          )}
        </div>
      </nav>

      <div style={{textAlign:'center', padding:'60px 32px 20px'}}>
        <h1 style={{fontSize:'48px', fontWeight:'700', marginBottom:'16px', lineHeight:'1.2'}}>
          Kitap karakterlerini<br/>
          <span style={{color:'#7F77DD'}}>görselleştir</span>
        </h1>
        <p style={{fontSize:'18px', color:'#888', maxWidth:'500px', margin:'0 auto 32px'}}>
          Hayal ettiğin karakterleri AI ile üret, topluluğunla paylaş.
        </p>
        <input
          type="text"
          placeholder="Karakter veya kitap ara..."
          value={arama}
          onChange={e => setArama(e.target.value)}
          style={{width:'100%', maxWidth:'500px', padding:'14px 20px', background:'#1a1a1a', border:'1px solid #444', borderRadius:'12px', color:'white', fontSize:'15px', boxSizing:'border-box', marginBottom:'16px'}}
        />
      </div>

      <div style={{padding:'0 32px 40px', maxWidth:'900px', margin:'0 auto'}}>
        <h2 style={{fontSize:'18px', fontWeight:'600', marginBottom:'20px', color:'#888'}}>
          {filtrelenmis.length > 0 ? `${filtrelenmis.length} karakter` : 'Sonuç bulunamadı'}
        </h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px'}}>
          {filtrelenmis.map((k, i) => (
            <div key={k.id} style={{background: renkler[i % renkler.length], border:'1px solid #333', borderRadius:'12px', overflow:'hidden'}}>
              <div style={{height:'200px', overflow:'hidden'}}>
                {k.gorsel_url ? (
                  <img src={k.gorsel_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                ) : (
                  <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'48px', background:'rgba(127,119,221,0.1)'}}>📖</div>
                )}
              </div>
              <div style={{padding:'12px 16px'}}>
                <div style={{fontWeight:'600', fontSize:'15px'}}>{k.karakter_adi}</div>
                <div style={{fontSize:'12px', color:'#888', marginTop:'4px'}}>{k.kitap_adi}</div>
                {k.aciklama && <div style={{fontSize:'12px', color:'#666', marginTop:'6px', lineHeight:'1.4'}}>{k.aciklama.slice(0, 80)}</div>}
                <div style={{marginTop:'10px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <button
                    onClick={() => toggleBegeni(k.id)}
                    style={{background:'transparent', border:'none', cursor:'pointer', fontSize:'18px', display:'flex', alignItems:'center', gap:'4px', color: begeniler[k.id] ? '#D4537E' : '#666', padding:'0'}}
                  >
                    {begeniler[k.id] ? '❤️' : '🤍'} <span style={{fontSize:'13px'}}>{k.begeniler?.[0]?.count || 0}</span>
                  </button>
                  <span style={{fontSize:'11px', color:'#555'}}>{k.kullanici_email?.split('@')[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
