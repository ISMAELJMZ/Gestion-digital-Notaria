const mongoose = require('mongoose');

const tramiteSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  tipoTramite: {
    type: String,
    required: true,
  },
  documentos: [{
    nombreArchivo: String,
    url: String,
  }],
  estado: {
    type: String,
    enum: ['pendiente', 'en proceso', 'finalizado', 'rechazado'], 
    default: 'pendiente',
  },
  notario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    default: null,
  },
  fechaSolicitud: {
    type: Date,
    default: Date.now,
  },
  observaciones: {
    type: String,
  },
  datosGenerales: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  }
});

module.exports = mongoose.model('Tramite', tramiteSchema);
