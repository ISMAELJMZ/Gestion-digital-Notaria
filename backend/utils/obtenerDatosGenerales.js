function obtenerDatosGenerales(tipoTramite, body) {
  const telefonoUsuario = body.telefono || '';

  if (tipoTramite === 'compraventa') {
    return {
      vendedor: {
        lugarNacimiento: body.vendedor_lugar_nacimiento,
        ocupacion: body.vendedor_ocupacion,
        estadoCivil: body.vendedor_estado_civil,
        telefono: body.vendedor_telefono,
        correoElectronico: body.vendedor_correo,
      },
      comprador: {
        lugarNacimiento: body.comprador_lugar_nacimiento,
        ocupacion: body.comprador_ocupacion,
        estadoCivil: body.comprador_estado_civil,
        telefono: body.comprador_telefono,
        correoElectronico: body.comprador_correo,
      },
      telefonoUsuario,
    };
  }

  if (tipoTramite === 'donacion') {
    return {
      donante: {
        lugarNacimiento: body.donante_lugar_nacimiento,
        ocupacion: body.donante_ocupacion,
        estadoCivil: body.donante_estado_civil,
        telefono: body.donante_telefono,
        correoElectronico: body.donante_correo,
      },
      donatario: {
        lugarNacimiento: body.donatario_lugar_nacimiento,
        ocupacion: body.donatario_ocupacion,
        estadoCivil: body.donatario_estado_civil,
        telefono: body.donatario_telefono,
        correoElectronico: body.donatario_correo,
      },
      telefonoUsuario,
    };
  }

  return { telefonoUsuario }; 
}

module.exports = obtenerDatosGenerales;
