// @ts-nocheck
'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const HAZIR_ETIKETLER = [
  '#fantastik', '#distopya', '#romantik', '#macera', '#gizem',
  '#korku', '#bilimkurgu', '#tarih', '#dram', '#komedi',
  '#gerilim', '#polisiye', '#mitoloji', '#gotik', '#aşk'
]

export default function KarakterEkle() {
  const router = useRouter()
  const [kitap, setKitap] = useState('')
  const [kitapOnerileri, setKitapOnerileri] = useState([])
  const [kitapMenuAcik, setKitapMenuAcik] = useState(false)
  const [kitapAraniyor, setKitapAraniyor] = useState(false)
  const [karakter, setKarakter] = useState('')
  const [aciklama, setAciklama] = useState('')
  const [etiketler, setEtiketler] = useState([])
  const [etiketInput, setEtiketInput] = useState('')
  const [gorsel, setGorsel] = useState(null)
  const [onizleme, setOnizleme] = useState(null)
  const [aiGorselUrl, setAiGorselUrl] = useState(null)
  const [aiUretiyor, setAiUretiyor] = useState(false)
  const [yukleniyor, setYukleniyor] = useState(false)
  const [mesaj, setMesaj] = useState('')
  const kitapRef = useRef(null)
  const aramaTimer = useRef(null)

  useEffect(() => {
    function disariTikla(e) {
      if (kitapRef.current && !kitapRef.current.contains(e.target)) {
        setKitapMenuAcik(false)
      }
    }
    document.addEventListener('mousedown', disariTikla)
    return () => document.removeEventListener('mousedown', disariTikla)
  }, [])

  async function kitapAra(deger) {
    setKitap(deger)
    if (aramaTimer.current) clearTimeout(aramaTimer.current)
    if (deger.length < 2) { setKitapOnerileri([]); setKitapMenuAcik(false); return }

    aramaTimer.current = setTimeout(async () => {
      setKitapAraniyor(true)
      try {
        const [olRes, gbRes] = await Promise.all([
          fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(deger)}&limit=4`),
          fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(deger)}&maxResults=4&langRestrict=tr`)
        ])
        const olData = await olRes.json()
        const gbData = await gbRes.json()

        const olKitaplar = (olData.docs || []).filter(item => item.title).map(item => ({
          baslik: item.title, yazar: item.author_name?.[0] || '',
          kapak: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-S.jpg` : null
        }))
        const gbKitaplar = (gbData.items || []).filter(item => item.volumeInfo?.title).map(item => ({
          baslik: item.volumeInfo.title, yazar: item.volumeInfo.authors?.[0] || '',
          kapak: item.volumeInfo.imageLinks?.thumbnail || null
        }))

        const hepsi = [...gbKitaplar, ...olKitaplar]
        const benzersiz = hepsi.filter((k, i, arr) =>
          arr.findIndex(x => x.baslik.toLowerCase() === k.baslik.toLowerCase()) === i
        ).slice(0, 6)

        setKitapOnerileri(benzersiz)
        setKitapMenuAcik(benzersiz.length > 0)
      } catch (e) {
        setKitapOnerileri([])
      }
      setKitapAraniyor(false)
    }, 400)
  }

  function kitapSec(baslik) {
    setKitap(baslik)
    setKitapMenuAcik(false)
    setKitapOnerileri([])
  }

  function etiketEkle(etiket) {
    const temiz = etiket.startsWith('#') ? etiket : `#${etiket}`
    if (etiketler.includes(temiz) || etiketler.length >= 5) return
    setEtiketler(prev => [...prev, temiz])
    setEtiketInput('')
  }

  function etiketSil(etiket) {
    setEtiketler(prev => prev.filter(e => e !== etiket))
  }

  function etiketInputKeyDown(e) {
    if (e.key === 'Enter' && etiketInput.trim()) {
      e.preventDefault()
      etiketEkle(etiketInput.trim())
    }
  }

  function gorselSec(e) {
    const file = e.target.files[0]
    if (file) {
      setGorsel(file)
      setOnizleme(URL.createObjectURL(file))
      setAiGorselUrl(null)
    }
  }

  async function aiGorselUret() {
    if (!aciklama && !karakter) { setMesaj('Önce karakteri tarif et!'); return }
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

    const { data: yeniKarakter, error } = await supabase.from('karakterler').insert({
      kitap_adi: kitap, karakter_adi: karakter, aciklama,
      gorsel_url, kullanici_id: user.id, kullanici_email: user.email,
    }).select().single()

    if (error) { setMesaj('Hata: ' + error.message); setYukleniyor(false); return }

    // Etiketleri kaydet
    if (etiketler.length > 0 && yeniKarakter) {
      await supabase.from('etiketler').insert(
        etiketler.map(e => ({ karakter_id: yeniKarakter.id, etiket: e }))
      )
    }

    setMesaj('Karakter eklendi!')
    setTimeout(() => router.push('/'), 1000)
    setYukleniyor(false)
  }

  return (
    <main style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)', color:'white', fontFamily:'Georgia, serif'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        .input-field { width:100%; padding:14px 16px; background:rgba(255,255,255,0.03); border:1px solid rgba(201,169,110,0.2); border-radius:8px; color:white; font-size:14px; box-sizing:border-box; font-family:'EB Garamond',serif; transition:all 0.3s ease; }
        .input-field:focus { outline:none; border-color:rgba(201,169,110,0.6); box-shadow:0 0 20px rgba(201,169,110,0.1); background:rgba(255,255,255,0.05); }
        .input-field::placeholder { color:#555; }
        .label { font-size:11px; color:#c9a96e; display:block; margin-bottom:8px; font-family:'Cinzel',serif; letter-spacing:2px; }
        .btn-ai { width:100%; padding:14px; background:linear-gradient(135deg, rgba(127,119,221,0.3), rgba(201,169,110,0.2)); border:1px solid rgba(201,169,110,0.4); border-radius:8px; color:#c9a96e; font-size:14px; font-weight:600; cursor:pointer; font-family:'Cinzel',serif; letter-spacing:1px; transition:all 0.3s ease; }
        .btn-ai:hover:not(:disabled) { background:linear-gradient(135deg, rgba(127,119,221,0.5), rgba(201,169,110,0.3)); box-shadow:0 0 20px rgba(201,169,110,0.2); transform:translateY(-1px); }
        .btn-ai:disabled { opacity:0.6; cursor:not-allowed; }
        .btn-submit { width:100%; padding:16px; background:linear-gradient(135deg, #7F77DD, #9d77dd); border:none; border-radius:8px; color:white; font-size:14px; font-weight:600; cursor:pointer; font-family:'Cinzel',serif; letter-spacing:2px; transition:all 0.3s ease; box-shadow:0 4px 20px rgba(127,119,221,0.3); }
        .btn-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 30px rgba(127,119,221,0.5); }
        .btn-submit:disabled { opacity:0.6; cursor:not-allowed; }
        .upload-area { border:1px dashed rgba(201,169,110,0.3); border-radius:8px; padding:32px 20px; text-align:center; cursor:pointer; transition:all 0.3s ease; background:rgba(255,255,255,0.02); }
        .upload-area:hover { border-color:rgba(201,169,110,0.6); background:rgba(201,169,110,0.05); }
        .kitap-oneri { display:flex; align-items:center; gap:12px; padding:10px 14px; cursor:pointer; transition:background 0.2s; border-bottom:1px solid rgba(255,255,255,0.04); }
        .kitap-oneri:hover { background:rgba(201,169,110,0.08); }
        .kitap-oneri:last-child { border-bottom:none; }
        .etiket-chip { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; background:rgba(127,119,221,0.15); border:1px solid rgba(127,119,221,0.3); border-radius:20px; font-size:12px; color:#9d8fff; font-family:'Cinzel',serif; cursor:pointer; transition:all 0.2s; }
        .etiket-chip:hover { background:rgba(127,119,221,0.25); }
        .etiket-hazir { display:inline-flex; padding:5px 10px; background:rgba(255,255,255,0.03); border:1px solid rgba(201,169,110,0.15); border-radius:20px; font-size:11px; color:#888; font-family:'EB Garamond',serif; cursor:pointer; transition:all 0.2s; margin:3px; }
        .etiket-hazir:hover { background:rgba(201,169,110,0.08); color:#c9a96e; border-color:rgba(201,169,110,0.3); }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        .spinning { animation:spin 1s linear infinite; display:inline-block; }
      `}</style>

      <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 48px', borderBottom:'1px solid rgba(201,169,110,0.2)', background:'rgba(10,10,15,0.9)', backdropFilter:'blur(10px)', position:'sticky', top:0, zIndex:100}}>
        <a href="/" style={{fontSize:'24px', fontFamily:'Cinzel, serif', fontWeight:'700', letterSpacing:'2px', textDecoration:'none', color:'white'}}>
          char<span style={{color:'#7F77DD'}}>faces</span>
        </a>
      </nav>

      <div style={{maxWidth:'580px', margin:'0 auto', padding:'60px 32px'}}>
        <div style={{textAlign:'center', marginBottom:'48px'}}>
          <div style={{fontSize:'11px', letterSpacing:'4px', color:'#c9a96e', fontFamily:'Cinzel, serif', marginBottom:'16px', opacity:0.8}}>✦ &nbsp; YENİ KARAKTER &nbsp; ✦</div>
          <h1 style={{fontSize:'36px', fontWeight:'700', fontFamily:'Cinzel, serif', letterSpacing:'2px', marginBottom:'12px', textShadow:'0 0 40px rgba(127,119,221,0.3)'}}>Karakter Ekle</h1>
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'12px'}}>
            <div style={{width:'40px', height:'1px', background:'linear-gradient(to right, transparent, #c9a96e)'}}/>
            <span style={{color:'#c9a96e', fontSize:'12px'}}>✦</span>
            <div style={{width:'40px', height:'1px', background:'linear-gradient(to left, transparent, #c9a96e)'}}/>
          </div>
        </div>

        <div style={{background:'linear-gradient(145deg, #12101a, #1a1228)', border:'1px solid rgba(201,169,110,0.15)', borderRadius:'16px', padding:'40px', boxShadow:'0 20px 60px rgba(0,0,0,0.5)', position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute', left:0, top:0, bottom:0, width:'4px', background:'linear-gradient(to bottom, #7F77DD, #c9a96e)', opacity:0.6}}/>

          {/* KİTAP */}
          <div style={{marginBottom:'24px'}} ref={kitapRef}>
            <label className="label">KİTAP ADI *</label>
            <div style={{position:'relative'}}>
              <input type="text" placeholder="Kitap adı yaz, öneriler çıksın..." value={kitap} onChange={e => kitapAra(e.target.value)} className="input-field" autoComplete="off"/>
              {kitapAraniyor && (
                <div style={{position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', color:'#c9a96e', fontSize:'14px'}}>
                  <span className="spinning">✦</span>
                </div>
              )}
              {kitapMenuAcik && kitapOnerileri.length > 0 && (
                <div style={{position:'absolute', top:'100%', left:0, right:0, background:'linear-gradient(145deg, #12101a, #1a1228)', border:'1px solid rgba(201,169,110,0.2)', borderRadius:'10px', marginTop:'6px', zIndex:9999, boxShadow:'0 10px 40px rgba(0,0,0,0.6)', overflow:'hidden'}}>
                  {kitapOnerileri.map((k, i) => (
                    <div key={i} className="kitap-oneri" onClick={() => kitapSec(k.baslik)}>
                      {k.kapak ? (
                        <>
                          <img src={k.kapak} style={{width:'32px', height:'44px', objectFit:'cover', borderRadius:'3px', flexShrink:0}}
                            onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex' }}/>
                          <div style={{width:'32px', height:'44px', background:'rgba(127,119,221,0.2)', borderRadius:'3px', display:'none', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0}}>📖</div>
                        </>
                      ) : (
                        <div style={{width:'32px', height:'44px', background:'rgba(127,119,221,0.2)', borderRadius:'3px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0}}>📖</div>
                      )}
                      <div>
                        <div style={{fontSize:'13px', color:'white', fontFamily:'EB Garamond, serif', fontWeight:'600'}}>{k.baslik}</div>
                        {k.yazar && <div style={{fontSize:'11px', color:'#888', fontFamily:'EB Garamond, serif', fontStyle:'italic'}}>{k.yazar}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* KARAKTER */}
          <div style={{marginBottom:'24px'}}>
            <label className="label">KARAKTER ADI *</label>
            <input type="text" placeholder="örn. Gandalf" value={karakter} onChange={e => setKarakter(e.target.value)} className="input-field"/>
          </div>

          {/* AÇIKLAMA */}
          <div style={{marginBottom:'24px'}}>
            <label className="label">KARAKTERİ TARİF ET</label>
            <textarea placeholder="örn. Uzun beyaz saçlı, gri gözlü, güçlü bir büyücü..." value={aciklama} onChange={e => setAciklama(e.target.value)} className="input-field" style={{minHeight:'120px', resize:'vertical', fontFamily:'EB Garamond, serif', lineHeight:'1.6'}}/>
          </div>

          {/* ETİKETLER */}
          <div style={{marginBottom:'24px'}}>
            <label className="label">ETİKETLER <span style={{color:'#555', fontSize:'10px'}}>(max 5)</span></label>

            {/* Seçilen etiketler */}
            {etiketler.length > 0 && (
              <div style={{display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'12px'}}>
                {etiketler.map(e => (
                  <span key={e} className="etiket-chip" onClick={() => etiketSil(e)}>
                    {e} <span style={{fontSize:'10px', opacity:0.7}}>✕</span>
                  </span>
                ))}
              </div>
            )}

            {/* Etiket input */}
            {etiketler.length < 5 && (
              <input
                type="text"
                placeholder="#fantastik gibi yaz, Enter'a bas..."
                value={etiketInput}
                onChange={e => setEtiketInput(e.target.value)}
                onKeyDown={etiketInputKeyDown}
                className="input-field"
                style={{marginBottom:'10px'}}
              />
            )}

            {/* Hazır etiketler */}
            <div style={{display:'flex', flexWrap:'wrap', gap:'4px'}}>
              {HAZIR_ETIKETLER.filter(e => !etiketler.includes(e)).slice(0, 10).map(e => (
                <span key={e} className="etiket-hazir" onClick={() => etiketEkle(e)}>{e}</span>
              ))}
            </div>
          </div>

          {/* AI GÖRSEL */}
          <div style={{marginBottom:'24px'}}>
            <button onClick={aiGorselUret} disabled={aiUretiyor} className="btn-ai">
              {aiUretiyor ? <span><span className="spinning">✦</span> &nbsp; Görsel üretiliyor... (30-60 sn)</span> : '✦ AI ile Görsel Üret'}
            </button>
          </div>

          {onizleme && (
            <div style={{marginBottom:'24px'}}>
              <label className="label">ÖNİZLEME</label>
              <div style={{position:'relative', borderRadius:'12px', overflow:'hidden', border:'1px solid rgba(201,169,110,0.2)'}}>
                <img src={onizleme} style={{width:'100%', maxHeight:'320px', objectFit:'cover', display:'block'}}/>
                <div style={{position:'absolute', bottom:0, left:0, right:0, height:'60px', background:'linear-gradient(to top, #12101a, transparent)'}}/>
              </div>
              {aiGorselUrl && (
                <button onClick={aiGorselUret} disabled={aiUretiyor} style={{width:'100%', marginTop:'10px', padding:'10px', background:'transparent', border:'1px solid rgba(127,119,221,0.4)', borderRadius:'8px', color:'#7F77DD', cursor:'pointer', fontSize:'13px', fontFamily:'Cinzel, serif', letterSpacing:'1px', transition:'all 0.3s ease'}}>
                  🔄 Tekrar Üret
                </button>
              )}
            </div>
          )}

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
            <p style={{color:mesaj.includes('Hata')||mesaj.includes('üretilemedi')?'#ff6b6b':'#c9a96e', fontSize:'13px', marginBottom:'16px', fontFamily:'EB Garamond, serif', fontStyle:'italic', textAlign:'center'}}>{mesaj}</p>
          )}

          <button onClick={handleSubmit} disabled={yukleniyor} className="btn-submit">
            {yukleniyor ? 'EKLENİYOR...' : 'KARAKTERİ PAYLAŞ'}
          </button>
        </div>
      </div>
    </main>
  )
}