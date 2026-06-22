# Gym Rental — Self-Service Booking Platform

A self-service gym rental MVP. Users book an hourly time slot, pay online, and receive a time-limited door code by email — no staff involvement required.

**Live demo:** [gym-rental2.vercel.app](gym-rental2.vercel.app)

## How it works

1. User picks an available hourly slot on the booking page.
2. Stripe PaymentElement collects payment; a webhook confirms it server-side.
3. On confirmed payment, a time-limited door code is generated via the Nuki Smart Lock API.
4. The code is emailed to the user via Resend (React Email templates).

## Features

- Hourly slot booking with real-time availability
- Stripe PaymentElement with webhook-driven payment confirmation
- Automated door code generation via Nuki API
- Transactional email with React Email + Resend
- Password-protected admin dashboard
- Double-booking prevention enforced at the database level

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Supabase](https://supabase.com) — database + auth
- [Stripe](https://stripe.com) — payments + webhooks
- [Resend](https://resend.com) + React Email — transactional email
- [Nuki Smart Lock API](https://developer.nuki.io) — door code generation
- Deployed on [Vercel](https://vercel.com)

## Database schema

A single `bookings` table tracks the full lifecycle of a reservation:

\`\`\`sql
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

-- Prevents two bookings from sharing the same start time
create unique index bookings_start_time_confirmed
  on bookings (start_time);
\`\`\`

## Project structure

\`\`\`
app/
  book/                 booking page (slot picker + payment)
  booking/confirmation/ post-payment confirmation page
  admin/                password-protected dashboard
  api/
    slots/              GET available time slots
    bookings/create/    POST to create a pending booking
    webhooks/stripe/    Stripe payment confirmation webhook
    admin/bookings/     admin booking management
lib/
  supabase/             DB client (browser + server/admin)
  stripe.ts             Stripe SDK setup
  resend.ts             Resend email client
  nuki.ts               Nuki Smart Lock API client
emails/                 React Email templates
\`\`\`

## Getting started

1. Clone the repo and install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Copy `.env.example` to `.env.local` and fill in your Supabase, Stripe, Resend, and Nuki credentials.
3. Run the dev server:
   \`\`\`bash
   npm run dev
   \`\`\`
4. Open [http://localhost:3000](http://localhost:3000).
