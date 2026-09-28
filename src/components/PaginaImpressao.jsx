// Define o papel do impresso (A4 retrato/paisagem) no momento da impressão.
// As regras "@page nome" dos CSS não são aplicadas pelo Chrome quando o impresso
// está dentro de camada posicionada (tela cheia), então o tamanho vai direto aqui.
export default function PaginaImpressao({ paisagem = false, margem = '10mm' }) {
  return <style>{`@media print { @page { size: A4 ${paisagem ? 'landscape' : 'portrait'}; margin: ${margem}; } }`}</style>
}
