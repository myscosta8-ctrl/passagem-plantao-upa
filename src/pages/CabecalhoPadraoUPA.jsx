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
// (o rótulo nunca fica separado do dado: espaço inseparável entre eles).
function Campo({ rotulo, span = 1, largo, children }) {
  return <div className={'pr-campo' + (largo ? ' largo' : '')} style={span > 1 ? { gridColumn: `span ${span}` } : undefined}><b>{rotulo}</b>{'\u00a0'}{children}</div>
}

// Ordem dos campos (Protocolo de Identificação do Paciente): quem é, alertas, onde está,
// registros, contato e atendimento. [campo, colunas que ocupa].
const LAYOUT_PADRAO = [ // 4 colunas
  ['paciente', 3], ['idade', 1], ['mae', 2], ['nasc', 1], ['sexo', 1],
  ['alergia', 2], ['peso', 1], ['classificacao', 1],
  ['setor', 2], ['internacao', 1], ['alta', 1],
  ['prontuario', 1], ['rg', 1], ['cns', 1], ['cpf', 1],
  ['endereco', 3], ['telefone', 1],
  ['entrada', 1], ['carater', 1], ['convenio', 1], ['dtficha', 1], ['profissional', 4],
]
// Folha estreita (receituário: 2 vias lado a lado): mesma ordem em 3 colunas iguais, alinhadas.
const LAYOUT_COMPACTO = [
  ['paciente', 3], ['nasc', 1], ['idade', 1], ['sexo', 1], ['mae', 2], ['peso', 1],
  ['alergia', 2], ['classificacao', 1],
  ['setor', 1], ['internacao', 1], ['alta', 1],
  ['prontuario', 1], ['cns', 1], ['cpf', 1], ['rg', 1], ['telefone', 2],
  ['endereco', 3],
  ['entrada', 1], ['carater', 1], ['convenio', 1], ['profissional', 2], ['dtficha', 1],
]

function IdentificacaoGrade({ pessoa, atendimento, idade, leitoNumero, setorNome, prof, rotuloProf, docConselho, nascimento, dataHora, compacta }) {
  const sexo = pessoa.sexo === 'F' ? 'Feminino' : pessoa.sexo === 'M' ? 'Masculino' : ''
  const alergias = pessoa.alergias_ativas?.length ? pessoa.alergias_ativas.join(', ') : ''
  // Idade sai sozinha da data de nascimento; sem ela, a idade informada na admissão.
  const idadeTexto = idadeDetalhada(pessoa.data_nascimento, dataHora) || (idade ? `${idade} anos` : '')
  const classificacao = atendimento?.classificacao_risco_cor
    ? atendimento.classificacao_risco_cor.charAt(0).toUpperCase() + atendimento.classificacao_risco_cor.slice(1).toLowerCase() : ''
  const dataFicha = String(dataHora || '').replace(',', '').replace(/(\d{2}:\d{2}):\d{2}/, '$1')
  // rotulo, conteúdo e se é texto livre (pode quebrar linha)
  const campos = {
    paciente: ['PACIENTE:', <strong key="n">{pessoa.nome}</strong>, true],
    idade: ['IDADE:', idadeTexto],
    mae: ['MÃE:', pessoa.nome_mae || '', true],
    nasc: ['NASC.:', nascimento],
    sexo: ['SEXO:', sexo],
    alergia: ['ALERGIA:', <span key="a" className="dc-alerta-cab">{alergias}</span>, true],
    peso: ['PESO:', ''],
    classificacao: ['CLASSIFICAÇÃO:', classificacao],
    setor: ['SETOR:', <>{setorNome || ''}<span className="pr-campo-junto"><b>LEITO:</b>{'\u00a0'}{leitoNumero || ''}</span></>, true],
    internacao: ['INTERNAÇÃO:', dataHoraCurta(atendimento?.criado_em)],
    alta: ['ALTA:', dataHoraCurta(atendimento?.encerrado_em)],
    prontuario: ['PRONTUÁRIO:', <>{limparPrefixo(pessoa.prontuario_numero)}<span className="pr-campo-junto"><b>REGISTRO:</b>{'\u00a0'}{limparPrefixo(atendimento?.numero_atendimento)}</span></>, true],
    rg: ['R.G.:', pessoa.rg || ''],
    cns: ['C.N.S.:', pessoa.cns || ''],
    cpf: ['C.P.F.:', pessoa.cpf || ''],
    endereco: ['ENDEREÇO:', [pessoa.endereco, pessoa.endereco_numero, pessoa.bairro, pessoa.cidade].filter(Boolean).join(', '), true],
    telefone: ['TELEFONE:', pessoa.telefone || ''],
    entrada: ['ENTRADA:', atendimento?.tipo_entrada || '', true],
    carater: ['CARÁTER:', atendimento?.carater || 'Urgência'],
    convenio: ['CONVÊNIO:', atendimento?.convenio || 'SUS'],
    dtficha: ['DT FICHA:', dataFicha],
    profissional: [rotuloProf.replace('RESPONSÁVEL:', 'RESP.:'), <>{prof?.nome_exibicao || prof?.nome || ''}{docConselho ? <>&nbsp; <b>{docConselho}</b></> : ''}</>, true],
  }
  return (
    <div className={'pr-info pr-info-grade' + (compacta ? ' compacta' : '')}>
      {(compacta ? LAYOUT_COMPACTO : LAYOUT_PADRAO).map(([k, span]) => {
        const [rotulo, conteudo, largo] = campos[k]
        return <Campo key={k} rotulo={rotulo} span={span} largo={largo || compacta}>{conteudo}</Campo>
      })}
    </div>
  )
}

// Timbre + título + identificação padrão: a mesma em todos os impressos (estilo em
// ./print/identificacao-padrao.css). compacta: folha estreita (receituário em 2 vias), mesmos
// campos e mesma ordem em 3 colunas iguais.
export default function CabecalhoPadraoUPA({ titulo, pessoa = {}, atendimento = {}, idade, leitoNumero, setorNome, medico, profissional, profissionalRotulo, dataHora, compacta }) {
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

      <IdentificacaoGrade pessoa={pessoa} atendimento={atendimento} idade={idade} leitoNumero={leitoNumero} setorNome={setorNome} prof={prof} rotuloProf={rotuloProf} docConselho={docConselho} nascimento={nascimento} dataHora={dataHora} compacta={compacta} />
    </>
  )
}
