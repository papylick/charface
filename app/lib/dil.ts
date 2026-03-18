export const diller = {
  TR: {
    // Navbar
    ekle: '✦ Ekle',
    akis: 'Akış',
    cikis: 'Çıkış',
    giris: 'Giriş',
    uyeOl: 'Üye Ol',

    // Ana sayfa
    hayalEt: '✦ · HAYAL ET · ✦ · ÜRET · ✦ · PAYLAŞ · ✦',
    baslik: 'Kitap Karakterlerini',
    baslikVurgu: 'Görselleştir',
    aramaPlaceholder: 'Karakter veya kitap ara...',
    karakter: 'KARAKTER',
    sonucBulunamadi: 'SONUÇ BULUNAMADI',
    tumKarakterlerYuklendi: 'Tüm karakterler yüklendi',
    yukleniyor: 'YÜKLENİYOR',

    // Karakter sayfası
    begeni: 'BEĞENİ',
    koleksiyonaEkle: '📚 Koleksiyona Ekle',
    duzenle: '✎ Düzenle',
    sil: '🗑 Sil',
    evetSil: 'Evet, Sil',
    iptal: 'İptal',
    eminMisin: 'Emin misin?',
    ekleyen: 'Ekleyen:',
    yorumlar: 'YORUMLAR',
    yorumYaz: 'Yorumunu yaz...',
    gonder: 'GÖNDER',
    yorumYapmakIcinGirisYap: 'Yorum yapmak için giriş yap →',
    hicYorumYok: 'Henüz yorum yok. İlk yorumu sen yap!',
    raporla: '🚩 Raporla',
    listeYok: 'Liste yok',
    listeOlustur: 'Liste Oluştur',

    // Profil
    karakterEkle: '✦ Karakter Ekle',
    listelerim: '📚 Listelerim',
    ayarlar: '⚙ Ayarlar',
    benimKarakterlerim: 'BENİM KARAKTERLERİM',
    karakter2: 'KARAKTER',
    toplamBegeni: 'BEĞENİ',
    takipci: 'TAKİPÇİ',
    takip: 'TAKİP',
    karakterEkleBtn: '✦ İlk Karakterini Ekle',
    hicKarakterYok: 'Henüz karakter eklemedin',

    // Genel
    yukleniyorText: 'YÜKLENİYOR...',
    karakterBulunamadi: 'KARAKTER BULUNAMADI',
  },

  EN: {
    // Navbar
    ekle: '✦ Add',
    akis: 'Feed',
    cikis: 'Sign Out',
    giris: 'Sign In',
    uyeOl: 'Sign Up',

    // Ana sayfa
    hayalEt: '✦ · IMAGINE · ✦ · CREATE · ✦ · SHARE · ✦',
    baslik: 'Visualize Book',
    baslikVurgu: 'Characters',
    aramaPlaceholder: 'Search character or book...',
    karakter: 'CHARACTER',
    sonucBulunamadi: 'NO RESULTS FOUND',
    tumKarakterlerYuklendi: 'All characters loaded',
    yukleniyor: 'LOADING',

    // Karakter sayfası
    begeni: 'LIKE',
    koleksiyonaEkle: '📚 Add to Collection',
    duzenle: '✎ Edit',
    sil: '🗑 Delete',
    evetSil: 'Yes, Delete',
    iptal: 'Cancel',
    eminMisin: 'Are you sure?',
    ekleyen: 'Added by:',
    yorumlar: 'COMMENTS',
    yorumYaz: 'Write a comment...',
    gonder: 'SEND',
    yorumYapmakIcinGirisYap: 'Sign in to comment →',
    hicYorumYok: 'No comments yet. Be the first!',
    raporla: '🚩 Report',
    listeYok: 'No lists',
    listeOlustur: 'Create List',

    // Profil
    karakterEkle: '✦ Add Character',
    listelerim: '📚 My Lists',
    ayarlar: '⚙ Settings',
    benimKarakterlerim: 'MY CHARACTERS',
    karakter2: 'CHARACTER',
    toplamBegeni: 'LIKES',
    takipci: 'FOLLOWERS',
    takip: 'FOLLOWING',
    karakterEkleBtn: '✦ Add Your First Character',
    hicKarakterYok: 'No characters yet',

    // Genel
    yukleniyorText: 'LOADING...',
    karakterBulunamadi: 'CHARACTER NOT FOUND',
  }
}

export type Dil = keyof typeof diller
export type DilMetinleri = typeof diller.TR
``