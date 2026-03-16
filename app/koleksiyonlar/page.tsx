// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import BildirimZili from '../components/BildirimZili'

export default function Koleksiyonlar() {
  const router = useRouter()
  const [kullanici, setKullanici] = useState(null)
  const [koleksiyonlar, setKoleksiyonlar] = useState([])
  const [yeniAd, setYeniAd] = useState('')
  const [yeniAciklama, setYeniAciklama] = useState('')
  const [formAcik, setFormAcik] = useState(false)
  const [yukleniyor, setYukleniyor] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/giris'); return }
      setKullanici(data.user)
      await koleksiyonlariGetir(data.user.id)
      setYukleniyor(false)
    })
  }, [])

  async function koleksiyonlariGetir(uid) {
    const { data } = await supabase
      .from('koleksiyonlar')
      .select('*, koleksiyon_karakterler(count)')
      .eq('kullanici_id', uid)
      .order('created_at', { ascending: false })
    if (data) setKoleksiyonlar(data)
  }

  async function koleksiyonOlustur() {
    if (!yeniAd.trim()) return
    const { error } = await supabase.from('koleksiyonlar').insert({
      kullanici_id: kullanici.id,
      ad: yeniAd,
      aciklama: yeniAciklama
    })
    if (!error) {
      setYeniAd('')
      setYeniAciklama('')
      setFormAcik(false)
      await koleksiyonlariGetir(kullanici.id)
    }
  }

  async function koleksiyonSil(id) {
    await supabase.from('koleksiyonlar').delete().eq('id', id)
    setKoleksiyonlar(prev => prev.filter(k => k.id !== id))
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
        .input-field { width:100%; padding:12px 16px; background:rgba(255,255,255,0.03); border:1px solid rgba(201,169,110,0.2); border-radius:8px; color:white; font-size:14px; box-sizing:border-box; font-family:'EB Garamond',serif; transition:all 0.3s ease; margin-bottom:12px; }
        .input-field:focus { outline:none; border-color:rgba(201,169,110,0.5); }
        .input-field::placeholder { color:#444; }
        .btn-primary { background:linear-gradient(135deg,#7F77DD,#9d77dd); border:none; color:white; padding:10px 20px; border-radius:6px; cursor:pointer; font-family:'Cinzel',serif; font-size:12px; letter-spacing:1px; transition:all 0.3s ease; box-shadow:0 4px 15px rgba(127,119,221,0.3); }
        .btn-primary:hover { transform:translateY(-2px); }
        .btn-ghost { background:transparent; border:1px solid rgba(201,169,110,0.3); color:#c9a96e; padding:10px 20px; border-radius:6px; cursor:pointer; font-family:'Cinzel',serif; font-size:12px; letter-spacing:1px; transition:all 0.3s ease; }
        .btn-ghost:hover { background:rgba(201,169,110,0.1); }
        .btn-danger { background:transparent; border:1px solid rgba(192,57,43,0.4); color:#c0392b; padding:8px 14px; border-radius:6px; cursor:pointer; font-family:'Cinzel',serif; font-size:11px; letter-spacing:1px; transition:all 0.3s ease; }
        .btn-danger:hover { background:rgba(192,57,43,0.1); }
        .koleksiyon-kart { background:linear-gradient(145deg,#12101a,#1a1228); border:1px solid rgba(201,169,110,0.15); border-radius:12px; padding:24px 28px; cursor:pointer; transition:all 0.3s ease; position:relative; overflow:hidden; }
        .koleksiyon-kart:hover { border-color:rgba(201,169,110,0.35); transform:translateY(-4px); box-shadow:0 12px 40px rgba(0,0,0,0.4); }
        .koleksiyon-kart::before { content:''; position:absolute; left:0; top:0; bottom:0; width:4px; background:linear-gradient(to bottom, #7F77DD, #c9a96e); opacity:0.6; }
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

      <div style={{maxWidth:'780px', margin:'0 auto', padding:'48px 32px'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'32px'}}>
          <div>
            <div style={{fontSize:'11px', letterSpacing:'3px', color:'#c9a96e', fontFamily:'Cinzel, serif', marginBottom:'8px'}}>✦ KOLEKSİYONLARIM</div>
            <h1 style={{fontSize:'32px', fontFamily:'Cinzel, serif', fontWeight:'700', letterSpacing:'2px'}}>Listelerim</h1>
          </div>
          <button className="btn-primary" onClick={() => setFormAcik(true)}>+ Yeni Liste</button>
        </div>

        {formAcik && (
          <div style={{background:'linear-gradient(145deg,#12101a,#1a1228)', border:'1px solid rgba(201,169,110,0.2)', borderRadius:'12px', padding:'24px', marginBottom:'24px'}}>
            <div style={{fontSize:'11px', color:'#c9a96e', letterSpacing:'2px', fontFamily:'Cinzel, serif', marginBottom:'16px'}}>YENİ KOLEKSİYON</div>
            <input className="input-field" placeholder="Liste adı" value={yeniAd} onChange={e => setYeniAd(e.target.value)}/>
            <input className="input-field" placeholder="Açıklama (opsiyonel)" value={yeniAciklama} onChange={e => setYeniAciklama(e.target.value)}/>
            <div style={{display:'flex', gap:'10px'}}>
              <button className="btn-primary" onClick={koleksiyonOlustur}>Oluştur</button>
              <button className="btn-ghost" onClick={() => setFormAcik(false)}>İptal</button>
            </div>
          </div>
        )}

        {koleksiyonlar.length === 0 ? (
          <div style={{textAlign:'center', padding:'80px 32px'}}>
            <div style={{fontSize:'48px', marginBottom:'16px', opacity:0.3}}>📚</div>
            <div style={{fontSize:'16px', fontFamily:'Cinzel, serif', color:'#555', marginBottom:'8px'}}>Henüz liste yok</div>
            <div style={{fontSize:'14px', color:'#444', fontFamily:'EB Garamond, serif', fontStyle:'italic'}}>Favori karakterlerini listele</div>
          </div>
        ) : (
          <div style={{display:'grid', gap:'16px'}}>
            {koleksiyonlar.map(k => (
              <div key={k.id} className="koleksiyon-kart" onClick={() => router.push(`/koleksiyonlar/${k.id}`)}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontSize:'18px', fontFamily:'Cinzel, serif', fontWeight:'600', letterSpacing:'1px', marginBottom:'6px'}}>{k.ad}</div>
                    {k.aciklama && <div style={{fontSize:'14px', color:'#888', fontFamily:'EB Garamond, serif', fontStyle:'italic'}}>{k.aciklama}</div>}
                    <div style={{fontSize:'12px', color:'#555', marginTop:'8px', fontFamily:'Cinzel, serif', letterSpacing:'1px'}}>
                      {k.koleksiyon_karakterler?.[0]?.count || 0} karakter
                    </div>
                  </div>
                  <button className="btn-danger" onClick={e => { e.stopPropagation(); koleksiyonSil(k.id) }}>Sil</button>
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