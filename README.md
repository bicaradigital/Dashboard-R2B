# 📊 Dashboard R2B

> Sistem dashboard keuangan internal untuk **PT Rumah Retort Bersama (R2B)** — mencakup pencatatan transaksi, visualisasi data keuangan, laporan laba rugi, dan export laporan secara otomatis.

---

## ⚠️ Lisensi & Kepemilikan

> 🔒 **Project ini bersifat PRIVATE dan CONFIDENTIAL.**
>
> Seluruh kode, desain, dan sistem dalam repository ini adalah **milik PT Rumah Retort Bersama (R2B)** dan dikembangkan secara eksklusif oleh **[Bicara Digital]**.
>
> Dilarang keras menyalin, mendistribusikan, atau menggunakan sebagian maupun seluruh bagian dari project ini tanpa izin tertulis dari pemilik.

---

## 📋 Deskripsi Project

Dashboard R2B adalah sistem manajemen keuangan berbasis web yang dirancang khusus untuk kebutuhan internal PT Rumah Retort Bersama. Sistem ini memungkinkan tim keuangan untuk:

- Mencatat dan memantau **transaksi pemasukan & pengeluaran**
- Melihat **laporan laba rugi** secara real-time
- Menganalisis data keuangan melalui **grafik & visualisasi**
- Memfilter laporan berdasarkan **periode waktu**
- Mengekspor laporan ke **PDF maupun Excel**

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 💹 **Grafik & Visualisasi** | Grafik interaktif untuk tren pemasukan, pengeluaran, dan profit |
| 📝 **Input Transaksi** | Pencatatan transaksi pemasukan dan pengeluaran secara mudah |
| 📈 **Laporan Laba Rugi** | Laporan laba rugi otomatis berdasarkan data transaksi |
| 📅 **Filter Periode** | Filter laporan berdasarkan bulan, kuartal, atau tahun |
| 📄 **Export PDF** | Cetak atau unduh laporan keuangan dalam format PDF |
| 📊 **Export Excel** | Download data transaksi dan laporan dalam format Excel/CSV |
| 🗄️ **Database Realtime** | Data tersimpan aman di Supabase dengan sinkronisasi real-time |
| 📥 **Import Excel/CSV** | Upload data transaksi massal dari file Excel atau CSV |

---

## 🛠️ Tech Stack

| Teknologi | Keterangan |
|-----------|------------|
| **Next.js** | Framework utama dengan App Router |
| **React** | UI library |
| **Tailwind CSS** | Utility-first CSS framework |
| **TypeScript** | Type-safe codebase |
| **shadcn/ui** | Komponen UI modern berbasis Radix |
| **Supabase** | Database PostgreSQL + Auth + Realtime |
| **Excel/CSV** | Import & export data keuangan |

---

## 📁 Struktur Project

```
dashboard-laporan-keuangan-r2b/
├── app/
│   ├── page.tsx                  # Halaman login / landing
│   ├── layout.tsx                # Root layout
│   ├── dashboard/
│   │   ├── page.tsx              # Halaman utama dashboard
│   │   ├── transaksi/
│   │   │   └── page.tsx          # Manajemen transaksi
│   │   ├── laporan/
│   │   │   └── page.tsx          # Laporan laba rugi
│   │   └── export/
│   │       └── page.tsx          # Export PDF & Excel
├── components/
│   ├── charts/                   # Komponen grafik keuangan
│   ├── tables/                   # Tabel transaksi & laporan
│   ├── forms/                    # Form input transaksi
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── supabase.ts               # Konfigurasi Supabase client
│   ├── export.ts                 # Logic export PDF & Excel
│   └── utils.ts                  # Utility functions
├── types/
│   └── keuangan.ts               # TypeScript types
├── public/
└── README.md
```

---

## 🗄️ Struktur Database (Supabase)

```sql
-- Tabel Transaksi
transaksi (
  id          uuid PRIMARY KEY,
  tanggal     date,
  jenis       text,           -- 'pemasukan' | 'pengeluaran'
  kategori    text,
  deskripsi   text,
  jumlah      numeric,
  created_at  timestamp
)

-- Tabel Kategori
kategori (
  id    uuid PRIMARY KEY,
  nama  text,
  jenis text   -- 'pemasukan' | 'pengeluaran'
)
```

---

## 🚀 Cara Menjalankan Project

### Prasyarat

- [Node.js](https://nodejs.org/) versi 18 atau lebih baru
- Akses ke project Supabase R2B
- Package manager: `pnpm` atau `npm`

### Instalasi

```bash
# 1. Clone repository (memerlukan akses)
git clone https://github.com/bicaradigital/dashboard-laporan-keuangan-r2b.git

# 2. Masuk ke folder project
cd dashboard-laporan-keuangan-r2b

# 3. Install dependencies
pnpm install

# 4. Salin file environment
cp .env.example .env.local
```

### Konfigurasi Environment

Isi file `.env.local` dengan kredensial Supabase R2B:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> 🔑 Kredensial dapat diperoleh dari tim Bicara Digital atau admin PT R2B.

### Jalankan Dev Server

```bash
pnpm dev
```

Buka di browser: `http://localhost:3000`

---

## 📦 Scripts

| Command | Fungsi |
|---------|--------|
| `pnpm dev` | Menjalankan development server |
| `pnpm build` | Build untuk production |
| `pnpm start` | Menjalankan production server |
| `pnpm lint` | Menjalankan ESLint |

---

## 🔄 Alur Penggunaan

```
1. Login dengan akun internal R2B
        ↓
2. Lihat ringkasan keuangan di Dashboard
        ↓
3. Input transaksi pemasukan / pengeluaran
   (atau import massal via Excel/CSV)
        ↓
4. Filter berdasarkan periode yang diinginkan
        ↓
5. Analisis data melalui grafik & laporan laba rugi
        ↓
6. Export laporan ke PDF atau Excel
```

---

## 📊 Tampilan Dashboard

| Section | Deskripsi |
|---------|-----------|
| **Ringkasan** | Total pemasukan, pengeluaran, dan laba bersih periode ini |
| **Grafik Tren** | Visualisasi pemasukan vs pengeluaran per bulan |
| **Tabel Transaksi** | Daftar semua transaksi dengan filter & pencarian |
| **Laporan Laba Rugi** | Laporan otomatis siap cetak |

---

## 👨‍💻 Developer

Dikembangkan dan dipelihara oleh:

**Bicara Digital**
> Solusi digital untuk bisnis Indonesia

---

## 📞 Kontak & Support

Untuk pertanyaan teknis, bug report, atau pengembangan fitur baru, silakan hubungi tim **Bicara Digital** selaku pengembang resmi sistem ini.

Whatsapp : wa.me/6282133467984
---

## 📄 Lisensi

**© 2024 PT Rumah Retort Bersama. All Rights Reserved.**

Dikembangkan eksklusif oleh **Bicara Digital**. Seluruh hak cipta dilindungi. Tidak diizinkan untuk direproduksi, didistribusikan, atau dimodifikasi tanpa izin tertulis.
