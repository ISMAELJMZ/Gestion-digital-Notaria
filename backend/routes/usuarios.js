
const express = require("express");
const router = express.Router();
const { registrarUsuario, loginUsuario, obtenerPerfil, cambiarPasswordPrimeraVez } = require("../controllers/usuarioController");

const authMiddleware = require("../middlewares/auth");


// Ruta: POST /api/usuarios/register
router.post("/register", registrarUsuario);

// Ruta: POST /api/usuarios/login
router.post("/login", loginUsuario);

// Ruta: GET /api/usuarios/perfil
router.get("/perfil", authMiddleware, obtenerPerfil);

router.post('/cambiar-password-primera-vez', authMiddleware, cambiarPasswordPrimeraVez);



module.exports = router;