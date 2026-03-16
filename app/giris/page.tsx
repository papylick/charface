// @ts-nocheck
'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Giris() {
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [mod, setMod] = useState('giris')
  const [mesaj, setMesaj] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)

  async function handleSubmit() {
    setYukleniyor(true)
    setMesaj('')
    if (mod === 'kayit') {
      const { error } = await supabase.auth.signUp({ email, password: sifre })
      if (error) setMesaj(error.message)
      else setMesaj('Emailini kontrol et, onay linki gönderdik!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: sifre })
      if (error) setMesaj(error.message)
      else window.location.href = '/'
    }
    setYukleniyor(false)
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #120a1a 50%, #0a0f0a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Georgia, serif', padding: '20px'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        .input-field {
          width: 100%; padding: 14px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(201,169,110,0.2);
          border-radius: 8px; color: white;
          font-size: 14px; box-sizing: border-box;
          font-family: 'EB Garamond', serif;
          transition: all 0.3s ease;
        }
        .input-field:focus {
          outline: none;
          border-color: rgba(201,169,110,0.6);
          box-shadow: 0 0 20px rgba(201,169,110,0.1);
          background: rgba(255,255,255,0.05);
        }
        .input-field::placeholder { color: #444; }
        .tab-btn {
          flex: 1; padding: 10px;
          border: none; cursor: pointer;
          font-family: 'Cinzel', serif;
          font-size: 12px; letter-spacing: 1px;
          border-radius: 6px;
          transition: all 0.3s ease;
        }
        .tab-btn.aktif {
          background: linear-gradient(135deg, #7F77DD, #9d77dd);
          color: white;
          box-shadow: 0 4px 15px rgba(127,119,221,0.3);
        }
        .tab-btn.pasif {
          background: transparent;
          color: #555;
        }
        .tab-btn.pasif:hover { color: #888; }
        .submit-btn {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #7F77DD, #9d77dd);
          border: none; border-radius: 8px; color: white;
          font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: 'Cinzel', serif; letter-spacing: 2px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(127,119,221,0.3);
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(127,119,221,0.5);
        }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.6s ease forwards; }
      `}</style>

      {/* Arka plan efektleri */}
      <div style={{position:'fixed', inset:0, pointerEvents:'none', overflow:'hidden'}}>
        <div style={{position:'absolute', top:'20%', left:'20%', width:'400px', height:'400px', background:'radial-gradient(circle, rgba(127,119,221,0.05), transparent)', borderRadius:'50%'}}/>
        <div style={{position:'absolute', bottom:'20%', right:'20%', width:'300px', height:'300px', background:'radial-gradient(circle, rgba(201,169,110,0.04), transparent)', borderRadius:'50%'}}/>
      </div>

      <div className="fade-in" style={{
        background: 'linear-gradient(145deg, #12101a, #1a1228)',
        border: '1px solid rgba(201,169,110,0.15)',
        borderRadius: '20px', padding: '48px 40px',
        width: '100%', maxWidth: '420px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Sol kitap sırt çizgisi */}
        <div style={{position:'absolute', left:0, top:0, bottom:0, width:'4px', background:'linear-gradient(to bottom, #7F77DD, #c9a96e)', opacity:0.6}}/>

        {/* Logo */}
        <div style={{textAlign:'center', marginBottom:'32px'}}>
          <a href="/" style={{fontSize:'28px', fontFamily:'Cinzel, serif', fontWeight:'700', letterSpacing:'2px', textDecoration:'none', color:'white'}}>
            char<span style={{color:'#7F77DD'}}>faces</span>
          </a>
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginTop:'12px'}}>
            <div style={{width:'30px', height:'1px', background:'linear-gradient(to right, transparent, #c9a96e)'}}/>
            <span style={{color:'#c9a96e', fontSize:'10px'}}>✦</span>
            <div style={{width:'30px', height:'1px', background:'linear-gradient(to left, transparent, #c9a96e)'}}/>
          </div>
        </div>

        {/* Sekmeler */}
        <div style={{display:'flex', marginBottom:'28px', background:'rgba(0,0,0,0.3)', borderRadius:'8px', padding:'4px', border:'1px solid rgba(201,169,110,0.1)'}}>
          <button onClick={() => { setMod('giris'); setMesaj('') }} className={`tab-btn ${mod==='giris' ? 'aktif' : 'pasif'}`}>
            GİRİŞ YAP
          </button>
          <button onClick={() => { setMod('kayit'); setMesaj('') }} className={`tab-btn ${mod==='kayit' ? 'aktif' : 'pasif'}`}>
            ÜYE OL
          </button>
        </div>

        {/* Başlık */}
        <div style={{marginBottom:'24px'}}>
          <h2 style={{fontSize:'18px', fontFamily:'Cinzel, serif', fontWeight:'600', letterSpacing:'1px', marginBottom:'4px'}}>
            {mod === 'giris' ? 'Hoş Geldin' : 'Aramıza Katıl'}
          </h2>
          <p style={{fontSize:'13px', color:'#555', fontFamily:'EB Garamond, serif', fontStyle:'italic'}}>
            {mod === 'giris' ? 'Karakterlerin seni bekliyor...' : 'Hayal ettiğin karakterleri görselleştir'}
          </p>
        </div>

        {/* Form */}
        <div style={{marginBottom:'16px'}}>
          <label style={{fontSize:'10px', color:'#c9a96e', display:'block', marginBottom:'8px', fontFamily:'Cinzel, serif', letterSpacing:'2px'}}>
            EMAIL
          </label>
          <input
            type="email"
            placeholder="ornek@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="input-field"
          />
        </div>

        <div style={{marginBottom:'28px'}}>
          <label style={{fontSize:'10px', color:'#c9a96e', display:'block', marginBottom:'8px', fontFamily:'Cinzel, serif', letterSpacing:'2px'}}>
            ŞİFRE
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={sifre}
            onChange={e => setSifre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="input-field"
          />
        </div>

        {mesaj && (
          <div style={{
            marginBottom:'20px', padding:'12px 16px',
            background: mesaj.includes('kontrol') ? 'rgba(201,169,110,0.1)' : 'rgba(255,100,100,0.1)',
            border: `1px solid ${mesaj.includes('kontrol') ? 'rgba(201,169,110,0.3)' : 'rgba(255,100,100,0.3)'}`,
            borderRadius:'8px',
            color: mesaj.includes('kontrol') ? '#c9a96e' : '#ff8080',
            fontSize:'13px', fontFamily:'EB Garamond, serif', fontStyle:'italic',
            textAlign:'center'
          }}>
            {mesaj}
          </div>
        )}

        <button onClick={handleSubmit} disabled={yukleniyor} className="submit-btn">
          {yukleniyor ? '...' : mod === 'giris' ? 'GİRİŞ YAP' : 'ÜYE OL'}
        </button>

        <div style={{marginTop:'20px', textAlign:'center'}}>
          <span style={{fontSize:'12px', color:'#444', fontFamily:'EB Garamond, serif'}}>
            {mod === 'giris' ? 'Hesabın yok mu? ' : 'Zaten üye misin? '}
          </span>
          <button onClick={() => { setMod(mod === 'giris' ? 'kayit' : 'giris'); setMesaj('') }}
            style={{background:'none', border:'none', color:'#7F77DD', cursor:'pointer', fontSize:'12px', fontFamily:'EB Garamond, serif', fontStyle:'italic', transition:'color 0.2s'}}
            onMouseEnter={e => e.target.style.color='#c9a96e'}
            onMouseLeave={e => e.target.style.color='#7F77DD'}>
            {mod === 'giris' ? 'Üye ol →' : 'Giriş yap →'}
          </button>
        </div>
      </div>
    </main>
  )
}