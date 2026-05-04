-- Seed data for HPP calculation system

-- Insert packaging types based on the examples provided
INSERT INTO public.packaging_types (name, size, unit_price) VALUES
('Bag Retort', '12x15 cm', 1400),
('Bag Retort', '13x21 cm', 2000),
('Bag Retort', '16x23 cm', 2400)
ON CONFLICT DO NOTHING;

-- Insert HPP templates for each packaging type
INSERT INTO public.hpp_templates (
  packaging_type_id,
  electricity_cost,
  gas_cost,
  water_cost,
  rent_cost,
  labor_cost,
  operational_percentage,
  reserve_percentage,
  tax_percentage,
  profit_margin
)
SELECT 
  pt.id,
  8385,  -- electricity cost
  6000,  -- gas cost
  19200, -- water cost
  13900, -- rent cost
  150000, -- labor cost
  30.0,  -- operational percentage (calculated as percentage of production cost)
  10.0,  -- reserve percentage (calculated as percentage of production cost)
  0.5,   -- tax percentage
  25.0   -- profit margin
FROM public.packaging_types pt
ON CONFLICT DO NOTHING;
