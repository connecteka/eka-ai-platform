-- ============================================================
-- EKA-AI Supabase Schema Migration - Complete Script
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- ==================== PREREQUISITES ====================
-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==================== USER PROFILES MODIFICATIONS ====================
-- Add columns for custom auth support
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS picture TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS workshop_name TEXT;

-- Ensure email has unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- ==================== USER SESSIONS ====================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- ==================== CHAT SESSIONS ====================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    user_id TEXT,
    title TEXT DEFAULT 'New Conversation',
    context JSONB DEFAULT '{}',
    messages JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated ON chat_sessions(updated_at DESC);

-- ==================== SUBSCRIPTIONS ====================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'elite')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
    expires_at TIMESTAMPTZ,
    payment_provider TEXT,
    payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_active ON subscriptions(user_id) WHERE status = 'active';

-- ==================== USAGE TRACKING ====================
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    month TEXT NOT NULL,  -- Format: YYYY-MM
    ai_queries INTEGER DEFAULT 0,
    job_cards INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, month)
);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON usage_tracking(user_id, month);

-- ==================== NOTIFICATIONS ====================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT FALSE,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ==================== FILES ====================
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    job_card_id TEXT,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_files_job_card ON files(job_card_id);
CREATE INDEX IF NOT EXISTS idx_files_user ON files(user_id);

-- ==================== CUSTOMERS ====================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    total_visits INTEGER DEFAULT 0,
    lifetime_value DECIMAL DEFAULT 0,
    workshop_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_workshop ON customers(workshop_id);

-- ==================== SERVICES ====================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    base_price DECIMAL DEFAULT 0,
    estimated_time TEXT,
    workshop_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_workshop ON services(workshop_id);

-- ==================== PARTS ====================
CREATE TABLE IF NOT EXISTS parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    part_number TEXT,
    category TEXT,
    unit_price DECIMAL DEFAULT 0,
    quantity_in_stock INTEGER DEFAULT 0,
    workshop_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parts_part_number ON parts(part_number);
CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category);
CREATE INDEX IF NOT EXISTS idx_parts_workshop ON parts(workshop_id);

-- ==================== JOB CARD NOTES ====================
CREATE TABLE IF NOT EXISTS job_card_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_card_id TEXT NOT NULL,
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    is_ai BOOLEAN DEFAULT FALSE,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_card_notes_job ON job_card_notes(job_card_id);

-- ==================== JOB CARD TIMELINE ====================
CREATE TABLE IF NOT EXISTS job_card_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_card_id TEXT NOT NULL,
    description TEXT NOT NULL,
    actor TEXT NOT NULL,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_card_timeline_job ON job_card_timeline(job_card_id);

-- ==================== SIGNATURES ====================
CREATE TABLE IF NOT EXISTS signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_card_id TEXT NOT NULL,
    signature_image TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    verified_via TEXT DEFAULT 'manual',
    otp_verified BOOLEAN DEFAULT FALSE,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signatures_job ON signatures(job_card_id);

-- ==================== MG CONTRACTS ====================
CREATE TABLE IF NOT EXISTS mg_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    vehicle_registration TEXT NOT NULL,
    contract_type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_km_limit INTEGER,
    monthly_fee DECIMAL,
    status TEXT DEFAULT 'active',
    workshop_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mg_contracts_vehicle ON mg_contracts(vehicle_registration);
CREATE INDEX IF NOT EXISTS idx_mg_contracts_status ON mg_contracts(status);

-- ==================== MG VEHICLE LOGS ====================
CREATE TABLE IF NOT EXISTS mg_vehicle_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id TEXT NOT NULL,
    vehicle_registration TEXT NOT NULL,
    log_type TEXT NOT NULL,
    odometer_reading INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mg_vehicle_logs_contract ON mg_vehicle_logs(contract_id);
CREATE INDEX IF NOT EXISTS idx_mg_vehicle_logs_vehicle ON mg_vehicle_logs(vehicle_registration);

-- ==================== ROW LEVEL SECURITY (RLS) ====================
-- Enable RLS on sensitive tables
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow service role full access (for backend)
-- Note: These policies allow the service role (backend) full access
-- For anon key access, you may need more specific policies

CREATE POLICY "Service role has full access to user_sessions" ON user_sessions
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to chat_sessions" ON chat_sessions
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to subscriptions" ON subscriptions
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to usage_tracking" ON usage_tracking
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to notifications" ON notifications
    FOR ALL USING (true) WITH CHECK (true);

-- ==================== TABLE COMMENTS ====================
COMMENT ON TABLE user_sessions IS 'User authentication sessions for custom JWT auth';
COMMENT ON TABLE chat_sessions IS 'AI chat conversation sessions with message history';
COMMENT ON TABLE subscriptions IS 'User subscription plans (starter/growth/elite)';
COMMENT ON TABLE usage_tracking IS 'Monthly usage tracking for AI queries and job cards';
COMMENT ON TABLE notifications IS 'User notifications for job status updates etc.';

-- ==================== VALIDATION QUERY ====================
-- Run this after the migration to verify tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
