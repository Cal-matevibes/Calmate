import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';
import Loading from '../components/shared/Loading';
import { CarritoContext } from '../context/CarritoContext.js';
import categoriaService from '../services/categoriaService';
import nodoCuidadoService from '../services/nodoCuidadoService';

import './styles/Cuidados.css';

function buildTree(nodes, parentId = null) {
  return nodes
    .filter(n => {
      const p = n.padre?._id ? String(n.padre._id) : (n.padre ? String(n.padre) : null);
      return p === (parentId ? String(parentId) : null);
    })
    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
    .map(n => ({ ...n, children: buildTree(nodes, n._id) }));
}

function SidebarNode({ node, selectedDocId, onSelectDoc, expandedNodes, toggleNode }) {
  const isSelected = selectedDocId === String(node._id);
  const isExpanded = expandedNodes.has(String(node._id));

  if (node.tipo === 'documento') {
    return (
      <button
        className={`sidebar-doc-item${isSelected ? ' selected' : ''}`}
        onClick={() => onSelectDoc(node)}
      >
        <span className="sidebar-doc-icon">📄</span>
        <span className="sidebar-doc-titulo">{node.titulo}</span>
      </button>
    );
  }

  return (
    <div className="sidebar-subcat-item">
      <button
        className={`sidebar-subcat-toggle${isExpanded ? ' open' : ''}`}
        onClick={() => toggleNode(String(node._id))}
      >
        <span className="sidebar-toggle-arrow">{isExpanded ? '▾' : '▸'}</span>
        <span className="sidebar-subcat-titulo">{node.titulo}</span>
      </button>
      {isExpanded && node.children && node.children.length > 0 && (
        <div className="sidebar-children">
          {node.children.map(child => (
            <SidebarNode
              key={child._id}
              node={child}
              selectedDocId={selectedDocId}
              onSelectDoc={onSelectDoc}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Cuidados() {
  const { carrito } = useContext(CarritoContext);
  const [categorias, setCategorias] = useState([]);
  const [expandedCats, setExpandedCats] = useState(new Set());
  const [nodesByCat, setNodesByCat] = useState({});
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingNodes, setLoadingNodes] = useState(new Set());
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const loadedRef = useRef(new Set());
  const docPanelRef = useRef(null);

  const loadNodesForCat = useCallback(async (catId) => {
    const id = String(catId);
    if (loadedRef.current.has(id)) return;
    loadedRef.current.add(id);
    setLoadingNodes(prev => new Set([...prev, id]));
    try {
      const data = await nodoCuidadoService.getAll(catId);
      setNodesByCat(prev => ({ ...prev, [id]: data }));
    } catch (e) {
      loadedRef.current.delete(id);
    } finally {
      setLoadingNodes(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  }, []);

  useEffect(() => {
    categoriaService.obtenerCategorias({ incluirInactivas: 'false' })
      .then(res => {
        const cats = res.data || res.categorias || [];
        setCategorias(cats);
        if (cats.length > 0) {
          const firstId = String(cats[0]._id);
          setExpandedCats(new Set([firstId]));
          loadNodesForCat(cats[0]._id);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingCats(false));
  }, [loadNodesForCat]);

  const toggleCat = (catId) => {
    const id = String(catId);
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        loadNodesForCat(catId);
      }
      return next;
    });
  };

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId); else next.add(nodeId);
      return next;
    });
  };

  const handleSelectDoc = (doc) => {
    setSelectedDoc(doc);
    // On mobile, scroll to the doc panel after a short delay to let React render
    if (window.innerWidth <= 768 && docPanelRef.current) {
      setTimeout(() => {
        docPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  return (
    <div className="cuidados-page">
      <Header carrito={carrito} userRole="client" />

      <div className="cuidados-hero-section">
        <h1 className="cuidados-hero-title">Cuidados del Mate</h1>
        <p className="cuidados-hero-subtitle">
          Aquí encontrarás toda la información necesaria para cuidar y mantener tu mate en perfecto estado.
        </p>
      </div>

      <div className="cuidados-layout">
        {loadingCats ? (
          <div className="cuidados-loading"><Loading /></div>
        ) : (
          <>
            <aside className="cuidados-sidebar">
              {categorias.map(cat => {
                const id = String(cat._id);
                const isExpanded = expandedCats.has(id);
                const nodes = nodesByCat[id] || [];
                const isLoading = loadingNodes.has(id);
                const tree = buildTree(nodes);
                return (
                  <div key={id} className="sidebar-cat-section">
                    <button
                      className={`sidebar-cat-header${isExpanded ? ' open' : ''}`}
                      onClick={() => toggleCat(cat._id)}
                    >
                      <span className="sidebar-cat-arrow">{isExpanded ? '▾' : '▸'}</span>
                      <span className="sidebar-cat-nombre">{cat.nombre}</span>
                    </button>
                    {isExpanded && (
                      <div className="sidebar-cat-children">
                        {isLoading ? (
                          <div className="sidebar-loading"><Loading /></div>
                        ) : tree.length === 0 ? (
                          <p className="sidebar-empty">Sin contenido.</p>
                        ) : (
                          tree.map(node => (
                            <SidebarNode
                              key={node._id}
                              node={node}
                              selectedDocId={selectedDoc ? String(selectedDoc._id) : null}
                              onSelectDoc={handleSelectDoc}
                              expandedNodes={expandedNodes}
                              toggleNode={toggleNode}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </aside>

            <div className="cuidados-doc-panel" ref={docPanelRef}>
              {selectedDoc ? (
                <>                 
                  <h2 className="doc-panel-title">{selectedDoc.titulo}</h2>
                  <div className="doc-panel-content">
                    {selectedDoc.contenido ? (
                      selectedDoc.esHtml ? (
                        <div
                          className="doc-panel-html"
                          dangerouslySetInnerHTML={{ __html: selectedDoc.contenido }}
                        />
                      ) : (
                        <pre className="doc-panel-text">{selectedDoc.contenido}</pre>
                      )
                    ) : (
                      <p className="doc-panel-empty-text">Este documento no tiene contenido todavía.</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="doc-panel-placeholder">
                  <span className="doc-panel-placeholder-icon">📄</span>
                  <p>Seleccioná un documento del panel izquierdo para ver su contenido aquí.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Cuidados;