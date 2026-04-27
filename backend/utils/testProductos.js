const mongoose = require('mongoose');
const Producto = require('../models/Producto');
require('dotenv').config();

const testProductos = [
  {
    nombre: "Mate Imperial Test",
    categoria: "mates",
    descripcion: "Mate imperial de prueba",
    precioCompra: 2000,
    precioVenta: 3500,
    stock: 10
  },
  {
    nombre: "Bombilla Test",
    categoria: "bombillas", 
    descripcion: "Bombilla de prueba",
    precioCompra: 800,
    precioVenta: 1500,
    stock: 20
  },
  {
    nombre: "Set Test",
    categoria: "combos",
    descripcion: "Combo de prueba", 
    precioCompra: 2500,
    precioVenta: 4000,
    stock: 5
  }
];

const createTestProducts = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar productos existentes
    await Producto.deleteMany({});
    console.log('🗑️  Productos existentes eliminados');

    // Crear productos de prueba
    for (const productoData of testProductos) {
      try {
        const producto = await Producto.create(productoData);
        console.log(`✅ Producto creado: ${producto.nombre} (${producto.categoria})`);
      } catch (err) {
        console.error(`❌ Error creando ${productoData.nombre}:`, err.message);
      }
    }

    console.log('\n🎉 Proceso completado');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createTestProducts();