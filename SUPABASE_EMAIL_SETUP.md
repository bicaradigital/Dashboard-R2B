# Panduan Setup Email Verification di Supabase

## Masalah Saat Ini
Email verifikasi tidak terkirim karena email provider belum dikonfigurasi di Supabase. Secara default, Supabase menggunakan "Automatic Email Confirmation" yang tidak mengirimkan email.

## Solusi: Setup Email Provider

### Opsi 1: Gunakan Custom SMTP (Recommended untuk Production)

#### Step 1: Login ke Supabase Dashboard
1. Buka https://app.supabase.com
2. Pilih project R2B Dashboard Anda

#### Step 2: Navigasi ke Email Settings
1. Klik menu **Authentication** di sidebar
2. Pilih tab **Providers**
3. Cari dan klik **Email** provider

#### Step 3: Nonaktifkan Automatic Confirmation
1. Di bagian **Email Confirmations**, toggle **OFF** untuk "Automatic email confirmation"
2. Klik **Save**

#### Step 4: Setup Custom SMTP
Pilih salah satu cara:

**A) Gunakan SendGrid (Paling Mudah)**
- Buat akun di https://sendgrid.com
- Generate API Key di Settings → API Keys
- Di Supabase Email Provider:
  - Pilih **"Use custom SMTP"**
  - Host: `smtp.sendgrid.net`
  - Port: `587`
  - Username: `apikey`
  - Password: `<your-sendgrid-api-key>`
  - From Email: `noreply@yourdomain.com` (pastikan terverifikasi di SendGrid)
  - From Name: `R2B Laporan Keuangan`

**B) Gunakan Gmail SMTP**
- Enable 2-Step Verification di Google Account
- Generate App Password (https://myaccount.google.com/apppasswords)
- Di Supabase Email Provider:
  - Host: `smtp.gmail.com`
  - Port: `587`
  - Username: `your-email@gmail.com`
  - Password: `<app-password-16-chars>`
  - From Email: `your-email@gmail.com`
  - From Name: `R2B Laporan Keuangan`

**C) Gunakan Provider Lain (Mailgun, AWS SES, dll)**
- Setup akun di provider pilihan
- Ambil SMTP credentials
- Masukkan di Supabase sesuai format di atas

#### Step 5: Test Email Verification
1. Buka aplikasi Anda: http://localhost:3000
2. Klik **Daftar**
3. Isi form dengan email, nama, dan password
4. Klik **Daftar**
5. Anda akan diarahkan ke halaman "Verifikasi Email"
6. Cek inbox email Anda (atau folder Spam)
7. Klik link verifikasi dari email R2B
8. Anda akan otomatis diarahkan ke **Dashboard**

---

## Troubleshooting

### Email Masih Tidak Terkirim?

**1. Cek Automatic Confirmation masih aktif**
- Supabase → Authentication → Providers → Email
- Pastikan "Automatic email confirmation" sudah **OFF**

**2. Cek SMTP Credentials**
- Test credentials di https://mailtrap.io atau tools sejenis
- Pastikan API Key / Password benar

**3. Cek From Email**
- Pastikan email "From" sudah terverifikasi di provider SMTP
- Jangan gunakan arbitrary email, gunakan email yang sudah terverifikasi

**4. Cek Rate Limiting**
- Provider SMTP mungkin rate limit development requests
- Tunggu beberapa menit sebelum coba lagi

**5. Lihat Email Logs di Supabase**
- Supabase → Authentication → Logs
- Cek error message detail dari email yang gagal

### Testing Tanpa Setup Email (Development Only)

Jika Anda ingin test flow verification tanpa setup email provider, gunakan **Magic Link** atau **Automatic Confirmation**:

1. Supabase → Authentication → Providers → Email
2. Toggle **ON** untuk "Automatic email confirmation"
3. Sekarang user langsung terverifikasi tanpa perlu klik link

⚠️ **Catatan**: Ini hanya untuk development. Untuk production, setup email provider seperti di atas.

---

## Redirect URLs yang Sudah Dikonfigurasi

Aplikasi sudah siap handle email verification:

1. **Email Verification Link** → `http://localhost:3000/auth/callback?code=...`
2. **Route Handler** → `/app/auth/callback/route.ts` (menukar code dengan session)
3. **Redirect ke Dashboard** → `/dashboard` setelah verifikasi berhasil

Semua sudah disiapkan, cukup setup email provider di Supabase!
