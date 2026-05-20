create table bookings (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'pending_payment',
  stripe_payment_intent_id text unique,
  nuki_auth_id integer,
  access_code text,
  created_at timestamptz default now()
);

-- Prevents two confirmed bookings from sharing the same start time
create unique index bookings_start_time_confirmed
  on bookings (start_time)