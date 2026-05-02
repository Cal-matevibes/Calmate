const Producto = require('../models/Producto');
const Categoria = require('../models/Categoria');
const { validationResult } = require('express-validator');

// @desc    Obtener todos los productos con filtros avanzados
// @route   GET /api/productos
// @access  Public
exports.getProductos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Construir filtros
    const filtros = {};
    
    // Filtro por categoría (case-insensitive)
    if (req.query.categoria) {
      filtros.categoria = { $regex: new RegExp(`^${req.query.categoria}$`, 'i') };
    }
    
    // Filtro por estado activo (por defecto solo activos)
    if (req.query.incluirInactivos !== 'true') {
      filtros.activo = true;
    }
    
    // Filtro por rango de precios
    if (req.query.precioMin || req.query.precioMax) {
      filtros.precioVenta = {};
      if (req.query.precioMin) filtros.precioVenta.$gte = parseFloat(req.query.precioMin);
      if (req.query.precioMax) filtros.precioVenta.$lte = parseFloat(req.query.precioMax);
    }
    
    // Filtro por stock
    if (req.query.sinStock === 'true') {
      filtros.stock = 0;
    } else if (req.query.conStock === 'true') {
      filtros.stock = { $gt: 0 };
    }
    
    // Búsqueda por texto
    if (req.query.search) {
      filtros.$or = [
        { nombre: { $regex: req.query.search, $options: 'i' } },
        { descripcion: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Configurar ordenamiento
    let ordenamiento = { createdAt: -1 }; // Por defecto, más recientes primero
    if (req.query.ordenar) {
      switch (req.query.ordenar) {
        case 'nombre_asc':
          ordenamiento = { nombre: 1 };
          break;
        case 'nombre_desc':
          ordenamiento = { nombre: -1 };
          break;
        case 'precio_asc':
          ordenamiento = { precioVenta: 1 };
          break;
        case 'precio_desc':
          ordenamiento = { precioVenta: -1 };
          break;
        case 'stock_asc':
          ordenamiento = { stock: 1 };
          break;
        case 'stock_desc':
          ordenamiento = { stock: -1 };
          break;
      }
    }

    // Ejecutar consulta
    const productos = await Producto.find(filtros)
      .populate({
        path: 'caracteristicasCombos.mate caracteristicasCombos.bombilla',
        select: 'nombre stock precioVenta imagenes'
      })
      .sort(ordenamiento)
      .skip(skip)
      .limit(limit)
      .lean(); // Para mejor performance

    const total = await Producto.countDocuments(filtros);

    // Estadísticas adicionales
    const stats = await Producto.aggregate([
      { $match: filtros },
      {
        $group: {
          _id: null,
          totalProductos: { $sum: 1 },
          stockTotal: { $sum: '$stock' },
          valorInventario: { $sum: { $multiply: ['$stock', '$precioCompra'] } },
          precioPromedio: { $avg: '$precioVenta' }
        }
      }
    ]);

    res.json({
      success: true,
      count: productos.length,
      data: productos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      stats: stats[0] || {
        totalProductos: 0,
        stockTotal: 0,
        valorInventario: 0,
        precioPromedio: 0
      }
    });
  } catch (error) {
    console.error('Error en getProductos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
};

// @desc    Obtener producto por ID
// @route   GET /api/productos/:id
// @access  Public
exports.getProducto = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id)
      .populate({
        path: 'caracteristicasCombos.mate caracteristicasCombos.bombilla',
        select: 'nombre stock precioVenta imagenes caracteristicasMates caracteristicasBombillas'
      })
      .lean();

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Si es un combo, calcular stock dinámicamente
    if (producto.categoria === 'combos' && 
        producto.caracteristicasCombos?.mate && 
        producto.caracteristicasCombos?.bombilla) {
      producto.stock = Math.min(
        producto.caracteristicasCombos.mate.stock,
        producto.caracteristicasCombos.bombilla.stock
      );
    }

    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    console.error('Error en getProducto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto',
      error: error.message
    });
  }
};

