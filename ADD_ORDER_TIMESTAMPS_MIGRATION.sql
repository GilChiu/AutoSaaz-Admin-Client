-- ============================================================
-- Migration: Add Status Transition Timestamps to Bookings
-- Created: 2025-11-20
-- Purpose: Track when orders change status for better transparency
-- ============================================================

-- Add timestamp columns for status transitions
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for the new timestamp columns
CREATE INDEX IF NOT EXISTS idx_bookings_assigned_at ON bookings(assigned_at);
CREATE INDEX IF NOT EXISTS idx_bookings_completed_at ON bookings(completed_at);

-- Add comments for documentation
COMMENT ON COLUMN bookings.assigned_at IS 'Timestamp when order status changed from pending to in_progress';
COMMENT ON COLUMN bookings.completed_at IS 'Timestamp when order status changed to completed';

-- Backfill existing data (optional - only if you want to set timestamps for existing orders)
-- For existing in_progress orders, set assigned_at to updated_at if not already set
UPDATE bookings 
SET assigned_at = updated_at 
WHERE status = 'in_progress' 
  AND assigned_at IS NULL;

-- For existing completed orders, set both timestamps if not already set
UPDATE bookings 
SET assigned_at = COALESCE(assigned_at, created_at),
    completed_at = COALESCE(completed_at, updated_at)
WHERE status = 'completed' 
  AND (assigned_at IS NULL OR completed_at IS NULL);

-- ============================================================
-- Verification Queries
-- ============================================================

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
  AND column_name IN ('assigned_at', 'completed_at')
ORDER BY column_name;

-- Check indexes were created
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'bookings'
  AND indexname IN ('idx_bookings_assigned_at', 'idx_bookings_completed_at');

-- Sample data check
SELECT 
  booking_number,
  status,
  created_at,
  assigned_at,
  completed_at,
  updated_at
FROM bookings
ORDER BY created_at DESC
LIMIT 10;
