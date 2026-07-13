# Supabase Email Auto-Confirmation Setup

## ⚠️ Problem: Users Can't Login After Signup

Saat user mendaftar, email mereka **belum terverifikasi**. Saat login, Supabase memblokir karena email belum dikonfirmasi.

**Solusi**: Enable "Automatic Email Confirmation" di Supabase Dashboard.

---

## Solution: 5 Menit Setup

### Step 1: Buka Supabase Dashboard
```
https://app.supabase.com
```

### Step 2: Pilih Project Anda
Klik project R2B Anda

### Step 3: Pergi ke Authentication Settings
1. Left sidebar → **Authentication**
2. Click **Providers**
3. Scroll ke bawah atau cari **Email** provider

### Step 4: Enable Auto Confirmation
Cari setting: **"Email Confirmations"**

Ubah dari:
```
❌ Require email confirmations
```

Menjadi:
```
✅ Automatic (default)
```

**Atau** cari checkbox:
```
☑ Automatically confirm new users
```

### Step 5: Save
Click **Save** button di bawah

---

## Verifikasi Berhasil

Setelah di-save, test dengan:

1. **Buka signup page**
   ```
   http://localhost:3000/auth/signup
   ```

2. **Daftar dengan data baru**
   - Name: Test User
   - Email: test@example.com
   - Password: TestPass123

3. **Klik "Masuk" dari verify-email page**
   ```
   http://localhost:3000/auth/login
   ```

4. **Login dengan email & password yang sama**
   - Email: test@example.com
   - Password: TestPass123

5. **Seharusnya masuk ke dashboard** ✅

---

## Jika Masih Error

### Error: "User email not confirmed"
- Kemungkinan Email Confirmation masih "Require"
- Solution: Ulang Step 4

### Error: "Invalid credentials"
- Email atau password salah
- Solution: Cek ulang email/password saat signup

### Error: "Email already exists"
- Email sudah terdaftar
- Solution: Gunakan email berbeda atau reset password di login page

---

## Untuk Production (Email Real)

Setelah development, untuk send email verifikasi ke inbox user:

1. Setup **Email Provider** di Supabase:
   - SendGrid
   - Gmail SMTP
   - Custom SMTP

2. Change Email Confirmation ke:
   ```
   Require email confirmation
   ```

3. User akan menerima email verifikasi untuk confirm

---

## Video Tutorial (Optional)

Jika prefer video, search: "Supabase Email Auto Confirmation"

---

**Sekarang semua user bisa signup dan login langsung tanpa perlu verify email!** ✅
