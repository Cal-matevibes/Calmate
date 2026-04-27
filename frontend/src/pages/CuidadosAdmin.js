import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { CarritoContext } from '../context/CarritoContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Loading from '../components/shared/Loading';
import categoriaService from '../services/categoriaService';
import nodoCuidadoService from '../services/nodoCuidadoService';
import './styles/CuidadosAdmin.css';

function buildTree(nodes, parentId = null) {
  return nodes
    .filter(n => {
      const p = n.padre?._id ? String(n.padre._id) : (n.padre ? String(n.padre) : null);
      return p === (parentId ? String(parentId) : null);
    })
    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
    .map(n => ({ ...n, children: buildTree(nodes, n._id) }));
}

// Insert HTML string at the current cursor position of a textarea
function insertAtCursor(textareaRef, html, currentValue, onChange) {
  const el = textareaRef.current;
  if (!el) return;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const next = currentValue.slice(0, start) + html + currentValue.slice(end);
  onChange(next);
  // Restore focus and cursor after React re-render
  setTimeout(() => {
    el.focus();
    el.setSelectionRange(start + html.length, start + html.length);
  }, 0);
}

// Shared document content editor with HTML mode, media toolbar, and preview
function DocEditor({ values, setValues, rows = 6 }) {
  const textareaRef = useRef(null);
  const imgInputRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);

  const handleContenidoChange = (val) => setValues(v => ({ ...v, contenido: val }));

  // Convert selected image file to base64 and insert <img> tag
  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const html = `<img src="${ev.target.result}" alt="${file.name}" style="max-width:100%;height:auto;border-radius:6px;margin:0.5rem 0;" />`;
      insertAtCursor(textareaRef, html, values.contenido, handleContenidoChange);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Insert video HTML at cursor: YouTube iframe or <video> tag
  const handleInsertVideo = () => {
    if (!videoUrl.trim()) return;
    const youtubeMatch = videoUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    let html;
    if (youtubeMatch) {
      html = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:0.75rem 0;"><iframe src="https://www.youtube.com/embed/${youtubeMatch[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;border-radius:6px;" allowfullscreen></iframe></div>`;
    } else {
      html = `<video src="${videoUrl}" controls style="max-width:100%;border-radius:6px;margin:0.5rem 0;"></video>`;
    }
    insertAtCursor(textareaRef, html, values.contenido, handleContenidoChange);
    setVideoUrl('');
    setShowVideoInput(false);
  };

  return (
    <>
      <div className="editor-mode-toggle">
        <button
          type="button"
          className={`editor-mode-btn${!values.esHtml ? ' active' : ''}`}
          onClick={() => setValues(v => ({ ...v, esHtml: false }))}
        >Texto plano</button>
        <button
          type="button"
          className={`editor-mode-btn${values.esHtml ? ' active' : ''}`}
          onClick={() => setValues(v => ({ ...v, esHtml: true }))}
        >HTML</button>
      </div>

      {values.esHtml && (
        <div className="media-toolbar">
          <button
            type="button"
            className="media-btn"
            title="Insertar imagen"
            onClick={() => imgInputRef.current?.click()}
          >🖼️ Imagen</button>
          <input
            ref={imgInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageFile}
          />
          <button
            type="button"
            className="media-btn"
            title="Insertar video"
            onClick={() => setShowVideoInput(v => !v)}
          >🎬 Video</button>
          {showVideoInput && (
            <div className="video-url-row">
              <input
                type="text"
                className="video-url-input"
                placeholder="URL de YouTube o video directo..."
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleInsertVideo(); if (e.key === 'Escape') setShowVideoInput(false); }}
                autoFocus
              />
              <button type="button" className="btn-confirm" onClick={handleInsertVideo}>Insertar</button>
            </div>
          )}
        </div>
      )}

      <textarea
        ref={textareaRef}
        placeholder={values.esHtml ? '<p>Escribí en HTML...</p>' : 'Contenido del documento...'}
        value={values.contenido}
        onChange={e => handleContenidoChange(e.target.value)}
        className={`nodo-add-textarea${values.esHtml ? ' textarea-code' : ''}`}
        rows={rows}
      />

      {values.esHtml && values.contenido && (
        <div className="html-preview">
          <div className="html-preview-header">Vista previa</div>
          <div
            className="html-preview-content"
            dangerouslySetInnerHTML={{ __html: values.contenido }}
          />
        </div>
      )}
    </>
  );
}

