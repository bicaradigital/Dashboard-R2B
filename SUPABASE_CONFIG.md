# Konfigurasi Supabase untuk Email Verification

## Mode Pengembangan (Development) - RECOMMENDED

Untuk development dan testing cepat, gunakan **Automatic Email Confirmation**:

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Go to **Authentication > Providers > Email**
4. Cari bagian **Email Confirmations**
5. Pilih **Automatic** (default)
6. **Save**

Dengan mode ini:
- ✅ User tidak perlu klik email
- ✅ Langsung bisa login setelah daftar
- ✅ Sempurna untuk testing

---

## Mode Production - Dengan Email Provider

Untuk production dengan email verification yang benar:

### Option 1: Gunakan SendGrid (Recommended)

1. Daftar di [SendGrid](https://sendgrid.com)
2. Dapatkan API Key
3. Di Supabase Dashboard:
   - Go to **Authentication > Providers > Email**
   - Pilih **Custom SMTP** atau **SendGrid**
   - Masukkan credentials SendGrid
   - Nonaktifkan "Automatic" email confirmation
   - **Save**

### Option 2: Gunakan Gmail SMTP

1. Enable "Less secure app access" di Gmail account
2. Generate App Password
3. Di Supabase:
   - Go to **Authentication > Providers > Email**
   - Pilih **Custom SMTP**
   - SMTP Host: `smtp.gmail.com`
   - SMTP Port: `587`
   - From Email: Gmail Anda
   - Username: Gmail Anda
   - Password: App Password yang di-generate
   - **Save**

---

## Troubleshooting

### User bisa daftar tapi email tidak terkirim

1. Pastikan email provider sudah dikonfigurasi
2. Cek apakah "Automatic email confirmation" tidak diaktifkan
3. Cek error log di Supabase Dashboard

### User tidak bisa login setelah daftar

1. Pastikan menggunakan mode "Automatic" untuk development
2. Atau pastikan email provider sudah setup dengan benar

---

## Testing

Untuk test email flow di development:

1. Gunakan **Automatic Email Confirmation** mode
2. Buka aplikasi → Signup
3. Isi form dan klik "Daftar"
4. User akan langsung bisa login dan masuk ke dashboard

Untuk test dengan email di production:

1. Setup email provider (SendGrid / Gmail)
2. Nonaktifkan "Automatic confirmation"
3. Buka aplikasi → Signup
4. Cek email inbox untuk link verifikasi
5. Klik link untuk verifikasi
6. Setelah verifikasi, bisa login

---

## Current Setting in This App

Aplikasi ini sudah siap untuk:

- ✅ **Instant verification** (jika Supabase set ke "Automatic")
- ✅ **Real email verification** (jika email provider sudah dikonfigurasi)
- ✅ **Automatic redirect** ke dashboard setelah setup benar

Tidak perlu ubah kode aplikasi, hanya setting Supabase saja!
