// @ts-nocheck
'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Profil() {
  const router = useRouter()
  const [kullanici, setKullanici] = useState(null)
  const [profil, setProfil] = useState(null)
  const [karakterler, setKarakterler] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [takipciSayisi, setTakipciSayisi] = useState(0)
  const [takipEdilenSayisi, setTakipEdilenSayisi] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/giris'; return }
      setKullanici(data.user)

      const { data: profilData } = await supabase
        .from('profiller')
        .select('*')
        .eq('id', data.user.id)
        .single()
      setProfil(profilData)

      const { data: chars } = await supabase
        .from('karakterler')
        .select('*, begeniler(count)')
        .eq('kullanici_id', data.user.id)
        .order('created_at', { ascending: false })
      if (chars) setKarakterler(chars)

      const { count: takipci } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', data.user.id)
      setTakipciSayisi(takipci || 0)

      const { count: takipEdilen } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', data.user.id)
      setTakipEdilenSayisi(takipEdilen || 0)

      setYukleniyor(false)
    })
  }, [])

  async function cikisYap() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const toplamBegeni = karakterler.reduce((acc, k) => acc + (k.begeniler?.[0]?.count || 0), 0)
  const goruntulenenAd = profil?.kullanici_adi || kullanici?.email?.split('@')[0]

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
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(127,119,221,0.5); }
        .btn-secondary { background: transparent; border: 1px solid rgba(201,169,110,0.4); color: #c9a96e; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-family: 'Cinzel', serif; font-size: 13px; letter-spacing: 0.5px; transition: all 0.3s ease; }
        .btn-secondary:hover { background: rgba(201,169,110,0.1); transform: translateY(-2px); }
        .stat-box { text-align: center; padding: 16px 24px; background: rgba(255,255,255,0.02); border: 1px solid rgba(201,169,110,0.1); border-radius: 8px; transition: all 0.3s ease; }
        .stat-box:hover { background: rgba(201,169,110,0.05); border-color: rgba(201,169,110,0.3); }
        @media (max-width: 768px) {
          .profil-kart { flex-direction: column !important; text-align: center; }
          .stat-row { justify-content: center !important; }
          .karakter-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .main-padding { padding: 24px 16px !important; }
          .nav-padding { padding: 12px 16px !important; }
        }
        @media (max-width: 480px) {
          .karakter-grid { grid-template-columns: repeat(1, 1fr) !important; }
        }
      `}</style>

      <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 48px', borderBottom:'1px solid rgba(201,169,110,0.2)', background:'rgba(10,10,15,0.9)', backdropFilter:'blur(10px)', position:'sticky', top:0, zIndex:100, boxShadow:'0 4px 30px rgba(0,0,0,0.5)'}} className="nav-padding">
        <a href="/" style={{fontSize:'24px', fontFamily:'Cinzel, serif', fontWeight:'700', letterSpacing:'2px', textDecoration:'none', color:'white'}}>
          char<span style={{color:'#7F77DD'}}>faces</span>
        </a>
        <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
          <button className="btn-primary" onClick={() => router.push('/karakter-ekle')}>✦ Karakter Ekle</button>
          <button className="btn-secondary" onClick={() => router.push('/ayarlar')}>⚙ Ayarlar</button>
          <button onClick={cikisYap} style={{background:'transparent', border:'none', color:'#666', cursor:'pointer', fontSize:'13px', fontFamily:'Cinzel, serif', letterSpacing:'0.5px', transition:'color 0.3s'}}
            onMouseEnter={e => e.target.style.color='#999'}
            onMouseLeave={e => e.target.style.color='#666'}>Çıkış</button>
        </div>
      </nav>

      <div className="main-padding" style={{maxWidth:'1000px', margin:'0 auto', padding:'48px 32px'}}>

        <div style={{background:'linear-gradient(145deg, #12101a, #1a1228)', border:'1px solid rgba(201,169,110,0.15)', borderRadius:'16px', padding:'40px', marginBottom:'48px', boxShadow:'0 20px 60px rgba(0,0,0,0.4)', position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute', left:0, top:0, bottom:0, width:'4px', background:'linear-gradient(to bottom, #7F77DD, #c9a96e)', opacity:0.6}}/>

          <div className="profil-kart" style={{display:'flex', alignItems:'center', gap:'32px'}}>
            <div style={{width:'90px', height:'90px', borderRadius:'50%', background:'linear-gradient(135deg, #7F77DD, #c9a96e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', fontWeight:'700', flexShrink:0, fontFamily:'Cinzel, serif', boxShadow:'0 0 30px rgba(127,119,221,0.4)'}}>
              {goruntulenenAd?.[0]?.toUpperCase()}
            </div>

            <div style={{flex:1}}>
              <div style={{fontSize:'24px', fontWeight:'700', fontFamily:'Cinzel, serif', letterSpacing:'1px', marginBottom:'4px'}}>
                {goruntulenenAd}
              </div>
              <div style={{fontSize:'13px', color:'#555', fontFamily:'EB Garamond, serif', fontStyle:'italic', marginBottom:'24px'}}>
                {kullanici?.email}
              </div>

              <div className="stat-row" style={{display:'flex', gap:'12px', flexWrap:'wrap'}}>
                <div className="stat-box">
                  <div style={{fontSize:'28px', fontWeight:'700', fontFamily:'Cinzel, serif', color:'white'}}>{karakterler.length}</div>
                  <div style={{fontSize:'10px', color:'#c9a96e', letterSpacing:'2px', fontFamily:'Cinzel, serif', marginTop:'4px'}}>KARAKTER</div>
                </div>
                <div className="stat-box">
                  <div style={{fontSize:'28px', fontWeight:'700', fontFamily:'Cinzel, serif', color:'white'}}>{toplamBegeni}</div>
                  <div style={{fontSize:'10px', color:'#c9a96e', letterSpacing:'2px', fontFamily:'Cinzel, serif', marginTop:'4px'}}>BEĞENİ</div>
                </div>
                <div className="stat-box">
                  <div style={{fontSize:'28px', fontWeight:'700', fontFamily:'Cinzel, serif', color:'white'}}>{takipciSayisi}</div>
                  <div style={{fontSize:'10px', color:'#c9a96e', letterSpacing:'2px', fontFamily:'Cinzel, serif', marginTop:'4px'}}>TAKİPÇİ</div>
                </div>
                <div className="stat-box">
                  <div style={{fontSize:'28px', fontWeight:'700', fontFamily:'Cinzel, serif', color:'white'}}>{takipEdilenSayisi}</div>
                  <div style={{fontSize:'10px', color:'#c9a96e', letterSpacing:'2px', fontFamily:'Cinzel, serif', marginTop:'4px'}}>TAKİP</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'28px'}}>
          <div style={{width:'30px', height:'1px', background:'rgba(201,169,110,0.4)'}}/>
          <h2 style={{fontSize:'11px', fontWeight:'600', color:'#c9a96e', letterSpacing:'3px', fontFamily:'Cinzel, serif'}}>
            BENİM KARAKTERLERİM ({karakterler.length})
          </h2>
          <div style={{flex:1, height:'1px', background:'rgba(201,169,110,0.2)'}}/>
        </div>

        {karakterler.length === 0 ? (
          <div style={{textAlign:'center', padding:'80px 32px', color:'#555'}}>
            <div style={{fontSize:'56px', marginBottom:'20px', opacity:0.4}}>📖</div>
            <div style={{fontSize:'16px', marginBottom:'8px', fontFamily:'Cinzel, serif', letterSpacing:'1px', color:'#666'}}>Henüz karakter eklemedin</div>
            <div style={{fontSize:'14px', color:'#444', fontFamily:'EB Garamond, serif', fontStyle:'italic', marginBottom:'24px'}}>İlk karakterini ekleyerek topluluğa katıl</div>
            <button className="btn-primary" onClick={() => router.push('/karakter-ekle')}>✦ İlk Karakterini Ekle</button>
          </div>
        ) : (
          <div className="karakter-grid" style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'24px'}}>
            {karakterler.map((k, i) => (
              <div key={k.id} className="card-hover card-appear"
                onClick={() => router.push(`/karakter/${k.id}`)}
                style={{animationDelay:`${i*0.08}s`, background:'linear-gradient(145deg, #12101a, #1a1228)', border:'1px solid rgba(201,169,110,0.15)', borderRadius:'12px', overflow:'hidden', cursor:'pointer', boxShadow:'0 8px 32px rgba(0,0,0,0.4)', position:'relative'}}>
                <div style={{position:'absolute', left:0, top:0, bottom:0, width:'4px', background:'linear-gradient(to bottom, #7F77DD, #c9a96e)', opacity:0.6}}/>
                <div style={{height:'200px', overflow:'hidden', position:'relative'}}>
                  {k.gorsel_url ? (
                    <img src={k.gorsel_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                  ) : (
                    <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'48px', background:'rgba(127,119,221,0.05)'}}>📖</div>
                  )}
                  <div style={{position:'absolute', bottom:0, left:0, right:0, height:'60px', background:'linear-gradient(to top, #12101a, transparent)'}}/>
                </div>
                <div style={{padding:'14px 16px 14px 20px'}}>
                  <div style={{fontWeight:'600', fontSize:'15px', fontFamily:'Cinzel, serif', letterSpacing:'0.5px', marginBottom:'4px'}}>{k.karakter_adi}</div>
                  <div style={{fontSize:'12px', color:'#c9a96e', fontFamily:'EB Garamond, serif', fontStyle:'italic', marginBottom:'8px'}}>{k.kitap_adi}</div>
                  <div style={{fontSize:'13px', color:'#D4537E', display:'flex', alignItems:'center', gap:'4px'}}>
                    ❤️ <span>{k.begeniler?.[0]?.count || 0} beğeni</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer style={{textAlign:'center', padding:'32px', borderTop:'1px solid rgba(201,169,110,0.1)', color:'#444', fontSize:'12px', fontFamily:'Cinzel, serif', letterSpacing:'2px'}}>
        <span style={{color:'#c9a96e', opacity:0.6}}>✦</span> &nbsp; CHARFACES &nbsp; <span style={{color:'#c9a96e', opacity:0.6}}>✦</span>
      </footer>
    </main>
  )
}