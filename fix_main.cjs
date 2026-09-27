const fs = require('fs');

let content = fs.readFileSync('src/main.jsx', 'utf8');

const importStatement = "import { QueryClient, QueryClientProvider } from '@tanstack/react-query'\n";
if (!content.includes('QueryClientProvider')) {
  // Add imports
  content = importStatement + content;
  
  // Create client
  const clientSetup = `
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false, // Prevents excessive re-fetching on tab switch
    },
  },
})

`;
  
  content = content.replace('registerSW({ immediate: true })', clientSetup + 'registerSW({ immediate: true })');
  
  // Wrap App
  content = content.replace('<ErrorBoundary>\n      <App />\n    </ErrorBoundary>', '<ErrorBoundary>\n      <QueryClientProvider client={queryClient}>\n        <App />\n      </QueryClientProvider>\n    </ErrorBoundary>');
  
  fs.writeFileSync('src/main.jsx', content, 'utf8');
}
