# 🚀 Email Verification Setup - Petunjuk Cepat

## ⚠️ Masalah Saat Ini

User bisa daftar, namun **tidak bisa login** karena email belum diverifikasi.

Ini terjadi karena Supabase memerlukan **email verification** sebelum user bisa login.

---

## ✅ SOLUSI CEPAT (< 2 menit)

### Step 1: Buka Supabase Dashboard

Go to https://app.supabase.com → Pilih project Anda

### Step 2: Disable Email Verification (Development)

1. **Authentication** → **Providers** → **Email**
2. Scroll ke **Email Confirmations**
3. Ubah dari "**Require email confirmation**" → "**Automatic**"
4. Click **Save**

✅ **Selesai!** Sekarang user bisa daftar dan langsung login tanpa perlu klik email.

---

## 🔧 Untuk Production (Dengan Email Real)

Jika Anda ingin email verification yang benar-benar mengirim email ke inbox:

### Option A: Gunakan SendGrid (Recommended)

1. Daftar di https://sendgrid.com (Free tier tersedia)
2. Dapatkan API Key dari Settings
3. Di Supabase:
   - **Authentication** → **Providers** → **Email**
   - Pilih **SendGrid** sebagai email provider
   - Paste API Key SendGrid
   - Setup **Sender Email**
   - Click **Save**

### Option B: Gunakan Gmail SMTP

1. Buka Gmail account
2. Enable "Less secure app access" (atau setup App Password)
3. Di Supabase:
   - **Authentication** → **Providers** → **Email**
   - Pilih **Custom SMTP**
   - SMTP Host: `smtp.gmail.com`
   - Port: `587`
   - From Email: email@gmail.com
   - Username: email@gmail.com
   - Password: (app password yang di-generate)
   - Click **Save**

---

## 🧪 Testing Aplikasi

### Dengan "Automatic" Email Confirmation:

1. Buka http://localhost:3000/auth/signup
2. Isi form signup (nama, email, password)
3. Click "Daftar"
4. ✅ Langsung redirect ke dashboard (tidak perlu klik email)

### Dengan Email Provider Setup:

1. Buka http://localhost:3000/auth/signup
2. Isi form signup
3. Click "Daftar"
4. User akan melihat halaman "Verifikasi Email"
5. Cek email inbox untuk link verifikasi
6. Klik link di email
7. ✅ Redirect ke dashboard setelah verifikasi

---

## ❓ Troubleshooting

### User bisa daftar tapi tidak bisa login?

**Solusi:**
- Pastikan Supabase setting "Email Confirmations" sudah diubah ke "Automatic"
- Atau setup email provider (SendGrid/Gmail)

### Email tidak terkirim?

**Solusi:**
- Pastikan email provider sudah dikonfigurasi
- Cek API Key / credentials benar
- Cek spam folder

### Masih error saat login?

**Solusi:**
- Cek console browser untuk error message
- Pastikan credentials benar (email dan password sama saat signup)

---

## 📝 Aplikasi Saat Ini

✅ Signup form sudah ready
✅ Email verification flow sudah ready
✅ Auto-redirect ke dashboard sudah ready
✅ Error handling sudah ready

Hanya perlu configure Supabase settings!

---

Pertanyaan? Check `SUPABASE_CONFIG.md` untuk info lebih detail.
