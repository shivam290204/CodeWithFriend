const http = require('http');
const data = JSON.stringify({ name: 'New Session', language: 'javascript' });
const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/rooms',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});
req.write(data);
req.end();
