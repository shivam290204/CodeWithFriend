const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function run() {
  try {
    const api = axios.create({ 
      baseURL: 'http://localhost:5000/api', 
      withCredentials: true,
      headers: { 'Origin': 'http://localhost:5173' }
    });
    
    // 1. Host
    console.log('Host signing up...');
    let res = await api.post('/auth/signup', { name: 'Host', email: `host${Date.now()}@test.com`, password: 'password123' });
    console.log(res.headers);
  } catch (err) {
    console.error(err.message);
  }
}
run();
