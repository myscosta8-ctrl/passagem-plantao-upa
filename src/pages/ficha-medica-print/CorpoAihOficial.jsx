import { numeroLimpo } from '../../lib/numeros'
import '../print/print-aih.css'

const VINCULO_PREVIDENCIA_OPCOES = [
  { valor: 'empregado', rotulo: 'Empregado' },
  { valor: 'empregador', rotulo: 'Empregador' },
  { valor: 'autonomo', rotulo: 'Autônomo' },
  { valor: 'desempregado', rotulo: 'Desempregado' },
  { valor: 'aposentado', rotulo: 'Aposentado' },
  { valor: 'nao_segurado', rotulo: 'Não segurado' },
]

// Laudos antigos guardavam o rótulo ("Não Segurado", "Autônomo"...) em vez do código.
const normalizarVinculo = (v) => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\(.*\)/, '').trim().replace(/\s+/g, '_')
// Data da solicitação = dia em que o médico assinou (AIH pré-preenchida pela enfermagem pode ter sido criada antes).
const dataSolicitacao = (r) => { const d = r.finalizado_em || r.data_registro || r.criado_em; if (!d) return ''; const x = new Date(d); return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 10) }
const dataBR = (iso) => { if (!iso) return ''; const [a, m, d] = String(iso).slice(0, 10).split('-'); return d && m && a ? `${d}/${m}/${a}` : '' }
const soDigitos = (v) => String(v || '').replace(/\D/g, '')

// Quadro de um campo do formulário: borda fina com o rótulo numerado sobre a borda.
function F({ cap, w = 1, cls = '', children }) {
  return (
    <div className={'aih-f ' + cls} style={{ flexGrow: w }}>
      <span className="aih-cap"><span>{cap}</span></span>
      {children}
    </div>
  )
}
const V = ({ v, cls = '' }) => <div className={'aih-v ' + cls}>{v || ' '}</div>
// Pente de dígitos (CNES, CNS, CEP, código do procedimento, documentos).
function Comb({ v, n }) {
  const d = soDigitos(v)
  return <div className="aih-comb">{Array.from({ length: n }, (_, i) => <span key={i}>{d[i] || ''}</span>)}</div>
}
const Par = ({ x }) => <span className="aih-par">(<b>{x ? 'X' : ''}</b>)</span>
function Telefone({ d }) {
  return (
    <div className="aih-tel">
      <div className="ddd"><span className="aih-sub">DDD</span><Comb v={d.slice(0, 2)} n={2} /></div>
      <div className="num"><span className="aih-sub">Nº do telefone</span><Comb v={d.slice(2)} n={9} /></div>
    </div>
  )
}

