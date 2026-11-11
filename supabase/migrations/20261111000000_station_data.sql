-- Tibia Station: tabelas de dados importados da TibiaWiki (somente tabelas NOVAS; contrato: .empresa/arquitetura.md, seção 6).
-- Não toca no schema de buckets nem nas tabelas existentes. Leitura pública (anon/authenticated); sem escrita pela API.
-- NÃO aplicado em nenhum banco: André aplica (supabase db push) e depois roda supabase/seed.sql.
-- Divergências do contrato (a wiki vence): creatures.source_url e hunts.source_url (atribuição CC BY-SA, decisão do Líder);
-- creatures.bestiary_level é texto (a wiki usa Easy/Hard etc.); hunts.level_monks (aditivo, risco 9).
-- Rollback: drop table public.crypt_weapon_perks, public.crypt_weapons, public.hunt_creatures, public.hunts,
--           public.creature_resistances, public.creatures, public.data_sources;

begin;

create table if not exists public.data_sources (
  dataset          text primary key check (dataset in ('creatures','hunts','crypt_weapons')),
  endpoint         text not null,
  license          text not null,
  license_url      text,
  attribution      text not null,
  imported_at      timestamptz not null,
  record_count     integer not null check (record_count >= 0),
  importer_version text not null,
  unconfirmed_fields text[] not null default '{}'
);

create table if not exists public.creatures (
  slug           text primary key,
  name           text not null,
  wiki_title     text not null,
  source_url     text not null,   -- página da wiki (atribuição CC BY-SA)
  hp             integer check (hp is null or hp >= 0),
  exp            integer check (exp is null or exp >= 0),
  bestiary_class text,
  bestiary_level text
);
create index if not exists creatures_name_idx on public.creatures (name);

create table if not exists public.creature_resistances (
  creature_slug text not null references public.creatures (slug) on delete cascade,
  element       text not null check (element in
                  ('physical','earth','fire','energy','ice','holy','death','hpDrain','drown')),
  percent       numeric(7,2) not null check (percent between -10000 and 10000), -- formato wiki: 100 = neutro; negativo = absorve
  confirmed     boolean not null default true,                                -- false quando a wiki marca "100%?"
  primary key (creature_slug, element)
);

create table if not exists public.hunts (
  slug           text primary key,
  name           text not null,
  wiki_title     text not null,
  source_url     text not null,   -- página da wiki (atribuição CC BY-SA)
  city           text,
  location       text,
  level_knights  integer check (level_knights  is null or level_knights  >= 0),
  level_paladins integer check (level_paladins is null or level_paladins >= 0),
  level_mages    integer check (level_mages    is null or level_mages    >= 0),
  level_monks    integer check (level_monks    is null or level_monks    >= 0),
  exp_raw        text,
  loot_raw       text
);
create index if not exists hunts_level_knights_idx on public.hunts (level_knights);

create table if not exists public.hunt_creatures (
  hunt_slug     text not null references public.hunts (slug)     on delete cascade,
  creature_slug text not null references public.creatures (slug) on delete restrict,
  weight        numeric(8,2) not null check (weight > 0),
  primary key (hunt_slug, creature_slug)
);
create index if not exists hunt_creatures_creature_idx on public.hunt_creatures (creature_slug);

create table if not exists public.crypt_weapons (
  slug             text primary key,
  name             text not null,
  wiki_title       text not null,
  vocation         text not null check (vocation in ('knight','monk')),
  category         text not null check (category in ('club','sword','axe','fist')),
  attack           smallint not null check (attack >= 0),
  defense          smallint not null check (defense >= 0),
  element          text check (element is null or element in ('fire','earth','energy')),
  level_required   smallint not null check (level_required > 0),
  imbuement_slots  smallint not null check (imbuement_slots >= 0),
  attributes       text[] not null default '{}'
);

create table if not exists public.crypt_weapon_perks (
  weapon_slug      text not null references public.crypt_weapons (slug) on delete cascade,
  level            smallint not null check (level between 1 and 7),
  perk_index       smallint not null check (perk_index >= 1),     -- id da UI = level || '.' || perk_index
  text             text not null,
  pierce_physical  numeric(5,2) not null default 0 check (pierce_physical  >= 0),
  pierce_elemental numeric(5,2) not null default 0 check (pierce_elemental >= 0),
  primary key (weapon_slug, level, perk_index)
);

-- RLS: leitura pública; nenhuma policy de escrita => insert/update/delete negados para anon/authenticated.
-- Escrita só pelo dono (migration/seed) ou service_role, nunca pelo app.
do $$
declare t text;
begin
  foreach t in array array['data_sources','creatures','creature_resistances','hunts',
                           'hunt_creatures','crypt_weapons','crypt_weapon_perks']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('revoke insert, update, delete, truncate on public.%I from anon, authenticated', t);
  end loop;
end $$;

commit;
