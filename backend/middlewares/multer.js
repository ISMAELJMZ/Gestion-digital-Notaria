const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!req.uploadPath) {
      const tramite = (req.body.tipoTramite || 'tramite').replace(/\s+/g, '').toLowerCase();
      const nombreUsuario = (req.user?.nombre || 'usuario').replace(/\s+/g, '').toLowerCase();
      const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1e9);

      const rutaDestino = path.join('uploads', `${tramite}-${nombreUsuario}-${uniqueId}`);
      fs.mkdirSync(rutaDestino, { recursive: true });

      req.uploadPath = rutaDestino; 
    }

    cb(null, req.uploadPath);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    
    cb(null, `${file.fieldname}${ext}`);
  }
});

const fileFilter = function (req, file, cb) {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = upload;
