# Order Status Timestamps Implementation Guide

## Overview
This document provides a complete guide for implementing timestamp tracking for order status transitions in the AutoSaaz Admin Client.

---

## 📊 Database Changes

### Column Names
- **`assigned_at`**: Timestamp when order status changed from `pending` → `in_progress`
- **`completed_at`**: Timestamp when order status changed to `completed`
- **`created_at`**: Already exists - when order was first created

### SQL Migration

**File**: `ADD_ORDER_TIMESTAMPS_MIGRATION.sql`

Run this in your Supabase SQL Editor:

```sql
-- Add timestamp columns for status transitions
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_assigned_at ON bookings(assigned_at);
CREATE INDEX IF NOT EXISTS idx_bookings_completed_at ON bookings(completed_at);

-- Add documentation
COMMENT ON COLUMN bookings.assigned_at IS 'Timestamp when order status changed from pending to in_progress';
COMMENT ON COLUMN bookings.completed_at IS 'Timestamp when order status changed to completed';
```

---

## 🔧 Backend Changes

### 1. Update Backend Order Status Endpoint

**File**: `express-supabase-api/supabase/functions/orders/index.ts`

When updating order status, set the appropriate timestamp:

```typescript
// PATCH /orders/:orderId - Update order status
if (req.method === 'PATCH' && orderId) {
  const body = await req.json();
  const { status, garageId, recoveryStatus, inspectionReport, quotation } = body;
  
  const updates: any = {};
  
  if (status) {
    updates.status = status;
    
    // Set timestamp based on status change
    if (status === 'in_progress') {
      updates.assigned_at = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
      // Ensure assigned_at is set if not already
      if (!updates.assigned_at) {
        const { data: existing } = await supabaseClient
          .from('bookings')
          .select('assigned_at')
          .eq('id', orderId)
          .single();
        
        if (!existing?.assigned_at) {
          updates.assigned_at = new Date().toISOString();
        }
      }
    }
  }
  
  if (garageId) updates.garage_id = garageId;
  if (recoveryStatus) updates.recovery_status = recoveryStatus;
  if (inspectionReport) updates.inspection_report = inspectionReport;
  if (quotation !== undefined) updates.quotation = quotation;
  
  const { data, error } = await supabaseClient
    .from('bookings')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single();
    
  if (error) return badRequest('Failed to update order', origin);
  return ok(data, 'Order updated successfully', origin);
}
```

### 2. Update GET Orders Response

**File**: `express-supabase-api/supabase/functions/orders/index.ts`

Ensure the response includes the new timestamp fields:

```typescript
// GET /orders - Already includes all columns with select('*')
// The assigned_at and completed_at will automatically be included

// Just verify the mapping includes these fields:
const orders = data.map(booking => ({
  id: booking.id,
  customerName: booking.customer_name,
  garageName: garageInfo?.garage_name || 'Unknown Garage',
  pickupSchedule: `${booking.booking_date} - ${booking.scheduled_time || 'TBD'}`,
  recoveryStatus: booking.recovery_status || 'awaiting_confirmation',
  quotation: booking.quotation || 0,
  inspectionReport: booking.inspection_report || 'N/A',
  paymentStatus: booking.payment_status,
  status: booking.status,
  createdAt: booking.created_at,
  assignedAt: booking.assigned_at,  // ← ADD THIS
  completedAt: booking.completed_at, // ← ADD THIS
  bookingNumber: booking.booking_number
}));
```

---

## 🎨 Frontend Changes

### File: `src/pages/OrderManagementPage.js`

The frontend already displays these timestamps! The code at lines 15-25 shows:

```javascript
const getStatusTimestamp = () => {
  if (order.status === 'completed' && order.completedAt) {
    return { label: 'Completed', time: formatDateTime(order.completedAt) };
  }
  if (order.status === 'in_progress' && order.assignedAt) {
    return { label: 'Assigned', time: formatDateTime(order.assignedAt) };
  }
  if (order.createdAt) {
    return { label: 'Created', time: formatDateTime(order.createdAt) };
  }
  return { label: 'Status', time: 'N/A' };
};
```

