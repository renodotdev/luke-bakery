export type Variant = { id: string; name: string; price: number | null };
export type Product = {
  id: string; name: string; category: string; eyebrow: string; description: string;
  image: string | null; alt: string; variants: Variant[];
  availability: 'available' | 'preorder' | 'unavailable';
  kind: 'fixed' | 'inquiry'; leadHours: number;
  featured?: boolean; imageCutout?: boolean; details?: string[];
  gallery?: { src: string; alt: string; label: string; cutout?: boolean }[];
};
export type PickupRules = { opens: string; closes: string; exceptions: Record<string, { opens: string; closes: string } | null> };

export const store = {
  name: 'Luke Artisan Bakery', whatsapp: '62895403825017', phone: '0895-4038-25017',
  address: 'Jl. Pahlawan Trip No.11, Oro-oro Dowo, Klojen, Malang',
  maps: 'https://maps.app.goo.gl/ZxYpDg47LzKHa3dh9', instagram: 'https://www.instagram.com/lukeartisanbakery/',
  bioUrl: 'https://msha.ke/lukeartisanbakery',
  tagline: 'Serving a remarkable ‘Splendor of Flavor’',
  group: 'Cengli Group',
  email: 'lukeartisanbakery@gmail.com',
  tiktok: 'https://tiktok.com/@lukeartisanbakery',
  gofood: 'https://gofood.link/a/GVa3cYG',
  grabfood: 'https://food.grab.com/id/en/restaurant/luke-artisan-bakery---oro-oro-dowo/6-C4ACC65ZGPBBCA?exp_src=share&itemID=IDITE20230331043658089282',
  contacts: [
    { id: 'orders', name: 'Pesanan & Reservasi', phone: '62895403825017', display: '+62 895-4038-25017', description: 'Untuk pemesanan produk, ketersediaan di etalase, dan pertanyaan reservasi.' },
    { id: 'service', name: 'Customer Service', phone: '6287784459765', display: '+62 877-8445-9765', description: 'Sampaikan pertanyaan, masukan, atau pengalaman Anda kepada tim layanan pelanggan.' },
    { id: 'marketing', name: 'Kerja Sama & Marketing', phone: '6282333184198', display: '+62 823-3318-4198', description: 'Hubungi tim Luke untuk pertanyaan kolaborasi dan pemasaran.' },
    { id: 'purchasing', name: 'Purchasing', phone: '6285649727298', display: '+62 856-4972-7298', description: 'Jalur kontak bagian purchasing untuk pertanyaan pengadaan.' },
  ],
  menuUrl: 'https://drive.google.com/file/d/1R-aJGA89MF1FQD4YXoH9yqAGw4an3doa/view',
  fullMenuUrl: 'https://drive.google.com/drive/folders/1-4nhT_zHznCq61lQVuA7KLVhhl90qVOv',
  menuChecked: '2026-11-14', taxBps: 1000,
  pickup: { opens: '07:00', closes: '22:00', exceptions: {} } satisfies PickupRules,
};
export const categories = [
  { id: 'semua', name: 'Semua pilihan' }, { id: 'cakes', name: 'Tiramisu & Cakes' },
  { id: 'pastries', name: 'Viennoiserie' }, { id: 'bread', name: 'Bread' },
  { id: 'tarts-choux', name: 'Tarte & Choux' }, { id: 'celebrations', name: 'Celebrations' }, { id: 'gifts', name: 'Hampers & Gifts' },
];
const v = (id: string, name: string, price: number): Variant => ({ id, name, price });
function cake(id: string, name: string, variants: Variant[], photo?: string): Product {
  return {
    id, name, category: 'cakes', eyebrow: 'For moments worth sharing',
    description: `Pilihan ${name} dari katalog Luke. Pilih ukuran yang sesuai dengan momen Anda, lalu ajukan waktu pengambilan melalui WhatsApp.`,
    image: photo ? `/images/menu/${photo}.webp` : null, imageCutout: Boolean(photo), alt: `${name}, foto dari katalog resmi Luke`,
    variants, availability: 'preorder', kind: 'fixed', leadHours: 24,
  };
}
type MenuEntry = [id: string, name: string, price: number];
function menuItems(entries: MenuEntry[], category: string): Product[] {
  return entries.map(([id, name, price]) => ({
    id, name, category, eyebrow: 'From the Luke collection',
    description: `${name} dari katalog Luke Artisan Bakery. Pesan untuk diambil di bakery; ketersediaan dan waktu pengambilan dikonfirmasi oleh tim Luke.`,
    image: null, alt: '', variants: [v('standard', 'Sesuai katalog', price)],
    availability: 'preorder', kind: 'fixed', leadHours: id === 'sourdough' ? 48 : 24,
  }));
}
// Public PASTRY MENU 2.0.pdf, checked 14 November 2026. Prices exclude 10% tax.
// This is the pre-order catalog; same-day display stock is confirmed by the bakery.
export const products: Product[] = [
  { ...cake('tiramisu-whole-cake', 'Tiramisu', [v('portion', 'Porsi', 48000), v('round-14', 'Whole cake · diameter 14 cm', 350000), v('square-21', 'Whole cake · 21 × 21 cm', 432000), v('round-20', 'Whole cake · diameter 20 cm', 500000)]), image: '/images/tiramisu.jpg', imageCutout: false, alt: 'Tiramisu whole cake Luke dengan pita dan lilin', featured: true, gallery: [{ src: '/images/menu/tiramisu-square.webp', alt: 'Tiramisu persegi 21 × 21 cm dari katalog Luke', label: 'Whole cake · 21 × 21 cm', cutout: true }], details: ['Foto menampilkan pilihan whole cake. Pilih ukuran pada formulir pesanan.', 'Whole cake termasuk pisau cake plastik dan 1 lilin sesuai katalog.'] },
  {
    id: 'croissant', name: 'Croissant', category: 'pastries', eyebrow: 'A little everyday delight',
    description: 'Pilih croissant dari koleksi viennoiserie Luke. Ketersediaan setiap varian dikonfirmasi untuk permintaan Anda.',
    image: '/images/pastry.jpg', alt: 'Detail lapisan croissant dari publikasi Luke', featured: true,
    variants: [v('plain', 'Croissant', 22000), v('almond', 'Almond Croissant', 48000), v('cheese', 'Cheese Croissant', 38000), v('pistachio', 'Pistachio Croissant', 48000), v('dubai-choco', 'Dubai Choco Croissant', 58000)],
    availability: 'preorder', kind: 'fixed', leadHours: 24, details: ['Foto mewakili koleksi croissant; tampilan berbeda untuk setiap varian.'],
  },
  { ...cake('carrot-cake', 'Carrot Cake', [v('slice', 'Slice', 49000), v('whole-22', 'Whole cake · 22 cm', 490000)], 'carrot-cake'), featured: true },
  { ...cake('san-sebastian-cheesecake', 'San Sebastian Cheesecake', [v('slice', 'Slice', 50000), v('whole-18', 'Whole cake · 18 cm', 400000)], 'san-sebastian'), featured: true },
  cake('matchamisu', 'Matchamisu', [v('portion', 'Porsi', 50000), v('round-14', 'Whole cake · diameter 14 cm', 350000), v('square-21', 'Whole cake · 21 × 21 cm', 450000)], 'matchamisu'),
  cake('lemonmisu', 'Lemonmisu', [v('portion', 'Porsi', 55000), v('round-14', 'Whole cake · diameter 14 cm', 350000), v('square-21', 'Whole cake · 21 × 21 cm', 495000)], 'lemonmisu'),
  cake('raspberrymisu', 'Raspberrymisu', [v('portion', 'Porsi', 48000), v('round-14', 'Whole cake · diameter 14 cm', 350000)]),
  cake('peach-earl-grey', 'Peach Earl Grey', [v('slice', 'Slice', 54000), v('whole-22', 'Whole cake · 22 cm', 540000)], 'peach-earl-grey'),
  cake('cashew-gianduja', 'Cashew Gianduja', [v('slice', 'Slice', 58000), v('whole-14', 'Whole cake · 14 cm', 340000), v('whole-22', 'Whole cake · 22 cm', 580000)], 'cashew-gianduja'),
  cake('strawberry-cheesecake', 'Strawberry Cheesecake', [v('slice', 'Slice', 45000), v('whole-18', 'Whole cake · 18 cm', 360000)], 'strawberry-cheesecake'),
  cake('blueberry-cake', 'Blueberry Cake', [v('whole-22', 'Whole cake · 22 cm', 400000)], 'blueberry-cake'),
  cake('red-velvet', 'Red Velvet', [v('slice', 'Slice', 66000), v('whole', 'Whole cake', 660000)]),
  cake('strawberry-cake', 'Strawberry Cake', [v('whole', 'Whole cake', 400000)]),
  cake('matcha-cheesecake', 'Matcha Cheesecake', [v('slice', 'Slice', 48000), v('whole', 'Whole cake', 384000)]),
  cake('brownies-cheesecake', 'Brownies Cheesecake', [v('slice', 'Slice', 42000), v('whole', 'Whole cake', 336000)]),
  cake('tiramisu-cheesecake', 'Tiramisu Cheesecake', [v('slice', 'Slice', 48000), v('whole', 'Whole cake', 384000)]),
  cake('fudge-brownies', 'Fudge Brownies', [v('slice', 'Slice', 29000), v('whole', 'Whole cake', 261000)]),
  cake('dubai-choco-brownie', 'Dubai Choco Brownie', [v('slice', 'Slice', 42000)]),
  ...menuItems([
    ['pain-au-chocolat', 'Pain Au Chocolat', 26000], ['pain-au-beef', 'Pain Au Beef', 38000], ['pain-suisse', 'Pain Suisse', 36000],
    ['banana-pain-suisse', 'Banana Pain Suisse', 38000], ['crookies', 'Crookies', 40000], ['kouign-amann', 'Kouign Amann', 38000],
    ['pain-au-choco-hazelnut', 'Pain Au Choco Hazelnut', 42000], ['cinnamon-roll', 'Cinnamon Roll', 40000], ['beef-pastrami-cheese', 'Beef Pastrami n Cheese', 45000],
    ['strawberry-cheese-cruffin', 'Strawberry Cheese Cruffin', 42000], ['lemon-cruffin', 'Lemon Cruffin', 38000], ['mango-cruffin', 'Mango Cruffin', 38000],
    ['choco-cromboloni', 'Choco Cromboloni', 42000], ['pistachioberry-cromboloni', 'Pistachioberry Cromboloni', 45000],
    ['cookies-cream-cromboloni', 'Cookies ’n Cream Cromboloni', 42000], ['strawberry-danish', 'Strawberry Danish', 44000],
    ['smoked-beef-chimicurri', 'Smoked Beef Chimicurri', 45000], ['cheese-torsade', 'Cheese Torsade', 24000], ['canele', 'Canelé', 22000],
  ], 'pastries'),
  ...menuItems([
    ['sourdough', 'Sourdough', 52000], ['banana-bread', 'Banana Bread', 25000], ['saltbread', 'Saltbread', 18000], ['bolu-pisang-keju', 'Bolu Pisang Keju', 31000],
    ['cheese-bread', 'Cheese Bread', 32000], ['dirty-choco-bun', 'Dirty Choco Bun', 22000], ['whole-focaccia', 'Whole Focaccia', 50000], ['cranberry-cheese-sourdough', 'Cranberry Cheese Sourdough', 26000],
  ], 'bread'),
  ...menuItems([
    ['chocolate-tarte', 'Chocolate Tarte', 32000], ['lemon-meringue', 'Lemon Meringue', 32000], ['strawberry-tarte', 'Strawberry Tarte', 32000],
    ['quiche-lorraine', 'Quiche Lorraine', 32000], ['quiche-smoked-salmon', 'Quiche Smoked Salmon', 36000], ['quiche-black-truffle', 'Quiche Black Truffle', 38000],
  ], 'tarts-choux'),
  { id: 'choux-au-craquelin', name: 'Choux Au Craquelin', category: 'tarts-choux', eyebrow: 'From the Luke collection', description: 'Pilihan choux dari katalog Luke. Pilih varian untuk permintaan pre-order Anda.', image: null, alt: '', variants: [v('vanila', 'Vanila', 18000), v('lemon', 'Lemon', 18000), v('choco', 'Choco', 18000), v('matcha', 'Matcha', 20000)], availability: 'preorder', kind: 'fixed', leadHours: 24 },
  { id: 'tiramisu-tower', name: 'Tiramisu Tower', category: 'celebrations', eyebrow: 'A celebration to remember', description: 'Tiramisu Tower sesuai katalog Luke. Cantumkan tanggal acara dan kebutuhan khusus Anda; rincian dikonfirmasi oleh tim Luke.', image: null, alt: '', variants: [v('catalogue', 'Tower sesuai katalog', 1500000)], availability: 'preorder', kind: 'fixed', leadHours: 24 },
  { id: 'dubai-chewy-celebration', name: 'Dubai Chewy Celebration Package', category: 'celebrations', eyebrow: 'Something worth celebrating', description: 'Paket berisi 15 Dubai Chewy Cookies, termasuk candle, topper, dan greeting card sesuai katalog Luke.', image: null, alt: '', variants: [v('15-pieces', 'Paket 15 pcs', 545000)], availability: 'preorder', kind: 'fixed', leadHours: 24 },
  { id: 'mix-cake', name: 'Mix Cake', category: 'celebrations', eyebrow: 'Your favorites, together', description: 'Mix cake 22 cm dengan 10 slice. Harga mengikuti varian yang dipilih; diskusikan kombinasi Anda dengan tim Luke.', image: '/images/menu/mix-cake.webp', imageCutout: true, alt: 'Mix cake dari katalog resmi Luke', variants: [{ id: 'custom', name: '22 cm · 10 slice · pilihan varian', price: null }], availability: 'available', kind: 'inquiry', leadHours: 0 },
  { id: 'celebration-cakes', name: 'Celebration Cakes', category: 'celebrations', eyebrow: 'For the occasions that matter', description: 'Diskusikan cake untuk perayaan Anda bersama Luke. Desain, ukuran, jadwal, dan penawaran disesuaikan melalui konsultasi.', image: '/images/celebration.jpg', alt: 'Inspirasi floral cake dari publikasi Luke', variants: [{ id: 'custom', name: 'Konsultasi desain & ukuran', price: null }], availability: 'available', kind: 'inquiry', leadHours: 0 },
  { id: 'hampers-gifts', name: 'Hampers & Gifts', category: 'gifts', eyebrow: 'A thoughtful little gesture', description: 'Tanyakan koleksi hampers yang tersedia untuk momen Anda. Isi, kemasan, periode pemesanan, dan penawaran dikonfirmasi melalui WhatsApp.', image: null, alt: '', variants: [{ id: 'consult', name: 'Konsultasi koleksi', price: null }], availability: 'available', kind: 'inquiry', leadHours: 0 },
];
