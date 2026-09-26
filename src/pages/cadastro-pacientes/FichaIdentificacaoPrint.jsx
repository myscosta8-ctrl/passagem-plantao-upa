import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import './FichaIdentificacaoPrint.css'

// Ficha de Identificação do Paciente e Termos — modelos_impressao_html/
// 22-ficha-identificacao-termos.html. Mesma estrutura e textos do modelo;
// só entram dados reais do cadastro (campo vazio fica em branco).
function limparPrefixo(v) {
  return v ? String(v).replace(/^(PEP|AT)-?/i, '') : ''
}

function idadeDe(nasc) {
  if (!nasc) return ''
  const [a, m, d] = nasc.split('-').map(Number)
  const hoje = new Date()
  let idade = hoje.getFullYear() - a
  if (hoje.getMonth() + 1 < m || (hoje.getMonth() + 1 === m && hoje.getDate() < d)) idade -= 1
  return Number.isFinite(idade) && idade >= 0 ? `${idade} anos` : ''
}

export default function FichaIdentificacaoPrint({ dados: d, onFechar }) {
  useEffect(() => {
    document.body.classList.add('fi-imprimindo')
    return () => document.body.classList.remove('fi-imprimindo')
  }, [])

  const nascimento = d.data_nascimento ? d.data_nascimento.split('-').reverse().join('/') : ''
  const endereco = [d.endereco, d.endereco_numero, d.bairro, d.cidade].filter(Boolean).join(', ')
  const sexo = d.sexo === 'F' ? 'Feminino' : d.sexo === 'M' ? 'Masculino' : ''
  const resp = d.responsavel || {}

  function blocoAssinatura() {
    return (
      <>
        <div className="termo-data">Breves/PA, _______ de ___________________________ de 20____.</div>
        <div className="assinatura-principal">
          <div className="sig-line-main" />
          <div className="sig-label">Assinatura do Responsável pelo Paciente (ou próprio paciente){resp.nome ? ` — ${resp.nome}` : ''}</div>
          <div className="sig-dados">
            <div style={{ flex: 1 }}>N.º R.G.: {resp.rg || ''}</div>
            <div style={{ flex: 1.5 }}>Relação com o paciente: {resp.relacao || ''}</div>
          </div>
          <div className="sig-dados">
            <div style={{ flex: 1 }}>Endereço: {resp.endereco || ''}</div>
          </div>
          <div className="sig-obs">Observação: Assinatura do responsável ou do próprio paciente, se lúcido e for maior de idade.</div>
        </div>
        <div className="testemunhas-grid">
          {[0, 1].map((i) => (
            <div key={i} className="testemunha-box">
              <div className="sig-line-test" />
              <div className="sig-label">Testemunha</div>
              <div className="sig-label" style={{ fontWeight: 'normal', marginTop: 2 }}>(R.G.: ___________________________)</div>
            </div>
          ))}
        </div>
      </>
    )
  }

  return createPortal(
    <div className="fi-overlay">
      <div className="fi-toolbar">
        <h1>Ficha de Identificação e Termos</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="fi-btn" onClick={onFechar}>Fechar</button>
          <button type="button" className="fi-btn primario" onClick={() => window.print()}>Imprimir</button>
        </div>
      </div>

      <div className="fi-page">
        <header className="pr-topo">
          <div className="pr-topo-texto">
            <div className="nome">PREFEITURA MUNICIPAL DE BREVES — UPA 24H BREVES</div>
            <div className="sub">SECRETARIA MUNICIPAL DE SAÚDE (SEMSA)</div>
            <div className="sub">TRAVESSA CASTILHOS FRANÇA, S/N — BREVES/PA — CEP 68.800-000 — CNPJ: 02.967.963/0001-11 — FONE/FAX: (91) 3783-1279</div>
          </div>
          <div className="pr-topo-logos">
            <img src="./logos/brasao-breves.jpg" alt="Prefeitura de Breves" />
            <img src="./logos/semsa.jpg" alt="SEMSA" />
            <img src="./logos/upa24h.jpg" alt="UPA 24h" />
          </div>
        </header>
        <hr className="pr-topo-hr" />
        <div className="pr-titulo">FICHA DE IDENTIFICAÇÃO DO PACIENTE E TERMOS</div>

        <div className="pr-info">
          <div className="pr-linha">
            <div className="pr-campo" style={{ flexBasis: '15%' }}><b>PRONTUÁRIO:</b><br /><span>{limparPrefixo(d.prontuario_numero)}</span></div>
            <div className="pr-campo" style={{ flexBasis: '15%' }}><b>REGISTRO:</b><br /><span>{limparPrefixo(d.numero_atendimento)}</span></div>
            <div className="pr-campo" style={{ flexBasis: '25%' }}><b>RECEPÇÃO:</b> <span>{d.tipo_entrada || ''}</span></div>
            <div className="pr-campo" style={{ flexBasis: '25%' }}><b>DATA INTERNAÇÃO:</b> <span>{d.data_internacao ? new Date(d.data_internacao).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span></div>
            <div className="pr-campo" style={{ flexBasis: '20%' }}><b>DATA ALTA:</b> <span>Em aberto</span></div>
          </div>
          <div className="pr-linha">
            <div className="pr-campo" style={{ flexBasis: '50%' }}><b>PACIENTE:</b> <span>{d.nome || ''}</span></div>
            <div className="pr-campo" style={{ flexBasis: '25%' }}><b>CARÁTER:</b> <span>Urgência</span></div>
            <div className="pr-campo" style={{ flexBasis: '25%' }}><b>CONVÊNIO:</b> <span>SUS</span></div>
          </div>
          <div className="pr-linha">
            <div className="pr-campo" style={{ flexBasis: '40%' }}><b>MÃE:</b> <span>{d.nome_mae || ''}</span></div>
            <div className="pr-campo" style={{ flexBasis: '20%' }}><b>SEXO:</b> <span>{sexo}</span></div>
            <div className="pr-campo" style={{ flexBasis: '20%' }}><b>NACIONALIDADE:</b> <span>Brasil</span></div>
            <div className="pr-campo" style={{ flexBasis: '20%' }}><b>RAÇA:</b> <span>{d.raca_cor || ''}</span></div>
          </div>
          <div className="pr-linha">
            <div className="pr-campo" style={{ flexBasis: '20%' }}><b>R.G.:</b> <span>{d.rg || ''}</span></div>
            <div className="pr-campo" style={{ flexBasis: '20%' }}><b>C.P.F.:</b> <span>{d.cpf || ''}</span></div>
            <div className="pr-campo" style={{ flexBasis: '30%' }}><b>C.N.S.:</b> <span>{d.cns || ''}</span></div>
            <div className="pr-campo" style={{ flexBasis: '15%' }}><b>DATA NASC.:</b><br /><span>{nascimento}</span></div>
            <div className="pr-campo" style={{ flexBasis: '15%' }}><b>IDADE:</b><br /><span>{idadeDe(d.data_nascimento)}</span></div>
          </div>
          <div className="pr-linha">
            <div className="pr-campo" style={{ flexBasis: '75%' }}><b>ENDEREÇO:</b> <span>{endereco}</span></div>
            <div className="pr-campo" style={{ flexBasis: '25%' }}><b>TELEFONE:</b> <span>{d.telefone || ''}</span></div>
          </div>
          <div className="pr-linha">
            <div className="pr-campo" style={{ flexBasis: '65%' }}><b>MÉDICO NOTIFICANTE:</b> <span>{d.medico || ''}</span></div>
            <div className="pr-campo" style={{ flexBasis: '35%' }}><b>ALERGIA:</b> <span>{d.alergias || ''}</span></div>
          </div>
          <div className="pr-linha">
            <div className="pr-campo" style={{ flexBasis: '15%' }}><b>LEITO:</b> <span>{d.leito_numero || ''}</span></div>
            <div className="pr-campo" style={{ flexBasis: '35%' }}><b>SETOR:</b> <span>{d.setor_nome || ''}</span></div>
            <div className="pr-campo" style={{ flexBasis: '35%' }}><b>UNIDADE:</b> <span>UPA 24h Breves</span></div>
            <div className="pr-campo" style={{ flexBasis: '15%' }}><b>PESO:</b> <span>{d.peso || ''}</span></div>
          </div>
          <div className="pr-linha" style={{ background: '#f8fafc' }}>
            <div className="pr-campo" style={{ flexBasis: '65%' }}><b>NOME DO RESP. P/ PREENCHIMENTO (RECEPÇÃO):</b> <span>{d.responsavel_recepcao || ''}</span></div>
            <div className="pr-campo" style={{ flexBasis: '35%' }}><b>CARGO / FUNÇÃO:</b> <span>Recepcionista</span></div>
          </div>
        </div>

        <div className="termo-secao">
          <div className="termo-titulo">DECLARAÇÃO / AUTORIZAÇÃO / TERMO DE RESPONSABILIDADE</div>
          <div className="termo-corpo">
            <p>Através da presente declaro de livre e espontânea vontade, para os fins se fizerem necessários que:</p>
            <p>1 – Solicitei e autorizo a internação de: <strong>{d.nome || '_______________________________'}</strong> para tratamento no Hospital Municipal &quot;Maria Santana Rocha Franco&quot; / UPA 24h Breves.</p>
            <p>2 – Que autorizo a equipe médica do Hospital a realizar quaisquer tipos de exames e tratamentos que vierem a ser necessários, inclusive transfusões de sangue, anestesias e cirurgias.</p>
            <p>3 – Que assumo o compromisso de comparecer ao Hospital sempre que solicitado, e também de retirar imediatamente o paciente quando autorizada sua saída ou caso ocorra óbito.</p>
            {blocoAssinatura()}
          </div>
        </div>

        <div className="termo-secao" style={{ marginBottom: 0 }}>
          <div className="termo-titulo">REQUERIMENTO DE ALTA / TERMO DE RESPONSABILIDADE (ALTA A PEDIDO)</div>
          <div className="termo-corpo">
            <p>Através deste venho requerer a saída imediata do Hospital do(a) Sr.(a) <strong>{d.nome || '_______________________________'}</strong>. Apesar da opinião contrária do médico assistente, Dr.(a) <strong>{d.medico || '_______________________________'}</strong>, razão pela qual isento o referido médico e o Hospital Municipal de Breves de qualquer responsabilidade pelas consequências que possam resultar desta minha decisão. Declaro ainda que me foram dados amplos esclarecimentos sobre os riscos existentes decorrentes da não continuidade do tratamento.</p>
            {blocoAssinatura()}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
