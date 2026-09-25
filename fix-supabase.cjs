const fs = require('fs');
let content = fs.readFileSync('src/lib/supabaseClient.js', 'utf8');
content = content.replace(
  "url = '/api-supabase'",
  "url = window.location.origin + '/api-supabase'"
);
fs.writeFileSync('src/lib/supabaseClient.js', content, 'utf8');
console.log("Fixed supabaseClient URL");
