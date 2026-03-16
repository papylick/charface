// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import BildirimZili from '../components/BildirimZili'

export default function Mesajlar() {
  const router = useRouter()
  const [kullanici, setKullanici] = useState(null)
  const [konusmalar, setKonusmalar] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/giris'); return }
      setKullanici(data.user)
      await konusmalariGetir(data.user.id)
      setYukleniyor(false)
    })
  }, [])

  async function konusmalariGetir(uid) {
    const { data } = await supabase
      .from('mesajlar')
      .select('*')
      .or(`gonderen_id.eq.${uid},alici_id.eq.${uid}`)
      .order('created_at', { ascending: false })

    if (!data) return

    // Benzersiz konuşmaları bul
    const konusmaMap = {}
    data.forEach(m => {
      const digerKisi = m.gonderen_id === uid ? m.alici_id : m.gonderen_id
      if (!konusmaMap[digerKisi]) {
        konusmaMap[digerKisi] = { ...m, diger_kisi_id: digerKisi, okunmamis: 0 }
      }
      if (!m.okundu && m.alici_id === uid) {
        konusmaMap[digerKisi].okunmamis++
      }
    })

    // Profil adlarını çek
    const ids = Object.keys(konusmaMap)
    if (ids.length > 0) {
      const { data: profiller } = await supabase
        .from('profiller')
        .select('id, kullanici_adi')
        .in('id', ids)
      if (profiller) {
        profiller.forEach(p => {
          if (konusmaMap[p.id]) konusmaMap[p.id].kullanici_adi = p.kullanici_adi
        })
      }
    }

    setKonusmalar(Object.values(konusmaMap))
  }

  if (yukleniyor) return (
    <main style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{color:'#c9a96e', fontFamily:'Cinzel, serif', letterSpacing:'3px', fontSize:'13px'}}>YÜKLENİYOR...</div>
    </main>
  )

  return (
    <main style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)', color:'white', fontFamily:'Georgia, serif'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        .konusma-kart { background:linear-gradient(145deg,#12101a,#1a1228); border:1px solid rgba(201,169,110,0.15); border-radius:12px; padding:20px 24px; cursor:pointer; transition:all 0.3s ease; position:relative; overflow:hidden; }
        .konusma-kart:hover { border-color:rgba(201,169,110,0.35); transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,0.4); }
        .konusma-kart::before { content:''; position:absolute; left:0; top:0; bottom:0; width:4px; background:linear-gradient(to bottom, #7F77DD, #c9a96e); opacity:0.6; }
      `}</style>

      <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 48px', borderBottom:'1px solid rgba(201,169,110,0.2)', background:'rgba(10,10,15,0.9)', backdropFilter:'blur(10px)', position:'sticky', top:0, zIndex:100, boxShadow:'0 4px 30px rgba(0,0,0,0.5)'}}>
        <a href="/" style={{fontSize:'24px', fontFamily:'Cinzel, serif', fontWeight:'700', letterSpacing:'2px', textDecoration:'none', color:'white'}}>
          char<span style={{color:'#7F77DD'}}>faces</span>
        </a>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <BildirimZili kullaniciId={kullanici?.id} />
          <button onClick={() => router.push('/profil')} style={{background:'transparent', border:'1px solid rgba(201,169,110,0.4)', color:'#c9a96e', padding:'10px 20px', borderRadius:'6px', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:'13px'}}>
            Profil
          </button>
        </div>
      </nav>

      <div style={{maxWidth:'680px', margin:'0 auto', padding:'48px 32px'}}>
        <div style={{marginBottom:'32px'}}>
          <div style={{fontSize:'11px', letterSpacing:'3px', color:'#c9a96e', fontFamily:'Cinzel, serif', marginBottom:'8px'}}>✦ MESAJLAR</div>
          <h1 style={{fontSize:'32px', fontFamily:'Cinzel, serif', fontWeight:'700', letterSpacing:'2px'}}>Gelen Kutusu</h1>
        </div>

        {konusmalar.length === 0 ? (
          <div style={{textAlign:'center', padding:'80px 32px'}}>
            <div style={{fontSize:'48px', marginBottom:'16px', opacity:0.3}}>💬</div>
            <div style={{fontSize:'16px', fontFamily:'Cinzel, serif', color:'#555', marginBottom:'8px'}}>Henüz mesaj yok</div>
            <div style={{fontSize:'14px', color:'#444', fontFamily:'EB Garamond, serif', fontStyle:'italic'}}>
              Profil sayfalarından kullanıcılara mesaj gönderebilirsin
            </div>
          </div>
        ) : (
          <div style={{display:'grid', gap:'12px'}}>
            {konusmalar.map(k => (
              <div key={k.diger_kisi_id} className="konusma-kart" onClick={() => router.push(`/mesajlar/${k.diger_kisi_id}`)}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
                    <div style={{width:'44px', height:'44px', borderRadius:'50%', background:'linear-gradient(135deg, #7F77DD, #c9a96e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'700', fontFamily:'Cinzel, serif', flexShrink:0}}>
                      {(k.kullanici_adi || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{fontSize:'15px', fontFamily:'Cinzel, serif', fontWeight:'600', letterSpacing:'0.5px', marginBottom:'4px'}}>
                        {k.kullanici_adi || k.diger_kisi_id.slice(0, 8)}
                      </div>
                      <div style={{fontSize:'13px', color:'#666', fontFamily:'EB Garamond, serif', fontStyle:'italic'}}>
                        {k.icerik?.slice(0, 50)}{k.icerik?.length > 50 ? '...' : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'6px'}}>
                    {k.okunmamis > 0 && (
                      <span style={{background:'#7F77DD', color:'white', borderRadius:'50%', width:'20px', height:'20px', fontSize:'11px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700'}}>
                        {k.okunmamis}
                      </span>
                    )}
                    <span style={{fontSize:'11px', color:'#444', fontFamily:'EB Garamond, serif'}}>
                      {new Date(k.created_at).toLocaleDateString('tr-TR')}
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