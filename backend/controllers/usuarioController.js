const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Registrar un nuevo usuario 
const registrarUsuario = async (req, res) => {
  const { nombre, telefono, password } = req.body;

  try {
    const usuarioExistente = await Usuario.findOne({ telefono });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: "El teléfono ya está registrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const contraseñaHasheada = await bcrypt.hash(password, salt);

    const nuevoUsuario = new Usuario({
      nombre,
      telefono,
      contrasena: contraseñaHasheada,
      rol: 'usuario'
    });

    await nuevoUsuario.save();

    const token = jwt.sign(
      { 
        id: nuevoUsuario._id, 
        nombre: nuevoUsuario.nombre, 
        telefono: nuevoUsuario.telefono, 
        rol: nuevoUsuario.rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      token,
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        telefono: nuevoUsuario.telefono,
        rol: nuevoUsuario.rol,
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar el usuario" });
  }
};

// Función para iniciar sesión de un usuario 
const loginUsuario = async (req, res) => {
  const { telefono, contrasena } = req.body;

  try {
    const usuario = await Usuario.findOne({ telefono });
    if (!usuario) {
      return res.status(400).json({ mensaje: "Teléfono no registrado" });
    }

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      return res.status(400).json({ mensaje: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { 
        id: usuario._id, 
        nombre: usuario.nombre, 
        telefono: usuario.telefono, 
        rol: usuario.rol,
        requiereCambioPassword: usuario.requiereCambioPassword
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    if (usuario.requiereCambioPassword) {
      return res.status(200).json({
        mensaje: "Debes cambiar tu contraseña",
        token,
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          telefono: usuario.telefono,
          rol: usuario.rol,
        },
        requiereCambioPassword: true
      });
    }

    res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        telefono: usuario.telefono,
        rol: usuario.rol,
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al iniciar sesión" });
  }
};

// Controlador para obtener el perfil del usuario
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user.id).select("-contrasena");

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};

// Función para cambiar la contraseña por primera vez 
const cambiarPasswordPrimeraVez = async (req, res) => {
  const token = req.user; 
  const { nuevaContrasena } = req.body;

  try {
    const usuario = await Usuario.findById(token.id);

    if (!usuario || !usuario.requiereCambioPassword) {
      return res.status(400).json({ mensaje: "No autorizado para cambiar la contraseña aquí" });
    }

    const hash = await bcrypt.hash(nuevaContrasena, 10);
    usuario.contrasena = hash;
    usuario.requiereCambioPassword = false;

    await usuario.save();

    const nuevoToken = jwt.sign(
      { 
        id: usuario._id, 
        nombre: usuario.nombre, 
        telefono: usuario.telefono, 
        rol: usuario.rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      mensaje: 'Contraseña actualizada exitosamente',
      token: nuevoToken
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar la contraseña' });
  }
};

module.exports = { 
  registrarUsuario, 
  loginUsuario,
  obtenerPerfil,
  cambiarPasswordPrimeraVez
};
