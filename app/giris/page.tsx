// @ts-nocheck
'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Giris() {
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [mod, setMod] = useState('giris')
  const [mesaj, setMesaj] = useState('')

  async function handleSubmit() {
    if (mod === 'kayit') {
      const { error } = await supabase.auth.signUp({ email, password: sifre })
      if (error) setMesaj(error.message)
      else setMesaj('Emailini kontrol et, onay linki gönderdik!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: sifre })
      if (error) setMesaj(error.message)
      else window.location.href = '/'
    }
  }

  return (
    <main style={{minHeight:'100vh', background:'#0f0f0f', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif'}}>
      <div style={{background:'#1a1a1a', border:'1px solid #333', borderRadius:'16px', padding:'40px', width:'100%', maxWidth:'400px'}}>
        
        <div style={{textAlign:'center', marginBottom:'32px'}}>
          <span style={{fontSize:'24px', fontWeight:'600', color:'white'}}>char<span style={{color:'#7F77DD'}}>faces</span></span>
        </div>

        <div style={{display:'flex', marginBottom:'24px', background:'#111', borderRadius:'8px', padding:'4px'}}>
          <button onClick={() => setMod('giris')} style={{flex:1, padding:'8px', borderRadius:'6px', border:'none', cursor:'pointer', background: mod==='giris' ? '#7F77DD' : 'transparent', color:'white', fontWeight:'500'}}>Giriş yap</button>
          <button onClick={() => setMod('kayit')} style={{flex:1, padding:'8px', borderRadius:'6px', border:'none', cursor:'pointer', background: mod==='kayit' ? '#7F77DD' : 'transparent', color:'white', fontWeight:'500'}}>Üye ol</button>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{width:'100%', padding:'12px', background:'#111', border:'1px solid #333', borderRadius:'8px', color:'white', marginBottom:'12px', fontSize:'14px', boxSizing:'border-box'}}
        />
        <input
          type="password"
          placeholder="Şifre"
          value={sifre}
          onChange={e => setSifre(e.target.value)}
          style={{width:'100%', padding:'12px', background:'#111', border:'1px solid #333', borderRadius:'8px', color:'white', marginBottom:'20px', fontSize:'14px', boxSizing:'border-box'}}
        />

        {mesaj && <p style={{color:'#7F77DD', fontSize:'13px', marginBottom:'16px', textAlign:'center'}}>{mesaj}</p>}

        <button onClick={handleSubmit} style={{width:'100%', padding:'12px', background:'#7F77DD', border:'none', borderRadius:'8px', color:'white', fontSize:'15px', fontWeight:'600', cursor:'pointer'}}>
          {mod === 'giris' ? 'Giriş yap' : 'Üye ol'}
        </button>

      </div>
    </main>
  )
}