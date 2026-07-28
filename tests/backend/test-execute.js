const axios = require('axios');
const http = require('http');

const mockPiston = http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    const data = JSON.parse(body);
    const code = data.files[0].content;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    
    if (code.includes(')')) { // super basic mock for syntax error check
      if (code.includes('Hello JS)') || code.includes('Hello Python"') || code.includes('"a"')) {
        res.end(JSON.stringify({ run: { code: 1, stdout: '', stderr: 'Syntax Error' } }));
      } else {
        res.end(JSON.stringify({ run: { code: 0, stdout: 'Hello\n', stderr: '' } }));
      }
    } else {
      res.end(JSON.stringify({ run: { code: 1, stdout: '', stderr: 'Unexpected end of input' } }));
    }
  });
});

mockPiston.listen(6000, async () => {
  try {
    const api = axios.create({ baseURL: 'http://localhost:5000/api', withCredentials: true });

    // 1. Signup / Login
    const email = `test${Date.now()}@test.com`;
    let res = await api.post('/auth/signup', { name: 'Test', email, password: 'password123' });
    const cookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0] : '';
    api.defaults.headers.Cookie = cookie;

    console.log('Logged in successfully');

    // 2. Test Execution
    const tests = [
      { lang: 'javascript', code: 'console.log("Hello JS");', syntaxError: 'console.log("Hello JS)' },
      { lang: 'typescript', code: 'const x: number = 5; console.log("Hello TS", x);', syntaxError: 'const x: number = "a";' },
      { lang: 'python', code: 'print("Hello Python")', syntaxError: 'print("Hello Python"' },
      { lang: 'cpp', code: '#include <iostream>\nint main() { std::cout << "Hello CPP\\n"; return 0; }', syntaxError: 'int main() { std::cout << "Hello CPP"' },
    ];

    for (const t of tests) {
      console.log(`\nTesting ${t.lang} [Valid]...`);
      let execRes = await api.post('/execute', { language: t.lang, code: t.code });
      console.log(execRes.data);

      console.log(`Testing ${t.lang} [Invalid]...`);
      let errRes = await api.post('/execute', { language: t.lang, code: t.syntaxError });
      console.log(errRes.data);
    }
  } catch (err) {
    console.error('Test failed:', err.response?.data || err.message);
  } finally {
    mockPiston.close();
    process.exit(0);
  }
});
