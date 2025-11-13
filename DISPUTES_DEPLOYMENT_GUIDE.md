# Disputes & Revisions System - Deployment Guide

## Overview
Complete deployment guide for the Disputes & Revisions feature with Request Evidence, Resolve Case, and Escalate functionality.

## ✅ What Has Been Completed

### Backend (Supabase)
- ✅ Database migration created: `supabase/migrations/20251113_disputes_system.sql`
- ✅ Edge Functions created:
  - `supabase/functions/disputes/index.ts` - List disputes and perform actions
  - `supabase/functions/dispute-detail/index.ts` - Get dispute details and manage messages

### Frontend (React)
- ✅ API service updated: `src/services/apiService.js` (6 new methods)
- ✅ Disputes list page: `src/pages/DisputesPage.js` (real data integration)
- ✅ Dispute detail page: `src/pages/DisputeDetailPage.js` (3 professional modals)

### Sample Data
- ✅ SQL script created: `INSERT_SAMPLE_DISPUTES.sql` (5 sample cases with messages)

---

## 📋 Deployment Steps

### Step 1: Deploy Database Migration

**Option A: Via Supabase SQL Editor (Recommended)**

1. Open your Supabase project dashboard
2. Go to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `supabase/migrations/20251113_disputes_system.sql` and copy all contents
5. Paste into the SQL Editor
6. Click **Run** to execute the migration
7. Verify success message appears

**What this does:**
- Adds new columns to `disputes` table: `type`, `user_id`, `booking_id`, `evidence_requested`, `evidence_requested_at`, `evidence_requested_by`, `escalated`, `escalated_at`, `escalated_by`, `escalation_reason`, `resolved_at`, `resolved_by`, `resolution_notes`, `priority`
- Updates status constraint to include 'under_review'
- Creates indexes for better query performance

**Option B: Via Supabase CLI** (if migration history is synced)
```bash
supabase db push
```

### Step 2: Deploy Edge Functions

Navigate to your backend directory:
```powershell
cd c:\Users\gilbe\Projects\AutoSaaz-Server\express-supabase-api
```

Deploy the disputes Edge Function:
```powershell
supabase functions deploy disputes
```

Deploy the dispute-detail Edge Function:
```powershell
supabase functions deploy dispute-detail
```

**Expected Output:**
```
Deployed Function disputes with version <version-id>
Deployed Function dispute-detail with version <version-id>
```

**Verify deployment:**
1. Go to Supabase Dashboard → Edge Functions
2. You should see:
   - `disputes` (with status: Active)
   - `dispute-detail` (with status: Active)

### Step 3: Create Sample Data

1. Open Supabase SQL Editor
2. **FIRST**: Get actual IDs from your database:
   ```sql
   -- Get user IDs
   SELECT id, name, email FROM users LIMIT 3;
   
   -- Get garage IDs
   SELECT id, business_name FROM garage_profiles LIMIT 3;
   
   -- Get booking IDs
   SELECT id FROM bookings LIMIT 3;
   ```

3. Open `INSERT_SAMPLE_DISPUTES.sql`
4. **Replace all placeholder UUIDs** with actual IDs from step 2:
   - Replace `00000000-0000-0000-0000-000000000001` with a real user_id
   - Replace `00000000-0000-0000-0000-000000000002` with a real garage_id
   - Replace `00000000-0000-0000-0000-000000000003` with a real booking_id
   - Replace `00000000-0000-0000-0000-000000000004` with a real admin user_id

5. After inserting disputes, get the generated dispute IDs:
   ```sql
   SELECT id, subject FROM disputes ORDER BY created_at DESC LIMIT 5;
   ```

6. Replace `REPLACE_WITH_DISPUTE_X_ID` placeholders in the messages section with actual dispute IDs

7. Run the entire modified SQL script in Supabase SQL Editor

### Step 4: Verify API Endpoints

Test the Edge Functions are working:

**Test Disputes List:**
```bash
curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/disputes \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Test Dispute Detail:**
```bash
curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/dispute-detail/DISPUTE_ID \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Expected: JSON responses with dispute data

### Step 5: Test Frontend

1. Start your React development server:
   ```powershell
   cd c:\Users\gilbe\Projects\AutoSaaz-Server\AutoSaaz-Admin-Client
   npm start
   ```

2. Navigate to **Disputes & Revisions** tab in the admin dashboard

3. Verify the list page loads with sample disputes

4. Click **Manage** on any dispute to open the detail page

5. Test the three action buttons:
   - **Request Evidence** (Blue button)
   - **Resolve Case** (Green button)
   - **Escalate** (Orange button)

---

## 🔍 Testing Checklist

### List Page (`/disputes`)
- [ ] Disputes load from API
- [ ] Search bar filters disputes
- [ ] Status badges show correct colors
- [ ] Type badges display (Dispute/Revision)
- [ ] Manage button navigates to detail page
- [ ] Loading state appears while fetching
- [ ] Error message displays on API failure

### Detail Page (`/disputes/:id`)
- [ ] Case details load correctly
- [ ] User and Garage information displays
- [ ] Status badge shows with correct color
- [ ] Type badge displays (if applicable)
- [ ] Conversation thread shows all messages
- [ ] Evidence requested indicator appears (if applicable)
- [ ] Escalation indicator appears (if applicable)
- [ ] Resolution notes display (if resolved)
- [ ] Back button navigates to list page

### Request Evidence Modal
- [ ] Modal opens when clicking "Request Evidence"
- [ ] Textarea accepts input
- [ ] "Send Request" button disabled when empty
- [ ] Loading state during API call
- [ ] Success: Modal closes, data refreshes, status changes to "Under Review"
- [ ] New admin message appears in conversation
- [ ] Cancel button closes modal without action

