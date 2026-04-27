const mongoose = require('mongoose');
const Categoria = require('../models/Categoria');

// Configuración de conexión
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/calmatevibes', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado exitosamente');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Datos de categorías iniciales
const categoriasIniciales = [
  {
    nombre: 'mates',
    descripcion: 'Mates de diferentes tipos y tamaños',
    activa: true,
    orden: 1,
    configuracion: {
      campos: {
        forma: { tipo: 'select', opciones: ['Camionero', 'Imperial', 'Torpedo'] },
        tipo: { tipo: 'select', opciones: ['Calabaza', 'Algarrobo'] },
        anchoSuperior: { tipo: 'select', opciones: ['Ancho', 'Medio', 'Angosto'] },
        anchoInferior: { tipo: 'select', opciones: ['Ancho', 'Medio', 'Angosto'] },
        virola: { tipo: 'boolean' }
      },
      opciones: {}
    }
  },
  {
    nombre: 'bombillas',
    descripcion: 'Bombillas de acero inoxidable y otros materiales',
    activa: true,
    orden: 2,
    configuracion: {
      campos: {
        forma: { tipo: 'select', opciones: ['Recta', 'Curva', 'Pico de loro'] },
        tipoMaterial: { tipo: 'select', opciones: ['Acero inoxidable', 'Alpaca', 'Bronce'] },
        tamaño: { tipo: 'select', opciones: ['Chica', 'Mediana', 'Grande'] }
      },
      opciones: {}
    }
  },
  {
    nombre: 'combos',
    descripcion: 'Combos de mate y bombilla',
    activa: true,
    orden: 3,
    configuracion: {
      campos: {
        tipoCombo: { tipo: 'select', opciones: ['Básico', 'Premium', 'Deluxe'] },
        incluye: { tipo: 'text' }
      },
      opciones: {}
    }
  }
];

// Función para inicializar categorías
const initCategorias = async () => {
  try {
    console.log('Iniciando inicialización de categorías...');
    
    for (const categoriaData of categoriasIniciales) {
      // Verificar si la categoría ya existe
      const categoriaExistente = await Categoria.findOne({ nombre: categoriaData.nombre });
      
      if (!categoriaExistente) {
        const nuevaCategoria = new Categoria(categoriaData);
        await nuevaCategoria.save();
        console.log(`✅ Categoría '${categoriaData.nombre}' creada`);
      } else {
        console.log(`⚠️  Categoría '${categoriaData.nombre}' ya existe, omitiendo...`);
      }
    }
    
    console.log('✨ Inicialización de categorías completada');
    
  } catch (error) {
    console.error('❌ Error inicializando categorías:', error);
  }
};

// Función principal
const main = async () => {
  await connectDB();
  await initCategorias();
  
  console.log('\n📊 Categorías en la base de datos:');
  const categorias = await Categoria.find({}).sort({ orden: 1 });
  categorias.forEach(categoria => {
    console.log(`- ${categoria.nombre} (${categoria.activa ? 'activa' : 'inactiva'})`);
  });
  
  process.exit(0);
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { initCategorias };