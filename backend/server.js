const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar configuración de DB
const connectDB = require('./config/database');

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'https://calmatex.netlify.app',
    'http://localhost:3000' // Para desarrollo local
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// Rutas de la API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/pedidos', require('./routes/pedidos'));
app.use('/api/carritos', require('./routes/carritos'));
app.use('/api/envios', require('./routes/envios'));
app.use('/api/pagos', require('./routes/pagos')); // Nueva ruta para MercadoPago
app.use('/api/ofertas', require('./routes/ofertas')); // Nueva ruta para Ofertas
app.use('/api/cuidados', require('./routes/cuidados')); // Nueva ruta para Cuidados
app.use('/api/nodos-cuidado', require('./routes/nodosCuidado')); // Árbol de cuidados

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;