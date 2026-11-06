const assert = require('node:assert/strict');
const test = require('node:test');

process.env.JWT_SECRET = 'test-secret-for-local-tests';
const { app } = require('../server');

test('protege el endpoint administrativo y permite acceder con JWT', async (t) => {
  const server = app.listen(0);
  t.after(() => server.close());

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const unauthorized = await fetch(`${baseUrl}/api/admin`);
  assert.equal(unauthorized.status, 401);

  const login = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ user: 'alumno' }),
  });
  assert.equal(login.status, 200);
  const { token } = await login.json();
  assert.ok(token);

  const authorized = await fetch(`${baseUrl}/api/admin`, {
    headers: { authorization: `Bearer ${token}` },
  });
  assert.equal(authorized.status, 200);
  const body = await authorized.json();
  assert.equal(body.message, 'Bienvenido al área administrativa protegida');
  assert.equal(body.user.username, 'alumno');
  assert.equal(body.user.role, 'admin');
  assert.equal(typeof body.user.iat, 'number');
});
