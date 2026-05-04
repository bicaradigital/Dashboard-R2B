-- HPP (Cost of Goods Sold) Calculation Tables for R2B Retort Services
-- This extends the existing schema to support automatic HPP calculations

-- Packaging types and sizes for retort services
CREATE TABLE IF NOT EXISTS public.packaging_types (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- e.g., "Bag Retort"
  size TEXT NOT NULL, -- e.g., "12x15 cm", "13x21 cm", "16x23 cm"
  unit_price numeric(14,2) NOT NULL, -- price per piece
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- HPP calculation templates for different packaging types
CREATE TABLE IF NOT EXISTS public.hpp_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  packaging_type_id uuid REFERENCES public.packaging_types(id) ON DELETE CASCADE,
  electricity_cost numeric(14,2) DEFAULT 8385, -- fixed cost per batch
  gas_cost numeric(14,2) DEFAULT 6000, -- fixed cost per batch
  water_cost numeric(14,2) DEFAULT 19200, -- fixed cost per batch
  rent_cost numeric(14,2) DEFAULT 13900, -- fixed cost per batch
  labor_cost numeric(14,2) DEFAULT 150000, -- fixed cost per batch
  operational_percentage numeric(5,2) DEFAULT 30.0, -- percentage of production cost
  reserve_percentage numeric(5,2) DEFAULT 10.0, -- percentage of production cost
  tax_percentage numeric(5,2) DEFAULT 0.5, -- tax percentage
  profit_margin numeric(5,2) DEFAULT 25.0, -- profit margin percentage
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- HPP calculation records
CREATE TABLE IF NOT EXISTS public.hpp_calculations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  packaging_type_id uuid REFERENCES public.packaging_types(id) ON DELETE SET NULL,
  quantity integer NOT NULL,
  packaging_cost numeric(14,2) NOT NULL,
  electricity_cost numeric(14,2) NOT NULL,
  gas_cost numeric(14,2) NOT NULL,
  water_cost numeric(14,2) NOT NULL,
  rent_cost numeric(14,2) NOT NULL,
  total_production_cost numeric(14,2) NOT NULL,
  operational_cost numeric(14,2) NOT NULL,
  reserve_cost numeric(14,2) NOT NULL,
  labor_cost numeric(14,2) NOT NULL,
  tax_amount numeric(14,2) NOT NULL,
  total_after_tax numeric(14,2) NOT NULL,
  profit_amount numeric(14,2) NOT NULL,
  total_selling_price numeric(14,2) NOT NULL,
  price_per_unit numeric(14,2) NOT NULL,
  actual_margin numeric(5,2) NOT NULL,
  calculation_date timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Function to automatically calculate HPP when retort service is recorded
CREATE OR REPLACE FUNCTION calculate_hpp_for_retort_service(
  p_packaging_type_id uuid,
  p_quantity integer,
  p_invoice_id uuid DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_packaging packaging_types%ROWTYPE;
  v_template hpp_templates%ROWTYPE;
  v_packaging_cost numeric(14,2);
  v_total_production_cost numeric(14,2);
  v_operational_cost numeric(14,2);
  v_reserve_cost numeric(14,2);
  v_tax_amount numeric(14,2);
  v_total_after_tax numeric(14,2);
  v_profit_amount numeric(14,2);
  v_total_selling_price numeric(14,2);
  v_price_per_unit numeric(14,2);
  v_hpp_id uuid;
BEGIN
  -- Get packaging info
  SELECT * INTO v_packaging FROM public.packaging_types WHERE id = p_packaging_type_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Packaging type not found';
  END IF;

  -- Get HPP template
  SELECT * INTO v_template FROM public.hpp_templates WHERE packaging_type_id = p_packaging_type_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'HPP template not found for packaging type';
  END IF;

  -- Calculate costs
  v_packaging_cost := v_packaging.unit_price * p_quantity;
  v_total_production_cost := v_packaging_cost + v_template.electricity_cost + v_template.gas_cost + v_template.water_cost + v_template.rent_cost;
  v_operational_cost := v_total_production_cost * (v_template.operational_percentage / 100);
  v_reserve_cost := v_total_production_cost * (v_template.reserve_percentage / 100);
  v_total_after_tax := v_total_production_cost + v_operational_cost + v_reserve_cost + v_template.labor_cost;
  v_tax_amount := v_total_after_tax * (v_template.tax_percentage / 100);
  v_total_after_tax := v_total_after_tax + v_tax_amount;
  v_profit_amount := v_total_after_tax * (v_template.profit_margin / 100);
  v_total_selling_price := v_total_after_tax + v_profit_amount;
  v_price_per_unit := v_total_selling_price / p_quantity;

  -- Insert HPP calculation record
  INSERT INTO public.hpp_calculations (
    transaction_id,
    packaging_type_id,
    quantity,
    packaging_cost,
    electricity_cost,
    gas_cost,
    water_cost,
    rent_cost,
    total_production_cost,
    operational_cost,
    reserve_cost,
    labor_cost,
    tax_amount,
    total_after_tax,
    profit_amount,
    total_selling_price,
    price_per_unit,
    actual_margin
  ) VALUES (
    p_invoice_id,
    p_packaging_type_id,
    p_quantity,
    v_packaging_cost,
    v_template.electricity_cost,
    v_template.gas_cost,
    v_template.water_cost,
    v_template.rent_cost,
    v_total_production_cost,
    v_operational_cost,
    v_reserve_cost,
    v_template.labor_cost,
    v_tax_amount,
    v_total_after_tax,
    v_profit_amount,
    v_total_selling_price,
    v_price_per_unit,
    v_template.profit_margin
  ) RETURNING id INTO v_hpp_id;

  RETURN v_hpp_id;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS for new tables
ALTER TABLE public.packaging_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hpp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hpp_calculations ENABLE ROW LEVEL SECURITY;

-- RLS policies for packaging types
CREATE POLICY "Users can view all packaging types" ON public.packaging_types FOR SELECT USING (true);
CREATE POLICY "Users can insert packaging types" ON public.packaging_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update packaging types" ON public.packaging_types FOR UPDATE USING (true);
CREATE POLICY "Users can delete packaging types" ON public.packaging_types FOR DELETE USING (true);

-- RLS policies for HPP templates
CREATE POLICY "Users can view all hpp templates" ON public.hpp_templates FOR SELECT USING (true);
CREATE POLICY "Users can insert hpp templates" ON public.hpp_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update hpp templates" ON public.hpp_templates FOR UPDATE USING (true);
CREATE POLICY "Users can delete hpp templates" ON public.hpp_templates FOR DELETE USING (true);

-- RLS policies for HPP calculations
CREATE POLICY "Users can view all hpp calculations" ON public.hpp_calculations FOR SELECT USING (true);
CREATE POLICY "Users can insert hpp calculations" ON public.hpp_calculations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update hpp calculations" ON public.hpp_calculations FOR UPDATE USING (true);
CREATE POLICY "Users can delete hpp calculations" ON public.hpp_calculations FOR DELETE USING (true);
