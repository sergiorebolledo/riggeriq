-- Esquema inicial de Rigging Pro AI (Etapa 6).
--
-- La autenticacion la maneja Clerk, no Supabase Auth, por lo que estas
-- tablas se referencian por `clerk_user_id` (texto) en vez de `auth.uid()`.
-- Row Level Security queda ACTIVADO en todas las tablas SIN policies: eso
-- deniega todo acceso a los roles `anon` y `authenticated` por defecto. El
-- unico acceso valido es desde el backend, usando la Service Role Key
-- (que ignora RLS), a traves de las API routes de Next.js. Esto evita tener
-- que exponer la Service Role Key o el anon key al cliente.
--
-- Si en el futuro se integra el JWT template de Clerk con Supabase para
-- permitir lecturas directas desde el cliente, se pueden agregar policies
-- basadas en `auth.jwt() ->> 'sub'` en ese momento.

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  email text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_clerk_user_id_idx on profiles (clerk_user_id);
create index if not exists profiles_stripe_customer_id_idx on profiles (stripe_customer_id);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  stripe_subscription_id text not null unique,
  stripe_price_id text not null,
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_profile_id_idx on subscriptions (profile_id);

-- Historial de planes de izaje guardados (PRD seccion 3: "Seleccion e
-- historial guardado en Supabase de planes anteriores", exclusivo Pro).
create table if not exists lifting_plans (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  title text,
  input jsonb not null,
  result jsonb not null,
  status text not null,
  created_at timestamptz not null default now()
);

create index if not exists lifting_plans_profile_id_idx on lifting_plans (profile_id);

alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table lifting_plans enable row level security;

-- Mantiene updated_at al dia en cada UPDATE.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger subscriptions_set_updated_at
  before update on subscriptions
  for each row execute function set_updated_at();
