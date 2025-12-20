-- Quick verification query - run this in Supabase SQL Editor
-- This will show you which tables exist

SELECT 
  table_name,
  '✅ EXISTS' as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'prospect_intelligence',
    'user_interactions',
    'account_signals',
    'accounts',
    'prospect_intelligence_runs'
  )
ORDER BY table_name;

-- If you see all 5 tables listed, Phase 1 is working! ✅
-- If some are missing, run COMPLETE_MIGRATION.sql again
