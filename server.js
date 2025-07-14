const http = require('http');
const crypto = require('crypto');

let users = [];
const tokens = {};

const send = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  });
  res.end(JSON.stringify(body));
};

const parseBody = (req) => new Promise((resolve, reject) => {
  let data = '';
  req.on('data', chunk => { data += chunk; });
  req.on('end', () => {
    try {
      resolve(JSON.parse(data || '{}'));
    } catch (err) {
      reject(err);
    }
  });
});

async function register(req, res) {
  try {
    const { username, password } = await parseBody(req);
    if (!username || !password) return send(res, 400, { error: 'Missing fields' });
    if (users.some(u => u.username === username)) return send(res, 400, { error: 'User exists' });

    const id = crypto.randomUUID();
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    const user = { id, username, salt, hash };
    users.push(user);

    const token = crypto.randomBytes(32).toString('hex');
    tokens[token] = id;

    send(res, 200, { token, user: { id, username } });
  } catch (e) {
    send(res, 400, { error: 'Invalid JSON' });
  }
}

async function login(req, res) {
  try {
    const { username, password } = await parseBody(req);
    const user = users.find(u => u.username === username);
    if (!user) return send(res, 400, { error: 'Invalid credentials' });
    const hash = crypto.pbkdf2Sync(password, user.salt, 10000, 64, 'sha512').toString('hex');
    if (hash !== user.hash) return send(res, 400, { error: 'Invalid credentials' });
    const token = crypto.randomBytes(32).toString('hex');
    tokens[token] = user.id;
    send(res, 200, { token, user: { id: user.id, username: user.username } });
  } catch (e) {
    send(res, 400, { error: 'Invalid JSON' });
  }
}

function validate(req, res) {
  const auth = req.headers['authorization'] || '';
  const token = auth.split(' ')[1];
  const userId = tokens[token];
  if (userId) {
    const user = users.find(u => u.id === userId);
    if (user) return send(res, 200, { user: { id: user.id, username: user.username } });
  }
  send(res, 401, { error: 'Invalid token' });
}

function listUsers(req, res) {
  send(res, 200, users.map(u => ({ id: u.id, username: u.username })));
}

http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    });
    res.end();
    return;
  }
  if (req.method === 'POST' && req.url === '/api/register') return register(req, res);
  if (req.method === 'POST' && req.url === '/api/login') return login(req, res);
  if (req.method === 'GET' && req.url === '/api/validate') return validate(req, res);
  if (req.method === 'GET' && req.url === '/api/users') return listUsers(req, res);
  send(res, 404, { error: 'Not found' });
}).listen(3001, () => {
  console.log('Mock auth server running on port 3001');
});