**No changes needed in frontend!** It already:
- Shows "Completed At" timestamp for completed orders
- Shows "Assigned At" timestamp for in_progress orders  
- Shows "Created At" timestamp for pending orders

---

## ✅ Testing Checklist

### 1. Database Migration
- [ ] Run SQL migration in Supabase SQL Editor
- [ ] Verify columns exist: `SELECT * FROM information_schema.columns WHERE table_name = 'bookings' AND column_name IN ('assigned_at', 'completed_at');`
- [ ] Check indexes created: `SELECT * FROM pg_indexes WHERE tablename = 'bookings' AND indexname LIKE '%assigned%' OR indexname LIKE '%completed%';`

### 2. Backend Testing
- [ ] Update order from pending → in_progress, verify `assigned_at` is set
- [ ] Update order to completed, verify both `assigned_at` and `completed_at` are set
- [ ] GET /orders returns the new timestamp fields

### 3. Frontend Testing
- [ ] Pending orders show "Created At" with creation timestamp
- [ ] In Progress orders show "Assigned At" with assignment timestamp
- [ ] Completed orders show "Completed At" with completion timestamp
- [ ] Timestamps are formatted correctly (e.g., "Nov 20, 2025 - 10:30 AM")

---

## 📝 API Response Example

### Before (Missing Timestamps)
```json
{
  "id": "uuid",
  "customerName": "Test Customer",
  "status": "completed",
  "createdAt": "2025-11-20T07:30:00Z"
}
```

### After (With Timestamps)
```json
{
  "id": "uuid",
  "customerName": "Test Customer",
  "status": "completed",
  "createdAt": "2025-11-20T07:30:00Z",
  "assignedAt": "2025-11-20T10:00:00Z",
  "completedAt": "2025-11-20T16:00:00Z"
}
```

---

## 🎯 User Benefit

### Before
- ❌ No way to know when an inspection came in
- ❌ No way to know when it was assigned to garage
- ❌ No way to know when it was completed

### After
- ✅ See exact timestamp when order was created
- ✅ See exact timestamp when order was assigned (pending → in_progress)
- ✅ See exact timestamp when order was completed
- ✅ Track order lifecycle completely

---

## 🔄 Workflow Example

1. **Order Created** (status: `pending`)
   - `created_at`: 2025-11-20 07:30 AM
   - Display: "Created At: Nov 20, 2025 - 07:30 AM"

2. **Admin Assigns to Garage** (status: `in_progress`)
   - `assigned_at`: 2025-11-20 10:00 AM  
   - Display: "Assigned At: Nov 20, 2025 - 10:00 AM"

3. **Garage Completes** (status: `completed`)
   - `completed_at`: 2025-11-20 04:00 PM
   - Display: "Completed At: Nov 20, 2025 - 04:00 PM"

---

## 🚀 Deployment Steps

1. **Run Database Migration** (5 mins)
   - Copy SQL from `ADD_ORDER_TIMESTAMPS_MIGRATION.sql`
   - Run in Supabase SQL Editor
   - Verify success

2. **Update Backend** (10 mins)
   - Modify `orders/index.ts` to set timestamps on status change
   - Add timestamp fields to GET response mapping
   - Deploy backend changes

3. **Verify Frontend** (2 mins)
   - Frontend already supports it - no code changes needed!
   - Just refresh and test

4. **Test End-to-End** (5 mins)
   - Create test order
   - Assign to garage (check `assigned_at`)
   - Mark complete (check `completed_at`)
   - Verify UI displays all timestamps correctly

**Total Time: ~22 minutes**

---

## 📞 Support

If you encounter issues:
1. Check Supabase logs for migration errors
2. Verify backend returns `assigned_at` and `completed_at` in API response
3. Check browser console for frontend errors
4. Verify timestamp format matches expected format (ISO 8601)
