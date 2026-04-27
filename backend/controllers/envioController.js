const Envio = require('../models/Envio');
const Pedido = require('../models/Pedido');

// @desc    Crear nuevo envío
// @route   POST /api/envios
// @access  Private/Admin
const crearEnvio = async (req, res) => {
  try {
    const {
      pedidoId,
      destinatario,
      direccion,
      tipoEnvio,
      transportista,
      costos,
      paquete,
      fechas,
      instruccionesEspeciales
    } = req.body;

    // Verificar que el pedido existe
    const pedido = await Pedido.findById(pedidoId);
    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // Verificar que no exista ya un envío para este pedido
    const envioExistente = await Envio.findOne({ pedido: pedidoId });
    if (envioExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un envío para este pedido'
      });
    }

    const envio = await Envio.create({
      pedido: pedidoId,
      destinatario,
      direccion,
      tipoEnvio,
      transportista,
      costos,
      paquete,
      fechas,
      instruccionesEspeciales
    });

    await envio.populate('pedido', 'numeroPedido total usuario');

    res.status(201).json({
      success: true,
      data: envio
    });
  } catch (error) {
    console.error('Error al crear envío:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener envío por ID
// @route   GET /api/envios/:id
// @access  Private
const obtenerEnvio = async (req, res) => {
  try {
    const envio = await Envio.findById(req.params.id)
      .populate({
        path: 'pedido',
        select: 'numeroPedido total usuario items',
        populate: {
          path: 'usuario',
          select: 'nombre apellido email'
        }
      });

    if (!envio) {
      return res.status(404).json({
        success: false,
        message: 'Envío no encontrado'
      });
    }

    // Verificar permisos: admin o propietario del pedido
    if (req.usuario.rol !== 'admin' && 
        envio.pedido.usuario._id.toString() !== req.usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver este envío'
      });
    }

    res.json({
      success: true,
      data: envio
    });
  } catch (error) {
    console.error('Error al obtener envío:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener envío por número de tracking
// @route   GET /api/envios/tracking/:numero
// @access  Public
const obtenerPorTracking = async (req, res) => {
  try {
    const { numero } = req.params;

    const envio = await Envio.buscarPorTracking(numero)
      .populate({
        path: 'pedido',
        select: 'numeroPedido total fechaCreacion'
      });

    if (!envio) {
      return res.status(404).json({
        success: false,
        message: 'Número de tracking no encontrado'
      });
    }

    // Información pública de tracking (sin datos sensibles)
    const trackingInfo = {
      numero: envio.tracking.numero,
      estado: envio.estado,
      fechas: envio.fechas,
      historial: envio.historial,
      direccionDestino: {
        ciudad: envio.direccion.ciudad,
        provincia: envio.direccion.provincia
      },
      transportista: envio.transportista,
      numeroPedido: envio.pedido.numeroPedido
    };

    res.json({
      success: true,
      data: trackingInfo
    });
  } catch (error) {
    console.error('Error al obtener tracking:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar estado del envío
// @route   PUT /api/envios/:id/estado
// @access  Private/Admin
const actualizarEstado = async (req, res) => {
  try {
    const { estado, descripcion, ubicacion, observaciones } = req.body;

    const envio = await Envio.findById(req.params.id);

    if (!envio) {
      return res.status(404).json({
        success: false,
        message: 'Envío no encontrado'
      });
    }

    const envioActualizado = await envio.actualizarEstado(
      estado, 
      descripcion, 
      ubicacion, 
      observaciones
    );

    // Actualizar estado del pedido si corresponde
    const pedido = await Pedido.findById(envio.pedido);
    if (pedido) {
      switch (estado) {
        case 'despachado':
          if (pedido.estado !== 'enviado') {
            await pedido.actualizarEstado('enviado', 'Pedido despachado');
          }
          break;
        case 'entregado':
          if (pedido.estado !== 'entregado') {
            await pedido.actualizarEstado('entregado', 'Pedido entregado exitosamente');
          }
          break;
      }
    }

    res.json({
      success: true,
      data: envioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Registrar intento de entrega
// @route   POST /api/envios/:id/intento-entrega
// @access  Private/Admin
const registrarIntentoEntrega = async (req, res) => {
  try {
    const { motivo, observaciones } = req.body;

    const envio = await Envio.findById(req.params.id);

    if (!envio) {
      return res.status(404).json({
        success: false,
        message: 'Envío no encontrado'
      });
    }

    await envio.registrarIntentoEntrega(motivo, observaciones);

    res.json({
      success: true,
      data: envio,
      message: 'Intento de entrega registrado'
    });
  } catch (error) {
    console.error('Error al registrar intento:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener todos los envíos (admin)
// @route   GET /api/envios
// @access  Private/Admin
const obtenerTodosEnvios = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filtros = {};

    // Filtros opcionales
    if (req.query.estado) filtros.estado = req.query.estado;
    if (req.query.tipoEnvio) filtros.tipoEnvio = req.query.tipoEnvio;
    if (req.query.transportista) {
      filtros['transportista.nombre'] = { 
        $regex: req.query.transportista, 
        $options: 'i' 
      };
    }
    if (req.query.fechaDesde) {
      filtros.createdAt = { $gte: new Date(req.query.fechaDesde) };
    }
    if (req.query.fechaHasta) {
      filtros.createdAt = { 
        ...filtros.createdAt, 
        $lte: new Date(req.query.fechaHasta) 
      };
    }
    if (req.query.tracking) {
      filtros['tracking.numero'] = { 
        $regex: req.query.tracking, 
        $options: 'i' 
      };
    }

    const envios = await Envio.find(filtros)
      .populate({
        path: 'pedido',
        select: 'numeroPedido total usuario',
        populate: {
          path: 'usuario',
          select: 'nombre apellido email'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Envio.countDocuments(filtros);

    res.json({
      success: true,
      data: envios,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalShipments: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error al obtener envíos:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener envíos pendientes
// @route   GET /api/envios/pendientes
// @access  Private/Admin
const obtenerEnviosPendientes = async (req, res) => {
  try {
    const enviosPendientes = await Envio.obtenerPendientes()
      .populate({
        path: 'pedido',
        select: 'numeroPedido total usuario',
        populate: {
          path: 'usuario',
          select: 'nombre apellido'
        }
      })
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: enviosPendientes,
      count: enviosPendientes.length
    });
  } catch (error) {
    console.error('Error al obtener envíos pendientes:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener envíos retrasados
// @route   GET /api/envios/retrasados
// @access  Private/Admin
const obtenerEnviosRetrasados = async (req, res) => {
  try {
    const envios = await Envio.find({
      'fechas.estimadaEntrega': { $lt: new Date() },
      estado: { 
        $in: ['preparando', 'listo_despacho', 'despachado', 'en_transito', 'en_distribucion'] 
      }
    })
    .populate({
      path: 'pedido',
      select: 'numeroPedido total usuario',
      populate: {
        path: 'usuario',
        select: 'nombre apellido email telefono'
      }
    })
    .sort({ 'fechas.estimadaEntrega': 1 });

    res.json({
      success: true,
      data: envios,
      count: envios.length
    });
  } catch (error) {
    console.error('Error al obtener envíos retrasados:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Calcular costo de envío
// @route   POST /api/envios/calcular-costo
// @access  Public
const calcularCostoEnvio = async (req, res) => {
  try {
    const { 
      tipoEnvio, 
      codigoPostal, 
      peso, 
      dimensiones, 
      valorDeclarado 
    } = req.body;

    // Simulación de cálculo de costos
    // En producción esto se integraría con APIs de transportistas
    let costoBase = 0;
    let costoSeguro = 0;

    switch (tipoEnvio) {
      case 'domicilio':
        costoBase = peso * 150 + 300; // Base por peso + fijo
        break;
      case 'punto_retiro':
        costoBase = peso * 100 + 200;
        break;
      case 'correo_argentino':
        costoBase = peso * 120 + 250;
        break;
      case 'oca':
        costoBase = peso * 130 + 280;
        break;
      case 'andreani':
        costoBase = peso * 140 + 320;
        break;
      default:
        costoBase = peso * 100 + 200;
    }

    // Costo de seguro (opcional)
    if (valorDeclarado > 5000) {
      costoSeguro = valorDeclarado * 0.01; // 1% del valor
    }

    // Factores adicionales por CP (simulado)
    const factorZona = codigoPostal.startsWith('1') ? 1 : 1.2; // CABA vs interior
    
    const costoEnvio = Math.round(costoBase * factorZona);
    const costoTotal = costoEnvio + costoSeguro;

    // Tiempo estimado de entrega
    let tiempoEstimado = '';
    switch (tipoEnvio) {
      case 'domicilio':
        tiempoEstimado = codigoPostal.startsWith('1') ? '1-2 días hábiles' : '3-5 días hábiles';
        break;
      case 'punto_retiro':
        tiempoEstimado = '2-4 días hábiles';
        break;
      default:
        tiempoEstimado = '3-7 días hábiles';
    }

    res.json({
      success: true,
      data: {
        tipoEnvio,
        costos: {
          envio: costoEnvio,
          seguro: costoSeguro,
          total: costoTotal
        },
        tiempoEstimado,
        detalles: {
          peso,
          codigoPostal,
          factorZona
        }
      }
    });
  } catch (error) {
    console.error('Error al calcular costo:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar información de tracking
// @route   PUT /api/envios/:id/tracking
// @access  Private/Admin
const actualizarTracking = async (req, res) => {
  try {
    const { numero, url } = req.body;

    const envio = await Envio.findById(req.params.id);

    if (!envio) {
      return res.status(404).json({
        success: false,
        message: 'Envío no encontrado'
      });
    }

    envio.tracking = {
      numero: numero || envio.tracking.numero,
      url: url || envio.tracking.url
    };

    await envio.save();

    res.json({
      success: true,
      data: envio,
      message: 'Información de tracking actualizada'
    });
  } catch (error) {
    console.error('Error al actualizar tracking:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Confirmar entrega
// @route   PUT /api/envios/:id/confirmar-entrega
// @access  Private/Admin
const confirmarEntrega = async (req, res) => {
  try {
    const { 
      personaQueRecibe, 
      observaciones 
    } = req.body;

    const envio = await Envio.findById(req.params.id);

    if (!envio) {
      return res.status(404).json({
        success: false,
        message: 'Envío no encontrado'
      });
    }

    // Actualizar información de entrega
    envio.personaQueRecibe = personaQueRecibe;
    envio.fechas.entrega = new Date();
    
    await envio.actualizarEstado(
      'entregado', 
      'Entrega confirmada', 
      null, 
      observaciones
    );

    res.json({
      success: true,
      data: envio,
      message: 'Entrega confirmada exitosamente'
    });
  } catch (error) {
    console.error('Error al confirmar entrega:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  crearEnvio,
  obtenerEnvio,
  obtenerPorTracking,
  actualizarEstado,
  registrarIntentoEntrega,
  obtenerTodosEnvios,
  obtenerEnviosPendientes,
  obtenerEnviosRetrasados,
  calcularCostoEnvio,
  actualizarTracking,
  confirmarEntrega
};