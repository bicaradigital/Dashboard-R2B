# ✅ Email Verification Setup Checklist

## Langkah-Langkah Setup (Klik untuk expand)

### 1. Siapkan Email Provider
Pilih salah satu:

- **[ ] SendGrid** (Recommended)
  - [ ] Buat akun di sendgrid.com
  - [ ] Generate API Key
  - [ ] Catat: Host, Port, Username, Password

- **[ ] Gmail SMTP**
  - [ ] Enable 2-Step Verification
  - [ ] Generate App Password
  - [ ] Catat: Host, Port, Username, Password

- **[ ] Mailgun / AWS SES / Provider Lain**
  - [ ] Setup akun
  - [ ] Generate credentials
  - [ ] Catat: Host, Port, Username, Password

---

### 2. Login ke Supabase Dashboard
- [ ] Buka https://app.supabase.com
- [ ] Pilih project "Dashboard-R2B"

---

### 3. Nonaktifkan Automatic Email Confirmation
- [ ] Klik **Authentication** → **Providers**
- [ ] Klik **Email**
- [ ] Cari section **Email Confirmations**
- [ ] Toggle **OFF** untuk "Automatic email confirmation"
- [ ] Klik **Save**

---

### 4. Setup Custom SMTP
- [ ] Di Supabase Email Provider section, pilih **Custom SMTP**
- [ ] Isi field:
  ```
  Host: smtp.sendgrid.net (atau smtp provider Anda)
  Port: 587
  Username: apikey (atau username dari provider)
  Password: <API Key / App Password Anda>
  From Email: noreply@yourdomain.com (atau email terverifikasi di provider)
  From Name: R2B Laporan Keuangan
  ```
- [ ] Klik **Save**

---

### 5. Test Email Verification Flow
- [ ] Buka http://localhost:3000
- [ ] Klik **Daftar**
- [ ] Isi form:
  - Nama: Test User
  - Email: test@youremail.com
  - Password: TestPassword123
- [ ] Klik **Daftar**
- [ ] Cek inbox email Anda (atau folder Spam)
- [ ] Klik link di email dari "R2B Laporan Keuangan"
- [ ] ✅ Seharusnya langsung redirect ke **Dashboard**

---

## Debugging Jika Email Tidak Terkirim

### Cek di Supabase Logs
1. Supabase Dashboard → **Authentication** → **Logs**
2. Cari request daftar terbaru
3. Lihat error message detail

### Masalah Umum

| Masalah | Solusi |
|---------|--------|
| "Automatic email confirmation masih ON" | Matikan di Authentication → Providers → Email → toggle OFF |
| "Authentication failed" | Cek SMTP credentials (Host, Port, Username, Password) |
| "Invalid from email" | Gunakan email yang sudah terverifikasi di provider SMTP |
| "Rate limit exceeded" | Tunggu 5 menit, provider mungkin rate limit requests |
| "Email masih tidak terkirim" | Cek folder Spam, atau lihat Supabase Logs untuk error detail |

---

## Struktur Aplikasi Yang Sudah Siap

✅ **File yang sudah dikonfigurasi:**

```
/app
├── /auth
│   ├── /signup/page.tsx          ← Form daftar + trigger email
│   ├── /callback/route.ts        ← Handle verifikasi callback
│   └── /verify-email/page.tsx    ← Halaman "Check your email"
└── /dashboard/page.tsx           ← Redirect setelah verified

/lib
├── /supabase/client.ts           ← Supabase client
├── /supabase/server.ts           ← Server-side Supabase
└── /supabase/middleware.ts       ← Auth middleware
```

Semua sudah siap, hanya perlu konfigurasi email provider di Supabase!

---

## Support

Jika masih ada masalah:
1. Lihat `SUPABASE_EMAIL_SETUP.md` untuk panduan detail
2. Cek Supabase Logs untuk error message
3. Test SMTP credentials di https://mailtrap.io