// @desc    Crear nuevo producto
// @route   POST /api/productos
// @access  Private
exports.createProducto = async (req, res) => {
  try {
    console.log('📥 [Backend] Datos recibidos en createProducto:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    // Preparar datos del producto
    const productoData = { ...req.body };

    // Validar categoría dinámicamente contra la base de datos
    if (productoData.categoria) {
      console.log('🔍 [Backend] Validando categoría:', productoData.categoria);
      
      const categoriaValida = await Categoria.findOne({
        $or: [
          { nombre: { $regex: `^${productoData.categoria}$`, $options: 'i' } },
          { key: productoData.categoria }
        ],
        activa: true
      });
      
      console.log('🔍 [Backend] Categoría encontrada:', categoriaValida);
      
      if (!categoriaValida) {
        console.error('❌ [Backend] Categoría no válida:', productoData.categoria);
        
        // Mostrar categorías disponibles para debugging
        const categoriasDisponibles = await Categoria.find({ activa: true }, { nombre: 1, key: 1 });
        console.log('📋 [Backend] Categorías disponibles:', categoriasDisponibles);
        
        return res.status(400).json({
          success: false,
          message: 'Categoría inválida. La categoría no existe en la base de datos'
        });
      }
    }

    // Procesar imágenes - convertir strings a objetos si es necesario
    console.log('📷 [Backend] Procesando imágenes recibidas:', {
      cantidad: productoData.imagenes?.length || 0,
      tipos: productoData.imagenes?.map(img => ({
        esString: typeof img === 'string',
        esObjeto: typeof img === 'object',
        tipoContenido: typeof img === 'string' ? (
          img.startsWith('data:image/') ? 'base64' : 
          img.startsWith('http') ? 'url' : 
          img.startsWith('blob:') ? 'blob' : 'unknown'
        ) : 'object'
      }))
    });
    
    if (productoData.imagenes && Array.isArray(productoData.imagenes)) {
      productoData.imagenes = productoData.imagenes.map(img => {
        if (typeof img === 'string') {
          // Descartar blob URLs
          if (img.startsWith('blob:')) {
            console.log('⚠️ [Backend] Descartando blob URL');
            return null;
          }
          
          // Crear objeto con estructura correcta para base64 o URLs
          return {
            url: img,
            alt: productoData.nombre || 'Imagen del producto'
          };
        }
        return img;
      }).filter(img => img && img.url); // Filtrar imágenes nulas o vacías
    } else {
      productoData.imagenes = [];
    }
    
    console.log('📷 [Backend] Imágenes procesadas:', {
      cantidad: productoData.imagenes.length,
      imagenes: productoData.imagenes.map(img => ({
        tipoUrl: img.url?.startsWith('data:image/') ? 'base64' : 'url',
        tamaño: img.url?.length || 0
      }))
    });

    // Asignar características por defecto según la categoría
    if (productoData.categoria === 'mates' && !productoData.caracteristicasMates) {
      productoData.caracteristicasMates = {
        forma: 'Imperial',
        tipo: 'Calabaza', 
        anchoSuperior: 'Medio',
        anchoInferior: 'Medio',
        virola: 'No',
        guarda: 'No',
        revestimiento: 'No',
        curados: 'No',
        terminacion: 'Brillante',
        grabado: 'No'
      };
    }

    if (productoData.categoria === 'bombillas' && !productoData.caracteristicasBombillas) {
      productoData.caracteristicasBombillas = {
        forma: 'Recta',
        tipoMaterial: 'Acero inoxidable',
        tamaño: 'Mediana',
        centimetros: 20
      };
    }

    const producto = await Producto.create(productoData);

    // Poblar referencias si es un combo
    if (producto.categoria === 'combos') {
      await producto.populate('caracteristicasCombos.mate caracteristicasCombos.bombilla');
    }

    res.status(201).json({
      success: true,
      data: producto,
      message: 'Producto creado exitosamente'
    });
  } catch (error) {
    console.error('Error en createProducto:', error);
    res.status(400).json({
      success: false,
      message: 'Error al crear producto',
      error: error.message
    });
  }
};

// @desc    Actualizar producto
// @route   PUT /api/productos/:id
// @access  Private
exports.updateProducto = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    // Verificar que el producto existe
    let producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    producto = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('caracteristicasCombos.mate caracteristicasCombos.bombilla');

    res.json({
      success: true,
      data: producto,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error en updateProducto:', error);
    res.status(400).json({
      success: false,
      message: 'Error al actualizar producto',
      error: error.message
    });
  }
};

// @desc    Eliminar producto (soft delete)
// @route   DELETE /api/productos/:id
// @access  Private
exports.deleteProducto = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar si el producto está siendo usado en combos
    if (producto.categoria !== 'combos') {
      const combosQueLoUsan = await Producto.find({
        categoria: 'combos',
        $or: [
          { 'caracteristicasCombos.mate': producto._id },
          { 'caracteristicasCombos.bombilla': producto._id }
        ],
        activo: true
      });

      if (combosQueLoUsan.length > 0) {
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar el producto porque está siendo usado en ${combosQueLoUsan.length} combo(s)`,
          combosAfectados: combosQueLoUsan.map(c => ({ id: c._id, nombre: c.nombre }))
        });
      }
    }

    // Soft delete
    producto.activo = false;
    await producto.save();

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteProducto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto',
      error: error.message
    });
  }
};

// @desc    Restaurar producto eliminado
// @route   PATCH /api/productos/:id/restaurar
// @access  Private
exports.restaurarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { activo: true },
      { new: true }
    );

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: producto,
      message: 'Producto restaurado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al restaurar producto',
      error: error.message
    });
  }
};

// @desc    Actualizar stock de producto
// @route   PATCH /api/productos/:id/stock
// @access  Private
exports.actualizarStock = async (req, res) => {
  try {
    const { cantidad, operacion } = req.body; // operacion: 'suma', 'resta', 'establecer'
    
    if (!cantidad || !operacion) {
      return res.status(400).json({
        success: false,
        message: 'Cantidad y operación son requeridos'
      });
    }

    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    let nuevoStock;
    switch (operacion) {
      case 'suma':
        nuevoStock = producto.stock + cantidad;
        break;
      case 'resta':
        nuevoStock = Math.max(0, producto.stock - cantidad);
        break;
      case 'establecer':
        nuevoStock = cantidad;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Operación inválida. Use: suma, resta, establecer'
        });
    }

    producto.stock = nuevoStock;
    await producto.save();

    res.json({
      success: true,
      data: producto,
      message: `Stock actualizado exitosamente. Stock anterior: ${producto.stock}, Stock nuevo: ${nuevoStock}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar stock',
      error: error.message
    });
  }
};

