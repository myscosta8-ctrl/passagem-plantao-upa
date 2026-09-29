import './TelaApoio.css'

// Tela inicial das funções de apoio da UPA (farmácia, serviço social, psicologia etc.).
// Acesso apenas de consulta: não cria documentos clínicos.
export default function TelaApoio({ enfermeiro, podeAdministrar, onEquipe, onProfissionais, onConta }) {
  const nome = enfermeiro?.nome_exibicao || enfermeiro?.nome
  return (
    <div className="workspace tapoio">
      <div className="card tapoio-card">
        <i className="ph ph-hand-waving tapoio-ico" />
        <h1>Olá, {nome}</h1>
        <p>Seu acesso está ativo. Nesta função o sistema é de consulta: você não cria documentos clínicos. Se precisar de mais acessos, fale com a administração.</p>
        <div className="tapoio-acoes">
          {podeAdministrar && <button type="button" className="tapoio-btn" onClick={onEquipe}><i className="ph ph-users-three" /> Painel de Equipe</button>}
          {podeAdministrar && <button type="button" className="tapoio-btn" onClick={onProfissionais}><i className="ph ph-identification-badge" /> Profissionais</button>}
          <button type="button" className="tapoio-btn" onClick={onConta}><i className="ph ph-user-circle" /> Minha conta</button>
        </div>
      </div>
    </div>
  )
}
