const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function run() {
  try {
    const api = axios.create({ baseURL: 'http://localhost:5000/api', withCredentials: true });
    
    // 1. Host
    console.log('Host signing up...');
    let res = await api.post('/auth/signup', { name: 'Host', email: `host${Date.now()}@test.com`, password: 'password123' });
    const hostCookie = res.headers['set-cookie'][0];
    
    // 2. Create room
    console.log('Host creating room...');
    res = await api.post('/rooms', { name: 'My Room' }, { headers: { Cookie: hostCookie } });
    const roomCode = res.data.roomCode;
    console.log('Room Code:', roomCode);
    
    // 3. User
    console.log('User signing up...');
    res = await api.post('/auth/signup', { name: 'User', email: `user${Date.now()}@test.com`, password: 'password123' });
    const userCookie = res.headers['set-cookie'][0];
    
    // 4. User views room (should be 403)
    try {
      await api.get(`/rooms/${roomCode}`, { headers: { Cookie: userCookie } });
      console.log('User unexpectedly was able to view room!');
    } catch (e) {
      console.log('User viewing room got:', e.response.status, e.response.data);
    }
    
    // 5. User joins room
    console.log('User joining room...');
    res = await api.post('/rooms/join', { roomCode }, { headers: { Cookie: userCookie } });
    console.log('User joined room!', res.data.roomCode);
    
    // 6. User views room again
    res = await api.get(`/rooms/${roomCode}`, { headers: { Cookie: userCookie } });
    console.log('User viewing room again:', res.data.roomCode);
    
  } catch (err) {
    if (err.response) {
      console.error("HTTP ERROR:", err.response.status, JSON.stringify(err.response.data));
    } else {
      console.error("NETWORK ERROR:", err.message);
    }
  }
}
run();
