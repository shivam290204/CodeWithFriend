const jwt = require('jsonwebtoken');
const http = require('http');

const token = jwt.sign({ id: '64d2b2f8e123456789012345', name: 'Test', email: 'test@example.com' }, 'supersecretcodesynckey1234567890', { expiresIn: '7d' });

const data = JSON.stringify({ name: 'New Session', language: 'javascript' });

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/rooms',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Cookie': `token=${token}`
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
