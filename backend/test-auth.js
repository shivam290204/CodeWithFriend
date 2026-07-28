const axios = require('axios');

async function testAuthRateLimit() {
  const api = axios.create({ baseURL: 'http://localhost:5000/api' });

  console.log('Testing /login rate limit...');
  let successCount = 0;
  let blockCount = 0;
  
  for (let i = 1; i <= 12; i++) {
    try {
      await api.post('/auth/login', { email: 'bad@bad.com', password: 'bad' });
      successCount++;
    } catch (err) {
      if (err.response?.status === 429) {
        console.log(`Request ${i} blocked with 429:`, err.response.data);
        blockCount++;
      } else if (err.response?.status === 400) {
        console.log(`Request ${i} rejected with 400 (Invalid credentials)`);
        successCount++; // normal response
      } else {
        console.log(`Request ${i} failed with other error:`, err.message);
      }
    }
  }

  console.log(`\nTest complete. Normal responses: ${successCount}, Blocked by rate limiter: ${blockCount}`);
}

testAuthRateLimit();
