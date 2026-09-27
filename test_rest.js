const https = require('https');
https.get('https://fhsyrcksxcdhdbcvjspv.supabase.co/rest/v1/', (res) => {
  console.log('REST API Status:', res.statusCode);
}).on('error', (e) => {
  console.error('REST API Error:', e.message);
});
