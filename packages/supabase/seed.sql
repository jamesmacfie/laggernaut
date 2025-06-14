-- Insert into auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  'dcfaa55f-f642-4b16-af95-88bdb8266ab9',
  'test@test.com',
  crypt('Orange goat 44!', gen_salt('bf')),
  now(),
  '2025-06-14 08:52:26.288189',
  '2025-06-14 08:52:26.288189'
) ON CONFLICT (id) DO NOTHING;

-- Insert into public.user
INSERT INTO public.user (
  id,
  email,
  created_at,
  updated_at
) VALUES (
  'dcfaa55f-f642-4b16-af95-88bdb8266ab9',
  'test@test.com',
  '2025-06-14 08:52:26.288189',
  '2025-06-14 08:52:26.288189'
) ON CONFLICT (id) DO NOTHING;

-- Throw in some site
WITH first_user AS (
  SELECT id FROM public.user ORDER BY created_at ASC LIMIT 1
)
INSERT INTO site (url, name, state, thumbnail_url, created_by_user_id)
SELECT 
  sites.url,
  sites.name,
  sites.state::site_state,  -- Cast to enum type
  sites.thumbnail_url,
  first_user.id
FROM (
  VALUES 
    ('https://example.com', 'Example Site', 'pending', NULL),
    ('https://google.com', 'Google', 'active', NULL),
    ('https://github.com', 'GitHub', 'pending', NULL),
    ('https://stackoverflow.com', 'Stack Overflow', 'active', NULL)
) AS sites(url, name, state, thumbnail_url)
CROSS JOIN first_user;
