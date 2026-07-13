-- Simplified auth tables (no complex RLS)
-- Run this if 001 migration fails

CREATE TABLE IF NOT EXISTS public.authorized_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.login_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(8) UNIQUE NOT NULL,
  user_id UUID,
  email VARCHAR(255) NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS public.login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email VARCHAR(255) NOT NULL,
  login_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(50),
  reason VARCHAR(255)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_authorized_users_email ON public.authorized_users(email);
CREATE INDEX IF NOT EXISTS idx_login_codes_code ON public.login_codes(code);
CREATE INDEX IF NOT EXISTS idx_login_codes_email ON public.login_codes(email);
CREATE INDEX IF NOT EXISTS idx_login_codes_expires_at ON public.login_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON public.login_history(user_id);

-- Optional: Add a test admin user (change email)
-- INSERT INTO public.authorized_users (email, name, role, is_active)
-- VALUES ('admin@test.com', 'Admin', 'admin', TRUE);
