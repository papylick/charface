// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function KarakterDetay() {
  const params = useParams()
  const router = useRouter()
  const id = params.id
  const [karakter, setKarakter] = useState(null)
  const [kullanici, setKullanici] = useState(null)
  const [yorumlar, setYorumlar] = useState([])
  const [yeniYorum, setYeniYorum] = useState('')
  const [begendi, setBegendi] = useState(false)
  const [begeniSayisi, setBegeniSayisi] = useState(0)
  const [yukleniyor, setYukleniyor] = useState(true)

  useEffect(() => {
    if (!id) return
    supabase.auth.getUser().then(({ data }) => setKullanici(data.user))
    supabase.from('karakterler').select('*, begeniler(count)').eq('id', id).single().then(({ data }) => {
      if (data) { setKarakter(data); setBegeniSayisi(data.begeniler?.[0]?.count || 0) }
      setYukleniyor(false)
    })
    supabase.from('yorumlar').select('*').eq('karakter_id', id).order('created_at', { ascending: true }).then(({ data }) => {
      if (data) setYorumlar(data)
    })
  }, [id])

  useEffect(() => {
    if (!kullanici || !id) return
    supabase.from('begeniler').select('id').eq('karakter_id', id).eq('kullanici_id', kullanici.id).then(({ data }) => {
      if (data && data.length > 0) setBegendi(true)
    })
  }, [kullanici, id])

  async function toggleBegeni() {
    if (!kullanici) { router.push('/giris'); return }
    if (begendi) {
      await supabase.from('begeniler').delete().eq('karakter_id', id).eq('kullanici_id', kullanici.id)
      setBegendi(false); setBegeniSayisi(prev => Math.max(0, prev - 1))
    } else {
      await supabase.from('begeniler').insert({ karakter_id: id, kullanici_id: kullanici.id })
      setBegendi(true); setBegeniSayisi(prev => prev + 1)
    }
  }

  async function yorumEkle() {
    if (!kullanici) { router.push('/giris'); return }
    if (!yeniYorum.trim()) return
    const { data, error } = await supabase.from('yorumlar').insert({
      karakter_id: id, kullanici_id: kullanici.id,
      kullanici_email: kullanici.email, yorum: yeniYorum
    }).select().single()
    if (!error && data) { setYorumlar(prev => [...prev, data]); setYeniYorum('') }
  }

  if (yukleniyor) return (
    <main style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{color:'#c9a96e', fontFamily:'Cinzel, serif', letterSpacing:'3px', fontSize:'13px'}}>YÜKLENİYOR...</div>
    </main>
  )

  if (!karakter) return (
    <main style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{color:'#666', fontFamily:'Cinzel, serif', letterSpacing:'2px', fontSize:'13px'}}>KARAKTER BULUNAMADI</div>
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
        .yorum-input {
          flex: 1; padding: 14px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(201,169,110,0.2);
          border-radius: 8px; color: white;
          font-size: 14px; font-family: 'EB Garamond', serif;
          transition: all 0.3s ease;
        }
        .yorum-input:focus { outline: none; border-color: rgba(201,169,110,0.5); box-shadow: 0 0 15px rgba(201,169,110,0.1); }
        .yorum-input::placeholder { color: #444; }
        .begeni-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 24px;
          background: transparent;
          border: 1px solid rgba(201,169,110,0.3);
          border-radius: 8px; color: white; cursor: pointer;
          font-size: 15px; font-family: 'Cinzel', serif;
          letter-spacing: 1px;
          transition: all 0.3s ease;
        }
        .begeni-btn:hover { background: rgba(201,169,110,0.08); border-color: rgba(201,169,110,0.6); transform: translateY(-2px); }
        .begeni-btn.begendi { border-color: rgba(212,83,126,0.5); background: rgba(212,83,126,0.08); }
        .gonder-btn {
          padding: 14px 24px;
          background: linear-gradient(135deg, #7F77DD, #9d77dd);
          border: none; border-radius: 8px; color: white;
          cursor: pointer; font-family: 'Cinzel', serif;
          font-size: 12px; letter-spacing: 1px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(127,119,221,0.3);
        }
        .gonder-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(127,119,221,0.5); }
        .yorum-kart {
          background: linear-gradient(145deg, #12101a, #1a1228);
          border: 1px solid rgba(201,169,110,0.1);
          border-radius: 10px; padding: 16px 18px 16px 22px;
          margin-bottom: 12px; position: relative; overflow: hidden;
          transition: border-color 0.3s ease;
        }
        .yorum-kart:hover { border-color: rgba(201,169,110,0.25); }
        .yorum-kart::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
          background: linear-gradient(to bottom, #7F77DD, #c9a96e);
          opacity: 0.5;
        }
      `}</style>

      {/* Navbar */}
      <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 48px', borderBottom:'1px solid rgba(201,169,110,0.2)', background:'rgba(10,10,15,0.9)', backdropFilter:'blur(10px)', position:'sticky', top:0, zIndex:100, boxShadow:'0 4px 30px rgba(0,0,0,0.5)'}}>
        <a href="/" style={{fontSize:'24px', fontFamily:'Cinzel, serif', fontWeight:'700', letterSpacing:'2px', textDecoration:'none', color:'white'}}>
          char<span style={{color:'#7F77DD'}}>faces</span>
        </a>
        {kullanici && (
          <button onClick={() => router.push('/profil')} style={{background:'transparent', border:'1px solid rgba(201,169,110,0.4)', color:'#c9a96e', padding:'10px 20px', borderRadius:'6px', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:'13px', letterSpacing:'0.5px', transition:'all 0.3s ease'}}
            onMouseEnter={e => e.target.style.background='rgba(201,169,110,0.1)'}
            onMouseLeave={e => e.target.style.background='transparent'}>
            {kullanici.email?.split('@')[0]}
          </button>
        )}
      </nav>

      <div style={{maxWidth:'780px', margin:'0 auto', padding:'48px 32px'}}>

        {/* Görsel */}
        {karakter.gorsel_url && (
          <div style={{position:'relative', marginBottom:'32px', borderRadius:'16px', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.6)', border:'1px solid rgba(201,169,110,0.15)'}}>
            <img src={karakter.gorsel_url} style={{width:'100%', maxHeight:'480px', objectFit:'cover', display:'block'}}/>
            <div style={{position:'absolute', bottom:0, left:0, right:0, height:'120px', background:'linear-gradient(to top, #0a0a0f, transparent)'}}/>
          </div>
        )}

        {/* Karakter bilgisi */}
        <div style={{
          background: 'linear-gradient(145deg, #12101a, #1a1228)',
          border: '1px solid rgba(201,169,110,0.15)',
          borderRadius: '16px', padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{position:'absolute', left:0, top:0, bottom:0, width:'4px', background:'linear-gradient(to bottom, #7F77DD, #c9a96e)', opacity:0.6}}/>

          <div style={{marginBottom:'20px'}}>
            <h1 style={{fontSize:'36px', fontWeight:'700', fontFamily:'Cinzel, serif', letterSpacing:'2px', marginBottom:'8px', textShadow:'0 0 30px rgba(127,119,221,0.3)'}}>
              {karakter.karakter_adi}
            </h1>
            <div style={{fontSize:'14px', color:'#c9a96e', fontFamily:'EB Garamond, serif', fontStyle:'italic', marginBottom:'16px'}}>
              {karakter.kitap_adi}
            </div>
            {karakter.aciklama && (
              <p style={{fontSize:'16px', color:'#aaa', lineHeight:'1.8', fontFamily:'EB Garamond, serif'}}>
                {karakter.aciklama}
              </p>
            )}
          </div>

          {/* Süslü ayırıcı */}
          <div style={{display:'flex', alignItems:'center', gap:'12px', margin:'20px 0'}}>
            <div style={{flex:1, height:'1px', background:'rgba(201,169,110,0.15)'}}/>
            <span style={{color:'#c9a96e', fontSize:'10px', opacity:0.6}}>✦</span>
            <div style={{flex:1, height:'1px', background:'rgba(201,169,110,0.15)'}}/>
          </div>

          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px'}}>
            <button onClick={toggleBegeni} className={`begeni-btn ${begendi ? 'begendi' : ''}`}>
              <span style={{fontSize:'18px'}}>{begendi ? '❤️' : '🤍'}</span>
              <span style={{fontSize:'14px'}}>{begeniSayisi}</span>
              <span style={{fontSize:'11px', color:'#888'}}>BEĞENİ</span>
            </button>
            <button onClick={() => router.push(`/profil/${karakter.kullanici_id}`)}
              style={{background:'transparent', border:'none', color:'#555', cursor:'pointer', fontSize:'12px', fontFamily:'Cinzel, serif', letterSpacing:'1px', transition:'color 0.2s'}}
              onMouseEnter={e => e.target.style.color='#c9a96e'}
              onMouseLeave={e => e.target.style.color='#555'}>
              Ekleyen: {karakter.kullanici_email?.split('@')[0]}
            </button>
          </div>
        </div>

        {/* Yorumlar */}
        <div>
          <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px'}}>
            <div style={{width:'30px', height:'1px', background:'rgba(201,169,110,0.4)'}}/>
            <h2 style={{fontSize:'11px', fontWeight:'600', color:'#c9a96e', letterSpacing:'3px', fontFamily:'Cinzel, serif'}}>
              YORUMLAR ({yorumlar.length})
            </h2>
            <div style={{flex:1, height:'1px', background:'rgba(201,169,110,0.2)'}}/>
          </div>

          {kullanici ? (
            <div style={{marginBottom:'24px', display:'flex', gap:'10px'}}>
              <input
                type="text"
                placeholder="Yorumunu yaz..."
                value={yeniYorum}
                onChange={e => setYeniYorum(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && yorumEkle()}
                className="yorum-input"
              />
              <button onClick={yorumEkle} className="gonder-btn">GÖNDER</button>
            </div>
          ) : (
            <div style={{marginBottom:'24px', padding:'20px', background:'linear-gradient(145deg, #12101a, #1a1228)', border:'1px solid rgba(201,169,110,0.1)', borderRadius:'8px', textAlign:'center'}}>
              <button onClick={() => router.push('/giris')} style={{background:'none', border:'none', color:'#c9a96e', cursor:'pointer', fontFamily:'EB Garamond, serif', fontStyle:'italic', fontSize:'15px'}}>
                Yorum yapmak için giriş yap →
              </button>
            </div>
          )}

          {yorumlar.length === 0 ? (
            <div style={{color:'#444', textAlign:'center', padding:'40px', fontFamily:'EB Garamond, serif', fontStyle:'italic', fontSize:'15px'}}>
              Henüz yorum yok. İlk yorumu sen yap!
            </div>
          ) : (
            yorumlar.map(y => (
              <div key={y.id} className="yorum-kart">
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px'}}>
                  <button onClick={() => router.push(`/profil/${y.kullanici_id}`)}
                    style={{background:'none', border:'none', color:'#7F77DD', cursor:'pointer', fontSize:'13px', fontFamily:'Cinzel, serif', letterSpacing:'0.5px', padding:0, transition:'color 0.2s'}}
                    onMouseEnter={e => e.target.style.color='#c9a96e'}
                    onMouseLeave={e => e.target.style.color='#7F77DD'}>
                    {y.kullanici_email?.split('@')[0]}
                  </button>
                  <span style={{fontSize:'11px', color:'#444', fontFamily:'EB Garamond, serif'}}>
                    {new Date(y.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div style={{fontSize:'15px', color:'#bbb', fontFamily:'EB Garamond, serif', lineHeight:'1.6'}}>
                  {y.yorum}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <footer style={{textAlign:'center', padding:'32px', borderTop:'1px solid rgba(201,169,110,0.1)', color:'#444', fontSize:'12px', fontFamily:'Cinzel, serif', letterSpacing:'2px'}}>
        <span style={{color:'#c9a96e', opacity:0.6}}>✦</span> &nbsp; CHARFACES &nbsp; <span style={{color:'#c9a96e', opacity:0.6}}>✦</span>
      </footer>
    </main>
  )
}