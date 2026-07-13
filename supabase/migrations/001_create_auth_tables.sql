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
CREATE INDEX idx_login_history_created_at ON public.login_history(created_at);

-- Add comment for documentation
COMMENT ON TABLE public.authorized_users IS 'Whitelist of authorized users for code-based login';
COMMENT ON TABLE public.login_codes IS 'One-time use login codes with 24-hour expiration';
COMMENT ON TABLE public.login_history IS 'Audit log of all login attempts';
