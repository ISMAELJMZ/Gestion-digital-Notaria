module.exports = (req, res, next) => {
  if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado: solo administradores' });
  }
  next();
};
