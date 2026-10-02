import { useEffect, useState } from 'react'
import { buscarAutorRegistro } from '../../lib/pepMedico'
import CorpoRequisicaoExamesOficial from './CorpoRequisicaoExamesOficial'
import CorpoConsultaOficial from './CorpoConsultaOficial'
import CorpoPrescricaoOficial from './CorpoPrescricaoOficial'
import CorpoAihOficial from './CorpoAihOficial'
import CorpoApacOficial from './CorpoApacOficial'
import CorpoAtmOficial from './CorpoAtmOficial'
import CorpoTfdOficial from './CorpoTfdOficial'
import CorpoPlanoOficial from './CorpoPlanoOficial'
import CorpoRegulacaoOficial from './CorpoRegulacaoOficial'
import CorpoSangueOficial from './CorpoSangueOficial'
import CorpoSumarioAltaOficial from './CorpoSumarioAltaOficial'
import CorpoEvolucaoMedicaOficial from './CorpoEvolucaoMedicaOficial'
import CorpoNotaIntercorrenciaOficial from './CorpoNotaIntercorrenciaOficial'
import CorpoReceituarioOficial from './CorpoReceituarioOficial'
import CorpoAtestadoOficial from './CorpoAtestadoOficial'
import '../print/pacote.css'

// Documentos de texto com letra maior (formulários oficiais do SUS ficam no modelo oficial).
export const TIPOS_LEITURA = ['consulta', 'prescricao', 'plano', 'tfd', 'regulacao', 'alta', 'evolucao', 'intercorrencia', 'atestado']

// Corpo oficial de cada tipo de documento médico.
export function corpoDoTipo(tipo, p) {
  switch (tipo) {
    case 'aih': return <CorpoAihOficial {...p} />
    case 'apac': return <CorpoApacOficial {...p} />
    case 'consulta': return <CorpoConsultaOficial {...p} />
    case 'prescricao': return <CorpoPrescricaoOficial {...p} />
    case 'plano': return <CorpoPlanoOficial {...p} />
    case 'atm': return <CorpoAtmOficial {...p} />
    case 'tfd': return <CorpoTfdOficial {...p} />
    case 'regulacao': return <CorpoRegulacaoOficial {...p} />
    case 'sangue': return <CorpoSangueOficial {...p} />
    case 'alta': return <CorpoSumarioAltaOficial {...p} />
    case 'evolucao': return <CorpoEvolucaoMedicaOficial {...p} />
    case 'intercorrencia': return <CorpoNotaIntercorrenciaOficial {...p} />
    case 'receituario': return <CorpoReceituarioOficial {...p} />
    case 'atestado': return <CorpoAtestadoOficial {...p} />
    case 'exame_lab': return <CorpoRequisicaoExamesOficial modalidade="lab" {...p} />
    case 'exame_img': return <CorpoRequisicaoExamesOficial modalidade="img" {...p} />
    case 'exame_ecg': return <CorpoRequisicaoExamesOficial modalidade="ecg" {...p} />
    default: return null
  }
}

export const dataHoraDe = (r) => new Date(r.data_registro || r.criado_em || r.solicitado_em || r.atualizado_em).toLocaleString('pt-BR')

// Um documento dentro da impressão conjunta (cada um começa em folha nova, com a sua orientação).
export function DocumentoPacote({ tipo, registro, cabecalho }) {
  const [autor, setAutor] = useState(null)
  useEffect(() => { if (!registro?.enfermeiros) buscarAutorRegistro(registro).then(setAutor) }, [registro])
  const { pessoa, atendimento, idade, leitoNumero, setorNome } = cabecalho
  const p = { registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico: registro.enfermeiros || autor, dataHora: dataHoraDe(registro) }
  return <div className={'pacote-doc pacote-' + tipo + (TIPOS_LEITURA.includes(tipo) ? ' doc-leitura' : '')}>{corpoDoTipo(tipo, p)}</div>
}

