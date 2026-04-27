const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');
const Envio = require('../models/Envio');

// @desc    Crear nuevo pedido
// @route   POST /api/pedidos
// @access  Private
const crearPedido = async (req, res) => {
  try {
    const {
      items,
      datosContacto,
      direccionEnvio,
      metodoPago,
      observaciones,
      descuentos,
      esRegalo,
      destinatarioRegalo
    } = req.body;

    // Validar datos de contacto
    if (!datosContacto || !datosContacto.nombre || !datosContacto.apellido || !datosContacto.email || !datosContacto.telefono) {
      return res.status(400).json({
        success: false,
        message: 'Los datos de contacto son obligatorios'
      });
    }

    // Validar datos de regalo si es necesario
    if (esRegalo && (!destinatarioRegalo || !destinatarioRegalo.nombre || !destinatarioRegalo.apellido)) {
      return res.status(400).json({
        success: false,
        message: 'Los datos del destinatario son obligatorios para regalos'
      });
    }

    // Validar y procesar items
    let itemsProcesados = [];
    let subtotal = 0;

    for (let item of items) {
      const producto = await Producto.findById(item.producto);
      
      if (!producto) {
        return res.status(404).json({
          success: false,
          message: `Producto ${item.producto} no encontrado`
        });
      }

      if (!producto.activo) {
        return res.status(400).json({
          success: false,
          message: `El producto ${producto.nombre} no está disponible`
        });
      }

      if (producto.stock < item.cantidad) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`
        });
      }

      const itemProcesado = {
        producto: producto._id,
        cantidad: item.cantidad,
        precioUnitario: producto.precioVenta || producto.precio,
        subtotal: (producto.precioVenta || producto.precio) * item.cantidad
      };

      itemsProcesados.push(itemProcesado);
      subtotal += itemProcesado.subtotal;
    }

    // Crear objeto base del pedido
    const pedidoData = {
      usuario: req.usuario.id,
      datosContacto: {
        nombre: datosContacto.nombre.trim(),
        apellido: datosContacto.apellido.trim(),
        email: datosContacto.email.trim().toLowerCase(),
        telefono: datosContacto.telefono.trim()
      },
      items: itemsProcesados,
      direccionEnvio,
      metodoPago,
      subtotal,
      total: subtotal, // Se calculará con descuentos en el modelo
      esRegalo: esRegalo || false
    };

    // Agregar información de regalo si corresponde
    if (esRegalo && destinatarioRegalo) {
      pedidoData.destinatarioRegalo = {
        nombre: destinatarioRegalo.nombre.trim(),
        apellido: destinatarioRegalo.apellido.trim(),
        dedicatoria: destinatarioRegalo.dedicatoria ? destinatarioRegalo.dedicatoria.trim() : ''
      };
    }

    // Agregar observaciones si existen
    if (observaciones) {
      pedidoData.notas = {
        cliente: observaciones.trim()
      };
    }

    // Crear pedido
    const pedido = await Pedido.create(pedidoData);

    // Actualizar stock de productos
    for (let item of items) {
      await Producto.findByIdAndUpdate(
        item.producto,
        { $inc: { stock: -item.cantidad } }
      );
    }

    await pedido.populate('usuario', 'nombre apellido email');

    res.status(201).json({
      success: true,
      data: pedido,
      message: 'Pedido creado correctamente'
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener pedidos del usuario
// @route   GET /api/pedidos/mis-pedidos
// @access  Private
const obtenerMisPedidos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filtros = { usuario: req.usuario.id };

    // Filtros opcionales
    if (req.query.estado) filtros.estado = req.query.estado;
    if (req.query.fechaDesde) {
      filtros.createdAt = { $gte: new Date(req.query.fechaDesde) };
    }
    if (req.query.fechaHasta) {
      filtros.createdAt = { 
        ...filtros.createdAt, 
        $lte: new Date(req.query.fechaHasta) 
      };
    }

    const pedidos = await Pedido.find(filtros)
      .populate('items.producto', 'nombre imagen categoria')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Pedido.countDocuments(filtros);

    res.json({
      success: true,
      data: pedidos,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener pedido por ID
// @route   GET /api/pedidos/:id
// @access  Private
const obtenerPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('usuario', 'nombre apellido email telefono')
      .populate('items.producto', 'nombre imagen categoria descripcion');

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // Verificar permisos: solo el usuario dueño o admin
    if (pedido.usuario._id.toString() !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver este pedido'
      });
    }

    // Obtener información de envío si existe
    const envio = await Envio.findOne({ pedido: pedido._id });

    res.json({
      success: true,
      data: {
        ...pedido.toObject(),
        envio
      }
    });
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar estado del pedido (solo admin)
// @route   PUT /api/pedidos/:id/estado
// @access  Private/Admin
const actualizarEstadoPedido = async (req, res) => {
  try {
    const { estado, observaciones } = req.body;
    
    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    const pedidoActualizado = await pedido.actualizarEstado(estado, observaciones);

    res.json({
      success: true,
      data: pedidoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancelar pedido
// @route   PUT /api/pedidos/:id/cancelar
// @access  Private
const cancelarPedido = async (req, res) => {
  try {
    const { motivo } = req.body;
    
    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // Verificar permisos
    if (pedido.usuario.toString() !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para cancelar este pedido'
      });
    }

    // Solo se puede cancelar en ciertos estados
    if (!['pendiente', 'confirmado', 'preparando'].includes(pedido.estado)) {
      return res.status(400).json({
        success: false,
        message: 'Este pedido no se puede cancelar en su estado actual'
      });
    }

    const pedidoCancelado = await pedido.cancelar(motivo);

    // Restaurar stock
    for (let item of pedido.items) {
      await Producto.findByIdAndUpdate(
        item.producto,
        { $inc: { stock: item.cantidad } }
      );
    }

    res.json({
      success: true,
      data: pedidoCancelado
    });
  } catch (error) {
    console.error('Error al cancelar pedido:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener todos los pedidos (solo admin)
// @route   GET /api/pedidos
// @access  Private/Admin
const obtenerTodosPedidos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filtros = {};

    // Filtros opcionales
    if (req.query.estado) filtros.estado = req.query.estado;
    if (req.query.usuario) filtros.usuario = req.query.usuario;
    if (req.query.fechaDesde) {
      filtros.createdAt = { $gte: new Date(req.query.fechaDesde) };
    }
    if (req.query.fechaHasta) {
      filtros.createdAt = { 
        ...filtros.createdAt, 
        $lte: new Date(req.query.fechaHasta) 
      };
    }
    if (req.query.buscar) {
      filtros.numeroPedido = { $regex: req.query.buscar, $options: 'i' };
    }

    const pedidos = await Pedido.find(filtros)
      .populate('usuario', 'nombre apellido email')
      .populate('items.producto', 'nombre categoria')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Pedido.countDocuments(filtros);

    res.json({
      success: true,
      data: pedidos,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener estadísticas de pedidos (solo admin)
// @route   GET /api/pedidos/estadisticas
// @access  Private/Admin
const obtenerEstadisticas = async (req, res) => {
  try {
    const { periodo = '30d' } = req.query;
    
    let fechaInicio;
    switch (periodo) {
      case '7d':
        fechaInicio = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        fechaInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        fechaInicio = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        fechaInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Estadísticas generales
    const estadisticas = await Pedido.aggregate([
      {
        $match: {
          createdAt: { $gte: fechaInicio }
        }
      },
      {
        $group: {
          _id: null,
          totalPedidos: { $sum: 1 },
          totalVentas: { $sum: '$total' },
          promedioVenta: { $avg: '$total' },
          pedidosPendientes: {
            $sum: { $cond: [{ $eq: ['$estado', 'pendiente'] }, 1, 0] }
          },
          pedidosCompletados: {
            $sum: { $cond: [{ $eq: ['$estado', 'entregado'] }, 1, 0] }
          },
          pedidosCancelados: {
            $sum: { $cond: [{ $eq: ['$estado', 'cancelado'] }, 1, 0] }
          }
        }
      }
    ]);

    // Ventas por día
    const ventasPorDia = await Pedido.aggregate([
      {
        $match: {
          createdAt: { $gte: fechaInicio },
          estado: { $ne: 'cancelado' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          ventas: { $sum: '$total' },
          pedidos: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Productos más vendidos
    const productosMasVendidos = await Pedido.aggregate([
      {
        $match: {
          createdAt: { $gte: fechaInicio },
          estado: { $ne: 'cancelado' }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.producto',
          nombre: { $first: '$items.nombre' },
          cantidadVendida: { $sum: '$items.cantidad' },
          ingresoTotal: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { cantidadVendida: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        resumen: estadisticas[0] || {
          totalPedidos: 0,
          totalVentas: 0,
          promedioVenta: 0,
          pedidosPendientes: 0,
          pedidosCompletados: 0,
          pedidosCancelados: 0
        },
        ventasPorDia,
        productosMasVendidos,
        periodo
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Procesar pago del pedido
// @route   PUT /api/pedidos/:id/procesar-pago
// @access  Private/Admin
const procesarPago = async (req, res) => {
  try {
    const { 
      metodoPago, 
      estadoPago, 
      transactionId, 
      comprobante 
    } = req.body;

    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // Actualizar información de pago
    pedido.pago = {
      ...pedido.pago,
      metodoPago: metodoPago || pedido.pago.metodoPago,
      estado: estadoPago || pedido.pago.estado,
      transactionId: transactionId || pedido.pago.transactionId,
      comprobante: comprobante || pedido.pago.comprobante,
      fechaPago: estadoPago === 'pagado' ? new Date() : pedido.pago.fechaPago
    };

    // Si el pago fue aprobado, cambiar estado del pedido
    if (estadoPago === 'pagado' && pedido.estado === 'pendiente') {
      await pedido.actualizarEstado('confirmado', 'Pago procesado exitosamente');
    }

    await pedido.save();

    res.json({
      success: true,
      data: pedido
    });
  } catch (error) {
    console.error('Error al procesar pago:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  crearPedido,
  obtenerMisPedidos,
  obtenerPedido,
  actualizarEstadoPedido,
  cancelarPedido,
  obtenerTodosPedidos,
  obtenerEstadisticas,
  procesarPago
};