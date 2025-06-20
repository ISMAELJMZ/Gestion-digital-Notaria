//importamos mongoose para definir los esquemas y modelos 
const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
  nombre: 
  { 
    type: String, required: true 
  },
  telefono: 
  { 
    type: String, required: true, unique: true 
  }, // aquí va el número
  contrasena: 
  { 
    type: String, required: true 
  },
  rol: 
  { 
    type: String, enum: ['usuario', 'notario', 'admin'], default: 'usuario'
  },
  requiereCambioPassword: { type: Boolean, default: function () {
    return this.rol === 'notario';
  } 
}

});


module.exports = mongoose.model("Usuario", usuarioSchema);
