import API_BASE_URL from './config.js';

const loginForm = document.getElementById("loginForm");

const telefonoInput = document.getElementById("telefono");
const contrasenaInput = document.getElementById("contrasena");

const errorTelefono = document.getElementById("error-telefono");
const errorContrasena = document.getElementById("error-contrasena");
const mensajeError = document.getElementById("mensaje-error");
const advertenciaTelefono = document.getElementById("advertencia-telefono");

telefonoInput.addEventListener("input", () => {
  const soloDigitos = telefonoInput.value.replace(/\D/g, '');
  if (soloDigitos.length > 10) {
    advertenciaTelefono.textContent = "⚠️ El número tiene más de 10 dígitos.";
  } else {
    advertenciaTelefono.textContent = "";
  }
});

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  [errorTelefono, errorContrasena, mensajeError].forEach(el => el.textContent = "");
  advertenciaTelefono.textContent = "";

  const telefonoOriginal = telefonoInput.value.trim();
  const telefonoLimpio = telefonoOriginal.replace(/[\s\-]/g, '');
  const contrasena = contrasenaInput.value;

  let hayError = false;

  if (!/^\d{10}$/.test(telefonoLimpio)) {
    errorTelefono.textContent = "⚠️ Ingresa un número válido de 10 dígitos. Puedes usar espacios o guiones.";
    hayError = true;
  }

  if (!/^(?=.*[a-zA-Z])(?=.*\d).{6,}$/.test(contrasena)) {
    errorContrasena.textContent = "⚠️ La contraseña debe tener al menos 6 caracteres, e incluir letras y números.";
    hayError = true;
  }

  if (hayError) return;

  try {
    const respuesta = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ telefono: telefonoLimpio, contrasena }),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mensajeError.textContent = datos.mensaje || "⚠️ Error al iniciar sesión.";
      return;
    }

    localStorage.setItem("token", datos.token);

    if (datos.requiereCambioPassword) {
      window.location.href = "cambiar-password.html";
      return;
    }

    if (datos.usuario) {
      localStorage.setItem("usuario", JSON.stringify(datos.usuario));

      const rol = datos.usuario.rol;
      if (rol === "admin") {
        window.location.href = "admin.html";
      } else if (rol === "notario") {
        window.location.href = "notario.html";
      } else {
        window.location.href = "usuario.html";
      }
    }

  } catch (error) {
    mensajeError.textContent = "⚠️ No se pudo conectar al servidor.";
  }
});
