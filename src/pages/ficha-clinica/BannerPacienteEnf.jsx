import { useEffect, useState } from 'react';
import { buscarCabecalhoImpressao, buscarHistoricoEnfermagem } from '../../lib/pepMedico';
import { listarAlergias, listarSinaisVitais } from '../../lib/pepClinico';
import { MANCHESTER_CORES, normalizarNome } from '../painel/constantes';

// Banner do paciente do Módulo de Enfermagem — mockup 08 (patient-banner).
// Tudo vem do banco (pessoas, atendimentos, leito, sinais_vitais, alergias);
// campo vazio aparece como "—", nunca como valor inventado.
const fmt = (v) => (v === null || v === undefined || v === '' ? '—' : v);
const limpar = (v) => String(v || '').replace(/^#?\s*(PEP|AT|REG)-?/i, '');

export default function BannerPacienteEnf({ atendimento }) {
  const [cab, setCab] = useState(null);
  const [sv, setSv] = useState(null);
  const [alergias, setAlergias] = useState([]);
  const [aberto, setAberto] = useState(false);
  const [enfAdmissao, setEnfAdmissao] = useState(null);

  useEffect(() => {
    if (!atendimento?.atendimento_id) return;
    let vivo = true;
    buscarCabecalhoImpressao(atendimento.atendimento_id).then((c) => { if (vivo) setCab(c); }).catch(() => {});
    buscarHistoricoEnfermagem(atendimento.atendimento_id).then((h) => { if (vivo && h) setEnfAdmissao(h.enfermeiros?.nome_exibicao || h.enfermeiros?.nome || null); }).catch(() => {});
    listarSinaisVitais(atendimento.atendimento_id).then((l) => { if (vivo) setSv(l[0] || null); });
    if (atendimento.pessoa_id) listarAlergias(atendimento.pessoa_id).then((l) => { if (vivo) setAlergias(l.filter((a) => a.status !== 'inativa')); });
    return () => { vivo = false; };
  }, [atendimento?.atendimento_id]);

  const p = cab?.pessoa || {};
  const a = cab?.atendimento || {};
  const pac = atendimento?.paciente || {};
  const nome = p.nome || pac.nome || atendimento?.nome || 'Paciente';
  const nasc = p.data_nascimento ? new Date(p.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : null;
  const idade = cab?.idade ?? pac.idade;
  const sexo = String(p.sexo || pac.sexo || '').toUpperCase().startsWith('F') ? 'Feminino' : (p.sexo || pac.sexo) ? 'Masculino' : null;
  const setor = cab?.setorNome || atendimento?.setorNome;
  const leito = cab?.leitoNumero || atendimento?.leito_numero;
  const alergiaTxt = alergias.map((x) => x.substancia).join(', ') || pac.alergias_obs;
  const hd = pac.diagnostico || a.queixa_principal;
  const cns = p.cns || null;
  const pediatrico = (typeof idade === 'number' && idade < 14) || /ped/i.test(String(setor || ''));
  const classNome = a.classificacao_risco_cor || pac.classificacao_manchester || null;
  const classif = classNome ? MANCHESTER_CORES.find((c) => normalizarNome(c.nome) === normalizarNome(classNome)) : null;
  const estiloBorda = classif ? { borderLeftColor: classif.cor } : undefined;

  return (
    <div className="patient-banner enf-banner" style={estiloBorda}>
      <div className="pb-main">
        <div className="pb-left">
          <div className="pb-header">
            <span className="pb-name">{String(nome).toUpperCase()}</span>
            <span className="pb-badge"><i className="ph ph-shield-check" /> UPA 24H BREVES</span>
            {pediatrico && <span className="pb-pediatrico">Modo Pediátrico</span>}
            {alergiaTxt && <span className="pb-alergia"><i className="ph ph-warning" /> Alergia: {alergiaTxt}</span>}
          </div>
          <div className="pb-meta">
            <span className="pb-meta-item"><i className="ph ph-identification-card" /> Reg: <strong>{fmt(limpar(a.numero_atendimento))}</strong></span>
            <span className="pb-meta-item"><i className="ph ph-folder" /> Pront: <strong>{fmt(limpar(p.prontuario_numero))}</strong></span>
            {(idade || nasc) && <span className="pb-meta-item"><i className="ph ph-user" /> {idade ? `${idade}${String(idade).includes('ano') ? '' : ' anos'}` : ''}{nasc ? ` (${nasc})` : ''}</span>}
            {cns && <span className="pb-meta-item"><i className="ph ph-identification-badge" /> CNS: <strong>{cns}</strong></span>}
            {sexo && <span className="pb-meta-item"><i className={'ph ' + (sexo === 'Feminino' ? 'ph-gender-female' : 'ph-gender-male')} /> {sexo}</span>}
            {sv && (
              <span className="pb-meta-item"><i className="ph ph-heartbeat" />
                <strong>PA:</strong>&nbsp;{sv.pa_sistolica && sv.pa_diastolica ? `${sv.pa_sistolica}/${sv.pa_diastolica} mmHg` : '—'} · <strong>FC:</strong>&nbsp;{sv.fc ? `${sv.fc} bpm` : '—'} · <strong>SpO₂:</strong>&nbsp;{sv.spo2 ? `${sv.spo2}%` : '—'}
              </span>
            )}
          </div>
          <div className="pb-hd">
            <strong>HD Principal:</strong> {fmt(hd)} · Caráter: <strong>{fmt(a.carater)}</strong> · Convênio: <strong>{fmt(a.convenio)}</strong>
          </div>
        </div>
        <div className="pb-right">
          {classif && <span className="pb-classificacao" style={{ background: classif.cor, color: classif.texto }}>Classificação: {classif.nome}</span>}
          <div className="pb-leito"><i className="ph ph-bed" /> {[setor, leito && `Leito ${String(leito).padStart(2, '0')}`].filter(Boolean).join(' — ') || '—'}</div>
          <button type="button" className="btn-expand-details" onClick={() => setAberto((v) => !v)}>
            <i className={'ph ph-caret-' + (aberto ? 'up' : 'down')} /> {aberto ? 'Ocultar Ficha Completa' : 'Exibir Ficha Completa'}
          </button>
        </div>
      </div>
      {aberto && (
        <div className="pb-details">
          <div className="detail-item"><label>Nome da Mãe</label><span>{fmt(p.nome_mae)}</span></div>
          <div className="detail-item"><label>RG / CPF</label><span>{[p.rg, p.cpf].filter(Boolean).join(' — ') || '—'}</span></div>
          <div className="detail-item"><label>CNS (Cartão SUS)</label><span>{fmt(p.cns)}</span></div>
          <div className="detail-item"><label>Nacionalidade / Raça</label><span>{[p.nacionalidade, p.raca_cor].filter(Boolean).join(' · ') || '—'}</span></div>
          <div className="detail-item"><label>Endereço Completo</label><span>{[p.endereco, p.endereco_numero, p.bairro, p.cidade].filter(Boolean).join(', ') || '—'}</span></div>
          <div className="detail-item"><label>Telefone Contato</label><span>{fmt(p.telefone || p.telefone_contato)}</span></div>
          <div className="detail-item"><label>Data Admissão</label><span>{a.criado_em ? new Date(a.criado_em).toLocaleString('pt-BR') : '—'}</span></div>
          <div className="detail-item"><label>Enfermeiro Admissão</label><span>{fmt(enfAdmissao)}</span></div>
        </div>
      )}
    </div>
  );
}
