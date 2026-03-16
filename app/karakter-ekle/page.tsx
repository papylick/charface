// @ts-nocheck
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function KarakterEkle() {
  const router = useRouter()
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
    if (!kitap || !karakter) { setMesaj('Kitap ve karakter adı zorunlu!'); return }
    if (!gorsel && !aiGorselUrl) { setMesaj('Bir görsel ekle veya AI ile üret!'); return }
    setYukleniyor(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setMesaj('Önce giriş yapmalısın!'); setYukleniyor(false); return }

    let gorsel_url = aiGorselUrl || null
    if (gorsel && !aiGorselUrl) {
      const dosyaAdi = `${user.id}-${Date.now()}-${gorsel.name}`
      const { error: uploadError } = await supabase.storage.from('gorseller').upload(dosyaAdi, gorsel)
      if (!uploadError) {
        const { data } = supabase.storage.from('gorseller').getPublicUrl(dosyaAdi)
        gorsel_url = data.publicUrl
      }
    }

    const { error } = await supabase.from('karakterler').insert({
      kitap_adi: kitap, karakter_adi: karakter, aciklama,
      gorsel_url, kullanici_id: user.id, kullanici_email: user.email,
    })

    if (error) setMesaj('Hata: ' + error.message)
    else {
      setMesaj('Karakter eklendi!')
      setTimeout(() => router.push('/'), 1000)
    }
    setYukleniyor(false)
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)',
      color: 'white',
      fontFamily: 'Georgia, serif'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        .input-field {
          width: 100%; padding: 14px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(201,169,110,0.2);
          border-radius: 8px; color: white;
          font-size: 14px; box-sizing: border-box;
          font-family: 'EB Garamond', serif;
          transition: all 0.3s ease;
        }
        .input-field:focus {
          outline: none;
          border-color: rgba(201,169,110,0.6);
          box-shadow: 0 0 20px rgba(201,169,110,0.1);
          background: rgba(255,255,255,0.05);
        }
        .input-field::placeholder { color: #555; }
        .label { font-size: 11px; color: #c9a96e; display: block; margin-bottom: 8px; font-family: 'Cinzel', serif; letter-spacing: 2px; }
        .btn-ai {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, rgba(127,119,221,0.3), rgba(201,169,110,0.2));
          border: 1px solid rgba(201,169,110,0.4);
          border-radius: 8px; color: #c9a96e;
          font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: 'Cinzel', serif; letter-spacing: 1px;
          transition: all 0.3s ease;
        }
        .btn-ai:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(127,119,221,0.5), rgba(201,169,110,0.3));
          box-shadow: 0 0 20px rgba(201,169,110,0.2);
          transform: translateY(-1px);
        }
        .btn-ai:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-submit {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #7F77DD, #9d77dd);
          border: none; border-radius: 8px; color: white;
          font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: 'Cinzel', serif; letter-spacing: 2px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(127,119,221,0.3);
        }
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(127,119,221,0.5);
        }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .upload-area {
          border: 1px dashed rgba(201,169,110,0.3);
          border-radius: 8px; padding: 32px 20px;
          text-align: center; cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255,255,255,0.02);
        }
        .upload-area:hover {
          border-color: rgba(201,169,110,0.6);
          background: rgba(201,169,110,0.05);
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinning { animation: spin 1s linear infinite; display: inline-block; }
      `}</style>

      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px', borderBottom: '1px solid rgba(201,169,110,0.2)',
        background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(10px)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <a href="/" style={{fontSize:'24px', fontFamily:'Cinzel, serif', fontWeight:'700', letterSpacing:'2px', textDecoration:'none', color:'white'}}>
          char<span style={{color:'#7F77DD'}}>faces</span>
        </a>
      </nav>

      <div style={{maxWidth:'580px', margin:'0 auto', padding:'60px 32px'}}>
        
        {/* Başlık */}
        <div style={{textAlign:'center', marginBottom:'48px'}}>
          <div style={{fontSize:'11px', letterSpacing:'4px', color:'#c9a96e', fontFamily:'Cinzel, serif', marginBottom:'16px', opacity:0.8}}>
            ✦ &nbsp; YENİ KARAKTER &nbsp; ✦
          </div>
          <h1 style={{fontSize:'36px', fontWeight:'700', fontFamily:'Cinzel, serif', letterSpacing:'2px', marginBottom:'12px', textShadow:'0 0 40px rgba(127,119,221,0.3)'}}>
            Karakter Ekle
          </h1>
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'12px'}}>
            <div style={{width:'40px', height:'1px', background:'linear-gradient(to right, transparent, #c9a96e)'}}/>
            <span style={{color:'#c9a96e', fontSize:'12px'}}>✦</span>
            <div style={{width:'40px', height:'1px', background:'linear-gradient(to left, transparent, #c9a96e)'}}/>
          </div>
        </div>

        {/* Form kartı */}
        <div style={{
          background: 'linear-gradient(145deg, #12101a, #1a1228)',
          border: '1px solid rgba(201,169,110,0.15)',
          borderRadius: '16px', padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Sol kitap sırt çizgisi */}
          <div style={{position:'absolute', left:0, top:0, bottom:0, width:'4px', background:'linear-gradient(to bottom, #7F77DD, #c9a96e)', opacity:0.6}}/>

          <div style={{marginBottom:'24px'}}>
            <label className="label">KİTAP ADI *</label>
            <input type="text" placeholder="örn. Yüzüklerin Efendisi" value={kitap} onChange={e => setKitap(e.target.value)} className="input-field"/>
          </div>

          <div style={{marginBottom:'24px'}}>
            <label className="label">KARAKTER ADI *</label>
            <input type="text" placeholder="örn. Gandalf" value={karakter} onChange={e => setKarakter(e.target.value)} className="input-field"/>
          </div>

          <div style={{marginBottom:'24px'}}>
            <label className="label">KARAKTERİ TARİF ET</label>
            <textarea
              placeholder="örn. Uzun beyaz saçlı, gri gözlü, güçlü bir büyücü. Gri bir pelerin giyer, elinde uzun bir asa taşır..."
              value={aciklama} onChange={e => setAciklama(e.target.value)}
              className="input-field"
              style={{minHeight:'120px', resize:'vertical', fontFamily:'EB Garamond, serif', lineHeight:'1.6'}}
            />
          </div>

          {/* AI Görsel Üret */}
          <div style={{marginBottom:'24px'}}>
            <button onClick={aiGorselUret} disabled={aiUretiyor} className="btn-ai">
              {aiUretiyor ? (
                <span><span className="spinning">✦</span> &nbsp; Görsel üretiliyor... (30-60 sn)</span>
              ) : (
                '✦ AI ile Görsel Üret'
              )}
            </button>
          </div>

          {/* Önizleme */}
          {onizleme && (
            <div style={{marginBottom:'24px'}}>
              <label className="label">ÖNİZLEME</label>
              <div style={{position:'relative', borderRadius:'12px', overflow:'hidden', border:'1px solid rgba(201,169,110,0.2)'}}>
                <img src={onizleme} style={{width:'100%', maxHeight:'320px', objectFit:'cover', display:'block'}}/>
                <div style={{position:'absolute', bottom:0, left:0, right:0, height:'60px', background:'linear-gradient(to top, #12101a, transparent)'}}/>
              </div>
              {aiGorselUrl && (
                <button onClick={aiGorselUret} disabled={aiUretiyor}
                  style={{width:'100%', marginTop:'10px', padding:'10px', background:'transparent', border:'1px solid rgba(127,119,221,0.4)', borderRadius:'8px', color:'#7F77DD', cursor:'pointer', fontSize:'13px', fontFamily:'Cinzel, serif', letterSpacing:'1px', transition:'all 0.3s ease'}}
                  onMouseEnter={e => e.target.style.background='rgba(127,119,221,0.1)'}
                  onMouseLeave={e => e.target.style.background='transparent'}>
                  🔄 Tekrar Üret
                </button>
              )}
            </div>
          )}

          {/* Manuel yükleme */}
          <div style={{marginBottom:'32px'}}>
            <label className="label">YA DA KENDİN YÜKLE</label>
            <div className="upload-area" onClick={() => document.getElementById('gorsel-input').click()}>
              {!onizleme ? (
                <>
                  <div style={{fontSize:'32px', marginBottom:'8px', opacity:0.5}}>📖</div>
                  <div style={{fontSize:'13px', color:'#666', fontFamily:'EB Garamond, serif', fontStyle:'italic'}}>Görsel yüklemek için tıkla</div>
                </>
              ) : !aiGorselUrl ? (
                <img src={onizleme} style={{width:'100%', maxHeight:'250px', objectFit:'cover', borderRadius:'8px'}}/>
              ) : (
                <div style={{fontSize:'13px', color:'#555', fontFamily:'EB Garamond, serif', fontStyle:'italic'}}>Farklı bir görsel yüklemek için tıkla</div>
              )}
            </div>
            <input id="gorsel-input" type="file" accept="image/*" onChange={gorselSec} style={{display:'none'}}/>
          </div>

          {mesaj && (
            <p style={{
              color: mesaj.includes('Hata') || mesaj.includes('üretilemedi') ? '#ff6b6b' : '#c9a96e',
              fontSize:'13px', marginBottom:'16px', fontFamily:'EB Garamond, serif',
              fontStyle:'italic', textAlign:'center'
            }}>{mesaj}</p>
          )}

          <button onClick={handleSubmit} disabled={yukleniyor} className="btn-submit">
            {yukleniyor ? 'EKLENİYOR...' : 'KARAKTERİ PAYLAŞ'}
          </button>
        </div>
      </div>
    </main>
  )
}