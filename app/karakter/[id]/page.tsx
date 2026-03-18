// @ts-nocheck
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import BildirimZili from '../../components/BildirimZili'

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
  const [silOnay, setSilOnay] = useState(false)
  const [duzenle, setDuzenle] = useState(false)
  const [duzenleAdi, setDuzenleAdi] = useState('')
  const [duzenleKitap, setDuzenleKitap] = useState('')
  const [duzenleAciklama, setDuzenleAciklama] = useState('')
  const [koleksiyonlar, setKoleksiyonlar] = useState([])
  const [koleksiyonMenuAcik, setKoleksiyonMenuAcik] = useState(false)
  const [eklenenKoleksiyonlar, setEklenenKoleksiyonlar] = useState({})
  const [raporModalAcik, setRaporModalAcik] = useState(false)
  const [raporSebep, setRaporSebep] = useState('')
  const [raporAciklama, setRaporAciklama] = useState('')
  const [raporGonderildi, setRaporGonderildi] = useState(false)
  const [etiketler, setEtiketler] = useState([])
  const [paylasMenuAcik, setPaylasMenuAcik] = useState(false)
  const [kopyalandi, setKopyalandi] = useState(false)
  const [benzerKarakterler, setBenzerKarakterler] = useState([])
  const [yorumBegenileri, setYorumBegenileri] = useState({})
  const [yorumBegeniSayilari, setYorumBegeniSayilari] = useState({})

  useEffect(() => {
    if (!id) return
    supabase.auth.getUser().then(({ data }) => {
      setKullanici(data.user)
      if (data.user) {
        supabase.from('koleksiyonlar').select('*').eq('kullanici_id', data.user.id).then(({ data: kols }) => {
          if (kols) setKoleksiyonlar(kols)
        })
        supabase.from('koleksiyon_karakterler').select('koleksiyon_id').eq('karakter_id', id).then(({ data: ekli }) => {
          if (ekli) {
            const obj = {}
            ekli.forEach(e => obj[e.koleksiyon_id] = true)
            setEklenenKoleksiyonlar(obj)
          }
        })
      }
    })
    supabase.from('karakterler').select('*, begeniler(count)').eq('id', id).single().then(({ data }) => {
      if (data) {
        setKarakter(data)
        setBegeniSayisi(data.begeniler?.[0]?.count || 0)
        setDuzenleAdi(data.karakter_adi)
        setDuzenleKitap(data.kitap_adi)
        setDuzenleAciklama(data.aciklama || '')
        supabase.from('karakterler').select('*, begeniler(count)')
          .eq('kitap_adi', data.kitap_adi).neq('id', id).limit(4)
          .then(({ data: benzer }) => {
            if (benzer && benzer.length > 0) setBenzerKarakterler(benzer)
            else supabase.from('karakterler').select('*, begeniler(count)').neq('id', id)
              .order('created_at', { ascending: false }).limit(4)
              .then(({ data: son }) => { if (son) setBenzerKarakterler(son) })
          })
      }
      setYukleniyor(false)
    })
    supabase.from('yorumlar').select('*').eq('karakter_id', id).order('created_at', { ascending: true }).then(({ data }) => {
      if (data) {
        setYorumlar(data)
        // Yorum beğeni sayılarını getir
        if (data.length > 0) {
          const yorumIds = data.map(y => y.id)
          supabase.from('yorum_begenileri').select('yorum_id').in('yorum_id', yorumIds).then(({ data: begData }) => {
            if (begData) {
              const sayilar = {}
              yorumIds.forEach(yid => sayilar[yid] = 0)
              begData.forEach(b => sayilar[b.yorum_id] = (sayilar[b.yorum_id] || 0) + 1)
              setYorumBegeniSayilari(sayilar)
            }
          })
        }
      }
    })
    supabase.from('etiketler').select('etiket').eq('karakter_id', id).then(({ data }) => {
      if (data) setEtiketler(data.map(e => e.etiket))
    })
  }, [id])

  useEffect(() => {
    if (!kullanici || !id) return
    supabase.from('begeniler').select('id').eq('karakter_id', id).eq('kullanici_id', kullanici.id).then(({ data }) => {
      if (data && data.length > 0) setBegendi(true)
    })
    // Kullanıcının yorum beğenilerini getir
    supabase.from('yorum_begenileri').select('yorum_id').eq('kullanici_id', kullanici.id).then(({ data }) => {
      if (data) {
        const obj = {}
        data.forEach(b => obj[b.yorum_id] = true)
        setYorumBegenileri(obj)
      }
    })
  }, [kullanici, id])

  async function yorumBegen(yorumId) {
    if (!kullanici) { router.push('/giris'); return }
    if (yorumBegenileri[yorumId]) {
      await supabase.from('yorum_begenileri').delete().eq('yorum_id', yorumId).eq('kullanici_id', kullanici.id)
      setYorumBegenileri(prev => ({ ...prev, [yorumId]: false }))
      setYorumBegeniSayilari(prev => ({ ...prev, [yorumId]: Math.max(0, (prev[yorumId] || 1) - 1) }))
    } else {
      await supabase.from('yorum_begenileri').insert({ yorum_id: yorumId, kullanici_id: kullanici.id })
      setYorumBegenileri(prev => ({ ...prev, [yorumId]: true }))
      setYorumBegeniSayilari(prev => ({ ...prev, [yorumId]: (prev[yorumId] || 0) + 1 }))
    }
  }

  const karakterUrl = typeof window !== 'undefined' ? window.location.href : ''
  const paylasMetni = karakter ? `${karakter.karakter_adi} - ${karakter.kitap_adi} karakterini CharFaces'te keşfet! 📖✨` : ''

  function twitterPaylas() {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(paylasMetni)}&url=${encodeURIComponent(karakterUrl)}`, '_blank')
    setPaylasMenuAcik(false)
  }

  function whatsappPaylas() {
    window.open(`https://wa.me/?text=${encodeURIComponent(paylasMetni + ' ' + karakterUrl)}`, '_blank')
    setPaylasMenuAcik(false)
  }

  function linkKopyala() {
    navigator.clipboard.writeText(karakterUrl)
    setKopyalandi(true)
    setPaylasMenuAcik(false)
    setTimeout(() => setKopyalandi(false), 2000)
  }

  function nativePaylas() {
    if (navigator.share) navigator.share({ title: paylasMetni, url: karakterUrl })
    else setPaylasMenuAcik(prev => !prev)
  }

  async function toggleBegeni() {
    if (!kullanici) { router.push('/giris'); return }
    if (begendi) {
      await supabase.from('begeniler').delete().eq('karakter_id', id).eq('kullanici_id', kullanici.id)
      setBegendi(false); setBegeniSayisi(prev => Math.max(0, prev - 1))
    } else {
      await supabase.from('begeniler').insert({ karakter_id: id, kullanici_id: kullanici.id })
      setBegendi(true); setBegeniSayisi(prev => prev + 1)
      if (karakter.kullanici_id !== kullanici.id) {
        fetch('/api/bildirim', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kullanici_id: karakter.kullanici_id, gonderen_id: kullanici.id, tip: 'begeni', karakter_id: id }) })
      }
    }
  }

  async function koleksiyonaToggle(koleksiyonId) {
    if (eklenenKoleksiyonlar[koleksiyonId]) {
      await supabase.from('koleksiyon_karakterler').delete().eq('koleksiyon_id', koleksiyonId).eq('karakter_id', id)
      setEklenenKoleksiyonlar(prev => ({ ...prev, [koleksiyonId]: false }))
    } else {
      await supabase.from('koleksiyon_karakterler').insert({ koleksiyon_id: koleksiyonId, karakter_id: id })
      setEklenenKoleksiyonlar(prev => ({ ...prev, [koleksiyonId]: true }))
    }
  }

  async function yorumEkle() {
    if (!kullanici) { router.push('/giris'); return }
    if (!yeniYorum.trim()) return
    const { data, error } = await supabase.from('yorumlar').insert({
      karakter_id: id, kullanici_id: kullanici.id, kullanici_email: kullanici.email, yorum: yeniYorum
    }).select().single()
    if (!error && data) {
      setYorumlar(prev => [...prev, data])
      setYorumBegeniSayilari(prev => ({ ...prev, [data.id]: 0 }))
      setYeniYorum('')
      if (karakter.kullanici_id !== kullanici.id) {
        fetch('/api/bildirim', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kullanici_id: karakter.kullanici_id, gonderen_id: kullanici.id, tip: 'yorum', karakter_id: id }) })
      }
    }
  }

  async function karakterSil() {
    await supabase.from('begeniler').delete().eq('karakter_id', id)
    await supabase.from('yorumlar').delete().eq('karakter_id', id)
    await supabase.from('karakterler').delete().eq('id', id)
    router.push('/profil')
  }

  async function karakterGuncelle() {
    const { error } = await supabase.from('karakterler').update({
      karakter_adi: duzenleAdi, kitap_adi: duzenleKitap, aciklama: duzenleAciklama
    }).eq('id', id)
    if (!error) {
      setKarakter(prev => ({ ...prev, karakter_adi: duzenleAdi, kitap_adi: duzenleKitap, aciklama: duzenleAciklama }))
      setDuzenle(false)
    }
  }

  async function raporGonder() {
    if (!kullanici) { router.push('/giris'); return }
    if (!raporSebep) return
    const { error } = await supabase.from('raporlar').insert({
      rapor_eden_id: kullanici.id, karakter_id: id, sebep: raporSebep, aciklama: raporAciklama
    })
    if (!error) {
      setRaporGonderildi(true)
      setTimeout(() => { setRaporModalAcik(false); setRaporGonderildi(false); setRaporSebep(''); setRaporAciklama('') }, 2000)
    }
  }

  const benimKarakterim = kullanici?.id === karakter?.kullanici_id

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
    <main style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)', color:'white', fontFamily:'Georgia, serif'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        .yorum-input { flex:1; padding:14px 16px; background:rgba(255,255,255,0.03); border:1px solid rgba(201,169,110,0.2); border-radius:8px; color:white; font-size:14px; font-family:'EB Garamond',serif; transition:all 0.3s ease; }
        .yorum-input:focus { outline:none; border-color:rgba(201,169,110,0.5); box-shadow:0 0 15px rgba(201,169,110,0.1); }
        .yorum-input::placeholder { color:#444; }
        .input-field { width:100%; padding:12px 16px; background:rgba(255,255,255,0.03); border:1px solid rgba(201,169,110,0.2); border-radius:8px; color:white; font-size:14px; box-sizing:border-box; font-family:'EB Garamond',serif; transition:all 0.3s ease; margin-bottom:12px; }
        .input-field:focus { outline:none; border-color:rgba(201,169,110,0.5); }
        .input-field::placeholder { color:#444; }
        .begeni-btn { display:flex; align-items:center; gap:10px; padding:12px 24px; background:transparent; border:1px solid rgba(201,169,110,0.3); border-radius:8px; color:white; cursor:pointer; font-size:15px; font-family:'Cinzel',serif; letter-spacing:1px; transition:all 0.3s ease; }
        .begeni-btn:hover { background:rgba(201,169,110,0.08); border-color:rgba(201,169,110,0.6); transform:translateY(-2px); }
        .begeni-btn.begendi { border-color:rgba(212,83,126,0.5); background:rgba(212,83,126,0.08); }
        .btn-primary { background:linear-gradient(135deg,#7F77DD,#9d77dd); border:none; color:white; padding:10px 20px; border-radius:6px; cursor:pointer; font-family:'Cinzel',serif; font-size:12px; letter-spacing:1px; transition:all 0.3s ease; box-shadow:0 4px 15px rgba(127,119,221,0.3); }
        .btn-primary:hover { transform:translateY(-2px); }
        .btn-ghost { background:transparent; border:1px solid rgba(201,169,110,0.3); color:#c9a96e; padding:10px 20px; border-radius:6px; cursor:pointer; font-family:'Cinzel',serif; font-size:12px; letter-spacing:1px; transition:all 0.3s ease; }
        .btn-ghost:hover { background:rgba(201,169,110,0.1); }
        .btn-danger { background:transparent; border:1px solid rgba(192,57,43,0.4); color:#c0392b; padding:10px 20px; border-radius:6px; cursor:pointer; font-family:'Cinzel',serif; font-size:12px; letter-spacing:1px; transition:all 0.3s ease; }
        .btn-danger:hover { background:rgba(192,57,43,0.1); }
        .gonder-btn { padding:14px 24px; background:linear-gradient(135deg,#7F77DD,#9d77dd); border:none; border-radius:8px; color:white; cursor:pointer; font-family:'Cinzel',serif; font-size:12px; letter-spacing:1px; transition:all 0.3s ease; box-shadow:0 4px 15px rgba(127,119,221,0.3); }
        .gonder-btn:hover { transform:translateY(-2px); }
        .yorum-kart { background:linear-gradient(145deg,#12101a,#1a1228); border:1px solid rgba(201,169,110,0.1); border-radius:10px; padding:16px 18px 12px 22px; margin-bottom:12px; position:relative; transition:border-color 0.3s ease; }
        .yorum-kart:hover { border-color:rgba(201,169,110,0.25); }
        .yorum-kart::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:linear-gradient(to bottom,#7F77DD,#c9a96e); opacity:0.5; }
        .koleksiyon-menu { position:absolute; top:100%; left:0; background:linear-gradient(145deg,#12101a,#1a1228); border:1px solid rgba(201,169,110,0.2); border-radius:10px; padding:8px; min-width:220px; z-index:9999; box-shadow:0 10px 40px rgba(0,0,0,0.8); margin-top:8px; }
        .koleksiyon-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:6px; cursor:pointer; transition:background 0.2s; font-family:'EB Garamond',serif; font-size:14px; color:#bbb; }
        .koleksiyon-item:hover { background:rgba(201,169,110,0.08); color:white; }
        .etiket-chip { display:inline-flex; padding:5px 12px; background:rgba(127,119,221,0.1); border:1px solid rgba(127,119,221,0.25); border-radius:20px; font-size:12px; color:#9d8fff; font-family:'EB Garamond',serif; cursor:pointer; transition:all 0.2s; }
        .etiket-chip:hover { background:rgba(127,119,221,0.2); border-color:rgba(127,119,221,0.4); }
        .paylas-menu { position:absolute; top:100%; left:0; background:linear-gradient(145deg,#12101a,#1a1228); border:1px solid rgba(201,169,110,0.2); border-radius:10px; padding:8px; min-width:180px; z-index:9999; box-shadow:0 10px 40px rgba(0,0,0,0.8); margin-top:8px; }
        .paylas-item { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:6px; cursor:pointer; transition:background 0.2s; font-family:'EB Garamond',serif; font-size:14px; color:#bbb; }
        .paylas-item:hover { background:rgba(201,169,110,0.08); color:white; }
        .benzer-kart { background:linear-gradient(145deg,#12101a,#1a1228); border:1px solid rgba(201,169,110,0.1); border-radius:10px; overflow:hidden; cursor:pointer; transition:all 0.3s ease; position:relative; }
        .benzer-kart:hover { border-color:rgba(201,169,110,0.3); transform:translateY(-4px); box-shadow:0 8px 24px rgba(0,0,0,0.4); }
        .yorum-begen-btn { background:transparent; border:none; cursor:pointer; display:flex; align-items:center; gap:4px; padding:4px 8px; border-radius:4px; transition:all 0.2s; }
        .yorum-begen-btn:hover { background:rgba(212,83,126,0.1); }
      `}</style>

      {/* RAPOR MODAL */}
      {raporModalAcik && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center'}}
          onClick={e => { if (e.target === e.currentTarget) setRaporModalAcik(false) }}>
          <div style={{background:'linear-gradient(145deg,#12101a,#1a1228)', border:'1px solid rgba(201,169,110,0.2)', borderRadius:'16px', padding:'32px', width:'90%', maxWidth:'480px'}}>
            {raporGonderildi ? (
              <div style={{textAlign:'center', padding:'20px'}}>
                <div style={{fontSize:'40px', marginBottom:'12px'}}>✅</div>
                <div style={{fontFamily:'Cinzel, serif', color:'#c9a96e', letterSpacing:'1px'}}>Raporunuz alındı!</div>
                <div style={{fontSize:'13px', color:'#666', fontFamily:'EB Garamond, serif', marginTop:'8px'}}>İnceleme ekibimiz değerlendirecek.</div>
              </div>
            ) : (
              <>
                <div style={{fontSize:'11px', color:'#c9a96e', letterSpacing:'3px', fontFamily:'Cinzel, serif', marginBottom:'20px'}}>⚠ KARAKTERI RAPORLA</div>
                {['Uygunsuz içerik', 'Telif hakkı ihlali', 'Spam veya yanıltıcı', 'Nefret söylemi', 'Diğer'].map(sebep => (
                  <div key={sebep} onClick={() => setRaporSebep(sebep)}
                    style={{display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', borderRadius:'8px', cursor:'pointer', border:`1px solid ${raporSebep === sebep ? 'rgba(192,57,43,0.4)' : 'rgba(255,255,255,0.05)'}`, marginBottom:'8px', background: raporSebep === sebep ? 'rgba(192,57,43,0.08)' : 'transparent', transition:'all 0.2s'}}>
                    <div style={{width:'16px', height:'16px', borderRadius:'50%', border:`2px solid ${raporSebep === sebep ? '#c0392b' : '#555'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                      {raporSebep === sebep && <div style={{width:'8px', height:'8px', borderRadius:'50%', background:'#c0392b'}}/>}
                    </div>
                    <span style={{fontSize:'14px', color: raporSebep === sebep ? '#e74c3c' : '#aaa', fontFamily:'EB Garamond, serif'}}>{sebep}</span>
                  </div>
                ))}
                <textarea placeholder="Ek açıklama (opsiyonel)..." value={raporAciklama} onChange={e => setRaporAciklama(e.target.value)}
                  style={{width:'100%', padding:'12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(201,169,110,0.15)', borderRadius:'8px', color:'white', fontSize:'13px', fontFamily:'EB Garamond, serif', resize:'none', minHeight:'80px', boxSizing:'border-box', marginTop:'8px', marginBottom:'16px', outline:'none'}}/>
                <div style={{display:'flex', gap:'10px'}}>
                  <button onClick={raporGonder} disabled={!raporSebep}
                    style={{flex:1, padding:'12px', background: raporSebep ? 'rgba(192,57,43,0.8)' : 'rgba(192,57,43,0.3)', border:'none', borderRadius:'8px', color:'white', cursor: raporSebep ? 'pointer' : 'not-allowed', fontFamily:'Cinzel, serif', fontSize:'12px', letterSpacing:'1px'}}>
                    RAPORLA
                  </button>
                  <button onClick={() => setRaporModalAcik(false)}
                    style={{padding:'12px 20px', background:'transparent', border:'1px solid rgba(201,169,110,0.3)', borderRadius:'8px', color:'#c9a96e', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:'12px', letterSpacing:'1px'}}>
                    İptal
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 48px', borderBottom:'1px solid rgba(201,169,110,0.2)', background:'rgba(10,10,15,0.9)', backdropFilter:'blur(10px)', position:'sticky', top:0, zIndex:100, boxShadow:'0 4px 30px rgba(0,0,0,0.5)'}}>
        <a href="/" style={{fontSize:'24px', fontFamily:'Cinzel, serif', fontWeight:'700', letterSpacing:'2px', textDecoration:'none', color:'white'}}>
          char<span style={{color:'#7F77DD'}}>faces</span>
        </a>
        {kullanici && (
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <BildirimZili kullaniciId={kullanici.id} />
            <button onClick={() => router.push('/profil')} style={{background:'transparent', border:'1px solid rgba(201,169,110,0.4)', color:'#c9a96e', padding:'10px 20px', borderRadius:'6px', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:'13px', letterSpacing:'0.5px', transition:'all 0.3s ease'}}
              onMouseEnter={e => e.target.style.background='rgba(201,169,110,0.1)'}
              onMouseLeave={e => e.target.style.background='transparent'}>
              {kullanici.email?.split('@')[0]}
            </button>
          </div>
        )}
      </nav>

      <div style={{maxWidth:'780px', margin:'0 auto', padding:'48px 32px'}}>
        {karakter.gorsel_url && (
          <div style={{position:'relative', marginBottom:'32px', borderRadius:'16px', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.6)', border:'1px solid rgba(201,169,110,0.15)'}}>
            <img src={karakter.gorsel_url} style={{width:'100%', maxHeight:'480px', objectFit:'cover', display:'block'}}/>
            <div style={{position:'absolute', bottom:0, left:0, right:0, height:'120px', background:'linear-gradient(to top, #0a0a0f, transparent)'}}/>
          </div>
        )}

        <div style={{background:'linear-gradient(145deg, #12101a, #1a1228)', border:'1px solid rgba(201,169,110,0.15)', borderRadius:'16px', padding:'32px', marginBottom:'32px', boxShadow:'0 8px 32px rgba(0,0,0,0.4)', position:'relative'}}>
          <div style={{position:'absolute', left:0, top:0, bottom:0, width:'4px', background:'linear-gradient(to bottom, #7F77DD, #c9a96e)', opacity:0.6, borderRadius:'16px 0 0 16px'}}/>

          {duzenle ? (
            <div>
              <div style={{fontSize:'11px', color:'#c9a96e', letterSpacing:'2px', fontFamily:'Cinzel, serif', marginBottom:'16px'}}>DÜZENLEME MODU</div>
              <input className="input-field" value={duzenleAdi} onChange={e => setDuzenleAdi(e.target.value)} placeholder="Karakter adı"/>
              <input className="input-field" value={duzenleKitap} onChange={e => setDuzenleKitap(e.target.value)} placeholder="Kitap adı"/>
              <textarea className="input-field" value={duzenleAciklama} onChange={e => setDuzenleAciklama(e.target.value)} placeholder="Açıklama" style={{minHeight:'100px', resize:'vertical'}}/>
              <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                <button className="btn-primary" onClick={karakterGuncelle}>Kaydet</button>
                <button className="btn-ghost" onClick={() => setDuzenle(false)}>İptal</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{marginBottom:'20px'}}>
                <h1 style={{fontSize:'36px', fontWeight:'700', fontFamily:'Cinzel, serif', letterSpacing:'2px', marginBottom:'8px', textShadow:'0 0 30px rgba(127,119,221,0.3)'}}>
                  {karakter.karakter_adi}
                </h1>
                <div onClick={() => router.push(`/kitap/${encodeURIComponent(karakter.kitap_adi)}`)}
                  style={{fontSize:'14px', color:'#c9a96e', fontFamily:'EB Garamond, serif', fontStyle:'italic', marginBottom:'12px', cursor:'pointer', textDecoration:'underline', textDecorationColor:'rgba(201,169,110,0.3)'}}>
                  {karakter.kitap_adi}
                </div>
                {etiketler.length > 0 && (
                  <div style={{display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'16px'}}>
                    {etiketler.map(e => (
                      <span key={e} className="etiket-chip" onClick={() => router.push(`/?etiket=${encodeURIComponent(e)}`)}>{e}</span>
                    ))}
                  </div>
                )}
                {karakter.aciklama && <p style={{fontSize:'16px', color:'#aaa', lineHeight:'1.8', fontFamily:'EB Garamond, serif'}}>{karakter.aciklama}</p>}
              </div>

              <div style={{display:'flex', alignItems:'center', gap:'12px', margin:'20px 0'}}>
                <div style={{flex:1, height:'1px', background:'rgba(201,169,110,0.15)'}}/>
                <span style={{color:'#c9a96e', fontSize:'10px', opacity:0.6}}>✦</span>
                <div style={{flex:1, height:'1px', background:'rgba(201,169,110,0.15)'}}/>
              </div>

              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px'}}>
                <div style={{display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap'}}>
                  <button onClick={toggleBegeni} className={`begeni-btn ${begendi ? 'begendi' : ''}`}>
                    <span style={{fontSize:'18px'}}>{begendi ? '❤️' : '🤍'}</span>
                    <span style={{fontSize:'14px'}}>{begeniSayisi}</span>
                    <span style={{fontSize:'11px', color:'#888'}}>BEĞENİ</span>
                  </button>

                  {kullanici && (
                    <div style={{position:'relative'}}>
                      <button className="btn-ghost" onClick={() => setKoleksiyonMenuAcik(prev => !prev)}>📚 Koleksiyona Ekle</button>
                      {koleksiyonMenuAcik && (
                        <div className="koleksiyon-menu">
                          {koleksiyonlar.length === 0 ? (
                            <div style={{padding:'12px', textAlign:'center'}}>
                              <div style={{fontSize:'13px', color:'#555', fontFamily:'EB Garamond, serif', fontStyle:'italic', marginBottom:'8px'}}>Liste yok</div>
                              <button onClick={() => router.push('/koleksiyonlar')} style={{background:'linear-gradient(135deg,#7F77DD,#9d77dd)', border:'none', color:'white', padding:'8px 14px', borderRadius:'6px', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:'11px'}}>Liste Oluştur</button>
                            </div>
                          ) : koleksiyonlar.map(k => (
                            <div key={k.id} className="koleksiyon-item" onClick={() => koleksiyonaToggle(k.id)}>
                              <span style={{fontSize:'16px'}}>{eklenenKoleksiyonlar[k.id] ? '✅' : '○'}</span>
                              <span>{k.ad}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{position:'relative'}}>
                    <button className="btn-ghost" onClick={nativePaylas} style={{display:'flex', alignItems:'center', gap:'6px'}}>
                      {kopyalandi ? '✓ Kopyalandı!' : '🔗 Paylaş'}
                    </button>
                    {paylasMenuAcik && (
                      <div className="paylas-menu">
                        <div className="paylas-item" onClick={twitterPaylas}><span style={{fontSize:'16px'}}>🐦</span> Twitter / X</div>
                        <div className="paylas-item" onClick={whatsappPaylas}><span style={{fontSize:'16px'}}>💬</span> WhatsApp</div>
                        <div className="paylas-item" onClick={linkKopyala}><span style={{fontSize:'16px'}}>🔗</span> Linki Kopyala</div>
                      </div>
                    )}
                  </div>

                  {benimKarakterim && (
                    <>
                      <button className="btn-ghost" onClick={() => setDuzenle(true)}>✎ Düzenle</button>
                      {silOnay ? (
                        <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                          <span style={{fontSize:'12px', color:'#888', fontFamily:'EB Garamond, serif'}}>Emin misin?</span>
                          <button className="btn-danger" onClick={karakterSil}>Evet, Sil</button>
                          <button className="btn-ghost" onClick={() => setSilOnay(false)}>İptal</button>
                        </div>
                      ) : (
                        <button className="btn-danger" onClick={() => setSilOnay(true)}>🗑 Sil</button>
                      )}
                    </>
                  )}

                  {kullanici && !benimKarakterim && (
                    <button onClick={() => setRaporModalAcik(true)}
                      style={{background:'transparent', border:'none', color:'#555', cursor:'pointer', fontSize:'12px', fontFamily:'Cinzel, serif', letterSpacing:'1px', padding:'10px', transition:'color 0.2s'}}
                      onMouseEnter={e => e.target.style.color='#c0392b'}
                      onMouseLeave={e => e.target.style.color='#555'}>
                      🚩 Raporla
                    </button>
                  )}
                </div>

                <button onClick={() => router.push(`/profil/${karakter.kullanici_id}`)}
                  style={{background:'transparent', border:'none', color:'#555', cursor:'pointer', fontSize:'12px', fontFamily:'Cinzel, serif', letterSpacing:'1px', transition:'color 0.2s'}}
                  onMouseEnter={e => e.target.style.color='#c9a96e'}
                  onMouseLeave={e => e.target.style.color='#555'}>
                  Ekleyen: {karakter.kullanici_email?.split('@')[0]}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* YORUMLAR */}
        <div style={{marginBottom:'48px'}}>
          <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px'}}>
            <div style={{width:'30px', height:'1px', background:'rgba(201,169,110,0.4)'}}/>
            <h2 style={{fontSize:'11px', fontWeight:'600', color:'#c9a96e', letterSpacing:'3px', fontFamily:'Cinzel, serif'}}>YORUMLAR ({yorumlar.length})</h2>
            <div style={{flex:1, height:'1px', background:'rgba(201,169,110,0.2)'}}/>
          </div>

          {kullanici ? (
            <div style={{marginBottom:'24px', display:'flex', gap:'10px'}}>
              <input type="text" placeholder="Yorumunu yaz..." value={yeniYorum} onChange={e => setYeniYorum(e.target.value)} onKeyDown={e => e.key === 'Enter' && yorumEkle()} className="yorum-input"/>
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
                <div style={{fontSize:'15px', color:'#bbb', fontFamily:'EB Garamond, serif', lineHeight:'1.6', marginBottom:'8px'}}>{y.yorum}</div>
                {/* YORUM BEĞENİ BUTONU */}
                <div style={{display:'flex', justifyContent:'flex-end'}}>
                  <button className="yorum-begen-btn" onClick={() => yorumBegen(y.id)}>
                    <span style={{fontSize:'13px'}}>{yorumBegenileri[y.id] ? '❤️' : '🤍'}</span>
                    <span style={{fontSize:'12px', color: yorumBegenileri[y.id] ? '#D4537E' : '#555', fontFamily:'Cinzel, serif'}}>
                      {yorumBegeniSayilari[y.id] || 0}
                    </span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* BENZERLERİ DE BEĞENEBİLİRSİN */}
        {benzerKarakterler.length > 0 && (
          <div>
            <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px'}}>
              <div style={{width:'30px', height:'1px', background:'rgba(201,169,110,0.4)'}}/>
              <h2 style={{fontSize:'11px', fontWeight:'600', color:'#c9a96e', letterSpacing:'3px', fontFamily:'Cinzel, serif'}}>
                {benzerKarakterler[0]?.kitap_adi === karakter.kitap_adi ? `${karakter.kitap_adi} KİTABINDAN` : 'BUNLARI DA BEĞENEBİLİRSİN'}
              </h2>
              <div style={{flex:1, height:'1px', background:'rgba(201,169,110,0.2)'}}/>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'16px'}}>
              {benzerKarakterler.map(k => (
                <div key={k.id} className="benzer-kart" onClick={() => router.push(`/karakter/${k.id}`)}>
                  <div style={{position:'absolute', left:0, top:0, bottom:0, width:'3px', background:'linear-gradient(to bottom, #7F77DD, #c9a96e)', opacity:0.5}}/>
                  <div style={{display:'flex', gap:'12px', padding:'14px 14px 14px 18px'}}>
                    <div style={{width:'60px', height:'80px', borderRadius:'6px', overflow:'hidden', flexShrink:0, background:'rgba(127,119,221,0.1)'}}>
                      {k.gorsel_url ? <img src={k.gorsel_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px'}}>📖</div>}
                    </div>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontSize:'13px', fontFamily:'Cinzel, serif', fontWeight:'600', marginBottom:'4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{k.karakter_adi}</div>
                      <div style={{fontSize:'11px', color:'#c9a96e', fontFamily:'EB Garamond, serif', fontStyle:'italic', marginBottom:'6px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{k.kitap_adi}</div>
                      <div style={{fontSize:'12px', color:'#D4537E'}}>❤️ {k.begeniler?.[0]?.count || 0}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer style={{textAlign:'center', padding:'32px', borderTop:'1px solid rgba(201,169,110,0.1)', color:'#444', fontSize:'12px', fontFamily:'Cinzel, serif', letterSpacing:'2px'}}>
        <span style={{color:'#c9a96e', opacity:0.6}}>✦</span> &nbsp; CHARFACES &nbsp; <span style={{color:'#c9a96e', opacity:0.6}}>✦</span>
      </footer>
    </main>
  )
}
``