### Resolve Case Modal
- [ ] Modal opens when clicking "Resolve Case"
- [ ] User message textarea is required
- [ ] Internal notes textarea is optional
- [ ] "Resolve Case" button disabled when message empty
- [ ] Loading state during API call
- [ ] Success: Modal closes, data refreshes, status changes to "Resolved"
- [ ] Resolution notes display on page
- [ ] Quick Actions buttons become disabled
- [ ] New admin message appears in conversation
- [ ] Cancel button closes modal without action

### Escalate Modal
- [ ] Modal opens when clicking "Escalate"
- [ ] Escalation reason is required
- [ ] Optional message textarea works
- [ ] "Escalate Case" button disabled when reason empty
- [ ] Loading state during API call
- [ ] Success: Modal closes, data refreshes, escalation indicator appears
- [ ] Priority changes to "Urgent"
- [ ] New admin message appears in conversation
- [ ] Cancel button closes modal without action

### Disabled States
- [ ] All Quick Action buttons disabled when status is "Resolved"
- [ ] All Quick Action buttons disabled when status is "Closed"
- [ ] Action buttons work normally for other statuses

---

## 🎨 UI Features

### Status Colors
- **Open**: Yellow (`bg-yellow-100 text-yellow-700`)
- **Under Review**: Blue (`bg-blue-100 text-blue-700`)
- **Pending**: Yellow (`bg-yellow-100 text-yellow-700`)
- **In Progress**: Blue (`bg-blue-100 text-blue-700`)
- **Resolved**: Green (`bg-green-100 text-green-700`)
- **Closed**: Gray (`bg-gray-100 text-gray-700`)

### Professional Modals
Each modal has:
- Custom design (not using generic ConfirmModal)
- Specific color scheme matching button color
- Form validation
- Required field indicators (*)
- Loading states
- Disabled states while processing
- Cancel functionality

### Indicators
- **Evidence Requested**: Blue banner with timestamp
- **Escalated**: Orange banner with reason
- **Resolved**: Green banner with resolution notes

---

## 🔐 API Methods

All methods are in `src/services/apiService.js`:

1. **getDisputes(search, status, type)** - List disputes with filters
2. **getDisputeDetail(disputeId)** - Get dispute with conversation
3. **requestEvidence(disputeId, message, adminId)** - Request evidence from garage
4. **resolveCase(disputeId, message, notes, adminId)** - Mark case as resolved
5. **escalateCase(disputeId, reason, message, adminId)** - Escalate to urgent
6. **addDisputeMessage(disputeId, message, senderType, senderId)** - Add message

---

## 📊 Database Schema Changes

### New Columns in `disputes` table:
- `type` - VARCHAR(20) - 'dispute' or 'revision'
- `user_id` - UUID - Reference to customer
- `booking_id` - UUID - Reference to booking
- `evidence_requested` - BOOLEAN - Evidence request flag
- `evidence_requested_at` - TIMESTAMP
- `evidence_requested_by` - UUID - Admin who requested
- `escalated` - BOOLEAN - Escalation flag
- `escalated_at` - TIMESTAMP
- `escalated_by` - UUID - Admin who escalated
- `escalation_reason` - TEXT
- `resolved_at` - TIMESTAMP
- `resolved_by` - UUID - Admin who resolved
- `resolution_notes` - TEXT - Internal admin notes
- `priority` - VARCHAR(20) - 'low', 'normal', 'high', 'urgent'

### New Status Value:
- `under_review` - When evidence is requested

---

## 🚨 Troubleshooting

### "Cannot read property 'id' of null" error
**Issue**: Admin ID not found in localStorage  
**Fix**: Ensure admin user is logged in and `userData` exists in localStorage

### "Failed to fetch disputes"
**Issue**: Edge Function not deployed or API URL incorrect  
**Fix**: 
1. Verify Edge Functions deployed: `supabase functions list`
2. Check `src/config/dev.js` has correct `SUPABASE_URL`

### Modals not showing
**Issue**: Z-index conflict or CSS issue  
**Fix**: Modals use `z-50` class, verify Tailwind CSS is configured

### Sample data not appearing
**Issue**: Placeholder UUIDs not replaced  
**Fix**: Replace all `00000000-0000-0000-0000-000000000001` style UUIDs with actual IDs

### "No messages yet" in conversation
**Issue**: dispute_messages not inserted or dispute_id mismatch  
**Fix**: 
1. Verify disputes inserted: `SELECT * FROM disputes;`
2. Get actual dispute IDs and update message inserts
3. Run message inserts with correct dispute_id values

---

## 📝 Next Steps

After deployment:
1. Test all three actions (Request Evidence, Resolve, Escalate)
2. Verify conversation thread updates after each action
3. Check status changes correctly
4. Confirm indicators appear (evidence, escalation, resolution)
5. Test with multiple disputes of different types
6. Test disabled states on resolved/closed cases
7. Verify search and filters work on list page

---

## 🎯 Feature Summary

**Request Evidence:**
- Sends message to garage requesting documentation
- Sets `evidence_requested = true`
- Changes status to 'under_review'
- Adds admin message to conversation
- Records who requested and when

**Resolve Case:**
- Marks dispute as resolved
- Sends message to user explaining resolution
- Stores internal notes for admin reference
- Records who resolved and when
- Disables further actions

**Escalate:**
- Changes priority to 'urgent'
- Flags as escalated with reason
- Optionally adds message to conversation
- Records who escalated and when
- Case remains actionable

All actions track admin user and timestamp for accountability.
