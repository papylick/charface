// @ts-nocheck
'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function KarakterDetay() {
  const params = useParams()
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
      if (data) {
        setKarakter(data)
        setBegeniSayisi(data.begeniler?.[0]?.count || 0)
      }
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
    if (!kullanici) { window.location.href = '/giris'; return }
    if (begendi) {
      await supabase.from('begeniler').delete().eq('karakter_id', id).eq('kullanici_id', kullanici.id)
      setBegendi(false)
      setBegeniSayisi(prev => Math.max(0, prev - 1))
    } else {
      await supabase.from('begeniler').insert({ karakter_id: id, kullanici_id: kullanici.id })
      setBegendi(true)
      setBegeniSayisi(prev => prev + 1)
    }
  }

  async function yorumEkle() {
    if (!kullanici) { window.location.href = '/giris'; return }
    if (!yeniYorum.trim()) return
    const { data, error } = await supabase.from('yorumlar').insert({
      karakter_id: id,
      kullanici_id: kullanici.id,
      kullanici_email: kullanici.email,
      yorum: yeniYorum
    }).select().single()
    if (!error && data) {
      setYorumlar(prev => [...prev, data])
      setYeniYorum('')
    }
  }

  if (yukleniyor) return (
    <main style={{minHeight:'100vh', background:'#0f0f0f', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif'}}>
      <div style={{color:'#888'}}>Yükleniyor...</div>
    </main>
  )

  if (!karakter) return (
    <main style={{minHeight:'100vh', background:'#0f0f0f', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif'}}>
      <div style={{color:'#888'}}>Karakter bulunamadı</div>
    </main>
  )

  return (
    <main style={{minHeight:'100vh', background:'#0f0f0f', color:'white', fontFamily:'sans-serif'}}>
      <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 32px', borderBottom:'1px solid #222'}}>
        <Link href="/" style={{fontSize:'22px', fontWeight:'600', textDecoration:'none', color:'white'}}>char<span style={{color:'#7F77DD'}}>faces</span></Link>
        {kullanici && (
          <Link href="/profil"><button style={{background:'transparent', border:'1px solid #7F77DD', color:'#7F77DD', padding:'8px 16px', borderRadius:'8px', cursor:'pointer'}}>{kullanici.email?.split('@')[0]}</button></Link>
        )}
      </nav>

      <div style={{maxWidth:'700px', margin:'0 auto', padding:'40px 32px'}}>
        
        {karakter.gorsel_url && (
          <img src={karakter.gorsel_url} style={{width:'100%', maxHeight:'400px', objectFit:'cover', borderRadius:'16px', marginBottom:'24px'}}/>
        )}

        <div style={{marginBottom:'24px'}}>
          <h1 style={{fontSize:'32px', fontWeight:'700', marginBottom:'8px'}}>{karakter.karakter_adi}</h1>
          <div style={{fontSize:'16px', color:'#888', marginBottom:'12px'}}>{karakter.kitap_adi}</div>
          {karakter.aciklama && <p style={{fontSize:'15px', color:'#aaa', lineHeight:'1.6'}}>{karakter.aciklama}</p>}
        </div>

        <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'32px', paddingBottom:'24px', borderBottom:'1px solid #222'}}>
          <button onClick={toggleBegeni} style={{background:'transparent', border:'1px solid #444', color:'white', padding:'10px 20px', borderRadius:'8px', cursor:'pointer', fontSize:'16px', display:'flex', alignItems:'center', gap:'8px'}}>
            {begendi ? '❤️' : '🤍'} {begeniSayisi} beğeni
          </button>
          <span style={{fontSize:'13px', color:'#555'}}>Ekleyen: {karakter.kullanici_email?.split('@')[0]}</span>
        </div>

        <div>
          <h2 style={{fontSize:'18px', fontWeight:'600', marginBottom:'16px'}}>Yorumlar ({yorumlar.length})</h2>
          
          {kullanici ? (
            <div style={{marginBottom:'24px', display:'flex', gap:'10px'}}>
              <input
                type="text"
                placeholder="Yorum yaz..."
                value={yeniYorum}
                onChange={e => setYeniYorum(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && yorumEkle()}
                style={{flex:1, padding:'12px', background:'#1a1a1a', border:'1px solid #333', borderRadius:'8px', color:'white', fontSize:'14px'}}
              />
              <button onClick={yorumEkle} style={{background:'#7F77DD', border:'none', color:'white', padding:'12px 20px', borderRadius:'8px', cursor:'pointer', fontWeight:'600'}}>
                Gönder
              </button>
            </div>
          ) : (
            <div style={{marginBottom:'24px', padding:'16px', background:'#1a1a1a', borderRadius:'8px', textAlign:'center'}}>
              <Link href="/giris" style={{color:'#7F77DD'}}>Yorum yapmak için giriş yap</Link>
            </div>
          )}

          {yorumlar.length === 0 ? (
            <div style={{color:'#555', textAlign:'center', padding:'32px'}}>Henüz yorum yok. İlk yorumu sen yap!</div>
          ) : (
            yorumlar.map(y => (
              <div key={y.id} style={{background:'#1a1a1a', border:'1px solid #333', borderRadius:'10px', padding:'14px 16px', marginBottom:'10px'}}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px'}}>
                  <span style={{fontSize:'13px', fontWeight:'600', color:'#7F77DD'}}>{y.kullanici_email?.split('@')[0]}</span>
                  <span style={{fontSize:'11px', color:'#555'}}>{new Date(y.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
                <div style={{fontSize:'14px', color:'#ccc'}}>{y.yorum}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}