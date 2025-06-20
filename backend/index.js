
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// rutas
const tramitesRoutes = require('./routes/tramites');
const notarioRoutes = require('./routes/notario');
const rutaUsuarios = require('./routes/usuarios');
const adminRoutes = require('./routes/admin');

// inicio de la app
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// rutas principales
app.use('/api/tramites', tramitesRoutes);
app.use('/api/notario',  notarioRoutes);
app.use('/api/usuarios', rutaUsuarios);
app.use('/api/admin', adminRoutes);

// ruta base 
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'pages', 'index.html'));
});



// conexvion a mongodb
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
  })
  .catch(err => console.error(err));
