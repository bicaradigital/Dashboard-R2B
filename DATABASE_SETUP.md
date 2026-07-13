# Database Setup untuk Code-Based Login System

Error `column "created_at" does not exist` terjadi karena database tables belum dibuat.

## Quick Fix (2 Menit)

### Step 1: Buka Supabase Dashboard
- Go to: https://app.supabase.com
- Login dengan akun Anda
- Pilih project "Dashboard-R2B"

### Step 2: Buka SQL Editor
1. Left sidebar → klik **"SQL Editor"**
2. Klik **"New Query"**

### Step 3: Copy-Paste Migration SQL
Copy semua code dari file berikut dan paste ke SQL Editor:
- File: `supabase/migrations/001_create_auth_tables.sql`

Atau copy dari sini:

```sql
-- Create authorized_users table
CREATE TABLE public.authorized_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user', -- 'admin' or 'user'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create login_codes table
CREATE TABLE public.login_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(8) UNIQUE NOT NULL,
  user_id UUID REFERENCES public.authorized_users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Create login_history table
CREATE TABLE public.login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.authorized_users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(50), -- 'success' or 'failed'
  reason VARCHAR(255)
);

-- Enable Row Level Security
ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

-- Create policies for authorized_users
CREATE POLICY "Users can view their own profile" ON public.authorized_users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" ON public.authorized_users
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT id::text FROM public.authorized_users WHERE role = 'admin'
    )
  );

-- Create policies for login_codes (no direct access, only via API)
CREATE POLICY "No direct access to login codes" ON public.login_codes
  FOR ALL USING (FALSE);

-- Create policies for login_history
CREATE POLICY "Users can view their own login history" ON public.login_history
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all login history" ON public.login_history
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT id::text FROM public.authorized_users WHERE role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_authorized_users_email ON public.authorized_users(email);
CREATE INDEX idx_authorized_users_role ON public.authorized_users(role);
CREATE INDEX idx_login_codes_code ON public.login_codes(code);
CREATE INDEX idx_login_codes_email ON public.login_codes(email);
CREATE INDEX idx_login_codes_expires_at ON public.login_codes(expires_at);
CREATE INDEX idx_login_history_user_id ON public.login_history(user_id);
```

### Step 4: Run Query
1. Click **"Run"** button (atau Ctrl+Enter)
2. Tunggu sampai selesai (biasanya < 5 detik)
3. Seharusnya tidak ada error, hanya status "Success"

### Step 5: Setup First Admin User
Masih di SQL Editor, jalankan query ini untuk membuat admin user pertama:

```sql
INSERT INTO public.authorized_users (id, email, name, role, is_active)
VALUES (
  gen_random_uuid(),
  'your-email@perusahaan.com',
  'Admin User',
  'admin',
  TRUE
);
```

**Ganti `your-email@perusahaan.com`** dengan email Anda sendiri.

### Step 6: Get Your Auth User ID
Kita juga perlu create user di Supabase Auth untuk login. Di SQL Editor:

```sql
-- List authenticated users (lihat id dari auth.users)
SELECT id, email FROM auth.users LIMIT 5;
```

Kalau belum ada, kita perlu insert ke auth.users juga. Tapi biasanya sudah ada dari attempts sebelumnya.

### Step 7: Test Aplikasi
1. Go to: `http://localhost:3000/auth/login`
2. Masukkan email: `your-email@perusahaan.com`
3. Click "Minta Kode"
4. Check console log atau email untuk kode 6 digit
5. Masukkan kode
6. Login berhasil!

## Troubleshooting

### Error: "relation does not exist"
**Penyebab**: Tables belum dibuat
**Solusi**: Ikuti step 1-4 di atas

### Error: "duplicate key value"
**Penyebab**: Email sudah ada di database
**Solusi**: Gunakan email yang berbeda atau delete user lama dulu

### Error: "Permission denied"
**Penyebab**: RLS policies belum benar
**Solusi**: Pastikan roles sudah di-setup dengan benar

### Kode tidak terkirim ke email
**Penyebab**: Email provider belum di-setup
**Solusi**: Setup SendGrid atau Gmail SMTP di Supabase email settings

**For development testing**: Kode ditampilkan di console/response (lihat di browser DevTools)

## Verify Database Setup

Untuk memastikan semuanya benar, run query ini:

```sql
-- Check if tables exist and have data
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('authorized_users', 'login_codes', 'login_history');

-- Check authorized_users
SELECT * FROM public.authorized_users;

-- Check login_codes
SELECT * FROM public.login_codes LIMIT 5;

-- Check login_history
SELECT * FROM public.login_history LIMIT 5;
```

Semuanya harus return tanpa error.

## Next Steps

1. ✅ Setup database tables (Done - ikuti guide ini)
2. ✅ Create admin user (Done - via SQL)
3. Test login flow at `http://localhost:3000/auth/login`
4. Add more users via `/admin` dashboard
5. Deploy to production ketika siap

---

**Setelah semua ini selesai, error `created_at` column tidak akan muncul lagi!**
