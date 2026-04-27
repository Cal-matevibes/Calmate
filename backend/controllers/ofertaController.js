const Producto = require('../models/Producto');
const Categoria = require('../models/Categoria');
const { validationResult } = require('express-validator');

// @desc    Obtener todas las ofertas activas
// @route   GET /api/ofertas
// @access  Public
exports.getOfertas = async (req, res) => {
  try {
    const ofertas = await Producto.find({ ofertaActiva: true })
      .select('nombre categoria precioVenta precioDescuento tipoDescuento tiempoOferta descuentoCategoria imagenes');
    
    res.status(200).json({
      success: true,
      count: ofertas.length,
      data: ofertas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener ofertas',
      error: error.message
    });
  }
};

// @desc    Obtener oferta por ID
// @route   GET /api/ofertas/:id
// @access  Public
exports.getOfertaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const oferta = await Producto.findById(id);
    
    if (!oferta) {
      return res.status(404).json({
        success: false,
        message: 'Oferta no encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      data: oferta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la oferta',
      error: error.message
    });
  }
};

// @desc    Crear/actualizar ofertas para productos o categoría
// @route   POST /api/ofertas
// @access  Private/Admin
exports.createOferta = async (req, res) => {
  try {
    const { 
      productos = [], 
      categoria = null,
      precioDescuento,
      tipoDescuento = 'porcentaje',
      tiempoOferta = null
    } = req.body;

    // Validar que al menos tenga productos o categoría
    if (productos.length === 0 && !categoria) {
      return res.status(400).json({
        success: false,
        message: 'Debes seleccionar al menos un producto o una categoría'
      });
    }

    // Validar precioDescuento
    if (precioDescuento === null || precioDescuento === undefined) {
      return res.status(400).json({
        success: false,
        message: 'El precio de descuento es requerido'
      });
    }

    // Validar tipoDescuento
    if (!['porcentaje', 'precioFijo'].includes(tipoDescuento)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de descuento inválido'
      });
    }

    const updatedOffertas = [];

    // Si se seleccionó una categoría completa
    if (categoria) {
      const productos = await Producto.find({ categoria: categoria });
      
      if (productos.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No se encontraron productos en esta categoría'
        });
      }

      for (const producto of productos) {
        producto.ofertaActiva = true;
        producto.precioDescuento = precioDescuento;
        producto.tipoDescuento = tipoDescuento;
        producto.tiempoOferta = tiempoOferta;
        producto.descuentoCategoria = true;
        
        await producto.save();
        updatedOffertas.push(producto);
      }
    } else {
      // Si se seleccionaron productos específicos
      for (const productoId of productos) {
        const producto = await Producto.findById(productoId);
        
        if (!producto) {
          continue; // Saltar si el producto no existe
        }

        producto.ofertaActiva = true;
        producto.precioDescuento = precioDescuento;
        producto.tipoDescuento = tipoDescuento;
        producto.tiempoOferta = tiempoOferta;
        producto.descuentoCategoria = false;
        
        await producto.save();
        updatedOffertas.push(producto);
      }
    }

    res.status(200).json({
      success: true,
      message: `${updatedOffertas.length} oferta(s) creada(s) exitosamente`,
      data: updatedOffertas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear oferta',
      error: error.message
    });
  }
};

// @desc    Actualizar oferta de un producto
// @route   PUT /api/ofertas/:id
// @access  Private/Admin
exports.updateOferta = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      precioDescuento,
      tipoDescuento,
      tiempoOferta,
      ofertaActiva
    } = req.body;

    const producto = await Producto.findById(id);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Actualizar campos de oferta
    if (precioDescuento !== undefined) {
      producto.precioDescuento = precioDescuento;
    }
    if (tipoDescuento !== undefined) {
      producto.tipoDescuento = tipoDescuento;
    }
    if (tiempoOferta !== undefined) {
      producto.tiempoOferta = tiempoOferta;
    }
    if (ofertaActiva !== undefined) {
      producto.ofertaActiva = ofertaActiva;
    }

    await producto.save();

    res.status(200).json({
      success: true,
      message: 'Oferta actualizada exitosamente',
      data: producto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar oferta',
      error: error.message
    });
  }
};

// @desc    Desactivar oferta de un producto
// @route   DELETE /api/ofertas/:id
// @access  Private/Admin
exports.deleteOferta = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findById(id);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Desactivar la oferta
    producto.ofertaActiva = false;
    producto.precioDescuento = null;
    producto.tiempoOferta = null;
    producto.descuentoCategoria = false;

    await producto.save();

    res.status(200).json({
      success: true,
      message: 'Oferta eliminada exitosamente',
      data: producto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar oferta',
      error: error.message
    });
  }
};

// @desc    Desactivar oferta de una categoría completa
// @route   DELETE /api/ofertas/categoria/:categoria
// @access  Private/Admin
exports.deleteOfertaCategoria = async (req, res) => {
  try {
    const { categoria } = req.params;

    const productos = await Producto.find({ 
      categoria: categoria,
      descuentoCategoria: true
    });

    if (productos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron ofertas en esta categoría'
      });
    }

    for (const producto of productos) {
      producto.ofertaActiva = false;
      producto.precioDescuento = null;
      producto.tiempoOferta = null;
      producto.descuentoCategoria = false;
      
      await producto.save();
    }

    res.status(200).json({
      success: true,
      message: `${productos.length} oferta(s) eliminada(s) exitosamente`,
      data: productos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar ofertas',
      error: error.message
    });
  }
};

// @desc    Obtener ofertas activas por categoría
// @route   GET /api/ofertas/categoria/:categoria
// @access  Public
exports.getOfertasByCategoria = async (req, res) => {
  try {
    const { categoria } = req.params;

    const ofertas = await Producto.find({ 
      categoria: categoria,
      ofertaActiva: true
    });

    res.status(200).json({
      success: true,
      count: ofertas.length,
      data: ofertas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener ofertas',
      error: error.message
    });
  }
};

// @desc    Calcular precio con descuento
// @route   GET /api/ofertas/calcular/:productoId
// @access  Public
exports.calcularPrecioDescuento = async (req, res) => {
  try {
    const { productoId } = req.params;

    const producto = await Producto.findById(productoId);
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    if (!producto.ofertaActiva) {
      return res.status(200).json({
        success: true,
        data: {
          precioOriginal: producto.precioVenta,
          precioFinal: producto.precioVenta,
          descuento: 0,
          tipoDescuento: null,
          ofertaActiva: false
        }
      });
    }

    let precioFinal = producto.precioVenta;
    let descuento = 0;

    if (producto.tipoDescuento === 'porcentaje') {
      descuento = (producto.precioVenta * producto.precioDescuento) / 100;
      precioFinal = producto.precioVenta - descuento;
    } else if (producto.tipoDescuento === 'precioFijo') {
      precioFinal = producto.precioDescuento;
      descuento = producto.precioVenta - precioFinal;
    }

    res.status(200).json({
      success: true,
      data: {
        precioOriginal: producto.precioVenta,
        precioFinal: Math.max(0, precioFinal),
        descuento: descuento.toFixed(2),
        tipoDescuento: producto.tipoDescuento,
        descuentoValor: producto.precioDescuento,
        tiempoOferta: producto.tiempoOferta,
        ofertaActiva: producto.ofertaActiva
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al calcular precio',
      error: error.message
    });
  }
};
