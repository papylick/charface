// @ts-nocheck
'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function KullaniciProfil() {
  const params = useParams()
  const id = params.id
  const [profil, setProfil] = useState(null)
  const [karakterler, setKarakterler] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [aktifKullanici, setAktifKullanici] = useState(null)
  const [takipEdiyorMu, setTakipEdiyorMu] = useState(false)
  const [takipciSayisi, setTakipciSayisi] = useState(0)
  const [takipEdilenSayisi, setTakipEdilenSayisi] = useState(0)

  useEffect(() => {
    if (!id) return
    async function yukle() {
      const { data: { user } } = await supabase.auth.getUser()
      setAktifKullanici(user)

      const { data: profilData } = await supabase
        .from('profiller')
        .select('*')
        .eq('id', id)
        .single()
      setProfil(profilData)

      const { data: chars } = await supabase
        .from('karakterler')
        .select('*, begeniler(count)')
        .eq('kullanici_id', id)
        .order('created_at', { ascending: false })
      if (chars) setKarakterler(chars)

      const { count: takipci } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', id)
      setTakipciSayisi(takipci || 0)

      const { count: takipEdilen } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', id)
      setTakipEdilenSayisi(takipEdilen || 0)

      if (user) {
        const { data: takip } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', id)
          .single()
        setTakipEdiyorMu(!!takip)
      }

      setYukleniyor(false)
    }
    yukle()
  }, [id])

  async function takipToggle() {
    if (!aktifKullanici) { window.location.href = '/giris'; return }
    if (takipEdiyorMu) {
      await supabase.from('follows').delete()
        .eq('follower_id', aktifKullanici.id)
        .eq('following_id', id)
      setTakipEdiyorMu(false)
      setTakipciSayisi(s => s - 1)
    } else {
      await supabase.from('follows').insert({
        follower_id: aktifKullanici.id,
        following_id: id
      })
      setTakipEdiyorMu(true)
      setTakipciSayisi(s => s + 1)
    }
  }

  const renkler = ['#1a1a3e','#2d0a1a','#1a1a1a','#1a0000','#1a2d0a','#1a0a2d']

  if (yukleniyor) return (
    <main style={{minHeight:'100vh', background:'#0f0f0f', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif'}}>
      <div style={{color:'#888'}}>Yükleniyor...</div>
    </main>
  )

  return (
    <main style={{minHeight:'100vh', background:'#0f0f0f', color:'white', fontFamily:'sans-serif'}}>
      <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 32px', borderBottom:'1px solid #222'}}>
        <Link href="/" style={{fontSize:'22px', fontWeight:'600', textDecoration:'none', color:'white'}}>char<span style={{color:'#7F77DD'}}>faces</span></Link>
      </nav>

      <div style={{maxWidth:'900px', margin:'0 auto', padding:'40px 32px'}}>
        <div style={{background:'#1a1a1a', border:'1px solid #333', borderRadius:'16px', padding:'32px', marginBottom:'32px', display:'flex', alignItems:'center', gap:'24px'}}>
          <div style={{width:'80px', height:'80px', borderRadius:'50%', background:'#7F77DD', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', fontWeight:'700', flexShrink:0}}>
            {profil?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:'20px', fontWeight:'600', marginBottom:'4px'}}>{profil?.email?.split('@')[0] || 'Kullanıcı'}</div>
            <div style={{display:'flex', gap:'24px', marginTop:'12px'}}>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'24px', fontWeight:'700'}}>{karakterler.length}</div>
                <div style={{fontSize:'12px', color:'#888'}}>karakter</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'24px', fontWeight:'700'}}>{takipciSayisi}</div>
                <div style={{fontSize:'12px', color:'#888'}}>takipçi</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'24px', fontWeight:'700'}}>{takipEdilenSayisi}</div>
                <div style={{fontSize:'12px', color:'#888'}}>takip</div>
              </div>
            </div>
          </div>
          {aktifKullanici?.id !== id && (
            <button onClick={takipToggle} style={{
              background: takipEdiyorMu ? 'transparent' : '#7F77DD',
              border: takipEdiyorMu ? '1px solid #7F77DD' : 'none',
              color: 'white', padding:'10px 24px', borderRadius:'8px', cursor:'pointer', fontWeight:'600'
            }}>
              {takipEdiyorMu ? 'Takibi bırak' : 'Takip et'}
            </button>
          )}
        </div>

        <h2 style={{fontSize:'18px', fontWeight:'600', marginBottom:'20px', color:'#888'}}>
          Karakterleri ({karakterler.length})
        </h2>

        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px'}}>
          {karakterler.map((k, i) => (
            <Link key={k.id} href={`/karakter/${k.id}`} style={{textDecoration:'none', color:'white'}}>
              <div style={{background: renkler[i % renkler.length], border:'1px solid #333', borderRadius:'12px', overflow:'hidden'}}>
                <div style={{height:'200px', overflow:'hidden'}}>
                  {k.gorsel_url ? (
                    <img src={k.gorsel_url} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                  ) : (
                    <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'48px'}}>📖</div>
                  )}
                </div>
                <div style={{padding:'12px 16px'}}>
                  <div style={{fontWeight:'600', fontSize:'15px'}}>{k.karakter_adi}</div>
                  <div style={{fontSize:'12px', color:'#888', marginTop:'4px'}}>{k.kitap_adi}</div>
                  <div style={{marginTop:'8px', fontSize:'13px', color:'#D4537E'}}>❤️ {k.begeniler?.[0]?.count || 0} beğeni</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}