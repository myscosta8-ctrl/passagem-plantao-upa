import { lazy } from 'react'
import Painel from '../Painel'
import PassagemColetivaTela from '../PassagemColetivaTela'
import { Carregando } from './Carregando'

// Telas carregadas sob demanda via React.lazy (Code-Splitting)
const PrintView = lazy(() => import('../PrintView'))
const Ajuda = lazy(() => import('../Ajuda'))
const MinhaConta = lazy(() => import('../MinhaConta'))
const AltasRecentes = lazy(() => import('../AltasRecentes'))
const Pendencias = lazy(() => import('../Pendencias'))
const IndicadoresPainel = lazy(() => import('../IndicadoresPainel'))
const CompartilharPlantao = lazy(() => import('../CompartilharPlantao'))
const PainelEquipe = lazy(() => import('../PainelEquipe'))
const GerenciarProfissionais = lazy(() => import('../GerenciarProfissionais'))
const CadastroPacientes = lazy(() => import('../CadastroPacientes'))

// Área de uma tela: fica escondida (não desmontada) quando outra tela está aberta.
function Area({ ativa, children }) {
  return <div style={{ display: ativa ? 'flex' : 'none', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0, overflowY: 'auto' }}>{children}</div>
}

// Telas da enfermagem. Cada uma só é montada (e só busca dados) quando é aberta; Painel,
// Passagem e Recepção ficam vivas depois da 1ª visita (`visitadas`); as demais recarregam a cada visita.
export default function TelasEnfermagem({ tela, setTela, visitadas, plantao, setoresIds, podeAdministrar, focoProfissional, setFocoProfissional }) {
  return (
    <>

      <Area ativa={tela === 'ajuda'}>
        {tela === 'ajuda' && <Ajuda onVoltar={() => setTela('painel')} />}
      </Area>

      <Area ativa={tela === 'conta'}>
        {tela === 'conta' && <MinhaConta onVoltar={() => setTela('painel')} />}
      </Area>

      <Area ativa={tela === 'recepcao'}>
        {visitadas.has('recepcao') && <CadastroPacientes onVoltar={() => setTela('painel')} />}
      </Area>

      {(!plantao && tela !== 'conta' && tela !== 'recepcao' && tela !== 'ajuda') && (
        <Carregando texto="Não foi possível abrir o plantão. Verifique a conexão e recarregue a página." />
      )}

      {plantao && setoresIds && (
        <>
          <Area ativa={tela === 'painel'}>
            {visitadas.has('painel') && <Painel plantao={plantao} setoresIds={setoresIds} />}
          </Area>
          
          <Area ativa={tela === 'passagemColetiva'}>
            {visitadas.has('passagemColetiva') && <PassagemColetivaTela plantao={plantao} setoresIds={setoresIds} onImprimir={setTela} onCompartilhar={() => setTela('compartilhar')} onVoltar={() => setTela('painel')} />}
          </Area>

          <Area ativa={tela === 'print1'}>
            {tela === 'print1' && <PrintView plantao={plantao} grupo="grupo1" onVoltar={() => setTela('passagemColetiva')} />}
          </Area>

          <Area ativa={tela === 'print2'}>
            {tela === 'print2' && <PrintView plantao={plantao} grupo="grupo2" onVoltar={() => setTela('passagemColetiva')} />}
          </Area>

          <Area ativa={tela === 'altas'}>
            {tela === 'altas' && <AltasRecentes onVoltar={() => setTela('painel')} />}
          </Area>

          <Area ativa={tela === 'indicadoresClinicos'}>
            {tela === 'indicadoresClinicos' && <IndicadoresPainel onVoltar={() => setTela('painel')} />}
          </Area>

          <Area ativa={tela === 'pendencias'}>
            {tela === 'pendencias' && <Pendencias plantao={plantao} onVoltar={() => setTela('painel')} />}
          </Area>

          <Area ativa={tela === 'compartilhar'}>
            {tela === 'compartilhar' && <CompartilharPlantao plantao={plantao} onVoltar={() => setTela('passagemColetiva')} />}
          </Area>

          {podeAdministrar && (
            <>
              <Area ativa={tela === 'equipe'}>
                {tela === 'equipe' && <PainelEquipe onVoltar={() => setTela('painel')} podeAdministrar={podeAdministrar} onGerenciar={(id) => { setFocoProfissional(id); setTela('profissionais') }} />}
              </Area>

              <Area ativa={tela === 'profissionais'}>
                {tela === 'profissionais' && <GerenciarProfissionais onVoltar={() => setTela('painel')} focoId={focoProfissional} onAbrirEquipe={() => setTela('equipe')} />}
              </Area>
            </>
          )}
        </>
      )}
    </>
  )
}
