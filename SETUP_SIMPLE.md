# Setup Simpel - 3 Langkah Mudah

## Opsi 1: AUTO-SETUP (PALING MUDAH) ✨

1. Start aplikasi:
   ```bash
   npm run dev
   ```

2. Buka browser:
   ```
   http://localhost:3000/setup
   ```

3. Klik tombol "Mulai Setup"
4. Isi data admin (nama & email)
5. Done! ✓

Selesai, aplikasi langsung ready untuk login!

---

## Opsi 2: MANUAL SETUP (Jika Opsi 1 tidak berhasil)

### Step 1: Buka Supabase Dashboard
- Go to: https://app.supabase.com
- Pilih project "Dashboard-R2B"

### Step 2: Copy & Paste SQL
1. Left sidebar → **SQL Editor**
2. **New Query**
3. Copy dari file: `supabase/migrations/002_simple_auth_tables.sql`
4. Paste ke editor
5. **Click "Run"**

Tunggu sampai selesai (< 5 detik).

### Step 3: Buat Admin User
Masih di SQL Editor, run:

```sql
INSERT INTO public.authorized_users (email, name, role, is_active)
VALUES ('your-email@perusahaan.com', 'Admin', 'admin', TRUE);
```

Ganti `your-email@perusahaan.com` dengan email Anda.

Click "Run"

### Step 4: Login & Test
- Go to: `http://localhost:3000/auth/login`
- Masukkan email
- Click "Minta Kode"
- Check browser console untuk kode 6 digit
- Masukkan kode → Login!

---

## Troubleshooting

### Error: "column created_at does not exist"
**Solution**: Run migration 2 (simple version) bukan migration 1

### Error: "Email sudah terdaftar"
**Solution**: Gunakan email berbeda atau hapus user di Supabase

### Tidak terima kode email
**Solution**: Check browser console (kode ditampilkan di development mode)

---

## Selesai!

Aplikasi sudah siap pakai dengan sistem login kode unik. Hanya authorized users yang bisa akses!
