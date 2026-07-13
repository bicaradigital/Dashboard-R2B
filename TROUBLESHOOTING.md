# Troubleshooting Guide - Login & Signup Issues

## Problem: Can't Login After Signup

### Gejala
- Signup berhasil ✅
- Masuk page verify-email ✅
- Tapi saat login dengan email & password yang sama → ERROR ❌

### Root Cause
**Email belum dikonfirmasi di Supabase**

Supabase default setting: Email harus dikonfirmasi untuk bisa login.

### Solusi (5 Menit)

#### Step 1: Cek Supabase Dashboard
1. Buka: https://app.supabase.com
2. Pilih project R2B
3. Sidebar kiri → **Authentication** → **Providers**

#### Step 2: Find Email Provider Settings
Scroll ke bawah sampai ketemu **Email** section

#### Step 3: Change Email Confirmation Setting
Cari: **"Email Confirmations"** atau **"Automatically confirm new users"**

**Ubah dari:**
```
Require email confirmation
```

**Menjadi:**
```
Automatic (default) / Automatically confirm new users
```

#### Step 4: Save
Click **Save** button

#### Step 5: Test
1. Signup dengan email baru
2. Langsung bisa login tanpa verifikasi email
3. Should go to dashboard ✅

---

## Error Messages & Solutions

### Error 1: "Email belum dikonfirmasi"

**Penyebab**: Email Confirmation masih di "Require"

**Solusi**:
- Follow step di atas untuk change ke "Automatic"
- Atau buka email dan click verification link

**Cek Progress**:
```
Supabase Dashboard → Authentication → Users
Cari user yang baru signup
Lihat column "Email Verified" → harus TRUE
```

---

### Error 2: "Email atau password salah"

**Penyebab**: Email atau password tidak cocok saat login

**Solusi**:
- Cek email yang digunakan saat signup
- Cek password - case sensitive!
- Gunakan email yang sama saat signup & login

**Reset Password**:
1. Klik "Lupa password?" di login page
2. Enter email
3. Check email untuk reset link
4. Follow link & set password baru

---

### Error 3: "Email already exists"

**Penyebab**: Email sudah terdaftar sebelumnya

**Solusi**:
- Gunakan email berbeda
- Atau reset password dari login page
- Atau delete user di Supabase Dashboard jika test account

**Delete Test User** (Development Only):
```
Supabase Dashboard → Authentication → Users
Klik user yang ingin dihapus
Click "Delete user"
```

---

### Error 4: "Terjadi kesalahan saat pendaftaran"

**Kemungkinan Penyebab**:
1. Password < 6 karakter
2. Email format tidak valid
3. Koneksi internet error
4. Supabase server error

**Solusi**:
- Pastikan password minimal 6 karakter
- Pastikan email format: user@domain.com
- Cek internet connection
- Coba lagi beberapa saat kemudian
- Cek console browser (F12) untuk detail error

---

## Checklist Debugging

Jika masih error, cek berikut:

### ✅ Supabase Configuration
- [ ] Supabase URL set correctly (env var NEXT_PUBLIC_SUPABASE_URL)
- [ ] Supabase Key set correctly (env var NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] Email Confirmations: Set to "Automatic"

### ✅ Signup Test
- [ ] Signup dengan email baru
- [ ] Success message ditampilkan
- [ ] Redirect ke verify-email page

### ✅ Login Test
- [ ] Open login page
- [ ] Enter email dari signup
- [ ] Enter password dari signup (exact match)
- [ ] Should redirect to dashboard

### ✅ Database Check
```
Supabase Dashboard → Authentication → Users
Cari user yang baru signup
Lihat "Email Verified" column
Harus: TRUE (jika Automatic confirmation)
```

### ✅ Browser Console
- Open browser DevTools (F12)
- Go to Console tab
- Cek untuk error messages
- Screenshot jika ada error

---

## Step-by-Step: Fresh Test

### 1. Setup Supabase
- [ ] Set Email Confirmations to "Automatic"
- [ ] Save

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Test Signup
- [ ] Open: http://localhost:3000/auth/signup
- [ ] Fill form dengan data:
  - Name: Test User
  - Email: testuser123@example.com
  - Password: TestPassword123
- [ ] Click "Daftar"
- [ ] Should redirect to verify-email page

### 4. Test Login
- [ ] Click "Masuk Sekarang" atau goto http://localhost:3000/auth/login
- [ ] Fill form:
  - Email: testuser123@example.com
  - Password: TestPassword123
- [ ] Click "Masuk"
- [ ] Should redirect to dashboard ✅

---

## Production Deployment

Untuk production dengan real email verification:

1. **Setup Email Provider**
   - SendGrid, Gmail SMTP, atau lainnya
   - Add credentials di Supabase

2. **Change Email Confirmation**
   - Set to "Require email confirmation"

3. **Test Flow**
   - User signup
   - Email terkirim ke user
   - User click link di email
   - User bisa login

---

## Need More Help?

### Cek Dokumentasi
- `SUPABASE_AUTO_CONFIRM.md` - Setup automatic confirmation
- `README_FINAL.md` - Complete guide

### Check Logs
```bash
# Dev server logs
npm run dev

# Check browser console
F12 → Console tab
```

### Contact Support
Jika masih error setelah semua steps di atas, buka issue dengan:
- Screenshot error
- Langkah-langkah yang sudah di-coba
- Browser console log
