// @ts-nocheck
'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from './lib/supabase'
import BildirimZili from './components/BildirimZili'

const SAYFA_BOYUTU = 9

export default function Home() {
  const router = useRouter()
  const [kullanici, setKullanici] = useState(null)
  const [profilAdi, setProfilAdi] = useState('')
  const [karakterler, setKarakterler] = useState([])
  const [profiller, setProfiller] = useState({})
  const [arama, setArama] = useState('')
  const [begeniler, setBegeniler] = useState({})
  const [kitapAcik, setKitapAcik] = useState(false)
  const [icerikGoster, setIcerikGoster] = useState(false)
  const [sayfa, setSayfa] = useState(0)
  const [dahaVar, setDahaVar] = useState(true)
  const [yukleniyorDaha, setYukleniyorDaha] = useState(false)
  const gozlemciRef = useRef(null)
  const sonElemanRef = useRef(null)

  const navigate = useCallback((url: string) => {
    setIcerikGoster(false)
    setTimeout(() => router.push(url), 600)
  }, [router])

  async function karakterleriYukle(sayfaNo: number, aramaMetni: string = '') {
    if (sayfaNo === 0) setKarakterler([])
    setYukleniyorDaha(true)

    let query = supabase
      .from('karakterler')
      .select('*, begeniler(count)')
      .order('created_at', { ascending: false })
      .range(sayfaNo * SAYFA_BOYUTU, (sayfaNo + 1) * SAYFA_BOYUTU - 1)

    if (aramaMetni) {
      query = supabase
        .from('karakterler')
        .select('*, begeniler(count)')
        .or(`karakter_adi.ilike.%${aramaMetni}%,kitap_adi.ilike.%${aramaMetni}%`)
        .order('created_at', { ascending: false })
        .range(sayfaNo * SAYFA_BOYUTU, (sayfaNo + 1) * SAYFA_BOYUTU - 1)
    }

    const { data } = await query

    if (data) {
      if (sayfaNo === 0) {
        setKarakterler(data)
      } else {
        setKarakterler(prev => [...prev, ...data])
      }
      setDahaVar(data.length === SAYFA_BOYUTU)

      const ids = [...new Set(data.map(k => k.kullanici_id))]
      if (ids.length > 0) {
        const { data: profilData } = await supabase
          .from('profiller')
          .select('id, kullanici_adi')
          .in('id', ids)
        if (profilData) {
          const obj = {}
          profilData.forEach(p => obj[p.id] = p.kullanici_adi)
          setProfiller(prev => ({ ...prev, ...obj }))
        }
      }
    }
    setYukleniyorDaha(false)
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setKullanici(data.user)
      if (data.user) {
        const { data: profil } = await supabase
          .from('profiller')
          .select('kullanici_adi')
          .eq('id', data.user.id)
          .single()
        setProfilAdi(profil?.kullanici_adi || data.user.email?.split('@')[0])
      }
    })
    karakterleriYukle(0)
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setSayfa(0)
      karakterleriYukle(0, arama)
    }, 400)
    return () => clearTimeout(timer)
  }, [arama])

  useEffect(() => {
    if (gozlemciRef.current) gozlemciRef.current.disconnect()
    gozlemciRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && dahaVar && !yukleniyorDaha) {
        setSayfa(prev => {
          const yeniSayfa = prev + 1
          karakterleriYukle(yeniSayfa, arama)
          return yeniSayfa
        })
      }
    }, { threshold: 0.1 })
    if (sonElemanRef.current) {
      gozlemciRef.current.observe(sonElemanRef.current)
    }
    return () => gozlemciRef.current?.disconnect()
  }, [dahaVar, yukleniyorDaha, arama])

  async function cikisYap() {
    await supabase.auth.signOut()
    setKullanici(null)
    setProfilAdi('')
  }

  async function toggleBegeni(e, karakterId, karakterSahibiId) {
    e.preventDefault()
    e.stopPropagation()
    if (!kullanici) { navigate('/giris'); return }
    if (begeniler[karakterId]) {
      await supabase.from('begeniler').delete().eq('karakter_id', karakterId).eq('kullanici_id', kullanici.id)
      setBegeniler(prev => ({ ...prev, [karakterId]: false }))
      setKarakterler(prev => prev.map(k => k.id === karakterId ? { ...k, begeniler: [{ count: Math.max(0, (k.begeniler?.[0]?.count || 1) - 1) }] } : k))
    } else {
      await supabase.from('begeniler').insert({ karakter_id: karakterId, kullanici_id: kullanici.id })
      setBegeniler(prev => ({ ...prev, [karakterId]: true }))
      setKarakterler(prev => prev.map(k => k.id === karakterId ? { ...k, begeniler: [{ count: (k.begeniler?.[0]?.count || 0) + 1 }] } : k))
      if (karakterSahibiId !== kullanici.id) {
        fetch('/api/bildirim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kullanici_id: karakterSahibiId, gonderen_id: kullanici.id, tip: 'begeni', karakter_id: karakterId })
        })
      }
    }
  }

  function kitabiAc() {
    setKitapAcik(true)
    setTimeout(() => setIcerikGoster(true), 1200)
  }

  return (
    <main style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)', color:'white', fontFamily:'"Georgia", serif', overflow:icerikGoster?'auto':'hidden'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        .kitap-kaplagi { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; z-index:1000; background:linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%); transition:opacity 0.6s ease 0.9s; }
        .kitap-kaplagi.aciliyor { opacity:0; pointer-events:none; }
        .kitap-wrapper { perspective:2000px; cursor:pointer; }
        .kitap { width:min(600px, 85vw); height:min(700px, 80vh); position:relative; transform-style:preserve-3d; transition:transform 0.3s ease; }
        .kitap:hover { transform:rotateY(-5deg) rotateX(2deg); }
        .kitap.acik { transform:rotateY(-180deg) scale(0.8) !important; transition:transform 1s cubic-bezier(0.645, 0.045, 0.355, 1.000) !important; }
        .kitap-on { position:absolute; inset:0; border-radius:4px 16px 16px 4px; border:1px solid rgba(201,169,110,0.4); box-shadow:-12px 12px 60px rgba(0,0,0,0.9), 0 0 80px rgba(127,119,221,0.1); transform-origin:left center; backface-visibility:hidden; overflow:hidden; background:#0a0a12; }
        .kitap-sirt { position:absolute; left:-16px; top:0; bottom:0; width:16px; background:linear-gradient(to right, #050310, #1a0a2e); border-radius:4px 0 0 4px; border-left:1px solid rgba(201,169,110,0.2); box-shadow:-4px 0 10px rgba(0,0,0,0.5); }
        .kitap-arka { position:absolute; inset:0; background:linear-gradient(135deg, #120a1e, #1a0a2e); border-radius:4px 16px 16px 4px; border:1px solid rgba(201,169,110,0.2); }
        .kapak-overlay { position:absolute; inset:0; background:linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.85) 100%); z-index:2; }
        .kapak-cerceve { position:absolute; inset:12px; border:1px solid rgba(201,169,110,0.3); border-radius:2px 12px 12px 2px; z-index:3; pointer-events:none; }
        .kapak-icerik { position:absolute; inset:0; z-index:4; display:flex; flex-direction:column; justify-content:space-between; padding:28px 24px; }
        .grid-preview { display:grid; grid-template-columns:repeat(3, 1fr); gap:3px; position:absolute; inset:0; z-index:1; }
        .grid-preview img { width:100%; height:100%; object-fit:cover; filter:saturate(0.7) brightness(0.6); }
        .nav-inner { display:flex; align-items:center; justify-content:space-between; padding:20px 48px; }
        @media (max-width:768px) {
          .nav-inner { padding:12px 16px !important; }
          .nav-logo { font-size:20px !important; }
          .nav-btn { padding:8px 12px !important; font-size:11px !important; }
          .hero-title { font-size:28px !important; }
          .hero-subtitle { font-size:10px !important; letter-spacing:2px !important; }
          .karakter-grid { grid-template-columns:repeat(2, 1fr) !important; gap:12px !important; }
          .main-padding { padding:0 16px 40px !important; }
          .hero-padding { padding:40px 16px 24px !important; }
          .search-input-wrapper { max-width:100% !important; }
        }
        @media (max-width:480px) {
          .karakter-grid { grid-template-columns:repeat(1, 1fr) !important; }
          .hero-title { font-size:22px !important; }
        }
        .card-hover { transition:transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease; }
        .card-hover:hover { transform:translateY(-8px); box-shadow:-4px 16px 40px rgba(0,0,0,0.6), 0 0 20px rgba(127,119,221,0.2); }
        .card-appear { animation:cardAppear 0.6s ease forwards; opacity:0; }
        @keyframes cardAppear { 0%{opacity:0;transform:translateY(20px)} 100%{opacity:1;transform:translateY(0)} }
        .icerik { opacity:0; transform:translateY(20px); transition:opacity 0.6s ease, transform 0.6s ease; }
        .icerik.gorunen { opacity:1; transform:translateY(0); }
        .search-input:focus { outline:none; border-color:#c9a96e !important; box-shadow:0 0 20px rgba(201,169,110,0.15); }
        .btn-primary { background:linear-gradient(135deg, #7F77DD, #9d77dd); border:none; color:white; padding:10px 20px; border-radius:6px; cursor:pointer; font-family:'Cinzel',serif; font-size:13px; letter-spacing:0.5px; transition:all 0.3s ease; box-shadow:0 4px 15px rgba(127,119,221,0.3); }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(127,119,221,0.5); }
        .btn-secondary { background:transparent; border:1px solid #c9a96e; color:#c9a96e; padding:10px 20px; border-radius:6px; cursor:pointer; font-family:'Cinzel',serif; font-size:13px; letter-spacing:0.5px; transition:all 0.3s ease; }
        .btn-secondary:hover { background:rgba(201,169,110,0.1); transform:translateY(-2px); }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:#0a0a0f; }
        ::-webkit-scrollbar-thumb { background:#2a1a3e; border-radius:3px; }
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
      `}</style>

      {!icerikGoster && (
        <div className={`kitap-kaplagi ${kitapAcik ? 'aciliyor' : ''}`}>
          <div style={{position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden'}}>
            <div style={{position:'absolute', top:'10%', left:'10%', width:'400px', height:'400px', background:'radial-gradient(circle, rgba(127,119,221,0.06), transparent)', borderRadius:'50%'}}/>
            <div style={{position:'absolute', bottom:'10%', right:'10%', width:'300px', height:'300px', background:'radial-gradient(circle, rgba(201,169,110,0.05), transparent)', borderRadius:'50%'}}/>
          </div>
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'32px'}}>
            <div className="kitap-wrapper" onClick={kitabiAc}>
              <div className={`kitap ${kitapAcik ? 'acik' : ''}`}>
                <div className="kitap-arka"/>
                <div className="kitap-sirt"/>
                <div className="kitap-on">
                  {karakterler.length > 0 ? (
                    <div className="grid-preview">
                      {Array.from({length:9}).map((_, i) => {
                        const k = karakterler[i % karakterler.length]
                        return k?.gorsel_url ? (
                          <img key={i} src={k.gorsel_url} alt=""/>
                        ) : (
                          <div key={i} style={{background:'#1a1228', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px'}}>📖</div>
                        )
                      })}
                    </div>
                  ) : (
                    <div style={{position:'absolute', inset:0, background:'linear-gradient(135deg, #1a0a2e, #0a0a12)'}}/>
                  )}
                  <div className="kapak-overlay"/>
                  <div className="kapak-cerceve"/>
                  <div className="kapak-icerik">
                    <div style={{textAlign:'center'}}>
                      <div style={{fontSize:'10px', letterSpacing:'5px', color:'#c9a96e', fontFamily:'Cinzel, serif', marginBottom:'12px', opacity:0.9}}>✦ &nbsp; KİTAP ARŞİVİ &nbsp; ✦</div>
                      <div style={{width:'60%', height:'1px', background:'linear-gradient(to right, transparent, #c9a96e, transparent)', margin:'0 auto'}}/>
                    </div>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontSize:'clamp(28px, 6vw, 48px)', fontFamily:'Cinzel, serif', fontWeight:'700', color:'white', letterSpacing:'4px', textShadow:'0 0 40px rgba(127,119,221,0.8), 0 2px 4px rgba(0,0,0,0.9)', marginBottom:'8px'}}>
                        char<span style={{color:'#7F77DD'}}>faces</span>
                      </div>
                      <div style={{fontSize:'12px', letterSpacing:'3px', color:'#c9a96e', fontFamily:'EB Garamond, serif', fontStyle:'italic', opacity:0.8}}>Karakterleri Görselleştir</div>
                    </div>
                    <div style={{textAlign:'center'}}>
                      <div style={{width:'60%', height:'1px', background:'linear-gradient(to right, transparent, #c9a96e, transparent)', margin:'0 auto 12px'}}/>
                      <div style={{fontSize:'11px', letterSpacing:'3px', color:'#888', fontFamily:'Cinzel, serif'}}>TIKLA VE KEŞFET</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{textAlign:'center', color:'#555', fontSize:'13px', fontFamily:'EB Garamond, serif', fontStyle:'italic', animation:'pulse 2s ease infinite'}}>
              ↑ Kitabı aç
            </div>
          </div>
        </div>
      )}

      <div className={`icerik ${icerikGoster ? 'gorunen' : ''}`}>
        <nav style={{borderBottom:'1px solid rgba(201,169,110,0.2)', background:'rgba(10,10,15,0.9)', backdropFilter:'blur(10px)', position:'sticky', top:0, zIndex:100, boxShadow:'0 4px 30px rgba(0,0,0,0.5)'}}>
          <div className="nav-inner">
            <span className="nav-logo" style={{fontSize:'24px', fontFamily:'Cinzel, serif', fontWeight:'700', letterSpacing:'2px', cursor:'pointer'}} onClick={() => navigate('/')}>
              char<span style={{color:'#7F77DD'}}>faces</span>
            </span>
            <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
              {kullanici ? (
                <>
                  {/* 🔔 BİLDİRİM ZİLİ */}
                  <BildirimZili kullaniciId={kullanici.id} />
                  <button className="btn-primary nav-btn" onClick={() => navigate('/karakter-ekle')}>✦ Ekle</button>
                  <button className="btn-secondary nav-btn" onClick={() => navigate('/feed')}>Akış</button>
                  <button className="btn-secondary nav-btn" onClick={() => navigate('/profil')}>{profilAdi}</button>
                  <button onClick={cikisYap} style={{background:'transparent', border:'none', color:'#666', cursor:'pointer', fontSize:'12px', fontFamily:'Cinzel, serif'}}
                    onMouseEnter={e => e.target.style.color='#999'}
                    onMouseLeave={e => e.target.style.color='#666'}>Çıkış</button>
                </>
              ) : (
                <>
                  <button className="btn-secondary nav-btn" onClick={() => navigate('/giris')}>Giriş</button>
                  <button className="btn-primary nav-btn" onClick={() => navigate('/giris')}>Üye Ol</button>
                </>
              )}
            </div>
          </div>
        </nav>

        <div className="hero-padding" style={{textAlign:'center', padding:'60px 32px 32px', position:'relative', zIndex:1}}>
          <div className="hero-subtitle" style={{marginBottom:'16px', fontSize:'11px', letterSpacing:'4px', color:'#c9a96e', fontFamily:'Cinzel, serif', opacity:0.8}}>✦ &nbsp; HAYAL ET &nbsp; ✦ &nbsp; ÜRET &nbsp; ✦ &nbsp; PAYLAŞ &nbsp; ✦</div>
          <h1 className="hero-title" style={{fontSize:'52px', fontWeight:'700', marginBottom:'16px', lineHeight:'1.2', fontFamily:'Cinzel, serif', letterSpacing:'2px', textShadow:'0 0 60px rgba(127,119,221,0.3)'}}>
            Kitap Karakterlerini<br/>
            <span style={{background:'linear-gradient(135deg, #7F77DD, #c9a96e)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'}}>Görselleştir</span>
          </h1>
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'16px', marginBottom:'28px'}}>
            <div style={{width:'60px', height:'1px', background:'linear-gradient(to right, transparent, #c9a96e)'}}/>
            <span style={{color:'#c9a96e', fontSize:'14px'}}>✦</span>
            <div style={{width:'60px', height:'1px', background:'linear-gradient(to left, transparent, #c9a96e)'}}/>
          </div>
          <div className="search-input-wrapper" style={{position:'relative', maxWidth:'520px', margin:'0 auto'}}>
            <input type="text" placeholder="Karakter veya kitap ara..." value={arama} onChange={e => setArama(e.target.value)} className="search-input"
              style={{width:'100%', padding:'16px 24px 16px 50px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(201,169,110,0.3)', borderRadius:'8px', color:'white', fontSize:'15px', boxSizing:'border-box', fontFamily:'EB Garamond, serif', transition:'all 0.3s ease'}}/>
            <span style={{position:'absolute', left:'18px', top:'50%', transform:'translateY(-50%)', color:'#c9a96e', fontSize:'16px'}}>🔍</span>
          </div>
        </div>

        <div className="main-padding" style={{padding:'0 48px 60px', maxWidth:'1100px', margin:'0 auto', position:'relative', zIndex:1}}>
          <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'28px'}}>
            <div style={{width:'30px', height:'1px', background:'rgba(201,169,110,0.4)'}}/>
            <h2 style={{fontSize:'11px', fontWeight:'600', color:'#c9a96e', letterSpacing:'3px', fontFamily:'Cinzel, serif'}}>
              {karakterler.length > 0 ? `${karakterler.length} KARAKTER` : 'SONUÇ BULUNAMADI'}
            </h2>
            <div style={{flex:1, height:'1px', background:'rgba(201,169,110,0.2)'}}/>
          </div>
          <div className="karakter-grid" style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'24px'}}>
            {karakterler.map((k, i) => (
              <div key={k.id} className="card-hover card-appear" onClick={() => navigate(`/karakter/${k.id}`)}
                style={{animationDelay:`${i*0.08}s`, background:'linear-gradient(145deg, #12101a, #1a1228)', border:'1px solid rgba(201,169,110,0.15)', borderRadius:'12px', overflow:'hidden', cursor:'pointer', boxShadow:'0 8px 32px rgba(0,0,0,0.4)', position:'relative'}}>
                <div style={{position:'absolute', left:0, top:0, bottom:0, width:'4px', background:'linear-gradient(to bottom, #7F77DD, #c9a96e)', opacity:0.6}}/>
                <div style={{height:'220px', overflow:'hidden', position:'relative'}}>
                  {k.gorsel_url ? (
                    <img src={k.gorsel_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                  ) : (
                    <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'56px', background:'rgba(127,119,221,0.05)'}}>📖</div>
                  )}
                  <div style={{position:'absolute', bottom:0, left:0, right:0, height:'60px', background:'linear-gradient(to top, #12101a, transparent)'}}/>
                </div>
                <div style={{padding:'16px 18px 14px 22px'}}>
                  <div style={{fontWeight:'600', fontSize:'16px', fontFamily:'Cinzel, serif', letterSpacing:'0.5px', marginBottom:'4px'}}>{k.karakter_adi}</div>
                  <div style={{fontSize:'12px', color:'#c9a96e', marginBottom:'8px', fontFamily:'EB Garamond, serif', fontStyle:'italic'}}>{k.kitap_adi}</div>
                  {k.aciklama && <div style={{fontSize:'12px', color:'#666', lineHeight:'1.5', fontFamily:'EB Garamond, serif', marginBottom:'10px'}}>{k.aciklama.slice(0,70)}...</div>}
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'10px', borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                    <button onClick={(e) => toggleBegeni(e, k.id, k.kullanici_id)} style={{background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', color:begeniler[k.id]?'#D4537E':'#555', padding:'0', transition:'transform 0.2s ease'}}
                      onMouseEnter={e=>e.currentTarget.style.transform='scale(1.2)'}
                      onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                      <span style={{fontSize:'16px'}}>{begeniler[k.id]?'❤️':'🤍'}</span>
                      <span style={{fontSize:'13px'}}>{k.begeniler?.[0]?.count||0}</span>
                    </button>
                    <span onClick={(e) => { e.stopPropagation(); navigate(`/profil/${k.kullanici_id}`) }}
                      style={{fontSize:'11px', color:'#555', cursor:'pointer', fontFamily:'Cinzel, serif', letterSpacing:'0.5px', transition:'color 0.2s'}}
                      onMouseEnter={e=>e.target.style.color='#c9a96e'}
                      onMouseLeave={e=>e.target.style.color='#555'}>
                      {profiller[k.kullanici_id] || k.kullanici_email?.split('@')[0]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div ref={sonElemanRef} style={{height:'40px', display:'flex', alignItems:'center', justifyContent:'center', marginTop:'20px'}}>
            {yukleniyorDaha && (
              <div style={{color:'#c9a96e', fontFamily:'Cinzel, serif', fontSize:'12px', letterSpacing:'2px', display:'flex', alignItems:'center', gap:'8px'}}>
                <span style={{display:'inline-block', animation:'spin 1s linear infinite'}}>✦</span>
                YÜKLENİYOR
              </div>
            )}
            {!dahaVar && karakterler.length > 0 && (
              <div style={{color:'#333', fontFamily:'EB Garamond, serif', fontSize:'13px', fontStyle:'italic'}}>
                Tüm karakterler yüklendi
              </div>
            )}
          </div>
        </div>

        <footer style={{textAlign:'center', padding:'32px', borderTop:'1px solid rgba(201,169,110,0.1)', color:'#444', fontSize:'12px', fontFamily:'Cinzel, serif', letterSpacing:'2px'}}>
          <span style={{color:'#c9a96e', opacity:0.6}}>✦</span> &nbsp; CHARFACES &nbsp; <span style={{color:'#c9a96e', opacity:0.6}}>✦</span>
        </footer>
      </div>
    </main>
  )
}