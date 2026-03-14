// @ts-nocheck
'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Profil() {
  const [kullanici, setKullanici] = useState(null)
  const [karakterler, setKarakterler] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/giris'; return }
      setKullanici(data.user)
      const { data: chars } = await supabase
        .from('karakterler')
        .select('*, begeniler(count)')
        .eq('kullanici_id', data.user.id)
        .order('created_at', { ascending: false })
      if (chars) setKarakterler(chars)
      setYukleniyor(false)
    })
  }, [])

  async function cikisYap() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const toplamBegeni = karakterler.reduce((acc, k) => acc + (k.begeniler?.[0]?.count || 0), 0)
  const renkler = ['#1a1a3e','#2d0a1a','#1a1a1a','#1a0000','#1a2d0a','#1a0a2d']

  if (yukleniyor) return (
    <main style={{minHeight:'100vh', background:'#0f0f0f', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif'}}>
      <div style={{color:'#888'}}>Yükleniyor...</div>
    </main>
  )

  return (
    <main style={{minHeight:'100vh', background:'#0f0f0f', color:'white', fontFamily:'sans-serif'}}>
      <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 32px', borderBottom:'1px solid #222'}}>
        <Link href="/" style={{fontSize:'22px', fontWeight:'600', textDecoration:'none', color:'white'}}>char<span style={{color:'#7F77DD'}}>faces</span></Link>
        <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
          <Link href="/karakter-ekle"><button style={{background:'#7F77DD', border:'none', color:'white', padding:'8px 16px', borderRadius:'8px', cursor:'pointer'}}>+ Karakter ekle</button></Link>
          <button onClick={cikisYap} style={{background:'transparent', border:'1px solid #444', color:'white', padding:'8px 16px', borderRadius:'8px', cursor:'pointer'}}>Çıkış yap</button>
        </div>
      </nav>

      <div style={{maxWidth:'900px', margin:'0 auto', padding:'40px 32px'}}>
        
        <div style={{background:'#1a1a1a', border:'1px solid #333', borderRadius:'16px', padding:'32px', marginBottom:'32px', display:'flex', alignItems:'center', gap:'24px'}}>
          <div style={{width:'80px', height:'80px', borderRadius:'50%', background:'#7F77DD', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', fontWeight:'700', flexShrink:0}}>
            {kullanici?.email?.[0].toUpperCase()}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:'20px', fontWeight:'600', marginBottom:'4px'}}>{kullanici?.email?.split('@')[0]}</div>
            <div style={{fontSize:'14px', color:'#666', marginBottom:'16px'}}>{kullanici?.email}</div>
            <div style={{display:'flex', gap:'24px'}}>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'24px', fontWeight:'700'}}>{karakterler.length}</div>
                <div style={{fontSize:'12px', color:'#888'}}>karakter</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'24px', fontWeight:'700'}}>{toplamBegeni}</div>
                <div style={{fontSize:'12px', color:'#888'}}>beğeni</div>
              </div>
            </div>
          </div>
        </div>

        <h2 style={{fontSize:'18px', fontWeight:'600', marginBottom:'20px', color:'#888'}}>
          Benim karakterlerim ({karakterler.length})
        </h2>

        {karakterler.length === 0 ? (
          <div style={{textAlign:'center', padding:'60px', color:'#555'}}>
            <div style={{fontSize:'48px', marginBottom:'16px'}}>📖</div>
            <div style={{fontSize:'16px', marginBottom:'16px'}}>Henüz karakter eklemedin</div>
            <Link href="/karakter-ekle"><button style={{background:'#7F77DD', border:'none', color:'white', padding:'12px 24px', borderRadius:'8px', cursor:'pointer', fontSize:'14px'}}>İlk karakterini ekle</button></Link>
          </div>
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px'}}>
            {karakterler.map((k, i) => (
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
                  <div style={{marginTop:'8px', fontSize:'13px', color:'#D4537E'}}>❤️ {k.begeniler?.[0]?.count || 0} beğeni</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}