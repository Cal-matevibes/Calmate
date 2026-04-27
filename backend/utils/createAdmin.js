const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existe un admin
    const existingAdmin = await Usuario.findOne({ email: 'admin@calmatevibes.com' });
    if (existingAdmin) {
      console.log('ℹ️ Usuario admin ya existe');
      console.log('📧 Email: admin@calmatevibes.com');
      console.log('🔑 Password: Admin123!');
      await mongoose.connection.close();
      return;
    }

    // Crear usuario admin
    const adminData = {
      nombre: 'Admin',
      apellido: 'Principal',
      email: 'admin@calmatevibes.com',
      password: 'Admin123!',
      telefono: '+54 11 1234-5678',
      rol: 'admin',
      direcciones: [{
        alias: 'Oficina Principal',
        calle: 'Av. Corrientes',
        numero: '1234',
        ciudad: 'Buenos Aires',
        provincia: 'CABA',
        codigoPostal: 'C1043AAZ',
        pais: 'Argentina',
        esPrincipal: true
      }]
    };

    const admin = await Usuario.create(adminData);
    console.log('✅ Usuario admin creado exitosamente');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: Admin123!');
    console.log('👤 Rol:', admin.rol);

    await mongoose.connection.close();
    console.log('🔒 Conexión cerrada');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdminUser();