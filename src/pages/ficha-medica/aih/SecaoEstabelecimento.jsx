import Campo from './CampoAih'

// Seção 1 — Identificação do estabelecimento de saúde (campos 1 a 4).
export default function SecaoEstabelecimento({ dados, set }) {
  return (
    <div className="aih-secao-box">
      <div className="aih-secao-legend">
        <span>1. IDENTIFICAÇÃO DO ESTABELECIMENTO DE SAÚDE</span>
      </div>
      <div className="aih-grid" style={{ marginTop: 4 }}>
        <Campo n="1" rotulo="NOME DO ESTABELECIMENTO SOLICITANTE" col={8} valor={dados.estabelecimento_solicitante_nome} onChange={(v) => set('estabelecimento_solicitante_nome', v.toUpperCase())} />
        <Campo n="2" rotulo="CNES" col={4} valor={dados.estabelecimento_solicitante_cnes} onChange={(v) => set('estabelecimento_solicitante_cnes', v.replace(/\D/g, '').slice(0, 7))} />
        <Campo n="3" rotulo="NOME DO ESTABELECIMENTO EXECUTANTE" col={8} valor={dados.estabelecimento_executante_nome} onChange={(v) => set('estabelecimento_executante_nome', v.toUpperCase())} />
        <Campo n="4" rotulo="CNES" col={4} valor={dados.estabelecimento_executante_cnes} onChange={(v) => set('estabelecimento_executante_cnes', v.replace(/\D/g, '').slice(0, 7))} />
      </div>
    </div>
  )
}
