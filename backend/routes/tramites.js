const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const upload = require('../middlewares/multer');
const tramiteController = require('../controllers/tramiteController');
const Tramite = require('../models/Tramite');
const esNotario = require('../middlewares/esNotario');
const fs = require('fs');

// Crear un trámite con múltiples documentos dinámicos (compraventa)
router.post(
  '/crear',
  authMiddleware,
  upload.any(),
  tramiteController.crearTramiteConArchivos
);

// Listar trámites del usuario autenticado
router.get('/', authMiddleware, tramiteController.listarTramitesUsuario);

// Cambiar el estado del trámite
router.put('/:id', authMiddleware, tramiteController.actualizarTramite);

// Obtener todos los trámites (solo para notarios)
router.get('/todos', authMiddleware, esNotario, async (req, res) => {
  try {
    const tramites = await Tramite.find()
    .populate('usuario', 'nombre email telefono')
    .populate('notario', 'nombre');
    res.json(tramites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener trámites' });
  }
});


module.exports = router;
