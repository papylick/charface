// @ts-nocheck
'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function Ayarlar() {
  const router = useRouter()
  const [kullanici, setKullanici] = useState(null)
  const [profil, setProfil] = useState(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [aktifBolum, setAktifBolum] = useState('hesap')
  const [yeniKullaniciAdi, setYeniKullaniciAdi] = useState('')
  const [kullaniciAdiMesaj, setKullaniciAdiMesaj] = useState('')
  const [mevcutSifre, setMevcutSifre] = useState('')
  const [yeniSifre, setYeniSifre] = useState('')
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState('')
  const [sifreMesaj, setSifreMesaj] = useState('')
  const [silOnay, setSilOnay] = useState('')
  const [silMesaj, setSilMesaj] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [avatarYukleniyor, setAvatarYukleniyor] = useState(false)
  const [avatarMesaj, setAvatarMesaj] = useState('')
  const avatarInputRef = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/giris'); return }
      setKullanici(data.user)
      const { data: profilData } = await supabase
        .from('profiller').select('*').eq('id', data.user.id).single()
      setProfil(profilData)
      setYeniKullaniciAdi(profilData?.kullanici_adi || '')
      setAvatarUrl(profilData?.avatar_url || null)
      setYukleniyor(false)
    })
  }, [])

  async function avatarYukle(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setAvatarMesaj('Dosya 2MB\'dan küçük olmalı!'); return }

    setAvatarYukleniyor(true)
    setAvatarMesaj('')

    const dosyaAdi = `${kullanici.id}/avatar.${file.name.split('.').pop()}`

    // Önce eskiyi sil
    await supabase.storage.from('avatars').remove([dosyaAdi])

    const { error: uploadError } = await supabase.storage
      .from('avatars').upload(dosyaAdi, file, { upsert: true })

    if (uploadError) { setAvatarMesaj('Yükleme hatası!'); setAvatarYukleniyor(false); return }

    const { data } = supabase.storage.from('avatars').getPublicUrl(dosyaAdi)
    const url = data.publicUrl + '?t=' + Date.now()

    await supabase.from('profiller').update({ avatar_url: data.publicUrl }).eq('id', kullanici.id)

    setAvatarUrl(url)
    setAvatarMesaj('✓ Profil fotoğrafı güncellendi!')
    setTimeout(() => setAvatarMesaj(''), 3000)
    setAvatarYukleniyor(false)
  }

  async function avatarSil() {
    setAvatarYukleniyor(true)
    const dosyaAdi = `${kullanici.id}/avatar.jpg`
    await supabase.storage.from('avatars').remove([dosyaAdi])
    await supabase.from('profiller').update({ avatar_url: null }).eq('id', kullanici.id)
    setAvatarUrl(null)
    setAvatarMesaj('✓ Profil fotoğrafı kaldırıldı!')
    setTimeout(() => setAvatarMesaj(''), 3000)
    setAvatarYukleniyor(false)
  }

  async function kullaniciAdiGuncelle() {
    if (!yeniKullaniciAdi.trim()) { setKullaniciAdiMesaj('Kullanıcı adı boş olamaz!'); return }
    const { data: mevcut } = await supabase.from('profiller').select('id')
      .eq('kullanici_adi', yeniKullaniciAdi.trim().toLowerCase()).single()
    if (mevcut && mevcut.id !== kullanici.id) { setKullaniciAdiMesaj('Bu kullanıcı adı alınmış!'); return }
    const { error } = await supabase.from('profiller')
      .update({ kullanici_adi: yeniKullaniciAdi.trim().toLowerCase() }).eq('id', kullanici.id)
    if (error) { setKullaniciAdiMesaj('Hata: ' + error.message); return }
    setKullaniciAdiMesaj('✓ Kullanıcı adı güncellendi!')
    setTimeout(() => setKullaniciAdiMesaj(''), 3000)
  }

  async function sifreGuncelle() {
    if (!yeniSifre) { setSifreMesaj('Yeni şifre boş olamaz!'); return }
    if (yeniSifre !== yeniSifreTekrar) { setSifreMesaj('Şifreler eşleşmiyor!'); return }
    if (yeniSifre.length < 6) { setSifreMesaj('Şifre en az 6 karakter olmalı!'); return }
    const { error } = await supabase.auth.updateUser({ password: yeniSifre })
    if (error) { setSifreMesaj('Hata: ' + error.message); return }
    setSifreMesaj('✓ Şifre güncellendi!')
    setYeniSifre(''); setYeniSifreTekrar('')
    setTimeout(() => setSifreMesaj(''), 3000)
  }

  async function sifreSifirla() {
    const { error } = await supabase.auth.resetPasswordForEmail(kullanici.email)
    if (error) { setSifreMesaj('Hata: ' + error.message); return }
    setSifreMesaj('✓ Şifre sıfırlama linki emailine gönderildi!')
  }

  async function hesapSil() {
    if (silOnay !== kullanici.email) { setSilMesaj('Email adresi eşleşmiyor!'); return }
    await supabase.from('karakterler').delete().eq('kullanici_id', kullanici.id)
    await supabase.from('profiller').delete().eq('id', kullanici.id)
    await supabase.auth.signOut()
    router.push('/')
  }

  if (yukleniyor) return (
    <main style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{color:'#c9a96e', fontFamily:'Cinzel, serif', letterSpacing:'3px', fontSize:'13px'}}>YÜKLENİYOR...</div>
    </main>
  )

  const bolumler = [
    { id: 'hesap', label: 'Hesap Bilgileri', icon: '👤' },
    { id: 'sifre', label: 'Şifre & Güvenlik', icon: '🔒' },
    { id: 'sil', label: 'Hesabı Sil', icon: '⚠️' },
  ]

  const AvatarBolumu = () => (
    <div style={{background:'linear-gradient(145deg, #12101a, #1a1228)', border:'1px solid rgba(201,169,110,0.15)', borderRadius:'12px', padding:'24px', marginBottom:'20px', position:'relative', overflow:'hidden'}}>
      <div style={{position:'absolute', left:0, top:0, bottom:0, width:'3px', background:'linear-gradient(to bottom, #7F77DD, #c9a96e)', opacity:0.6}}/>
      <div style={{fontSize:'10px', color:'#c9a96e', letterSpacing:'2px', fontFamily:'Cinzel, serif', marginBottom:'20px'}}>PROFİL FOTOĞRAFI</div>

      <div style={{display:'flex', alignItems:'center', gap:'24px', flexWrap:'wrap'}}>
        {/* Avatar göster */}
        <div style={{position:'relative', flexShrink:0}}>
          <div style={{width:'96px', height:'96px', borderRadius:'50%', overflow:'hidden', border:'2px solid rgba(201,169,110,0.3)', background:'linear-gradient(135deg, #7F77DD, #c9a96e)', display:'flex', alignItems:'center', justifyContent:'center'}}>
            {avatarUrl ? (
              <img src={avatarUrl} style={{width:'100%', height:'100%', objectFit:'cover'}}
                onError={() => setAvatarUrl(null)}/>
            ) : (
              <span style={{fontSize:'36px', fontFamily:'Cinzel, serif', fontWeight:'700', color:'white'}}>
                {(profil?.kullanici_adi || kullanici?.email)?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          {avatarYukleniyor && (
            <div style={{position:'absolute', inset:0, borderRadius:'50%', background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <span style={{color:'#c9a96e', fontSize:'20px', animation:'spin 1s linear infinite', display:'inline-block'}}>✦</span>
            </div>
          )}
        </div>

        {/* Butonlar */}
        <div style={{flex:1}}>
          <div style={{fontSize:'13px', color:'#888', fontFamily:'EB Garamond, serif', fontStyle:'italic', marginBottom:'14px'}}>
            JPG, PNG veya GIF · Max 2MB · Kare görsel önerilir
          </div>
          <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
            <button onClick={() => avatarInputRef.current?.click()}
              style={{background:'linear-gradient(135deg, rgba(127,119,221,0.3), rgba(201,169,110,0.2))', border:'1px solid rgba(201,169,110,0.4)', color:'#c9a96e', padding:'10px 20px', borderRadius:'8px', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:'11px', letterSpacing:'1px', transition:'all 0.3s'}}>
              📷 Fotoğraf Yükle
            </button>
            {avatarUrl && (
              <button onClick={avatarSil}
                style={{background:'transparent', border:'1px solid rgba(192,57,43,0.3)', color:'#c0392b', padding:'10px 20px', borderRadius:'8px', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:'11px', letterSpacing:'1px', transition:'all 0.3s'}}>
                🗑 Kaldır
              </button>
            )}
          </div>
          <input ref={avatarInputRef} type="file" accept="image/*" onChange={avatarYukle} style={{display:'none'}}/>
          {avatarMesaj && (
            <div style={{fontSize:'12px', color: avatarMesaj.includes('✓') ? '#c9a96e' : '#ff8080', fontFamily:'EB Garamond, serif', fontStyle:'italic', marginTop:'10px'}}>
              {avatarMesaj}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <main style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)', color:'white', fontFamily:'Georgia, serif'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        .input-field { width:100%; padding:12px 16px; background:rgba(255,255,255,0.03); border:1px solid rgba(201,169,110,0.2); border-radius:8px; color:white; font-size:14px; box-sizing:border-box; font-family:'EB Garamond',serif; transition:all 0.3s ease; }
        .input-field:focus { outline:none; border-color:rgba(201,169,110,0.6); background:rgba(255,255,255,0.05); }
        .input-field::placeholder { color:#444; }
        .btn-primary { background:linear-gradient(135deg,#7F77DD,#9d77dd); border:none; color:white; padding:10px 24px; border-radius:6px; cursor:pointer; font-family:'Cinzel',serif; font-size:12px; letter-spacing:1px; transition:all 0.3s ease; box-shadow:0 4px 15px rgba(127,119,221,0.3); }
        .btn-primary:hover { transform:translateY(-2px); }
        .btn-danger { background:linear-gradient(135deg,#8b0000,#c0392b); border:none; color:white; padding:10px 24px; border-radius:6px; cursor:pointer; font-family:'Cinzel',serif; font-size:12px; letter-spacing:1px; transition:all 0.3s ease; }
        .btn-danger:hover { transform:translateY(-2px); }
        .btn-ghost { background:transparent; border:1px solid rgba(201,169,110,0.3); color:#c9a96e; padding:10px 24px; border-radius:6px; cursor:pointer; font-family:'Cinzel',serif; font-size:12px; letter-spacing:1px; transition:all 0.3s ease; }
        .btn-ghost:hover { background:rgba(201,169,110,0.1); }
        .menu-item { display:flex; align-items:center; gap:12px; padding:14px 20px; border-radius:10px; cursor:pointer; transition:all 0.2s ease; border:1px solid transparent; }
        .menu-item:hover { background:rgba(255,255,255,0.03); border-color:rgba(201,169,110,0.1); }
        .menu-item.aktif { background:rgba(127,119,221,0.1); border-color:rgba(127,119,221,0.3); }
        .label { font-size:10px; color:#c9a96e; display:block; margin-bottom:8px; font-family:'Cinzel',serif; letter-spacing:2px; }
        .bolum-baslik { font-size:18px; font-family:'Cinzel',serif; font-weight:600; letter-spacing:1px; margin-bottom:8px; }
        .bolum-aciklama { font-size:13px; color:#555; font-family:'EB Garamond',serif; font-style:italic; margin-bottom:28px; }
        .ayrac { height:1px; background:rgba(201,169,110,0.1); margin:24px 0; }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @media (max-width:768px) {
          .ayarlar-layout { flex-direction:column !important; }
          .menu-panel { width:100% !important; border-right:none !important; border-bottom:1px solid rgba(201,169,110,0.1) !important; padding:16px !important; }
          .icerik-panel { padding:24px 16px !important; }
          .menu-list { display:flex !important; flex-wrap:wrap !important; gap:8px !important; }
          .menu-item { padding:10px 14px !important; }
        }
      `}</style>

      <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 48px', borderBottom:'1px solid rgba(201,169,110,0.2)', background:'rgba(10,10,15,0.9)', backdropFilter:'blur(10px)', position:'sticky', top:0, zIndex:100}}>
        <a href="/" style={{fontSize:'24px', fontFamily:'Cinzel, serif', fontWeight:'700', letterSpacing:'2px', textDecoration:'none', color:'white'}}>
          char<span style={{color:'#7F77DD'}}>faces</span>
        </a>
        <button onClick={() => router.push('/profil')} style={{background:'transparent', border:'1px solid rgba(201,169,110,0.3)', color:'#c9a96e', padding:'8px 16px', borderRadius:'6px', cursor:'pointer', fontFamily:'Cinzel, serif', fontSize:'12px', letterSpacing:'1px'}}>
          ← Profile Dön
        </button>
      </nav>

      <div className="ayarlar-layout" style={{display:'flex', maxWidth:'900px', margin:'0 auto', minHeight:'calc(100vh - 80px)'}}>
        <div className="menu-panel" style={{width:'240px', flexShrink:0, borderRight:'1px solid rgba(201,169,110,0.1)', padding:'32px 20px'}}>
          <div style={{fontSize:'11px', color:'#555', letterSpacing:'3px', fontFamily:'Cinzel, serif', marginBottom:'16px'}}>AYARLAR</div>
          <div className="menu-list">
            {bolumler.map(b => (
              <div key={b.id} className={`menu-item ${aktifBolum === b.id ? 'aktif' : ''}`} onClick={() => setAktifBolum(b.id)}>
                <span style={{fontSize:'16px'}}>{b.icon}</span>
                <span style={{fontSize:'13px', fontFamily:'Cinzel, serif', letterSpacing:'0.5px', color: aktifBolum === b.id ? 'white' : '#888'}}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="icerik-panel" style={{flex:1, padding:'32px 40px'}}>
          {aktifBolum === 'hesap' && (
            <div>
              <div className="bolum-baslik">Hesap Bilgileri</div>
              <div className="bolum-aciklama">Profil fotoğrafını ve kullanıcı adını düzenle</div>

              <AvatarBolumu/>

              <div style={{background:'linear-gradient(145deg, #12101a, #1a1228)', border:'1px solid rgba(201,169,110,0.15)', borderRadius:'12px', padding:'24px', position:'relative', overflow:'hidden'}}>
                <div style={{position:'absolute', left:0, top:0, bottom:0, width:'3px', background:'linear-gradient(to bottom, #7F77DD, #c9a96e)', opacity:0.6}}/>
                <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px'}}>
                  <div style={{width:'48px', height:'48px', borderRadius:'50%', overflow:'hidden', border:'2px solid rgba(201,169,110,0.2)', background:'linear-gradient(135deg, #7F77DD, #c9a96e)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                    {avatarUrl ? (
                      <img src={avatarUrl} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                    ) : (
                      <span style={{fontSize:'20px', fontFamily:'Cinzel, serif', fontWeight:'700', color:'white'}}>
                        {(profil?.kullanici_adi || kullanici?.email)?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div style={{fontSize:'16px', fontFamily:'Cinzel, serif', fontWeight:'600'}}>{profil?.kullanici_adi || kullanici?.email?.split('@')[0]}</div>
                    <div style={{fontSize:'12px', color:'#555', fontFamily:'EB Garamond, serif', fontStyle:'italic'}}>{kullanici?.email}</div>
                  </div>
                </div>
                <div className="ayrac"/>
                <div style={{marginBottom:'16px'}}>
                  <label className="label">KULLANICI ADI</label>
                  <input className="input-field" value={yeniKullaniciAdi}
                    onChange={e => setYeniKullaniciAdi(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false}
                    placeholder="kullanici_adi"/>
                  <div style={{fontSize:'11px', color:'#444', marginTop:'6px', fontFamily:'EB Garamond, serif', fontStyle:'italic'}}>Sadece harf, rakam ve _ kullanabilirsin</div>
                </div>
                {kullaniciAdiMesaj && (
                  <div style={{fontSize:'13px', color: kullaniciAdiMesaj.includes('✓') ? '#c9a96e' : '#ff8080', fontFamily:'EB Garamond, serif', fontStyle:'italic', marginBottom:'16px'}}>{kullaniciAdiMesaj}</div>
                )}
                <button className="btn-primary" onClick={kullaniciAdiGuncelle}>Kaydet</button>
              </div>
            </div>
          )}

          {aktifBolum === 'sifre' && (
            <div>
              <div className="bolum-baslik">Şifre & Güvenlik</div>
              <div className="bolum-aciklama">Şifreni güncelle veya sıfırlama linki al</div>
              <div style={{background:'linear-gradient(145deg, #12101a, #1a1228)', border:'1px solid rgba(201,169,110,0.15)', borderRadius:'12px', padding:'24px', position:'relative', overflow:'hidden'}}>
                <div style={{position:'absolute', left:0, top:0, bottom:0, width:'3px', background:'linear-gradient(to bottom, #7F77DD, #c9a96e)', opacity:0.6}}/>
                <div style={{marginBottom:'16px'}}>
                  <label className="label">YENİ ŞİFRE</label>
                  <input type="password" className="input-field" placeholder="••••••••" value={yeniSifre} onChange={e => setYeniSifre(e.target.value)}/>
                </div>
                <div style={{marginBottom:'20px'}}>
                  <label className="label">YENİ ŞİFRE (TEKRAR)</label>
                  <input type="password" className="input-field" placeholder="••••••••" value={yeniSifreTekrar} onChange={e => setYeniSifreTekrar(e.target.value)}/>
                </div>
                {sifreMesaj && (
                  <div style={{fontSize:'13px', color: sifreMesaj.includes('✓') ? '#c9a96e' : '#ff8080', fontFamily:'EB Garamond, serif', fontStyle:'italic', marginBottom:'16px'}}>{sifreMesaj}</div>
                )}
                <div style={{display:'flex', gap:'12px', flexWrap:'wrap'}}>
                  <button className="btn-primary" onClick={sifreGuncelle}>Şifreyi Güncelle</button>
                  <button className="btn-ghost" onClick={sifreSifirla}>Email ile Sıfırla</button>
                </div>
              </div>
            </div>
          )}

          {aktifBolum === 'sil' && (
            <div>
              <div className="bolum-baslik" style={{color:'#c0392b'}}>Hesabı Sil</div>
              <div className="bolum-aciklama">Bu işlem geri alınamaz. Tüm karakterlerin ve veriler silinecek.</div>
              <div style={{background:'linear-gradient(145deg, #1a0a0a, #2a1010)', border:'1px solid rgba(192,57,43,0.3)', borderRadius:'12px', padding:'24px', position:'relative', overflow:'hidden'}}>
                <div style={{position:'absolute', left:0, top:0, bottom:0, width:'3px', background:'linear-gradient(to bottom, #c0392b, #8b0000)', opacity:0.8}}/>
                <div style={{fontSize:'14px', color:'#888', fontFamily:'EB Garamond, serif', lineHeight:'1.7', marginBottom:'24px'}}>
                  Hesabını silmek istediğine emin misin? Bu işlem:
                  <ul style={{marginTop:'8px', paddingLeft:'20px', color:'#666'}}>
                    <li>Tüm karakterlerini siler</li>
                    <li>Takipçi ve takip listeni siler</li>
                    <li>Hesabını kalıcı olarak kapatır</li>
                  </ul>
                </div>
                <div style={{marginBottom:'20px'}}>
                  <label className="label" style={{color:'#c0392b'}}>ONAYLAMAK İÇİN EMAIL ADRESİNİ YAZ</label>
                  <input type="email" className="input-field" placeholder={kullanici?.email} value={silOnay}
                    onChange={e => setSilOnay(e.target.value)} style={{borderColor:'rgba(192,57,43,0.3)'}}/>
                </div>
                {silMesaj && (
                  <div style={{fontSize:'13px', color:'#ff8080', fontFamily:'EB Garamond, serif', fontStyle:'italic', marginBottom:'16px'}}>{silMesaj}</div>
                )}
                <button className="btn-danger" onClick={hesapSil}>Hesabımı Kalıcı Olarak Sil</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}