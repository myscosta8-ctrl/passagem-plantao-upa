const fs = require('fs');

let content = fs.readFileSync('src/pages/painel/usePainelState.js', 'utf8');

// Add react-query imports
content = content.replace(
  "import { useState, useEffect, useRef } from 'react'",
  "import { useState, useRef } from 'react'\nimport { useQuery, useQueryClient } from '@tanstack/react-query'"
);

// Replace state declarations and useEffect with useQuery
const newQueryLogic = `
  const queryClient = useQueryClient()
  const pepAtivoRef = useRef(false)

  const { data: painelData, isLoading: carregando, refetch: carregarTudo } = useQuery({
    queryKey: ['painelDados', enfermeiro?.id],
    queryFn: async () => {
      const pepAtivo = await pepEstaAtivo(enfermeiro?.id)
      pepAtivoRef.current = pepAtivo

      const { data: listaSetores } = await supabase.from('setores').select('*').order('ordem')
      const { data: listaLeitos } = await supabase.from('leitos').select('*').eq('ativo', true).order('id')

      const setoresOficiais = (listaSetores ?? []).filter((s) => [1, 2, 3, 4].includes(s.id))
      const finalSetores = setoresOficiais.length > 0 ? setoresOficiais : (listaSetores ?? [])

      if (pepAtivo) {
        const { pacientesPorLeito: mapa, passagemPorPaciente: passagemMapa } = await carregarLeitosOcupadosPep()
        
        const extrasDesocupados = (listaLeitos ?? []).filter((l) => l.tipo === 'extra' && !mapa[l.id])
        if (extrasDesocupados.length > 0) {
          const idsDesocupados = extrasDesocupados.map((l) => l.id)
          await supabase.from('leitos').delete().in('id', idsDesocupados)
        }

        const leitosFiltrados = (listaLeitos ?? []).filter((l) => {
          if (l.id <= 36) return true
          if (l.tipo === 'extra' && mapa[l.id]) return true
          return false
        })

        const atendimentoIds = Object.values(mapa).map((p) => p.id)
        const [svMapa, balancoMapa] = await Promise.all([
          listarUltimosSinaisVitaisPorAtendimentos(atendimentoIds),
          listarBalancoPorAtendimentos(atendimentoIds),
        ])

        return {
          setores: finalSetores,
          leitos: leitosFiltrados,
          pacientesPorLeito: mapa || {},
          passagemPorPaciente: passagemMapa || {},
          sinaisVitaisPorPaciente: svMapa || {},
          balancoPorPaciente: balancoMapa || {}
        }
      }

      const { data: listaPacientes } = await supabase
        .from('pacientes')
        .select('*, ultima_alteracao_por_enfermeiro:enfermeiros!ultima_alteracao_por(nome_exibicao, nome)')
        .eq('status', 'internado')

      const mapa = {}
      for (const p of listaPacientes ?? []) {
        if (p.leito_atual_id) mapa[p.leito_atual_id] = p
      }

      const extrasDesocupados = (listaLeitos ?? []).filter((l) => l.tipo === 'extra' && !mapa[l.id])
      if (extrasDesocupados.length > 0) {
        const idsDesocupados = extrasDesocupados.map((l) => l.id)
        await supabase.from('leitos').delete().in('id', idsDesocupados)
      }

      const leitosFiltrados = (listaLeitos ?? []).filter((l) => {
        if (l.id <= 36) return true
        if (l.tipo === 'extra' && mapa[l.id]) return true
        return false
      })

      let passagemMapa = {}
      const ids = (listaPacientes ?? []).map((p) => p.id)
      if (ids.length > 0) {
        const { data: passagens } = await supabase
          .from('passagens')
          .select('*, enfermeiros!passagens_criado_por_fkey(nome_exibicao, nome)')
          .in('paciente_id', ids)
          .order('criado_em', { ascending: false })
        for (const p of passagens ?? []) {
          if (!passagemMapa[p.paciente_id]) passagemMapa[p.paciente_id] = p
        }
      }

      return {
        setores: finalSetores,
        leitos: leitosFiltrados,
        pacientesPorLeito: mapa || {},
        passagemPorPaciente: passagemMapa || {},
        sinaisVitaisPorPaciente: {},
        balancoPorPaciente: {}
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  })

  const setores = painelData?.setores || []
  const leitos = painelData?.leitos || []
  const pacientesPorLeito = painelData?.pacientesPorLeito || {}
  const passagemPorPaciente = painelData?.passagemPorPaciente || {}
  const sinaisVitaisPorPaciente = painelData?.sinaisVitaisPorPaciente || {}
  const balancoPorPaciente = painelData?.balancoPorPaciente || {}
`;

// Now we need to carefully replace the old states and carregarTudo
const oldStateBlockRegex = /const \[setores, setSetores\] = useState\(\[\]\).*?const pepAtivoRef = useRef\(false\)/s;
content = content.replace(oldStateBlockRegex, 
`  const [modalLeito, setModalLeito] = useState(null)
  const [erroInternar, setErroInternar] = useState('')
  const [erroGeral, setErroGeral] = useState('')
  const [modalPassagem, setModalPassagem] = useState(null)
  const [modalRealocar, setModalRealocar] = useState(null)
  const [menuAcoesLeitoId, setMenuAcoesLeitoId] = useState(null)
  const [visualizacao, setVisualizacao] = useState('cards')
  const [buscaTabela, setBuscaTabela] = useState('')
  const [setorFiltro, setSetorFiltro] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
` + newQueryLogic);

const oldCarregarTudoRegex = /useEffect\(\(\) => \{\s*carregarTudo\(\)\s*\}, \[\]\).*?async function carregarTudo\(\) \{.*?\n  \}/s;
content = content.replace(oldCarregarTudoRegex, '');

// Update mutations to use queryClient.setQueryData instead of setters
content = content.replace(
  /setLeitos\(\(prev\) => \[\.\.\.prev, novo\]\)/g,
  `queryClient.setQueryData(['painelDados', enfermeiro?.id], (old) => ({ ...old, leitos: [...(old?.leitos || []), novo] }))`
);

content = content.replace(
  /setLeitos\(\(prev\) => prev\.filter\(\(l\) => l\.id !== extraId\)\)/g,
  `queryClient.setQueryData(['painelDados', enfermeiro?.id], (old) => ({ ...old, leitos: (old?.leitos || []).filter(l => l.id !== extraId) }))`
);

content = content.replace(
  /setPacientesPorLeito\(\(prev\) => \(\{ \.\.\.prev, \[leito\.id\]: novo \}\)\)/g,
  `queryClient.setQueryData(['painelDados', enfermeiro?.id], (old) => ({ ...old, pacientesPorLeito: { ...(old?.pacientesPorLeito || {}), [leito.id]: novo } }))`
);

fs.writeFileSync('src/pages/painel/usePainelState.js', content, 'utf8');
console.log('Fixed usePainelState.js');
