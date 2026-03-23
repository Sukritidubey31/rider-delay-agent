INSERT INTO rider (name, phone, vehicle_type, status) VALUES
  ('Arjun Mehta',      '+14151110001', 'bike',    'assigned'),
  ('Priya Sharma',     '+14151110002', 'scooter', 'available'),
  ('Carlos Rivera',    '+14151110003', 'car',     'assigned'),
  ('Mei Lin',          '+14151110004', 'bike',    'available'),
  ('James Okafor',     '+14151110005', 'scooter', 'assigned'),
  ('Sofia Rossi',      '+14151110006', 'car',     'offline'),
  ('Ravi Patel',       '+14151110007', 'bike',    'available'),
  ('Aisha Diallo',     '+14151110008', 'scooter', 'assigned'),
  ('Luca Bianchi',     '+14151110009', 'car',     'available'),
  ('Yuki Tanaka',      '+14151110010', 'bike',    'assigned'),
  ('Omar Hassan',      '+14151110011', 'scooter', 'available'),
  ('Elena Popescu',    '+14151110012', 'car',     'offline'),
  ('Dev Kapoor',       '+14151110013', 'bike',    'assigned'),
  ('Fatima Nour',      '+14151110014', 'scooter', 'available'),
  ('Marco Alves',      '+14151110015', 'car',     'assigned');


INSERT INTO customer (name, phone, email) VALUES
  ('Jamie Lee',        '+14152220001', 'jamie@example.com'),
  ('Sam Patel',        '+14152220002', 'sam@example.com'),
  ('Morgan Chen',      '+14152220003', 'morgan@example.com'),
  ('Taylor Brooks',    '+14152220004', 'taylor@example.com'),
  ('Jordan Kim',       '+14152220005', 'jordan@example.com'),
  ('Casey Williams',   '+14152220006', 'casey@example.com'),
  ('Riley Nguyen',     '+14152220007', 'riley@example.com'),
  ('Alex Turner',      '+14152220008', 'alex@example.com'),
  ('Dana Scott',       '+14152220009', 'dana@example.com'),
  ('Avery Johnson',    '+14152220010', 'avery@example.com'),
  ('Quinn Martinez',   '+14152220011', 'quinn@example.com'),
  ('Blake Robinson',   '+14152220012', 'blake@example.com'),
  ('Skyler Davis',     '+14152220013', 'skyler@example.com'),
  ('Peyton Clark',     '+14152220014', 'peyton@example.com'),
  ('Reese Thompson',   '+14152220015', 'reese@example.com');


INSERT INTO store (name, contact_phone, address) VALUES
  ('Downtown Bistro',      '+14153330001', '123 Main St, San Francisco, CA'),
  ('Noodle House',         '+14153330002', '456 Oak Ave, San Francisco, CA'),
  ('Burger Republic',      '+14153330003', '789 Market St, San Francisco, CA'),
  ('Spice Garden',         '+14153330004', '321 Mission St, San Francisco, CA'),
  ('The Sushi Bar',        '+14153330005', '654 Valencia St, San Francisco, CA'),
  ('Pizza Palace',         '+14153330006', '987 Castro St, San Francisco, CA'),
  ('Taco Town',            '+14153330007', '147 Haight St, San Francisco, CA'),
  ('Green Bowl',           '+14153330008', '258 Fillmore St, San Francisco, CA'),
  ('The Ramen Spot',       '+14153330009', '369 Divisadero St, San Francisco, CA'),
  ('Curry Corner',         '+14153330010', '741 Geary Blvd, San Francisco, CA'),
  ('Poke Paradise',        '+14153330011', '852 Irving St, San Francisco, CA'),
  ('The Sandwich Co',      '+14153330012', '963 Judah St, San Francisco, CA'),
  ('BBQ Brothers',         '+14153330013', '159 Noriega St, San Francisco, CA'),
  ('Dim Sum Palace',       '+14153330014', '357 Sunset Blvd, San Francisco, CA'),
  ('The Wrap Place',       '+14153330015', '486 Taraval St, San Francisco, CA');


DO $$
DECLARE
  r_id UUID; c_id UUID; s_id UUID;
