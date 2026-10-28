-- Dispensa Smart: database per gli account.
-- Incolla tutto questo testo in Supabase > SQL Editor e premi "Run".
-- Si può eseguire più volte senza problemi.

-- Una riga per utente con tutti i suoi dati.
create table if not exists public.dispensa_dati (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- Una copia di sicurezza al giorno per utente (l'app tiene le ultime 14).
create table if not exists public.dispensa_copie (
  user_id uuid not null references auth.users(id) on delete cascade,
  giorno  date not null,
  data    jsonb not null,
  primary key (user_id, giorno)
);

-- Sicurezza: ogni utente vede e modifica solo le proprie righe.
alter table public.dispensa_dati  enable row level security;
alter table public.dispensa_copie enable row level security;

drop policy if exists "dati: solo il proprietario" on public.dispensa_dati;
create policy "dati: solo il proprietario" on public.dispensa_dati
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "copie: solo il proprietario" on public.dispensa_copie;
create policy "copie: solo il proprietario" on public.dispensa_copie
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Chi non ha fatto l'accesso non può leggere né scrivere nulla.
revoke all on public.dispensa_dati  from anon;
revoke all on public.dispensa_copie from anon;

-- =====================================================================
-- FAMIGLIA (facoltativo): dispensa, lista della spesa e piano condivisi.
-- Si può eseguire più volte senza problemi.
-- =====================================================================
create table if not exists public.famiglie (
  id     uuid primary key default gen_random_uuid(),
  codice text unique not null,
  nome   text not null default 'La mia famiglia',
  creata timestamptz not null default now()
);
create table if not exists public.membri (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  famiglia_id uuid not null references public.famiglie(id) on delete cascade,
  dal         timestamptz not null default now()
);
create table if not exists public.famiglia_dati (
  famiglia_id uuid primary key references public.famiglie(id) on delete cascade,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);
alter table public.famiglie      enable row level security;
alter table public.membri        enable row level security;
alter table public.famiglia_dati enable row level security;
revoke all on public.famiglie, public.membri, public.famiglia_dati from anon;

-- Restituisce la famiglia dell'utente connesso (serve alle regole di sicurezza).
create or replace function public.mia_famiglia() returns uuid
language sql stable security definer set search_path = public as
$$ select famiglia_id from public.membri where user_id = auth.uid() $$;

drop policy if exists "famiglie: la mia" on public.famiglie;
create policy "famiglie: la mia" on public.famiglie
  for select to authenticated using (id = public.mia_famiglia());
drop policy if exists "membri: io" on public.membri;
create policy "membri: io" on public.membri
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "famiglia_dati: i membri" on public.famiglia_dati;
create policy "famiglia_dati: i membri" on public.famiglia_dati
  for all to authenticated
  using (famiglia_id = public.mia_famiglia())
  with check (famiglia_id = public.mia_famiglia());

create or replace function public.info_famiglia() returns json
language plpgsql stable security definer set search_path = public as $$
declare f public.famiglie; n int;
begin
  select fa.* into f from public.famiglie fa join public.membri m on m.famiglia_id = fa.id where m.user_id = auth.uid();
  if not found then return null; end if;
  select count(*) into n from public.membri where famiglia_id = f.id;
  return json_build_object('id', f.id, 'codice', f.codice, 'nome', f.nome, 'n', n);
end $$;

create or replace function public.crea_famiglia(p_nome text) returns json
language plpgsql security definer set search_path = public as $$
declare f public.famiglie; c text;
begin
  if auth.uid() is null then raise exception 'Devi aver effettuato l''accesso.'; end if;
  if exists (select 1 from public.membri where user_id = auth.uid()) then raise exception 'Fai già parte di una famiglia.'; end if;
  loop
    c := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 10));
    exit when not exists (select 1 from public.famiglie where codice = c);
  end loop;
  insert into public.famiglie (codice, nome) values (c, coalesce(nullif(trim(p_nome), ''), 'La mia famiglia')) returning * into f;
  insert into public.membri (user_id, famiglia_id) values (auth.uid(), f.id);
  return json_build_object('id', f.id, 'codice', f.codice, 'nome', f.nome, 'n', 1);
end $$;

create or replace function public.entra_famiglia(p_codice text) returns json
language plpgsql security definer set search_path = public as $$
declare f public.famiglie; n int; c text := upper(regexp_replace(coalesce(p_codice, ''), '[^A-Za-z0-9]', '', 'g'));
begin
  if auth.uid() is null then raise exception 'Devi aver effettuato l''accesso.'; end if;
  if exists (select 1 from public.membri where user_id = auth.uid()) then raise exception 'Fai già parte di una famiglia: esci prima da quella.'; end if;
  select * into f from public.famiglie where codice = c;
  if not found then raise exception 'Codice non valido: controlla di averlo scritto giusto.'; end if;
  select count(*) into n from public.membri where famiglia_id = f.id;
  if n >= 10 then raise exception 'Questa famiglia ha già 10 persone.'; end if;
  insert into public.membri (user_id, famiglia_id) values (auth.uid(), f.id);
  return json_build_object('id', f.id, 'codice', f.codice, 'nome', f.nome, 'n', n + 1);
end $$;

