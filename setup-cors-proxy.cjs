const fs = require('fs');

// 1. Update vite.config.js to add proxy
let viteConfig = fs.readFileSync('vite.config.js', 'utf8');

if (!viteConfig.includes('proxy: {')) {
  viteConfig = viteConfig.replace(
    'server: {',
    `server: {
    proxy: {
      '/api-supabase': {
        target: 'https://fhsyrcksxcdhdbcvjspv.supabase.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\\/api-supabase/, '')
      }
    },`
  );
  fs.writeFileSync('vite.config.js', viteConfig, 'utf8');
}

// 2. Update supabaseClient.js to use proxy on localhost
let supabaseClient = fs.readFileSync('src/lib/supabaseClient.js', 'utf8');

if (!supabaseClient.includes('window.location.hostname === \'localhost\'')) {
  supabaseClient = supabaseClient.replace(
    'const url = env.VITE_SUPABASE_URL || \'https://supabase.local\'',
    `let url = env.VITE_SUPABASE_URL || 'https://supabase.local'
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  url = '/api-supabase'
}`
  );
  fs.writeFileSync('src/lib/supabaseClient.js', supabaseClient, 'utf8');
}

console.log("CORS Proxy configuration applied!");
