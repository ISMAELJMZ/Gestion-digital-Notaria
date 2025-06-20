
const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');

// obntener lista de usuario
async function obtenerUsuarios(req, res) {
  try {
    const usuarios = await Usuario.find({}, '-contrasena');
    res.json({ usuarios });
  } catch (error) {
    console.error('Error en obtenerUsuarios:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

// cambiar la contrasena del usuario 
async function cambiarContrasena(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ mensaje: 'Usuario no autenticado' });
    }

    const adminId = req.user.id;
    const { id } = req.params;
    const { nuevaContrasena, adminContrasena } = req.body;

    if (!nuevaContrasena || !adminContrasena) {
      return res.status(400).json({ mensaje: 'Faltan datos requeridos' });
    }

    const admin = await Usuario.findById(adminId);
    if (!admin) return res.status(401).json({ mensaje: 'Admin no encontrado' });
    if (admin.rol !== 'admin') return res.status(403).json({ mensaje: 'No autorizado' });

    const passValida = await bcrypt.compare(adminContrasena, admin.contrasena);
    if (!passValida) return res.status(401).json({ mensaje: 'Contraseña admin incorrecta' });

    const usuario = await Usuario.findById(id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const salt = await bcrypt.genSalt(10);
    usuario.contrasena = await bcrypt.hash(nuevaContrasena, salt);
    await usuario.save();

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error en cambiarContrasena:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}

module.exports = {
  obtenerUsuarios,
  cambiarContrasena,
};
