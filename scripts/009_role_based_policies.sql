-- Update RLS policies to implement role-based access control
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all customers" ON public.customers;
DROP POLICY IF EXISTS "Users can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view all items" ON public.items;
DROP POLICY IF EXISTS "Users can insert items" ON public.items;
DROP POLICY IF EXISTS "Users can update items" ON public.items;
DROP POLICY IF EXISTS "Users can delete items" ON public.items;
DROP POLICY IF EXISTS "Users can view all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can view all invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can insert invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can update invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can delete invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view all expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete expenses" ON public.expenses;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR email = 'rumahretortbersama1@gmail.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user can edit (admin only)
CREATE OR REPLACE FUNCTION can_edit() RETURNS BOOLEAN AS $$
BEGIN
  RETURN is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "All users can view profiles" ON public.profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Customers policies - admin can edit, others can view
CREATE POLICY "All users can view customers" ON public.customers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can insert customers" ON public.customers FOR INSERT WITH CHECK (can_edit());
CREATE POLICY "Admin can update customers" ON public.customers FOR UPDATE USING (can_edit());
CREATE POLICY "Admin can delete customers" ON public.customers FOR DELETE USING (can_edit());

-- Items policies - admin can edit, others can view
CREATE POLICY "All users can view items" ON public.items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can insert items" ON public.items FOR INSERT WITH CHECK (can_edit());
CREATE POLICY "Admin can update items" ON public.items FOR UPDATE USING (can_edit());
CREATE POLICY "Admin can delete items" ON public.items FOR DELETE USING (can_edit());

-- Invoices policies - admin can edit, others can view
CREATE POLICY "All users can view invoices" ON public.invoices FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can insert invoices" ON public.invoices FOR INSERT WITH CHECK (can_edit());
CREATE POLICY "Admin can update invoices" ON public.invoices FOR UPDATE USING (can_edit());
CREATE POLICY "Admin can delete invoices" ON public.invoices FOR DELETE USING (can_edit());

-- Invoice items policies - admin can edit, others can view
CREATE POLICY "All users can view invoice items" ON public.invoice_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can insert invoice items" ON public.invoice_items FOR INSERT WITH CHECK (can_edit());
CREATE POLICY "Admin can update invoice items" ON public.invoice_items FOR UPDATE USING (can_edit());
CREATE POLICY "Admin can delete invoice items" ON public.invoice_items FOR DELETE USING (can_edit());

-- Payments policies - admin can edit, others can view
CREATE POLICY "All users can view payments" ON public.payments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can insert payments" ON public.payments FOR INSERT WITH CHECK (can_edit());
CREATE POLICY "Admin can update payments" ON public.payments FOR UPDATE USING (can_edit());
CREATE POLICY "Admin can delete payments" ON public.payments FOR DELETE USING (can_edit());

-- Expenses policies - admin can edit, others can view
CREATE POLICY "All users can view expenses" ON public.expenses FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can insert expenses" ON public.expenses FOR INSERT WITH CHECK (can_edit());
CREATE POLICY "Admin can update expenses" ON public.expenses FOR UPDATE USING (can_edit());
CREATE POLICY "Admin can delete expenses" ON public.expenses FOR DELETE USING (can_edit());

-- Transactions policies - admin can edit, others can view
CREATE POLICY "All users can view transactions" ON public.transactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can insert transactions" ON public.transactions FOR INSERT WITH CHECK (can_edit());
CREATE POLICY "Admin can update transactions" ON public.transactions FOR UPDATE USING (can_edit());
CREATE POLICY "Admin can delete transactions" ON public.transactions FOR DELETE USING (can_edit());

-- Cost allocations policies - admin can edit, others can view
CREATE POLICY "All users can view cost allocations" ON public.cost_allocations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can insert cost allocations" ON public.cost_allocations FOR INSERT WITH CHECK (can_edit());
CREATE POLICY "Admin can update cost allocations" ON public.cost_allocations FOR UPDATE USING (can_edit());
CREATE POLICY "Admin can delete cost allocations" ON public.cost_allocations FOR DELETE USING (can_edit());

-- HPP calculations policies - admin can edit, others can view
CREATE POLICY "All users can view hpp calculations" ON public.hpp_calculations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can insert hpp calculations" ON public.hpp_calculations FOR INSERT WITH CHECK (can_edit());
CREATE POLICY "Admin can update hpp calculations" ON public.hpp_calculations FOR UPDATE USING (can_edit());
CREATE POLICY "Admin can delete hpp calculations" ON public.hpp_calculations FOR DELETE USING (can_edit());

-- Packaging types policies - admin can edit, others can view
CREATE POLICY "All users can view packaging types" ON public.packaging_types FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can insert packaging types" ON public.packaging_types FOR INSERT WITH CHECK (can_edit());
CREATE POLICY "Admin can update packaging types" ON public.packaging_types FOR UPDATE USING (can_edit());
CREATE POLICY "Admin can delete packaging types" ON public.packaging_types FOR DELETE USING (can_edit());

-- Accounts, journal entries, and audit logs policies
CREATE POLICY "All users can view accounts" ON public.accounts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can manage accounts" ON public.accounts FOR ALL USING (can_edit());

CREATE POLICY "All users can view journal entries" ON public.journal_entries FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can manage journal entries" ON public.journal_entries FOR ALL USING (can_edit());

CREATE POLICY "All users can view journal lines" ON public.journal_lines FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can manage journal lines" ON public.journal_lines FOR ALL USING (can_edit());

CREATE POLICY "All users can view audit logs" ON public.audit_logs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