BEGIN

  SELECT id INTO r_id FROM rider    WHERE phone = '+14151110001';
  SELECT id INTO c_id FROM customer WHERE phone = '+14152220001';
  SELECT id INTO s_id FROM store    WHERE contact_phone = '+14153330001';
  INSERT INTO "order" (rider_id, customer_id, store_id, status, placed_at, expected_pickup_at, picked_up_at, expected_delivery_at, delivered_at)
  VALUES (r_id, c_id, s_id, 'delivered', now()-'80 min'::interval, now()-'70 min'::interval, now()-'65 min'::interval, now()-'50 min'::interval, now()-'45 min'::interval);

  SELECT id INTO r_id FROM rider    WHERE phone = '+14151110002';
  SELECT id INTO c_id FROM customer WHERE phone = '+14152220002';
  SELECT id INTO s_id FROM store    WHERE contact_phone = '+14153330002';
  INSERT INTO "order" (rider_id, customer_id, store_id, status, placed_at, expected_pickup_at, picked_up_at, expected_delivery_at, delivered_at)
  VALUES (r_id, c_id, s_id, 'delivered', now()-'90 min'::interval, now()-'80 min'::interval, now()-'75 min'::interval, now()-'60 min'::interval, now()-'55 min'::interval);

  SELECT id INTO r_id FROM rider    WHERE phone = '+14151110003';
  SELECT id INTO c_id FROM customer WHERE phone = '+14152220003';
  SELECT id INTO s_id FROM store    WHERE contact_phone = '+14153330003';
  INSERT INTO "order" (rider_id, customer_id, store_id, status, placed_at, expected_pickup_at, picked_up_at, expected_delivery_at, delivered_at)
  VALUES (r_id, c_id, s_id, 'delivered', now()-'60 min'::interval, now()-'50 min'::interval, now()-'47 min'::interval, now()-'35 min'::interval, now()-'30 min'::interval);

  SELECT id INTO r_id FROM rider    WHERE phone = '+14151110004';
  SELECT id INTO c_id FROM customer WHERE phone = '+14152220004';
  SELECT id INTO s_id FROM store    WHERE contact_phone = '+14153330004';
  INSERT INTO "order" (rider_id, customer_id, store_id, status, placed_at, expected_pickup_at, picked_up_at, expected_delivery_at, delivered_at)
  VALUES (r_id, c_id, s_id, 'picked_up', now()-'40 min'::interval, now()-'30 min'::interval, now()-'27 min'::interval, now()+'10 min'::interval, NULL);

  SELECT id INTO r_id FROM rider    WHERE phone = '+14151110005';
  SELECT id INTO c_id FROM customer WHERE phone = '+14152220005';
  SELECT id INTO s_id FROM store    WHERE contact_phone = '+14153330005';
  INSERT INTO "order" (rider_id, customer_id, store_id, status, placed_at, expected_pickup_at, picked_up_at, expected_delivery_at, delivered_at)
  VALUES (r_id, c_id, s_id, 'picked_up', now()-'35 min'::interval, now()-'25 min'::interval, now()-'22 min'::interval, now()+'15 min'::interval, NULL);

  SELECT id INTO r_id FROM rider    WHERE phone = '+14151110007';
  SELECT id INTO c_id FROM customer WHERE phone = '+14152220006';
  SELECT id INTO s_id FROM store    WHERE contact_phone = '+14153330006';
  INSERT INTO "order" (rider_id, customer_id, store_id, status, placed_at, expected_pickup_at, picked_up_at, expected_delivery_at, delivered_at)
  VALUES (r_id, c_id, s_id, 'picked_up', now()-'70 min'::interval, now()-'60 min'::interval, now()-'55 min'::interval, now()-'15 min'::interval, NULL);

  SELECT id INTO r_id FROM rider    WHERE phone = '+14151110008';
  SELECT id INTO c_id FROM customer WHERE phone = '+14152220007';
  SELECT id INTO s_id FROM store    WHERE contact_phone = '+14153330007';
  INSERT INTO "order" (rider_id, customer_id, store_id, status, placed_at, expected_pickup_at, picked_up_at, expected_delivery_at, delivered_at)
  VALUES (r_id, c_id, s_id, 'picked_up', now()-'65 min'::interval, now()-'55 min'::interval, now()-'50 min'::interval, now()-'20 min'::interval, NULL);

  SELECT id INTO r_id FROM rider    WHERE phone = '+14151110010';
  SELECT id INTO c_id FROM customer WHERE phone = '+14152220008';
  SELECT id INTO s_id FROM store    WHERE contact_phone = '+14153330008';
  INSERT INTO "order" (rider_id, customer_id, store_id, status, placed_at, expected_pickup_at, picked_up_at, expected_delivery_at, delivered_at)
  VALUES (r_id, c_id, s_id, 'picked_up', now()-'80 min'::interval, now()-'70 min'::interval, now()-'65 min'::interval, now()-'25 min'::interval, NULL);

  SELECT id INTO r_id FROM rider    WHERE phone = '+14151110009';
  SELECT id INTO c_id FROM customer WHERE phone = '+14152220009';
  SELECT id INTO s_id FROM store    WHERE contact_phone = '+14153330009';
  INSERT INTO "order" (rider_id, customer_id, store_id, status, placed_at, expected_pickup_at, picked_up_at, expected_delivery_at, delivered_at)
  VALUES (r_id, c_id, s_id, 'assigned', now()-'20 min'::interval, now()+'10 min'::interval, NULL, now()+'35 min'::interval, NULL);

  SELECT id INTO r_id FROM rider    WHERE phone = '+14151110011';
  SELECT id INTO c_id FROM customer WHERE phone = '+14152220010';
  SELECT id INTO s_id FROM store    WHERE contact_phone = '+14153330010';
  INSERT INTO "order" (rider_id, customer_id, store_id, status, placed_at, expected_pickup_at, picked_up_at, expected_delivery_at, delivered_at)
  VALUES (r_id, c_id, s_id, 'assigned', now()-'15 min'::interval, now()+'15 min'::interval, NULL, now()+'40 min'::interval, NULL);

  SELECT id INTO r_id FROM rider    WHERE phone = '+14151110013';
  SELECT id INTO c_id FROM customer WHERE phone = '+14152220011';
  SELECT id INTO s_id FROM store    WHERE contact_phone = '+14153330011';
  INSERT INTO "order" (rider_id, customer_id, store_id, status, placed_at, expected_pickup_at, picked_up_at, expected_delivery_at, delivered_at)
  VALUES (r_id, c_id, s_id, 'assigned', now()-'50 min'::interval, now()-'30 min'::interval, NULL, now()+'5 min'::interval, NULL);

  SELECT id INTO r_id FROM rider    WHERE phone = '+14151110014';
  SELECT id INTO c_id FROM customer WHERE phone = '+14152220012';
  SELECT id INTO s_id FROM store    WHERE contact_phone = '+14153330012';
  INSERT INTO "order" (rider_id, customer_id, store_id, status, placed_at, expected_pickup_at, picked_up_at, expected_delivery_at, delivered_at)
  VALUES (r_id, c_id, s_id, 'assigned', now()-'55 min'::interval, now()-'35 min'::interval, NULL, now(), NULL);

  SELECT id INTO r_id FROM rider    WHERE phone = '+14151110015';
  SELECT id INTO c_id FROM customer WHERE phone = '+14152220013';
  SELECT id INTO s_id FROM store    WHERE contact_phone = '+14153330013';
  INSERT INTO "order" (rider_id, customer_id, store_id, status, placed_at, expected_pickup_at, picked_up_at, expected_delivery_at, delivered_at)
  VALUES (r_id, c_id, s_id, 'assigned', now()-'60 min'::interval, now()-'40 min'::interval, NULL, now()-'5 min'::interval, NULL);

  SELECT id INTO r_id FROM rider    WHERE phone = '+14151110006';
  SELECT id INTO c_id FROM customer WHERE phone = '+14152220014';
  SELECT id INTO s_id FROM store    WHERE contact_phone = '+14153330014';
  INSERT INTO "order" (rider_id, customer_id, store_id, status, placed_at, expected_pickup_at, picked_up_at, expected_delivery_at, delivered_at)
  VALUES (r_id, c_id, s_id, 'delivered', now()-'180 min'::interval, now()-'170 min'::interval, now()-'165 min'::interval, now()-'150 min'::interval, now()-'148 min'::interval);

  SELECT id INTO r_id FROM rider    WHERE phone = '+14151110012';
  SELECT id INTO c_id FROM customer WHERE phone = '+14152220015';
  SELECT id INTO s_id FROM store    WHERE contact_phone = '+14153330015';
  INSERT INTO "order" (rider_id, customer_id, store_id, status, placed_at, expected_pickup_at, picked_up_at, expected_delivery_at, delivered_at)
  VALUES (r_id, c_id, s_id, 'delivered', now()-'200 min'::interval, now()-'190 min'::interval, now()-'185 min'::interval, now()-'170 min'::interval, now()-'165 min'::interval);

