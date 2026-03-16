// @ts-nocheck
'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function KarakterEkle() {
  const [kitap, setKitap] = useState('')
  const [karakter, setKarakter] = useState('')
  const [aciklama, setAciklama] = useState('')
  const [gorsel, setGorsel] = useState(null)
  const [onizleme, setOnizleme] = useState(null)
  const [aiGorselUrl, setAiGorselUrl] = useState(null)
  const [aiUretiyor, setAiUretiyor] = useState(false)
  const [yukleniyor, setYukleniyor] = useState(false)
  const [mesaj, setMesaj] = useState('')

  function gorselSec(e) {
    const file = e.target.files[0]
    if (file) {
      setGorsel(file)
      setOnizleme(URL.createObjectURL(file))
      setAiGorselUrl(null)
    }
  }

  async function aiGorselUret() {
    if (!aciklama && !karakter) {
      setMesaj('Önce karakteri tarif et!')
      return
    }
    setAiUretiyor(true)
    setMesaj('')

    const prompt = `A highly realistic portrait of ${karakter || 'a character'} from the book "${kitap}", ${aciklama}. Cinematic lighting, photorealistic, ultra detailed, 8k, masterpiece, dramatic atmosphere`

    const res = await fetch('/api/gorsel-uret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })
    const data = await res.json()

    if (data.url) {
      setAiGorselUrl(data.url)
      setOnizleme(data.url)
      setGorsel(null)
    } else {
      setMesaj('Görsel üretilemedi, tekrar dene!')
    }
    setAiUretiyor(false)
  }

  async function handleSubmit() {
    if (!kitap || !karakter) {
      setMesaj('Kitap ve karakter adı zorunlu!')
      return
    }
    if (!gorsel && !aiGorselUrl) {
      setMesaj('Bir görsel ekle veya AI ile üret!')
      return
    }
    setYukleniyor(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMesaj('Önce giriş yapmalısın!')
      setYukleniyor(false)
      return
    }

    let gorsel_url = aiGorselUrl || null

    if (gorsel && !aiGorselUrl) {
      const dosyaAdi = `${user.id}-${Date.now()}-${gorsel.name}`
      const { error: uploadError } = await supabase.storage
        .from('gorseller')
        .upload(dosyaAdi, gorsel)
      if (!uploadError) {
        const { data } = supabase.storage.from('gorseller').getPublicUrl(dosyaAdi)
        gorsel_url = data.publicUrl
      }
    }

    const { error } = await supabase.from('karakterler').insert({
      kitap_adi: kitap,
      karakter_adi: karakter,
      aciklama: aciklama,
      gorsel_url: gorsel_url,
      kullanici_id: user.id,
      kullanici_email: user.email,
    })

    if (error) setMesaj('Hata: ' + error.message)
    else {
      setMesaj('Karakter eklendi!')
      setTimeout(() => window.location.href = '/', 1000)
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
          <input type="text" placeholder="örn. Yüzüklerin Efendisi" value={kitap} onChange={e => setKitap(e.target.value)}
            style={{width:'100%', padding:'12px', background:'#1a1a1a', border:'1px solid #333', borderRadius:'8px', color:'white', fontSize:'14px', boxSizing:'border-box'}}/>
        </div>

        <div style={{marginBottom:'16px'}}>
          <label style={{fontSize:'13px', color:'#888', display:'block', marginBottom:'6px'}}>Karakter adı *</label>
          <input type="text" placeholder="örn. Gandalf" value={karakter} onChange={e => setKarakter(e.target.value)}
            style={{width:'100%', padding:'12px', background:'#1a1a1a', border:'1px solid #333', borderRadius:'8px', color:'white', fontSize:'14px', boxSizing:'border-box'}}/>
        </div>

        <div style={{marginBottom:'16px'}}>
          <label style={{fontSize:'13px', color:'#888', display:'block', marginBottom:'6px'}}>Karakteri tarif et</label>
          <textarea placeholder="örn. Uzun beyaz saçlı, gri gözlü, güçlü bir büyücü..." value={aciklama} onChange={e => setAciklama(e.target.value)}
            style={{width:'100%', padding:'12px', background:'#1a1a1a', border:'1px solid #333', borderRadius:'8px', color:'white', fontSize:'14px', minHeight:'100px', resize:'vertical', boxSizing:'border-box', fontFamily:'sans-serif'}}/>
        </div>

        <button onClick={aiGorselUret} disabled={aiUretiyor}
          style={{width:'100%', padding:'12px', background:'linear-gradient(135deg, #7F77DD, #D4537E)', border:'none', borderRadius:'8px', color:'white', fontSize:'14px', fontWeight:'600', cursor:'pointer', marginBottom:'16px', opacity: aiUretiyor ? 0.7 : 1}}>
          {aiUretiyor ? '✨ Görsel üretiliyor...' : '✨ AI ile Görsel Üret'}
        </button>

        {onizleme && (
          <div style={{marginBottom:'16px'}}>
            <img src={onizleme} style={{width:'100%', maxHeight:'300px', objectFit:'cover', borderRadius:'12px'}}/>
            {aiGorselUrl && (
              <div style={{marginTop:'12px', display:'flex', gap:'8px'}}>
                <button onClick={aiGorselUret} disabled={aiUretiyor}
                  style={{flex:1, padding:'10px', background:'transparent', border:'1px solid #7F77DD', borderRadius:'8px', color:'#7F77DD', cursor:'pointer', fontSize:'13px'}}>
                  🔄 Tekrar üret
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{marginBottom:'24px'}}>
          <label style={{fontSize:'13px', color:'#888', display:'block', marginBottom:'6px'}}>Ya da kendin yükle</label>
          <div style={{border:'2px dashed #333', borderRadius:'8px', padding:'20px', textAlign:'center', cursor:'pointer'}}
            onClick={() => document.getElementById('gorsel-input').click()}>
            {!onizleme && (
              <div>
                <div style={{fontSize:'32px', marginBottom:'8px'}}>📷</div>
                <div style={{fontSize:'13px', color:'#666'}}>Görsel yüklemek için tıkla</div>
              </div>
            )}
            {onizleme && !aiGorselUrl && (
              <img src={onizleme} style={{width:'100%', maxHeight:'250px', objectFit:'cover', borderRadius:'8px'}}/>
            )}
          </div>
          <input id="gorsel-input" type="file" accept="image/*" onChange={gorselSec} style={{display:'none'}}/>
        </div>

        {mesaj && <p style={{color: mesaj.includes('Hata') || mesaj.includes('üretilemedi') ? '#ff6b6b' : '#7F77DD', fontSize:'13px', marginBottom:'16px'}}>{mesaj}</p>}

        <button onClick={handleSubmit} disabled={yukleniyor}
          style={{width:'100%', padding:'14px', background:'#7F77DD', border:'none', borderRadius:'8px', color:'white', fontSize:'15px', fontWeight:'600', cursor:'pointer', opacity: yukleniyor ? 0.7 : 1}}>
          {yukleniyor ? 'Ekleniyor...' : 'Karakter ekle'}
        </button>
      </div>
    </main>
  )
}