// @desc    Obtener productos por categoría
// @route   GET /api/productos/categoria/:categoria
// @access  Public
exports.getProductosByCategoria = async (req, res) => {
  try {
    const { categoria } = req.params;
    console.log('📂 [Backend] Buscando productos por categoría:', categoria);
    
    // Buscar la categoría primero para obtener información adicional
    const categoriaDoc = await Categoria.findOne({
      $or: [
        { slug: categoria },
        { nombre: { $regex: `^${categoria}$`, $options: 'i' } },
        { key: categoria }
      ]
    });
    
    console.log('🔍 [Backend] Categoría encontrada:', categoriaDoc);
    
    // Buscar productos usando case-insensitive regex
    const productos = await Producto.find({ 
      categoria: { $regex: `^${categoria}$`, $options: 'i' },
      activo: true 
    }).sort({ nombre: 1 });

    console.log(`✅ [Backend] Encontrados ${productos.length} productos para categoría "${categoria}"`);

    res.json({
      success: true,
      productos: productos,
      data: productos, // Mantener ambos para compatibilidad
      categoria: categoriaDoc,
      total: productos.length
    });
  } catch (error) {
    console.error('❌ [Backend] Error en getProductosByCategoria:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos por categoría',
      error: error.message
    });
  }
};

// @desc    Buscar productos
// @route   GET /api/productos/search
// @access  Public
exports.searchProductos = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Parámetro de búsqueda requerido'
      });
    }

    const productos = await Producto.find({
      $and: [
        { activo: true },
        {
          $or: [
            { nombre: { $regex: q, $options: 'i' } },
            { descripcion: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } }
          ]
        }
      ]
    }).sort({ nombre: 1 });

    res.json({
      success: true,
      data: productos,
      total: productos.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en la búsqueda',
      error: error.message
    });
  }
};

// @desc    Obtener productos destacados
// @route   GET /api/productos/destacados
// @access  Public
exports.getProductosDestacados = async (req, res) => {
  try {
    const productos = await Producto.find({ 
      activo: true,
      destacado: true 
    }).sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      data: productos,
      total: productos.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos destacados',
      error: error.message
    });
  }
};

// @desc    Obtener resumen del inventario
// @route   GET /api/productos/resumen
// @access  Private/Admin
exports.getInventarioResumen = async (req, res) => {
  try {
    const stats = await Producto.aggregate([
      {
        $group: {
          _id: null,
          totalProductos: { $sum: 1 },
          productosActivos: { 
            $sum: { $cond: [{ $eq: ['$activo', true] }, 1, 0] } 
          },
          stockTotal: { $sum: '$stock' },
          valorInventario: { 
            $sum: { $multiply: ['$stock', '$precioCompra'] } 
          },
          valorVenta: { 
            $sum: { $multiply: ['$stock', '$precioVenta'] } 
          },
          precioPromedio: { $avg: '$precioVenta' }
        }
      }
    ]);

    const categorias = await Producto.aggregate([
      { $match: { activo: true } },
      {
        $group: {
          _id: '$categoria',
          cantidad: { $sum: 1 },
          stock: { $sum: '$stock' }
        }
      },
      { $sort: { cantidad: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        estadisticas: stats[0] || {},
        categorias: categorias
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener resumen del inventario',
      error: error.message
    });
  }
};