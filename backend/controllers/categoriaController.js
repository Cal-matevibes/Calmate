const Categoria = require('../models/Categoria');
const Producto = require('../models/Producto');
const { validationResult } = require('express-validator');

// @desc    Obtener todas las categorías
// @route   GET /api/categorias
// @access  Public
exports.getCategorias = async (req, res) => {
  try {
    const filtros = {};
    
    // Filtro por estado activo
    if (req.query.incluirInactivas !== 'true') {
      filtros.activa = true;
    }

    const categorias = await Categoria.find(filtros)
      .sort({ orden: 1, nombre: 1 });

    // Obtener estadísticas de productos por categoría
    const statsPromises = categorias.map(async (categoria) => {
      const stats = await Producto.aggregate([
        { $match: { categoria: categoria.nombre, activo: true } },
        {
          $group: {
            _id: null,
            totalProductos: { $sum: 1 },
            stockTotal: { $sum: '$stock' },
            valorInventario: { $sum: { $multiply: ['$stock', '$precioCompra'] } }
          }
        }
      ]);

      return {
        ...categoria.toObject(),
        estadisticas: stats[0] || {
          totalProductos: 0,
          stockTotal: 0,
          valorInventario: 0
        }
      };
    });

    const categoriasConStats = await Promise.all(statsPromises);

    res.json({
      success: true,
      count: categorias.length,
      data: categoriasConStats
    });
  } catch (error) {
    console.error('Error en getCategorias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
};

// @desc    Obtener categoría por ID
// @route   GET /api/categorias/:id
// @access  Public
exports.getCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Obtener productos de la categoría
    const productos = await Producto.find({
      categoria: categoria.nombre,
      activo: true
    }).select('nombre stock precioVenta imagenes');

    res.json({
      success: true,
      data: {
        ...categoria.toObject(),
        productos
      }
    });
  } catch (error) {
    console.error('Error en getCategoria:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categoría',
      error: error.message
    });
  }
};

// @desc    Crear nueva categoría
// @route   POST /api/categorias
// @access  Private
exports.createCategoria = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    console.log('🆕 Creando nueva categoría:', JSON.stringify(req.body, null, 2));
    console.log('🖼️ Campo imagen recibido:', req.body.imagen);

    // Verificar si ya existe una categoría activa con el mismo nombre (comparación insensible a mayúsculas)
    const nombreOriginal = req.body.nombre.trim();
    const nombreNormalizado = nombreOriginal.toLowerCase();
    
    const categoriaExistente = await Categoria.findOne({
      nombre: { $regex: new RegExp(`^${nombreNormalizado}$`, 'i') },
      activa: true
    });

    if (categoriaExistente) {
      return res.status(400).json({
        success: false,
        message: `Ya existe una categoría activa con el nombre '${nombreOriginal}'`
      });
    }

    // Crear la nueva categoría manteniendo el formato original
    const categoriaData = {
      ...req.body,
      nombre: nombreOriginal // Mantener formato original
    };

    const categoria = await Categoria.create(categoriaData);

    console.log('✅ Categoría creada exitosamente:', categoria);

    res.status(201).json({
      success: true,
      data: categoria,
      message: 'Categoría creada exitosamente'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }
    
    console.error('Error en createCategoria:', error);
    res.status(400).json({
      success: false,
      message: 'Error al crear categoría',
      error: error.message
    });
  }
};

