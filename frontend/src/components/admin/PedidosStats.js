import React from 'react';
import './styles/PedidosStats.css';

function PedidosStats({ pedidos, onFilterByStatus }) {
  // Calcular estadísticas basadas en los pedidos
  const stats = {
    pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
    confirmados: pedidos.filter(p => p.estado === 'confirmado').length,
    preparando: pedidos.filter(p => p.estado === 'preparando').length,
    listos: pedidos.filter(p => p.estado === 'listo_para_envio').length,
    enviados: pedidos.filter(p => p.estado === 'enviado').length,
    entregados: pedidos.filter(p => p.estado === 'entregado').length,
    cancelados: pedidos.filter(p => p.estado === 'cancelado').length,
    total: pedidos.length
  };

  const handleStatClick = (estado) => {
    onFilterByStatus(estado);
  };

  return (
    <div className="pedidos-stats">
      <div className="stats-grid">
        <div 
          className="stat-card pendientes clickable"
          onClick={() => handleStatClick('pendiente')}
          title="Clic para filtrar pedidos pendientes"
        >
          <div className="stat-icon">
            <i className="bi bi-clock-history"></i>
          </div>
          <span className="stat-number">{stats.pendientes}</span>
          <span className="stat-label">Pendientes</span>
        </div>

        <div 
          className="stat-card confirmados clickable"
          onClick={() => handleStatClick('confirmado')}
          title="Clic para filtrar pedidos confirmados"
        >
          <div className="stat-icon">
            <i className="bi bi-check-circle"></i>
          </div>
          <span className="stat-number">{stats.confirmados}</span>
          <span className="stat-label">Confirmados</span>
        </div>


        <div 
          className="stat-card listos clickable"
          onClick={() => handleStatClick('listo_para_envio')}
          title="Clic para filtrar pedidos listos para envío"
        >
          <div className="stat-icon">
            <i className="bi bi-box-seam"></i>
          </div>
          <span className="stat-number">{stats.listos}</span>
          <span className="stat-label">Listos</span>
        </div>

        <div 
          className="stat-card enviados clickable"
          onClick={() => handleStatClick('enviado')}
          title="Clic para filtrar pedidos enviados"
        >
          <div className="stat-icon">
            <i className="bi bi-truck"></i>
          </div>
          <span className="stat-number">{stats.enviados}</span>
          <span className="stat-label">Enviados</span>
        </div>

        <div 
          className="stat-card entregados clickable"
          onClick={() => handleStatClick('entregado')}
          title="Clic para filtrar pedidos entregados"
        >
          <div className="stat-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <span className="stat-number">{stats.entregados}</span>
          <span className="stat-label">Entregados</span>
        </div>

        <div 
          className="stat-card cancelados clickable"
          onClick={() => handleStatClick('cancelado')}
          title="Clic para filtrar pedidos cancelados"
        >
          <div className="stat-icon">
            <i className="bi bi-x-circle"></i>
          </div>
          <span className="stat-number">{stats.cancelados}</span>
          <span className="stat-label">Cancelados</span>
        </div>

        <div 
          className="stat-card total clickable"
          onClick={() => handleStatClick('todos')}
          title="Clic para mostrar todos los pedidos"
        >
          <div className="stat-icon">
            <i className="bi bi-list-ul"></i>
          </div>
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
      </div>
    </div>
  );
}

export default PedidosStats;