import API_BASE_URL from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('⚠️ ! Error No has iniciado sesión !');
    window.location.href = 'login.html';
    return;
  }

  // Decodificar token para verificar si es admin
  let decoded = {};
  try {
    decoded = JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.error('Error al decodificar token:', e);
  }

  if (decoded.rol !== 'admin') {
    alert('⚠️ Acceso no autorizado, panel exclusivo para administradores ⚠️');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
    return;
  }

  const nombreAdmin = decoded.nombre || 'Administrador';
  const saludoEl = document.getElementById('saludo-admin');
  if (saludoEl) {
    saludoEl.textContent = `Bienvenido, ${nombreAdmin}`;
  }

  // Cerrar sesión
  const btnCerrar = document.getElementById('cerrar-sesion');
  if (btnCerrar) {
    btnCerrar.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = 'index.html';
    });
  }

  // Modal cambio contraseña usuario
  const overlay = document.getElementById('overlay');
  const modal = document.getElementById('modal');
  const inputNuevaContrasena = document.getElementById('nuevaContrasena');
  const btnGuardar = document.getElementById('btnGuardar');
  const btnCancelar = document.getElementById('btnCancelar');

  let idUsuarioSeleccionado = null;

  btnCancelar.addEventListener('click', () => {
    overlay.style.display = 'none';
    modal.style.display = 'none';
    inputNuevaContrasena.value = '';
    idUsuarioSeleccionado = null;
  });

  // Modal para verificar contraseña admin
  const modalVerificar = document.createElement('div');
  modalVerificar.innerHTML = `
    <div id="modal-verificar" style="position:fixed;top:0;left:0;width:100vw;height:100vh;
         background: rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center;">
      <div style="background:#fff; padding:20px; border-radius:8px; width:300px; text-align:center;">
        <h3>Verifica tu contraseña de admin</h3>
        <input type="password" id="inputVerificarPass" placeholder="Contraseña admin" style="width:100%; padding:8px; margin:10px 0;" />
        <button id="btnConfirmarVerificar">Confirmar</button>
        <button id="btnCancelarVerificar">Cancelar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modalVerificar);
  const modalVerificarEl = document.getElementById('modal-verificar');
  const inputVerificarPass = document.getElementById('inputVerificarPass');
  const btnConfirmarVerificar = document.getElementById('btnConfirmarVerificar');
  const btnCancelarVerificar = document.getElementById('btnCancelarVerificar');

  modalVerificarEl.style.display = 'none';

  let accionPendiente = null;  

  function abrirModalVerificar(accion) {
    accionPendiente = accion;
    inputVerificarPass.value = '';
    modalVerificarEl.style.display = 'flex';

    // Oculta el modal principal mientras se verifica
    modal.style.display = 'none';
    overlay.style.display = 'none';

    inputVerificarPass.focus();
  }

  btnCancelarVerificar.addEventListener('click', () => {
    modalVerificarEl.style.display = 'none';

    // Si se estaba intentando cambiar la contraseña, reabrimos el modal original
    if (idUsuarioSeleccionado) {
      modal.style.display = 'block';
      overlay.style.display = 'block';
    }

    accionPendiente = null;
  });

  btnConfirmarVerificar.addEventListener('click', async () => {
    const passAdmin = inputVerificarPass.value.trim();
    if (!passAdmin) {
      alert('Por favor ingresa tu contraseña de admin');
      return;
    }
    try {
      await accionPendiente(passAdmin);
      modalVerificarEl.style.display = 'none';
    } catch (error) {
      alert(error.message || 'Error en verificación');
    }
  });

  // Obtener y mostrar usuarios y notarios
  try {
    const res = await fetch(`${API_BASE_URL}/admin/usuarios`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const datos = await res.json();

    if (!res.ok) throw new Error(datos.mensaje || 'Error al obtener usuarios');

    const tbody = document.querySelector('#usuariosTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    datos.usuarios.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.nombre}</td>
        <td>${u.telefono || ''}</td>
        <td>${u.rol}</td>
        <td>
          <button class="btn-reset" data-id="${u._id}">Resetear contraseña</button>
          <button class="btn-cambiar" data-id="${u._id}">Cambiar contraseña</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Listener para botones reset y cambiar
    tbody.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-reset')) {
        const id = e.target.getAttribute('data-id');
        abrirModalVerificar(async (passAdmin) => {
          const resReset = await fetch(`${API_BASE_URL}/admin/usuarios/${id}/contrasena`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nuevaContrasena: '12345678', adminContrasena: passAdmin })
          });
          const result = await resReset.json();
          if (!resReset.ok) throw new Error(result.mensaje || 'Error al resetear contraseña');
          alert(`✅ ${result.mensaje}`);
        });
      }

      if (e.target.classList.contains('btn-cambiar')) {
        idUsuarioSeleccionado = e.target.getAttribute('data-id');
        inputNuevaContrasena.value = '';
        overlay.style.display = 'block';
        modal.style.display = 'block';
      }
    });

    // Guardar nueva contraseña con verificación
    btnGuardar.addEventListener('click', () => {
      const nuevaPass = inputNuevaContrasena.value.trim();
      if (!nuevaPass) {
        alert('Por favor ingresa una nueva contraseña');
        return;
      }
      abrirModalVerificar(async (passAdmin) => {
        const resCambiar = await fetch(`${API_BASE_URL}/admin/usuarios/${idUsuarioSeleccionado}/contrasena`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nuevaContrasena: nuevaPass, adminContrasena: passAdmin })
        });
        const result = await resCambiar.json();
        if (!resCambiar.ok) throw new Error(result.mensaje || 'Error al cambiar contraseña');
        alert(`✅ ${result.mensaje}`);
        overlay.style.display = 'none';
        modal.style.display = 'none';
        inputNuevaContrasena.value = '';
      });
    });
  } catch (err) {
    console.error(err);
    alert('⚠️ Error al cargar datos de usuarios');
  }
});
