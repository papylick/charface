// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import BildirimZili from '../../../components/BildirimZili'

export default function KitapSayfasi() {
  const params = useParams()
  const router = useRouter()
  const kitapAdi = decodeURIComponent(params.ad)
  const [kullanici, setKullanici] = useState(null)
  const [karakterler, setKarakterler] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [begeniler, setBegeniler] = useState({})

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setKullanici(data.user)
      if (data.user) {
        supabase.from('begeniler').select('karakter_id').eq('kullanici_id', data.user.id).then(({ data: b }) => {
          if (b) { const obj = {}; b.forEach(x => obj[x.karakter_id] = true); setBegeniler(obj) }
        })
      }
    })
    supabase.from('karakterler').select('*, begeniler(count)')
      .eq('kitap_adi', kitapAdi)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setKarakterler(data)
        setYukleniyor(false)
      })
  }, [kitapAdi])

  async function toggleBegeni(e, karakterId, karakterSahibiId) {
    e.stopPropagation()
    if (!kullanici) { router.push('/giris'); return }
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

  const toplamBegeni = karakterler.reduce((acc, k) => acc + (k.begeniler?.[0]?.count || 0), 0)

  if (yukleniyor) return (
    <main style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{color:'#c9a96e', fontFamily:'Cinzel, serif', letterSpacing:'3px', fontSize:'13px'}}>YÜKLENİYOR...</div>
    </main>
  )

  return (
    <main style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)', color:'white', fontFamily:'Georgia, serif'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        .card-hover { transition:transform 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform:translateY(-6px); box-shadow:0 12px 40px rgba(0,0,0,0.5); }
        @media (max-width:768px) {
          .karakter-grid { grid-template-columns:repeat(2,1fr) !important; gap:12px !important; }
          .main-pad { padding:0 16px 40px !important; }
        }
        @media (max-width:480px) {
          .karakter-grid { grid-template-columns:repeat(1,1fr) !important; }
        }
      `}</style>

      <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 48px', borderBottom:'1px solid rgba(201,169,110,0.2)', background:'rgba(10,10,15,0.9)', backdropFilter:'blur(10px)', position:'sticky', top:0, zIndex:100, boxShadow:'0 4px 30px rgba(0,0,0,0.5)'}}>
        <a href="/" style={{fontSize:'24px', fontFamily:'Cinzel, serif', fontWeight:'700', letterSpacing:'2px', textDecoration:'none', color:'white'}}>
          char<span style={{color:'#7F77DD'}}>faces</span>
        </a>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          {kullanici && <BildirimZili kullaniciId={kullanici.id} />}
          <button onClick={() => router.back()} style={{background:'transparent', border:'1px solid rgba(201,169,110,0.4)', color:'#c9a96e', padding:'10px 20px', borderRadius:'6px', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:'13px'}}>
            ← Geri
          </button>
        </div>
      </nav>

      <div style={{maxWidth:'1100px', margin:'0 auto', padding:'48px 32px'}}>

        {/* KİTAP BAŞLIK */}
        <div style={{background:'linear-gradient(145deg, #12101a, #1a1228)', border:'1px solid rgba(201,169,110,0.15)', borderRadius:'16px', padding:'40px', marginBottom:'40px', boxShadow:'0 20px 60px rgba(0,0,0,0.4)', position:'relative', overflow:'hidden', textAlign:'center'}}>
          <div style={{position:'absolute', left:0, top:0, bottom:0, width:'4px', background:'linear-gradient(to bottom, #7F77DD, #c9a96e)', opacity:0.6}}/>
          <div style={{fontSize:'11px', letterSpacing:'4px', color:'#c9a96e', fontFamily:'Cinzel, serif', marginBottom:'12px', opacity:0.8}}>✦ &nbsp; KİTAP &nbsp; ✦</div>
          <h1 style={{fontSize:'32px', fontWeight:'700', fontFamily:'Cinzel, serif', letterSpacing:'2px', marginBottom:'20px', textShadow:'0 0 40px rgba(127,119,221,0.3)'}}>
            {kitapAdi}
          </h1>
          <div style={{display:'flex', justifyContent:'center', gap:'32px', flexWrap:'wrap'}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'28px', fontWeight:'700', fontFamily:'Cinzel, serif', color:'white'}}>{karakterler.length}</div>
              <div style={{fontSize:'10px', color:'#c9a96e', letterSpacing:'2px', fontFamily:'Cinzel, serif', marginTop:'4px'}}>KARAKTER</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'28px', fontWeight:'700', fontFamily:'Cinzel, serif', color:'white'}}>{toplamBegeni}</div>
              <div style={{fontSize:'10px', color:'#c9a96e', letterSpacing:'2px', fontFamily:'Cinzel, serif', marginTop:'4px'}}>TOPLAM BEĞENİ</div>
            </div>
          </div>
          <div style={{marginTop:'24px'}}>
            <button onClick={() => router.push(`/karakter-ekle`)}
              style={{background:'linear-gradient(135deg,#7F77DD,#9d77dd)', border:'none', color:'white', padding:'12px 24px', borderRadius:'8px', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:'12px', letterSpacing:'1px', boxShadow:'0 4px 15px rgba(127,119,221,0.3)'}}>
              ✦ Bu Kitaba Karakter Ekle
            </button>
          </div>
        </div>

        {/* KARAKTERLERİ */}
        <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'28px'}}>
          <div style={{width:'30px', height:'1px', background:'rgba(201,169,110,0.4)'}}/>
          <h2 style={{fontSize:'11px', fontWeight:'600', color:'#c9a96e', letterSpacing:'3px', fontFamily:'Cinzel, serif'}}>
            TÜM KARAKTERLER ({karakterler.length})
          </h2>
          <div style={{flex:1, height:'1px', background:'rgba(201,169,110,0.2)'}}/>
        </div>

        {karakterler.length === 0 ? (
          <div style={{textAlign:'center', padding:'80px 32px'}}>
            <div style={{fontSize:'48px', marginBottom:'16px', opacity:0.3}}>📖</div>
            <div style={{fontSize:'16px', fontFamily:'Cinzel, serif', color:'#555', marginBottom:'8px'}}>Henüz karakter eklenmemiş</div>
            <div style={{fontSize:'14px', color:'#444', fontFamily:'EB Garamond, serif', fontStyle:'italic', marginBottom:'24px'}}>Bu kitabın ilk karakterini sen ekle!</div>
            <button onClick={() => router.push('/karakter-ekle')}
              style={{background:'linear-gradient(135deg,#7F77DD,#9d77dd)', border:'none', color:'white', padding:'12px 24px', borderRadius:'8px', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:'12px', letterSpacing:'1px'}}>
              ✦ Karakter Ekle
            </button>
          </div>
        ) : (
          <div className="karakter-grid" style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'24px'}}>
            {karakterler.map((k, i) => (
              <div key={k.id} className="card-hover" onClick={() => router.push(`/karakter/${k.id}`)}
                style={{background:'linear-gradient(145deg,#12101a,#1a1228)', border:'1px solid rgba(201,169,110,0.15)', borderRadius:'12px', overflow:'hidden', cursor:'pointer', boxShadow:'0 8px 32px rgba(0,0,0,0.4)', position:'relative'}}>
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
                  <div style={{fontWeight:'600', fontSize:'16px', fontFamily:'Cinzel, serif', letterSpacing:'0.5px', marginBottom:'8px'}}>{k.karakter_adi}</div>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                    <button onClick={e => toggleBegeni(e, k.id, k.kullanici_id)}
                      style={{background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', color: begeniler[k.id] ? '#D4537E' : '#555', padding:0, transition:'transform 0.2s'}}
                      onMouseEnter={e => e.currentTarget.style.transform='scale(1.2)'}
                      onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                      <span style={{fontSize:'16px'}}>{begeniler[k.id] ? '❤️' : '🤍'}</span>
                      <span style={{fontSize:'13px'}}>{k.begeniler?.[0]?.count || 0}</span>
                    </button>
                    <span style={{fontSize:'11px', color:'#555', fontFamily:'Cinzel, serif'}}>
                      {k.kullanici_email?.split('@')[0]}
                    </span>
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