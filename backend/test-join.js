const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function run() {
  const token = jwt.sign({ id: 'dummy123', name: 'dummy' }, process.env.JWT_SECRET);
  const api = axios.create({ 
    baseURL: 'http://localhost:5000/api', 
    headers: { Cookie: `token=${token}` } 
  });
  
  try {
    const res = await api.post('/rooms/join', { roomCode: 'ABCD' });
    console.log(res.data);
  } catch (err) {
    if (err.response) {
      console.error("HTTP ERROR:", err.response.status, err.response.data);
    } else {
      console.error("NETWORK ERROR:", err.message);
    }
  }
}
run();
