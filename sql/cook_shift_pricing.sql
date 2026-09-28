-- Cook rates by shift, extra-person discount, and the Cook + Cleaning add-on.
-- Customers are charged from these settings (Admin → Settings).

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  ('cook_morning_per_person', '1200'::jsonb, 'Cook charge per person for the morning shift, in rupees'),
  ('cook_evening_per_person', '1200'::jsonb, 'Cook charge per person for the evening shift, in rupees'),
  ('cook_both_per_person', '2000'::jsonb, 'Cook charge per person when both morning and evening are booked, in rupees'),
  ('cook_extra_person_discount_percent', '10'::jsonb, 'Percent off the per-person cook rate for each person after the first'),
  ('cook_cleaning_monthly', '1200'::jsonb, 'Flat monthly cleaning add-on on Cook + Cleaning, in rupees')
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description;

DELETE FROM system_settings WHERE setting_key = 'cook_per_person_price';

UPDATE home_category_options
SET price_label = 'from ₹1,200 / person',
    pricing = '[
      {"label":"Morning","subtitle":"7 AM – 11 AM","minutes":240,"startTime":"07:00","price":1200},
      {"label":"Evening","subtitle":"5 PM – 9 PM","minutes":240,"startTime":"17:00","price":1200},
      {"label":"Both","subtitle":"Morning + Evening","minutes":480,"startTime":"07:00","price":2000}
    ]'::jsonb
WHERE id = 'b1b00000-0000-4000-8000-000000000001';

UPDATE home_category_options
SET price_label = 'Cook from ₹1,200 / person + ₹1,200 cleaning',
    pricing = '[
      {"label":"Morning","subtitle":"7 AM – 11 AM","minutes":240,"startTime":"07:00","price":1200},
      {"label":"Evening","subtitle":"5 PM – 9 PM","minutes":240,"startTime":"17:00","price":1200},
      {"label":"Both","subtitle":"Morning + Evening","minutes":480,"startTime":"07:00","price":2000}
    ]'::jsonb
WHERE id = 'b1b00000-0000-4000-8000-000000000003';

UPDATE home_popular_items
SET price_label = 'from ₹1,200 / person'
WHERE id = 'c1c00000-0000-4000-8000-000000000002';

UPDATE home_popular_items
SET price_label = 'Cook + ₹1,200 cleaning'
WHERE id = 'c1c00000-0000-4000-8000-000000000003';
