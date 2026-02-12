-- ============================================================================
-- EKA-AI Platform: Production Database Enhancements
-- ============================================================================
-- Run this in Supabase SQL Editor to add indexes, triggers, constraints, and RLS
-- ============================================================================

-- ============================================================================
-- 1. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Job Cards indexes
CREATE INDEX IF NOT EXISTS idx_job_cards_status ON job_cards(status);
CREATE INDEX IF NOT EXISTS idx_job_cards_vehicle_reg ON job_cards(vehicle_registration);
CREATE INDEX IF NOT EXISTS idx_job_cards_customer_name ON job_cards(customer_name);
CREATE INDEX IF NOT EXISTS idx_job_cards_created_at ON job_cards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_cards_approval_token ON job_cards(approval_token) WHERE approval_token IS NOT NULL;

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_job_card_id ON invoices(job_card_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

-- MG Contracts indexes
CREATE INDEX IF NOT EXISTS idx_mg_contracts_status ON mg_contracts(status);
CREATE INDEX IF NOT EXISTS idx_mg_contracts_vehicle_reg ON mg_contracts(vehicle_registration);
CREATE INDEX IF NOT EXISTS idx_mg_contracts_customer ON mg_contracts(customer_name);

-- MG Vehicle Logs indexes
CREATE INDEX IF NOT EXISTS idx_mg_logs_contract_id ON mg_vehicle_logs(contract_id);
CREATE INDEX IF NOT EXISTS idx_mg_logs_log_date ON mg_vehicle_logs(log_date);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ============================================================================
-- 2. AUTO-UPDATE updated_at TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to job_cards
DROP TRIGGER IF EXISTS update_job_cards_updated_at ON job_cards;
CREATE TRIGGER update_job_cards_updated_at
    BEFORE UPDATE ON job_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to invoices
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to mg_contracts
DROP TRIGGER IF EXISTS update_mg_contracts_updated_at ON mg_contracts;
CREATE TRIGGER update_mg_contracts_updated_at
    BEFORE UPDATE ON mg_contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. INVOICE NUMBER GENERATOR TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    year_month TEXT;
    sequence_num INT;
    new_invoice_number TEXT;
BEGIN
    -- Only generate if invoice_number is not provided
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        year_month := TO_CHAR(NOW(), 'YYYYMM');
        
        -- Get the next sequence number for this month
        SELECT COUNT(*) + 1 INTO sequence_num
        FROM invoices
        WHERE invoice_number LIKE 'EKA-' || year_month || '-%';
        
        -- Format: EKA-202602-0001
        new_invoice_number := 'EKA-' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');
        
        NEW.invoice_number := new_invoice_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_invoice_number ON invoices;
CREATE TRIGGER trigger_generate_invoice_number
    BEFORE INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION generate_invoice_number();

-- ============================================================================
-- 4. CHECK CONSTRAINTS FOR DATA VALIDITY
-- ============================================================================

-- Job cards: status must be valid
ALTER TABLE job_cards DROP CONSTRAINT IF EXISTS chk_job_cards_status;
ALTER TABLE job_cards ADD CONSTRAINT chk_job_cards_status 
    CHECK (status IN ('Pending', 'In-Progress', 'Completed', 'Cancelled', 'On-Hold', 'Customer Approved', 'Customer Rejected'));

-- Job cards: estimated cost must be positive
ALTER TABLE job_cards DROP CONSTRAINT IF EXISTS chk_job_cards_estimated_cost;
ALTER TABLE job_cards ADD CONSTRAINT chk_job_cards_estimated_cost 
    CHECK (estimated_cost IS NULL OR estimated_cost >= 0);

-- Invoices: status must be valid
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS chk_invoices_status;
ALTER TABLE invoices ADD CONSTRAINT chk_invoices_status 
    CHECK (status IN ('Draft', 'Finalized', 'Paid', 'Cancelled'));

-- Invoices: amounts must be positive
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS chk_invoices_amounts;
ALTER TABLE invoices ADD CONSTRAINT chk_invoices_amounts 
    CHECK (amount >= 0 AND cgst >= 0 AND sgst >= 0 AND igst >= 0 AND total_amount >= 0);

-- Invoices: total must equal amount + taxes
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS chk_invoices_total;
ALTER TABLE invoices ADD CONSTRAINT chk_invoices_total 
    CHECK (total_amount = amount + cgst + sgst + igst);

-- MG Contracts: status must be valid
ALTER TABLE mg_contracts DROP CONSTRAINT IF EXISTS chk_mg_contracts_status;
ALTER TABLE mg_contracts ADD CONSTRAINT chk_mg_contracts_status 
    CHECK (status IN ('Active', 'Expired', 'Terminated'));

-- MG Contracts: positive values
ALTER TABLE mg_contracts DROP CONSTRAINT IF EXISTS chk_mg_contracts_positive;
ALTER TABLE mg_contracts ADD CONSTRAINT chk_mg_contracts_positive 
    CHECK (monthly_km_limit > 0 AND monthly_fee > 0);

-- MG Contracts: end date after start date
ALTER TABLE mg_contracts DROP CONSTRAINT IF EXISTS chk_mg_contracts_dates;
ALTER TABLE mg_contracts ADD CONSTRAINT chk_mg_contracts_dates 
    CHECK (end_date > start_date);

-- MG Vehicle Logs: positive km
ALTER TABLE mg_vehicle_logs DROP CONSTRAINT IF EXISTS chk_mg_logs_km;
ALTER TABLE mg_vehicle_logs ADD CONSTRAINT chk_mg_logs_km 
    CHECK (km_driven > 0);

-- Payments: status must be valid
ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payments_status;
ALTER TABLE payments ADD CONSTRAINT chk_payments_status 
    CHECK (status IN ('Pending', 'Completed', 'Failed', 'Refunded'));

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE job_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE mg_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mg_vehicle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON job_cards;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON invoices;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON mg_contracts;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON mg_vehicle_logs;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON payments;

-- Job Cards: Authenticated users can perform all operations
CREATE POLICY "Enable all access for authenticated users" ON job_cards
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Job Cards: Allow anon read access (for public pages if needed)
CREATE POLICY "Allow anon read access" ON job_cards
    FOR SELECT
    TO anon
    USING (true);

-- Invoices: Authenticated users can perform all operations
CREATE POLICY "Enable all access for authenticated users" ON invoices
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Invoices: Allow anon read access
CREATE POLICY "Allow anon read access" ON invoices
    FOR SELECT
    TO anon
    USING (true);

-- MG Contracts: Authenticated users can perform all operations
CREATE POLICY "Enable all access for authenticated users" ON mg_contracts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- MG Vehicle Logs: Authenticated users can perform all operations
CREATE POLICY "Enable all access for authenticated users" ON mg_vehicle_logs
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Payments: Authenticated users can perform all operations
CREATE POLICY "Enable all access for authenticated users" ON payments
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 6. VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Dashboard summary view
CREATE OR REPLACE VIEW dashboard_summary AS
SELECT 
    (SELECT COUNT(*) FROM job_cards) as total_job_cards,
    (SELECT COUNT(*) FROM job_cards WHERE status = 'Pending') as pending_jobs,
    (SELECT COUNT(*) FROM job_cards WHERE status = 'In-Progress') as in_progress_jobs,
    (SELECT COUNT(*) FROM job_cards WHERE status = 'Completed') as completed_jobs,
    (SELECT COUNT(*) FROM invoices WHERE status = 'Paid') as paid_invoices,
    (SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE status = 'Paid') as total_revenue,
    (SELECT COUNT(*) FROM mg_contracts WHERE status = 'Active') as active_mg_contracts;

-- Job cards with invoice summary
CREATE OR REPLACE VIEW job_cards_with_invoices AS
SELECT 
    jc.*,
    i.id as invoice_id,
    i.invoice_number,
    i.total_amount as invoice_amount,
    i.status as invoice_status
FROM job_cards jc
LEFT JOIN invoices i ON jc.id = i.job_card_id;

-- ============================================================================
-- COMPLETION
-- ============================================================================

SELECT 'Production enhancements applied successfully!' as status;
