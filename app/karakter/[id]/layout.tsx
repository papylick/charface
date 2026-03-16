import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: karakter } = await supabase
    .from('karakterler')
    .select('karakter_adi, kitap_adi, aciklama, gorsel_url')
    .eq('id', id)
    .single()

  if (!karakter) {
    return { title: 'Karakter | CharFaces' }
  }

  return {
    title: `${karakter.karakter_adi} — ${karakter.kitap_adi} | CharFaces`,
    description: karakter.aciklama || `${karakter.karakter_adi} karakterinin AI görseli`,
    openGraph: {
      title: `${karakter.karakter_adi} — ${karakter.kitap_adi}`,
      description: karakter.aciklama || `${karakter.karakter_adi} karakterinin AI görseli`,
      images: karakter.gorsel_url ? [{ url: karakter.gorsel_url, width: 1200, height: 630 }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${karakter.karakter_adi} — ${karakter.kitap_adi}`,
      description: karakter.aciklama || `${karakter.karakter_adi} karakterinin AI görseli`,
      images: karakter.gorsel_url ? [karakter.gorsel_url] : [],
    },
  }
}

export default function KarakterLayout({ children }: { children: React.ReactNode }) {
  return children
}

