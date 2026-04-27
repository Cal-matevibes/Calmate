const Cuidado = require('../models/Cuidado');

// @desc    Obtener todos los cuidados activos
// @route   GET /api/cuidados
// @access  Public
exports.getCuidados = async (req, res) => {
  try {
    const { categoria } = req.query;
    
    // Construir filtros
    const filtros = { activo: true };
    
    if (categoria) {
      filtros.categoria = categoria;
    }
    
    const cuidados = await Cuidado.find(filtros).sort({ orden: 1, createdAt: -1 });
    
    res.json({
      success: true,
      count: cuidados.length,
      data: cuidados
    });
  } catch (error) {
    console.error('Error al obtener cuidados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Obtener un cuidado específico
// @route   GET /api/cuidados/:id
// @access  Public
exports.getCuidado = async (req, res) => {
  try {
    const cuidado = await Cuidado.findById(req.params.id);
    
    if (!cuidado || !cuidado.activo) {
      return res.status(404).json({
        success: false,
        message: 'Cuidado no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: cuidado
    });
  } catch (error) {
    console.error('Error al obtener cuidado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Crear un nuevo cuidado
// @route   POST /api/cuidados
// @access  Private/Admin  
exports.createCuidado = async (req, res) => {
  try {
    const cuidado = await Cuidado.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Cuidado creado exitosamente',
      data: cuidado
    });
  } catch (error) {
    console.error('Error al crear cuidado:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Error de validación'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Actualizar un cuidado
// @route   PUT /api/cuidados/:id
// @access  Private/Admin
exports.updateCuidado = async (req, res) => {
  try {
    const cuidado = await Cuidado.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!cuidado) {
      return res.status(404).json({
        success: false,
        message: 'Cuidado no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Cuidado actualizado exitosamente',
      data: cuidado
    });
  } catch (error) {
    console.error('Error al actualizar cuidado:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0] || 'Error de validación'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Eliminar un cuidado (eliminación suave)
// @route   DELETE /api/cuidados/:id
// @access  Private/Admin
exports.deleteCuidado = async (req, res) => {
  try {
    const cuidado = await Cuidado.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );
    
    if (!cuidado) {
      return res.status(404).json({
        success: false,
        message: 'Cuidado no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Cuidado eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar cuidado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};