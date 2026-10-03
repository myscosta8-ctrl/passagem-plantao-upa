// Cabeçalho padrão de todos os documentos da UPA (mesmo timbre + mesma
// identificação do paciente) — reaproveitado em qualquer
// documento novo (Prontuário Médico e Prontuário de Enfermagem). Exceções
// que mantêm cabeçalho próprio: APAC, Solicitação de Sangue (hemoterápico),
// SINAN e AIH.

import { idadeDetalhada } from '../lib/idadeDetalhada.js'
import './print/identificacao-padrao.css'

// Prontuário/Registro vêm às vezes com prefixo interno ("PEP-", "AT-") que
// não deve aparecer no papel impresso — só o número.
function limparPrefixo(valor) {
  return valor ? String(valor).replace(/^#?\s*(PEP|AT|REG)-?/i, '') : ''
}

// Data e hora sem segundos: 01/10/2026 07:00.
const dataHoraCurta = (v) => (v ? new Date(v).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).replace(',', '') : '')

// Identificação do paciente sem quadros, organizada pelo Protocolo de Identificação do Paciente
// (Meta 1 de segurança): no topo, os identificadores que a equipe confere antes de medicar ou
// coletar (nome completo, nascimento, nome da mãe) e, colados neles, os alertas (alergia e
// classificação de risco); depois onde o paciente está, os registros, o contato e o atendimento.
// 4 colunas alinhadas entre as linhas; a 1ª fica com o espaço que sobra e as outras têm a
// largura do maior dado que contêm.
// Campos sem fonte no cadastro (raça, nacionalidade fixa) e a unidade (já no timbre) saíram.
// span = quantas das 4 colunas o campo ocupa; largo = texto livre que pode quebrar linha
// (o rótulo nunca fica separado do dado: espaço inseparável entre eles). data-linha marca os
// campos longos, que ocupam a linha toda nas folhas estreitas (receituário em 2 vias).
function Campo({ rotulo, span = 1, largo, children }) {
  return <div className={'pr-campo' + (largo ? ' largo' : '')} style={span > 1 ? { gridColumn: `span ${span}` } : undefined} data-linha={span > 1 ? '' : undefined}><b>{rotulo}</b>{'\u00a0'}{children}</div>
}

