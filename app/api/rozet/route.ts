// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ROZETLER = [
  { tip: 'ilk_adim', emoji: '🌱', ad: 'İlk Adım', aciklama: 'İlk karakterini ekledin!' },
  { tip: 'hikaye_anlatici', emoji: '📚', ad: 'Hikaye Anlatıcı', aciklama: '5 karakter ekledin!' },
  { tip: 'yildiz', emoji: '🌟', ad: 'Yıldız', aciklama: '10 karakter ekledin!' },
  { tip: 'sevilen', emoji: '❤️', ad: 'Sevilen', aciklama: 'Toplam 10 beğeni aldın!' },
  { tip: 'populer', emoji: '🔥', ad: 'Popüler', aciklama: 'Toplam 50 beğeni aldın!' },
  { tip: 'efsane', emoji: '💎', ad: 'Efsane', aciklama: 'Toplam 100 beğeni aldın!' },
  { tip: 'sosyal', emoji: '💬', ad: 'Sosyal', aciklama: '10 yorum yaptın!' },
  { tip: 'takipci_ustasi', emoji: '👥', ad: 'Takipçi Ustası', aciklama: '10 takipçiye ulaştın!' },
]

export async function POST(req: NextRequest) {
  const { kullanici_id } = await req.json()
  if (!kullanici_id) return NextResponse.json({ error: 'kullanici_id gerekli' }, { status: 400 })

  const yeniRozetler = []

  // Karakter sayısı
  const { count: karakterSayisi } = await supabase
    .from('karakterler').select('*', { count: 'exact', head: true }).eq('kullanici_id', kullanici_id)

  // Toplam beğeni
  const { data: karakterler } = await supabase
    .from('karakterler').select('id').eq('kullanici_id', kullanici_id)
  
  let toplamBegeni = 0
  if (karakterler && karakterler.length > 0) {
    const ids = karakterler.map(k => k.id)
    const { count } = await supabase
      .from('begeniler').select('*', { count: 'exact', head: true }).in('karakter_id', ids)
    toplamBegeni = count || 0
  }

  // Yorum sayısı
  const { count: yorumSayisi } = await supabase
    .from('yorumlar').select('*', { count: 'exact', head: true }).eq('kullanici_id', kullanici_id)

  // Takipçi sayısı
  const { count: takipciSayisi } = await supabase
    .from('follows').select('*', { count: 'exact', head: true }).eq('following_id', kullanici_id)

  // Mevcut rozetler
  const { data: mevcutRozetler } = await supabase
    .from('rozetler').select('rozet_tipi').eq('kullanici_id', kullanici_id)
  const mevcutTipler = (mevcutRozetler || []).map(r => r.rozet_tipi)

  // Rozet kontrolü
  const kontroller = [
    { tip: 'ilk_adim', kosul: karakterSayisi >= 1 },
    { tip: 'hikaye_anlatici', kosul: karakterSayisi >= 5 },
    { tip: 'yildiz', kosul: karakterSayisi >= 10 },
    { tip: 'sevilen', kosul: toplamBegeni >= 10 },
    { tip: 'populer', kosul: toplamBegeni >= 50 },
    { tip: 'efsane', kosul: toplamBegeni >= 100 },
    { tip: 'sosyal', kosul: (yorumSayisi || 0) >= 10 },
    { tip: 'takipci_ustasi', kosul: (takipciSayisi || 0) >= 10 },
  ]

  for (const kontrol of kontroller) {
    if (kontrol.kosul && !mevcutTipler.includes(kontrol.tip)) {
      await supabase.from('rozetler').insert({ kullanici_id, rozet_tipi: kontrol.tip })
      const rozet = ROZETLER.find(r => r.tip === kontrol.tip)
      if (rozet) yeniRozetler.push(rozet)
    }
  }

  return NextResponse.json({ yeniRozetler, toplamBegeni, karakterSayisi })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const kullanici_id = searchParams.get('kullanici_id')
  if (!kullanici_id) return NextResponse.json({ rozetler: [] })

  const { data } = await supabase
    .from('rozetler').select('rozet_tipi, created_at').eq('kullanici_id', kullanici_id)

  const rozetler = (data || []).map(r => {
    const rozet = ROZETLER.find(x => x.tip === r.rozet_tipi)
    return { ...rozet, kazanildi: r.created_at }
  }).filter(Boolean)

  return NextResponse.json({ rozetler })
}