-- On Demand durations + monthly plan shifts, and plan bookings. Safe to re-run.

ALTER TABLE home_categories
  ADD COLUMN IF NOT EXISTS pricing JSONB NOT NULL DEFAULT '[]';

ALTER TABLE home_category_options
  ADD COLUMN IF NOT EXISTS pricing JSONB NOT NULL DEFAULT '[]';

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS plan_type VARCHAR(20),
  ADD COLUMN IF NOT EXISTS plan_title VARCHAR(200),
  ADD COLUMN IF NOT EXISTS home_category_id UUID REFERENCES home_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS home_option_id UUID REFERENCES home_category_options(id) ON DELETE SET NULL;

-- Rename Hourly Help -> On Demand and give it durations (45 min – 3 hrs).
UPDATE home_categories
SET title = 'On Demand',
    subtitle = 'An expert, by the hour',
    pricing = '[
      {"label":"45 min","subtitle":null,"minutes":45,"startTime":null,"price":249},
      {"label":"1 hr","subtitle":null,"minutes":60,"startTime":null,"price":299},
      {"label":"90 min","subtitle":null,"minutes":90,"startTime":null,"price":429},
      {"label":"2 hrs","subtitle":null,"minutes":120,"startTime":null,"price":549},
      {"label":"2.5 hrs","subtitle":null,"minutes":150,"startTime":null,"price":679},
      {"label":"3 hrs","subtitle":null,"minutes":180,"startTime":null,"price":799}
    ]'
WHERE id = 'a1a00000-0000-4000-8000-000000000001';

UPDATE home_popular_items
SET title = 'On Demand · 2 hrs', price_label = '₹549'
WHERE id = 'c1c00000-0000-4000-8000-000000000001';

-- Monthly plan shifts: Morning / Evening / Both.
UPDATE home_category_options SET pricing = '[
  {"label":"Morning","subtitle":"7 AM – 11 AM","minutes":240,"startTime":"07:00","price":4999},
  {"label":"Evening","subtitle":"5 PM – 9 PM","minutes":240,"startTime":"17:00","price":4999},
  {"label":"Both","subtitle":"Morning + Evening","minutes":480,"startTime":"07:00","price":8999}
]' WHERE id = 'b1b00000-0000-4000-8000-000000000001';

UPDATE home_category_options SET pricing = '[
  {"label":"Morning","subtitle":"7 AM – 11 AM","minutes":240,"startTime":"07:00","price":3999},
  {"label":"Evening","subtitle":"5 PM – 9 PM","minutes":240,"startTime":"17:00","price":3999},
  {"label":"Both","subtitle":"Morning + Evening","minutes":480,"startTime":"07:00","price":6999}
]' WHERE id = 'b1b00000-0000-4000-8000-000000000002';

UPDATE home_category_options SET pricing = '[
  {"label":"Morning","subtitle":"7 AM – 11 AM","minutes":240,"startTime":"07:00","price":7999},
  {"label":"Evening","subtitle":"5 PM – 9 PM","minutes":240,"startTime":"17:00","price":7999},
  {"label":"Both","subtitle":"Morning + Evening","minutes":480,"startTime":"07:00","price":13999}
]' WHERE id = 'b1b00000-0000-4000-8000-000000000003';
