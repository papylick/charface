// @ts-nocheck
'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function Home() {
  const [kullanici, setKullanici] = useState(null)
  const [karakterler, setKarakterler] = useState([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setKullanici(data.user))
    supabase.from('karakterler').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setKarakterler(data)
    })
  }, [])

  async function cikisYap() {
    await supabase.auth.signOut()
    setKullanici(null)
  }

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

      <div style={{textAlign:'center', padding:'60px 32px 40px'}}>
        <h1 style={{fontSize:'48px', fontWeight:'700', marginBottom:'16px', lineHeight:'1.2'}}>
          Kitap karakterlerini<br/>
          <span style={{color:'#7F77DD'}}>görselleştir</span>
        </h1>
        <p style={{fontSize:'18px', color:'#888', maxWidth:'500px', margin:'0 auto 32px'}}>
          Hayal ettiğin karakterleri AI ile üret, topluluğunla paylaş.
        </p>
        <Link href="/karakter-ekle"><button style={{background:'#7F77DD', border:'none', color:'white', padding:'14px 32px', borderRadius:'10px', fontSize:'16px', cursor:'pointer'}}>
          Hemen başla
        </button></Link>
      </div>

      <div style={{padding:'0 32px 40px', maxWidth:'900px', margin:'0 auto'}}>
        <h2 style={{fontSize:'18px', fontWeight:'600', marginBottom:'20px', color:'#888'}}>
          {karakterler.length > 0 ? `${karakterler.length} karakter` : 'Henüz karakter yok'}
        </h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px'}}>
          {karakterler.map((k, i) => (
            <div key={k.id} style={{background: renkler[i % renkler.length], border:'1px solid #333', borderRadius:'12px', overflow:'hidden', cursor:'pointer'}}>
              <div style={{height:'200px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'48px', background:'rgba(127,119,221,0.1)'}}>
                📖
              </div>
              <div style={{padding:'12px 16px'}}>
                <div style={{fontWeight:'600', fontSize:'15px'}}>{k.karakter_adi}</div>
                <div style={{fontSize:'12px', color:'#888', marginTop:'4px'}}>{k.kitap_adi}</div>
                {k.aciklama && <div style={{fontSize:'12px', color:'#666', marginTop:'6px', lineHeight:'1.4'}}>{k.aciklama.slice(0, 80)}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}