function AddNodeForm({ tipo, values, setValues, onSave, onCancel }) {
  return (
    <div className="nodo-add-form">
      <span className="nodo-add-icon">{tipo === 'subcategoria' ? '📁' : '📄'}</span>
      <div className="nodo-add-inputs">
        <input
          type="text"
          placeholder={`Título de la ${tipo === 'subcategoria' ? 'subcategoría' : 'documento'}`}
          value={values.titulo}
          onChange={e => setValues(v => ({ ...v, titulo: e.target.value }))}
          onKeyDown={e => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel(); }}
          autoFocus
          className="nodo-add-input"
        />
        {tipo === 'documento' && (
          <DocEditor values={values} setValues={setValues} rows={6} />
        )}
      </div>
      <div className="nodo-add-actions">
        <button onClick={onSave} className="btn-confirm">✓ Guardar</button>
        <button onClick={onCancel} className="btn-cancel-sm">✕ Cancelar</button>
      </div>
    </div>
  );
}

function TreeNode({ node, shared }) {
  const [collapsed, setCollapsed] = useState(false);
  const isEditing = shared.editingId === node._id;
  const showAddForm =
    shared.addingNode && String(shared.addingNode.parentId) === String(node._id);

  return (
    <div className={`nodo-item nodo-${node.tipo}`}>
      <div className="nodo-row">
        {node.tipo === 'subcategoria' ? (
          <button
            className="nodo-toggle"
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed ? '▸' : '▾'}
          </button>
        ) : (
          <span className="nodo-icon">📄</span>
        )}

        {isEditing ? (
          <div className="nodo-edit-area">
            <input
              value={shared.editValues.titulo}
              onChange={e => shared.setEditValues(v => ({ ...v, titulo: e.target.value }))}
              onKeyDown={e => {
                if (e.key === 'Enter' && node.tipo === 'subcategoria') shared.onSaveEdit(node);
                if (e.key === 'Escape') shared.onCancelEdit();
              }}
              className="nodo-edit-input"
              autoFocus
            />
            {node.tipo === 'documento' && (
              <DocEditor
                values={shared.editValues}
                setValues={shared.setEditValues}
                rows={7}
              />
            )}
            <div className="nodo-edit-btns">
              <button onClick={() => shared.onSaveEdit(node)} className="btn-confirm">✓</button>
              <button onClick={shared.onCancelEdit} className="btn-cancel-sm">✕</button>
            </div>
          </div>
        ) : (
          <span className="nodo-titulo">{node.titulo}</span>
        )}

        {!isEditing && (
          <div className="nodo-actions">
            <button
              onClick={() => shared.onEdit(node)}
              title="Editar"
              className="nodo-btn"
            >✏️</button>
            {node.tipo === 'subcategoria' && (
              <>
                <button
                  onClick={() => shared.onAddChild(node._id, 'subcategoria')}
                  title="Nueva subcategoría"
                  className="nodo-btn"
                >📁+</button>
                <button
                  onClick={() => shared.onAddChild(node._id, 'documento')}
                  title="Nuevo documento"
                  className="nodo-btn"
                >📄+</button>
              </>
            )}
            <button
              onClick={() => shared.onDelete(node)}
              title="Eliminar"
              className="nodo-btn nodo-btn-delete"
            >🗑️</button>
          </div>
        )}
      </div>

      {node.tipo === 'subcategoria' && !collapsed && (
        <div className="nodo-children">
          {node.children && node.children.map(child => (
            <TreeNode key={child._id} node={child} shared={shared} />
          ))}
          {showAddForm && (
            <AddNodeForm
              tipo={shared.addingNode.tipo}
              values={shared.newNodeValues}
              setValues={shared.setNewNodeValues}
              onSave={shared.onSaveNew}
              onCancel={shared.onCancelAdd}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function CuidadosAdmin() {
  const { getAuthHeaders } = useAuth();
  const { carrito } = useContext(CarritoContext);

  const [categorias, setCategorias] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ titulo: '', contenido: '', esHtml: false });

  const [addingNode, setAddingNode] = useState(null);
  const [newNodeValues, setNewNodeValues] = useState({ titulo: '', contenido: '', esHtml: false });

  useEffect(() => {
    categoriaService.obtenerCategorias({ incluirInactivas: 'false' })
      .then(res => {
        const cats = res.data || res.categorias || [];
        setCategorias(cats);
        if (cats.length > 0) setSelectedCat(cats[0]);
      })
      .catch(() => setError('Error al cargar categorías'));
  }, []);

  const loadNodes = useCallback(async () => {
    if (!selectedCat) return;
    setLoading(true);
    setError(null);
    try {
      const data = await nodoCuidadoService.getAll(selectedCat._id);
      setNodes(data);
    } catch {
      setError('Error al cargar cuidados');
    } finally {
      setLoading(false);
    }
  }, [selectedCat]);

  useEffect(() => { loadNodes(); }, [loadNodes]);

  const handleEdit = (node) => {
    setEditingId(node._id);
    setEditValues({ titulo: node.titulo, contenido: node.contenido || '', esHtml: node.esHtml || false });
    setAddingNode(null);
  };

  const handleSaveEdit = async (node) => {
    try {
      await nodoCuidadoService.actualizar(node._id, editValues, getAuthHeaders());
      setNodes(ns => ns.map(n => n._id === node._id ? { ...n, ...editValues } : n));
      setEditingId(null);
    } catch {
      setError('Error al guardar cambios');
    }
  };

  const handleCancelEdit = () => setEditingId(null);

  function removeDescendants(allNodes, rootId) {
    const toRemove = new Set();
    const queue = [String(rootId)];
    while (queue.length) {
      const id = queue.shift();
      toRemove.add(id);
      allNodes
        .filter(n => String(n.padre?._id || n.padre) === id)
        .forEach(n => queue.push(String(n._id)));
    }
    return allNodes.filter(n => !toRemove.has(String(n._id)));
  }

  const handleDelete = async (node) => {
    const msg = node.tipo === 'subcategoria'
      ? `¿Eliminar "${node.titulo}" y todo su contenido?`
      : `¿Eliminar "${node.titulo}"?`;
    if (!window.confirm(msg)) return;
    try {
      await nodoCuidadoService.eliminar(node._id, getAuthHeaders());
      setNodes(ns => removeDescendants(ns, node._id));
    } catch {
      setError('Error al eliminar');
    }
  };

  const handleAddChild = (parentId, tipo) => {
    setAddingNode({ parentId, tipo });
    setNewNodeValues({ titulo: '', contenido: '', esHtml: false });
    setEditingId(null);
  };

  const handleAddRoot = (tipo) => {
    setAddingNode({ parentId: null, tipo });
    setNewNodeValues({ titulo: '', contenido: '', esHtml: false });
    setEditingId(null);
  };

  const handleSaveNew = async () => {
    if (!newNodeValues.titulo.trim()) return;
    try {
      const siblingsCount = nodes.filter(n => {
        const p = n.padre?._id ? String(n.padre._id) : (n.padre ? String(n.padre) : null);
        return p === (addingNode.parentId ? String(addingNode.parentId) : null);
      }).length;
      const payload = {
        titulo: newNodeValues.titulo.trim(),
        tipo: addingNode.tipo,
        contenido: newNodeValues.contenido || '',
        esHtml: newNodeValues.esHtml || false,
        padre: addingNode.parentId || null,
        categoriaRaiz: selectedCat._id,
        orden: siblingsCount
      };
      const created = await nodoCuidadoService.crear(payload, getAuthHeaders());
      setNodes(ns => [...ns, created]);
      setAddingNode(null);
      setNewNodeValues({ titulo: '', contenido: '', esHtml: false });
    } catch {
      setError('Error al crear elemento');
    }
  };

  const tree = buildTree(nodes);

  const shared = {
    onEdit: handleEdit,
    onDelete: handleDelete,
    onAddChild: handleAddChild,
    editingId, editValues, setEditValues,
    onSaveEdit: handleSaveEdit,
    onCancelEdit: handleCancelEdit,
    addingNode, newNodeValues, setNewNodeValues,
    onSaveNew: handleSaveNew,
    onCancelAdd: () => setAddingNode(null)
  };

  return (
    <div className="cuidados-admin-page">
      <Header carrito={carrito} />
      <div className="cuidados-admin-container">
        <aside className="cuidados-admin-sidebar">
          <h3 className="sidebar-title">Categorías</h3>
          <ul className="sidebar-list">
            {categorias.map(cat => (
              <li
                key={cat._id}
                className={`sidebar-item${selectedCat?._id === cat._id ? ' active' : ''}`}
                onClick={() => {
                  setSelectedCat(cat);
                  setAddingNode(null);
                  setEditingId(null);
                }}
              >
                {cat.nombre}
              </li>
            ))}
          </ul>
        </aside>

        <main className="cuidados-admin-main">
          {selectedCat ? (
            <>
              <div className="admin-main-header">
                <h2 className="admin-cat-title">{selectedCat.nombre}</h2>
                <div className="admin-add-btns">
                  <button className="btn-add-root" onClick={() => handleAddRoot('subcategoria')}>
                    📁 Nueva subcategoría
                  </button>
                  <button className="btn-add-root" onClick={() => handleAddRoot('documento')}>
                    📄 Nuevo documento
                  </button>
                </div>
              </div>

              {error && <p className="admin-error" role="alert">{error}</p>}

              {loading ? <Loading /> : (
                <div className="nodo-tree">
                  {addingNode && addingNode.parentId === null && (
                    <AddNodeForm
                      tipo={addingNode.tipo}
                      values={newNodeValues}
                      setValues={setNewNodeValues}
                      onSave={handleSaveNew}
                      onCancel={() => setAddingNode(null)}
                    />
                  )}
                  {tree.length === 0 && !addingNode && (
                    <p className="tree-empty">No hay contenido para esta categoría todavía.</p>
                  )}
                  {tree.map(node => (
                    <TreeNode key={node._id} node={node} shared={shared} />
                  ))}
                </div>
              )}
            </>
          ) : (
            loading ? <Loading /> : <p className="tree-empty">Selecciona una categoría</p>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
