// middleware para distinguir los notarios de los usuarios
module.exports = (req, res, next) => {
  if (!req.user || req.user.rol !== 'notario') {
    return res.status(403).json({ mensaje: 'Acceso restringido a notarios' });
  }
  next();
};
