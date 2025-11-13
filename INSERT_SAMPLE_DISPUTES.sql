-- Sample Disputes Data for Testing
-- Run this ENTIRE script in Supabase SQL Editor in one go
-- It will create disputes and messages in a single transaction

DO $$
DECLARE
  dispute_1_id UUID;
  dispute_2_id UUID;
  dispute_3_id UUID;
  dispute_4_id UUID;
BEGIN

-- Sample Dispute 1: Open dispute about incorrect charges
INSERT INTO disputes (
  garage_id,
  contact_name,
  contact_email,
  subject,
  message,
  type,
  status,
  priority,
  created_at
) VALUES (
  '48a774df-6a4f-4882-9308-a2c141f3c1f2'::uuid, -- Gil Chiu garage
  'Ali Khan',
  'ali@example.com',
  'Incorrect charge on invoice',
  'I was charged 200 AED more than the original quote provided. The quote said 500 AED but I was charged 700 AED.',
  'dispute',
  'open',
  'normal',
  NOW() - INTERVAL '2 days'
) RETURNING id INTO dispute_1_id;

-- Sample Dispute 2: Under review - evidence has been requested
INSERT INTO disputes (
  garage_id,
  contact_name,
  contact_email,
  subject,
  message,
  type,
  status,
  priority,
  evidence_requested,
  evidence_requested_at,
  evidence_requested_by,
  created_at
) VALUES (
  '48a774df-6a4f-4882-9308-a2c141f3c1f2'::uuid, -- Gil Chiu garage
  'Sara Malik',
  'sara@example.com',
  'Poor quality repair work',
  'The brake repair was not done properly. The brakes are still making noise after the service.',
  'dispute',
  'under_review',
  'high',
  true,
  NOW() - INTERVAL '1 day',
  '2ad16684-83b5-4058-b39a-fbd80ca3c6cf'::uuid, -- admin@autosaaz.com
  NOW() - INTERVAL '3 days'
) RETURNING id INTO dispute_2_id;

-- Sample Revision 1: Pending revision request
INSERT INTO disputes (
  garage_id,
  contact_name,
  contact_email,
  subject,
  message,
  type,
  status,
  priority,
  created_at
) VALUES (
  '48a774df-6a4f-4882-9308-a2c141f3c1f2'::uuid, -- Gil Chiu garage
  'Ahmed Hassan',
  'ahmed@example.com',
  'Request additional inspection photos',
  'Could you please provide more detailed photos of the engine bay? I need to see the condition of the belts and hoses.',
  'revision',
  'pending',
  'low',
  NOW() - INTERVAL '1 day'
) RETURNING id INTO dispute_3_id;

-- Sample Dispute 4: Resolved dispute
INSERT INTO disputes (
  garage_id,
  contact_name,
  contact_email,
  subject,
  message,
  type,
  status,
  priority,
  resolved_at,
  resolved_by,
  resolution_notes,
  created_at
) VALUES (
  '48a774df-6a4f-4882-9308-a2c141f3c1f2'::uuid, -- Gil Chiu garage
  'Fatima Ali',
  'fatima@example.com',
  'Wrong part installed',
  'The garage installed a non-OEM part instead of the OEM part I paid for.',
  'dispute',
  'resolved',
  'normal',
  NOW() - INTERVAL '6 hours',
  '2ad16684-83b5-4058-b39a-fbd80ca3c6cf'::uuid, -- admin@autosaaz.com
  'Garage has agreed to replace with OEM part at no additional cost. Customer satisfied with resolution.',
  NOW() - INTERVAL '5 days'
) RETURNING id INTO dispute_4_id;

-- Messages for Dispute 1 (Incorrect charge)
INSERT INTO dispute_messages (ticket_id, sender_id, body, created_at)
VALUES 
  (dispute_1_id, '48a774df-6a4f-4882-9308-a2c141f3c1f2'::uuid, 
   'I was charged 200 AED more than quoted. The original quote clearly stated 500 AED.', 
   NOW() - INTERVAL '2 days'),
  (dispute_1_id, '2ad16684-83b5-4058-b39a-fbd80ca3c6cf'::uuid, 
   'We are reviewing the invoice and quotation. I will get back to you within 24 hours.', 
   NOW() - INTERVAL '1 day 20 hours');

-- Messages for Dispute 2 (Poor quality repair)
INSERT INTO dispute_messages (ticket_id, sender_id, body, created_at)
VALUES 
  (dispute_2_id, '48a774df-6a4f-4882-9308-a2c141f3c1f2'::uuid, 
   'The brakes are still making a grinding noise even after the repair. This was the main issue I brought the car in for.', 
   NOW() - INTERVAL '3 days'),
  (dispute_2_id, '2ad16684-83b5-4058-b39a-fbd80ca3c6cf'::uuid, 
   'We need you to provide photos or video demonstrating the brake pedal issue for our investigation.', 
   NOW() - INTERVAL '1 day');

-- Messages for Revision 1 (Additional photos)
INSERT INTO dispute_messages (ticket_id, sender_id, body, created_at)
VALUES 
  (dispute_3_id, '48a774df-6a4f-4882-9308-a2c141f3c1f2'::uuid, 
   'Please provide more detailed photos of the engine bay, especially around the belts and hoses area.', 
   NOW() - INTERVAL '1 day');

-- Messages for Dispute 4 (Wrong part - Resolved)
INSERT INTO dispute_messages (ticket_id, sender_id, body, created_at)
VALUES 
  (dispute_4_id, '48a774df-6a4f-4882-9308-a2c141f3c1f2'::uuid, 
   'I specifically requested OEM parts but aftermarket parts were installed instead.', 
   NOW() - INTERVAL '5 days'),
  (dispute_4_id, '48a774df-6a4f-4882-9308-a2c141f3c1f2'::uuid, 
   'We apologize for the confusion. We will replace with OEM parts at no additional charge.', 
   NOW() - INTERVAL '4 days 18 hours'),
  (dispute_4_id, '2ad16684-83b5-4058-b39a-fbd80ca3c6cf'::uuid, 
   'Case resolved: Garage has agreed to replace with OEM part at no additional cost. Customer satisfied with resolution.', 
   NOW() - INTERVAL '6 hours');

-- Raise notice to confirm
RAISE NOTICE 'Sample disputes and messages created successfully!';

END $$;

-- VERIFICATION: View your sample data
SELECT 
  d.id,
  d.code,
  d.type,
  d.subject,
  d.status,
  d.priority,
  d.evidence_requested,
  d.escalated,
  d.contact_name,
  d.contact_email,
  gp.garage_name,
  gp.full_name as garage_owner,
  d.created_at
FROM disputes d
LEFT JOIN garage_profiles gp ON gp.user_id = d.garage_id
ORDER BY d.created_at DESC;
