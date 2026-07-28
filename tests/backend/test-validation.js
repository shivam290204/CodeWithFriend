const axios = require('axios');

async function testValidation() {
  const api = axios.create({ baseURL: 'http://localhost:5000/api' });

  try {
    console.log('Testing malformed /login...');
    await api.post('/auth/login', { email: { $ne: null }, password: 123 });
    console.log('FAIL: Did not reject malformed login');
  } catch (err) {
    if (err.response?.status === 400 && err.response?.data?.error) {
      console.log('PASS: Rejected malformed login with 400:', err.response.data.error);
    } else {
      console.log('FAIL: Unexpected response for login:', err.message, err.response?.data);
    }
  }

  // To test execute, we need a valid cookie first
  let cookie = '';
  try {
    const email = `test${Date.now()}@test.com`;
    const res = await api.post('/auth/signup', { name: 'Test', email, password: 'password123' });
    cookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0] : '';
  } catch(e) {}

  if (cookie) {
    api.defaults.headers.Cookie = cookie;
    try {
      console.log('Testing malformed /execute...');
      await api.post('/execute', { language: 'javascript', code: 12345 });
      console.log('FAIL: Did not reject malformed execute');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error) {
        console.log('PASS: Rejected malformed execute with 400:', err.response.data.error);
      } else {
        console.log('FAIL: Unexpected response for execute:', err.message, err.response?.data);
      }
    }
  } else {
    console.log('Could not test /execute due to auth failure');
  }
}

testValidation();
