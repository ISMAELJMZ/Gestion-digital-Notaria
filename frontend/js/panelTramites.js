import API_BASE_URL from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  const contenedor = document.getElementById('lista-tramites');
  const token = localStorage.getItem('token');

  btnCerrarSesion?.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });

 if (!token) {
  alert('No has iniciado sesión');
  setTimeout(() => window.location.href = 'login.html', 500);
  return;
}

let decoded = {};
try {
  decoded = JSON.parse(atob(token.split('.')[1]));
} catch {
  localStorage.removeItem('token');
  alert('Token inválido. Inicia sesión nuevamente.');
  setTimeout(() => window.location.href = 'login.html', 500);
  return;
}

if (decoded.rol !== 'usuario') {
  localStorage.removeItem('token');
  alert('Acceso denegado. Este panel es exclusivo para usuarios.');
  setTimeout(() => window.location.href = 'index.html', 500);
  return;
}

  try {
    const response = await fetch(`${API_BASE_URL}/tramites`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        alert('Sesión expirada. Inicia sesión nuevamente.');
        window.location.href = 'login.html';
      } else {
        throw new Error('No se pudieron obtener los trámites');
      }
      return;
    }

    const tramites = await response.json();

    if (!tramites.length) {
      contenedor.innerHTML = '<p>No tienes trámites registrados.</p>';
      return;
    }

    const BASE_PUBLIC_URL = API_BASE_URL.replace('/api', '');

    tramites.forEach(t => {
      const card = document.createElement('div');
      card.className = 'card';

      const fecha = new Date(t.fechaSolicitud).toLocaleString('es-MX', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      let mensajeEstado = '', claseEstado = '';
      switch (t.estado) {
        case 'pendiente':
          mensajeEstado = 'En espera de ser asignado a un notario.';
          claseEstado = 'estado-pendiente';
          break;
        case 'en proceso':
          claseEstado = 'estado-proceso';
          break;
        case 'finalizado':
          mensajeEstado = t.observaciones?.trim()
            ? t.observaciones
            : 'Este trámite ha sido finalizado. Revise sus documentos o mensajes.';
          claseEstado = 'estado-finalizado';
          break;
        default:
          mensajeEstado = 'Estado desconocido';
          claseEstado = 'estado-desconocido';
      }

      card.classList.add(claseEstado);

      card.innerHTML = `
        <h3>Trámite: ${t.tipoTramite}</h3>
        <p><strong>Fecha de solicitud:</strong> ${fecha}</p>
        ${t.estado !== 'en proceso' ? `
          <p class="estado-tramite"><strong>Estado:</strong> ${t.estado}</p>
          <p class="mensaje-estado">${mensajeEstado}</p>
        ` : ''}
      `;

      if (t.estado === 'en proceso' || t.estado === 'finalizado') {
        const overlay = document.createElement('div');
        overlay.className = t.estado === 'en proceso'
          ? 'overlay-proceso'
          : 'overlay-finalizado';

        overlay.textContent = t.estado === 'en proceso'
          ? 'Su trámite se encuentra en proceso, favor de esperar indicaciones.'
          : (t.observaciones?.trim()
            ? t.observaciones
            : 'Su trámite ha sido finalizado. Revise sus documentos o siga las indicaciones.');

        card.appendChild(overlay);
      }

      const documentosDiv = document.createElement('div');
      documentosDiv.className = 'documentos';

      const tituloDocs = document.createElement('strong');
      tituloDocs.textContent = 'Documentos adjuntados:';
      documentosDiv.appendChild(tituloDocs);

      const documentos = t.documentos || [];

      if (documentos.length > 0) {
  documentos.slice(0, 5).forEach(doc => {
    const link = document.createElement('a');
    link.href = `${BASE_PUBLIC_URL}${doc.url}`;
    link.target = '_blank';
    link.textContent = doc.nombreArchivo;
    documentosDiv.appendChild(link);
  });

  if (documentos.length > 5) {
    const ocultosDiv = document.createElement('div');
    ocultosDiv.className = 'archivos-ocultos';
    ocultosDiv.style.display = 'none';

    documentos.slice(5).forEach(doc => {
      const link = document.createElement('a');
      link.href = `${BASE_PUBLIC_URL}${doc.url}`;
      link.target = '_blank';
      link.textContent = doc.nombreArchivo;
      ocultosDiv.appendChild(link);
    });

    const boton = document.createElement('button');
    boton.className = 'btn-ver-mas';
    boton.textContent = 'Ver más';
    boton.addEventListener('click', () => {
      const visible = ocultosDiv.style.display === 'block';
      ocultosDiv.style.display = visible ? 'none' : 'block';
      boton.textContent = visible ? 'Ver más' : 'Ver menos';
    });

    documentosDiv.appendChild(ocultosDiv);
    documentosDiv.appendChild(boton);
  }
} else {
  const sinDocs = document.createElement('p');
  sinDocs.textContent = 'Sin documentos';
  documentosDiv.appendChild(sinDocs);
}

      card.appendChild(documentosDiv);
      contenedor.appendChild(card);
    });

  } catch (error) {
    contenedor.innerHTML = `<p>Error al cargar trámites: ${error.message}</p>`;
  }
});
