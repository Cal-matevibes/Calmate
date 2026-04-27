const NodoCuidado = require('../models/NodoCuidado');

// Recursively collect IDs of a node and all its descendants
async function collectDescendantIds(parentId) {
  const children = await NodoCuidado.find({ padre: parentId }).select('_id').lean();
  const ids = [String(parentId)];
  for (const child of children) {
    const childIds = await collectDescendantIds(child._id);
    ids.push(...childIds);
  }
  return ids;
}

// GET /api/nodos-cuidado?categoriaId=xxx  (público)
const getAll = async (req, res) => {
  try {
    const { categoriaId } = req.query;
    if (!categoriaId) {
      return res.status(400).json({ message: 'Se requiere categoriaId' });
    }
    const nodos = await NodoCuidado.find({ categoriaRaiz: categoriaId, activo: true })
      .sort({ orden: 1 })
      .lean();
    res.json(nodos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener nodos', error: error.message });
  }
};

// POST /api/nodos-cuidado  (admin)
const crear = async (req, res) => {
  try {
    const { titulo, tipo, contenido, padre, categoriaRaiz, orden, esHtml } = req.body;
    const nodo = await NodoCuidado.create({
      titulo,
      tipo,
      contenido: contenido || '',
      padre: padre || null,
      categoriaRaiz,
      orden: orden || 0,
      esHtml: esHtml || false
    });
    res.status(201).json(nodo);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear nodo', error: error.message });
  }
};

// PUT /api/nodos-cuidado/:id  (admin)
const actualizar = async (req, res) => {
  try {
    const { titulo, contenido, orden, esHtml } = req.body;
    const nodo = await NodoCuidado.findByIdAndUpdate(
      req.params.id,
      { titulo, contenido, orden, esHtml },
      { new: true, runValidators: true }
    );
    if (!nodo) return res.status(404).json({ message: 'Nodo no encontrado' });
    res.json(nodo);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar nodo', error: error.message });
  }
};

// DELETE /api/nodos-cuidado/:id  (admin) — elimina el nodo y todos sus descendientes
const eliminar = async (req, res) => {
  try {
    const ids = await collectDescendantIds(req.params.id);
    const result = await NodoCuidado.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Nodo eliminado correctamente', eliminados: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar nodo', error: error.message });
  }
};

module.exports = { getAll, crear, actualizar, eliminar };
