const http = require('http');

const req = http.get('http://localhost:5000/api/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, data));
});
req.on('error', (e) => {
  console.error('Request error:', e.message);
});
