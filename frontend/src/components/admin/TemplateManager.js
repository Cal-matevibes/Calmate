import React, { useState } from 'react';
import '../styles/TemplateManager.css';

function TemplateManager({ onSelectTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [newTemplate, setNewTemplate] = useState({
    nombre: '',
    caracteristicas: [],
  });

  const handleSaveTemplate = () => {
    if (newTemplate.nombre.trim() === '') return;

    setTemplates((prevTemplates) => [...prevTemplates, newTemplate]);
    setNewTemplate({ nombre: '', caracteristicas: [] });
  };

  return (
    <div className="template-manager">
      {/* Formulario para guardar un nuevo template */}
      <div className="template-manager-header">
        <input
          type="text"
          placeholder="Nombre del template"
          value={newTemplate.nombre}
          onChange={(e) =>
            setNewTemplate({ ...newTemplate, nombre: e.target.value })
          }
        />
        <button onClick={handleSaveTemplate}>Guardar Template</button>
      </div>

      {/* Lista de templates */}
      <div className="template-manager-list">
        {templates.map((template, index) => (
          <div key={index} className="template-manager-item">
            <span>{template.nombre}</span>
            <button onClick={() => onSelectTemplate(template)}>
              Usar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TemplateManager;