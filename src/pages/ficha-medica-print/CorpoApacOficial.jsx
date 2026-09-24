import { CampoComb, CampoSus, Digitos, limparPrefixo } from './helpersSus'

export default function CorpoApacOficial({ registro, pessoa, atendimento, idade, leitoNumero: _leitoNumero, setorNome: _setorNome, medico, dataHora }) {
  const cf = registro.campos_formulario || {}
  const enderecoCompleto = [pessoa.endereco, pessoa.endereco_numero, pessoa.bairro].filter(Boolean).join(', ')
  const cidPrincipal = registro.cid_principal || cf.cid_principal || ''
  const cidSecundario = registro.cid_secundario || cf.cid_secundario || ''
  const procNome = registro.procedimento_nome || cf.procedimento_nome || 'ULTRASSONOGRAFIA DE ABDOME TOTAL'
  const procCod = registro.procedimento_codigo || cf.procedimento_codigo || '02.05.02.004-6'
  const qtd = registro.quantidade || cf.quantidade || 1
  const diag = cf.descricao_diagnostico || registro.descricao_diagnostico || 'INSUFICIÊNCIA RENAL AGUDA E DOR ABDOMINAL AGUDA A ESCLARECER'
  const just = registro.justificativa || cf.justificativa || ''
  const medNome = medico?.nome_exibicao || medico?.nome || cf.profissional_solicitante_nome || 'DR. MARCELO FONTES DA SILVA'
  const medDoc = cf.profissional_documento_numero || '700123456789012'
  const medCrm = medico?.crm ? `CRM ${medico.crm}` : (cf.profissional_crm || 'CRM/PA 12345')

  return (
    <div className="sus-page" style={{ fontSize: '9px', lineHeight: 1.25 }}>
      <div className="sus-letterhead" style={{ borderBottom: '1.5px solid #1e3a8a', paddingBottom: '3px' }}>
        <div className="sus-letterhead-texto">
          <div className="nome" style={{ fontSize: '11px', fontWeight: 800, color: '#000' }}>PREFEITURA MUNICIPAL DE BREVES</div>
          <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#1e3a8a' }}>SECRETARIA MUNICIPAL DE SAÚDE — SEMSA</div>
          <div style={{ fontSize: '8.5px', color: '#333' }}>UPA 24H — UNIDADE DE PRONTO ATENDIMENTO DR. CARLOS PINTO</div>
          <div style={{ fontSize: '8px', color: '#555' }}>Rua Wilson Furtado, s/n, Bairro Aeroporto — Breves/PA — CEP: 68800-000 | CNPJ: 11.230.123/0001-45</div>
        </div>
        <div className="sus-letterhead-logos" style={{ gap: '10px' }}>
          <img src="./logos/brasao-breves.jpg" alt="Prefeitura de Breves" style={{ height: '36px' }} />
          <img src="./logos/semsa.jpg" alt="SEMSA" style={{ height: '36px' }} />
          <img src="./logos/upa24h.jpg" alt="UPA 24h" style={{ height: '36px' }} />
        </div>
      </div>

      <div className="sus-header" style={{ border: '1.5px solid #000', margin: '4px 0', minHeight: '32px' }}>
        <div className="sus-header-badge"><span className="sigla" style={{ fontSize: '18px', fontWeight: 900 }}>SUS</span></div>
        <div className="sus-header-coluna" style={{ fontSize: '7.5px', fontWeight: 800, lineHeight: 1.2 }}>
          SISTEMA ÚNICO DE SAÚDE<br />MINISTÉRIO DA SAÚDE
        </div>
        <div className="sus-header-titulo" style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '0.3px' }}>
          LAUDO PARA SOLICITAÇÃO / AUTORIZAÇÃO DE PROCEDIMENTO AMBULATORIAL
        </div>
      </div>

      <div className="sus-corpo" style={{ gap: '4px' }}>
        {/* Seção 1: Estabelecimento */}
        <div className="sus-secao" style={{ border: '1.2px solid #000', padding: '3px 6px' }}>
          <div className="sus-secao-titulo" style={{ fontSize: '8px', fontWeight: 900 }}>IDENTIFICAÇÃO DO ESTABELECIMENTO DE SAÚDE SOLICITANTE</div>
          <div className="sus-grid">
            <CampoSus cap="1 - NOME DO ESTABELECIMENTO DE SAÚDE" val={cf.estabelecimento_solicitante_nome || 'UPA 24 HORAS BREVES'} w={3.5} />
            <CampoComb cap="2 - CNES" val={cf.estabelecimento_solicitante_cnes || '0296796'} digitos={7} w={1.5} />
          </div>
        </div>

        {/* Seção 2: Paciente */}
        <div className="sus-secao" style={{ border: '1.2px solid #000', padding: '3px 6px' }}>
          <div className="sus-secao-titulo" style={{ fontSize: '8px', fontWeight: 900 }}>IDENTIFICAÇÃO DO PACIENTE</div>
          <div className="sus-grid">
            <CampoSus cap="3 - NOME DO PACIENTE" val={pessoa.nome} w={2.8} />
            <CampoSus cap="4 - Nº DO PRONTUÁRIO" val={limparPrefixo(pessoa.prontuario_numero) || atendimento.numero_atendimento} w={1.1} />
            <CampoComb cap="5 - CARTÃO NACIONAL DE SAÚDE (CNS)" val={pessoa.cns} digitos={15} w={2.3} />
          </div>
          <div className="sus-grid" style={{ borderTop: '1px solid #777' }}>
            <CampoSus cap="6 - DATA DE NASCIMENTO" val={`${pessoa.data_nascimento ? new Date(pessoa.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : ''}${idade ? ` (${idade} anos)` : ''}`} w={1.2} />
            <div className="sus-field" style={{ flexGrow: 1.2, flexBasis: 0 }}>
              <span className="cap">7 - SEXO</span>
              <span className="val">{pessoa.sexo === 'M' ? '( X ) MASCULINO  ( ) FEMININO' : '( ) MASCULINO  ( X ) FEMININO'}</span>
            </div>
            <CampoSus cap="8 - NOME DA MÃE OU RESPONSÁVEL" val={pessoa.nome_mae} w={2.2} />
            <CampoSus cap="9 - TELEFONE DE CONTATO" val={pessoa.telefone || '(91) 98455-1234'} w={1.4} />
          </div>
          <div className="sus-grid" style={{ borderTop: '1px solid #777' }}>
            <CampoSus cap="10 - ENDEREÇO (RUA, Nº, BAIRRO)" val={enderecoCompleto || 'RUA TAJAPURU, Nº 145 — CENTRO'} w={2.5} />
            <CampoSus cap="11 - MUNICÍPIO DE RESIDÊNCIA" val={pessoa.cidade || 'BREVES'} w={1.2} />
            <CampoComb cap="12 - CÓD. IBGE MUNICÍPIO" val={cf.ibge_municipio || '1501808'} digitos={7} w={1.1} />
            <CampoSus cap="13 - UF" val={pessoa.uf || 'PA'} w={0.4} />
            <CampoComb cap="14 - CEP" val={pessoa.cep || '68800000'} digitos={8} w={1.2} />
          </div>
        </div>

        {/* Seção 3: Procedimento Solicitado (Campos 15 a 32) */}
        <div className="sus-secao" style={{ border: '1.2px solid #000', padding: '3px 6px' }}>
          <div className="sus-secao-titulo" style={{ fontSize: '8px', fontWeight: 900 }}>PROCEDIMENTO SOLICITADO</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '2px', fontSize: '9px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1.2px solid #000' }}>
                <th style={{ textAlign: 'left', padding: '3px 6px', width: '165px' }}>CÓDIGO DE PROCEDIMENTO</th>
                <th style={{ textAlign: 'left', padding: '3px 6px' }}>NOME DO PROCEDIMENTO PRINCIPAL</th>
                <th style={{ textAlign: 'center', padding: '3px 6px', width: '50px' }}>QTE</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #777', minHeight: '30px' }}>
                <td style={{ padding: '3px 6px' }}>
                  <CampoComb cap="15 - CÓDIGO" val={procCod} digitos={10} />
                </td>
                <td style={{ padding: '3px 6px' }}>
                  <span className="cap" style={{ fontSize: '7.5px' }}>16 - NOME DO PROCEDIMENTO PRINCIPAL</span>
                  <div style={{ fontWeight: 800, fontSize: '10px' }}>{procNome}</div>
                </td>
                <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '11px', padding: '3px 6px' }}>
                  <span className="cap" style={{ fontSize: '7px' }}>17 - QTE</span>
                  {String(qtd).padStart(2, '0')}
                </td>
              </tr>
              {/* Linhas secundárias 18 a 32 */}
              <tr style={{ borderBottom: '1px solid #777', color: '#999' }}>
                <td style={{ padding: '2px 6px' }}><span className="cap" style={{ fontSize: '7.5px' }}>18 - CÓDIGO</span>—</td>
                <td style={{ padding: '2px 6px' }}><span className="cap" style={{ fontSize: '7.5px' }}>19 - NOME DO PROCEDIMENTO SECUNDÁRIO</span>-------------------------------------------------------------------------------------</td>
                <td style={{ textAlign: 'center', padding: '2px 6px' }}><span className="cap" style={{ fontSize: '7px' }}>20 - QTE</span>--</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #777', color: '#999' }}>
                <td style={{ padding: '2px 6px' }}><span className="cap" style={{ fontSize: '7.5px' }}>21 - CÓDIGO</span>—</td>
                <td style={{ padding: '2px 6px' }}><span className="cap" style={{ fontSize: '7.5px' }}>22 - NOME DO PROCEDIMENTO SECUNDÁRIO</span>-------------------------------------------------------------------------------------</td>
                <td style={{ textAlign: 'center', padding: '2px 6px' }}><span className="cap" style={{ fontSize: '7px' }}>23 - QTE</span>--</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Seção 4: Justificativa (Campos 33 a 37) */}
        <div className="sus-secao" style={{ border: '1.2px solid #000', padding: '3px 6px' }}>
          <div className="sus-secao-titulo" style={{ fontSize: '8px', fontWeight: 900 }}>JUSTIFICATIVA DO(S) PROCEDIMENTO(S) SOLICITADO(S)</div>
          <div className="sus-grid">
            <CampoSus cap="33 - DESCRIÇÃO DO DIAGNÓSTICO" val={diag} w={2.8} />
            <div className="sus-field" style={{ flexGrow: 1.1, flexBasis: 0 }}>
              <span className="cap">34 - CID 10 PRINCIPAL</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontWeight: 800 }}>{cidPrincipal}</span>
                <Digitos valor={cidPrincipal} n={4} />
              </div>
            </div>
            <div className="sus-field" style={{ flexGrow: 1.1, flexBasis: 0 }}>
              <span className="cap">35 - CID 10 SECUNDÁRIO</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontWeight: 800 }}>{cidSecundario}</span>
                <Digitos valor={cidSecundario} n={4} />
              </div>
            </div>
            <CampoSus cap="36 - CID 10 CAUSAS ASSOCIADAS" val={cf.cid_causas_associadas || '----------------'} w={1.1} />
          </div>
          <div className="sus-grid" style={{ borderTop: '1px solid #777', marginTop: '2px', paddingTop: '2px' }}>
            <div className="sus-field" style={{ flexBasis: '100%' }}>
              <span className="cap">37 - HISTÓRICO / JUSTIFICATIVA CLÍNICA (CAMPO OFICIAL SUS)</span>
              <div style={{ border: '1px solid #666', borderRadius: '2px', padding: '6px 8px', fontSize: '9px', fontWeight: 600, minHeight: '45px', textAlign: 'justify', lineHeight: 1.35 }}>
                {just || 'PACIENTE COM INDICAÇÃO DE EXAME AMBULATORIAL REGULADO PELO SUS PARA ESCLARECIMENTO DIAGNÓSTICO E CONDUTA MÉDICA.'}
              </div>
            </div>
          </div>
        </div>

        {/* Seção 5: Solicitação (Campos 38 a 42) */}
        <div className="sus-secao" style={{ border: '1.2px solid #000', padding: '3px 6px' }}>
          <div className="sus-secao-titulo" style={{ fontSize: '8px', fontWeight: 900 }}>SOLICITAÇÃO</div>
          <div className="sus-grid" style={{ alignItems: 'flex-end' }}>
            <CampoSus cap="38 - NOME DO PROFISSIONAL SOLICITANTE" val={medNome} w={2.3} />
            <CampoSus cap="39 - DATA" val={dataHora.split(',')[0]} w={1} />
            <CampoComb cap="40 - ( X ) CNS ( ) CPF · 41 - Nº DOC. PROFISSIONAL" val={medDoc} digitos={15} w={1.8} />
            <div className="sus-field" style={{ flexGrow: 2, flexBasis: 0, textAlign: 'center', borderLeft: '1px solid #777', paddingLeft: '8px' }}>
              <span className="cap">42 - ASSINATURA E CARIMBO (Nº REGISTRO CONSELHO)</span>
              <div style={{ borderTop: '1.3px solid #000', width: '85%', margin: '22px auto 2px' }} />
              <div style={{ fontSize: '7.8px', fontWeight: 800 }}>{medNome} — {medCrm}</div>
            </div>
          </div>
        </div>

        {/* Seção 6: Autorização (Campos 43 a 50) */}
        <div className="sus-secao" style={{ border: '1.2px solid #000', padding: '3px 6px' }}>
          <div className="sus-secao-titulo" style={{ fontSize: '8px', fontWeight: 900 }}>AUTORIZAÇÃO</div>
          <div className="sus-grid">
            <CampoSus cap="43 - NOME DO PROFISSIONAL AUTORIZADOR" val={cf.autorizador_nome || '\u00A0'} w={2.3} />
            <CampoSus cap="44 - CÓD. ÓRGÃO EMISSOR" val={cf.autorizador_codigo_orgao_emissor || '\u00A0'} w={1} />
            <CampoComb cap="45 - ( ) CNS ( ) CPF · 46 - Nº DOC." val={cf.autorizador_documento_numero || ''} digitos={15} w={1.8} />
            <div className="sus-field" style={{ flexGrow: 2, flexBasis: 0, textAlign: 'center', borderLeft: '1px solid #777', paddingLeft: '8px' }}>
              <span className="cap">48 - ASSINATURA E CARIMBO</span>
              <div style={{ borderTop: '1.3px solid #000', width: '85%', margin: '22px auto 2px' }} />
              <div style={{ fontSize: '7.8px', fontWeight: 800 }}>Médico Autorizador / Regulação SUS</div>
            </div>
          </div>
          <div className="sus-grid" style={{ borderTop: '1px solid #777' }}>
            <CampoComb cap="49 - Nº DA AUTORIZAÇÃO (APAC)" val={registro.numero_autorizacao || cf.numero_autorizacao || ''} digitos={13} w={2.3} />
            <CampoSus cap="47 - DATA" val={cf.data_autorizacao ? new Date(cf.data_autorizacao + 'T00:00:00').toLocaleDateString('pt-BR') : '____/____/________'} w={1} />
            <CampoSus cap="50 - PERÍODO DE VALIDADE DA APAC" val={registro.validade_inicio ? `${new Date(registro.validade_inicio + 'T00:00:00').toLocaleDateString('pt-BR')} A ${new Date(registro.validade_fim + 'T00:00:00').toLocaleDateString('pt-BR')}` : '____/____/________  A  ____/____/________'} w={2.5} />
          </div>
        </div>

        {/* Seção 7: Executante (Campos 51 e 52) */}
        <div className="sus-secao" style={{ border: '1.2px solid #000', padding: '3px 6px' }}>
          <div className="sus-secao-titulo" style={{ fontSize: '8px', fontWeight: 900 }}>IDENTIFICAÇÃO DO ESTABELECIMENTO DE SAÚDE ( EXECUTANTE )</div>
          <div className="sus-grid">
            <CampoSus cap="51 - NOME FANTASIA DO ESTABELECIMENTO" val={cf.executante_nome || 'CENTRO DE DIAGNÓSTICO POR IMAGEM / REDE REGULADA SUS'} w={3.5} />
            <CampoComb cap="52 - CNES" val={cf.executante_cnes || ''} digitos={7} w={1.5} />
          </div>
        </div>
      </div>

      <div className="doc-rodape" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.2px solid #777', paddingTop: '3px', marginTop: '4px', fontSize: '7.5px', color: '#333' }}>
        <div>UPA 24H DR. CARLOS PINTO — BREVES/PA | SISTEMA DE REGULAÇÃO AMBULATORIAL SUS / APAC</div>
        <div>EMISSÃO: {dataHora} — VIA REGULAÇÃO / PACIENTE</div>
      </div>
    </div>
  )
}
