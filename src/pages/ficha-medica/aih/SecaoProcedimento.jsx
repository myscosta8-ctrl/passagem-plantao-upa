import Campo from './CampoAih'
import { CLINICAS_AIH } from '../constantes'

// Seção 4 — Procedimento solicitado, clínica, caráter e profissional solicitante (campos 27 a 34).
export default function SecaoProcedimento({ dados, set, nomeProfissional, dataSolicitacao }) {
  return (
    <div className="aih-secao-box">
      <div className="aih-secao-legend">
        <span>4. PROCEDIMENTO SOLICITADO</span>
      </div>
      <div className="aih-grid" style={{ marginTop: 4 }}>
        <Campo n="27" rotulo="DESCRIÇÃO DO PROCEDIMENTO SOLICITADO" col={8} destaque valor={dados.procedimento_principal_nome} onChange={(v) => set('procedimento_principal_nome', v.toUpperCase())} />
        <Campo n="28" rotulo="CÓDIGO DO PROCEDIMENTO (SIGTAP) — OPCIONAL" col={4} valor={dados.procedimento_principal_codigo} onChange={(v) => set('procedimento_principal_codigo', v.replace(/\D/g, '').slice(0, 10))} placeholder="10 dígitos" />
        <Campo n="29" rotulo="CLÍNICA" col={4}>
          <select className="aih-input" value={dados.clinica || ''} onChange={(e) => set('clinica', e.target.value)}>
            <option value="">— Selecione a clínica —</option>
            {CLINICAS_AIH.map((c) => <option key={c} value={c}>{c}</option>)}
            {dados.clinica && !CLINICAS_AIH.includes(dados.clinica) && <option value={dados.clinica}>{dados.clinica}</option>}
          </select>
        </Campo>
        <Campo n="30" rotulo="CARÁTER DA INTERNAÇÃO" col={3}>
          <select className="aih-input" value={dados.carater_internacao === 'ELETIVA' ? 'ELETIVA' : 'URGENCIA'} onChange={(e) => set('carater_internacao', e.target.value)}>
            <option value="URGENCIA">URGÊNCIA</option>
            <option value="ELETIVA">ELETIVA</option>
          </select>
        </Campo>
        <Campo n="31" rotulo="DOCUMENTO" col={2}>
          <select className="aih-input" value={dados.profissional_documento_tipo || 'CNS'} onChange={(e) => set('profissional_documento_tipo', e.target.value)}>
            <option value="CNS">CNS</option>
            <option value="CPF">CPF</option>
          </select>
        </Campo>
        <Campo n="32" rotulo={`Nº DO ${dados.profissional_documento_tipo || 'CNS'} DO PROFISSIONAL SOLICITANTE`} col={3} valor={dados.profissional_documento_numero} onChange={(v) => set('profissional_documento_numero', v.replace(/[^\d.-]/g, ''))} placeholder="do médico que assina" />
        {/* 33 e 34: em branco usam o médico que assina e a data da assinatura; escrever aqui substitui no laudo. */}
        <Campo n="33" rotulo="NOME DO PROFISSIONAL SOLICITANTE" col={8} valor={dados.profissional_nome_aih} onChange={(v) => set('profissional_nome_aih', v.toUpperCase())} placeholder={nomeProfissional} />
        <Campo n="34" rotulo="DATA DA SOLICITAÇÃO" col={4} valor={dados.data_solicitacao_aih} onChange={(v) => set('data_solicitacao_aih', v.replace(/\D/g, '').slice(0, 8).replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2}\/\d{2})(\d)/, '$1/$2'))} placeholder={dataSolicitacao} />
      </div>
    </div>
  )
}
