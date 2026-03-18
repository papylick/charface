// @ts-nocheck
'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import BildirimZili from '../components/BildirimZili'

export default function KullaniciAra() {
  const router = useRouter()
  const [kullanici, setKullanici] = useState(null)
  const [arama, setArama] = useState('')
  const [sonuclar, setSonuclar] = useState([])
  const [yukleniyor, setYukleniyor] = useState(false)
  const [aramaDone, setAramaDone] = useState(false)
  const aramaTimer = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setKullanici(data.user))
  }, [])

  useEffect(() => {
    if (aramaTimer.current) clearTimeout(aramaTimer.current)
    if (arama.length < 2) { setSonuclar([]); setAramaDone(false); return }

    aramaTimer.current = setTimeout(async () => {
      setYukleniyor(true)
      const { data } = await supabase
        .from('profiller')
        .select('id, kullanici_adi, email')
        .ilike('kullanici_adi', `%${arama}%`)
        .limit(20)
      if (data) setSonuclar(data)
      setAramaDone(true)
      setYukleniyor(false)
    }, 400)
  }, [arama])

  return (
    <main style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)', color:'white', fontFamily:'Georgia, serif'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        .kullanici-kart { background:linear-gradient(145deg,#12101a,#1a1228); border:1px solid rgba(201,169,110,0.15); border-radius:12px; padding:20px 24px; cursor:pointer; transition:all 0.3s ease; position:relative; overflow:hidden; display:flex; align-items:center; gap:16px; }
        .kullanici-kart:hover { border-color:rgba(201,169,110,0.35); transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,0.4); }
        .kullanici-kart::before { content:''; position:absolute; left:0; top:0; bottom:0; width:4px; background:linear-gradient(to bottom, #7F77DD, #c9a96e); opacity:0.6; }
        .search-input { width:100%; padding:16px 24px 16px 50px; background:rgba(255,255,255,0.03); border:1px solid rgba(201,169,110,0.3); border-radius:8px; color:white; font-size:15px; box-sizing:border-box; font-family:'EB Garamond',serif; transition:all 0.3s ease; }
        .search-input:focus { outline:none; border-color:#c9a96e; box-shadow:0 0 20px rgba(201,169,110,0.15); }
        .search-input::placeholder { color:#555; }
      `}</style>

      <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 48px', borderBottom:'1px solid rgba(201,169,110,0.2)', background:'rgba(10,10,15,0.9)', backdropFilter:'blur(10px)', position:'sticky', top:0, zIndex:100, boxShadow:'0 4px 30px rgba(0,0,0,0.5)'}}>
        <a href="/" style={{fontSize:'24px', fontFamily:'Cinzel, serif', fontWeight:'700', letterSpacing:'2px', textDecoration:'none', color:'white'}}>
          char<span style={{color:'#7F77DD'}}>faces</span>
        </a>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          {kullanici && <BildirimZili kullaniciId={kullanici.id} />}
          <button onClick={() => router.push('/')} style={{background:'transparent', border:'1px solid rgba(201,169,110,0.4)', color:'#c9a96e', padding:'10px 20px', borderRadius:'6px', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:'13px'}}>
            ← Ana Sayfa
          </button>
        </div>
      </nav>

      <div style={{maxWidth:'680px', margin:'0 auto', padding:'48px 32px'}}>
        <div style={{textAlign:'center', marginBottom:'40px'}}>
          <div style={{fontSize:'11px', letterSpacing:'4px', color:'#c9a96e', fontFamily:'Cinzel, serif', marginBottom:'12px', opacity:0.8}}>✦ &nbsp; KULLANICI ARA &nbsp; ✦</div>
          <h1 style={{fontSize:'36px', fontWeight:'700', fontFamily:'Cinzel, serif', letterSpacing:'2px', marginBottom:'8px'}}>
            👤 Kullanıcı Bul
          </h1>
        </div>

        <div style={{position:'relative', marginBottom:'32px'}}>
          <input
            type="text"
            placeholder="Kullanıcı adı ara..."
            value={arama}
            onChange={e => setArama(e.target.value)}
            className="search-input"
            autoFocus
          />
          <span style={{position:'absolute', left:'18px', top:'50%', transform:'translateY(-50%)', color:'#c9a96e', fontSize:'16px'}}>🔍</span>
          {yukleniyor && (
            <span style={{position:'absolute', right:'18px', top:'50%', transform:'translateY(-50%)', color:'#c9a96e', fontSize:'14px'}}>⏳</span>
          )}
        </div>

        {sonuclar.length > 0 ? (
          <div style={{display:'grid', gap:'12px'}}>
            {sonuclar.map(u => (
              <div key={u.id} className="kullanici-kart" onClick={() => router.push(`/profil/${u.id}`)}>
                <div style={{width:'48px', height:'48px', borderRadius:'50%', background:'linear-gradient(135deg, #7F77DD, #c9a96e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:'700', fontFamily:'Cinzel, serif', flexShrink:0}}>
                  {(u.kullanici_adi || '?')[0].toUpperCase()}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'16px', fontFamily:'Cinzel, serif', fontWeight:'600', letterSpacing:'0.5px', marginBottom:'4px'}}>
                    {u.kullanici_adi || 'İsimsiz'}
                  </div>
                  {u.email && (
                    <div style={{fontSize:'12px', color:'#555', fontFamily:'EB Garamond, serif', fontStyle:'italic'}}>
                      {u.email.split('@')[0]}
                    </div>
                  )}
                </div>
                <span style={{color:'#555', fontSize:'16px'}}>→</span>
              </div>
            ))}
          </div>
        ) : aramaDone && arama.length >= 2 ? (
          <div style={{textAlign:'center', padding:'60px', color:'#444', fontFamily:'EB Garamond, serif', fontStyle:'italic', fontSize:'15px'}}>
            "{arama}" için kullanıcı bulunamadı
          </div>
        ) : arama.length === 0 ? (
          <div style={{textAlign:'center', padding:'60px'}}>
            <div style={{fontSize:'48px', marginBottom:'16px', opacity:0.3}}>👥</div>
            <div style={{color:'#444', fontFamily:'EB Garamond, serif', fontStyle:'italic', fontSize:'15px'}}>
              Kullanıcı adı yazarak ara
            </div>
          </div>
        ) : null}
      </div>

      <footer style={{textAlign:'center', padding:'32px', borderTop:'1px solid rgba(201,169,110,0.1)', color:'#444', fontSize:'12px', fontFamily:'Cinzel, serif', letterSpacing:'2px'}}>
        <span style={{color:'#c9a96e', opacity:0.6}}>✦</span> &nbsp; CHARFACES &nbsp; <span style={{color:'#c9a96e', opacity:0.6}}>✦</span>
      </footer>
    </main>
  )
}