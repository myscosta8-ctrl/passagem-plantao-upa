import BotaoInvalidar, { SeloSituacao } from '../../../components/InvalidarDocumento'
import { textoValidade } from '../../../lib/prescricaoValidade'
import { precisaAtm, itensControlados } from '../../../lib/documentosVinculados'

// Prescrições anteriores do atendimento: reimprimir, duplicar, reimprimir ATM/Controle Especial,
// continuar o próprio rascunho e invalidar.
export default function HistoricoPrescricoes({ historico, catalogo, medicoId, onImprimir, onDuplicar, onReimprimirVinculado, onEditarRascunho, onAtualizar }) {
  return (
    <>
      {historico.map((p) => (
        <div key={p.id} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 12, marginBottom: 12, fontSize: 'var(--fs-xs)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>
              {(p.prescricao_itens ?? []).map((it) => it.medicamento_nome).join(', ')}
            </span>
            <span style={{ fontSize: 'var(--fs-xs)', color: p.status === 'cancelada' ? '#DC2626' : 'var(--text-muted)' }}>
              {p.situacao === 'invalido' ? 'invalidada' : p.status}
            </span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)', marginTop: 4 }}>
            Prescrito por {p.enfermeiros?.nome_exibicao || p.enfermeiros?.nome} • {new Date(p.criado_em).toLocaleString('pt-BR')}
            {p.data_referencia && <> • <strong>Válida {textoValidade(p.data_referencia, p.criado_em)}</strong></>}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" className="btn-save-draft" style={{ padding: '4px 10px', fontSize: 'var(--fs-xs)' }} onClick={() => onImprimir(p)}>
              <i className="ph ph-printer" /> Reimprimir
            </button>
            <button type="button" className="btn-save-draft" style={{ padding: '4px 10px', fontSize: 'var(--fs-xs)' }} onClick={() => onDuplicar(p)} title="Copia medicamentos, dieta e orientações para uma nova prescrição">
              <i className="ph ph-copy" /> Duplicar
            </button>
            {onReimprimirVinculado && p.situacao === 'finalizado' && precisaAtm(p) && (
              <button type="button" className="btn-save-draft" style={{ padding: '4px 10px', fontSize: 'var(--fs-xs)' }} onClick={() => onReimprimirVinculado('atm', p)} title="Reimprimir a Ficha de ATM desta prescrição">
                <i className="ph ph-shield-warning" /> ATM
              </button>
            )}
            {onReimprimirVinculado && p.situacao === 'finalizado' && itensControlados(p, catalogo).length > 0 && (
              <button type="button" className="btn-save-draft" style={{ padding: '4px 10px', fontSize: 'var(--fs-xs)' }} onClick={() => onReimprimirVinculado('controle', p)} title="Reimprimir a Receita de Controle Especial desta prescrição">
                <i className="ph ph-seal-warning" /> Controle Especial
              </button>
            )}
            {p.situacao === 'rascunho' && p.autor_auth === medicoId && (
              <button type="button" className="btn-save-draft" style={{ padding: '4px 10px', fontSize: 'var(--fs-xs)' }} onClick={() => onEditarRascunho(p)} title="Abrir este rascunho no formulário para continuar editando">
                <i className="ph ph-pencil-simple" /> Editar rascunho
              </button>
            )}
            <SeloSituacao registro={p} />
            <BotaoInvalidar tabela="prescricoes_medicas" registro={p} meuId={medicoId} onFeito={onAtualizar} />
          </div>
        </div>
      ))}
    </>
  )
}