create or replace function public.esci_famiglia() returns void
language plpgsql security definer set search_path = public as $$
declare fid uuid;
begin
  select famiglia_id into fid from public.membri where user_id = auth.uid();
  if fid is null then return; end if;
  delete from public.membri where user_id = auth.uid();
  if not exists (select 1 from public.membri where famiglia_id = fid) then
    delete from public.famiglie where id = fid;   -- l'ultima persona che esce chiude la famiglia
  end if;
end $$;

revoke execute on function public.mia_famiglia(), public.info_famiglia(), public.crea_famiglia(text), public.entra_famiglia(text), public.esci_famiglia() from public, anon;
grant  execute on function public.mia_famiglia(), public.info_famiglia(), public.crea_famiglia(text), public.entra_famiglia(text), public.esci_famiglia() to authenticated;

-- =====================================================================
-- RICHIESTE DI VOLANTINI (facoltativo): chi cerca un supermercato che non
-- c'è ancora lo "prenota"; lo scaricatore notturno lo aggiunge.
-- =====================================================================
create table if not exists public.richieste_volantini (
  id      bigserial primary key,
  chiave  text unique not null,                       -- catena|città, per evitare doppioni
  catena  text not null check (char_length(catena) <= 60),
  regione text not null check (char_length(regione) <= 60),
  citta   text not null check (char_length(citta) <= 60),
  user_id uuid default auth.uid() references auth.users(id) on delete set null,
  creata  timestamptz not null default now()
);
alter table public.richieste_volantini enable row level security;
revoke all on public.richieste_volantini from anon;
drop policy if exists "richieste: inserire" on public.richieste_volantini;
create policy "richieste: inserire" on public.richieste_volantini
  for insert to authenticated with check (user_id = auth.uid());
-- Nessuno può leggere le richieste dall'app: le legge solo lo scaricatore con la chiave segreta di GitHub.
grant insert on public.richieste_volantini to authenticated;
grant usage, select on sequence public.richieste_volantini_id_seq to authenticated;
notify pgrst, 'reload schema';

-- =====================================================================
-- VOLANTINI PRIVATI (versione 2.3): ognuno vede solo i SUOI supermercati.
-- Le immagini stanno in un archivio PRIVATO (Storage) e vengono salvate una sola volta;
-- chi non ha aggiunto quel supermercato al proprio elenco non può leggerle.
-- =====================================================================
-- 1) Il mio elenco di supermercati
create table if not exists public.miei_volantini (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  chiave  text not null check (char_length(chiave) <= 130),      -- catena|città
  creata  timestamptz not null default now(),
  primary key (user_id, chiave)
);
alter table public.miei_volantini enable row level security;
revoke all on public.miei_volantini from anon;
drop policy if exists "miei: leggere" on public.miei_volantini;
create policy "miei: leggere" on public.miei_volantini for select to authenticated using (user_id = auth.uid());
drop policy if exists "miei: aggiungere" on public.miei_volantini;
create policy "miei: aggiungere" on public.miei_volantini for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "miei: togliere" on public.miei_volantini;
create policy "miei: togliere" on public.miei_volantini for delete to authenticated using (user_id = auth.uid());
grant select, insert, delete on public.miei_volantini to authenticated;

-- 2) Catalogo dei volantini scaricati (lo scrive solo lo scaricatore con la chiave segreta)
create table if not exists public.volantini_catalogo (
  chiave     text primary key,
  nome       text not null,
  regione    text,
  citta      text,
  url        text,
  volantini  jsonb not null default '[]'::jsonb,
  aggiornato timestamptz not null default now()
);
alter table public.volantini_catalogo enable row level security;
revoke all on public.volantini_catalogo from anon;
drop policy if exists "catalogo: leggo i miei" on public.volantini_catalogo;
create policy "catalogo: leggo i miei" on public.volantini_catalogo for select to authenticated
  using (exists (select 1 from public.miei_volantini m where m.user_id = auth.uid() and m.chiave = volantini_catalogo.chiave));
grant select on public.volantini_catalogo to authenticated;

-- 3) Archivio privato delle immagini
insert into storage.buckets (id, name, public) values ('volantini', 'volantini', false)
  on conflict (id) do update set public = false;
drop policy if exists "volantini: leggo i miei" on storage.objects;
create policy "volantini: leggo i miei" on storage.objects for select to authenticated
  using (bucket_id = 'volantini' and exists (
    select 1 from public.miei_volantini m
    where m.user_id = auth.uid() and replace(m.chiave, '|', '__') = (storage.foldername(name))[1]));
notify pgrst, 'reload schema';

-- Volantini che ho rimosso a mano dal mio elenco (valgono solo per il mio account)
create table if not exists public.volantini_nascosti (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  chiave  text not null check (char_length(chiave) <= 160),      -- catena|città#id volantino
  creata  timestamptz not null default now(),
  primary key (user_id, chiave)
);
alter table public.volantini_nascosti enable row level security;
revoke all on public.volantini_nascosti from anon;
drop policy if exists "nascosti: leggere" on public.volantini_nascosti;
create policy "nascosti: leggere" on public.volantini_nascosti for select to authenticated using (user_id = auth.uid());
drop policy if exists "nascosti: aggiungere" on public.volantini_nascosti;
create policy "nascosti: aggiungere" on public.volantini_nascosti for insert to authenticated with check (user_id = auth.uid());
grant select, insert on public.volantini_nascosti to authenticated;
notify pgrst, 'reload schema';
