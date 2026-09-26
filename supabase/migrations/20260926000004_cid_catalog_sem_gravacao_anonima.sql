-- Catálogo CID-10 é só leitura para quem não está logado.
drop policy if exists "Gravacao permitida anon" on public.cid_catalog;
