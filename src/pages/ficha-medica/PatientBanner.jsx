import { useState } from 'react';

export default function PatientBanner({ atendimento }) {
  const [drawerAberto, setDrawerAberto] = useState(false);

  const paciente = atendimento?.paciente || {};
  const nomePaciente = paciente?.nome || atendimento?.nome || 'Paciente sem nome';
  const idade = paciente?.idade || atendimento?.idade || '4 anos';
  const dataNasc = paciente?.data_nascimento
    ? new Date(paciente.data_nascimento).toLocaleDateString('pt-BR')
    : '12/03/2022';
  const isPediatrico =
    (typeof idade === 'number' && idade < 14) ||
    String(idade).includes('ano') ||
    atendimento?.setor_nome?.toLowerCase().includes('pediát') ||
    paciente?.setorNome?.toLowerCase().includes('pediát');
  const sexo = (paciente?.sexo || atendimento?.sexo || 'M').toUpperCase().startsWith('F') ? 'Fem' : 'Masc';
  const peso = paciente?.peso ? `${paciente.peso} kg` : isPediatrico ? '16 kg' : '72 kg';
  const leito = atendimento?.leito_numero || paciente?.leito_numero || 'Observação Pediátrica 02';
  const cns = paciente?.cns || '700.1234.5678.9012';
  const manchester = paciente?.classificacao_manchester || 'Amarelo (Urgência)';
  const alergia = paciente?.alergias_obs || (paciente?.alergias ? 'Alergia registrada' : 'Dipirona');

  return (
    <div className="patient-banner">
      <div className="pb-main">
        <div>
          <h1 className="pb-name">
            {nomePaciente}
            {isPediatrico && <span className="badge-pediatrico">Modo Pediátrico</span>}
            <span className="badge-alergia-pb">
              <span>⚠️</span> Alergia: {alergia}
            </span>
          </h1>
          <div className="pb-meta">
            <span>🪪 {idade} ({dataNasc})</span>
            <span>⚧ {sexo}</span>
            <span className="weight-badge">⚖️ {peso}</span>
            <span>🛏️ Leito: {leito}</span>
            <span>💳 CNS: {cns}</span>
          </div>
        </div>
        <div className="pb-right">
          <div><strong>Classificação:</strong> {manchester}</div>
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
            <span>{paciente?.nome_mae || 'Maria Eduarda Silva'}</span>
          </div>
          <div className="drawer-item">
            <label>RG / CPF</label>
            <span>{paciente?.rg || '6543210 PC/PA'} — {paciente?.cpf || '012.345.678-90'}</span>
          </div>
          <div className="drawer-item">
            <label>Município / UF</label>
            <span>{paciente?.municipio || 'Breves'} / {paciente?.uf || 'PA'} (Zona Urbana)</span>
          </div>
          <div className="drawer-item">
            <label>Endereço Completo</label>
            <span>{paciente?.endereco || 'Trav. Castilhos França, 450, Centro'}</span>
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
