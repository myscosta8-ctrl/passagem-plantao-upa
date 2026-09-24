import {
  CampoComb,
  CampoSus,
  Marca,
  CampoData,
  CampoTelefone,
  CampoSexo
} from './helpersSus'

const VINCULO_PREVIDENCIA_OPCOES = [
  { valor: 'empregado', rotulo: 'Empregado' },
  { valor: 'empregador', rotulo: 'Empregador' },
  { valor: 'autonomo', rotulo: 'Autônomo' },
  { valor: 'desempregado', rotulo: 'Desempregado' },
  { valor: 'aposentado', rotulo: 'Aposentado' },
  { valor: 'nao_segurado', rotulo: 'Não segurado' },
]

// Réplica do formulário oficial do SUS "Laudo para Solicitação de Autorização
// de Internação Hospitalar" — layout de caixas burocráticas padrão nacional,
// igual ao documento físico usado hoje na UPA, campo por campo, sem omitir
// nenhuma seção (Estabelecimento, Paciente, Justificativa, Diagnóstico,
// Procedimento, Causas Externas e Autorização).
export default function CorpoAihOficial({ registro, pessoa, atendimento: _atendimento, idade: _idade, leitoNumero, setorNome, medico, dataHora }) {
  const cf = registro.campos_formulario || {}
  const enderecoCompleto = [pessoa.endereco, pessoa.endereco_numero, pessoa.bairro].filter(Boolean).join(', ')
  const cidPrincipal = registro.cid_catalog ? `${registro.cid_catalog.codigo} — ${registro.cid_catalog.descricao}` : (registro.cid_principal || '')

  return (
    <div className="sus-page">
      <div className="sus-letterhead">
        <div className="sus-letterhead-texto">
          <div className="nome">UPA 24H BREVES</div>
          <div>PREFEITURA MUNICIPAL DE BREVES</div>
          <div>SECRETARIA MUNICIPAL DE SAÚDE — SEMSA</div>
        </div>
        <div className="sus-letterhead-logos">
          <img src="./logos/brasao-breves.jpg" alt="Prefeitura de Breves" />
          <img src="./logos/semsa.jpg" alt="SEMSA" />
          <img src="./logos/upa24h.jpg" alt="UPA 24h" />
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 9.5, fontWeight: 700, marginBottom: 3 }}>ANEXO I</div>
      <div className="sus-header">
        <div className="sus-header-badge"><span className="sigla">SUS</span></div>
        <div className="sus-header-coluna">Sistema Único de Saúde</div>
        <div className="sus-header-coluna">Ministério da Saúde</div>
        <div className="sus-header-titulo">
          LAUDO PARA SOLICITAÇÃO DE AUTORIZAÇÃO<br />DE INTERNAÇÃO HOSPITALAR
        </div>
      </div>

      <div className="sus-corpo">
      <div className="sus-secao">
        <div className="sus-secao-titulo">Identificação do Estabelecimento de Saúde</div>
        <div className="sus-grid">
          <CampoSus cap="1. Nome do estabelecimento solicitante" val={cf.estabelecimento_solicitante_nome} w={3} />
          <CampoComb cap="2. CNES" val={cf.estabelecimento_solicitante_cnes} digitos={7} />
        </div>
        <div className="sus-grid">
          <CampoSus cap="3. Nome do estabelecimento executante" val={cf.estabelecimento_executante_nome} w={3} />
          <CampoComb cap="4. CNES" val={cf.estabelecimento_executante_cnes} digitos={7} />
        </div>
      </div>

      <div className="sus-secao">
        <div className="sus-secao-titulo">Identificação do Paciente</div>
        <div className="sus-grid">
          <CampoSus cap="5. Nome do paciente" val={pessoa.nome} w={3} />
          <CampoSus cap="6. Nº do prontuário" val={pessoa.prontuario_numero} />
        </div>
        <div className="sus-grid">
          <CampoComb cap="7. Cartão Nacional de Saúde (CNS)" val={pessoa.cns} digitos={15} w={2} />
          <CampoData cap="8. Data de nascimento" valorISO={pessoa.data_nascimento} />
          <CampoSexo sexo={pessoa.sexo} />
          <CampoSus cap="10. Raça/Cor · 10.1 Etnia" val={[pessoa.raca_cor, cf.etnia].filter(Boolean).join(' · ')} />
        </div>
        <div className="sus-grid">
          <CampoSus cap="11. Nome da mãe" val={pessoa.nome_mae} w={2} />
          <CampoTelefone cap="12. Telefone de contato" valor={pessoa.telefone} w={2} />
        </div>
        <div className="sus-grid">
          <CampoSus cap="13. Nome do responsável" val={cf.nome_responsavel} w={2} />
          <CampoTelefone cap="14. Telefone de contato" valor="" w={2} />
        </div>
        <div className="sus-grid">
          <CampoSus cap="15. Endereço (rua, nº, bairro)" val={enderecoCompleto} full />
        </div>
        <div className="sus-grid">
          <CampoSus cap="16. Município de residência" val={pessoa.cidade} w={2} />
          <CampoComb cap="17. Cód. IBGE município" val={cf.municipio_residencia_ibge} digitos={7} />
          <CampoSus cap="18. UF" val={cf.municipio_residencia_uf} />
          <CampoComb cap="19. CEP" val={cf.municipio_residencia_cep} digitos={8} />
        </div>
      </div>

      <div className="sus-secao">
        <div className="sus-secao-titulo-central">Justificativa da Internação</div>
        <div className="sus-grid"><CampoSus cap="20. Principais sinais e sintomas clínicos" val={cf.sinais_sintomas_clinicos} full /></div>
        <div className="sus-grid"><CampoSus cap="21. Condições que justificam a internação" val={cf.condicoes_justificam_internacao} full /></div>
        <div className="sus-grid"><CampoSus cap="22. Principais resultados de provas diagnósticas (resultados de exames realizados)" val={cf.resultados_provas_diagnosticas} full /></div>
        <div className="sus-grid" style={{ borderTop: '1px solid #000' }}>
          <CampoSus cap="23. Diagnóstico inicial" val={cf.diagnostico_inicial_texto} w={2.6} />
          <CampoSus cap="24. CID 10 principal" val={cidPrincipal} w={0.9} />
          <CampoSus cap="25. CID 10 secundário" val={registro.cid_secundario} w={0.9} />
          <CampoSus cap="26. CID 10 causas associadas" val={cf.cid_causas_associadas} w={0.9} />
        </div>
      </div>

      <div className="sus-secao">
        <div className="sus-secao-titulo-central">Procedimento Solicitado</div>
        <div className="sus-grid">
          <CampoSus cap="27. Descrição do procedimento solicitado" val={registro.procedimento_principal_nome} w={3} />
          <CampoComb cap="28. Código do procedimento" val={registro.procedimento_principal_codigo} digitos={10} />
        </div>
        <div className="sus-grid">
          <CampoSus cap="29. Clínica" val={cf.clinica || (leitoNumero ? `Leito ${leitoNumero} — ${setorNome}` : '')} />
          <CampoSus cap="30. Caráter da internação" val={cf.carater_internacao === 'ELETIVA' ? 'Eletiva' : 'Urgência'} />
          <div className="sus-field" style={{ flexGrow: 1.4, flexBasis: 0, whiteSpace: 'nowrap' }}>
            <span className="cap">31. Documento</span>
            <div style={{ marginTop: 1, display: 'flex', gap: 6 }}>
              <span className="sus-checkbox"><Marca marcado={cf.profissional_documento_tipo === 'CNS'} /> CNS</span>
              <span className="sus-checkbox"><Marca marcado={cf.profissional_documento_tipo === 'CPF'} /> CPF</span>
            </div>
          </div>
          <CampoComb cap="32. Nº documento (CNS/CPF) do profissional solicitante/assistente" val={cf.profissional_documento_numero} digitos={15} w={2.2} />
        </div>
        <div className="sus-grid">
          <CampoSus cap="33. Nome do profissional solicitante/assistente" val={medico?.nome_exibicao || medico?.nome} w={1.8} />
          <CampoData cap="34. Data da solicitação" valorISO={registro.criado_em ? registro.criado_em.slice(0, 10) : ''} w={1.4} />
          <CampoSus cap="35. Assinatura e carimbo (nº do registro do conselho)" val={medico?.crm ? `CRM ${medico.crm}` : ''} w={1.8} />
        </div>
      </div>
      </div>

      <div className="sus-box-solo">
        <div className="sus-secao-titulo-central">Preencher em Caso de Causas Externas (Acidentes ou Violências)</div>
        <div className="sus-duas-colunas">
          <div className="col" style={{ flex: '0 0 180px' }}>
            <div className="sus-field" style={{ flexBasis: '100%' }}><span className="sus-checkbox"><Marca marcado={cf.causa_externa_transito} /> 36. Acidente de trânsito</span></div>
            <div className="sus-field" style={{ flexBasis: '100%' }}><span className="sus-checkbox"><Marca marcado={cf.causa_externa_trabalho_tipico} /> 37. Acidente trabalho típico</span></div>
            <div className="sus-field" style={{ flexBasis: '100%' }}><span className="sus-checkbox"><Marca marcado={cf.causa_externa_trabalho_trajeto} /> 38. Acidente trabalho trajeto</span></div>
          </div>
          <div className="col">
            <div className="sus-field" style={{ flexBasis: '100%' }}><CampoComb cap="39. CNPJ da seguradora" val={cf.cnpj_seguradora} digitos={14} /></div>
            <div className="sus-grid">
              <CampoSus cap="40. Nº do bilhete" val={cf.numero_bilhete} />
              <CampoSus cap="41. Série" val={cf.serie_bilhete} />
            </div>
          </div>
        </div>
        <div className="sus-grid" style={{ borderTop: '1px solid #000' }}>
          <CampoComb cap="42. CNPJ da empresa" val={cf.cnpj_empresa} digitos={14} w={2} />
          <CampoSus cap="43. CNAE da empresa" val={cf.cnae_empresa} />
          <CampoSus cap="44. CBOR" val={cf.cbor} />
        </div>
        <div className="sus-grid" style={{ marginTop: 4, borderTop: '1px solid #000' }}>
          <div className="sus-field" style={{ flexBasis: '100%' }}>
            <span className="cap">45. Vínculo com a previdência</span>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 2 }}>
              {VINCULO_PREVIDENCIA_OPCOES.map((op) => (
                <span key={op.valor} className="sus-checkbox"><Marca marcado={cf.vinculo_previdencia === op.valor} /> {op.rotulo}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="sus-box-solo">
        <div className="sus-secao-titulo-central">Autorização</div>
        <div className="sus-duas-colunas">
          <div className="col" style={{ flex: 3 }}>
            <div className="sus-field" style={{ flexBasis: '100%' }}><CampoSus cap="46. Nome do profissional autorizador" val={cf.autorizador_nome} /></div>
          </div>
          <div className="col">
            <div className="sus-field" style={{ flexBasis: '100%' }}><CampoSus cap="47. Cód. órgão emissor" val={cf.autorizador_codigo_orgao_emissor} /></div>
            <div className="sus-field" style={{ flexBasis: '100%' }}><CampoSus cap="52. Nº da autorização de internação hospitalar" val={cf.numero_autorizacao} /></div>
          </div>
        </div>
        <div className="sus-grid" style={{ borderTop: '1px solid #000' }}>
          <div className="sus-field">
            <span className="cap">48. Documento</span>
            <div style={{ marginTop: 1 }}>
              <span className="sus-checkbox"><Marca marcado={cf.autorizador_documento_tipo === 'CNS'} /> CNS</span>
              <span className="sus-checkbox"><Marca marcado={cf.autorizador_documento_tipo === 'CPF'} /> CPF</span>
            </div>
          </div>
          <CampoComb cap="49. Nº documento (CNS/CPF) do profissional autorizador" val={cf.autorizador_documento_numero} digitos={15} w={3} />
        </div>
        <div className="sus-grid">
          <CampoData cap="50. Data da autorização" valorISO={cf.data_autorizacao} />
          <CampoSus cap="51. Assinatura e carimbo (nº do registro do conselho)" val="" w={3} />
        </div>
      </div>

      <div className="sus-rodape-legal">Esta conta é paga com recursos públicos do SUS</div>
      <div className="doc-rodape-meta">Registrado em {dataHora}</div>
    </div>
  )
}
