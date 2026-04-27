import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header.js';
import Footer from '../components/layout/Footer.js';
import ItemForm from '../components/admin/ItemForm.js';

import './styles/CrearItem.css';

function CrearItem() {
  // const [selectedTemplate, setSelectedTemplate] = useState(null); // Commented out - not currently used
  const [matesDisponibles, setMatesDisponibles] = useState([]);
  const [bombillasDisponibles, setBombillasDisponibles] = useState([]);
  const [productoAEditar] = useState(null); // Removed setProductoAEditar - not currently used
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        // Cargar mates
        const responseMates = await fetch(`${process.env.REACT_APP_BACKEND_URL}/productos?categoria=mates&conStock=true`);
        const resultMates = await responseMates.json();

        // Cargar bombillas
        const responseBombillas = await fetch(`${process.env.REACT_APP_BACKEND_URL}/productos?categoria=bombillas&conStock=true`);
        const resultBombillas = await responseBombillas.json();

        if (resultMates.success) {
          setMatesDisponibles(resultMates.data);
        }

        if (resultBombillas.success) {
          setBombillasDisponibles(resultBombillas.data);
        }

      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos necesarios');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Manejar creación de producto
  const handleCreateProduct = async (productData) => {
    try {
      console.log('Enviando datos:', productData);

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();

      if (result.success) {
        console.log('Producto creado exitosamente:', result.data);
        alert('✅ Producto creado exitosamente!');

        // Si es un mate o bombilla, actualizar las listas
        if (productData.categoria === 'mates') {
          setMatesDisponibles(prev => [...prev, result.data]);
        } else if (productData.categoria === 'bombillas') {
          setBombillasDisponibles(prev => [...prev, result.data]);
        }

        // Opcional: Redirigir o limpiar formulario
        // window.location.href = '/inventario';

      } else {
        console.error('Error al crear producto:', result.message);
        alert(`❌ Error al crear producto: ${result.message}`);

        // Mostrar errores de validación si los hay
        if (result.errors) {
          const errores = result.errors.map(err => err.msg).join('\n');
          alert(`Errores de validación:\n${errores}`);
        }
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('❌ Error de conexión. Verifica que el servidor esté funcionando.');
    }
  };

  // Mostrar loading mientras carga los datos
  if (loading) {
    return (
      <div>
        <Header />
        <div className="crear-item-page">
          <div className="loading-container">
            <p>Cargando datos...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Mostrar error si algo falló
  if (error) {
    return (
      <div>
        <Header />
        <div className="crear-item-page">
          <div className="error-container">
            <p>❌ {error}</p>
            <button onClick={() => window.location.reload()}>
              Intentar de nuevo
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      {/* <Breadcrumb /> */}
      <div className="crear-item-page">
        <div className="crear-item-form">
          <ItemForm
            onSubmit={handleCreateProduct}
            mates={matesDisponibles}
            bombillas={bombillasDisponibles}
            editingProduct={productoAEditar} // null para crear nuevo
          />
        </div>
        {/* <div className="crear-item-template-manager">
          <TemplateManager onSelectTemplate={setSelectedTemplate} />
        </div> */}
      </div>
      <Footer />
    </div>
  );
}

export default CrearItem;