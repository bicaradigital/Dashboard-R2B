# Simple Role-Based Login System

Sistem login yang sangat mudah dengan 3 role: Admin, Manager, Director.

## Setup (3 Langkah Mudah)

### 1. Run Aplikasi
```bash
npm run dev
```

### 2. Buka Setup Page
```
http://localhost:3000/simple-setup
```

### 3. Klik "Mulai Setup"
- Database otomatis dibuat
- Tambahkan user dengan role:
  - Admin (akses penuh)
  - Manager (akses menengah)
  - Director (akses direktur)

## Cara Login

1. Go to: `http://localhost:3000/auth/login`
2. Masukkan username dan password
3. Klik "Masuk"
4. Masuk ke dashboard dengan role Anda

## Database Schema

```
users table:
- id (UUID)
- username (unique)
- password
- full_name
- role (admin, manager, director)
- is_active (boolean)
- created_at

login_logs table:
- id (UUID)
- user_id
- login_time
- status (success/failed)
```

## User Examples (Jika ingin manual)

```
Admin User:
- Username: admin
- Password: admin123
- Role: admin

Manager User:
- Username: manager
- Password: manager123
- Role: manager

Director User:
- Username: director
- Password: director123
- Role: director
```

## Features

✓ Simple username/password login
✓ 3 role-based access (admin, manager, director)
✓ Login history/audit log
✓ Easy setup wizard
✓ No complex email verification
✓ No codes or OTP needed

## Security Notes (Production)

- Use bcrypt for password hashing
- Implement JWT tokens instead of cookies
- Add rate limiting
- Use HTTPS
- Add SQL injection protection

## Troubleshooting

**Error: table not found**
- Run setup wizard at `/simple-setup`
- Make sure Supabase project is connected

**Can't login**
- Check username and password spelling
- Make sure user is active (is_active = true)
- Check browser console for errors

**Forgot password**
- No password reset yet (add later if needed)
- Contact admin to create new user
