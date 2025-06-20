const Tramite = require("../models/Tramite");
const path = require("path");
const fs = require("fs");
const generarPDFDatosGenerales = require('../utils/generarPDFDatosGenerales');
const obtenerDatosGenerales = require('../utils/obtenerDatosGenerales');

// listar los trámites del usuario autenticado
const listarTramitesUsuario = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const tramites = await Tramite.find({ usuario: usuarioId });
    res.status(200).json(tramites);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener trámites' });
  }
};

// crear el trámite con archivos y el pdf
const crearTramiteConArchivos = async (req, res) => {
  try {
    const { tipoTramite, observaciones } = req.body;
    const usuarioId = req.user.id;

    if (!tipoTramite) {
      return res.status(400).json({ mensaje: 'El tipo de trámite es obligatorio' });
    }

    const documentos = [];
    const carpetaSubida = req.files.length > 0 ? path.dirname(req.files[0].path) : null;

    // Guardar archivos subidos
    req.files.forEach((archivo) => {
      documentos.push({
        nombreArchivo: archivo.filename,
        nombreOriginal: archivo.originalname,
        campoFormulario: archivo.fieldname,
        url: '/uploads/' + archivo.path.replace(/\\/g, '/').split('uploads/')[1],
      });
    });

    // Generar PDF y agregarlo a documentos
    if (carpetaSubida) {
      const rutaPDF = await generarPDFDatosGenerales(tipoTramite, req.body, carpetaSubida);
      documentos.push({
        nombreArchivo: 'datos_generales.pdf',
        url: '/uploads/' + rutaPDF.replace(/\\/g, '/').split('uploads/')[1],
      });
    }

    // Obtener los datos generales estructurados según el tipo de trámite
    const datosGenerales = obtenerDatosGenerales(tipoTramite, req.body);

    // Crear y guardar el nuevo trámite
    const nuevoTramite = new Tramite({
      usuario: usuarioId,
      tipoTramite,
      documentos,
      observaciones,
      datosGenerales,
    });

    await nuevoTramite.save();
    res.status(201).json({ mensaje: 'Trámite creado correctamente', tramite: nuevoTramite });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error interno al crear el trámite',
      error: error.message,
    });
  }
};

// actualizar estado y observaciones
const actualizarTramite = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, observaciones } = req.body;

    const ESTADOS_VALIDOS = ['pendiente', 'en proceso', 'finalizado'];
    if (estado && !ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado no válido' });
    }

    const tramite = await Tramite.findByIdAndUpdate(
      id,
      { estado, observaciones },
      { new: true }
    ).populate('notario', 'nombre');

    if (!tramite) {
      return res.status(404).json({ mensaje: 'Trámite no encontrado' });
    }

    res.json(tramite);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el trámite' });
  }
};

module.exports = {
  listarTramitesUsuario,
  crearTramiteConArchivos,
  actualizarTramite,
};
