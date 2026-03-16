// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import BildirimZili from '../../components/BildirimZili'

export default function KoleksiyonDetay() {
  const params = useParams()
  const router = useRouter()
  const id = params.id
  const [kullanici, setKullanici] = useState(null)
  const [koleksiyon, setKoleksiyon] = useState(null)
  const [karakterler, setKarakterler] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setKullanici(data.user)
      await koleksiyonuGetir()
      setYukleniyor(false)
    })
  }, [id])

  async function koleksiyonuGetir() {
    const { data: kol } = await supabase
      .from('koleksiyonlar')
      .select('*')
      .eq('id', id)
      .single()
    if (kol) setKoleksiyon(kol)

    const { data: karakterData } = await supabase
      .from('koleksiyon_karakterler')
      .select('karakter_id, karakterler(*)')
      .eq('koleksiyon_id', id)
      .order('created_at', { ascending: false })
    if (karakterData) setKarakterler(karakterData.map(k => k.karakterler))
  }

  async function karakterCikar(karakterId) {
    await supabase.from('koleksiyon_karakterler')
      .delete()
      .eq('koleksiyon_id', id)
      .eq('karakter_id', karakterId)
    setKarakterler(prev => prev.filter(k => k.id !== karakterId))
  }

  if (yukleniyor) return (
    <main style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{color:'#c9a96e', fontFamily:'Cinzel, serif', letterSpacing:'3px', fontSize:'13px'}}>YÜKLENİYOR...</div>
    </main>
  )

  if (!koleksiyon) return (
    <main style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{color:'#666', fontFamily:'Cinzel, serif', letterSpacing:'2px', fontSize:'13px'}}>KOLEKSİYON BULUNAMADI</div>
    </main>
  )

  const benimKoleksiyonum = kullanici?.id === koleksiyon.kullanici_id

  return (
    <main style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)', color:'white', fontFamily:'Georgia, serif'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        .card-hover { transition:transform 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform:translateY(-6px); box-shadow:0 12px 40px rgba(0,0,0,0.5); }
      `}</style>

      <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 48px', borderBottom:'1px solid rgba(201,169,110,0.2)', background:'rgba(10,10,15,0.9)', backdropFilter:'blur(10px)', position:'sticky', top:0, zIndex:100, boxShadow:'0 4px 30px rgba(0,0,0,0.5)'}}>
        <a href="/" style={{fontSize:'24px', fontFamily:'Cinzel, serif', fontWeight:'700', letterSpacing:'2px', textDecoration:'none', color:'white'}}>
          char<span style={{color:'#7F77DD'}}>faces</span>
        </a>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          {kullanici && <BildirimZili kullaniciId={kullanici.id} />}
          <button onClick={() => router.push('/koleksiyonlar')} style={{background:'transparent', border:'1px solid rgba(201,169,110,0.4)', color:'#c9a96e', padding:'10px 20px', borderRadius:'6px', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:'13px'}}>
            ← Listelerim
          </button>
        </div>
      </nav>

      <div style={{maxWidth:'1100px', margin:'0 auto', padding:'48px 32px'}}>
        <div style={{marginBottom:'32px'}}>
          <div style={{fontSize:'11px', letterSpacing:'3px', color:'#c9a96e', fontFamily:'Cinzel, serif', marginBottom:'8px'}}>✦ KOLEKSİYON</div>
          <h1 style={{fontSize:'36px', fontFamily:'Cinzel, serif', fontWeight:'700', letterSpacing:'2px', marginBottom:'8px'}}>{koleksiyon.ad}</h1>
          {koleksiyon.aciklama && <p style={{fontSize:'16px', color:'#888', fontFamily:'EB Garamond, serif', fontStyle:'italic'}}>{koleksiyon.aciklama}</p>}
          <div style={{fontSize:'12px', color:'#555', marginTop:'8px', fontFamily:'Cinzel, serif', letterSpacing:'1px'}}>{karakterler.length} karakter</div>
        </div>

        {karakterler.length === 0 ? (
          <div style={{textAlign:'center', padding:'80px 32px'}}>
            <div style={{fontSize:'48px', marginBottom:'16px', opacity:0.3}}>📖</div>
            <div style={{fontSize:'16px', fontFamily:'Cinzel, serif', color:'#555', marginBottom:'8px'}}>Bu koleksiyon boş</div>
            <div style={{fontSize:'14px', color:'#444', fontFamily:'EB Garamond, serif', fontStyle:'italic', marginBottom:'24px'}}>Karakter sayfalarından bu koleksiyona ekle</div>
            <button onClick={() => router.push('/')} style={{background:'linear-gradient(135deg,#7F77DD,#9d77dd)', border:'none', color:'white', padding:'10px 24px', borderRadius:'6px', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:'12px', letterSpacing:'1px'}}>
              Karakterlere Göz At
            </button>
          </div>
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'24px'}}>
            {karakterler.map(k => (
              <div key={k.id} className="card-hover" style={{background:'linear-gradient(145deg,#12101a,#1a1228)', border:'1px solid rgba(201,169,110,0.15)', borderRadius:'12px', overflow:'hidden', position:'relative', cursor:'pointer', boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>
                <div style={{position:'absolute', left:0, top:0, bottom:0, width:'4px', background:'linear-gradient(to bottom, #7F77DD, #c9a96e)', opacity:0.6}}/>
                <div onClick={() => router.push(`/karakter/${k.id}`)}>
                  <div style={{height:'200px', overflow:'hidden'}}>
                    {k.gorsel_url ? (
                      <img src={k.gorsel_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                    ) : (
                      <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'48px', background:'rgba(127,119,221,0.05)'}}>📖</div>
                    )}
                  </div>
                  <div style={{padding:'16px 18px 14px 22px'}}>
                    <div style={{fontWeight:'600', fontSize:'16px', fontFamily:'Cinzel, serif', letterSpacing:'0.5px', marginBottom:'4px'}}>{k.karakter_adi}</div>
                    <div style={{fontSize:'12px', color:'#c9a96e', fontFamily:'EB Garamond, serif', fontStyle:'italic'}}>{k.kitap_adi}</div>
                  </div>
                </div>
                {benimKoleksiyonum && (
                  <div style={{padding:'0 18px 14px 22px'}}>
                    <button onClick={() => karakterCikar(k.id)} style={{background:'transparent', border:'1px solid rgba(192,57,43,0.3)', color:'#c0392b', padding:'6px 12px', borderRadius:'6px', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:'11px', letterSpacing:'1px', transition:'all 0.2s'}}>
                      Çıkar
                    </button>
                  </div>
                )}
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