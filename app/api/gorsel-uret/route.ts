import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function turkcedenIngilizceye(metin: string): Promise<string> {
  const res = await fetch(
    'https://router.huggingface.co/hf-inference/models/Helsinki-NLP/opus-mt-tr-en',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: metin }),
    }
  )
  if (!res.ok) return metin
  const data = await res.json()
  return data?.[0]?.translation_text || metin
}

export async function POST(request: Request) {
  const { prompt } = await request.json()

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt gerekli' }, { status: 400 })
  }

  try {
    const ingilizcePrompt = await turkcedenIngilizceye(prompt)
    const finalPrompt = `${ingilizcePrompt}, realistic portrait, cinematic lighting, highly detailed, 8k, masterpiece, dramatic atmosphere`

    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: finalPrompt }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('HF hatası:', err)
      return NextResponse.json({ error: 'Görsel üretilemedi' }, { status: 500 })
    }

    const buffer = await response.arrayBuffer()

    const dosyaAdi = `ai-${Date.now()}.png`
    const { error: uploadError } = await supabase.storage
      .from('gorseller')
      .upload(dosyaAdi, Buffer.from(buffer), {
        contentType: 'image/png',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload hatası:', uploadError)
      const base64 = Buffer.from(buffer).toString('base64')
      return NextResponse.json({ url: `data:image/png;base64,${base64}` })
    }

    const { data } = supabase.storage.from('gorseller').getPublicUrl(dosyaAdi)
    return NextResponse.json({ url: data.publicUrl })

  } catch (error: any) {
    console.error('Hata:', error?.message || error)
    return NextResponse.json({ error: 'Görsel üretilemedi' }, { status: 500 })
  }
}