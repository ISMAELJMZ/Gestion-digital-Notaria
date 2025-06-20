function generarInputArchivo(labelText, name) {
  return `
    <div class="campo-documento">
      <label class="nombre-archivo" for="${name}">${labelText}:</label>
      <input class="input-archivo" type="file" name="${name}" id="${name}" accept=".pdf" required />
    </div>`;
}

function generarInputTexto(labelText, name, type = 'text') {
  let atributosAdicionales = '';

  if (type === 'tel') {
    atributosAdicionales = 'maxlength="10" pattern="\\d{10}" inputmode="numeric" placeholder="10 dígitos numéricos" title="Debe ser un número de 10 dígitos reales"';
    type = 'text'; 
  } else if (type === 'email') {
  }

  return `
    <div class="campo-documento">
      <label class="nombre-archivo" for="${name}">${labelText}:</label>
      <input class="input-texto" type="${type}" name="${name}" id="${name}" required ${atributosAdicionales} />
    </div>`;
}


import API_BASE_URL from './config.js';


document.addEventListener('DOMContentLoaded', () => {
  let bloqueandoCambioTramite = false;

  const token = localStorage.getItem('token');
  if (!token) {
    alert('No has iniciado sesión.');
    setTimeout(() => window.location.href = 'login.html', 500);
    return;
  }
  const decoded = (() => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return {};
    }
  })();

 if (decoded.rol !== 'usuario') {
  localStorage.removeItem('token');
  alert('Acceso denegado. Este panel es exclusivo para usuarios.');
  setTimeout(() => window.location.href = 'index.html', 500);
  return;
}
  

  const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
  if (usuarioGuardado?.nombre) {
    const bienvenida = document.getElementById("bienvenida");
    if (bienvenida) {
      bienvenida.textContent = `Bienvenido: ${usuarioGuardado.nombre}`;
    }
  }

  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    });
  }


  const selectorTramite = document.getElementById('selector-tramite');
  const contenedorFormulario = document.getElementById('formulario-container');

  if (selectorTramite && contenedorFormulario) {
    selectorTramite.addEventListener('change', (e) => {
      if (bloqueandoCambioTramite) return;
      const tramiteSeleccionado = e.target.value;
      contenedorFormulario.innerHTML = '';

      if (tramiteSeleccionado === 'compraventa') {
        generarFormularioCompraventa();
      }else if (tramiteSeleccionado === 'donacion') {
        generarFormularioDonacion();
      } else {
        contenedorFormulario.innerHTML = `
    <div class="mensaje-no-disponible">
      <p>⚠️ Este trámite no está disponible por el momento. Por favor, selecciona otro.</p>
    </div>
  `;
      }
    });
  }


  //formulario de compraventa 
  function generarFormularioCompraventa(){
  const form = document.createElement('form');
  form.method = 'POST';
  form.enctype = 'multipart/form-data';
  form.action = ''; // Evita recarga

  form.innerHTML += `<h3>Documentos del Vendedor</h3>`;
    form.innerHTML += generarInputArchivo('Escritura original del inmueble', 'vendedor_escritura');
    form.innerHTML += generarInputArchivo('Pago predial 2025', 'vendedor_predial');
    form.innerHTML += generarInputArchivo('Constancia de no adeudo agua 2025', 'vendedor_agua');
    form.innerHTML += `
      <label for="tipo_identificacion">Tipo de identificación oficial vigente:</label>
      <select id="tipo_identificacion" name="tipo_identificacion" required>
        <option value="" disabled selected>Selecciona una opción</option>
        <option value="ine">INE (Frente y Reverso)</option>
        <option value="pasaporte">Pasaporte</option>
      </select>
      <div id="contenedor-identificacion"></div>`;
    form.innerHTML += generarInputArchivo('CURP', 'vendedor_curp');
    form.innerHTML += generarInputArchivo('Constancia de situación fiscal 2025', 'vendedor_fiscal');
    form.innerHTML += generarInputArchivo('Acta de matrimonio vigente', 'vendedor_matrimonio');
    form.innerHTML += generarInputArchivo('Acta de nacimiento', 'vendedor_nacimiento');
    form.innerHTML += generarInputArchivo('Comprobante de domicilio', 'vendedor_domicilio');
    form.innerHTML += `<h4>Datos generales del vendedor</h4>`;
    form.innerHTML += generarInputTexto('Lugar de nacimiento', 'vendedor_lugar_nacimiento');
    form.innerHTML += generarInputTexto('Ocupación', 'vendedor_ocupacion');
    form.innerHTML += generarInputTexto('Estado civil', 'vendedor_estado_civil');
    form.innerHTML += generarInputTexto('Número de teléfono', 'vendedor_telefono');
    form.innerHTML += generarInputTexto('Correo electrónico', 'vendedor_correo', 'email');
    form.innerHTML += generarInputTexto('Edad', 'vendedor_edad', 'number');
    form.innerHTML += `
      <div id="campo-certificado-medico" style="display:none">
        <label>Certificado médico:</label>
        <input type="file" name="vendedor_certificado_medico" />
      </div>`;
    form.innerHTML += generarInputArchivo('Avalúo catastral', 'vendedor_avaluo');

    form.innerHTML += `<h3>Documentos del Comprador</h3>`;
    form.innerHTML += generarInputArchivo('Identificación oficial vigente', 'comprador_identificacion');
    form.innerHTML += generarInputArchivo('CURP', 'comprador_curp');
    form.innerHTML += generarInputArchivo('Constancia de situación fiscal 2025', 'comprador_fiscal');
    form.innerHTML += generarInputArchivo('Acta de nacimiento', 'comprador_nacimiento');
    form.innerHTML += generarInputArchivo('Comprobante de domicilio', 'comprador_domicilio');
    form.innerHTML += `<h4>Datos generales del comprador</h4>`;
    form.innerHTML += generarInputTexto('Lugar de nacimiento', 'comprador_lugar_nacimiento');
    form.innerHTML += generarInputTexto('Ocupación', 'comprador_ocupacion');
    form.innerHTML += generarInputTexto('Estado civil', 'comprador_estado_civil');
    form.innerHTML += generarInputTexto('Número de teléfono', 'comprador_telefono');
    form.innerHTML += generarInputTexto('Correo electrónico', 'comprador_correo', 'email');
    form.innerHTML += generarInputTexto(
    'Agrega tu número de teléfono para que el notario pueda contactarte en caso de algún inconveniente',
    'telefono_usuario',
    'tel'
    );

    form.innerHTML += `
      <div class="contenedor-boton">
        <button type="submit" class="btn-enviar">
          <i class="fas fa-paper-plane"></i> Enviar Trámite
        </button>
      </div>`;

  // Agrega el formulario al contenedor
  if (!contenedorFormulario) {
    console.error('Error: contenedorFormulario no está definido');
    return;
  }
  contenedorFormulario.appendChild(form);

  form.querySelector('input[name="vendedor_edad"]').addEventListener('input', (e) => {
    const edad = parseInt(e.target.value, 10);
    document.getElementById('campo-certificado-medico').style.display = (edad >= 65) ? 'block' : 'none';
  });

  const selectorId = form.querySelector('#tipo_identificacion');
  const contenedorId = form.querySelector('#contenedor-identificacion');

  selectorId.addEventListener('change', () => {
    contenedorId.innerHTML = '';
    if (selectorId.value === 'ine') {
  contenedorId.innerHTML = `
    <label>INE Frente:</label>
    <input type="file" name="vendedor_ine_frente" accept=".pdf" required />
    <label>INE Reverso:</label>
    <input type="file" name="vendedor_ine_reverso" accept=".pdf" required />
  `;
} else if (selectorId.value === 'pasaporte') {
  contenedorId.innerHTML = `
    <label>Pasaporte:</label>
    <input type="file" name="vendedor_pasaporte" accept=".pdf" required />
  `;
}
  });

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (typeof bloqueandoCambioTramite === 'undefined') window.bloqueandoCambioTramite = false;

  if (window.bloqueandoCambioTramite) {
    alert('Por favor espera antes de enviar otro trámite.');
    return;
  }

  const telefonoInputs = form.querySelectorAll('input[name$="telefono"]');
  for (const input of telefonoInputs) {
    const val = input.value.trim();
    if (!/^\d{10}$/.test(val)) {
      alert(`El campo "${input.name}" debe contener exactamente 10 dígitos numéricos.`);
      input.focus();
      return;
    }
  }

  const emailInputs = form.querySelectorAll('input[type="email"]');
  for (const input of emailInputs) {
    const correo = input.value.trim();
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regexCorreo.test(correo)) {
      alert(`El campo "${input.name}" debe contener un correo válido.`);
      bloqueandoCambioTramite = false;
      input.focus();
      return;
    }
  }

  bloqueandoCambioTramite = true;

  const formData = new FormData();
  formData.append('tipoTramite', 'compraventa');

  const inputsTexto = form.querySelectorAll('input[type="text"], input[type="number"], input[type="tel"], input[type="email"], select');
  inputsTexto.forEach(input => {
    if (input.name && input.value.trim() !== '') {
      formData.append(input.name, input.value.trim());
    }
  });

  form.querySelectorAll('input[type="file"]').forEach(input => {
    if (input.files.length > 0) {
      formData.append(input.name, input.files[0]);
    }
  });

  if (typeof token === 'undefined') {
    alert('Error: token no definido. Debes iniciar sesión.');
    bloqueandoCambioTramite = false;
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/tramites/crear`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    if (response.ok) {
      contenedorId.innerHTML = '';
      document.getElementById('campo-certificado-medico').style.display = 'none';
      form.reset();
      window.location.href = 'tramites.html';

      setTimeout(() => { bloqueandoCambioTramite = false; }, 20000);
    } else {
      alert('Error al enviar trámite: ' + (result.mensaje || result.error));
      bloqueandoCambioTramite = false;
    }
  } catch (error) {
    alert('Error de red: ' + error.message);
    bloqueandoCambioTramite = false;
  }
});

} 


//formulario de donacion 
function generarFormularioDonacion(){
  const form = document.createElement('form');
  form.method = 'POST';
  form.enctype = 'multipart/form-data';
  form.action = ''; // Evita recarga

  form.innerHTML += `<h3>Documentos del Donante</h3>`;
  form.innerHTML += generarInputArchivo('Escritura original del inmueble', 'donante_escritura');
  form.innerHTML += generarInputArchivo('Pago predial 2025', 'donante_predial');
  form.innerHTML += generarInputArchivo('Constancia de no adeudo agua 2025', 'donante_agua');
  form.innerHTML += `
    <label for="tipo_identificacion_donante">Tipo de identificación oficial vigente:</label>
    <select id="tipo_identificacion_donante" name="tipo_identificacion_donante" required>
      <option value="" disabled selected>Selecciona una opción</option>
      <option value="ine">INE (Frente y Reverso)</option>
      <option value="pasaporte">Pasaporte</option>
    </select>
    <div id="contenedor-identificacion-donante"></div>`;
  form.innerHTML += generarInputArchivo('Acta de matrimonio vigente', 'donante_matrimonio');
  form.innerHTML += generarInputArchivo('Acta de nacimiento', 'donante_nacimiento');
  form.innerHTML += generarInputArchivo('Constancia de situación fiscal 2025', 'donante_fiscal');
  form.innerHTML += generarInputArchivo('Comprobante de domicilio', 'donante_domicilio');
  form.innerHTML += `<h4>Datos generales del donante</h4>`;
  form.innerHTML += generarInputTexto('Lugar de nacimiento', 'donante_lugar_nacimiento');
  form.innerHTML += generarInputTexto('Ocupación', 'donante_ocupacion');
  form.innerHTML += generarInputTexto('Estado civil', 'donante_estado_civil');
  form.innerHTML += generarInputTexto('Número de teléfono', 'donante_telefono');
  form.innerHTML += generarInputTexto('Correo electrónico', 'donante_correo', 'email'); // ← corregido
  form.innerHTML += generarInputTexto('Edad', 'donante_edad', 'number');
  form.innerHTML += `
    <div id="campo-certificado-medico-donante" style="display:none">
      <label>Certificado médico:</label>
      <input type="file" name="donante_certificado_medico" />
    </div>`;
  form.innerHTML += generarInputArchivo('Avalúo catastral', 'donante_avaluo');

  form.innerHTML += `<h3>Documentos del Donatario</h3>`;
  form.innerHTML += `
    <label for="tipo_identificacion_donatario">Tipo de identificación oficial vigente:</label>
    <select id="tipo_identificacion_donatario" name="tipo_identificacion_donatario" required>
      <option value="" disabled selected>Selecciona una opción</option>
      <option value="ine">INE (Frente y Reverso)</option>
      <option value="pasaporte">Pasaporte</option>
    </select>
    <div id="contenedor-identificacion-donatario"></div>`;
  form.innerHTML += generarInputArchivo('Acta de nacimiento', 'donatario_nacimiento');
  form.innerHTML += generarInputArchivo('Constancia de situación fiscal 2025', 'donatario_fiscal');
  form.innerHTML += generarInputArchivo('Comprobante de domicilio', 'donatario_domicilio');
  form.innerHTML += `<h4>Datos generales del donatario</h4>`;
  form.innerHTML += generarInputTexto('Lugar de nacimiento', 'donatario_lugar_nacimiento');
  form.innerHTML += generarInputTexto('Ocupación', 'donatario_ocupacion');
  form.innerHTML += generarInputTexto('Estado civil', 'donatario_estado_civil');
  form.innerHTML += generarInputTexto('Número de teléfono', 'donatario_telefono');
  form.innerHTML += generarInputTexto('Correo electrónico', 'donatario_correo', 'email'); // ← corregido

  form.innerHTML += generarInputTexto(
    'Agrega tu número de teléfono para que el notario pueda contactarte en caso de algún inconveniente',
    'telefono_usuario',
    'tel'
  );

  form.innerHTML += `
    <div class="contenedor-boton">
      <button type="submit" class="btn-enviar">
        <i class="fas fa-paper-plane"></i> Enviar Trámite
      </button>
    </div>`;

  if (!contenedorFormulario) {
    console.error('Error: contenedorFormulario no está definido');
    return;
  }
  contenedorFormulario.appendChild(form);

  // Mostrar certificado médico si edad donante >= 65
  form.querySelector('input[name="donante_edad"]').addEventListener('input', (e) => {
    const edad = parseInt(e.target.value, 10);
    document.getElementById('campo-certificado-medico-donante').style.display = (edad >= 65) ? 'block' : 'none';
  });

  const selectorIdDonante = form.querySelector('#tipo_identificacion_donante');
  const contenedorIdDonante = form.querySelector('#contenedor-identificacion-donante');

  selectorIdDonante.addEventListener('change', () => {
    contenedorIdDonante.innerHTML = '';
    if (selectorIdDonante.value === 'ine') {
      contenedorIdDonante.innerHTML = `
        <label>INE Frente:</label>
        <input type="file" name="donante_ine_frente" accept=".pdf" required />
        <label>INE Reverso:</label>
        <input type="file" name="donante_ine_reverso" accept=".pdf" required />
      `;
    } else if (selectorIdDonante.value === 'pasaporte') {
      contenedorIdDonante.innerHTML = `
        <label>Pasaporte:</label>
        <input type="file" name="donante_pasaporte" accept=".pdf" required />
      `;
    }
  });

  // Selector identificación donatario
  const selectorIdDonatario = form.querySelector('#tipo_identificacion_donatario');
  const contenedorIdDonatario = form.querySelector('#contenedor-identificacion-donatario');

  selectorIdDonatario.addEventListener('change', () => {
    contenedorIdDonatario.innerHTML = '';
    if (selectorIdDonatario.value === 'ine') {
      contenedorIdDonatario.innerHTML = `
        <label>INE Frente:</label>
        <input type="file" name="donatario_ine_frente" required />
        <label>INE Reverso:</label>
        <input type="file" name="donatario_ine_reverso" required />
      `;
    } else if (selectorIdDonatario.value === 'pasaporte') {
      contenedorIdDonatario.innerHTML = `
        <label>Pasaporte:</label>
        <input type="file" name="donatario_pasaporte" required />
      `;
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (typeof bloqueandoCambioTramite === 'undefined') window.bloqueandoCambioTramite = false;

    if (window.bloqueandoCambioTramite) {
      alert('Por favor espera antes de enviar otro trámite.');
      return;
    }

    const telefonoInputs = form.querySelectorAll('input[name$="telefono"]');
    for (const input of telefonoInputs) {
      const val = input.value.trim();
      if (!/^\d{10}$/.test(val)) {
        alert(`El campo "${input.name}" debe contener exactamente 10 dígitos numéricos.`);
        input.focus();
        return;
      }
    }

    const emailInputs = form.querySelectorAll('input[type="email"]');
    for (const input of emailInputs) {
      const correo = input.value.trim();
      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!regexCorreo.test(correo)) {
        alert(`El campo "${input.name}" debe contener un correo válido.`);
        bloqueandoCambioTramite = false;
        input.focus();
        return;
      }
    }

    bloqueandoCambioTramite = true;

    const formData = new FormData();
    formData.append('tipoTramite', 'donacion');

    const inputsTexto = form.querySelectorAll('input[type="text"], input[type="number"], input[type="tel"], input[type="email"], select');
    inputsTexto.forEach(input => {
      if (input.name && input.value.trim() !== '') {
        formData.append(input.name, input.value.trim());
      }
    });

    form.querySelectorAll('input[type="file"]').forEach(input => {
      if (input.files.length > 0) {
        formData.append(input.name, input.files[0]);
      }
    });

    if (typeof token === 'undefined') {
      alert('Error: token no definido. Debes iniciar sesión.');
      bloqueandoCambioTramite = false;
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tramites/crear`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        contenedorIdDonante.innerHTML = '';
        contenedorIdDonatario.innerHTML = '';
        document.getElementById('campo-certificado-medico-donante').style.display = 'none';
        form.reset();
        window.location.href = 'tramites.html';

        setTimeout(() => { bloqueandoCambioTramite = false; }, 20000);
      } else {
        alert('Error al enviar trámite: ' + (result.mensaje || result.error));
        bloqueandoCambioTramite = false;
      }
    } catch (error) {
      alert('Error de red: ' + error.message);
      bloqueandoCambioTramite = false;
    }
  });
}




});//fin del dom todo formulario va antes 