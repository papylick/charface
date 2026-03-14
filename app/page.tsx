export default function Home() {
  return (
    <main style={{minHeight:'100vh', background:'#0f0f0f', color:'white', fontFamily:'sans-serif'}}>
      
      {/* NAV */}
      <nav style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 32px', borderBottom:'1px solid #222'}}>
        <span style={{fontSize:'22px', fontWeight:'600'}}>char<span style={{color:'#7F77DD'}}>faces</span></span>
        <div style={{display:'flex', gap:'12px'}}>
          <button style={{background:'transparent', border:'1px solid #444', color:'white', padding:'8px 16px', borderRadius:'8px', cursor:'pointer'}}>Giriş yap</button>
          <button style={{background:'#7F77DD', border:'none', color:'white', padding:'8px 16px', borderRadius:'8px', cursor:'pointer'}}>Üye ol</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{textAlign:'center', padding:'80px 32px 40px'}}>
        <h1 style={{fontSize:'48px', fontWeight:'700', marginBottom:'16px', lineHeight:'1.2'}}>
          Kitap karakterlerini<br/>
          <span style={{color:'#7F77DD'}}>görselleştir</span>
        </h1>
        <p style={{fontSize:'18px', color:'#888', marginBottom:'32px', maxWidth:'500px', margin:'0 auto 32px'}}>
          Hayal ettiğin karakterleri AI ile üret, topluluğunla paylaş.
        </p>
        <button style={{background:'#7F77DD', border:'none', color:'white', padding:'14px 32px', borderRadius:'10px', fontSize:'16px', cursor:'pointer'}}>
          Hemen başla
        </button>
      </div>

      {/* GRID */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px', padding:'40px 32px', maxWidth:'900px', margin:'0 auto'}}>
        {[
          {isim:'Gandalf', kitap:'Yüzüklerin Efendisi', renk:'#1a1a3e', emoji:'🧙'},
          {isim:'Elizabeth Bennet', kitap:'Gurur ve Önyargı', renk:'#2d0a1a', emoji:'🌹'},
          {isim:'Geralt', kitap:'The Witcher', renk:'#1a1a1a', emoji:'⚔️'},
          {isim:'Dracula', kitap:'Dracula', renk:'#1a0000', emoji:'🧛'},
          {isim:'Katniss', kitap:'Açlık Oyunları', renk:'#1a2d0a', emoji:'🏹'},
          {isim:'Daenerys', kitap:'Buz ve Ateş Şarkısı', renk:'#1a0a2d', emoji:'🔥'},
        ].map((k, i) => (
          <div key={i} style={{background:k.renk, border:'1px solid #333', borderRadius:'12px', overflow:'hidden', cursor:'pointer'}}>
            <div style={{height:'200px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'64px'}}>
              {k.emoji}
            </div>
            <div style={{padding:'12px 16px'}}>
              <div style={{fontWeight:'600', fontSize:'15px'}}>{k.isim}</div>
              <div style={{fontSize:'12px', color:'#888', marginTop:'4px'}}>{k.kitap}</div>
            </div>
          </div>
        ))}
      </div>

    </main>
  )
}