// Réplica do formulário oficial do SUS "Laudo para Solicitação de Autorização
// de Internação Hospitalar", com os mesmos quadros, a mesma divisão e o mesmo
// dimensionamento do modelo, ocupando a folha A4 inteira.
export default function CorpoAihOficial({ registro, pessoa, atendimento: _atendimento, idade: _idade, leitoNumero, setorNome, medico, dataHora }) {
  const cf = registro.campos_formulario || {}
  // Identificação: o que foi escrito no laudo (campos editáveis) vale; senão, o cadastro.
  const enderecoCompleto = cf.paciente_endereco || [pessoa.endereco, pessoa.endereco_numero, pessoa.bairro].filter(Boolean).join(', ')
  const cidPrincipal = registro.cid_catalog?.codigo || registro.cid_principal || cf.cid_principal_texto || ''
  const tel = soDigitos(cf.paciente_telefone || pessoa.telefone || pessoa.telefone_contato)
  const sexoAih = cf.paciente_sexo || (String(pessoa.sexo || '').toUpperCase().startsWith('F') ? 'F' : pessoa.sexo ? 'M' : '')
  const telResp = soDigitos(cf.telefone_responsavel)
  const vinculo = normalizarVinculo(cf.vinculo_previdencia)

  return (
    <div className="aih">
      <div className="aih-topo">
        <div className="aih-topo-texto">
          <div className="nome">UPA 24H BREVES</div>
          <div>Prefeitura Municipal de Breves — Secretaria Municipal de Saúde (SEMSA)</div>
          <div>Travessa Castilhos França, S/N - Breves/PA - CEP 68.800-000</div>
          <div>CNPJ: 02.967.963/0001-11 - Tel: (91) 3783-1279</div>
        </div>
        <div className="aih-topo-logos">
          <img src="./logos/brasao-breves.jpg" alt="Prefeitura de Breves" />
          <img src="./logos/semsa.jpg" alt="SEMSA" />
          <img src="./logos/upa24h.jpg" alt="UPA 24h" />
        </div>
      </div>

      <div className="aih-moldura">
        <div className="aih-cab">
          <div className="aih-sus">
            <span className="aih-sus-marca">SUS</span>
            <span className="aih-sus-col">Sistema<br />Único de<br />Saúde</span>
            <span className="aih-sus-col">Ministério<br />da<br />Saúde</span>
          </div>
          <div className="aih-titulo">LAUDO PARA SOLICITAÇÃO DE AUTORIZAÇÃO<br />DE INTERNAÇÃO HOSPITALAR</div>
        </div>

        <div className="aih-sec">
          <div className="aih-sec-tit">Identificação do Estabelecimento de Saúde</div>
          <div className="aih-linha">
            <F cap="1 - Nome do estabelecimento solicitante" w={4}><V v={cf.estabelecimento_solicitante_nome} /></F>
            <F cap="2 - CNES" w={1}><Comb v={cf.estabelecimento_solicitante_cnes} n={7} /></F>
          </div>
          <div className="aih-linha">
            <F cap="3 - Nome do estabelecimento executante" w={4}><V v={cf.estabelecimento_executante_nome} /></F>
            <F cap="4 - CNES" w={1}><Comb v={cf.estabelecimento_executante_cnes} n={7} /></F>
          </div>
        </div>

        <div className="aih-sec">
          <div className="aih-sec-tit">Identificação do Paciente</div>
          <div className="aih-linha">
            <F cap="5 - Nome do paciente" w={4}><V v={cf.paciente_nome || pessoa.nome} /></F>
            <F cap="6 - Nº do prontuário" w={1}><V v={cf.paciente_prontuario || numeroLimpo(pessoa.prontuario_numero)} cls="dir" /></F>
          </div>
          <div className="aih-linha">
            <F cap="7 - Cartão Nacional de Saúde (CNS)" w={3.2}><Comb v={cf.paciente_cns || pessoa.cns} n={15} /></F>
            <F cap="8 - Data de nascimento" w={1.3}><V v={cf.paciente_nascimento || dataBR(pessoa.data_nascimento)} cls="centro" /></F>
            <F cap="9 - Sexo" w={1.45}>
              <div className="aih-opcoes">Masc. <span className="aih-quad">{sexoAih === 'M' ? 'X' : ''}</span>1 &nbsp;Fem. <span className="aih-quad">{sexoAih === 'F' ? 'X' : ''}</span>3</div>
            </F>
            <F cap="10 - Raça/Cor" w={1.1}><V v={cf.raca_cor || pessoa.raca_cor} cls="centro" /></F>
            <F cap="10.1 - Etnia" w={0.9}><V v={cf.etnia} cls="centro" /></F>
          </div>
          <div className="aih-linha">
            <F cap="11 - Nome da mãe" w={3}><V v={cf.paciente_mae || pessoa.nome_mae} /></F>
            <F cap="12 - Telefone de contato" w={1.7}><Telefone d={tel} /></F>
          </div>
          <div className="aih-linha">
            <F cap="13 - Nome do responsável" w={3}><V v={cf.nome_responsavel} /></F>
            <F cap="14 - Telefone de contato" w={1.7}><Telefone d={telResp} /></F>
          </div>
          <div className="aih-linha">
            <F cap="15 - Endereço (rua, nº, bairro)"><V v={enderecoCompleto} /></F>
          </div>
          <div className="aih-linha">
            <F cap="16 - Município de residência" w={3.2}><V v={cf.municipio_residencia_nome || pessoa.cidade} /></F>
            <F cap="17 - Cód. IBGE município" w={1.1}><V v={cf.municipio_residencia_ibge || pessoa.municipio_ibge} cls="centro" /></F>
            <F cap="18 - UF" w={0.5}><V v={cf.municipio_residencia_uf || pessoa.uf} cls="centro" /></F>
            <F cap="19 - CEP" w={1.5}><Comb v={cf.municipio_residencia_cep || pessoa.cep} n={8} /></F>
          </div>
        </div>

        <div className="aih-sec cresce">
          <div className="aih-sec-tit centro">Justificativa da Internação</div>
          <F cap="20 - Principais sinais e sintomas clínicos" cls="aih-texto aih-f20"><V v={cf.sinais_sintomas_clinicos} /></F>
          <F cap="21 - Condições que justificam a internação" cls="aih-texto aih-f21"><V v={cf.condicoes_justificam_internacao} /></F>
          <F cap="22 - Principais resultados de provas diagnósticas (resultados de exames realizados)" cls="aih-texto aih-f22"><V v={cf.resultados_provas_diagnosticas} /></F>
          <div className="aih-linha">
            <F cap="23 - Diagnóstico inicial" w={3.3}><V v={cf.diagnostico_inicial_texto || registro.cid_catalog?.descricao} /></F>
            <F cap="24 - CID 10 principal" w={1.3}><V v={cidPrincipal} cls="centro" /></F>
            <F cap="25 - CID 10 secundário" w={1.3}><V v={registro.cid_secundario || cf.cid_secundario || cf.cid_secundario_texto} cls="centro" /></F>
            <F cap="26 - CID 10 causas associadas" w={1.6}><V v={cf.cid_causas_associadas} cls="centro" /></F>
          </div>
        </div>

        <div className="aih-sec">
          <div className="aih-sec-tit centro">Procedimento Solicitado</div>
          <div className="aih-linha">
            <F cap="27 - Descrição do procedimento solicitado" w={3.4}><V v={registro.procedimento_principal_nome} /></F>
            <F cap="28 - Código do procedimento" w={1.6}><Comb v={registro.procedimento_principal_codigo} n={10} /></F>
          </div>
          <div className="aih-linha">
            <F cap="29 - Clínica" w={1.3}><V v={cf.clinica || (leitoNumero ? `Leito ${leitoNumero} — ${setorNome}` : '')} /></F>
            <F cap="30 - Caráter da internação" w={1.3}><V v={/ELETIV/i.test(cf.carater_internacao || '') ? 'Eletiva' : 'Urgência'} /></F>
            <F cap="31 - Documento" w={1}>
              <div className="aih-opcoes"><span><Par x={cf.profissional_documento_tipo === 'CNS'} /> CNS</span><span><Par x={cf.profissional_documento_tipo === 'CPF'} /> CPF</span></div>
            </F>
            <F cap="32 - Nº documento (CNS/CPF) do profissional solicitante/assistente" w={3.2}><Comb v={cf.profissional_documento_numero} n={15} /></F>
          </div>
          <div className="aih-linha">
            <F cap="33 - Nome do profissional solicitante/assistente" w={2.6}><V v={cf.profissional_nome_aih || medico?.nome_exibicao || medico?.nome} /></F>
            <F cap="34 - Data da solicitação" w={1.1}><V v={cf.data_solicitacao_aih || dataBR(dataSolicitacao(registro))} cls="centro" /></F>
            <F cap="35 - Assinatura e carimbo (nº do registro do conselho)" w={1.9}><V v={medico?.crm ? `CRM: ${medico.crm}` : ''} /></F>
          </div>
        </div>

        <div className="aih-sec">
          <div className="aih-sec-tit centro">Preencher em caso de causas externas (acidentes ou violências)</div>
          <div className="aih-linha">
            <div className="aih-causas">
              <div>36 - <Par x={cf.causa_externa_transito} /> Acidente de trânsito</div>
              <div>37 - <Par x={cf.causa_externa_trabalho_tipico} /> Acidente trabalho típico</div>
              <div>38 - <Par x={cf.causa_externa_trabalho_trajeto} /> Acidente trabalho trajeto</div>
            </div>
            <div className="aih-col" style={{ flex: 1 }}>
              <div className="aih-linha">
                <F cap="39 - CNPJ da seguradora" w={3}><Comb v={cf.cnpj_seguradora} n={14} /></F>
                <F cap="40 - Nº do bilhete" w={1.2}><V v={cf.numero_bilhete} /></F>
                <F cap="41 - Série" w={0.7}><V v={cf.serie_bilhete} /></F>
              </div>
              <div className="aih-linha">
                <F cap="42 - CNPJ empresa" w={3}><Comb v={cf.cnpj_empresa} n={14} /></F>
                <F cap="43 - CNAE da empresa" w={1.2}><V v={cf.cnae_empresa} /></F>
                <F cap="44 - CBOR" w={0.7}><V v={cf.cbor} /></F>
              </div>
            </div>
          </div>
          <div className="aih-linha">
            <F cap="45 - Vínculo com a previdência">
              <div className="aih-opcoes espalha">
                {VINCULO_PREVIDENCIA_OPCOES.map((op) => <span key={op.valor}><Par x={vinculo === op.valor} /> {op.rotulo}</span>)}
              </div>
            </F>
          </div>
        </div>

        <div className="aih-sec">
          <div className="aih-sec-tit centro">Autorização</div>
          <div className="aih-linha">
            <div className="aih-col" style={{ flex: 3.4 }}>
              <div className="aih-linha">
                <F cap="46 - Nome do profissional autorizador" w={3}><V v={cf.autorizador_nome} /></F>
                <F cap="47 - Cód. órgão emissor" w={1.3}><V v={cf.autorizador_codigo_orgao_emissor} /></F>
              </div>
              <div className="aih-linha">
                <F cap="48 - Documento" w={1}>
                  <div className="aih-opcoes"><span><Par x={cf.autorizador_documento_tipo === 'CNS'} /> CNS</span><span><Par x={cf.autorizador_documento_tipo === 'CPF'} /> CPF</span></div>
                </F>
                <F cap="49 - Nº documento (CNS/CPF) do profissional autorizador" w={3.3}><Comb v={cf.autorizador_documento_numero} n={15} /></F>
              </div>
              <div className="aih-linha">
                <F cap="50 - Data da autorização" w={1} cls="aih-f50"><V v={dataBR(cf.data_autorizacao) || '   /   /'} cls="centro" /></F>
                <F cap="51 - Assinatura e carimbo (nº do registro do conselho)" w={3.3} cls="aih-f51"><V v="" /></F>
              </div>
            </div>
            <F cap="52 - Nº da autorização de internação hospitalar" cls="aih-f52"><V v={cf.numero_autorizacao} cls="centro" /></F>
          </div>
        </div>
      </div>

      <div className="aih-rodape">
        <span style={{ gridColumn: 2 }}>Esta conta é paga com recursos públicos do SUS</span>
        <span className="aih-meta">Registrado em {dataHora} · Impresso em {new Date().toLocaleString('pt-BR')}</span>
      </div>
    </div>
  )
}
