// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import BildirimZili from '../components/BildirimZili'

export default function Trending() {
  const router = useRouter()
  const [kullanici, setKullanici] = useState(null)
  const [karakterler, setKarakterler] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [periyot, setPeriyot] = useState('hafta')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setKullanici(data.user))
  }, [])

  useEffect(() => {
    trendleriGetir()
  }, [periyot])

  async function trendleriGetir() {
    setYukleniyor(true)

    const gunSayisi = periyot === 'bugun' ? 1 : periyot === 'hafta' ? 7 : 30
    const baslangic = new Date()
    baslangic.setDate(baslangic.getDate() - gunSayisi)

    // Son X günde en çok beğeni alan karakterler
    const { data: begeniData } = await supabase
      .from('begeniler')
      .select('karakter_id')
      .gte('created_at', baslangic.toISOString())

    if (!begeniData || begeniData.length === 0) {
      // Beğeni yoksa genel en popülerleri göster
      const { data } = await supabase
        .from('karakterler')
        .select('*, begeniler(count)')
        .order('created_at', { ascending: false })
        .limit(20)
      if (data) setKarakterler(data)
      setYukleniyor(false)
      return
    }

    // Karakter başına beğeni sayısını hesapla
    const sayimlar = {}
    begeniData.forEach(b => {
      sayimlar[b.karakter_id] = (sayimlar[b.karakter_id] || 0) + 1
    })

    // En çok beğenilene göre sırala
    const siraliIds = Object.entries(sayimlar)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([id]) => id)

    const { data: karakterData } = await supabase
      .from('karakterler')
      .select('*, begeniler(count)')
      .in('id', siraliIds)

    if (karakterData) {
      // Beğeni sırasına göre tekrar sırala
      const sirali = siraliIds
        .map(id => karakterData.find(k => k.id === id))
        .filter(Boolean)
      setKarakterler(sirali)
    }
    setYukleniyor(false)
  }

  return (
    <main style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)', color:'white', fontFamily:'Georgia, serif'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        .card-hover { transition:transform 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform:translateY(-6px); box-shadow:0 12px 40px rgba(0,0,0,0.5); }
        .periyot-btn { padding:8px 20px; border-radius:20px; cursor:pointer; font-family:'Cinzel',serif; font-size:11px; letter-spacing:1px; transition:all 0.3s ease; border:1px solid rgba(201,169,110,0.3); background:transparent; color:#888; }
        .periyot-btn.aktif { background:linear-gradient(135deg,#7F77DD,#9d77dd); border-color:transparent; color:white; box-shadow:0 4px 15px rgba(127,119,221,0.3); }
        .periyot-btn:hover { color:#c9a96e; border-color:rgba(201,169,110,0.5); }
        @media (max-width:768px) {
          .karakter-grid { grid-template-columns:repeat(2,1fr) !important; gap:12px !important; }
          .main-padding { padding:0 16px 40px !important; }
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
          <button onClick={() => router.push('/')} style={{background:'transparent', border:'1px solid rgba(201,169,110,0.4)', color:'#c9a96e', padding:'10px 20px', borderRadius:'6px', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:'13px'}}>
            ← Ana Sayfa
          </button>
        </div>
      </nav>

      <div style={{maxWidth:'1100px', margin:'0 auto', padding:'48px 32px'}}>
        <div style={{textAlign:'center', marginBottom:'40px'}}>
          <div style={{fontSize:'11px', letterSpacing:'4px', color:'#c9a96e', fontFamily:'Cinzel, serif', marginBottom:'12px', opacity:0.8}}>✦ &nbsp; EN POPÜLER &nbsp; ✦</div>
          <h1 style={{fontSize:'36px', fontWeight:'700', fontFamily:'Cinzel, serif', letterSpacing:'2px', marginBottom:'24px'}}>
            🔥 Trending
          </h1>

          {/* Periyot seçimi */}
          <div style={{display:'flex', justifyContent:'center', gap:'10px'}}>
            {[
              { key: 'bugun', label: 'Bugün' },
              { key: 'hafta', label: 'Bu Hafta' },
              { key: 'ay', label: 'Bu Ay' }
            ].map(p => (
              <button key={p.key} onClick={() => setPeriyot(p.key)}
                className={`periyot-btn ${periyot === p.key ? 'aktif' : ''}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {yukleniyor ? (
          <div style={{textAlign:'center', padding:'60px', color:'#c9a96e', fontFamily:'Cinzel, serif', letterSpacing:'3px', fontSize:'13px'}}>
            YÜKLENİYOR...
          </div>
        ) : karakterler.length === 0 ? (
          <div style={{textAlign:'center', padding:'80px 32px'}}>
            <div style={{fontSize:'48px', marginBottom:'16px', opacity:0.3}}>📊</div>
            <div style={{fontSize:'16px', fontFamily:'Cinzel, serif', color:'#555'}}>Bu dönemde henüz veri yok</div>
          </div>
        ) : (
          <div className="karakter-grid" style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'24px'}}>
            {karakterler.map((k, i) => (
              <div key={k.id} className="card-hover" onClick={() => router.push(`/karakter/${k.id}`)}
                style={{background:'linear-gradient(145deg,#12101a,#1a1228)', border:'1px solid rgba(201,169,110,0.15)', borderRadius:'12px', overflow:'hidden', cursor:'pointer', boxShadow:'0 8px 32px rgba(0,0,0,0.4)', position:'relative'}}>

                {/* Sıralama rozeti */}
                <div style={{position:'absolute', top:'12px', left:'12px', zIndex:10, background: i === 0 ? 'linear-gradient(135deg,#FFD700,#FFA500)' : i === 1 ? 'linear-gradient(135deg,#C0C0C0,#A0A0A0)' : i === 2 ? 'linear-gradient(135deg,#CD7F32,#A0522D)' : 'rgba(0,0,0,0.6)', borderRadius:'50%', width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'700', fontFamily:'Cinzel, serif', color:'white', boxShadow:'0 2px 8px rgba(0,0,0,0.4)'}}>
                  {i + 1}
                </div>

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
                  <div style={{display:'flex', alignItems:'center', gap:'6px', color:'#D4537E', fontSize:'14px'}}>
                    ❤️ <span style={{fontFamily:'Cinzel, serif', fontWeight:'600'}}>{k.begeniler?.[0]?.count || 0}</span>
                    <span style={{fontSize:'11px', color:'#555', fontFamily:'Cinzel, serif'}}>beğeni</span>
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