import API_BASE_URL from './config.js';

const form = document.getElementById('form-registro');

const nombreInput = document.getElementById('nombre');
const telefonoInput = document.getElementById('telefono');
const passwordInput = document.getElementById('password');

const errorNombre = document.getElementById('error-nombre');
const errorTelefono = document.getElementById('error-telefono');
const errorPassword = document.getElementById('error-password');
const advertenciaTelefono = document.getElementById('advertencia-telefono');

telefonoInput.addEventListener('input', () => {
  const soloDigitos = telefonoInput.value.replace(/\D/g, '');
  if (soloDigitos.length > 10) {
    advertenciaTelefono.textContent = '⚠️ El número tiene más de 10 dígitos.';
  } else {
    advertenciaTelefono.textContent = '';
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  [errorNombre, errorTelefono, errorPassword].forEach(el => el.textContent = '');
  advertenciaTelefono.textContent = '';

  let nombre = nombreInput.value.trim();
  const telefonoOriginal = telefonoInput.value.trim();
  const telefonoLimpio = telefonoOriginal.replace(/[\s\-]/g, '');
  const password = passwordInput.value;

  let hayError = false;

  if (!nombre) {
    errorNombre.textContent = '⚠️ El nombre es obligatorio.';
    hayError = true;
  }

  if (!/^\d{10}$/.test(telefonoLimpio)) {
    errorTelefono.textContent = '⚠️ Ingresa un número de teléfono válido (10 dígitos). Puedes usar espacios o guiones.';
    hayError = true;
  }

  if (!/^(?=.*[a-zA-Z])(?=.*\d).{6,}$/.test(password)) {
    errorPassword.textContent = '⚠️ La contraseña debe tener al menos 6 caracteres, e incluir letras y números.';
    hayError = true;
  }

  if (hayError) return;

  nombre = capitalizarNombre(nombre);

  try {
    const res = await fetch(`${API_BASE_URL}/usuarios/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nombre, telefono: telefonoLimpio, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorNombre.textContent = `⚠️ ${data.mensaje || 'Error al registrar.'}`;
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));

    window.location.href = 'usuario.html';
  } catch {
    errorNombre.textContent = '⚠️ Error de red. Intenta de nuevo.';
  }
});

function capitalizarNombre(nombre) {
  return nombre
    .toLowerCase()
    .split(' ')
    .filter(p => p.length > 0)
    .map(p => p[0].toUpperCase() + p.slice(1))
    .join(' ');
}
