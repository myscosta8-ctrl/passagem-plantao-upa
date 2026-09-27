const fs = require('fs');
let content = fs.readFileSync('src/pages/painel/usePainelState.js', 'utf8');
if (!content.includes('useQueryClient')) {
  content = "import { useQuery, useQueryClient } from '@tanstack/react-query'\n" + content;
  fs.writeFileSync('src/pages/painel/usePainelState.js', content, 'utf8');
}
