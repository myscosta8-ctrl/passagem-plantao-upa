-- 28/09/2026. Aplicadas via MCP:
-- * sincronizar_legado_pep(): espelha no PEP os internados reais da tabela usada em produção (pacientes);
--   encerra no PEP quem não está na unidade, cria/realoca os que estão. Nunca altera pacientes.
--   Rodar de novo imediatamente antes de publicar: select public.sincronizar_legado_pep();
-- * Renumeração: pacientes na unidade recebem prontuário/registro 1..N (ordem de admissão);
--   números anteriores arquivados como ANT-<n>; paciente arquivado que retorna recebe número novo (trg_renumerar_prontuario).
-- * Reversão: as 31 altas administrativas aplicadas por engano na tabela antiga (em uso na produção) foram desfeitas.
-- * Documentos fictícios do ADMIN.MARCUS (prescrição, APAC, histórico de enfermagem) e exame de teste excluídos.
select 1;
