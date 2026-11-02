import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PedidoDetalle from '../components/PedidoDetalle';
import './styles/MisPedidos.css';
import Loading from '../components/shared/Loading';

function MisPedidos() {
  const navigate = useNavigate();
  const { user, getAuthHeaders, isAuthenticated } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMisPedidos();
    }
  }, [isAuthenticated, user]);

  const fetchMisPedidos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Llamada a la API para obtener los pedidos del usuario logueado
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/pedidos/mis-pedidos`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Usuario no tiene pedidos
          setPedidos([]);
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Transformar los datos de la API al formato que espera el componente
        const pedidosFormateados = data.data.map(pedido => ({
          id: pedido._id,
          numero: pedido.numeroPedido,
          fecha: pedido.fechaPedido,
          estado: pedido.estado,
          total: pedido.total,
          productos: pedido.items.map(item => ({
            id: item.producto._id || item.producto,
            nombre: item.nombre || item.producto?.nombre || 'Producto',
            cantidad: item.cantidad,
            precio: item.precioUnitario,
            imagen: item.producto?.imagenes?.[0]?.url || item.imagen || '/placeholder.svg'
          })),
          direccionEnvio: pedido.direccionEnvio ? {
            calle: pedido.direccionEnvio.calle || 'No especificada',
            ciudad: pedido.direccionEnvio.ciudad || 'No especificada',
            provincia: pedido.direccionEnvio.provincia || 'No especificada',
            codigoPostal: pedido.direccionEnvio.codigoPostal || 'No especificado'
          } : null,
          tracking: pedido.envio?.numeroTracking || null,
          fechaEntrega: pedido.fechaEntrega || null,
          fechaEntregaEstimada: pedido.fechaEntregaEstimada || null,
          metodoPago: pedido.metodoPago?.tipo ? 
            (pedido.metodoPago.tipo === 'tarjeta' ? 'Tarjeta de Crédito' :
             pedido.metodoPago.tipo === 'transferencia' ? 'Transferencia Bancaria' :
             pedido.metodoPago.tipo === 'mercadopago' ? 'MercadoPago' :
             pedido.metodoPago.tipo === 'efectivo' ? 'Efectivo' : 'Método de Pago'
            ) : 'No especificado',
          envio: pedido.envio?.costo || 0
        }));

        setPedidos(pedidosFormateados);
      } else {
        throw new Error(data.message || 'Error al cargar los pedidos');
      }

    } catch (err) {
      
      if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
        setError('Error de conexión. Verifica tu conexión a internet.');
      } else {
        setError(err.message || 'Error al cargar tus pedidos');
      }
      
      // En caso de error, mostrar datos mock para desarrollo
      if (process.env.NODE_ENV === 'development') {
        setPedidos([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredPedidos = pedidos.filter(pedido =>
    pedido.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pedido.productos.some(producto => 
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Mostrar loading mientras se verifica la autenticación o se cargan los pedidos
  if (loading || !isAuthenticated) {
    return (
      <div className="mis-pedidos-wrapper">
        <Header />
        <div className="page-loading-center">
          <Loading text={!isAuthenticated ? 'Verificando autenticación...' : 'Cargando tus pedidos...'} />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mis-pedidos-wrapper">
        <Header />
        <div className="mis-pedidos-container">
          <div className="error-message">
            <i className="bi bi-exclamation-triangle"></i>
            <p>{error}</p>
            <button onClick={fetchMisPedidos} className="retry-btn">
              Reintentar
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="mis-pedidos-wrapper">
      <Header />
      
      <div className="mis-pedidos-container">
        <div className="mis-pedidos-header">
          <div className="header-content">
            <div className="header-text">
              <h1>
                Mis Pedidos
              </h1>
              <p>Seguí el estado y detalles de todos tus pedidos, {user?.nombre}</p>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Buscar por número de pedido o producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {filteredPedidos.length === 0 ? (
          <div className="no-pedidos">
            <i className="bi bi-bag-x"></i>
            <h3>
              {searchTerm 
                ? `No se encontraron pedidos que coincidan con "${searchTerm}"` 
                : pedidos.length === 0 
                ? `¡Hola ${user?.nombre}! No tienes pedidos aún` 
                : 'No se encontraron pedidos'
              }
            </h3>
            <p>
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda' 
                : '¡Explora nuestros productos y realiza tu primer pedido!'
              }
            </p>
            {!searchTerm && (
              <a href="/catalog" className="btn-primary">
                Ver Catálogo
              </a>
            )}
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="btn-secondary"
              >
                Limpiar Búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="pedidos-grid">
            {filteredPedidos.map(pedido => (
              <PedidoDetalle
                key={pedido.id}
                pedido={pedido}
                onViewDetails={() => navigate(`/detalles/pedido/${pedido.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default MisPedidos;