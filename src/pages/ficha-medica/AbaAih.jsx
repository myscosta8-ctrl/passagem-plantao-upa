import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { listarAih, criarAih } from '../../lib/pepMedico';
import { AIH_VAZIA, VINCULO_PREVIDENCIA_OPCOES } from './constantes';

export default function AbaAih({ atendimento, medicoId, onImprimir }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [dados, setDados] = useState(AIH_VAZIA)
  const [cids, setCids] = useState([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { carregar(); carregarCids() }, [])

  async function carregar() {
    setCarregando(true)
    setHistorico(await listarAih(atendimento.atendimento_id))
    setCarregando(false)
  }

  async function carregarCids() {
    const { data } = await supabase.from('cid_catalog').select('codigo, descricao').order('codigo')
    setCids(data ?? [])
  }

  function set(campo, valor) {
    setDados((prev) => ({ ...prev, [campo]: valor }))
  }

  async function salvar() {
    if (!dados.procedimento_principal_nome.trim() || !dados.sinais_sintomas_clinicos.trim() || !dados.diagnostico_inicial_texto.trim()) {
      setErro('Preencha ao menos o procedimento, os sinais/sintomas clínicos e o diagnóstico inicial.')
      return
    }
    setErro('')
    setSalvando(true)
    const { error } = await criarAih({
      atendimentoId: atendimento.atendimento_id,
      pessoaId: atendimento.pessoa_id,
      solicitanteId: medicoId,
      dados,
    })
    setSalvando(false)
    if (error) {
      setErro('Não foi possível salvar. Tente de novo.')
      return
    }
    setDados(AIH_VAZIA)
    carregar()
  }

  return (
    <div className="form-section">
      <div className="form-section-title">Nova solicitação de AIH</div>
      <div className="form-grid">
        <div style={{ gridColumn: '1 / -1', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Identificação do estabelecimento de saúde</div>
        <div className="form-field span-2">
          <label>Estabelecimento solicitante</label>
          <input type="text" value={dados.estabelecimento_solicitante_nome} onChange={(e) => set('estabelecimento_solicitante_nome', e.target.value)} />
        </div>
        <div className="form-field">
          <label>CNES solicitante</label>
          <input type="text" value={dados.estabelecimento_solicitante_cnes} onChange={(e) => set('estabelecimento_solicitante_cnes', e.target.value)} />
        </div>
        <div className="form-field span-2">
          <label>Estabelecimento executante</label>
          <input type="text" value={dados.estabelecimento_executante_nome} onChange={(e) => set('estabelecimento_executante_nome', e.target.value)} />
        </div>
        <div className="form-field">
          <label>CNES executante</label>
          <input type="text" value={dados.estabelecimento_executante_cnes} onChange={(e) => set('estabelecimento_executante_cnes', e.target.value)} />
        </div>

        <div style={{ gridColumn: '1 / -1', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: 8 }}>Identificação do paciente — complemento</div>
        <div className="form-field">
          <label>Etnia (se indígena)</label>
          <input type="text" value={dados.etnia} onChange={(e) => set('etnia', e.target.value)} />
        </div>
        <div className="form-field span-2">
          <label>Nome do responsável</label>
          <input type="text" value={dados.nome_responsavel} onChange={(e) => set('nome_responsavel', e.target.value)} />
        </div>
        <div className="form-field">
          <label>UF de residência</label>
          <input type="text" maxLength={2} value={dados.municipio_residencia_uf} onChange={(e) => set('municipio_residencia_uf', e.target.value.toUpperCase())} />
        </div>
        <div className="form-field">
          <label>CEP</label>
          <input type="text" value={dados.municipio_residencia_cep} onChange={(e) => set('municipio_residencia_cep', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Cód. IBGE do município</label>
          <input type="text" value={dados.municipio_residencia_ibge} onChange={(e) => set('municipio_residencia_ibge', e.target.value)} />
        </div>

        <div style={{ gridColumn: '1 / -1', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: 8 }}>Procedimento solicitado</div>
        <div className="form-field span-2">
          <label>Procedimento solicitado *</label>
          <input type="text" value={dados.procedimento_principal_nome} onChange={(e) => set('procedimento_principal_nome', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Código do procedimento</label>
          <input type="text" value={dados.procedimento_principal_codigo} onChange={(e) => set('procedimento_principal_codigo', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Clínica</label>
          <input type="text" placeholder="ex: UTI Adulto, Clínica Médica" value={dados.clinica} onChange={(e) => set('clinica', e.target.value)} />
        </div>
        <div className="form-field span-2">
          <label>Caráter da internação</label>
          <div className="toggle-group" style={{ maxWidth: 220 }}>
            {['URGENCIA', 'ELETIVA'].map((op) => (
              <button
                key={op}
                type="button"
                className={`toggle-btn ${dados.carater_internacao === op ? 'on' : ''}`}
                onClick={() => set('carater_internacao', op)}
              >
                {op === 'URGENCIA' ? 'Urgência' : 'Eletiva'}
              </button>
            ))}
          </div>
        </div>
        <div className="form-field">
          <label>Documento do solicitante</label>
          <select value={dados.profissional_documento_tipo} onChange={(e) => set('profissional_documento_tipo', e.target.value)}>
            <option value="CNS">CNS</option>
            <option value="CPF">CPF</option>
          </select>
        </div>
        <div className="form-field span-2">
          <label>Nº do documento</label>
          <input type="text" value={dados.profissional_documento_numero} onChange={(e) => set('profissional_documento_numero', e.target.value)} />
        </div>

        <div className="form-field span-3">
          <label>Principais sinais e sintomas clínicos *</label>
          <textarea value={dados.sinais_sintomas_clinicos} onChange={(e) => set('sinais_sintomas_clinicos', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>Condições que justificam a internação</label>
          <textarea value={dados.condicoes_justificam_internacao} onChange={(e) => set('condicoes_justificam_internacao', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>Principais resultados de provas diagnósticas</label>
          <textarea value={dados.resultados_provas_diagnosticas} onChange={(e) => set('resultados_provas_diagnosticas', e.target.value)} />
        </div>

        <div className="form-field span-3">
          <label>Diagnóstico inicial *</label>
          <input type="text" value={dados.diagnostico_inicial_texto} onChange={(e) => set('diagnostico_inicial_texto', e.target.value)} />
        </div>
        <div className="form-field">
          <label>CID principal</label>
          <select value={dados.cid_principal} onChange={(e) => set('cid_principal', e.target.value)}>
            <option value="">—</option>
            {cids.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo} — {c.descricao}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>CID secundário</label>
          <select value={dados.cid_secundario} onChange={(e) => set('cid_secundario', e.target.value)}>
            <option value="">—</option>
            {cids.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo} — {c.descricao}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>CID causas associadas</label>
          <select value={dados.cid_causas_associadas} onChange={(e) => set('cid_causas_associadas', e.target.value)}>
            <option value="">—</option>
            {cids.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo} — {c.descricao}</option>)}
          </select>
        </div>

        <div style={{ gridColumn: '1 / -1', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: 8 }}>Preencher em caso de causas externas</div>
        <div className="form-field span-3">
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400, flex: '0 0 auto', whiteSpace: 'nowrap' }}>
              <input type="checkbox" checked={dados.causa_externa_transito} onChange={(e) => set('causa_externa_transito', e.target.checked)} style={{ flexShrink: 0 }} />
              Acidente de trânsito
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400, flex: '0 0 auto', whiteSpace: 'nowrap' }}>
              <input type="checkbox" checked={dados.causa_externa_trabalho_tipico} onChange={(e) => set('causa_externa_trabalho_tipico', e.target.checked)} style={{ flexShrink: 0 }} />
              Acidente trabalho típico
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 400, flex: '0 0 auto', whiteSpace: 'nowrap' }}>
              <input type="checkbox" checked={dados.causa_externa_trabalho_trajeto} onChange={(e) => set('causa_externa_trabalho_trajeto', e.target.checked)} style={{ flexShrink: 0 }} />
              Acidente trabalho trajeto
            </label>
          </div>
        </div>
        <div className="form-field">
          <label>CNPJ da seguradora</label>
          <input type="text" value={dados.cnpj_seguradora} onChange={(e) => set('cnpj_seguradora', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Nº do bilhete</label>
          <input type="text" value={dados.numero_bilhete} onChange={(e) => set('numero_bilhete', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Série</label>
          <input type="text" value={dados.serie_bilhete} onChange={(e) => set('serie_bilhete', e.target.value)} />
        </div>
        <div className="form-field">
          <label>CNPJ da empresa</label>
          <input type="text" value={dados.cnpj_empresa} onChange={(e) => set('cnpj_empresa', e.target.value)} />
        </div>
        <div className="form-field">
          <label>CNAE da empresa</label>
          <input type="text" value={dados.cnae_empresa} onChange={(e) => set('cnae_empresa', e.target.value)} />
        </div>
        <div className="form-field">
          <label>CBOR</label>
          <input type="text" value={dados.cbor} onChange={(e) => set('cbor', e.target.value)} />
        </div>
        <div className="form-field span-3">
          <label>Vínculo com a previdência</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {VINCULO_PREVIDENCIA_OPCOES.map((op) => (
              <button
                key={op.valor}
                type="button"
                className={`toggle-btn ${dados.vinculo_previdencia === op.valor ? 'on' : ''}`}
                style={{ flex: '0 0 auto' }}
                onClick={() => set('vinculo_previdencia', dados.vinculo_previdencia === op.valor ? '' : op.valor)}
              >
                {op.rotulo}
              </button>
            ))}
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: 8 }}>
          Autorização (preenchido pelo regulador/auditor)
        </div>
        <div className="form-field span-2">
          <label>Nome do profissional autorizador</label>
          <input type="text" value={dados.autorizador_nome} onChange={(e) => set('autorizador_nome', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Cód. órgão emissor</label>
          <input type="text" value={dados.autorizador_codigo_orgao_emissor} onChange={(e) => set('autorizador_codigo_orgao_emissor', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Documento</label>
          <select value={dados.autorizador_documento_tipo} onChange={(e) => set('autorizador_documento_tipo', e.target.value)}>
            <option value="CNS">CNS</option>
            <option value="CPF">CPF</option>
          </select>
        </div>
        <div className="form-field">
          <label>Nº do documento</label>
          <input type="text" value={dados.autorizador_documento_numero} onChange={(e) => set('autorizador_documento_numero', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Nº da autorização de internação</label>
          <input type="text" value={dados.numero_autorizacao} onChange={(e) => set('numero_autorizacao', e.target.value)} />
        </div>
        <div className="form-field">
          <label>Data da autorização</label>
          <input type="date" value={dados.data_autorizacao} onChange={(e) => set('data_autorizacao', e.target.value)} />
        </div>
      </div>
      {erro && <div className="error-box" style={{ marginTop: 10 }}>{erro}</div>}
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="modal-btn-primary" onClick={salvar} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Registrar solicitação'}
        </button>
      </div>

      <div className="form-section-title" style={{ marginTop: 24 }}>Histórico</div>
      {carregando ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Carregando...</p>
      ) : historico.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma solicitação registrada ainda.</p>
      ) : (
        historico.map((a) => (
          <div key={a.id} style={{ borderBottom: '1px solid var(--color-border)', padding: '10px 0', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{a.procedimento_principal_nome}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                  {a.status} · {a.enfermeiros?.nome_exibicao || a.enfermeiros?.nome} · {new Date(a.criado_em).toLocaleString('pt-BR')}
                </div>
              </div>
              <button type="button" className="modal-btn-secondary" onClick={() => onImprimir(a)}>Imprimir</button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

