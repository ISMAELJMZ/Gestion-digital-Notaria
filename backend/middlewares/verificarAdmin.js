const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const verificarAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer token"
    if (!token) return res.status(401).json({ mensaje: 'No autorizado: Token faltante' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) return res.status(401).json({ mensaje: 'Usuario no encontrado' });

    if (usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Acceso denegado: No es administrador' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};

module.exports = verificarAdmin;
