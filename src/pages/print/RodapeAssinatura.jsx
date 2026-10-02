// Rodapé padrão dos impressos clínicos: cidade/data (+ horário), assinatura do profissional
// e a faixa do sistema. Um lugar só para o modelo — mudar aqui muda todos os documentos que
// usam este rodapé (evolução, admissão, nota de intercorrência, plano, alta, atestado...).
// Prescrição, receituário e passagem de plantão têm rodapés próprios (várias assinaturas/vias).
export const horaDe = (dataHora) => (dataHora && dataHora.includes(',') ? dataHora.split(',')[1].trim() : dataHora)

export default function RodapeAssinatura({ data, rotuloHora, hora, sufixoHora = '', nome, conselho, conselhoClasse = 'crm', cargo, sistema, documento }) {
  return (
    <div className="doc-rodape-container">
      <div className="doc-rodape-externo">
        <div className="doc-bloco-datahora">
          <div className="cidade-data">Breves/PA, {data}</div>
          {rotuloHora && <div className="hora-envio"><b>{rotuloHora}</b> {hora}{sufixoHora}</div>}
        </div>
        <div className="doc-bloco-assinatura">
          <div className="linha-sig" />
          <div className="nome-sig">{nome}</div>
          <div className={`${conselhoClasse}-sig`}>{conselho}</div>
          <div className="cargo-sig">{cargo}</div>
        </div>
      </div>
      <div className="doc-rodape-sistema">
        <span>{sistema}</span>
        <span>{documento}</span>
      </div>
    </div>
  )
}
