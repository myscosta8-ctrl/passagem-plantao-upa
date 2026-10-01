// Escreve as respostas por cima do PDF oficial da ficha SINAN (o papel sai idêntico ao modelo do Ministério).
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { valorEfetivo, camposDe, dataParaPapel } from './modeloUtil'

const so = (s) => String(s ?? '')
// Helvetica padrão (WinAnsi) não tem alguns caracteres; troca por equivalentes seguros.
const limpar = (s) => so(s).replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[–—]/g, '-').replace(/[^\x20-\x7E -ÿ]/g, '')

function caberFonte(font, texto, largura, maximo) {
  let t = maximo
  while (t > 5 && font.widthOfTextAtSize(texto, t) > largura) t -= 0.25
  return t
}

// Texto longo distribuído nas linhas impressas da ficha (ex.: Observações adicionais).
function escreverLinhas(paginas, font, campo, valor) {
  const tam = campo.fonte || 8
  const palavras = limpar(String(valor).toUpperCase()).split(/\s+/).filter(Boolean)
  let i = 0
  for (const c of campo.linhas) {
    let linha = ''
    while (i < palavras.length) {
      const tentativa = linha ? `${linha} ${palavras[i]}` : palavras[i]
      if (font.widthOfTextAtSize(tentativa, tam) > c.w - 4 && linha) break
      linha = tentativa; i++
    }
    if (linha) paginas[c.p ?? 0].drawText(linha, { x: c.x + 2, y: c.y + (c.h - tam * 0.72) / 2, size: tam, font, color: rgb(0, 0, 0) })
  }
}

function escrever(page, font, campo, valor) {
  const c = campo.caixa
  const cor = rgb(0, 0, 0)
  if (campo.tipo === 'data' || campo.tipo === 'digitos' || (campo.tipo === 'codigo' && campo.digitos > 1)) {
    let chars
    if (campo.tipo === 'data') chars = campo.formato === 'ddmm' ? dataParaPapel(valor).slice(0, 4) : dataParaPapel(valor).slice(0, 8)
    else if (campo.tipo === 'codigo') chars = so(valor).padStart(campo.digitos, '0').slice(-campo.digitos)
    else chars = (campo.alfa ? limpar(so(valor).toUpperCase()).replace(/\s/g, '') : so(valor).replace(/\D/g, '')).slice(0, campo.chave.startsWith('telefone') ? 11 : campo.digitos)
    // Se o número for maior que o pente (ex.: celular com 11 dígitos num campo antigo de 10), aperta as casas em vez de cortar.
    const n = Math.max(chars.length, campo.tipo === 'data' ? (campo.formato === 'ddmm' ? 4 : 8) : campo.digitos)
    const cel = c.w / n
    const tam = Math.min(campo.fonte || 8.5, c.h - 1.5)
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i]
      const w = font.widthOfTextAtSize(ch, tam)
      page.drawText(ch, { x: c.x + cel * i + (cel - w) / 2, y: c.y + (c.h - tam * 0.72) / 2, size: tam, font, color: cor })
    }
    return
  }
  const texto = limpar(campo.tipo === 'texto' ? so(valor).toUpperCase() : valor)
  if (!texto) return
  const centro = campo.tipo === 'codigo' || campo.tipo === 'uf'
  const maximo = campo.fonte || (centro ? 9 : 8.5)
  const tam = caberFonte(font, texto, c.w - (centro ? 1 : 3), Math.min(maximo, c.h - 1))
  const w = font.widthOfTextAtSize(texto, tam)
  page.drawText(texto, {
    x: centro ? c.x + (c.w - w) / 2 : c.x + 1.5,
    y: c.y + (c.h - tam * 0.72) / 2,
    size: tam, font, color: cor,
  })
}

export async function gerarPdfFicha(modelo, dados, { base = './sinan' } = {}) {
  const resp = await fetch(`${base}/${modelo.arquivo}`)
  if (!resp.ok) throw new Error(`Não foi possível carregar a ficha ${modelo.arquivo}.`)
  const pdf = await PDFDocument.load(await resp.arrayBuffer(), { ignoreEncryption: true })
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const paginas = pdf.getPages()
  for (const campo of camposDe(modelo)) {
    const v = valorEfetivo(campo, dados)
    if (v === '' || v == null) continue
    if (campo.linhas) { escreverLinhas(paginas, font, campo, v); continue }
    if (!campo.caixa) continue
    const page = paginas[campo.caixa.p ?? 0]
    if (page) escrever(page, font, campo, v)
  }
  return pdf.save()
}

// Abre o PDF numa aba nova, pronto para imprimir.
export async function imprimirFicha(modelo, dados) {
  const bytes = await gerarPdfFicha(modelo, dados)
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
  const w = window.open(url, '_blank')
  if (!w) { const a = document.createElement('a'); a.href = url; a.download = `${modelo.id.toLowerCase()}.pdf`; a.click() }
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