function IdentificacaoGrade({ pessoa, atendimento, idade, leitoNumero, setorNome, prof, rotuloProf, docConselho, nascimento, dataHora }) {
  const sexo = pessoa.sexo === 'F' ? 'Feminino' : pessoa.sexo === 'M' ? 'Masculino' : ''
  const alergias = pessoa.alergias_ativas?.length ? pessoa.alergias_ativas.join(', ') : ''
  // Idade sai sozinha da data de nascimento; sem ela, a idade informada na admissão.
  const idadeTexto = idadeDetalhada(pessoa.data_nascimento, dataHora) || (idade ? `${idade} anos` : '')
  const classificacao = atendimento?.classificacao_risco_cor
    ? atendimento.classificacao_risco_cor.charAt(0).toUpperCase() + atendimento.classificacao_risco_cor.slice(1).toLowerCase() : ''
  const dataFicha = String(dataHora || '').replace(',', '').replace(/(\d{2}:\d{2}):\d{2}/, '$1')
  return (
    <div className="pr-info pr-info-grade">
      {/* 1. Quem é: identificadores conferidos antes de medicar ou coletar */}
      <Campo rotulo="PACIENTE:" span={3} largo><strong>{pessoa.nome}</strong></Campo>
      <Campo rotulo="IDADE:">{idadeTexto}</Campo>
      <Campo rotulo="MÃE:" span={2} largo>{pessoa.nome_mae || ''}</Campo>
      <Campo rotulo="NASC.:">{nascimento}</Campo>
      <Campo rotulo="SEXO:">{sexo}</Campo>

      {/* 2. Alertas, colados na identificação (peso: base das doses) */}
      <Campo rotulo="ALERGIA:" span={2} largo><span className="dc-alerta-cab">{alergias}</span></Campo>
      <Campo rotulo="PESO:">{''}</Campo>
      <Campo rotulo="CLASSIFICAÇÃO:">{classificacao}</Campo>

      {/* 3. Onde está */}
      <Campo rotulo="SETOR:" span={2} largo>{setorNome || ''}<span className="pr-campo-junto"><b>LEITO:</b>{'\u00a0'}{leitoNumero || ''}</span></Campo>
      <Campo rotulo="INTERNAÇÃO:">{dataHoraCurta(atendimento?.criado_em)}</Campo>
      <Campo rotulo="ALTA:">{dataHoraCurta(atendimento?.encerrado_em)}</Campo>

      {/* 4. Registros */}
      <Campo rotulo="PRONTUÁRIO:" largo>{limparPrefixo(pessoa.prontuario_numero)}<span className="pr-campo-junto"><b>REGISTRO:</b>{'\u00a0'}{limparPrefixo(atendimento?.numero_atendimento)}</span></Campo>
      <Campo rotulo="R.G.:">{pessoa.rg || ''}</Campo>
      <Campo rotulo="C.N.S.:">{pessoa.cns || ''}</Campo>
      <Campo rotulo="C.P.F.:">{pessoa.cpf || ''}</Campo>

      {/* 5. Contato */}
      <Campo rotulo="ENDEREÇO:" span={3} largo>{[pessoa.endereco, pessoa.endereco_numero, pessoa.bairro, pessoa.cidade].filter(Boolean).join(', ')}</Campo>
      <Campo rotulo="TELEFONE:">{pessoa.telefone || ''}</Campo>

      {/* 6. Atendimento */}
      <Campo rotulo="ENTRADA:" largo>{atendimento?.tipo_entrada || ''}</Campo>
      <Campo rotulo="CARÁTER:">{atendimento?.carater || 'Urgência'}</Campo>
      <Campo rotulo="CONVÊNIO:">{atendimento?.convenio || 'SUS'}</Campo>
      <Campo rotulo="DT FICHA:">{dataFicha}</Campo>
      <Campo rotulo={rotuloProf.replace('RESPONSÁVEL:', 'RESP.:')} span={4} largo>{prof?.nome_exibicao || prof?.nome || ''}{docConselho ? <>&nbsp; <b>{docConselho}</b></> : ''}</Campo>
    </div>
  )
}

// Timbre + título + identificação padrão: a mesma em todos os impressos (estilo em
// ./print/identificacao-padrao.css).
export default function CabecalhoPadraoUPA({ titulo, pessoa = {}, atendimento = {}, idade, leitoNumero, setorNome, medico, profissional, profissionalRotulo, dataHora }) {
  const nascimento = pessoa.data_nascimento ? new Date(pessoa.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : ''
  const prof = profissional || medico
  const rotuloProf = profissionalRotulo || (medico ? 'MÉDICO RESPONSÁVEL:' : 'PROFISSIONAL RESPONSÁVEL:')
  const docConselho = prof?.crm ? `CRM: ${prof.crm}` : (prof?.coren ? `COREN: ${prof.coren}` : '')

  return (
    <>
      <div className="pr-topo">
        <div className="pr-topo-texto">
          <div className="nome">PREFEITURA MUNICIPAL DE BREVES — UPA 24H BREVES</div>
          <div className="sub">SECRETARIA MUNICIPAL DE SAÚDE (SEMSA)</div>
          <div className="sub">TRAVESSA CASTILHOS FRANÇA, S/N — BREVES/PA — CEP 68.800-000 — CNPJ: 02.967.963/0001-11 — FONE/FAX: (91) 3783-1279</div>
        </div>
        <div className="pr-topo-logos">
          <img src="./logos/brasao-breves.jpg" alt="Prefeitura de Breves" />
          <img src="./logos/semsa.jpg" alt="SEMSA" />
          <img src="./logos/upa24h.jpg" alt="UPA 24h" />
        </div>
      </div>
      <hr className="pr-topo-hr" />

      <div className="pr-titulo">{titulo}</div>

      <IdentificacaoGrade pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} prof={prof} rotuloProf={rotuloProf} docConselho={docConselho} nascimento={nascimento} dataHora={dataHora} />
    </>
  )
}
