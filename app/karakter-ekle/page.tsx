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
  const [yukleniyor, setYukleniyor] = useState(false)
  const [mesaj, setMesaj] = useState('')

  function gorselSec(e) {
    const file = e.target.files[0]
    if (file) {
      setGorsel(file)
      setOnizleme(URL.createObjectURL(file))
    }
  }

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

    let gorsel_url = null
    if (gorsel) {
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
      setKitap('')
      setKarakter('')
      setAciklama('')
      setGorsel(null)
      setOnizleme(null)
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

        <div style={{marginBottom:'24px'}}>
          <label style={{fontSize:'13px', color:'#888', display:'block', marginBottom:'6px'}}>Karakter görseli</label>
          <div style={{border:'2px dashed #333', borderRadius:'8px', padding:'20px', textAlign:'center', cursor:'pointer'}}
            onClick={() => document.getElementById('gorsel-input').click()}>
            {onizleme ? (
              <img src={onizleme} style={{width:'100%', maxHeight:'250px', objectFit:'cover', borderRadius:'8px'}}/>
            ) : (
              <div>
                <div style={{fontSize:'32px', marginBottom:'8px'}}>📷</div>
                <div style={{fontSize:'13px', color:'#666'}}>Görsel yüklemek için tıkla</div>
              </div>
            )}
          </div>
          <input id="gorsel-input" type="file" accept="image/*" onChange={gorselSec} style={{display:'none'}}/>
        </div>

        {mesaj && <p style={{color: mesaj.includes('Hata') ? '#ff6b6b' : '#7F77DD', fontSize:'13px', marginBottom:'16px'}}>{mesaj}</p>}

        <button onClick={handleSubmit} disabled={yukleniyor}
          style={{width:'100%', padding:'14px', background:'#7F77DD', border:'none', borderRadius:'8px', color:'white', fontSize:'15px', fontWeight:'600', cursor:'pointer', opacity: yukleniyor ? 0.7 : 1}}>
          {yukleniyor ? 'Ekleniyor...' : 'Karakter ekle'}
        </button>
      </div>
    </main>
  )
}