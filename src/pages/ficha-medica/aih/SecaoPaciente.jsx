import Campo from './CampoAih'
import { RACAS } from './aihRegras'

// Seção 2 — Identificação do paciente: todos os campos editáveis. Começam com o cadastro
// (Recepção); o que o médico escrever vale para este laudo e, ao salvar, completa o que estava
// vazio no cadastro do paciente (o que a recepção já registrou não é trocado).
const mascaraData = (v) => v.replace(/\D/g, '').slice(0, 8).replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2}\/\d{2})(\d)/, '$1/$2')

export default function SecaoPaciente({ dados, set }) {
  return (
    <div className="aih-secao-box">
      <div className="aih-secao-legend">
        <span>2. IDENTIFICAÇÃO DO PACIENTE</span>
      </div>
      <div className="aih-grid" style={{ marginTop: 4 }}>
        <Campo n="5" rotulo="NOME DO PACIENTE" col={8} valor={dados.paciente_nome} onChange={(v) => set('paciente_nome', v.toUpperCase())} />
        <Campo n="6" rotulo="Nº DO PRONTUÁRIO" col={4} valor={dados.paciente_prontuario} onChange={(v) => set('paciente_prontuario', v)} />
        <Campo n="7" rotulo="CARTÃO NACIONAL DE SAÚDE (CNS)" col={5} valor={dados.paciente_cns} onChange={(v) => set('paciente_cns', v.replace(/\D/g, '').slice(0, 15))} placeholder="15 dígitos" />
        <Campo n="8" rotulo="DATA DE NASCIMENTO" col={3} valor={dados.paciente_nascimento} onChange={(v) => set('paciente_nascimento', mascaraData(v))} placeholder="dd/mm/aaaa" />
        <Campo n="9" rotulo="SEXO" col={2}>
          <select className="aih-input" value={dados.paciente_sexo || ''} onChange={(e) => set('paciente_sexo', e.target.value)}>
            <option value="">—</option>
            <option value="M">MASCULINO</option>
            <option value="F">FEMININO</option>
          </select>
        </Campo>
        <Campo n="10" rotulo="RAÇA/COR" col={2}>
          <select className="aih-input" value={dados.raca_cor || ''} onChange={(e) => set('raca_cor', e.target.value)}>
            <option value="">—</option>
            {RACAS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Campo>
        <Campo n="10.1" rotulo="ETNIA (SE INDÍGENA)" col={3} valor={dados.etnia} onChange={(v) => set('etnia', v.toUpperCase())} />
        <Campo n="11" rotulo="NOME DA MÃE" col={6} valor={dados.paciente_mae} onChange={(v) => set('paciente_mae', v.toUpperCase())} />
        <Campo n="12" rotulo="TELEFONE DE CONTATO" col={3} valor={dados.paciente_telefone} onChange={(v) => set('paciente_telefone', v)} placeholder="(91) 9 0000-0000" />
        <Campo n="13" rotulo="NOME DO RESPONSÁVEL" col={8} valor={dados.nome_responsavel} onChange={(v) => set('nome_responsavel', v.toUpperCase())} />
        <Campo n="14" rotulo="TELEFONE DO RESPONSÁVEL" col={4} valor={dados.telefone_responsavel} onChange={(v) => set('telefone_responsavel', v)} placeholder="(91) 9 0000-0000" />
        <Campo n="15" rotulo="ENDEREÇO (RUA, Nº, BAIRRO)" col={12} valor={dados.paciente_endereco} onChange={(v) => set('paciente_endereco', v.toUpperCase())} />
        <Campo n="16" rotulo="MUNICÍPIO DE RESIDÊNCIA" col={5} valor={dados.municipio_residencia_nome} onChange={(v) => set('municipio_residencia_nome', v.toUpperCase())} />
        <Campo n="17" rotulo="CÓD. IBGE MUNICÍPIO" col={3} valor={dados.municipio_residencia_ibge} onChange={(v) => set('municipio_residencia_ibge', v.replace(/\D/g, '').slice(0, 7))} />
        <Campo n="18" rotulo="UF" col={1} valor={dados.municipio_residencia_uf} onChange={(v) => set('municipio_residencia_uf', v.toUpperCase().slice(0, 2))} />
        <Campo n="19" rotulo="CEP" col={3} valor={dados.municipio_residencia_cep} onChange={(v) => set('municipio_residencia_cep', v)} />
        <div className="col-12 aih-dica"><i className="ph ph-info" /> Os campos vêm do cadastro do paciente e podem ser completados aqui. Ao salvar, o que estava em branco no cadastro é preenchido com o que foi escrito na AIH; o que a Recepção já registrou não é trocado.</div>
      </div>
    </div>
  )
}
