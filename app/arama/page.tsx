// @ts-nocheck
'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'
import BildirimZili from '../components/BildirimZili'

const ETIKETLER = [
  '#fantastik', '#distopya', '#romantik', '#macera', '#gizem',
  '#korku', '#bilimkurgu', '#tarih', '#dram', '#komedi',
  '#gerilim', '#polisiye', '#mitoloji', '#gotik', '#aşk'
]

export default function Arama() {
  const router = useRouter()
  const [kullanici, setKullanici] = useState(null)
  const [aramaMetni, setAramaMetni] = useState('')
  const [aktifSekme, setAktifSekme] = useState('karakterler')
  const [siralama, setSiralama] = useState('yeni')
  const [seciliEtiket, setSeciliEtiket] = useState('')
  const [karakterler, setKarakterler] = useState([])
  const [kullanicilar, setKullanicilar] = useState([])
  const [yukleniyor, setYukleniyor] = useState(false)
  const aramaTimer = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setKullanici(data.user))
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    ara()
  }, [aramaMetni, siralama, seciliEtiket])

  async function ara() {
    setYukleniyor(true)
    if (aramaTimer.current) clearTimeout(aramaTimer.current)

    aramaTimer.current = setTimeout(async () => {
      // Karakterleri ara
      let query = supabase
        .from('karakterler')
        .select('*, begeniler(count)')
        .limit(24)

      if (aramaMetni) {
        query = query.or(`karakter_adi.ilike.%${aramaMetni}%,kitap_adi.ilike.%${aramaMetni}%`)
      }

      if (siralama === 'yeni') {
        query = query.order('created_at', { ascending: false })
      } else if (siralama === 'eski') {
        query = query.order('created_at', { ascending: true })
      }

      const { data: karakterData } = await query

      let filtrelenmis = karakterData || []

      // Etiket filtresi
      if (seciliEtiket && filtrelenmis.length > 0) {
        const { data: etiketData } = await supabase
          .from('etiketler')
          .select('karakter_id')
          .eq('etiket', seciliEtiket)
        const etiketIds = (etiketData || []).map(e => e.karakter_id)
        filtrelenmis = filtrelenmis.filter(k => etiketIds.includes(k.id))
      }

      // Beğeniye göre sırala (client-side)
      if (siralama === 'begeni') {
        filtrelenmis.sort((a, b) => (b.begeniler?.[0]?.count || 0) - (a.begeniler?.[0]?.count || 0))
      }

      setKarakterler(filtrelenmis)

      // Kullanıcıları ara
      if (aramaMetni.length >= 2) {
        const { data: kullaniciData } = await supabase
          .from('profiller')
          .select('id, kullanici_adi')
          .ilike('kullanici_adi', `%${aramaMetni}%`)
          .limit(6)
        setKullanicilar(kullaniciData || [])
      } else {
        setKullanicilar([])
      }

      setYukleniyor(false)
    }, 300)
  }

  return (
    <main style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)', color:'white', fontFamily:'Georgia, serif'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        .search-input { width:100%; padding:18px 24px 18px 56px; background:rgba(255,255,255,0.04); border:1px solid rgba(201,169,110,0.3); border-radius:12px; color:white; font-size:16px; box-sizing:border-box; font-family:'EB Garamond',serif; transition:all 0.3s ease; }
        .search-input:focus { outline:none; border-color:#c9a96e; box-shadow:0 0 30px rgba(201,169,110,0.1); background:rgba(255,255,255,0.06); }
        .search-input::placeholder { color:#555; }
        .sekme { padding:10px 24px; border-radius:20px; cursor:pointer; font-family:'Cinzel',serif; font-size:11px; letter-spacing:1px; transition:all 0.3s ease; border:1px solid rgba(201,169,110,0.2); background:transparent; color:#666; }
        .sekme.aktif { background:linear-gradient(135deg,#7F77DD,#9d77dd); border-color:transparent; color:white; box-shadow:0 4px 15px rgba(127,119,221,0.3); }
        .sekme:hover:not(.aktif) { color:#c9a96e; border-color:rgba(201,169,110,0.4); }
        .siralama-btn { padding:7px 16px; border-radius:16px; cursor:pointer; font-family:'EB Garamond',serif; font-size:13px; transition:all 0.2s; border:1px solid rgba(255,255,255,0.06); background:transparent; color:#666; }
        .siralama-btn.aktif { background:rgba(201,169,110,0.12); border-color:rgba(201,169,110,0.3); color:#c9a96e; }
        .siralama-btn:hover:not(.aktif) { color:#888; }
        .etiket-btn { padding:6px 14px; border-radius:16px; cursor:pointer; font-family:'EB Garamond',serif; font-size:12px; transition:all 0.2s; border:1px solid rgba(127,119,221,0.2); background:transparent; color:#888; }
        .etiket-btn.aktif { background:rgba(127,119,221,0.15); border-color:rgba(127,119,221,0.4); color:#9d8fff; }
        .etiket-btn:hover:not(.aktif) { color:#9d8fff; border-color:rgba(127,119,221,0.3); }
        .card-hover { transition:transform 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform:translateY(-6px); box-shadow:0 12px 40px rgba(0,0,0,0.5); }
        .kullanici-kart { background:linear-gradient(145deg,#12101a,#1a1228); border:1px solid rgba(201,169,110,0.15); border-radius:10px; padding:16px 20px; cursor:pointer; transition:all 0.3s ease; display:flex; align-items:center; gap:14px; }
        .kullanici-kart:hover { border-color:rgba(201,169,110,0.35); transform:translateY(-2px); }
        @media (max-width:768px) {
          .icerik { flex-direction:column !important; }
          .filtreler { width:100% !important; }
          .karakter-grid { grid-template-columns:repeat(2,1fr) !important; gap:12px !important; }
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

      <div style={{maxWidth:'1200px', margin:'0 auto', padding:'40px 32px'}}>

        {/* ARAMA KUTUSU */}
        <div style={{position:'relative', marginBottom:'32px'}}>
          <span style={{position:'absolute', left:'20px', top:'50%', transform:'translateY(-50%)', fontSize:'20px', color:'#c9a96e'}}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Karakter, kitap veya kullanıcı ara..."
            value={aramaMetni}
            onChange={e => setAramaMetni(e.target.value)}
            className="search-input"
          />
          {yukleniyor && (
            <span style={{position:'absolute', right:'20px', top:'50%', transform:'translateY(-50%)', color:'#c9a96e', fontSize:'14px', fontFamily:'Cinzel, serif', letterSpacing:'2px', fontSize:'11px'}}>ARANIYOR...</span>
          )}
        </div>

        <div className="icerik" style={{display:'flex', gap:'32px'}}>

          {/* FILTRELER - Sol */}
          <div className="filtreler" style={{width:'240px', flexShrink:0}}>

            {/* Sıralama */}
            <div style={{background:'linear-gradient(145deg,#12101a,#1a1228)', border:'1px solid rgba(201,169,110,0.1)', borderRadius:'12px', padding:'20px', marginBottom:'16px'}}>
              <div style={{fontSize:'10px', color:'#c9a96e', letterSpacing:'2px', fontFamily:'Cinzel, serif', marginBottom:'14px'}}>SIRALAMA</div>
              <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
                {[
                  { key: 'yeni', label: '🕐 En Yeni' },
                  { key: 'begeni', label: '❤️ En Çok Beğenilen' },
                  { key: 'eski', label: '📅 En Eski' },
                ].map(s => (
                  <button key={s.key} onClick={() => setSiralama(s.key)}
                    className={`siralama-btn ${siralama === s.key ? 'aktif' : ''}`}
                    style={{textAlign:'left'}}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Etiketler */}
            <div style={{background:'linear-gradient(145deg,#12101a,#1a1228)', border:'1px solid rgba(201,169,110,0.1)', borderRadius:'12px', padding:'20px'}}>
              <div style={{fontSize:'10px', color:'#c9a96e', letterSpacing:'2px', fontFamily:'Cinzel, serif', marginBottom:'14px'}}>ETİKET FİLTRESİ</div>
              <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
                {seciliEtiket && (
                  <button onClick={() => setSeciliEtiket('')}
                    style={{padding:'5px 12px', borderRadius:'16px', cursor:'pointer', fontFamily:'EB Garamond',serif, fontSize:'12px', border:'1px solid rgba(192,57,43,0.4)', background:'rgba(192,57,43,0.1)', color:'#e74c3c', marginBottom:'4px', width:'100%'}}>
                    ✕ Filtreyi Kaldır
                  </button>
                )}
                {ETIKETLER.map(e => (
                  <button key={e} onClick={() => setSeciliEtiket(seciliEtiket === e ? '' : e)}
                    className={`etiket-btn ${seciliEtiket === e ? 'aktif' : ''}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SONUÇLAR - Sağ */}
          <div style={{flex:1}}>

            {/* Sekmeler */}
            <div style={{display:'flex', gap:'8px', marginBottom:'24px', flexWrap:'wrap'}}>
              <button onClick={() => setAktifSekme('karakterler')}
                className={`sekme ${aktifSekme === 'karakterler' ? 'aktif' : ''}`}>
                📖 Karakterler {karakterler.length > 0 && `(${karakterler.length})`}
              </button>
              {kullanicilar.length > 0 && (
                <button onClick={() => setAktifSekme('kullanicilar')}
                  className={`sekme ${aktifSekme === 'kullanicilar' ? 'aktif' : ''}`}>
                  👤 Kullanıcılar ({kullanicilar.length})
                </button>
              )}
            </div>

            {/* Karakter sonuçları */}
            {aktifSekme === 'karakterler' && (
              <>
                {karakterler.length === 0 && !yukleniyor ? (
                  <div style={{textAlign:'center', padding:'80px 32px'}}>
                    <div style={{fontSize:'48px', marginBottom:'16px', opacity:0.3}}>🔍</div>
                    <div style={{fontSize:'16px', fontFamily:'Cinzel, serif', color:'#555'}}>
                      {aramaMetni ? `"${aramaMetni}" için sonuç bulunamadı` : 'Aramak için yazmaya başla'}
                    </div>
                  </div>
                ) : (
                  <div className="karakter-grid" style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'20px'}}>
                    {karakterler.map(k => (
                      <div key={k.id} className="card-hover" onClick={() => router.push(`/karakter/${k.id}`)}
                        style={{background:'linear-gradient(145deg,#12101a,#1a1228)', border:'1px solid rgba(201,169,110,0.15)', borderRadius:'12px', overflow:'hidden', cursor:'pointer', boxShadow:'0 8px 32px rgba(0,0,0,0.4)', position:'relative'}}>
                        <div style={{position:'absolute', left:0, top:0, bottom:0, width:'4px', background:'linear-gradient(to bottom, #7F77DD, #c9a96e)', opacity:0.6}}/>
                        <div style={{height:'180px', overflow:'hidden', position:'relative'}}>
                          {k.gorsel_url ? (
                            <img src={k.gorsel_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                          ) : (
                            <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'48px', background:'rgba(127,119,221,0.05)'}}>📖</div>
                          )}
                          <div style={{position:'absolute', bottom:0, left:0, right:0, height:'50px', background:'linear-gradient(to top, #12101a, transparent)'}}/>
                        </div>
                        <div style={{padding:'14px 16px 12px 20px'}}>
                          <div style={{fontWeight:'600', fontSize:'14px', fontFamily:'Cinzel, serif', letterSpacing:'0.5px', marginBottom:'3px'}}>{k.karakter_adi}</div>
                          <div style={{fontSize:'11px', color:'#c9a96e', fontFamily:'EB Garamond, serif', fontStyle:'italic', marginBottom:'6px'}}>{k.kitap_adi}</div>
                          <div style={{fontSize:'12px', color:'#D4537E', display:'flex', alignItems:'center', gap:'4px'}}>
                            ❤️ <span>{k.begeniler?.[0]?.count || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Kullanıcı sonuçları */}
            {aktifSekme === 'kullanicilar' && (
              <div style={{display:'grid', gap:'10px'}}>
                {kullanicilar.map(u => (
                  <div key={u.id} className="kullanici-kart" onClick={() => router.push(`/profil/${u.id}`)}>
                    <div style={{width:'44px', height:'44px', borderRadius:'50%', background:'linear-gradient(135deg, #7F77DD, #c9a96e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'700', fontFamily:'Cinzel, serif', flexShrink:0}}>
                      {(u.kullanici_adi || '?')[0].toUpperCase()}
                    </div>
                    <div style={{fontSize:'15px', fontFamily:'Cinzel, serif', fontWeight:'600'}}>{u.kullanici_adi}</div>
                    <span style={{marginLeft:'auto', color:'#555'}}>→</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer style={{textAlign:'center', padding:'32px', borderTop:'1px solid rgba(201,169,110,0.1)', color:'#444', fontSize:'12px', fontFamily:'Cinzel, serif', letterSpacing:'2px'}}>
        <span style={{color:'#c9a96e', opacity:0.6}}>✦</span> &nbsp; CHARFACES &nbsp; <span style={{color:'#c9a96e', opacity:0.6}}>✦</span>
      </footer>
    </main>
  )
}