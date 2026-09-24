import { useEffect, useState } from 'react';
import { buscarCabecalhoImpressao } from '../../lib/pepMedico';

// `paciente` (via EspacoPaciente.jsx) vem da tabela legada `pacientes` — só tem nome,
// idade, sexo, data_nascimento, classificacao_manchester, alergias/alergias_obs. CNS, RG,
// CPF, nome da mãe e endereço vivem em `pessoas`, buscados aqui com a mesma função usada
// pelas impressões (buscarCabecalhoImpressao) — nunca inventar esses dados quando vierem
// vazios do banco.
export default function PatientBanner({ atendimento }) {
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [cabecalho, setCabecalho] = useState(null);

  useEffect(() => {
    if (!atendimento?.atendimento_id) return;
    let vivo = true;
    buscarCabecalhoImpressao(atendimento.atendimento_id).then((c) => { if (vivo) setCabecalho(c); });
    return () => { vivo = false };
  }, [atendimento?.atendimento_id]);

  const paciente = atendimento?.paciente || {};
  const pessoa = cabecalho?.pessoa;

  const nomePaciente = pessoa?.nome || paciente?.nome || atendimento?.nome || 'Paciente sem nome';
  const idade = cabecalho?.idade ?? paciente?.idade ?? atendimento?.idade ?? null;
  const dataNasc = pessoa?.data_nascimento
    ? new Date(pessoa.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR')
    : null;
  const isPediatrico =
    (typeof idade === 'number' && idade < 14) ||
    String(idade).includes('ano') ||
    atendimento?.setor_nome?.toLowerCase().includes('pediát') ||
    paciente?.setorNome?.toLowerCase().includes('pediát');
  const sexoBruto = pessoa?.sexo || paciente?.sexo || atendimento?.sexo || null;
  const sexo = sexoBruto ? (sexoBruto.toUpperCase().startsWith('F') ? 'Fem' : 'Masc') : null;
  const leito = cabecalho?.leitoNumero || atendimento?.leito_numero || paciente?.leito_numero || null;
  const cns = pessoa?.cns || null;
  const manchester = paciente?.classificacao_manchester || null;
  const alergia = paciente?.alergias_obs || (paciente?.alergias ? 'Alergia registrada, sem detalhe' : null);

  return (
    <div className="patient-banner">
      <div className="pb-main">
        <div>
          <h1 className="pb-name">
            {nomePaciente}
            {isPediatrico && <span className="badge-pediatrico">Modo Pediátrico</span>}
            {alergia && (
              <span className="badge-alergia-pb">
                <span>⚠️</span> Alergia: {alergia}
              </span>
            )}
          </h1>
          <div className="pb-meta">
            {idade && <span>🪪 {idade}{dataNasc ? ` (${dataNasc})` : ''}</span>}
            {sexo && <span>⚧ {sexo}</span>}
            {leito && <span>🛏️ Leito: {leito}</span>}
            {cns && <span>💳 CNS: {cns}</span>}
          </div>
        </div>
        <div className="pb-right">
          {manchester && <div><strong>Classificação:</strong> {manchester}</div>}
          <button
            type="button"
            className="btn-toggle-pb"
            onClick={() => setDrawerAberto(!drawerAberto)}
          >
            <span>{drawerAberto ? '▲' : '▼'}</span>
            <span>{drawerAberto ? 'Ocultar Ficha Oficial' : 'Expandir Ficha Oficial'}</span>
          </button>
        </div>
      </div>

      {drawerAberto && (
        <div className="pb-drawer">
          <div className="drawer-item">
            <label>Nome da Mãe</label>
            <span>{pessoa?.nome_mae || 'Não informado'}</span>
          </div>
          <div className="drawer-item">
            <label>CPF</label>
            <span>{pessoa?.cpf || 'Não informado'}</span>
          </div>
          <div className="drawer-item">
            <label>Município</label>
            <span>{pessoa?.cidade || 'Não informado'}</span>
          </div>
          <div className="drawer-item">
            <label>Endereço Completo</label>
            <span>
              {[pessoa?.endereco, pessoa?.endereco_numero, pessoa?.bairro].filter(Boolean).join(', ') || 'Não informado'}
            </span>
          </div>
          <div className="drawer-item">
            <label>CNES Solicitante</label>
            <span>02.967.963 (UPA 24h Breves)</span>
          </div>
        </div>
      )}
    </div>
  );
}
