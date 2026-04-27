import React, { useState } from 'react';
import '../styles/VentasExportModal.css';

function VentasExportModal({ onClose, onExport, dataCount }) {
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportRange, setExportRange] = useState('filtered');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simular proceso de exportación
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const exportConfig = {
      format: exportFormat,
      range: exportRange,
      includeCharts,
      includeSummary,
      dataCount: exportRange === 'filtered' ? dataCount : 'all'
    };
    
    onExport(exportConfig);
    setIsExporting(false);
  };

  const getFormatDescription = () => {
    switch (exportFormat) {
      case 'excel':
        return 'Archivo Excel (.xlsx) con hojas separadas para datos, gráficos y resumen';
      case 'pdf':
        return 'Documento PDF con reporte completo incluyendo visualizaciones';
      case 'csv':
        return 'Archivo CSV con datos tabulares (sin gráficos)';
      default:
        return '';
    }
  };

  const getEstimatedSize = () => {
    const baseSize = exportRange === 'filtered' ? dataCount * 0.5 : dataCount * 2;
    const chartSize = includeCharts ? 2 : 0;
    const summarySize = includeSummary ? 1 : 0;
    
    return Math.max(1, Math.round(baseSize + chartSize + summarySize));
  };

  return (
    <div className="export-modal-overlay">
      <div className="export-modal">
        <div className="export-modal-header">
          <h3>📥 Exportar Reporte de Ventas</h3>
          <button 
            className="close-modal-btn"
            onClick={onClose}
            disabled={isExporting}
          >
            ✕
          </button>
        </div>

        <div className="export-modal-content">
          {/* Formato de exportación */}
          <div className="export-section">
            <h4>📄 Formato de Archivo</h4>
            <div className="format-options">
              <label className={`format-option ${exportFormat === 'excel' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  value="excel"
                  checked={exportFormat === 'excel'}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <div className="format-content">
                  <div className="format-icon">📊</div>
                  <div className="format-info">
                    <strong>Excel</strong>
                    <span>Recomendado para análisis</span>
                  </div>
                </div>
              </label>

              <label className={`format-option ${exportFormat === 'pdf' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <div className="format-content">
                  <div className="format-icon">📋</div>
                  <div className="format-info">
                    <strong>PDF</strong>
                    <span>Ideal para presentaciones</span>
                  </div>
                </div>
              </label>

              <label className={`format-option ${exportFormat === 'csv' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <div className="format-content">
                  <div className="format-icon">📈</div>
                  <div className="format-info">
                    <strong>CSV</strong>
                    <span>Solo datos tabulares</span>
                  </div>
                </div>
              </label>
            </div>
            <div className="format-description">
              {getFormatDescription()}
            </div>
          </div>

          {/* Rango de datos */}
          <div className="export-section">
            <h4>📊 Datos a Exportar</h4>
            <div className="range-options">
              <label className="range-option">
                <input
                  type="radio"
                  value="filtered"
                  checked={exportRange === 'filtered'}
                  onChange={(e) => setExportRange(e.target.value)}
                />
                <div className="range-info">
                  <strong>Datos filtrados actuales</strong>
                  <span>{dataCount} registros con filtros aplicados</span>
                </div>
              </label>

              <label className="range-option">
                <input
                  type="radio"
                  value="all"
                  checked={exportRange === 'all'}
                  onChange={(e) => setExportRange(e.target.value)}
                />
                <div className="range-info">
                  <strong>Todos los datos</strong>
                  <span>Historial completo de ventas</span>
                </div>
              </label>
            </div>
          </div>

          {/* Contenido adicional */}
          <div className="export-section">
            <h4>📋 Contenido Adicional</h4>
            <div className="content-options">
              <label className="content-option">
                <input
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                />
                <div className="option-info">
                  <strong>🧮 Resumen ejecutivo</strong>
                  <span>Métricas principales y KPIs</span>
                </div>
              </label>

              <label className="content-option">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  disabled={exportFormat === 'csv'}
                />
                <div className="option-info">
                  <strong>📈 Gráficos y visualizaciones</strong>
                  <span>
                    {exportFormat === 'csv' 
                      ? 'No disponible para CSV' 
                      : 'Incluir gráficos del dashboard'
                    }
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Información del archivo */}
          <div className="export-info">
            <div className="info-item">
              <span className="info-label">📁 Tamaño estimado:</span>
              <span className="info-value">{getEstimatedSize()} MB</span>
            </div>
            <div className="info-item">
              <span className="info-label">⏱️ Tiempo estimado:</span>
              <span className="info-value">
                {exportRange === 'all' ? '2-3 min' : '30-60 seg'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">📊 Registros:</span>
              <span className="info-value">
                {exportRange === 'filtered' ? dataCount : 'Todos los disponibles'}
              </span>
            </div>
          </div>
        </div>

        <div className="export-modal-footer">
          <button 
            className="btn-cancel-export"
            onClick={onClose}
            disabled={isExporting}
          >
            Cancelar
          </button>
          <button 
            className="btn-confirm-export"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <div className="export-spinner"></div>
                Exportando...
              </>
            ) : (
              <>
                📥 Exportar Reporte
              </>
            )}
          </button>
        </div>

        {/* Barra de progreso durante exportación */}
        {isExporting && (
          <div className="export-progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <div className="progress-text">
              Generando reporte... Por favor espere.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VentasExportModal;