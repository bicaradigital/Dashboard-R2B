-- Replaced simple schema with comprehensive R2B Finance Database Schema
-- R2B Finance Database Schema
-- File: R2B_finance_schema.sql
-- PostgreSQL compatible SQL (tested with Postgres 13+ / Supabase)

-- ==============================
-- 1. SCHEMA / EXTENSIONS
-- ==============================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================
-- 2. ENUMS
-- ==============================
CREATE TYPE invoice_status AS ENUM ('draft','sent','paid','partial','cancelled');
CREATE TYPE payment_method AS ENUM ('cash','bank_transfer','gopay','qris','credit_card','other');
CREATE TYPE account_type AS ENUM ('asset','liability','equity','revenue','expense');

-- ==============================
-- 3. CORE TABLES
-- ==============================

-- users (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- e.g. admin, finance, sales, viewer
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- customers (integrates with CRM)
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  crm_id TEXT, -- optional id from CRM system
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- products / services / trainings (single catalog)
CREATE TABLE IF NOT EXISTS public.items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  unit TEXT DEFAULT 'pcs',
  price numeric(14,2) NOT NULL DEFAULT 0,
  item_type TEXT DEFAULT 'product', -- product, service, training
  stock integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  issued_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  status invoice_status NOT NULL DEFAULT 'draft',
  currency TEXT DEFAULT 'IDR',
  notes TEXT,
  subtotal numeric(14,2) DEFAULT 0,
  tax numeric(14,2) DEFAULT 0,
  discount numeric(14,2) DEFAULT 0,
  total numeric(14,2) DEFAULT 0,
  pdf_url TEXT,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- invoice items
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.items(id) ON DELETE SET NULL,
  description TEXT,
  qty numeric(12,3) DEFAULT 1,
  unit_price numeric(14,2) DEFAULT 0,
  line_total numeric(14,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount numeric(14,2) NOT NULL,
  method payment_method DEFAULT 'bank_transfer',
  paid_at timestamptz NOT NULL DEFAULT now(),
  reference TEXT,
  receipt_url TEXT,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- expenses (pengeluaran)
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  amount numeric(14,2) NOT NULL,
  description TEXT,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- accounts (chart of accounts)
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type account_type NOT NULL,
  parent_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- journal_entries (double-entry bookkeeping)
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.journal_lines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id uuid REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.accounts(id) ON DELETE RESTRICT,
  debit numeric(14,2) DEFAULT 0,
  credit numeric(14,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id uuid,
  metadata JSONB,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ==============================
-- 4. INDEXES & HELPERS
-- ==============================
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);

-- helper: function to auto-generate invoice numbers (simple year-based)
CREATE OR REPLACE FUNCTION next_invoice_number() RETURNS TEXT AS $$
DECLARE
  seq_id bigint;
  y TEXT := to_char(CURRENT_DATE, 'YYYY');
BEGIN
  -- use a dedicated sequence per year
  EXECUTE format('CREATE SEQUENCE IF NOT EXISTS invoice_no_%s_seq', y);
  EXECUTE format('SELECT nextval(''invoice_no_%s_seq'')', y) INTO seq_id;
  RETURN format('INV-%s-%06s', y, seq_id);
END;
$$ LANGUAGE plpgsql;

-- trigger to set invoice_number if not provided
CREATE OR REPLACE FUNCTION invoices_before_insert_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := next_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoices_before_insert
BEFORE INSERT ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION invoices_before_insert_trigger();

-- trigger to calculate line_total and invoice totals
CREATE OR REPLACE FUNCTION invoice_items_compute_totals() RETURNS TRIGGER AS $$
DECLARE
  s numeric := 0;
BEGIN
  NEW.line_total := COALESCE(NEW.qty,0) * COALESCE(NEW.unit_price,0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_invoice_items_before_insert
BEFORE INSERT OR UPDATE ON public.invoice_items
FOR EACH ROW
EXECUTE FUNCTION invoice_items_compute_totals();

-- recompute invoice totals when items change
CREATE OR REPLACE FUNCTION recompute_invoice_totals() RETURNS TRIGGER AS $$
DECLARE
  s numeric := 0;
  t numeric := 0;
  inv_id uuid;
BEGIN
  -- Handle DELETE case
  IF TG_OP = 'DELETE' THEN
    inv_id := OLD.invoice_id;
  ELSE
    inv_id := NEW.invoice_id;
  END IF;
  
  SELECT COALESCE(SUM(line_total),0) INTO s FROM public.invoice_items WHERE invoice_id = inv_id;
  SELECT 
    s - COALESCE(discount,0) + COALESCE(tax,0) INTO t 
  FROM public.invoices WHERE id = inv_id;
  
  UPDATE public.invoices SET subtotal = s, total = t, updated_at = now() WHERE id = inv_id;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoice_items_after_insert
AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
FOR EACH ROW
EXECUTE FUNCTION recompute_invoice_totals();

-- when payment added, update invoice status
CREATE OR REPLACE FUNCTION payments_after_insert() RETURNS TRIGGER AS $$
DECLARE
  paid_sum numeric := 0;
  inv_total numeric := 0;
BEGIN
  SELECT COALESCE(SUM(amount),0) INTO paid_sum FROM public.payments WHERE invoice_id = NEW.invoice_id;
  SELECT total INTO inv_total FROM public.invoices WHERE id = NEW.invoice_id;
  IF paid_sum >= inv_total THEN
    UPDATE public.invoices SET status = 'paid', updated_at = now() WHERE id = NEW.invoice_id;
  ELSIF paid_sum > 0 AND paid_sum < inv_total THEN
    UPDATE public.invoices SET status = 'partial', updated_at = now() WHERE id = NEW.invoice_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payments_after_insert
AFTER INSERT ON public.payments
FOR EACH ROW
EXECUTE FUNCTION payments_after_insert();

-- ==============================
-- 5. REPORT VIEWS (Simple)
-- ==============================
-- Profit & Loss (Laba Rugi) by period
CREATE OR REPLACE VIEW view_profit_and_loss AS
SELECT
  date_trunc('month', je.entry_date)::date AS period_start,
  SUM(CASE WHEN a.type = 'revenue' THEN jl.credit - jl.debit ELSE 0 END) AS revenue,
  SUM(CASE WHEN a.type = 'expense' THEN jl.debit - jl.credit ELSE 0 END) AS expense,
  SUM(CASE WHEN a.type = 'revenue' THEN jl.credit - jl.debit ELSE 0 END) - SUM(CASE WHEN a.type = 'expense' THEN jl.debit - jl.credit ELSE 0 END) AS net_profit
FROM public.journal_entries je
JOIN public.journal_lines jl ON jl.journal_entry_id = je.id
JOIN public.accounts a ON a.id = jl.account_id
GROUP BY 1
ORDER BY 1 DESC;

-- Balance Sheet (very simplified snapshot per account)
CREATE OR REPLACE VIEW view_balance_sheet AS
SELECT
  a.code, a.name, a.type,
  SUM(jl.debit - jl.credit) AS balance
FROM public.accounts a
LEFT JOIN public.journal_lines jl ON jl.account_id = a.id
GROUP BY a.code, a.name, a.type
ORDER BY a.code;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for customers
CREATE POLICY "Users can view all customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Users can insert customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update customers" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "Users can delete customers" ON public.customers FOR DELETE USING (true);

-- Create RLS policies for items
CREATE POLICY "Users can view all items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Users can insert items" ON public.items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update items" ON public.items FOR UPDATE USING (true);
CREATE POLICY "Users can delete items" ON public.items FOR DELETE USING (true);

-- Create RLS policies for invoices
CREATE POLICY "Users can view all invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Users can insert invoices" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update invoices" ON public.invoices FOR UPDATE USING (true);
CREATE POLICY "Users can delete invoices" ON public.invoices FOR DELETE USING (true);

-- Create RLS policies for invoice items
CREATE POLICY "Users can view all invoice items" ON public.invoice_items FOR SELECT USING (true);
CREATE POLICY "Users can insert invoice items" ON public.invoice_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update invoice items" ON public.invoice_items FOR UPDATE USING (true);
CREATE POLICY "Users can delete invoice items" ON public.invoice_items FOR DELETE USING (true);

-- Create RLS policies for payments
CREATE POLICY "Users can view all payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Users can insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update payments" ON public.payments FOR UPDATE USING (true);
CREATE POLICY "Users can delete payments" ON public.payments FOR DELETE USING (true);

-- Create RLS policies for expenses
CREATE POLICY "Users can view all expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Users can insert expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Users can delete expenses" ON public.expenses FOR DELETE USING (true);

-- Create RLS policies for accounts
CREATE POLICY "Users can view all accounts" ON public.accounts FOR SELECT USING (true);
CREATE POLICY "Users can insert accounts" ON public.accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update accounts" ON public.accounts FOR UPDATE USING (true);
CREATE POLICY "Users can delete accounts" ON public.accounts FOR DELETE USING (true);

-- Create RLS policies for journal entries
CREATE POLICY "Users can view all journal entries" ON public.journal_entries FOR SELECT USING (true);
CREATE POLICY "Users can insert journal entries" ON public.journal_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update journal entries" ON public.journal_entries FOR UPDATE USING (true);
CREATE POLICY "Users can delete journal entries" ON public.journal_entries FOR DELETE USING (true);

-- Create RLS policies for journal lines
CREATE POLICY "Users can view all journal lines" ON public.journal_lines FOR SELECT USING (true);
CREATE POLICY "Users can insert journal lines" ON public.journal_lines FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update journal lines" ON public.journal_lines FOR UPDATE USING (true);
CREATE POLICY "Users can delete journal lines" ON public.journal_lines FOR DELETE USING (true);

-- Create RLS policies for audit logs
CREATE POLICY "Users can view all audit logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
