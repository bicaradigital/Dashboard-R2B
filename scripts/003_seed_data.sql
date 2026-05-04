-- Added seed data for R2B Finance system
-- ==============================
-- 6. SEED SAMPLE DATA
-- ==============================
-- Create sample accounts
INSERT INTO public.accounts (code, name, type) VALUES
('1000','Kas & Bank','asset'),
('1100','Piutang Usaha','asset'),
('1200','Persediaan','asset'),
('2000','Hutang Usaha','liability'),
('2100','Hutang Pajak','liability'),
('3000','Modal','equity'),
('4000','Pendapatan Jasa','revenue'),
('4100','Pendapatan Pelatihan','revenue'),
('5000','Beban Operasional','expense'),
('5100','Beban Gaji','expense'),
('5200','Beban Listrik','expense'),
('5300','Beban Internet','expense')
ON CONFLICT (code) DO NOTHING;

-- Sample items for R2B business
INSERT INTO public.items (sku, name, item_type, price, unit) VALUES
('RFT-S','Retort S - Jasa Sterilisasi','service', 10000000, 'job'),
('RFT-M','Retort M - Jasa Sterilisasi','service', 15000000, 'job'),
('RFT-L','Retort L - Jasa Sterilisasi','service', 20000000, 'job'),
('TRN-01','Pelatihan Pengemasan Dasar','training', 150000, 'person'),
('TRN-02','Pelatihan Sterilisasi Lanjutan','training', 250000, 'person'),
('PKG-01','Kemasan Retort Pouch 100ml','product', 500, 'pcs'),
('PKG-02','Kemasan Retort Pouch 200ml','product', 750, 'pcs'),
('PKG-03','Kemasan Retort Pouch 500ml','product', 1200, 'pcs')
ON CONFLICT (sku) DO NOTHING;

-- Sample customers
INSERT INTO public.customers (name, email, phone, address) VALUES
('PT. Makanan Sehat Indonesia', 'procurement@makansehat.co.id', '021-12345678', 'Jl. Industri No. 123, Jakarta Timur'),
('CV. Kuliner Nusantara', 'admin@kulinernusantara.com', '0274-987654', 'Jl. Malioboro No. 45, Yogyakarta'),
('UD. Berkah Jaya', 'berkah@gmail.com', '0361-555123', 'Jl. Sunset Road No. 78, Denpasar'),
('PT. Food Innovation', 'contact@foodinnovation.id', '022-333444', 'Jl. Dago No. 56, Bandung'),
('Warung Mak Ijah', 'makijah@yahoo.com', '0812-3456789', 'Jl. Pasar Baru No. 12, Surabaya')
ON CONFLICT DO NOTHING;
