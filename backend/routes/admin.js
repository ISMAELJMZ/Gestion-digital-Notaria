const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const esAdmin = require('../middlewares/esAdmin');
const { obtenerUsuarios, cambiarContrasena } = require('../controllers/adminController');

// Ruta para obtener todos los usuarios (usuarios, notarios y admin)
router.get('/usuarios', auth, esAdmin, obtenerUsuarios);

// Ruta para cambiar contraseña de un usuario (recibe id y nueva contraseña)
router.put('/usuarios/:id/contrasena', auth, esAdmin, cambiarContrasena);

module.exports = router;
