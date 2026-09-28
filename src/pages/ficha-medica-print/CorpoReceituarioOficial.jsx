import CabecalhoPadraoUPA from '../CabecalhoPadraoUPA'

function ReceitaColuna({ via, viaRotulo, registro, pessoa, atendimento, idade, leitoNumero, setorNome, medico, dataHora }) {
  const itensRaw = registro.itens || []
  const viasAgrupadas = itensRaw.reduce((acc, it, i) => {
    const viaNome = (it.via || 'ORAL').toUpperCase()
    if (!acc[viaNome]) acc[viaNome] = []
    acc[viaNome].push({ ...it, originalIndex: i })
    return acc
  }, {})

  return (
    <div className="rxf-coluna">
      <CabecalhoPadraoUPA
        titulo="RECEITUÁRIO MÉDICO"
        pessoa={pessoa}
        atendimento={atendimento}
        idade={idade}
        leitoNumero={leitoNumero}
        setorNome={setorNome}
        medico={medico}
        dataHora={dataHora}
      />

      <div className="rxf-via-faixa">
        <span>PRESCRIÇÃO</span>
        <span className="rxf-via-badge">{viaRotulo || (via === 1 ? '1ª VIA — PACIENTE' : '2ª VIA — FARMÁCIA')}</span>
      </div>

      <div className="rxf-corpo">
        {Object.entries(viasAgrupadas).length === 0 ? (
          <>
             <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '11pt', marginTop: '8px', marginBottom: '4px' }}>USO NÃO ESPECIFICADO</div>
             <div className="rxf-itens-lista" />
          </>
        ) : (
          Object.entries(viasAgrupadas).map(([viaKey, itensVia]) => (
            <div key={viaKey}>
              <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '11pt', marginTop: '8px', marginBottom: '4px' }}>
                USO {viaKey}
              </div>
              <div className="rxf-itens-lista">
                {itensVia.map((it) => (
                  <div key={it.originalIndex} className="rxf-item-box">
                    <div className="rxf-item-titulo">
                      <span className="rxf-item-num">{it.originalIndex + 1}.</span>
                      <span><b>{it.medicamento}</b>{it.quantidade ? <span className="rxf-item-qtd"> ({it.quantidade})</span> : null}</span>
                    </div>
                    {it.instrucao && <div className="rxf-item-instrucao">{it.instrucao}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        <div style={{ flex: 1 }} />

        <div className="rxf-orientacao-alerta">
          <b>Orientações ao Paciente:</b> Seguir rigorosamente a dosagem e horários prescritos. Não interromper o tratamento sem orientação médica. Em caso de reações adversas ou persistência dos sintomas, retorne à UPA 24h Breves.
        </div>
      </div>

      {/* RODAPÉ INDIVIDUAL DE CADA VIA */}
      <div className="doc-rodape-container" style={{ marginTop: 'auto' }}>
        <div className="doc-rodape-externo" style={{ padding: '3px 2px 2px' }}>
          <div className="doc-bloco-datahora">
            <div className="cidade-data" style={{ fontSize: '11pt' }}>Breves/PA, {new Date().toLocaleDateString('pt-BR')}</div>
            <div className="hora-envio" style={{ fontSize: '11pt' }}><b>Emissão:</b> {dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora}</div>
          </div>
          <div className="doc-bloco-assinatura" style={{ minWidth: '140px' }}>
            <div className="linha-sig" />
            <div className="nome-sig" style={{ fontSize: '11pt' }}>{medico?.nome_exibicao || medico?.nome || 'Médico Assistente'}</div>
            <div className="crm-sig" style={{ fontSize: '11pt' }}>{medico?.crm ? `CRM-PA ${medico.crm}` : 'CRM/UF'}</div>
            <div className="cargo-sig" style={{ fontSize: '11pt' }}>Médico Assistente — UPA 24h Breves</div>
          </div>
        </div>
        <div className="doc-rodape-sistema" style={{ fontSize: '11pt', paddingTop: '1.5px', marginTop: '2px' }}>
          <span>Prontuário Eletrônico do Paciente — UPA 24h Breves / SEMSA</span>
          <span>{viaRotulo || (via === 1 ? '1ª Via: Paciente' : '2ª Via: Farmácia')}</span>
        </div>
      </div>
    </div>
  )
}

export default function CorpoReceituarioOficial(props) {
  return (
    <div className="rxf-page">
      <div className="rxf-duas-vias">
        <ReceitaColuna {...props} via={1} viaRotulo="1ª VIA — PACIENTE" />
        <ReceitaColuna {...props} via={2} viaRotulo="2ª VIA — FARMÁCIA" />
      </div>
    </div>
  )
}
