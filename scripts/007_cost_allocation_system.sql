-- Add cost allocation system for automatic retort cost breakdown
CREATE TABLE IF NOT EXISTS cost_allocations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    allocation_type VARCHAR(50) NOT NULL, -- 'electricity', 'gas', 'water', 'rent', etc.
    amount DECIMAL(15,2) NOT NULL,
    percentage DECIMAL(5,2), -- percentage of total income
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cost_allocations_transaction_id ON cost_allocations(transaction_id);
CREATE INDEX IF NOT EXISTS idx_cost_allocations_type ON cost_allocations(allocation_type);

-- Function to automatically create cost allocations for retort income
CREATE OR REPLACE FUNCTION create_retort_cost_allocations()
RETURNS TRIGGER AS $$
DECLARE
    retort_income DECIMAL(15,2);
    allocation_data RECORD;
BEGIN
    -- Only process if this is a retort income transaction
    IF NEW.type = 'income' AND LOWER(NEW.category) LIKE '%retort%' THEN
        retort_income := NEW.amount;
        
        -- Define cost allocation percentages based on your HPP calculations
        -- These percentages are based on the examples you provided
        FOR allocation_data IN 
            SELECT * FROM (VALUES
                ('electricity', 0.0177), -- ~1.77% (8,385 / 475,500)
                ('gas', 0.0126), -- ~1.26% (6,000 / 475,500)
                ('water', 0.0404), -- ~4.04% (19,200 / 475,500)
                ('rent', 0.0292), -- ~2.92% (13,900 / 475,500)
                ('operational', 0.0962), -- ~9.62% (45,746 / 475,500)
                ('operational_reserve', 0.0321), -- ~3.21% (15,248 / 475,500)
                ('labor', 0.3155), -- ~31.55% (150,000 / 475,500)
                ('tax', 0.0038), -- ~0.38% (1,817 / 475,500)
                ('profit', 0.1920) -- ~19.20% (91,324 / 475,500)
            ) AS t(allocation_type, percentage)
        LOOP
            INSERT INTO cost_allocations (transaction_id, allocation_type, amount, percentage)
            VALUES (
                NEW.id,
                allocation_data.allocation_type,
                ROUND(retort_income * allocation_data.percentage, 2),
                allocation_data.percentage * 100
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic cost allocation
DROP TRIGGER IF EXISTS trigger_retort_cost_allocation ON transactions;
CREATE TRIGGER trigger_retort_cost_allocation
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION create_retort_cost_allocations();
