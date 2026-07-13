# Administrator Only Login System

Sistem login Dashboard R2B sekarang HANYA untuk Administrator. Fitur ini menjamin keamanan dan kontrol penuh atas semua input transaksi.

## Fitur Utama

✓ **Hanya Admin yang Bisa Login** - Hanya user dengan role 'admin' yang dapat masuk
✓ **Admin Input Transaksi** - Hanya administrator yang dapat menambah/edit transaksi
✓ **Logout Berfungsi** - Tombol keluar di header dashboard
✓ **Keamanan Session** - Session cookies di-clear saat logout
✓ **Simple Setup** - Setup wizard untuk buat admin user pertama

## Cara Menggunakan

### 1. Setup Awal (HANYA 1x di awal)

```bash
npm run dev
```

Buka: http://localhost:3000/simple-setup

- Klik "Mulai Setup"
- Masukkan data administrator:
  - Username: (misal: admin)
  - Password: (misal: admin123)
  - Nama Lengkap: (misal: Nama Admin)
- Klik "Tambah Administrator"
- Selesai!

### 2. Login

Buka: http://localhost:3000/auth/login

- Masukkan username administrator
- Masukkan password
- Klik "Masuk"

### 3. Dashboard

Setelah login, Anda akan masuk ke dashboard sebagai Administrator:

- **Tab Dashboard**: Lihat ringkasan keuangan
- **Tab Transaksi**: Input/edit transaksi, lihat daftar
- **Tab Invoice**: Manage invoice
- **Tab Laporan**: Lihat laporan keuangan

### 4. Logout

Di dashboard, klik tombol "Keluar" di header (atas kanan).

Tombol logout tersedia di:
- Desktop: Header atas kanan
- Mobile: Menu mobile (tekan hamburger menu)

## Struktur Database

Sistem hanya menggunakan 2 tabel utama:

```
users table:
├─ id (UUID)
├─ username (unique)
├─ password
├─ full_name
├─ role (always 'admin' now)
├─ is_active (true/false)
└─ created_at

login_logs table:
├─ id
├─ user_id
├─ status (success/failed)
└─ created_at
```

## API Endpoints

- `POST /api/auth/simple-login` - Login dengan username/password
- `POST /api/auth/logout` - Logout dan clear session
- `POST /api/setup/add-user` - Tambah administrator baru

## Test Credentials

Setelah setup, gunakan credentials yang sudah dibuat di setup wizard.

Contoh:
- Username: admin
- Password: admin123

## Keamanan

- Hanya administrator yang bisa login
- Session di-clear otomatis saat logout
- Cookies dihapus setelah logout
- Automatic redirect ke login page

## Troubleshooting

**Q: Lupa password?**
- Tidak ada recovery, harus buat user baru via database

**Q: Mau tambah admin lain?**
- Buka http://localhost:3000/simple-setup
- Klik "Tambah Administrator Lain"
- Masukkan data baru

**Q: Logout tidak bekerja?**
- Clear browser cache/cookies
- Atau manual delete cookies di browser developer tools

## Production Deployment

Untuk production:
1. Use bcrypt untuk hash password (jangan plaintext)
2. Use JWT token dengan expiry
3. Setup HTTPS
4. Use environment variables untuk secret keys
5. Setup database backup strategy