// @desc    Actualizar categoría
// @route   PUT /api/categorias/:id
// @access  Private
exports.updateCategoria = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    console.log('🔄 Actualizando categoría ID:', req.params.id);
    console.log('📥 Datos recibidos:', JSON.stringify(req.body, null, 2));
    console.log('🖼️ Campo imagen en actualización:', req.body.imagen);

    // Verificar que la categoría existe antes de actualizar
    const categoriaExistente = await Categoria.findById(req.params.id);
    if (!categoriaExistente) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    console.log('Categoría existente antes de actualizar:', categoriaExistente);

    // Si se está actualizando el nombre, verificar duplicados
    let datosActualizacion = { ...req.body };
    
    if (req.body.nombre) {
      const nombreOriginal = req.body.nombre.trim();
      const nombreNormalizado = nombreOriginal.toLowerCase();
      
      // Solo verificar duplicados si el nombre cambió
      if (nombreNormalizado !== categoriaExistente.nombre.toLowerCase()) {
        const duplicado = await Categoria.findOne({
          nombre: { $regex: new RegExp(`^${nombreNormalizado}$`, 'i') },
          activa: true,
          _id: { $ne: req.params.id }
        });

        if (duplicado) {
          return res.status(400).json({
            success: false,
            message: `Ya existe una categoría activa con el nombre '${nombreOriginal}'`
          });
        }
      }
      
      // Mantener formato original
      datosActualizacion.nombre = nombreOriginal;
    }

    const categoria = await Categoria.findByIdAndUpdate(
      req.params.id,
      datosActualizacion,
      {
        new: true,
        runValidators: true
      }
    );

    console.log('Categoría después de actualizar:', categoria);

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada después de la actualización'
      });
    }

    res.json({
      success: true,
      data: categoria,
      message: 'Categoría actualizada exitosamente'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }
    
    console.error('Error en updateCategoria:', error);
    res.status(400).json({
      success: false,
      message: 'Error al actualizar categoría',
      error: error.message
    });
  }
};

// @desc    Eliminar categoría
// @route   DELETE /api/categorias/:id
// @access  Private
exports.deleteCategoria = async (req, res) => {
  try {
    console.log('🗑️ === DELETE CATEGORIA INICIADO ===');
    console.log('🆔 ID recibido:', req.params.id);
    console.log('👤 Usuario autenticado:', req.usuario ? req.usuario._id : 'No usuario');
    console.log('🔑 Rol del usuario:', req.usuario ? req.usuario.rol : 'No rol');
    console.log('📋 Headers recibidos:', req.headers);
    
    // Verificar que tenemos un ID válido
    if (!req.params.id) {
      console.log('❌ ID no proporcionado');
      return res.status(400).json({
        success: false,
        message: 'ID de categoría requerido'
      });
    }
    
    const categoria = await Categoria.findById(req.params.id);
    
    if (!categoria) {
      console.log('❌ Categoría no encontrada con ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    console.log('✅ Categoría encontrada:', {
      id: categoria._id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      activa: categoria.activa
    });

    // Verificar si ya está inactiva
    if (!categoria.activa) {
      console.log('⚠️ La categoría ya está inactiva');
      return res.status(400).json({
        success: false,
        message: 'La categoría ya está eliminada'
      });
    }

    // Verificar si hay productos en esta categoría
    console.log('🔍 Verificando productos en la categoría...');
    const productosEnCategoria = await Producto.countDocuments({
      categoria: categoria.nombre,
      activo: true
    });

    console.log('📊 Productos activos en la categoría:', productosEnCategoria);

    if (productosEnCategoria > 0) {
      console.log('❌ No se puede eliminar - tiene productos activos');
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar la categoría porque tiene ${productosEnCategoria} producto(s) activo(s)`
      });
    }

    // Hard delete - Eliminación completa
    console.log('🔄 Realizando eliminación completa...');
    const categoriaEliminada = await Categoria.findByIdAndDelete(req.params.id);
    
    console.log('✅ Categoría eliminada completamente:', {
      id: categoriaEliminada._id,
      nombre: categoriaEliminada.nombre
    });

    console.log('🗑️ === DELETE CATEGORIA COMPLETADO EXITOSAMENTE ===');
    
    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente',
      data: categoriaEliminada
    });
  } catch (error) {
    console.error('💥 Error en deleteCategoria:', error);
    console.error('💥 Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar categoría',
      error: error.message
    });
  }
};