import React, { useState, useEffect } from 'react';
import cuidadoService from '../../services/cuidadoService';
import './CuidadosList.css';
import Loading from '../shared/Loading';

const CuidadosList = ({ categoria = null }) => {
    const [cuidados, setCuidados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarCuidados = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await cuidadoService.obtenerCuidados(categoria);
                setCuidados(response.data);
            } catch (error) {
                setError('Error al cargar los cuidados');
            } finally {
                setLoading(false);
            }
        };

        cargarCuidados();
    }, [categoria]);

    if (loading) {
        return (
            <Loading text="Cargando cuidados..." />
        );
    }

    if (error) {
        return (
            <div className="cuidados-error">
                <p>⚠️ {error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="retry-button"
                >
                    Intentar de nuevo
                </button>
            </div>
        );
    }

    if (cuidados.length === 0) {
        return (
            <div className="cuidados-empty">
                <h3 className="empty-title">¡Próximamente!</h3>
                <p className="empty-message">
                    Estamos preparando los mejores consejos y cuidados para tus mates y termos.
                    Pronto encontrarás aquí toda la información que necesitas para mantenerlos 
                    en perfecto estado.
                </p>
                <p className="empty-footer">¡Mantente atento a las actualizaciones!</p>
            </div>
        );
    }

    return (
        <div className="cuidados-list">
            {cuidados.map((cuidado) => (
                <div key={cuidado._id} className="cuidado-card">
                    {cuidado.imagenUrl && (
                        <div className="cuidado-image">
                            <img src={cuidado.imagenUrl} alt={cuidado.titulo} />
                        </div>
                    )}
                    
                    <div className="cuidado-content">
                        <div className="cuidado-header">
                            <h3 className="cuidado-title">{cuidado.titulo}</h3>
                            <span className={`cuidado-category category-${cuidado.categoria}`}>
                                {cuidado.categoria}
                            </span>
                        </div>
                        
                        <p className="cuidado-description">{cuidado.descripcion}</p>
                        
                        {cuidado.pasos && cuidado.pasos.length > 0 && (
                            <div className="cuidado-steps">
                                <h4 className="steps-title">Pasos a seguir:</h4>
                                <ol className="steps-list">
                                    {cuidado.pasos.map((paso) => (
                                        <li key={paso.numero} className="step-item">
                                            {paso.instruccion}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}
                        
                        {cuidado.consejos && cuidado.consejos.length > 0 && (
                            <div className="cuidado-tips">
                                <h4 className="tips-title">Consejos adicionales:</h4>
                                <ul className="tips-list">
                                    {cuidado.consejos.map((consejo, index) => (
                                        <li key={index} className="tip-item">
                                            {consejo}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CuidadosList;