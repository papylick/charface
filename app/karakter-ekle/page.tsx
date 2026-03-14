// @ts-nocheck
'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function KarakterEkle() {
  const [kitap, setKitap] = useState('')
  const [karakter, setKarakter] = useState('')
  const [aciklama, setAciklama] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)
  const [mesaj, setMesaj] = useState('')

  async function handleSubmit() {
    if (!kitap || !karakter) {
      setMesaj('Kitap ve karakter adı zorunlu!')
      return
    }
    setYukleniyor(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMesaj('Önce giriş yapmalısın!')
      setYukleniyor(false)
      return
    }
    const { error } = await supabase.from('karakterler').insert({
      kitap_adi: kitap,
      karakter_adi: karakter,
      aciklama: aciklama,
      kullanici_id: user.id,
      kullanici_email: user.email,
    })
    if (error) setMesaj('Hata: ' + error.message)
    else {
      setMesaj('Karakter eklendi!')
      setKitap('')
      setKarakter('')
      setAciklama('')
    }
    setYukleniyor(false)
  }

  return (
    <main style={{minHeight:'100vh', background:'#0f0f0f', color:'white', fontFamily:'sans-serif'}}>
      <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 32px', borderBottom:'1px solid #222'}}>
        <a href="/" style={{fontSize:'22px', fontWeight:'600', textDecoration:'none', color:'white'}}>char<span style={{color:'#7F77DD'}}>faces</span></a>
      </nav>

      <div style={{maxWidth:'500px', margin:'60px auto', padding:'0 32px'}}>
        <h1 style={{fontSize:'28px', fontWeight:'700', marginBottom:'8px'}}>Karakter ekle</h1>
        <p style={{color:'#888', marginBottom:'32px', fontSize:'14px'}}>Okuduğun kitaptaki karakteri topluluğa tanıt</p>

        <div style={{marginBottom:'16px'}}>
          <label style={{fontSize:'13px', color:'#888', display:'block', marginBottom:'6px'}}>Kitap adı *</label>
          <input
            type="text"
            placeholder="örn. Yüzüklerin Efendisi"
            value={kitap}
            onChange={e => setKitap(e.target.value)}
            style={{width:'100%', padding:'12px', background:'#1a1a1a', border:'1px solid #333', borderRadius:'8px', color:'white', fontSize:'14px', boxSizing:'border-box'}}
          />
        </div>

        <div style={{marginBottom:'16px'}}>
          <label style={{fontSize:'13px', color:'#888', display:'block', marginBottom:'6px'}}>Karakter adı *</label>
          <input
            type="text"
            placeholder="örn. Gandalf"
            value={karakter}
            onChange={e => setKarakter(e.target.value)}
            style={{width:'100%', padding:'12px', background:'#1a1a1a', border:'1px solid #333', borderRadius:'8px', color:'white', fontSize:'14px', boxSizing:'border-box'}}
          />
        </div>

        <div style={{marginBottom:'24px'}}>
          <label style={{fontSize:'13px', color:'#888', display:'block', marginBottom:'6px'}}>Karakteri tarif et</label>
          <textarea
            placeholder="örn. Uzun beyaz saçlı, gri gözlü, güçlü bir büyücü..."
            value={aciklama}
            onChange={e => setAciklama(e.target.value)}
            style={{width:'100%', padding:'12px', background:'#1a1a1a', border:'1px solid #333', borderRadius:'8px', color:'white', fontSize:'14px', minHeight:'100px', resize:'vertical', boxSizing:'border-box', fontFamily:'sans-serif'}}
          />
        </div>

        {mesaj && <p style={{color: mesaj.includes('Hata') ? '#ff6b6b' : '#7F77DD', fontSize:'13px', marginBottom:'16px'}}>{mesaj}</p>}

        <button
          onClick={handleSubmit}
          disabled={yukleniyor}
          style={{width:'100%', padding:'14px', background:'#7F77DD', border:'none', borderRadius:'8px', color:'white', fontSize:'15px', fontWeight:'600', cursor:'pointer', opacity: yukleniyor ? 0.7 : 1}}
        >
          {yukleniyor ? 'Ekleniyor...' : 'Karakter ekle'}
        </button>
      </div>
    </main>
  )
}