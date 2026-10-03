import Campo from './CampoAih'
import { RACAS } from './aihRegras'

// Seção 2 — Identificação do paciente: 5-9, 11, 12 e 15 vêm do cadastro (Recepção); 10, 13, 14, 16-19 editáveis.
export default function SecaoPaciente({ dados, set, ident }) {
  return (
    <div className="aih-secao-box">
      <div className="aih-secao-legend">
        <span>2. IDENTIFICAÇÃO DO PACIENTE</span>
      </div>
      <div className="aih-grid" style={{ marginTop: 4 }}>
        <Campo n="5" rotulo="NOME DO PACIENTE" col={8} readOnly valor={ident.nome} />
        <Campo n="6" rotulo="Nº DO PRONTUÁRIO" col={4} readOnly valor={ident.prontuario} />
        <Campo n="7" rotulo="CARTÃO NACIONAL DE SAÚDE (CNS)" col={5} readOnly valor={ident.cns} />
        <Campo n="8" rotulo="DATA DE NASCIMENTO" col={3} readOnly valor={ident.nascimento} />
        <Campo n="9" rotulo="SEXO" col={2} readOnly valor={ident.sexo} />
        <Campo n="10" rotulo="RAÇA/COR" col={2}>
          <select className="aih-input" value={dados.raca_cor || ''} onChange={(e) => set('raca_cor', e.target.value)}>
            <option value="">—</option>
            {RACAS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Campo>
        <Campo n="10.1" rotulo="ETNIA (SE INDÍGENA)" col={3} valor={dados.etnia} onChange={(v) => set('etnia', v.toUpperCase())} />
        <Campo n="11" rotulo="NOME DA MÃE" col={6} readOnly valor={ident.mae} />
        <Campo n="12" rotulo="TELEFONE DE CONTATO" col={3} readOnly valor={ident.telefone} />
        <Campo n="13" rotulo="NOME DO RESPONSÁVEL" col={8} valor={dados.nome_responsavel} onChange={(v) => set('nome_responsavel', v.toUpperCase())} />
        <Campo n="14" rotulo="TELEFONE DO RESPONSÁVEL" col={4} valor={dados.telefone_responsavel} onChange={(v) => set('telefone_responsavel', v)} placeholder="(91) 9 0000-0000" />
        <Campo n="15" rotulo="ENDEREÇO (RUA, Nº, BAIRRO)" col={12} readOnly valor={ident.endereco} />
        <Campo n="16" rotulo="MUNICÍPIO DE RESIDÊNCIA" col={5} valor={dados.municipio_residencia_nome} onChange={(v) => set('municipio_residencia_nome', v.toUpperCase())} />
        <Campo n="17" rotulo="CÓD. IBGE MUNICÍPIO" col={3} valor={dados.municipio_residencia_ibge} onChange={(v) => set('municipio_residencia_ibge', v.replace(/\D/g, '').slice(0, 7))} />
        <Campo n="18" rotulo="UF" col={1} valor={dados.municipio_residencia_uf} onChange={(v) => set('municipio_residencia_uf', v.toUpperCase().slice(0, 2))} />
        <Campo n="19" rotulo="CEP" col={3} valor={dados.municipio_residencia_cep} onChange={(v) => set('municipio_residencia_cep', v)} />
        <div className="col-12 aih-dica"><i className="ph ph-info" /> Nome, CNS, nascimento, sexo, mãe, telefone e endereço vêm do cadastro do paciente — para corrigir, use Recepção → Completar dados.</div>
      </div>
    </div>
  )
}
