// @ts-nocheck
'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import BildirimZili from '../../components/BildirimZili'

export default function MesajDetay() {
  const params = useParams()
  const router = useRouter()
  const digerKisiId = params.id
  const [kullanici, setKullanici] = useState(null)
  const [mesajlar, setMesajlar] = useState([])
  const [digerKisiAd, setDigerKisiAd] = useState('')
  const [yeniMesaj, setYeniMesaj] = useState('')
  const [yukleniyor, setYukleniyor] = useState(true)
  const altRef = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/giris'); return }
      setKullanici(data.user)

      // Önce profiller tablosundan dene
      const { data: profil } = await supabase
        .from('profiller')
        .select('kullanici_adi, email')
        .eq('id', digerKisiId)
        .single()

      if (profil?.kullanici_adi) {
        setDigerKisiAd(profil.kullanici_adi)
      } else if (profil?.email) {
        setDigerKisiAd(profil.email.split('@')[0])
      } else {
        // profiller'de yoksa mesajlardan email bul
        const { data: mesajData } = await supabase
          .from('mesajlar')
          .select('gonderen_id')
          .eq('gonderen_id', digerKisiId)
          .limit(1)
        setDigerKisiAd(digerKisiId.slice(0, 8))
      }

      await mesajlariGetir(data.user.id)
      setYukleniyor(false)
    })
  }, [digerKisiId])

  useEffect(() => {
    altRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mesajlar])

  async function mesajlariGetir(uid) {
    const { data } = await supabase
      .from('mesajlar')
      .select('*')
      .or(`and(gonderen_id.eq.${uid},alici_id.eq.${digerKisiId}),and(gonderen_id.eq.${digerKisiId},alici_id.eq.${uid})`)
      .order('created_at', { ascending: true })

    if (data) setMesajlar(data)

    await supabase
      .from('mesajlar')
      .update({ okundu: true })
      .eq('gonderen_id', digerKisiId)
      .eq('alici_id', uid)
      .eq('okundu', false)
  }

  async function mesajGonder() {
  if (!yeniMesaj.trim() || !kullanici) return
  const { data, error } = await supabase.from('mesajlar').insert({
    gonderen_id: kullanici.id,
    alici_id: digerKisiId,
    icerik: yeniMesaj
  }).select().single()
  if (!error && data) {
    setMesajlar(prev => [...prev, data])
    setYeniMesaj('')
    // 🔔 Bildirim gönder
    fetch('/api/bildirim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kullanici_id: digerKisiId,
        gonderen_id: kullanici.id,
        tip: 'mesaj',
        karakter_id: null
      })
    })
  }
}
  if (yukleniyor) return (
    <main style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{color:'#c9a96e', fontFamily:'Cinzel, serif', letterSpacing:'3px', fontSize:'13px'}}>YÜKLENİYOR...</div>
    </main>
  )

  return (
    <main style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)', color:'white', fontFamily:'Georgia, serif', display:'flex', flexDirection:'column'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        .mesaj-input { flex:1; padding:14px 16px; background:rgba(255,255,255,0.03); border:1px solid rgba(201,169,110,0.2); border-radius:8px; color:white; font-size:14px; font-family:'EB Garamond',serif; transition:all 0.3s ease; resize:none; }
        .mesaj-input:focus { outline:none; border-color:rgba(201,169,110,0.5); }
        .mesaj-input::placeholder { color:#444; }
        .gonder-btn { padding:14px 24px; background:linear-gradient(135deg,#7F77DD,#9d77dd); border:none; border-radius:8px; color:white; cursor:pointer; font-family:'Cinzel',serif; font-size:12px; letter-spacing:1px; transition:all 0.3s ease; box-shadow:0 4px 15px rgba(127,119,221,0.3); }
        .gonder-btn:hover { transform:translateY(-2px); }
      `}</style>

      <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 48px', borderBottom:'1px solid rgba(201,169,110,0.2)', background:'rgba(10,10,15,0.9)', backdropFilter:'blur(10px)', position:'sticky', top:0, zIndex:100, boxShadow:'0 4px 30px rgba(0,0,0,0.5)'}}>
        <a href="/" style={{fontSize:'24px', fontFamily:'Cinzel, serif', fontWeight:'700', letterSpacing:'2px', textDecoration:'none', color:'white'}}>
          char<span style={{color:'#7F77DD'}}>faces</span>
        </a>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <BildirimZili kullaniciId={kullanici?.id} />
          <button onClick={() => router.push('/mesajlar')} style={{background:'transparent', border:'1px solid rgba(201,169,110,0.4)', color:'#c9a96e', padding:'10px 20px', borderRadius:'6px', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:'13px'}}>
            ← Gelen Kutusu
          </button>
        </div>
      </nav>

      <div style={{padding:'20px 48px', borderBottom:'1px solid rgba(201,169,110,0.1)', background:'rgba(10,10,15,0.5)', display:'flex', alignItems:'center', gap:'14px'}}>
        <div style={{width:'44px', height:'44px', borderRadius:'50%', background:'linear-gradient(135deg, #7F77DD, #c9a96e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'700', fontFamily:'Cinzel, serif', flexShrink:0}}>
          {digerKisiAd ? digerKisiAd[0].toUpperCase() : '?'}
        </div>
        <div>
          <div style={{fontSize:'16px', fontFamily:'Cinzel, serif', fontWeight:'600', letterSpacing:'1px'}}>
            {digerKisiAd || 'Kullanıcı'}
          </div>
          <button onClick={() => router.push(`/profil/${digerKisiId}`)} style={{background:'none', border:'none', color:'#7F77DD', cursor:'pointer', fontSize:'12px', fontFamily:'EB Garamond, serif', padding:0, marginTop:'2px'}}>
            Profile git →
          </button>
        </div>
      </div>

      <div style={{flex:1, overflowY:'auto', padding:'24px 48px', display:'flex', flexDirection:'column', gap:'12px', minHeight:'400px'}}>
        {mesajlar.length === 0 ? (
          <div style={{textAlign:'center', padding:'60px 0', color:'#444', fontFamily:'EB Garamond, serif', fontStyle:'italic', fontSize:'15px'}}>
            Henüz mesaj yok. İlk mesajı sen gönder!
          </div>
        ) : (
          mesajlar.map(m => {
            const benimMesajim = m.gonderen_id === kullanici?.id
            return (
              <div key={m.id} style={{display:'flex', justifyContent: benimMesajim ? 'flex-end' : 'flex-start'}}>
                <div style={{
                  maxWidth:'65%',
                  padding:'12px 16px',
                  borderRadius: benimMesajim ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: benimMesajim ? 'linear-gradient(135deg, #7F77DD, #9d77dd)' : 'linear-gradient(145deg, #12101a, #1a1228)',
                  border: benimMesajim ? 'none' : '1px solid rgba(201,169,110,0.15)',
                  boxShadow:'0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  <div style={{fontSize:'14px', fontFamily:'EB Garamond, serif', lineHeight:'1.6', color:'white'}}>
                    {m.icerik}
                  </div>
                  <div style={{fontSize:'10px', color: benimMesajim ? 'rgba(255,255,255,0.6)' : '#444', marginTop:'6px', textAlign:'right', fontFamily:'EB Garamond, serif'}}>
                    {new Date(m.created_at).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={altRef}/>
      </div>

      <div style={{padding:'20px 48px', borderTop:'1px solid rgba(201,169,110,0.1)', background:'rgba(10,10,15,0.9)', backdropFilter:'blur(10px)'}}>
        <div style={{display:'flex', gap:'10px', maxWidth:'780px', margin:'0 auto'}}>
          <textarea
            className="mesaj-input"
            placeholder="Mesajını yaz..."
            value={yeniMesaj}
            onChange={e => setYeniMesaj(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); mesajGonder() } }}
            rows={1}
          />
          <button className="gonder-btn" onClick={mesajGonder}>GÖNDER</button>
        </div>
      </div>
    </main>
  )
}