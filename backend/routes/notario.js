const express = require('express');
const router = express.Router();
const Tramite = require('../models/Tramite');
const authMiddleware = require('../middlewares/auth');
const esNotario = require('../middlewares/esNotario');
const archiver = require('archiver');  
const path = require('path');
const fs = require('fs');

// Obtener todos los trámites del sistema (solo notarios)
router.get('/tramites', authMiddleware, esNotario, async (req, res) => {
  try {
    const tramites = await Tramite.find()
    .populate('usuario', 'nombre email')
    .populate('notario', 'nombre');
    res.status(200).json(tramites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener los trámites' });
  }
});

// Cambiar el estado de un trámite 
router.patch('/tramites/:id/estado', authMiddleware, esNotario, async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoEstado } = req.body;

    if (!['aprobado', 'rechazado'].includes(nuevoEstado)) {
      return res.status(400).json({ mensaje: 'Estado inválido' });
    }

    const tramite = await Tramite.findByIdAndUpdate(
      id,
      { estado: nuevoEstado },
      { new: true }
    );

    if (!tramite) {
      return res.status(404).json({ mensaje: 'Trámite no encontrado' });
    }

    res.status(200).json({ mensaje: 'Estado actualizado', tramite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar el estado' });
  }
});


// Obtener trámites asignados al notario actual 
router.get('/tramites/asignados', authMiddleware, esNotario, async (req, res) => {
  try {
    const notarioId = req.user.id;

    const tramites = await Tramite.find({ 
      notario: notarioId,
      estado: { $ne: 'finalizado' } 
    })
    .populate('usuario', 'nombre email')
    .populate('notario', 'nombre')
    .sort({ fechaSolicitud: -1 });

    res.json(tramites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener trámites asignados' });
  }
});


// Ver detalles de un trámite específico solo para notarios 
router.get('/tramites/:id', authMiddleware, esNotario, async (req, res) => {
  try {
    const { id } = req.params;
    const tramite = await Tramite.findById(id).populate('usuario', 'correo');

    if (!tramite) {
      return res.status(404).json({ mensaje: 'Trámite no encontrado' });
    }

    res.status(200).json(tramite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener detalles del trámite' });
  }
});

// Asignar un trámite a un notario 
router.patch('/tramites/:id/asignar', authMiddleware, esNotario, async (req, res) => {
  try {
    const tramiteId = req.params.id;
    const notarioId = req.user.id;

    const tramite = await Tramite.findById(tramiteId);

    if (!tramite) {
      return res.status(404).json({ mensaje: 'Trámite no encontrado' });
    }

    if (tramite.notario) {
      return res.status(400).json({ mensaje: 'Trámite ya está asignado a un notario' });
    }

    tramite.notario = notarioId;
    tramite.estado = 'en proceso';
    await tramite.save();

    res.status(200).json({ mensaje: 'Trámite asignado correctamente', tramite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al asignar el trámite' });
  }
});

// Obtener trámites asignados al notario autenticado
router.get('/mis-tramites', authMiddleware, esNotario, async (req, res) => {
  try {
    const notarioId = req.user.id;

    const tramites = await Tramite.find({ notario: notarioId, estado: 'en proceso' })
      .populate('usuario', 'correo');

    res.status(200).json(tramites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener los trámites del notario' });
  }
});

router.get('/tramites/:id/descargar-archivos', authMiddleware, esNotario, async (req, res) => {
  try {
    const notarioId = req.user.id;
    const tramite = await Tramite.findById(req.params.id).populate('usuario');

    if (!tramite) return res.status(404).json({ mensaje: 'Trámite no encontrado' });

    if (!tramite.notario || tramite.notario.toString() !== notarioId) {
      return res.status(403).json({ mensaje: 'No tienes permiso para descargar estos archivos' });
    }

    const zip = archiver('zip', { zlib: { level: 9 } });

    const tipo = tramite.tipoTramite.replace(/\s+/g, '');
    const nombre = tramite.usuario.nombre ? tramite.usuario.nombre.replace(/\s+/g, '') : 'usuario';
    const zipName = `tramite${tipo}-${nombre}.zip`;

    res.attachment(zipName);

    // Manejo de errores de zip
    zip.on('error', (err) => {
      console.error('Error en ZIP:', err);
      if (!res.headersSent) {
        res.status(500).send({ mensaje: 'Error generando ZIP' });
      }
    });

    zip.pipe(res);

    tramite.documentos.forEach(doc => {
      const filePath = path.join(__dirname, '..', doc.url);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(doc.nombreArchivo || '');
        const nombreParaZip = `${doc.campoFormulario || path.basename(doc.url, ext)}${ext}`;
        zip.file(filePath, { name: nombreParaZip });
      } else {
        console.warn(`Archivo no encontrado para comprimir: ${filePath}`);
      }
    });

    await zip.finalize();

  } catch (error) {
    console.error('Error al generar ZIP:', error);
    if (!res.headersSent) {
      res.status(500).json({ mensaje: 'Error al descargar archivos' });
    }
  }
});


// Finalizar trámite (solo notarios autenticados)
router.patch('/tramites/:id/finalizar', authMiddleware, esNotario, async (req, res) => {
  try {
    const tramite = await Tramite.findById(req.params.id);
    if (!tramite) return res.status(404).json({ success: false, message: 'Trámite no encontrado' });

    tramite.estado = 'finalizado';
    if (req.body.observaciones) {
  tramite.observaciones = req.body.observaciones;
}
    await tramite.save();

    res.json({ success: true, tramite });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

module.exports = router;
