import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET: Kullanıcının bildirimlerini getir
export async function GET(req: Request) {
  const kullanici_id = req.headers.get('x-kullanici-id')
  if (!kullanici_id) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const { data } = await supabase
    .from('bildirimler')
    .select('*')
    .eq('kullanici_id', kullanici_id)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json(data || [])
}

// POST: Bildirim oluştur
export async function POST(req: Request) {
  const { kullanici_id, gonderen_id, tip, karakter_id } = await req.json()
  if (!kullanici_id || !gonderen_id) return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 })

  // Kendi kendine bildirim gönderme
  if (kullanici_id === gonderen_id) return NextResponse.json({ ok: true })

  await supabase.from('bildirimler').insert({
    kullanici_id,
    gonderen_id,
    tip,
    karakter_id,
    okundu: false
  })

  return NextResponse.json({ ok: true })
}

// PATCH: Tüm bildirimleri okundu yap
export async function PATCH(req: Request) {
  const { kullanici_id } = await req.json()
  if (!kullanici_id) return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 })

  await supabase
    .from('bildirimler')
    .update({ okundu: true })
    .eq('kullanici_id', kullanici_id)
    .eq('okundu', false)

  return NextResponse.json({ ok: true })
}