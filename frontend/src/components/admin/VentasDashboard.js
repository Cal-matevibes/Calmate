import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../styles/VentasDashboard.css';
import '../styles/ChartMobileOptimizations.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function VentasDashboard({ metrics, data, onProductClick }) {
  const [chartType, setChartType] = useState('line');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Preparar datos para el gráfico comparativo
  const getChartData = () => {
    // Agrupar datos por fecha
    const dateGroups = data.reduce((acc, item) => {
      const date = item.fechaVenta;
      if (!acc[date]) {
        acc[date] = { compras: 0, ventas: 0 };
      }
      acc[date].compras += item.cantidadVendida * item.precioCompra;
      acc[date].ventas += item.cantidadVendida * item.precioVenta;
      return acc;
    }, {});

    const labels = Object.keys(dateGroups).sort();
    const comprasData = labels.map(date => dateGroups[date].compras);
    const ventasData = labels.map(date => dateGroups[date].ventas);

    return {
      labels: labels.map(date => new Date(date).toLocaleDateString()),
      datasets: [
        {
          label: 'Inversión (Compras)',
          data: comprasData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4
        },
        {
          label: 'Ingresos (Ventas)',
          data: ventasData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4
        }
      ]
    };
  };

  // Datos para el gráfico de productos más accedidos
  const getTopAccessedChart = () => {
    const topProducts = metrics.productosMasAccedidos.slice(0, 5);
    const maxLength = isExtraSmall ? 8 : isSmallMobile ? 10 : isMobile ? 12 : 15;
    
    return {
      labels: topProducts.map(p => p.nombreProducto.length > maxLength 
        ? p.nombreProducto.substring(0, maxLength) + '...' 
        : p.nombreProducto
      ),
      datasets: [{
        label: 'Accesos',
        data: topProducts.map(p => p.accesos),
        backgroundColor: [
          'rgba(82, 105, 26, 0.8)',
          'rgba(106, 134, 32, 0.8)',
          'rgba(139, 171, 42, 0.8)',
          'rgba(183, 199, 116, 0.8)',
          'rgba(206, 217, 159, 0.8)'
        ],
        borderColor: [
          'rgb(82, 105, 26)',
          'rgb(106, 134, 32)',
          'rgb(139, 171, 42)',
          'rgb(183, 199, 116)',
          'rgb(206, 217, 159)'
        ],
        borderWidth: 2
      }]
    };
  };

  // Detectar si es móvil usando el estado dinámico
  const isMobile = windowWidth <= 768;
  const isSmallMobile = windowWidth <= 480;
  const isExtraSmall = windowWidth <= 390; // iPhone 12 y similares

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          usePointStyle: true,
          padding: isSmallMobile ? 8 : isMobile ? 12 : 20,
          font: {
            size: isExtraSmall ? 9 : isSmallMobile ? 10 : isMobile ? 11 : 12
          },
          boxWidth: isExtraSmall ? 6 : isSmallMobile ? 8 : 12,
          generateLabels: function(chart) {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
            const labels = original.call(this, chart);
            if (isMobile) {
              labels.forEach(label => {
                // Acortar etiquetas en móviles
                if (label.text.includes('Inversión')) {
                  label.text = '🔴 Compras';
                } else if (label.text.includes('Ingresos')) {
                  label.text = '🟢 Ventas';
                }
              });
            }
            return labels;
          }
        }
      },
      title: {
        display: true,
        text: isExtraSmall ? 'Compras vs Ventas' : isMobile ? 'Inversión vs Ingresos' : 'Comparativo: Inversión vs Ingresos',
        font: {
          size: isExtraSmall ? 11 : isSmallMobile ? 12 : isMobile ? 14 : 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: isExtraSmall ? 5 : 10
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        titleFont: {
          size: isExtraSmall ? 9 : isSmallMobile ? 10 : 12
        },
        bodyFont: {
          size: isExtraSmall ? 9 : isSmallMobile ? 10 : 12
        },
        padding: isExtraSmall ? 6 : isMobile ? 8 : 12,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            let formattedValue;
            
            if (isExtraSmall && value >= 1000) {
              formattedValue = '$' + (value / 1000).toFixed(1) + 'K';
            } else {
              formattedValue = '$' + value.toLocaleString();
            }
            
            const shortLabel = isMobile 
              ? (context.dataset.label.includes('Inversión') ? 'Compras' : 'Ventas')
              : context.dataset.label;
              
            return shortLabel + ': ' + formattedValue;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        ticks: {
          font: {
            size: isExtraSmall ? 7 : isSmallMobile ? 8 : isMobile ? 9 : 11
          },
          maxRotation: isMobile ? 45 : 0,
          maxTicksLimit: isExtraSmall ? 3 : isSmallMobile ? 4 : isMobile ? 5 : 8,
          callback: function(value, index) {
            const label = this.getLabelForValue(value);
            if (isExtraSmall) {
              // Solo mostrar algunos labels en pantallas muy pequeñas
              return index % 2 === 0 ? label.split('/').slice(0, 2).join('/') : '';
            } else if (isMobile) {
              return label.split('/').slice(0, 2).join('/');
            }
            return label;
          }
        },
        grid: {
          display: !isExtraSmall
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: isExtraSmall ? 7 : isSmallMobile ? 8 : isMobile ? 9 : 11
          },
          callback: function(value) {
            if (isExtraSmall) {
              if (value >= 1000000) {
                return '$' + (value / 1000000).toFixed(0) + 'M';
              } else if (value >= 1000) {
                return '$' + (value / 1000).toFixed(0) + 'K';
              }
            } else if (isSmallMobile && value >= 1000) {
              return '$' + (value / 1000).toFixed(0) + 'K';
            }
            return '$' + value.toLocaleString();
          },
          maxTicksLimit: isExtraSmall ? 4 : isMobile ? 5 : 8
        },
        grid: {
          display: !isExtraSmall
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      point: {
        radius: isExtraSmall ? 1.5 : isSmallMobile ? 2 : isMobile ? 3 : 4,
        hoverRadius: isExtraSmall ? 3 : isSmallMobile ? 4 : isMobile ? 5 : 6,
        borderWidth: isExtraSmall ? 1 : 2
      },
      line: {
        borderWidth: isExtraSmall ? 1.5 : isSmallMobile ? 2 : 3,
        tension: 0.3
      }
    },
    layout: {
      padding: {
        left: isExtraSmall ? 5 : isMobile ? 10 : 20,
        right: isExtraSmall ? 5 : isMobile ? 10 : 20,
        top: isExtraSmall ? 5 : 10,
        bottom: isExtraSmall ? 5 : 10
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: isExtraSmall ? 'Top Productos' : isMobile ? 'Top 5 Productos' : 'Top 5 Productos Más Accedidos',
        font: {
          size: isExtraSmall ? 10 : isSmallMobile ? 11 : isMobile ? 12 : 14,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: isExtraSmall ? 5 : 10
        }
      },
      tooltip: {
        titleFont: {
          size: isExtraSmall ? 9 : isSmallMobile ? 10 : 12
        },
        bodyFont: {
          size: isExtraSmall ? 9 : isSmallMobile ? 10 : 12
        },
        padding: isExtraSmall ? 6 : isMobile ? 8 : 12,
        callbacks: {
          label: function(context) {
            return 'Accesos: ' + context.parsed.y.toLocaleString();
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: isExtraSmall ? 7 : isSmallMobile ? 8 : isMobile ? 9 : 11
          },
          maxRotation: isMobile ? 45 : 0,
          callback: function(value) {
            const label = this.getLabelForValue(value);
            if (isExtraSmall && label.length > 8) {
              return label.substring(0, 8) + '...';
            } else if (isMobile && label.length > 12) {
              return label.substring(0, 12) + '...';
            }
            return label;
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: isExtraSmall ? 7 : isSmallMobile ? 8 : isMobile ? 9 : 11
          },
          stepSize: 1,
          maxTicksLimit: isExtraSmall ? 4 : isMobile ? 5 : 8
        },
        grid: {
          display: !isExtraSmall
        }
      }
    },
    layout: {
      padding: {
        left: isExtraSmall ? 5 : isMobile ? 10 : 20,
        right: isExtraSmall ? 5 : isMobile ? 10 : 20,
        top: isExtraSmall ? 5 : 10,
        bottom: isExtraSmall ? 5 : 10
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getMarginPercentage = () => {
    if (metrics.totalVentas === 0) return 0;
    return ((metrics.gananciaNeta / metrics.totalVentas) * 100).toFixed(1);
  };

  return (
    <div className="ventas-dashboard">
      {/* Métricas principales */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <div className="metric-value">{formatCurrency(metrics.totalVentas)}</div>
            <div className="metric-label">Total Ventas</div>
          </div>
        </div>
        
        <div className="metric-card success">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <div className="metric-value">{formatCurrency(metrics.gananciaNeta)}</div>
            <div className="metric-label">Ganancia Neta</div>
            <div className="metric-subtitle">{getMarginPercentage()}% margen</div>
          </div>
        </div>
        
        <div className="metric-card info">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.productosVendidos}</div>
            <div className="metric-label">Productos Vendidos</div>
          </div>
        </div>
        
        <div className="metric-card warning">
          <div className="metric-icon">⚠️</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.productosDefectuosos}</div>
            <div className="metric-label">Defectuosos</div>
          </div>
        </div>
        
        <div className="metric-card danger">
          <div className="metric-icon">↩️</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.productosDevueltos}</div>
            <div className="metric-label">Devueltos</div>
          </div>
        </div>
        
        <div className="metric-card accent">
          <div className="metric-icon">👁️</div>
          <div className="metric-content">
            <div className="metric-value">
              {metrics.productosMasAccedidos.reduce((sum, p) => sum + p.accesos, 0)}
            </div>
            <div className="metric-label">Total Accesos</div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        {/* Gráfico principal comparativo */}
        <div className="chart-container main-chart">
          <div className="chart-header">
            <h3>Análisis Financiero</h3>
            <div className="chart-controls">
              <button 
                className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
                onClick={() => setChartType('line')}
              >
                📈 Líneas
              </button>
              <button 
                className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
                onClick={() => setChartType('bar')}
              >
                📊 Barras
              </button>
            </div>
          </div>
          <div className="chart-wrapper">
            {chartType === 'line' ? (
              <Line data={getChartData()} options={chartOptions} />
            ) : (
              <Bar data={getChartData()} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Gráfico de productos más accedidos */}
        <div className="chart-container secondary-chart">
          <div className="chart-wrapper">
            <Bar data={getTopAccessedChart()} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Top productos más vendidos */}
      <div className="top-products-section">
        <h3>🏆 Top 5 Productos Más Vendidos</h3>
        <div className="top-products-grid">
          {metrics.productosMasVendidos.map((product, index) => (
            <div 
              key={product.id} 
              className="top-product-card"
              onClick={() => onProductClick(product)}
            >
              <div className="product-rank">#{index + 1}</div>
              <div className="product-info">
                <h4>{product.nombreProducto}</h4>
                <div className="product-stats">
                  <span className="sold-count">{product.cantidadVendida} vendidos</span>
                  <span className="revenue">{formatCurrency(product.cantidadVendida * product.precioVenta)}</span>
                </div>
                <div className="product-margin">
                  Margen: {formatCurrency(product.margenGanancia)} por unidad
                </div>
              </div>
              <div className="product-status">
                <span className={`status-badge ${product.estado}`}>
                  {product.estado === 'normal' ? '✅' : 
                   product.estado === 'defectuoso' ? '⚠️' : '↩️'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VentasDashboard;