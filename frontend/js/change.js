import API_BASE_URL from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('No has iniciado sesión');
    window.location.href = 'login.html';
    return;
  }

  const decoded = (() => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return {};
    }
  })();

  if (!decoded.requiereCambioPassword) {
    alert('Acceso no autorizado');
   
    if (decoded.rol === 'admin') {
      window.location.href = 'admin.html';
    } else if (decoded.rol === 'notario') {
      window.location.href = 'notario.html';
    } else {
      window.location.href = 'usuario.html';
    }
    return;
  }

  document.getElementById('form-cambiar').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nueva = document.getElementById('nueva').value.trim();
    const confirmar = document.getElementById('confirmar').value.trim();

    const errorNueva = document.getElementById('error-nueva');
    const errorConfirmar = document.getElementById('error-confirmar');

    [errorNueva, errorConfirmar].forEach(el => el.textContent = '');

    let hayError = false;
    const regexPassword = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;

    if (!regexPassword.test(nueva)) {
      errorNueva.textContent = '⚠️ La contraseña debe tener al menos 6 caracteres, incluir letras y números, sin símbolos ni espacios.';
      hayError = true;
    }

    if (nueva !== confirmar) {
      errorConfirmar.textContent = '⚠️ Las contraseñas no coinciden.';
      hayError = true;
    }

    if (hayError) return;

    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/cambiar-password-primera-vez`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nuevaContrasena: nueva })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Contraseña actualizada. Redirigiendo...');
        localStorage.setItem('token', data.token);
        window.location.href = 'notario.html';
      } else {
        alert(data.mensaje || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      console.error(error);
      alert('Error de red o del servidor');
    }
  });
});
