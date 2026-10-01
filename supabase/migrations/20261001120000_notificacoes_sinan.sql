-- Notificações compulsórias (fichas SINAN). Já aplicada no banco em 01/10/2026. Nada é apagado: só invalidado.
create table if not exists public.notificacoes_sinan (
  id uuid primary key default gen_random_uuid(),
  atendimento_id uuid not null references public.atendimentos(id),
  pessoa_id uuid not null references public.pessoas(id),
  modelo text not null,
  agravo text,
  dados jsonb not null default '{}'::jsonb,
  situacao text not null default 'rascunho' check (situacao in ('rascunho','registrada','entregue','invalidada')),
  sigiloso boolean not null default false,
  criado_por uuid not null default auth.uid() references public.enfermeiros(id),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  entregue_em timestamptz,
  invalidado_por uuid references public.enfermeiros(id),
  invalidado_em timestamptz,
  motivo_invalidacao text
);
create index if not exists notificacoes_sinan_atendimento_idx on public.notificacoes_sinan(atendimento_id);
create index if not exists notificacoes_sinan_criado_em_idx on public.notificacoes_sinan(criado_em desc);
alter table public.notificacoes_sinan enable row level security;
create policy notificacoes_sinan_select on public.notificacoes_sinan for select to authenticated
  using (usuario_autorizado() and (not sigiloso or criado_por = auth.uid() or is_admin()));
create policy notificacoes_sinan_insert on public.notificacoes_sinan for insert to authenticated
  with check (usuario_autorizado() and criado_por = auth.uid());
create policy notificacoes_sinan_update on public.notificacoes_sinan for update to authenticated
  using (usuario_autorizado() and (criado_por = auth.uid() or is_admin()))
  with check (usuario_autorizado());
create or replace function public.notificacoes_sinan_touch() returns trigger language plpgsql set search_path = public as $$
begin new.atualizado_em := now(); return new; end $$;
create trigger notificacoes_sinan_touch before update on public.notificacoes_sinan for each row execute function public.notificacoes_sinan_touch();
