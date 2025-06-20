import API_BASE_URL from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) return mostrarMensaje('Acceso denegado. Por favor inicia sesión para continuar.', () => {
      window.location.href = 'index.html';
    });

  const decoded = (() => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return {};
    }
  })();

  if (decoded.rol !== 'notario') {
    return mostrarMensaje('Acceso no autorizado. Cerrando sesión...', () => {
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    });
  }

  document.getElementById('saludo-notario').textContent = `Bienvenido, ${decoded?.nombre || 'Notario'}`;

  document.getElementById('cerrar-sesion')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });

  window.descargarArchivos = (tramiteId) => {
    const url = `${API_BASE_URL}/notario/tramites/${tramiteId}/descargar-archivos?token=${token}`;
    window.open(url, '_blank');
  };

  const contenedor = document.getElementById('contenedor-tramites');
  const modal = document.getElementById('modal-finalizar');
  const modalConfirmacion = document.getElementById('modal-confirmacion-final');
  const overlay = document.getElementById('overlay-mensaje');
  const mensajeOverlay = document.getElementById('mensaje-overlay');
  const textarea = document.getElementById('observacionesFinal');
  const btnConfirmar = document.getElementById('btn-confirmar-finalizar');
  const btnConfirmarEnvio = document.getElementById('btn-confirmar-envio');
  const errorMsg = document.getElementById('error-observaciones');

  let tramiteSeleccionadoId = null;

  textarea.addEventListener('input', () => {
    const texto = textarea.value.trim();
    errorMsg.style.display = texto ? 'none' : 'block';
    btnConfirmar.disabled = !texto;
  });

  function abrirModalFinalizar() {
    textarea.value = '';
    errorMsg.style.display = 'none';
    btnConfirmar.disabled = true;
    modal.style.display = 'flex';
  }

  document.getElementById('btn-cancelar-finalizar').addEventListener('click', () => {
    modal.style.display = 'none';
    tramiteSeleccionadoId = null;
    textarea.value = '';
    btnConfirmar.disabled = true;
    errorMsg.style.display = 'none';
  });

  document.getElementById('btn-cancelar-confirmacion').addEventListener('click', () => {
    modalConfirmacion.style.display = 'none';
  });

  btnConfirmar.addEventListener('click', () => {
    const texto = textarea.value.trim();
    if (!texto) {
      errorMsg.style.display = 'block';
      btnConfirmar.disabled = true;
      return;
    }

    modal.style.display = 'none';
    modalConfirmacion.style.display = 'flex';
  });

  btnConfirmarEnvio.addEventListener('click', () => {
  if (!tramiteSeleccionadoId) return;
  
  const observacionesUsuario = textarea.value.trim();
  const textoFijo = 'Su trámite ha sido finalizado con éxito, favor de seguir las siguientes indicaciones:\n\n';
  const observaciones = textoFijo + observacionesUsuario;

  fetch(`${API_BASE_URL}/notario/tramites/${tramiteSeleccionadoId}/finalizar`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ observaciones })
  })
  .then(res => {
    if (!res.ok) throw new Error('No se pudo finalizar el trámite');
    return res.json();
  })
  .then(data => {
    modalConfirmacion.style.display = 'none';
    tramiteSeleccionadoId = null;
    textarea.value = '';
    btnConfirmar.disabled = true;

    const tramiteDiv = document.querySelector(`[data-id="${data.tramite._id}"]`);
    if (tramiteDiv) tramiteDiv.remove();

    localStorage.setItem('tramite-finalizado', JSON.stringify({
      id: data.tramite._id,
      observaciones: data.tramite.observaciones || ''
    }));

    window.dispatchEvent(new CustomEvent('tramiteFinalizado', { detail: data.tramite }));

    mensajeOverlay.textContent = data.tramite.observaciones
      ? `✅ El trámite ha sido finalizado con las siguientes observaciones:\n${data.tramite.observaciones}`
      : '✅ El trámite ha sido finalizado con éxito.';

    overlay.style.display = 'flex';
  })
  .catch(err => {
    console.error(err);
    alert('No se pudo finalizar el trámite');
  });
});




  document.getElementById('cerrar-overlay').addEventListener('click', () => {
    overlay.style.display = 'none';
  });

 
  fetch(`${API_BASE_URL}/notario/tramites/asignados`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => {
      if (res.status === 403) {
        throw new Error('Acceso denegado');
      }
      if (!res.ok) throw new Error('No se pudo obtener los trámites');
      return res.json();
    })
    .then(data => {
      if (!data.length) {
        contenedor.innerHTML = '<p>No tienes trámites asignados.</p>';
        return;
      }

      data.forEach(tramite => {
        const div = document.createElement('div');
        div.classList.add('tramite');
        div.dataset.id = tramite._id;

        let archivosHTML = '';
        let mostrarTodosBtn = '';

        if (tramite.documentos?.length) {
          const primeros = tramite.documentos.slice(0, 3);
          const extras = tramite.documentos.slice(3);

          archivosHTML = primeros.map(a => `
            <li><a href="${API_BASE_URL.replace('/api', '')}${a.url}" target="_blank">${a.nombreArchivo || a.url.split('/').pop()}</a></li>
          `).join('');

          archivosHTML += extras.map(a => `
            <li class="archivo-extra" style="display:none;">
              <a href="${API_BASE_URL.replace('/api', '')}${a.url}" target="_blank">${a.nombreArchivo || a.url.split('/').pop()}</a>
            </li>
          `).join('');

          if (extras.length) {
            mostrarTodosBtn = `<button class="btn-estandar ver-todos-btn"><i class="fas fa-check"></i>Ver todos (${tramite.documentos.length})</button>`;
          }
        } else {
          archivosHTML = '<li>No hay archivos</li>';
        }

        const fechaO = tramite.createdAt || tramite.fechaSolicitud;
        const fechaF = fechaO && !isNaN(new Date(fechaO)) ? new Date(fechaO).toLocaleDateString('es-MX') : 'Sin fecha';

        const botonFinalizar = tramite.estado.toLowerCase() !== 'finalizado'
          ? `<button class="btn-estandar btn-finalizar"><i class="fas fa-check"></i>Finalizar trámite</button>`
          : '';

        div.innerHTML = `
          <h4>${tramite.tipoTramite}</h4>
          <p><strong>Solicitante:</strong> ${tramite.usuario?.nombre || 'Desconocido'}</p>
          <p><strong>Observaciones:</strong> ${tramite.observaciones || 'Ninguna'}</p>
          <p><strong>Estado:</strong> <span class="estado">${tramite.estado}</span></p>
          <p><strong>Fecha:</strong> ${fechaF}</p>
          <p><strong>Archivos:</strong></p>
          <ul>${archivosHTML}</ul>
          ${mostrarTodosBtn}
          <button onclick="descargarArchivos('${tramite._id}')" class="btn-estandar">Descargar archivos</button>
          ${botonFinalizar}
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

        const btnFinalizar = div.querySelector('.btn-finalizar');
        if (btnFinalizar) {
          btnFinalizar.addEventListener('click', () => {
            tramiteSeleccionadoId = tramite._id;
            abrirModalFinalizar();
          });
        }

        contenedor.appendChild(div);
      });
    })
    .catch(error => {
      console.error(error);

      if (error.message.includes('Acceso denegado') || error.message.includes('Acceso restringido')) {
        localStorage.removeItem('token');
        mostrarMensaje('Acceso no autorizado. Cerrando sesión...', () => {
          window.location.href = 'index.html';
        });
      } else {
        mostrarMensaje(error.message || 'Error al cargar trámites asignados');
      }
    });


  function mostrarMensaje(mensaje, callback) {
    let overlay = document.getElementById('overlay-mensaje');
    let mensajeOverlay = document.getElementById('mensaje-overlay');

    if (!overlay || !mensajeOverlay) {
      overlay = document.createElement('div');
      overlay.id = 'overlay-mensaje';
      overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.7);
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        text-align: center;
        padding: 2rem;
      `;

      mensajeOverlay = document.createElement('div');
      mensajeOverlay.id = 'mensaje-overlay';
      mensajeOverlay.style.cssText = `
        background: #222;
        padding: 1.5rem 2rem;
        border-radius: 8px;
        font-size: 1.1rem;
        cursor: pointer;
        max-width: 90%;
      `;

      overlay.appendChild(mensajeOverlay);
      document.body.appendChild(overlay);
    }

    mensajeOverlay.textContent = mensaje;
    overlay.style.display = 'flex';

    const cerrar = () => {
      overlay.style.display = 'none';
      overlay.removeEventListener('click', cerrar);
      if (typeof callback === 'function') callback();
    };

    overlay.addEventListener('click', cerrar);
  }
});
