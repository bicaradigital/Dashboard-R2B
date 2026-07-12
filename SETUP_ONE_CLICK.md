# Setup One-Click - Email Verification

## ⚡ Hanya 3 Langkah Untuk Buat Aplikasi Berfungsi

### Step 1: Enable Email Verification di Supabase (1 menit)

1. Buka: https://app.supabase.com
2. Pilih project Anda
3. Klik menu: **Authentication** → **Providers** → **Email**
4. Lihat section **Email Confirmations**
5. Ubah dari **"Require email verification"** ke **"Automatic"** (jika belum)
6. Klik tombol **"Save"** di bawah

**Hasilnya:**
- Email otomatis terverifikasi saat signup
- User langsung bisa login tanpa klik email

---

### Step 2: Jalankan Aplikasi (1 menit)

```bash
npm run dev
```

Aplikasi akan jalan di: http://localhost:3000

---

### Step 3: Test Signup (2 menit)

1. Buka: http://localhost:3000/auth/signup
2. Isi form:
   - **Nama**: Test User
   - **Email**: test@example.com
   - **Password**: TestPass123
   - **Konfirmasi**: TestPass123
3. Klik tombol **"Daftar"**

**Hasil yang diharapkan:**
- Muncul halaman "Pendaftaran Berhasil"
- Tombol "Masuk Sekarang" muncul
- Auto redirect ke halaman login dalam 3 detik

4. Masuk dengan email dan password yang tadi:
   - **Email**: test@example.com
   - **Password**: TestPass123
   - Klik **"Masuk"**

**Hasil akhir:**
- ✅ Masuk ke Dashboard
- ✅ Aplikasi berfungsi 100%

---

## Jika Ada Error "Invalid Login Credentials"

### Penyebab:
Email verification belum di-enable di Supabase

### Solusi:
Ulang Step 1:
1. https://app.supabase.com → Project Anda
2. **Authentication** → **Providers** → **Email**
3. Pastikan **Email Confirmations** = **"Automatic"** (bukan Require)
4. **Save**
5. Coba signup lagi

---

## Deploy ke Production

Setelah test lokal berhasil, deploy ke Vercel:

### Option 1: Deploy dari GitHub (Recommended)

```bash
# 1. Push ke GitHub
git add .
git commit -m "Ready to deploy"
git push

# 2. Buka vercel.com
# 3. Connect repository
# 4. Deploy (Vercel auto-detects Next.js)
```

### Option 2: Deploy Manual

```bash
# 1. Build
npm run build

# 2. Start
npm start
```

---

## Checklist Sebelum Deploy

- [ ] Signup berhasil tanpa error
- [ ] Email verification enabled di Supabase
- [ ] Bisa login setelah signup
- [ ] Dashboard accessible setelah login
- [ ] Semua dependencies terinstall
- [ ] Build berhasil tanpa error: `npm run build`

---

## Troubleshooting

| Error | Solusi |
|-------|--------|
| "Invalid login credentials" | Enable "Automatic" email di Supabase |
| "Email not confirmed" | Pastikan Email Confirmations = "Automatic" |
| "This account does not exist" | Signup dulu, baru bisa login |
| Build error | Jalankan: `npm install` lalu `npm run build` |

---

## Support

Jika masih ada masalah:

1. Cek email di Supabase sudah "Automatic"
2. Clear browser cache: Ctrl+Shift+Del (Windows) atau Cmd+Shift+Del (Mac)
3. Restart dev server: `npm run dev`
4. Coba signup dengan email baru

---

**Aplikasi sudah siap deploy! 🚀**
