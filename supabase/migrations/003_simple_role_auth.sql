-- Simple Role-Based Authentication
-- Only 3 roles: admin, manager, director
-- Simple username/password login

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'director')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  login_time TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'success'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON public.login_logs(user_id);

-- Optional: Add test users (change passwords in production!)
-- INSERT INTO public.users (username, password, full_name, role, is_active) VALUES
-- ('admin', 'admin123', 'Admin User', 'admin', TRUE),
-- ('manager', 'manager123', 'Manager User', 'manager', TRUE),
-- ('director', 'director123', 'Director User', 'director', TRUE);
