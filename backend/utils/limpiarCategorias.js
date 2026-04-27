#!/usr/bin/env node

/**
 * Script para limpiar categorías inactivas y migrar el sistema
 * 
 * Este script:
 * 1. Elimina todas las categorías con activa: false
 * 2. Elimina el índice único antiguo
 * 3. Crea el nuevo índice compuesto
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Categoria = require('./models/Categoria');

const limpiarYMigrarCategorias = async () => {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    // 1. Mostrar estado actual
    const categoriasActuales = await Categoria.find({});
    console.log('\n📊 Estado actual:');
    console.log('Total de categorías:', categoriasActuales.length);
    
    const activas = categoriasActuales.filter(cat => cat.activa);
    const inactivas = categoriasActuales.filter(cat => !cat.activa);
    
    console.log('Categorías activas:', activas.length);
    console.log('Categorías inactivas:', inactivas.length);

    if (activas.length > 0) {
      console.log('\nCategorías activas:');
      activas.forEach(cat => {
        console.log(`- ${cat.nombre} (${cat._id})`);
      });
    }

    if (inactivas.length > 0) {
      console.log('\nCategorías inactivas (serán eliminadas):');
      inactivas.forEach(cat => {
        console.log(`- ${cat.nombre} (${cat._id})`);
      });
    }

    // 2. Eliminar categorías inactivas
    if (inactivas.length > 0) {
      console.log('\n🗑️ Eliminando categorías inactivas...');
      const resultado = await Categoria.deleteMany({ activa: false });
      console.log(`✅ ${resultado.deletedCount} categorías inactivas eliminadas`);
    } else {
      console.log('\n✅ No hay categorías inactivas para eliminar');
    }

    // 3. Eliminar índices antiguos y crear nuevos
    console.log('\n🔧 Gestionando índices...');
    
    try {
      // Intentar eliminar el índice único simple si existe
      await Categoria.collection.dropIndex('nombre_1');
      console.log('✅ Índice único simple eliminado');
    } catch (error) {
      console.log('ℹ️ Índice único simple no existía');
    }

    try {
      // Eliminar índice anterior si existe
      await Categoria.collection.dropIndex('nombre_activa_unique');
      console.log('✅ Índice anterior eliminado');
    } catch (error) {
      console.log('ℹ️ Índice anterior no existía');
    }

    try {
      // Crear el nuevo índice compuesto con collation
      await Categoria.collection.createIndex(
        { nombre: 1, activa: 1 }, 
        { 
          unique: true, 
          partialFilterExpression: { activa: true },
          collation: { locale: 'es', strength: 2 }, // Insensible a mayúsculas/minúsculas
          name: 'nombre_activa_unique_case_insensitive'
        }
      );
      console.log('✅ Nuevo índice compuesto con collation creado');
    } catch (error) {
      console.log('ℹ️ Error creando índice:', error.message);
    }

    // 4. Verificar índices actuales
    console.log('\n📋 Índices actuales:');
    const indices = await Categoria.collection.getIndexes();
    Object.keys(indices).forEach(indexName => {
      console.log(`- ${indexName}: ${JSON.stringify(indices[indexName])}`);
    });

    // 5. Estado final
    const categoriasFinal = await Categoria.find({ activa: true });
    console.log('\n🎯 Estado final:');
    console.log('Categorías activas:', categoriasFinal.length);
    
    if (categoriasFinal.length > 0) {
      console.log('Lista de categorías:');
      categoriasFinal.forEach(cat => {
        console.log(`- ${cat.nombre} (${cat.descripcion})`);
      });
    }

    console.log('\n✅ === MIGRACIÓN COMPLETADA ===');
    console.log('🔥 Ahora puedes:');
    console.log('   - Crear categorías con cualquier nombre válido');
    console.log('   - Eliminar categorías sin problemas de duplicados');
    console.log('   - No hay restricciones enum');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
};

// Ejecutar solo si se llama directamente
if (require.main === module) {
  console.log('🚀 Iniciando limpieza y migración...\n');
  limpiarYMigrarCategorias()
    .then(() => {
      console.log('\n🎉 Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = limpiarYMigrarCategorias;