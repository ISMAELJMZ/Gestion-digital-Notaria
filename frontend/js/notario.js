import API_BASE_URL from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return mostrarMensaje('No has iniciado sesión', () => {
      window.location.href = 'login.html';
    });
  }

  const decoded = (() => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return {};
    }
  })();

  const decodeUTF8 = (text) => {
    try {
      return decodeURIComponent(escape(text));
    } catch {
      return text;
    }
  };

  const notarioLogueado = {
    _id: decoded?.id || decoded?._id || '',
    nombre: decoded?.nombre ? decodeUTF8(decoded.nombre) : 'Notario'
  };

  document.getElementById('saludo-notario').textContent = `Bienvenido, ${notarioLogueado.nombre}`;

  document.getElementById('cerrar-sesion')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });

  const secciones = {
    pendiente: document.getElementById('grupo-pendiente'),
    'en proceso': document.getElementById('grupo-en-proceso'),
    completado: document.getElementById('grupo-completado')
  };

  Object.values(secciones).forEach(div => div.innerHTML = '');
  fetch(`${API_BASE_URL}/tramites/todos`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(async res => {
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.mensaje || 'Error al obtener trámites');
    }
    return res.json();
  })
  .then(data => {
    if (!data.length) {
      Object.values(secciones).forEach(div => {
        div.innerHTML = '<p>No tienes trámites aún.</p>';
      });
      return;
    }

    data.forEach(tramite => {
      const div = crearElementoTramite(tramite);
      const estadoKey = tramite.estado === 'finalizado' ? 'completado' : tramite.estado;
      const seccion = secciones[estadoKey] || secciones['pendiente'];
      seccion.appendChild(div);
    });
  })
  .catch(error => {
    
    if (error.message.includes('Acceso denegado') || error.message.includes('Acceso restringido')) {
      localStorage.removeItem('token');
      mostrarMensaje('Acceso no autorizado. Cerrando sesión...', () => {
      window.location.href = 'index.html';
      });
    } else {
      mostrarMensaje(error.message || 'Error al cargar trámites');
    }
  });


  function crearElementoTramite(tramite) {
  const div = document.createElement('div');
  div.classList.add('tramite');
  div.dataset.id = tramite._id;

  const BASE_PUBLIC_URL = API_BASE_URL.replace('/api', ''); 

  let archivosHTML = '';
  let mostrarTodosBtn = '';

  if (tramite.documentos?.length) {
    const primeros = tramite.documentos.slice(0, 3);
    const extras = tramite.documentos.slice(3);

    archivosHTML = primeros.map(a => `
      <li>
        <a href="${BASE_PUBLIC_URL}${a.url}" target="_blank" rel="noopener noreferrer">
          ${a.nombreArchivo || a.url.split('/').pop()}
        </a>
      </li>
    `).join('');

    archivosHTML += extras.map(a => `
      <li class="archivo-extra" style="display:none;">
        <a href="${BASE_PUBLIC_URL}${a.url}" target="_blank" rel="noopener noreferrer">
          ${a.nombreArchivo || a.url.split('/').pop()}
        </a>
      </li>
    `).join('');

    if (extras.length) {
      mostrarTodosBtn = `<button class="ver-todos-btn">Ver todos (${tramite.documentos.length})</button>`;
    }
  } else {
    archivosHTML = '<li>No hay archivos</li>';
  }

  const fechaO = tramite.createdAt || tramite.fechaSolicitud;
  const fechaF = fechaO && !isNaN(new Date(fechaO)) ? new Date(fechaO).toLocaleDateString('es-MX') : 'Sin fecha';

  let accionHTML = '';

  if (tramite.estado === 'pendiente' && !tramite.notario) {
    accionHTML = `<button class="btn-estandar" >Procesar</button>`;

  } else if (tramite.estado === 'en proceso') {
    const idTramite = tramite.notario?._id?.toString().trim();
    const idLogueado = notarioLogueado._id?.toString().trim();

    if (idTramite && idLogueado && idTramite === idLogueado) {
      accionHTML = `<p class="mensaje-notario">Este trámite está siendo atendido por ti.</p>`;
    } else {
      const nombreAsignado = tramite.notario?.nombre || 'otro notario';
      accionHTML = `<p class="mensaje-notario">Este trámite está siendo atendido por: <strong>${nombreAsignado}</strong></p>`;
    }
  }

  const estadoVisual = tramite.estado === 'finalizado' ? 'completado' : tramite.estado;

  div.innerHTML = `
    <h4>${tramite.tipoTramite}</h4>
    <p><strong>Solicitante:</strong> ${tramite.usuario?.nombre || 'Desconocido'}</p>
    <p><strong>Teléfono:</strong> ${tramite.usuario?.telefono || 'No disponible'}</p>
    <p><strong>Observaciones:</strong> ${tramite.observaciones || 'Ninguna'}</p>
    <p><strong>Estado:</strong> <span class="estado">${estadoVisual}</span></p>
    <p><strong>Fecha:</strong> ${fechaF}</p>
    <p><strong>Archivos:</strong></p>
    <ul>${archivosHTML}</ul>
    ${mostrarTodosBtn}
    ${accionHTML}
  `;

  const btnVer = div.querySelector('.ver-todos-btn');
  if (btnVer) {
    btnVer.addEventListener('click', () => {
      const extras = div.querySelectorAll('.archivo-extra');
      const ocultos = [...extras].some(e => e.style.display === 'none');
      extras.forEach(e => e.style.display = ocultos ? 'list-item' : 'none');
      btnVer.textContent = ocultos ? 'Ver menos' : `Ver todos (${tramite.documentos.length})`;
    });
  }

  const btnProcesar = div.querySelector('.btn-estandar');
if (btnProcesar) {
  btnProcesar.addEventListener('click', () => {
    fetch(`${API_BASE_URL}/notario/tramites/${tramite._id}/asignar`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        mostrarMensaje("✅ Se te ha asignado el trámite y ahora se encuentra en proceso. Serás redirigido al panel de tus trámites asignados.");
        setTimeout(() => {
          window.location.href = 'mis-tramites.html';
        }, 4000);
      })
      .catch(() => {
        mostrarMensaje('Error al asignar trámite');
      });
  });
}


  return div;
}


  function actualizarTramiteEnPanelGeneral(tramite) {
    const div = document.querySelector(`.tramite[data-id="${tramite._id}"]`);
    if (!div) return;

    div.querySelector('.estado').textContent = 'completado';
    div.querySelector('.btn-procesar')?.remove();

    const obs = div.querySelector('p:nth-of-type(3)');
    if (obs) obs.innerHTML = `<strong>Observaciones:</strong> ${tramite.observaciones || 'Ninguna'}`;

    const destino = secciones.completado;
    if (div.parentElement !== destino) {
      div.parentElement?.removeChild(div);
      destino.appendChild(div);
    }
  }

  window.addEventListener('tramiteFinalizado', e => actualizarTramiteEnPanelGeneral(e.detail));

  window.addEventListener('storage', e => {
    if (e.key === 'tramite-finalizado' && e.newValue) {
      try {
        const tramite = JSON.parse(e.newValue);
        actualizarTramiteEnPanelGeneral(tramite);
        localStorage.removeItem('tramite-finalizado');
      } catch {}
    }
  });

  const tramiteFinalizado = localStorage.getItem('tramite-finalizado');
  if (tramiteFinalizado) {
    try {
      const tramite = JSON.parse(tramiteFinalizado);
      actualizarTramiteEnPanelGeneral(tramite);
      localStorage.removeItem('tramite-finalizado');
    } catch {}
  }

  window.addEventListener('focus', () => {
    const tramiteFinalizado = localStorage.getItem('tramite-finalizado');
    if (tramiteFinalizado) {
      try {
        const tramite = JSON.parse(tramiteFinalizado);
        actualizarTramiteEnPanelGeneral(tramite);
        localStorage.removeItem('tramite-finalizado');
      } catch {}
    }
  });
});

function mostrarMensaje(texto, callback) {
  const modal = document.getElementById('modal-mensaje');
  const mensaje = document.getElementById('modal-texto');
  const cerrar = document.getElementById('modal-cerrar');

  if (!modal || !mensaje || !cerrar) return;

  mensaje.textContent = texto;
  modal.style.display = 'flex';

  const cerrarModal = () => {
    modal.style.display = 'none';
    cerrar.removeEventListener('click', cerrarModal);
    document.removeEventListener('click', clickFueraModal);
    if (typeof callback === 'function') callback();
  };

  const clickFueraModal = (e) => {
    if (e.target === modal) cerrarModal();
  };

  cerrar.addEventListener('click', cerrarModal);
  document.addEventListener('click', clickFueraModal);
}
