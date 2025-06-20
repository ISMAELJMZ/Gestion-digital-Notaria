const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generarPDFDatosGenerales(tipoTramite, datos, carpetaSubida) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const rutaPDF = path.join(carpetaSubida, 'datos_generales.pdf');
    const stream = fs.createWriteStream(rutaPDF);
    doc.pipe(stream);

    doc.fontSize(18).text('Datos Generales del Trámite', { align: 'center' });
    doc.moveDown();

    switch (tipoTramite) {
      case 'compraventa':
        doc.fontSize(16).text('Datos del Vendedor');
        doc.fontSize(12);
        doc.text(`Lugar de nacimiento: ${datos.vendedor_lugar_nacimiento || 'No proporcionado'}`);
        doc.text(`Ocupación: ${datos.vendedor_ocupacion || 'No proporcionada'}`);
        doc.text(`Estado civil: ${datos.vendedor_estado_civil || 'No proporcionado'}`);
        doc.text(`Teléfono: ${datos.vendedor_telefono || 'No proporcionado'}`);
        doc.text(`Correo electrónico: ${datos.vendedor_correo || 'No proporcionado'}`);

        doc.moveDown();
        doc.fontSize(16).text('Datos del Comprador');
        doc.fontSize(12);
        doc.text(`Lugar de nacimiento: ${datos.comprador_lugar_nacimiento || 'No proporcionado'}`);
        doc.text(`Ocupación: ${datos.comprador_ocupacion || 'No proporcionada'}`);
        doc.text(`Estado civil: ${datos.comprador_estado_civil || 'No proporcionado'}`);
        doc.text(`Teléfono: ${datos.comprador_telefono || 'No proporcionado'}`);
        doc.text(`Correo electrónico: ${datos.comprador_correo || 'No proporcionado'}`);
        break;

      case 'donacion':
        doc.fontSize(16).text('Datos del Donante');
        doc.fontSize(12);
        doc.text(`Lugar de nacimiento: ${datos.donante_lugar_nacimiento || 'No proporcionado'}`);
        doc.text(`Ocupación: ${datos.donante_ocupacion || 'No proporcionada'}`);
        doc.text(`Estado civil: ${datos.donante_estado_civil || 'No proporcionado'}`);
        doc.text(`Teléfono: ${datos.donante_telefono || 'No proporcionado'}`);
        doc.text(`Correo electrónico: ${datos.donante_correo || 'No proporcionado'}`);

        doc.moveDown();
        doc.fontSize(16).text('Datos del Donatario');
        doc.fontSize(12);
        doc.text(`Lugar de nacimiento: ${datos.donatario_lugar_nacimiento || 'No proporcionado'}`);
        doc.text(`Ocupación: ${datos.donatario_ocupacion || 'No proporcionada'}`);
        doc.text(`Estado civil: ${datos.donatario_estado_civil || 'No proporcionado'}`);
        doc.text(`Teléfono: ${datos.donatario_telefono || 'No proporcionado'}`);
        doc.text(`Correo electrónico: ${datos.donatario_correo || 'No proporcionado'}`);
        break;

      default:
        doc.text('Tipo de trámite no reconocido para generar datos generales.');
        break;
    }

    doc.moveDown();
    doc.text(`Fecha de solicitud: ${new Date().toLocaleString()}`);
    doc.end();

    stream.on('finish', () => resolve(rutaPDF));
    stream.on('error', reject);
  });
}

module.exports = generarPDFDatosGenerales;
