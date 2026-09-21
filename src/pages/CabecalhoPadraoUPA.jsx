// Cabeçalho padrão de todos os documentos da UPA (mesmo timbre + tabela de
// identificação usada na Prescrição Médica) — reaproveitado em qualquer
// documento novo (Prontuário Médico e Prontuário de Enfermagem). Exceções
// que mantêm cabeçalho próprio: APAC, Solicitação de Sangue (hemoterápico),
// SINAN e AIH.

// Prontuário/Registro vêm às vezes com prefixo interno ("PEP-", "AT-") que
// não deve aparecer no papel impresso — só o número.
function limparPrefixo(valor) {
  return valor ? String(valor).replace(/^(PEP|AT)-?/i, '') : ''
}

export default function CabecalhoPadraoUPA({ titulo, pessoa = {}, atendimento = {}, idade, leitoNumero, setorNome, medico, profissional, profissionalRotulo, dataHora }) {
  const nascimento = pessoa.data_nascimento ? new Date(pessoa.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : ''
  const prof = profissional || medico
  const rotuloProf = profissionalRotulo || (medico ? 'MÉDICO RESPONSÁVEL:' : 'PROFISSIONAL RESPONSÁVEL:')
  const docConselho = prof?.crm ? `CRM: ${prof.crm}` : (prof?.coren ? `COREN: ${prof.coren}` : '')

  return (
    <>
      <div className="pr-topo">
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
      </div>
      <hr className="pr-topo-hr" />

      <div className="pr-titulo">{titulo}</div>

      <div className="pr-info">
        <div className="pr-linha">
          <div className="pr-campo" style={{ flexBasis: '12%' }}><b>PRONTUÁRIO:</b> {limparPrefixo(pessoa.prontuario_numero)}</div>
          <div className="pr-campo" style={{ flexBasis: '10%' }}><b>REGISTRO:</b> {limparPrefixo(atendimento?.numero_atendimento)}</div>
          <div className="pr-campo" style={{ flexBasis: '19%' }}><b>RECEPÇÃO:</b> {atendimento?.tipo_entrada || ''}</div>
          <div className="pr-campo" style={{ flexBasis: '29%' }}><b>DATA INTERNAÇÃO:</b> {atendimento?.criado_em ? new Date(atendimento.criado_em).toLocaleString('pt-BR') : ''}</div>
          <div className="pr-campo" style={{ flexBasis: '30%' }}><b>DATA ALTA:</b> {atendimento?.encerrado_em ? new Date(atendimento.encerrado_em).toLocaleString('pt-BR') : ''}</div>
        </div>
        <div className="pr-linha">
          <div className="pr-campo" style={{ flexBasis: '50%' }}><b>PACIENTE:</b> {pessoa.nome}</div>
          <div className="pr-campo" style={{ flexBasis: '25%' }}><b>CARÁTER:</b> {atendimento?.carater || 'Urgência'}</div>
          <div className="pr-campo" style={{ flexBasis: '25%' }}><b>CONVÊNIO:</b> {atendimento?.convenio || 'SUS'}</div>
        </div>
        <div className="pr-linha">
          <div className="pr-campo" style={{ flexBasis: '42%' }}><b>MÃE:</b> {pessoa.nome_mae || ''}</div>
          <div className="pr-campo" style={{ flexBasis: '13%' }}><b>SEXO:</b> {pessoa.sexo === 'F' ? 'Feminino' : pessoa.sexo === 'M' ? 'Masculino' : ''}</div>
          <div className="pr-campo" style={{ flexBasis: '25%' }}><b>NACIONALIDADE:</b> Brasil</div>
          <div className="pr-campo" style={{ flexBasis: '20%' }}><b>RAÇA:</b> </div>
        </div>
        <div className="pr-linha">
          <div className="pr-campo" style={{ flexBasis: '17%' }}><b>R.G.:</b> </div>
          <div className="pr-campo" style={{ flexBasis: '23%' }}><b>C.P.F.:</b> {pessoa.cpf || ''}</div>
          <div className="pr-campo" style={{ flexBasis: '30%' }}><b>C.N.S.:</b> {pessoa.cns || ''}</div>
          <div className="pr-campo" style={{ flexBasis: '15%' }}><b>DATA NASC.:</b> {nascimento}</div>
          <div className="pr-campo" style={{ flexBasis: '15%' }}><b>IDADE:</b> {idade ? `${idade} anos` : ''}</div>
        </div>
        <div className="pr-linha">
          <div className="pr-campo" style={{ flexBasis: '75%' }}><b>ENDEREÇO:</b> {[pessoa.endereco, pessoa.endereco_numero, pessoa.bairro, pessoa.cidade].filter(Boolean).join(', ')}</div>
          <div className="pr-campo" style={{ flexBasis: '25%' }}><b>TELEFONE:</b> {pessoa.telefone || ''}</div>
        </div>
        <div className="pr-linha">
          <div className="pr-campo" style={{ flexBasis: '65%' }}>
            <b>{rotuloProf}</b> {prof?.nome_exibicao || prof?.nome || ''} {docConselho ? <>&nbsp; <b>{docConselho}</b></> : ''}
          </div>
          <div className="pr-campo" style={{ flexBasis: '35%' }}><b>ALERGIA:</b> Nenhuma informada</div>
        </div>
        <div className="pr-linha">
          <div className="pr-campo" style={{ flexBasis: '15%' }}><b>LEITO:</b> {leitoNumero || ''}</div>
          <div className="pr-campo" style={{ flexBasis: '35%' }}><b>SETOR:</b> {setorNome || ''}</div>
          <div className="pr-campo" style={{ flexBasis: '35%' }}><b>UNIDADE:</b> UPA 24h Breves</div>
          <div className="pr-campo" style={{ flexBasis: '15%' }}><b>PESO:</b> </div>
        </div>
      </div>
    </>
  )
}
