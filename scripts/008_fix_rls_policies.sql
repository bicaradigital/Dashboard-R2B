-- Fix Row Level Security policies for cost_allocations table
-- Adding proper RLS policies to allow authenticated users to manage cost allocations

-- Enable RLS on cost_allocations if not already enabled
ALTER TABLE cost_allocations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own cost allocations" ON cost_allocations;
DROP POLICY IF EXISTS "Users can insert their own cost allocations" ON cost_allocations;
DROP POLICY IF EXISTS "Users can update their own cost allocations" ON cost_allocations;
DROP POLICY IF EXISTS "Users can delete their own cost allocations" ON cost_allocations;

-- Create policies for cost_allocations table
-- Allow users to view cost allocations for their own transactions
CREATE POLICY "Users can view their own cost allocations" ON cost_allocations
    FOR SELECT USING (
        transaction_id IN (
            SELECT id FROM transactions WHERE user_id = auth.uid()
        )
    );

-- Allow users to insert cost allocations for their own transactions
CREATE POLICY "Users can insert their own cost allocations" ON cost_allocations
    FOR INSERT WITH CHECK (
        transaction_id IN (
            SELECT id FROM transactions WHERE user_id = auth.uid()
        )
    );

-- Allow users to update cost allocations for their own transactions
CREATE POLICY "Users can update their own cost allocations" ON cost_allocations
    FOR UPDATE USING (
        transaction_id IN (
            SELECT id FROM transactions WHERE user_id = auth.uid()
        )
    );

-- Allow users to delete cost allocations for their own transactions
CREATE POLICY "Users can delete their own cost allocations" ON cost_allocations
    FOR DELETE USING (
        transaction_id IN (
            SELECT id FROM transactions WHERE user_id = auth.uid()
        )
    );

-- Also ensure hpp_calculations table has proper RLS policies
ALTER TABLE hpp_calculations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own hpp calculations" ON hpp_calculations;

-- Create comprehensive policy for hpp_calculations
CREATE POLICY "Users can manage their own hpp calculations" ON hpp_calculations
    FOR ALL USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Ensure transactions table has proper RLS policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own transactions" ON transactions;

-- Create comprehensive policy for transactions
CREATE POLICY "Users can manage their own transactions" ON transactions
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
