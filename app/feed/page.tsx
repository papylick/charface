// @ts-nocheck
'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Feed() {
  const router = useRouter()
  const [kullanici, setKullanici] = useState(null)
  const [karakterler, setKarakterler] = useState([])
  const [begeniler, setBegeniler] = useState({})
  const [profiller, setProfiller] = useState({})
  const [yukleniyor, setYukleniyor] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/giris'); return }
      setKullanici(data.user)

      // Takip ettiklerini bul
      const { data: takipEdilenler } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', data.user.id)

      if (!takipEdilenler || takipEdilenler.length === 0) {
        setYukleniyor(false)
        return
      }

      const ids = takipEdilenler.map(t => t.following_id)

      // Onların karakterlerini çek
      const { data: chars } = await supabase
        .from('karakterler')
        .select('*, begeniler(count)')
        .in('kullanici_id', ids)
        .order('created_at', { ascending: false })

      if (chars) {
        setKarakterler(chars)

        // Profil adlarını çek
        const { data: profilData } = await supabase
          .from('profiller')
          .select('id, kullanici_adi')
          .in('id', ids)
        if (profilData) {
          const obj = {}
          profilData.forEach(p => obj[p.id] = p.kullanici_adi)
          setProfiller(obj)
        }
      }

      // Beğenileri çek
      const { data: begeniData } = await supabase
        .from('begeniler')
        .select('karakter_id')
        .eq('kullanici_id', data.user.id)
      if (begeniData) {
        const obj = {}
        begeniData.forEach(b => obj[b.karakter_id] = true)
        setBegeniler(obj)
      }

      setYukleniyor(false)
    })
  }, [])

  async function toggleBegeni(e, karakterId) {
    e.preventDefault()
    e.stopPropagation()
    if (!kullanici) return
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

  if (yukleniyor) return (
    <main style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{color:'#c9a96e', fontFamily:'Cinzel, serif', letterSpacing:'3px', fontSize:'13px'}}>YÜKLENİYOR...</div>
    </main>
  )

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)',
      color: 'white', fontFamily: 'Georgia, serif'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        .card-hover { transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease; }
        .card-hover:hover { transform: translateY(-8px); box-shadow: -4px 16px 40px rgba(0,0,0,0.6), 0 0 20px rgba(127,119,221,0.2); }
        .card-appear { animation: cardAppear 0.6s ease forwards; opacity: 0; }
        @keyframes cardAppear { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        .btn-primary { background: linear-gradient(135deg, #7F77DD, #9d77dd); border: none; color: white; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 0.5px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(127,119,221,0.3); }
        .btn-primary:hover { transform: translateY(-2px); }
        @media (max-width: 768px) {
          .nav-inner { padding: 12px 16px !important; }
          .karakter-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .main-padding { padding: 0 16px 40px !important; }
          .hero-padding { padding: 32px 16px 24px !important; }
        }
        @media (max-width: 480px) {
          .karakter-grid { grid-template-columns: repeat(1, 1fr) !important; }
        }
      `}</style>

      {/* Navbar */}
      <nav style={{borderBottom:'1px solid rgba(201,169,110,0.2)', background:'rgba(10,10,15,0.9)', backdropFilter:'blur(10px)', position:'sticky', top:0, zIndex:100, boxShadow:'0 4px 30px rgba(0,0,0,0.5)'}}>
        <div className="nav-inner" style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 48px'}}>
          <a href="/" style={{fontSize:'24px', fontFamily:'Cinzel, serif', fontWeight:'700', letterSpacing:'2px', textDecoration:'none', color:'white'}}>
            char<span style={{color:'#7F77DD'}}>faces</span>
          </a>
          <div style={{display:'flex', gap:'8px'}}>
            <button onClick={() => router.push('/')} style={{background:'transparent', border:'1px solid rgba(201,169,110,0.3)', color:'#c9a96e', padding:'8px 16px', borderRadius:'6px', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:'12px', letterSpacing:'1px'}}>
              Keşfet
            </button>
            <button onClick={() => router.push('/profil')} style={{background:'transparent', border:'1px solid rgba(201,169,110,0.3)', color:'#c9a96e', padding:'8px 16px', borderRadius:'6px', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:'12px', letterSpacing:'1px'}}>
              Profil
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero-padding" style={{textAlign:'center', padding:'48px 32px 32px'}}>
        <div style={{fontSize:'11px', letterSpacing:'4px', color:'#c9a96e', fontFamily:'Cinzel, serif', marginBottom:'12px', opacity:0.8}}>✦ &nbsp; TAKİP EDİLENLER &nbsp; ✦</div>
        <h1 style={{fontSize:'36px', fontWeight:'700', fontFamily:'Cinzel, serif', letterSpacing:'2px', marginBottom:'8px'}}>
          Akışım
        </h1>
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'16px', marginTop:'16px'}}>
          <div style={{width:'40px', height:'1px', background:'linear-gradient(to right, transparent, #c9a96e)'}}/>
          <span style={{color:'#c9a96e', fontSize:'12px'}}>✦</span>
          <div style={{width:'40px', height:'1px', background:'linear-gradient(to left, transparent, #c9a96e)'}}/>
        </div>
      </div>

      <div className="main-padding" style={{padding:'0 48px 60px', maxWidth:'1100px', margin:'0 auto'}}>
        {karakterler.length === 0 ? (
          <div style={{textAlign:'center', padding:'80px 32px'}}>
            <div style={{fontSize:'56px', marginBottom:'20px', opacity:0.3}}>📖</div>
            <div style={{fontSize:'18px', fontFamily:'Cinzel, serif', letterSpacing:'1px', color:'#555', marginBottom:'8px'}}>Akışın boş</div>
            <div style={{fontSize:'14px', color:'#444', fontFamily:'EB Garamond, serif', fontStyle:'italic', marginBottom:'24px'}}>
              Takip ettiğin kullanıcıların paylaşımları burada görünecek
            </div>
            <button className="btn-primary" onClick={() => router.push('/')}>Kullanıcı Keşfet</button>
          </div>
        ) : (
          <>
            <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'28px'}}>
              <div style={{width:'30px', height:'1px', background:'rgba(201,169,110,0.4)'}}/>
              <h2 style={{fontSize:'11px', fontWeight:'600', color:'#c9a96e', letterSpacing:'3px', fontFamily:'Cinzel, serif'}}>
                {karakterler.length} PAYLAŞIM
              </h2>
              <div style={{flex:1, height:'1px', background:'rgba(201,169,110,0.2)'}}/>
            </div>
            <div className="karakter-grid" style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'24px'}}>
              {karakterler.map((k, i) => (
                <div key={k.id} className="card-hover card-appear" onClick={() => router.push(`/karakter/${k.id}`)}
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
                      <button onClick={(e) => toggleBegeni(e, k.id)} style={{background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', color:begeniler[k.id]?'#D4537E':'#555', padding:'0', transition:'transform 0.2s ease'}}
                        onMouseEnter={e=>e.currentTarget.style.transform='scale(1.2)'}
                        onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                        <span style={{fontSize:'16px'}}>{begeniler[k.id]?'❤️':'🤍'}</span>
                        <span style={{fontSize:'13px'}}>{k.begeniler?.[0]?.count||0}</span>
                      </button>
                      <span onClick={(e) => { e.stopPropagation(); router.push(`/profil/${k.kullanici_id}`) }}
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
          </>
        )}
      </div>

      <footer style={{textAlign:'center', padding:'32px', borderTop:'1px solid rgba(201,169,110,0.1)', color:'#444', fontSize:'12px', fontFamily:'Cinzel, serif', letterSpacing:'2px'}}>
        <span style={{color:'#c9a96e', opacity:0.6}}>✦</span> &nbsp; CHARFACES &nbsp; <span style={{color:'#c9a96e', opacity:0.6}}>✦</span>
      </footer>
    </main>
  )
}