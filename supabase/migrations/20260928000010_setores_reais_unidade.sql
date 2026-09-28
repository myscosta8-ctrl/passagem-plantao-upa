-- Setores reais da UPA: Sala Vermelha, Internação, Pediatria, Observação (isolamento = último leito de cada setor).
-- Setores/leitos criados por seed são desativados (não apagados: preservam histórico).
update setores set ativo=false where id in (17,19,20,21,22);
update leitos set ativo=false where setor_id in (17,19,20,21,22) or (setor_id in (1,2,3,4) and tipo<>'fixo');
update setores set nome='Sala Vermelha', ordem=1 where id=1;
update setores set nome='Internação', ordem=2 where id=2;
update setores set nome='Pediatria', ordem=3 where id=3;
update setores set nome='Observação', ordem=4 where id=4;
