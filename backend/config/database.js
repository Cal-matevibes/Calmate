const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI_CLOUD ;

    const isAtlas = mongoURI.includes('mongodb+srv');
    console.log(`🔄 Conectando a MongoDB ${isAtlas ? '☁️ Atlas (Nube)' : '💻 Local'} (${process.env.NODE_ENV})...`);
    console.log(`🔗 URI: ${mongoURI.substring(0, 30)}...`);
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    console.log(`📊 Base de datos: ${conn.connection.name}`);
    console.log(`🌐 Tipo: ${isAtlas ? '🚀 MongoDB Atlas (Nube)' : '💻 MongoDB Local'}`);
    
    // Event listeners para debugging
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB desconectado');
    });

  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
      
    process.exit(1);
  }
};

module.exports = connectDB;