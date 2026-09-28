-- Registro da absorção (executada em 28/09/2026): tabela antiga `pacientes` -> PEP.
-- 1) 84 atendimentos 'internado' sem leito ativo encerrados (auditoria: encerramento_administrativo).
-- 2) 10 cópias duplicadas de JOICIANE SILVA TEIXEIRA removidas de `pacientes` (sem passagens vinculadas).
-- 3) 14 pacientes não migrados levados ao PEP (pessoa + atendimento + internação; ocupação de leito
--    quando internado e o leito estava livre). Pessoa já existente com mesmo nome/nascimento: mesclada.
-- 4) 6 internados da tabela antiga cujo leito está ocupado por outro paciente no PEP ficaram pendentes
--    de decisão (não migrados automaticamente).
select 1;
