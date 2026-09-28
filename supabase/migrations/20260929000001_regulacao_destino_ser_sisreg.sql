-- Destino da Atualização de Quadro Clínico: SER e/ou SISREG (independentes)
alter table public.regulacao_atualizacoes add column if not exists destino_ser boolean not null default false, add column if not exists destino_sisreg boolean not null default false, add column if not exists numero_solicitacao_sisreg text;
