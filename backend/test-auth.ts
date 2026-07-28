import mongoose from 'mongoose';

const API_URL = 'http://localhost:5000/api/auth';
const email = `testuser_${Date.now()}@example.com`;
const password = 'StrongPassword123!';

async function runTests() {
  console.log('Starting auth tests...');

  // 1. Signup
  let res = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email, password })
  });
  if (!res.ok) throw new Error(`Signup failed: ${await res.text()}`);
  console.log('✅ Signup successful');

  const cookies = res.headers.getSetCookie() || [];
  let cookieHeader = cookies.map((c: string) => c.split(';')[0]).join('; ');

  // 2. Refresh Token Flow
  res = await fetch(`${API_URL}/refresh`, {
    method: 'POST',
    headers: { 'Cookie': cookieHeader }
  });
  if (!res.ok) throw new Error(`Refresh failed: ${await res.text()}`);
  console.log('✅ Token refresh successful');

  const newCookies = res.headers.getSetCookie() || [];
  cookieHeader = newCookies.map((c: string) => c.split(';')[0]).join('; ');

  // 3. Logout All
  res = await fetch(`${API_URL}/logout-all`, {
    method: 'POST',
    headers: { 'Cookie': cookieHeader }
  });
  if (!res.ok) throw new Error(`Logout all failed: ${await res.text()}`);
  console.log('✅ Logout-all successful');

  // Verify refresh no longer works
  res = await fetch(`${API_URL}/refresh`, {
    method: 'POST',
    headers: { 'Cookie': cookieHeader }
  });
  if (res.ok) throw new Error('Refresh should have failed after logout-all');
  console.log('✅ Old refresh token correctly invalidated');

  // 4. Test lockout
  for (let i = 0; i < 5; i++) {
    res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'wrongpassword' })
    });
  }
  // The 6th attempt should return 423
  res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (res.status !== 423) throw new Error(`Expected lockout status 423, got ${res.status}`);
  console.log('✅ Account lockout mechanism working');

  console.log('All automated backend tests passed!');
  process.exit(0);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
