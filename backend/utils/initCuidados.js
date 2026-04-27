const mongoose = require('mongoose');
const Cuidado = require('../models/Cuidado');
require('dotenv').config();

const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

const cuidadosEjemplo = [
  {
    titulo: "Curado de Mate de Calabaza",
    descripcion: "Proceso esencial para preparar tu mate nuevo y eliminar el sabor amargo inicial.",
    categoria: "mate",
    pasos: [
      {
        numero: 1,
        instruccion: "Llena el mate hasta 3/4 de su capacidad con yerba mate usada o nueva"
      },
      {
        numero: 2,
        instruccion: "Agrega agua caliente (no hirviendo) y deja reposar 24 horas"
      },
      {
        numero: 3,
        instruccion: "Vacía el contenido y raspa suavemente las paredes con una cuchara"
      },
      {
        numero: 4,
        instruccion: "Repite el proceso 2-3 veces hasta que no salgan más residuos"
      },
      {
        numero: 5,
        instruccion: "Deja secar al aire libre en un lugar ventilado"
      }
    ],
    consejos: [
      "Nunca uses detergente para limpiar el mate de calabaza",
      "El proceso de curado puede tomar entre 3-5 días",
      "Después del curado, tu mate estará listo para usar"
    ],
    activo: true,
    orden: 1
  },
  {
    titulo: "Limpieza de Bombilla",
    descripcion: "Mantén tu bombilla siempre limpia para disfrutar del mejor sabor del mate.",
    categoria: "bombilla",
    pasos: [
      {
        numero: 1,
        instruccion: "Enjuaga la bombilla con agua caliente después de cada uso"
      },
      {
        numero: 2,
        instruccion: "Una vez por semana, desármala si es posible"
      },
      {
        numero: 3,
        instruccion: "Usa un cepillo pequeño para limpiar el interior del tubo"
      },
      {
        numero: 4,
        instruccion: "Remoja en agua caliente con bicarbonato por 30 minutos"
      },
      {
        numero: 5,
        instruccion: "Enjuaga bien y deja secar completamente"
      }
    ],
    consejos: [
      "Evita usar productos químicos fuertes",
      "Si la bombilla está muy obstruida, usa un alambre fino",
      "Las bombillas de acero inoxidable son más fáciles de limpiar"
    ],
    activo: true,
    orden: 2
  },
  {
    titulo: "Mantenimiento del Termo",
    descripcion: "Consejos para mantener tu termo en perfectas condiciones y prolongar su vida útil.",
    categoria: "termo",
    pasos: [
      {
        numero: 1,
        instruccion: "Lava con agua tibia y detergente suave después de cada uso"
      },
      {
        numero: 2,
        instruccion: "Para manchas difíciles, usa bicarbonato y agua"
      },
      {
        numero: 3,
        instruccion: "Enjuaga bien y seca completamente"
      },
      {
        numero: 4,
        instruccion: "Guarda sin la tapa puesta para evitar olores"
      },
      {
        numero: 5,
        instruccion: "Revisa periódicamente el estado del pico y la tapa"
      }
    ],
    consejos: [
      "No uses productos abrasivos que puedan dañar el interior",
      "Reemplaza las juntas de goma cuando sea necesario",
      "Un termo bien cuidado puede durar muchos años"
    ],
    activo: true,
    orden: 3
  }
];

const inicializarCuidados = async () => {
  try {
    await conectarDB();
    
    // Verificar si ya existen cuidados
    const cuidadosExistentes = await Cuidado.countDocuments();
    
    if (cuidadosExistentes > 0) {
      console.log(`ℹ️  Ya existen ${cuidadosExistentes} cuidados en la base de datos`);
      console.log('🤔 ¿Desea continuar y agregar los cuidados de ejemplo? (Esto no eliminará los existentes)');
    }
    
    // Insertar cuidados de ejemplo
    const cuidadosCreados = await Cuidado.insertMany(cuidadosEjemplo);
    
    console.log(`✅ Se crearon ${cuidadosCreados.length} cuidados de ejemplo:`);
    cuidadosCreados.forEach((cuidado, index) => {
      console.log(`   ${index + 1}. ${cuidado.titulo} (${cuidado.categoria})`);
    });
    
    console.log('\n🎉 ¡Cuidados inicializados correctamente!');
    
  } catch (error) {
    console.error('❌ Error al inicializar cuidados:', error);
  } finally {
    mongoose.disconnect();
    console.log('🔌 Conexión cerrada');
  }
};

// Ejecutar solo si se llama directamente
if (require.main === module) {
  inicializarCuidados();
}

module.exports = { inicializarCuidados, cuidadosEjemplo };