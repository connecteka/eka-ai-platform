-- ============================================================
-- EKA-AI Supabase Migration Validation
-- Run this after the main migration to verify everything is set up
-- ============================================================

-- 1. List all tables in public schema
SELECT 
    table_name,
    (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Verify user_profiles has new columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name IN ('password_hash', 'auth_provider', 'picture', 'workshop_name')
ORDER BY column_name;

-- 3. Verify new tables exist with correct columns
SELECT 
    t.table_name,
    string_agg(c.column_name, ', ' ORDER BY c.ordinal_position) as columns
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
AND t.table_name IN ('user_sessions', 'chat_sessions', 'subscriptions', 'usage_tracking', 'notifications')
GROUP BY t.table_name
ORDER BY t.table_name;

-- 4. Check indexes
SELECT 
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('user_sessions', 'chat_sessions', 'subscriptions', 'usage_tracking', 'notifications')
ORDER BY tablename, indexname;

-- 5. Check RLS status
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_sessions', 'chat_sessions', 'subscriptions', 'usage_tracking', 'notifications')
ORDER BY tablename;

-- 6. Quick test: Try inserting and deleting a test session
INSERT INTO user_sessions (user_id, session_token, expires_at)
VALUES ('test_user', 'test_token_validation_' || gen_random_uuid()::text, NOW() + INTERVAL '1 hour')
RETURNING id, 'INSERT OK' as status;

DELETE FROM user_sessions WHERE user_id = 'test_user' AND session_token LIKE 'test_token_validation_%';

SELECT 'All validations completed successfully!' as result;