END $$;


DO $$
DECLARE
  o_id UUID; r_id UUID;
BEGIN

  SELECT o.id, o.rider_id INTO o_id, r_id FROM "order" o JOIN rider r ON r.id = o.rider_id WHERE r.phone = '+14151110001' LIMIT 1;
  INSERT INTO delay (order_id, rider_id, delay_type, cause, delayed_by_minutes, escalation_status, resolution_outcome, contacted_rider_at, rider_responded_at, resolved_at)
  VALUES (o_id, r_id, 'late_pickup', 'Traffic on Market St', 12, 'resolved', 'resolved_by_rider', now()-'75 min'::interval, now()-'72 min'::interval, now()-'68 min'::interval);

  SELECT o.id, o.rider_id INTO o_id, r_id FROM "order" o JOIN rider r ON r.id = o.rider_id WHERE r.phone = '+14151110002' LIMIT 1;
  INSERT INTO delay (order_id, rider_id, delay_type, cause, delayed_by_minutes, escalation_status, resolution_outcome, contacted_rider_at, rider_responded_at, resolved_at)
  VALUES (o_id, r_id, 'late_delivery', 'Wrong address', 18, 'resolved', 'resolved_by_rider', now()-'85 min'::interval, now()-'82 min'::interval, now()-'70 min'::interval);

  SELECT o.id, o.rider_id INTO o_id, r_id FROM "order" o JOIN rider r ON r.id = o.rider_id WHERE r.phone = '+14151110003' LIMIT 1;
  INSERT INTO delay (order_id, rider_id, delay_type, cause, delayed_by_minutes, escalation_status, resolution_outcome, contacted_rider_at, rider_responded_at, contacted_customer_at, contacted_store_at, resolved_at)
  VALUES (o_id, r_id, 'late_delivery', 'Flat tyre', 25, 'resolved', 'resolved_by_ops', now()-'55 min'::interval, now()-'50 min'::interval, now()-'48 min'::interval, now()-'47 min'::interval, now()-'40 min'::interval);

  SELECT o.id, o.rider_id INTO o_id, r_id FROM "order" o JOIN rider r ON r.id = o.rider_id WHERE r.phone = '+14151110007' LIMIT 1;
  INSERT INTO delay (order_id, rider_id, delay_type, cause, delayed_by_minutes, escalation_status, contacted_rider_at, rider_responded_at, contacted_customer_at)
  VALUES (o_id, r_id, 'late_delivery', 'Heavy traffic', 15, 'escalated', now()-'30 min'::interval, now()-'26 min'::interval, now()-'24 min'::interval);

  SELECT o.id, o.rider_id INTO o_id, r_id FROM "order" o JOIN rider r ON r.id = o.rider_id WHERE r.phone = '+14151110008' LIMIT 1;
  INSERT INTO delay (order_id, rider_id, delay_type, cause, delayed_by_minutes, escalation_status, contacted_rider_at, rider_responded_at, contacted_customer_at, contacted_store_at)
  VALUES (o_id, r_id, 'late_delivery', 'Road closure', 20, 'escalated', now()-'25 min'::interval, now()-'20 min'::interval, now()-'18 min'::interval, now()-'17 min'::interval);

  SELECT o.id, o.rider_id INTO o_id, r_id FROM "order" o JOIN rider r ON r.id = o.rider_id WHERE r.phone = '+14151110010' LIMIT 1;
  INSERT INTO delay (order_id, rider_id, delay_type, cause, delayed_by_minutes, escalation_status, contacted_rider_at, rider_responded_at, contacted_customer_at, contacted_store_at)
  VALUES (o_id, r_id, 'late_delivery', 'Rider lost', 30, 'escalated', now()-'60 min'::interval, now()-'55 min'::interval, now()-'50 min'::interval, now()-'49 min'::interval);

  SELECT o.id, o.rider_id INTO o_id, r_id FROM "order" o JOIN rider r ON r.id = o.rider_id WHERE r.phone = '+14151110013' LIMIT 1;
  INSERT INTO delay (order_id, rider_id, delay_type, cause, delayed_by_minutes, escalation_status, contacted_rider_at, contacted_customer_at, contacted_store_at)
  VALUES (o_id, r_id, 'late_pickup', 'Rider not responding', 40, 'escalated', now()-'45 min'::interval, now()-'38 min'::interval, now()-'37 min'::interval);

  SELECT o.id, o.rider_id INTO o_id, r_id FROM "order" o JOIN rider r ON r.id = o.rider_id WHERE r.phone = '+14151110014' LIMIT 1;
  INSERT INTO delay (order_id, rider_id, delay_type, cause, delayed_by_minutes, escalation_status, contacted_rider_at)
  VALUES (o_id, r_id, 'late_pickup', 'App issue', 14, 'pending', now()-'10 min'::interval);

  SELECT o.id, o.rider_id INTO o_id, r_id FROM "order" o JOIN rider r ON r.id = o.rider_id WHERE r.phone = '+14151110015' LIMIT 1;
  INSERT INTO delay (order_id, rider_id, delay_type, cause, delayed_by_minutes, escalation_status, contacted_rider_at, rider_responded_at)
  VALUES (o_id, r_id, 'late_pickup', 'Stuck in traffic', 18, 'pending', now()-'12 min'::interval, now()-'9 min'::interval);

  SELECT o.id, o.rider_id INTO o_id, r_id FROM "order" o JOIN rider r ON r.id = o.rider_id WHERE r.phone = '+14151110004' LIMIT 1;
  INSERT INTO delay (order_id, rider_id, delay_type, delayed_by_minutes, escalation_status, contacted_rider_at)
  VALUES (o_id, r_id, 'late_delivery', 22, 'pending', now()-'8 min'::interval);

  SELECT o.id, o.rider_id INTO o_id, r_id FROM "order" o JOIN rider r ON r.id = o.rider_id WHERE r.phone = '+14151110005' LIMIT 1;
  INSERT INTO delay (order_id, rider_id, delay_type, cause, delayed_by_minutes, escalation_status, contacted_rider_at, contacted_customer_at, contacted_store_at)
  VALUES (o_id, r_id, 'late_delivery', 'Weather conditions', 22, 'escalated', now()-'20 min'::interval, now()-'15 min'::interval, now()-'14 min'::interval);

  SELECT o.id, o.rider_id INTO o_id, r_id FROM "order" o JOIN rider r ON r.id = o.rider_id WHERE r.phone = '+14151110009' LIMIT 1;
  INSERT INTO delay (order_id, rider_id, delay_type, cause, delayed_by_minutes, escalation_status, contacted_rider_at, rider_responded_at, contacted_customer_at, contacted_store_at)
  VALUES (o_id, r_id, 'late_pickup', 'Accident nearby', 35, 'escalated', now()-'18 min'::interval, now()-'14 min'::interval, now()-'12 min'::interval, now()-'11 min'::interval);

  SELECT o.id, o.rider_id INTO o_id, r_id FROM "order" o JOIN rider r ON r.id = o.rider_id WHERE r.phone = '+14151110006' LIMIT 1;
  INSERT INTO delay (order_id, rider_id, delay_type, cause, delayed_by_minutes, escalation_status, resolution_outcome, contacted_rider_at, rider_responded_at, resolved_at)
  VALUES (o_id, r_id, 'late_delivery', 'Customer not reachable', 16, 'resolved', 'resolved_by_rider', now()-'175 min'::interval, now()-'170 min'::interval, now()-'160 min'::interval);

  SELECT o.id, o.rider_id INTO o_id, r_id FROM "order" o JOIN rider r ON r.id = o.rider_id WHERE r.phone = '+14151110012' LIMIT 1;
  INSERT INTO delay (order_id, rider_id, delay_type, cause, delayed_by_minutes, escalation_status, resolution_outcome, contacted_rider_at, rider_responded_at, resolved_at)
  VALUES (o_id, r_id, 'late_delivery', 'Parking issue', 10, 'resolved', 'resolved_by_rider', now()-'195 min'::interval, now()-'192 min'::interval, now()-'185 min'::interval);

  SELECT o.id, o.rider_id INTO o_id, r_id FROM "order" o JOIN rider r ON r.id = o.rider_id WHERE r.phone = '+14151110011' LIMIT 1;
  INSERT INTO delay (order_id, rider_id, delay_type, cause, delayed_by_minutes, escalation_status, resolution_outcome, contacted_rider_at, contacted_customer_at, contacted_store_at, resolved_at)
  VALUES (o_id, r_id, 'late_pickup', 'Rider not responding', 28, 'resolved', 'no_response', now()-'100 min'::interval, now()-'93 min'::interval, now()-'92 min'::interval, now()-'80 min'::interval);

END $$;
