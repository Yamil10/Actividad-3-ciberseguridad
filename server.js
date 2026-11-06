const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error('JWT_SECRET must be configured');
}

app.post('/api/login', (req, res) => {
  const { user } = req.body;
  if (!user || typeof user !== 'string') {
    return res.status(400).json({ error: 'Usuario requerido' });
  }

  const token = jwt.sign({ username: user, role: 'admin' }, secretKey, {
    expiresIn: '1h',
  });
  return res.json({ token });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : undefined;

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado: Token no proporcionado' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.user = user;
    return next();
  });
}

app.get('/api/admin', authenticateToken, (req, res) => {
  res.json({
    message: 'Bienvenido al área administrativa protegida',
    user: req.user,
  });
});

app.listen(3000, () => {
  console.log('API corriendo en http://localhost:3000');
});
