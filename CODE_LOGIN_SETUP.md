# Sistem Login dengan Kode Unik - Setup Guide

## Daftar Isi
1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Admin Panel Setup](#admin-panel-setup)
4. [User Login Flow](#user-login-flow)
5. [API Endpoints](#api-endpoints)
6. [Security Features](#security-features)
7. [Troubleshooting](#troubleshooting)

## Overview

Aplikasi ini menggunakan sistem login berbasis kode unik (6 digit) yang lebih aman dan mudah digunakan dibanding email/password tradisional.

**Fitur Utama:**
- Login tanpa password - hanya perlu email + kode 6 digit
- Kode one-time use - hanya bisa digunakan 1 kali
- Ekspirasi otomatis - kode berlaku 24 jam
- Whitelist users - hanya pengguna terdaftar yang bisa login
- Admin dashboard - manage users dan generate codes
- Audit logging - track semua login attempts

## Database Setup

### 1. Run Migration di Supabase

Buka Supabase Dashboard → SQL Editor → New Query

Copy dan paste file: `supabase/migrations/001_create_auth_tables.sql`

Jalankan query untuk membuat 3 tabel:
- `authorized_users` - Daftar pengguna yang boleh akses
- `login_codes` - Kode login (one-time, 24h expiry)
- `login_history` - Audit log semua login

### 2. Set First Admin User

Buka SQL Editor, jalankan:

```sql
INSERT INTO public.authorized_users (id, email, name, role, is_active)
VALUES (gen_random_uuid(), 'admin@perusahaan.com', 'Admin', 'admin', TRUE);
```

Ganti `admin@perusahaan.com` dengan email admin Anda.

### 3. Add More Users (Optional)

Buka SQL Editor:

```sql
INSERT INTO public.authorized_users (email, name, role, is_active)
VALUES 
  ('user1@perusahaan.com', 'User 1', 'user', TRUE),
  ('user2@perusahaan.com', 'User 2', 'user', TRUE);
```

## Admin Panel Setup

### Access Admin Panel

1. Go to: `http://localhost:3000/admin`
2. Login dengan kode yang digenerate

### Admin Features

**Tab: Pengguna Terdaftar**
- Lihat semua pengguna yang terdaftar
- Delete pengguna jika diperlukan

**Tab: Kode Akses**
- Lihat semua kode yang aktif
- Copy kode untuk dikirim ke user
- Kode akan otomatis expire setelah 24 jam

**Tab: Tambah Pengguna**
- Add pengguna baru ke whitelist
- Setelah ditambah, pengguna bisa login dengan kode

## User Login Flow

### Step 1: User Masuk Email
```
1. User buka http://localhost:3000/auth/login
2. Masukkan email (misal: user@perusahaan.com)
3. Click "Minta Kode"
4. Sistem generate kode 6 digit dan store di database
```

### Step 2: User Verify Kode
```
1. User receive kode via email (atau lihat di admin panel di development)
2. User masukkan kode 6 digit di halaman verify
3. Click "Verifikasi & Masuk"
4. Jika valid → redirect ke dashboard
5. Jika invalid → tampilkan error message
```

### Security Checks
- Email harus terdaftar di authorized_users
- Kode harus valid (format 6 digit)
- Kode tidak boleh sudah digunakan
- Kode tidak boleh sudah expired (>24 jam)

## API Endpoints

### Public Endpoints

**POST /api/auth/generate-code**
- Request kode untuk login
- Body: `{ "email": "user@perusahaan.com" }`
- Response: Code generated + expiry time
- Security: Email validation, rate limiting

**POST /api/auth/verify-code**
- Verify kode dan login
- Body: `{ "email": "user@perusahaan.com", "code": "123456" }`
- Response: User data + session token
- Security: Single-use enforcement, expiry check

### Admin-Only Endpoints

**GET /api/admin/users**
- List semua authorized users
- Requires: Admin role
- Response: Array of users

**POST /api/admin/users**
- Add pengguna baru
- Body: `{ "email": "...", "name": "..." }`
- Requires: Admin role

**DELETE /api/admin/users/[userId]**
- Delete user
- Requires: Admin role

**GET /api/admin/codes**
- List semua login codes
- Requires: Admin role
- Response: Array of codes

**POST /api/admin/generate-code**
- Generate kode untuk user tertentu
- Body: `{ "email": "..." }`
- Requires: Admin role
- Response: Generated code + expiry

## Security Features

### 1. One-Time Use Codes
- Setiap kode hanya bisa digunakan 1 kali
- Setelah verified, kode di-mark sebagai `is_used: true`
- Attempt menggunakan kode yang sudah used → error

### 2. 24-Hour Expiration
- Kode berlaku 24 jam dari pembuatan
- Expired codes tidak bisa digunakan
- Automatic cleanup via database indexes

### 3. Email Whitelist
- Hanya email yang di-authorized_users yang bisa login
- User tidak terdaftar → tidak bisa request kode
- Add user via admin panel dulu sebelum bisa login

### 4. Role-Based Access
- `admin` role: Akses admin panel + manage users & codes
- `user` role: Hanya akses dashboard
- Enforce di setiap API endpoint

### 5. Audit Logging
- Setiap login attempt (success/failed) di-log ke `login_history`
- Track: IP address, user agent, timestamp, reason
- Admin bisa lihat history via database

### 6. Rate Limiting (TODO)
- Prevent brute force: Max 5 wrong codes per email per hour
- Implement di `/api/auth/verify-code`

## Development vs Production

### Development Mode
- Kode ditampilkan di response API
- Useful untuk testing tanpa email setup
- ONLY enable di development environment

### Production Mode
- Kode HANYA dikirim via email
- Tidak ditampilkan di response
- Require email provider (SendGrid, Gmail SMTP, dll)

## Troubleshooting

### User tidak bisa request kode
**Kemungkinan:**
- Email belum terdaftar di `authorized_users`
- User sudah inactive (`is_active: false`)

**Solusi:**
- Admin panel → Tab "Tambah Pengguna" → add email
- Atau SQL: `INSERT INTO authorized_users (email, name) VALUES (...)`

### Kode tidak diterima user
**Kemungkinan:**
- Email provider belum setup (development: kode ditampilkan di admin)
- Email masuk ke spam folder
- Generated code di-expire

**Solusi:**
- Di development: check admin panel atau console log
- Di production: setup email provider (SendGrid, etc)

### Kode sudah expired
**Kemungkinan:**
- Lebih dari 24 jam sejak kode di-generate
- User lupa menggunakan kode

**Solusi:**
- Request kode baru dengan click "Ubah Email" → re-request code
- Admin bisa generate ulang dari admin panel

### Login gagal "Email belum dikonfirmasi"
**Penyebab:**
- Transition dari sistem lama (email/password)
- User belum verify email mereka

**Solusi:**
- User login via kode (bukan email/password)
- atau reset user di authorized_users

## Testing Checklist

- [ ] Database migration berjalan tanpa error
- [ ] Admin user berhasil dibuat
- [ ] Admin bisa akses `/admin` panel
- [ ] Bisa add user baru via admin panel
- [ ] User bisa request kode di login page
- [ ] Kode tergenerate dan visible (di development)
- [ ] User bisa verify kode dan login
- [ ] User redirect ke dashboard
- [ ] Invalid kode → error message
- [ ] Expired kode → error message
- [ ] Admin bisa lihat login history
- [ ] Build berhasil tanpa error

## Deployment Notes

1. **Environment Variables:**
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NODE_ENV (production)

2. **Database:**
   - Run migration di Supabase production
   - Setup RLS policies (included in migration)
   - Backup authorized_users regularly

3. **Email Provider:**
   - Setup SendGrid / Gmail SMTP
   - Configure email template (optional)
   - Test email delivery sebelum go-live

4. **Security:**
   - Enforce HTTPS
   - Setup rate limiting di reverse proxy
   - Monitor login_history untuk suspicious activity
   - Regular audit of authorized_users

## Support

Untuk pertanyaan atau issues, periksa:
1. Console browser (F12) untuk error messages
2. Supabase logs untuk API errors
3. Check database: SELECT * FROM login_history WHERE email = '...'
