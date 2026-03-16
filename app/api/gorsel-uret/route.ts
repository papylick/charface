import { NextResponse } from 'next/server'

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

    console.log('Çevrilen prompt:', finalPrompt)

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
    const base64 = Buffer.from(buffer).toString('base64')
    const url = `data:image/png;base64,${base64}`

    return NextResponse.json({ url })
  } catch (error: any) {
    console.error('Hata:', error?.message || error)
    return NextResponse.json({ error: 'Görsel üretilemedi' }, { status: 500 })
  }
}