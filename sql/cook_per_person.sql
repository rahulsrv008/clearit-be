-- Cook is charged per person. The first person pays the full rate.
-- Each extra person gets the configured percent off that rate.
-- Change the numbers from Admin → Settings.

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  ('cook_per_person_price', '1700'::jsonb, 'Monthly cook charge per person, in rupees'),
  ('cook_extra_person_discount_percent', '10'::jsonb, 'Percent off the per-person cook rate for each person after the first')
ON CONFLICT (setting_key) DO NOTHING;

UPDATE home_category_options
SET price_label = 'from ₹1,700 / person'
WHERE id = 'b1b00000-0000-4000-8000-000000000001';

UPDATE home_popular_items
SET price_label = 'from ₹1,700 / person'
WHERE id = 'c1c00000-0000-4000-8000-000000000002';
