const axios = require('axios');

async function testHelmet() {
  const api = axios.create({ baseURL: 'http://localhost:5000/api' });

  try {
    console.log('Testing CORS and Helmet headers for /auth/login...');
    const email = `test${Date.now()}@test.com`;
    // Register first
    await api.post('/auth/signup', { name: 'Test', email, password: 'password123' }, {
      headers: { Origin: 'http://localhost:5173' }
    });

    // Login
    const res = await api.post('/auth/login', { email, password: 'password123' }, {
      headers: { Origin: 'http://localhost:5173' }
    });

    console.log('Login Status:', res.status);
    console.log('Access-Control-Allow-Origin:', res.headers['access-control-allow-origin']);
    console.log('Access-Control-Allow-Credentials:', res.headers['access-control-allow-credentials']);
    
    const cookies = res.headers['set-cookie'];
    if (cookies && cookies.length > 0) {
      console.log('PASS: set-cookie header present:', cookies[0].substring(0, 50) + '...');
      if (cookies[0].includes('HttpOnly')) {
        console.log('PASS: HttpOnly flag is set');
      } else {
        console.log('FAIL: HttpOnly flag missing');
      }
    } else {
      console.log('FAIL: No set-cookie header');
    }

    const securityHeaders = ['x-dns-prefetch-control', 'x-frame-options', 'strict-transport-security', 'x-download-options', 'x-content-type-options', 'x-xss-protection'];
    let helmetPresent = true;
    for (const h of securityHeaders) {
      if (!res.headers[h]) {
        console.log(`Missing Helmet header: ${h}`);
        helmetPresent = false;
      }
    }
    if (helmetPresent) {
      console.log('PASS: Helmet security headers are present');
    }

  } catch (err) {
    console.log('FAIL:', err.message, err.response?.data);
  }
}

testHelmet();
