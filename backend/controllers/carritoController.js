const Carrito = require('../models/Carrito');
const Producto = require('../models/Producto');

// @desc    Obtener carrito del usuario
// @route   GET /api/carritos
// @access  Private
const obtenerCarrito = async (req, res) => {
  try {
    let carrito;

    if (req.usuario) {
      // Usuario autenticado
      carrito = await Carrito.findOne({ 
        usuario: req.usuario.id, 
        activo: true 
      }).populate('items.producto', 'nombre precioVenta imagenes stock activo categoria');
    } else {
      // Usuario invitado (por sessionId)
      const sessionId = req.headers['x-session-id'];
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID requerido para usuarios invitados'
        });
      }

      carrito = await Carrito.findOne({ 
        sessionId, 
        activo: true 
      }).populate('items.producto', 'nombre precioVenta imagenes stock activo categoria');
    }

    if (!carrito) {
      return res.json({
        success: true,
        data: {
          items: [],
          subtotal: 0,
          total: 0,
          cantidadTotalItems: 0,
          descuentos: []
        }
      });
    }

    // Verificar productos activos y stock
    carrito.items = carrito.items.filter(item => {
      if (!item.producto || !item.producto.activo) {
        return false;
      }
      
      // Ajustar cantidad si excede el stock disponible
      if (item.cantidad > item.producto.stock) {
        item.cantidad = item.producto.stock;
      }
      
      return item.cantidad > 0;
    });

    await carrito.save();

    res.json({
      success: true,
      data: carrito
    });
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Agregar producto al carrito
// @route   POST /api/carritos/agregar
// @access  Public
const agregarProducto = async (req, res) => {
  try {
    const { productoId, cantidad = 1 } = req.body;

    // Validar producto
    const producto = await Producto.findById(productoId);
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    if (!producto.activo) {
      return res.status(400).json({
        success: false,
        message: 'El producto no está disponible'
      });
    }

    if (producto.stock < cantidad) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Disponible: ${producto.stock}`
      });
    }

    let carrito;

    if (req.usuario) {
      // Usuario autenticado
      carrito = await Carrito.findOne({ 
        usuario: req.usuario.id, 
        activo: true 
      });

      if (!carrito) {
        carrito = new Carrito({ 
          usuario: req.usuario.id,
          items: []
        });
      }
    } else {
      // Usuario invitado
      const sessionId = req.headers['x-session-id'];
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID requerido'
        });
      }

      carrito = await Carrito.findOne({ 
        sessionId, 
        activo: true 
      });

      if (!carrito) {
        carrito = new Carrito({ 
          sessionId,
          items: []
        });
      }
    }

    await carrito.agregarProducto(productoId, cantidad, producto.precioVenta);
    await carrito.populate('items.producto', 'nombre precioVenta imagenes stock activo categoria');

    res.status(201).json({
      success: true,
      data: carrito,
      message: 'Producto agregado al carrito'
    });
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar cantidad de producto en carrito
// @route   PUT /api/carritos/actualizar
// @access  Public
const actualizarCantidad = async (req, res) => {
  try {
    const { productoId, cantidad } = req.body;

    // Validar cantidad
    if (cantidad < 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad no puede ser negativa'
      });
    }

    // Validar stock si aumenta la cantidad
    if (cantidad > 0) {
      const producto = await Producto.findById(productoId);
      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      if (producto.stock < cantidad) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente. Disponible: ${producto.stock}`
        });
      }
    }

    let carrito;

    if (req.usuario) {
      carrito = await Carrito.findOne({ 
        usuario: req.usuario.id, 
        activo: true 
      });
    } else {
      const sessionId = req.headers['x-session-id'];
      carrito = await Carrito.findOne({ 
        sessionId, 
        activo: true 
      });
    }

    if (!carrito) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    await carrito.actualizarCantidad(productoId, cantidad);
    await carrito.populate('items.producto', 'nombre precioVenta imagenes stock activo categoria');

    res.json({
      success: true,
      data: carrito,
      message: cantidad === 0 ? 'Producto eliminado del carrito' : 'Cantidad actualizada'
    });
  } catch (error) {
    console.error('Error al actualizar cantidad:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Eliminar producto del carrito
// @route   DELETE /api/carritos/eliminar/:productoId
// @access  Public
const eliminarProducto = async (req, res) => {
  try {
    const { productoId } = req.params;

    let carrito;

    if (req.usuario) {
      carrito = await Carrito.findOne({ 
        usuario: req.usuario.id, 
        activo: true 
      });
    } else {
      const sessionId = req.headers['x-session-id'];
      carrito = await Carrito.findOne({ 
        sessionId, 
        activo: true 
      });
    }

    if (!carrito) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    await carrito.eliminarProducto(productoId);
    await carrito.populate('items.producto', 'nombre precioVenta imagenes stock activo categoria');

    res.json({
      success: true,
      data: carrito,
      message: 'Producto eliminado del carrito'
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Limpiar carrito
// @route   DELETE /api/carritos/limpiar
// @access  Public
const limpiarCarrito = async (req, res) => {
  try {
    let carrito;

    if (req.usuario) {
      carrito = await Carrito.findOne({ 
        usuario: req.usuario.id, 
        activo: true 
      });
    } else {
      const sessionId = req.headers['x-session-id'];
      carrito = await Carrito.findOne({ 
        sessionId, 
        activo: true 
      });
    }

    if (!carrito) {
      return res.json({
        success: true,
        message: 'Carrito ya está vacío'
      });
    }

    await carrito.limpiar();

    res.json({
      success: true,
      data: carrito,
      message: 'Carrito limpiado exitosamente'
    });
  } catch (error) {
    console.error('Error al limpiar carrito:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Aplicar código de descuento
// @route   POST /api/carritos/descuento
// @access  Public
const aplicarDescuento = async (req, res) => {
  try {
    const { codigo } = req.body;

    // TODO: Implementar validación de códigos de descuento
    // Por ahora simulamos algunos códigos de ejemplo
    const codigosValidos = {
      'DESCUENTO10': { tipo: 'porcentaje', valor: 10, descripcion: '10% de descuento' },
      'PRIMERACOMPRA': { tipo: 'porcentaje', valor: 15, descripcion: '15% primera compra' },
      'ENVIOGRATIS': { tipo: 'monto_fijo', valor: 500, descripcion: 'Envío gratis' }
    };

    if (!codigosValidos[codigo]) {
      return res.status(400).json({
        success: false,
        message: 'Código de descuento inválido'
      });
    }

    let carrito;

    if (req.usuario) {
      carrito = await Carrito.findOne({ 
        usuario: req.usuario.id, 
        activo: true 
      });
    } else {
      const sessionId = req.headers['x-session-id'];
      carrito = await Carrito.findOne({ 
        sessionId, 
        activo: true 
      });
    }

    if (!carrito) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    // Verificar si el código ya está aplicado
    const descuentoExistente = carrito.descuentos.find(d => d.codigo === codigo);
    if (descuentoExistente) {
      return res.status(400).json({
        success: false,
        message: 'Este código ya está aplicado'
      });
    }

    // Aplicar descuento
    carrito.descuentos.push({
      codigo,
      ...codigosValidos[codigo]
    });

    await carrito.save();
    await carrito.populate('items.producto', 'nombre precioVenta imagenes stock activo categoria');

    res.json({
      success: true,
      data: carrito,
      message: 'Descuento aplicado exitosamente'
    });
  } catch (error) {
    console.error('Error al aplicar descuento:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remover código de descuento
// @route   DELETE /api/carritos/descuento/:codigo
// @access  Public
const removerDescuento = async (req, res) => {
  try {
    const { codigo } = req.params;

    let carrito;

    if (req.usuario) {
      carrito = await Carrito.findOne({ 
        usuario: req.usuario.id, 
        activo: true 
      });
    } else {
      const sessionId = req.headers['x-session-id'];
      carrito = await Carrito.findOne({ 
        sessionId, 
        activo: true 
      });
    }

    if (!carrito) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    carrito.descuentos = carrito.descuentos.filter(d => d.codigo !== codigo);
    await carrito.save();
    await carrito.populate('items.producto', 'nombre precioVenta imagenes stock activo categoria');

    res.json({
      success: true,
      data: carrito,
      message: 'Descuento removido exitosamente'
    });
  } catch (error) {
    console.error('Error al remover descuento:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Migrar carrito de invitado a usuario registrado
// @route   POST /api/carritos/migrar
// @access  Private
const migrarCarrito = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID requerido'
      });
    }

    // Buscar carrito de invitado
    const carritoInvitado = await Carrito.findOne({ 
      sessionId, 
      activo: true 
    });

    if (!carritoInvitado) {
      return res.json({
        success: true,
        message: 'No hay carrito de invitado para migrar'
      });
    }

    // Buscar carrito de usuario registrado
    let carritoUsuario = await Carrito.findOne({ 
      usuario: req.usuario.id, 
      activo: true 
    });

    if (carritoUsuario) {
      // Combinar carritos
      for (let itemInvitado of carritoInvitado.items) {
        await carritoUsuario.agregarProducto(
          itemInvitado.producto,
          itemInvitado.cantidad,
          itemInvitado.precioUnitario
        );
      }

      // Combinar descuentos
      for (let descuento of carritoInvitado.descuentos) {
        const yaExiste = carritoUsuario.descuentos.find(d => d.codigo === descuento.codigo);
        if (!yaExiste) {
          carritoUsuario.descuentos.push(descuento);
        }
      }
    } else {
      // Transferir carrito completo
      carritoInvitado.usuario = req.usuario.id;
      carritoInvitado.sessionId = undefined;
      carritoUsuario = carritoInvitado;
    }

    await carritoUsuario.save();

    // Eliminar carrito de invitado si es diferente
    if (carritoInvitado._id.toString() !== carritoUsuario._id.toString()) {
      await Carrito.findByIdAndDelete(carritoInvitado._id);
    }

    await carritoUsuario.populate('items.producto', 'nombre precioVenta imagenes stock activo categoria');

    res.json({
      success: true,
      data: carritoUsuario,
      message: 'Carrito migrado exitosamente'
    });
  } catch (error) {
    console.error('Error al migrar carrito:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Validar disponibilidad del carrito
// @route   GET /api/carritos/validar
// @access  Public
const validarCarrito = async (req, res) => {
  try {
    let carrito;

    if (req.usuario) {
      carrito = await Carrito.findOne({ 
        usuario: req.usuario.id, 
        activo: true 
      }).populate('items.producto', 'nombre precioVenta imagenes stock activo categoria');
    } else {
      const sessionId = req.headers['x-session-id'];
      carrito = await Carrito.findOne({ 
        sessionId, 
        activo: true 
      }).populate('items.producto', 'nombre precioVenta imagenes stock activo categoria');
    }

    if (!carrito) {
      return res.json({
        success: true,
        valido: true,
        errores: [],
        message: 'Carrito vacío'
      });
    }

    const errores = [];
    let carritoModificado = false;

    // Validar cada item
    carrito.items = carrito.items.filter(item => {
      if (!item.producto) {
        errores.push(`Producto no encontrado`);
        carritoModificado = true;
        return false;
      }

      if (!item.producto.activo) {
        errores.push(`${item.producto.nombre} ya no está disponible`);
        carritoModificado = true;
        return false;
      }

      if (item.cantidad > item.producto.stock) {
        errores.push(`${item.producto.nombre}: solo quedan ${item.producto.stock} unidades`);
        item.cantidad = item.producto.stock;
        carritoModificado = true;
      }

      // Verificar cambios de precio
      if (item.precioUnitario !== item.producto.precioVenta) {
        errores.push(`${item.producto.nombre}: precio actualizado`);
        item.precioUnitario = item.producto.precioVenta;
        carritoModificado = true;
      }

      return true;
    });

    if (carritoModificado) {
      await carrito.save();
    }

    res.json({
      success: true,
      valido: errores.length === 0,
      errores,
      data: carrito,
      message: errores.length === 0 ? 'Carrito válido' : 'Carrito actualizado con cambios'
    });
  } catch (error) {
    console.error('Error al validar carrito:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar información de regalo del carrito
// @route   PUT /api/carritos/regalo
// @access  Private/Public (con sessionId)
const actualizarInfoRegalo = async (req, res) => {
  try {
    const { esRegalo, nombreRegalo, apellidoRegalo, dedicatoria } = req.body;
    let carrito;

    if (req.usuario) {
      // Usuario autenticado
      carrito = await Carrito.findOne({ 
        usuario: req.usuario.id, 
        activo: true 
      });
    } else {
      // Usuario invitado
      const sessionId = req.headers['x-session-id'];
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID requerido para usuarios invitados'
        });
      }

      carrito = await Carrito.findOne({ 
        sessionId, 
        activo: true 
      });
    }

    if (!carrito) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    // Actualizar información de regalo
    carrito.esRegalo = esRegalo;
    
    if (esRegalo && nombreRegalo && apellidoRegalo) {
      carrito.destinatarioRegalo = {
        nombre: nombreRegalo.trim(),
        apellido: apellidoRegalo.trim(),
        dedicatoria: dedicatoria ? dedicatoria.trim() : ''
      };
    } else {
      carrito.destinatarioRegalo = {
        nombre: '',
        apellido: '',
        dedicatoria: ''
      };
    }

    await carrito.save();

    res.json({
      success: true,
      data: carrito,
      message: 'Información de regalo actualizada correctamente'
    });

  } catch (error) {
    console.error('Error al actualizar información de regalo:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  obtenerCarrito,
  agregarProducto,
  actualizarCantidad,
  eliminarProducto,
  limpiarCarrito,
  aplicarDescuento,
  removerDescuento,
  migrarCarrito,
  validarCarrito,
  actualizarInfoRegalo
};