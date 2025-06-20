const jwt = require('jsonwebtoken');

// clave para firmar los tokens desde el archivo .env
const SECRET_KEY = process.env.JWT_SECRET;

module.exports = function(req, res, next) {
  let token = null;
  const authHeader = req.headers['authorization'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ mensaje: 'No hay token, acceso no autorizado' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token no válido' });
  }
};
