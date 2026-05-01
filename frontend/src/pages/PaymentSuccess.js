import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { procesarResultadoPago, verificarEstadoPago, procesarPagoEnBackend } from '../services/pagoService';
import { useCarrito } from '../context/CarritoContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './styles/PaymentResult.css';
import Loading from '../components/shared/Loading';

function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const [paymentResult, setPaymentResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { vaciarCarrito } = useCarrito();

    useEffect(() => {
        const processPaymentResult = async () => {
            try {
                // Obtener parámetros de MercadoPago
                const status = searchParams.get('status') || 'approved';
                const payment_id = searchParams.get('payment_id');
                const external_reference = searchParams.get('external_reference');
                const payment_type = searchParams.get('payment_type');
                const merchant_order_id = searchParams.get('merchant_order_id');


                // Procesar resultado localmente primero
                const resultadoLocal = procesarResultadoPago({
                    status,
                    payment_id,
                    external_reference,
                    payment_type,
                    merchant_order_id
                });

                setPaymentResult(resultadoLocal);

                // ¡IMPORTANTE! Procesar pago en backend para crear pedido y actualizar stock
                try {
                    const backendResult = await procesarPagoEnBackend(searchParams);
                    
                    // Actualizar el resultado con información del backend
                    setPaymentResult(prev => ({
                        ...prev,
                        pedidoId: backendResult.pedidoId,
                        numeroPedido: backendResult.numeroPedido,
                        backendProcessed: true,
                        backendMessage: backendResult.message || 'Pedido creado exitosamente'
                    }));

                    // Vaciar el carrito en el frontend ahora que el pedido fue confirmado
                    try {
                        await vaciarCarrito();
                    } catch (cartError) {
                    }
                    
                } catch (backendError) {
                    // No falla la página, solo muestra advertencia
                    setPaymentResult(prev => ({
                        ...prev,
                        backendProcessed: false,
                        backendError: backendError.message
                    }));
                }

                // Limpiar localStorage
                localStorage.removeItem('mp_external_reference');
                localStorage.removeItem('mp_preference_id');

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        processPaymentResult();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="payment-result-page">
                <Header />
                <div className="payment-result-container">
                    <Loading text="Procesando resultado del pago..." />
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-result-page">
                <Header />
                <div className="payment-result-container">
                    <div className="payment-error">
                        <div className="error-icon">❌</div>
                        <h2>Error al procesar el pago</h2>
                        <p>{error}</p>
                        <div className="error-actions">
                            <Link to="/cart" className="btn btn-primary">
                                Volver al carrito
                            </Link>
                            <Link to="/" className="btn btn-secondary">
                                Ir al inicio
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const { estado, mensaje, esExitoso, detalles, numeroPedido, backendProcessed } = paymentResult;

    return (
        <div className="payment-result-page">
            <Header />
            <div className="payment-result-container">
                <div className={`payment-result ${esExitoso ? 'success' : 'info'}`}>
                    <div className="result-icon">
                        {esExitoso ? '✅' : '⏳'}
                    </div>
                    
                    <h1 className="result-title">
                        {esExitoso ? '¡Compra realizada!' : 'Pago en Proceso'}
                    </h1>
                    
                    <p className="result-message">{mensaje}</p>

                    {/* Confirmación del pedido */}
                    {esExitoso && backendProcessed && numeroPedido && (
                        <div className="order-confirmation">
                            <span className="order-confirmation-label">Número de pedido</span>
                            <span className="order-confirmation-number">#{numeroPedido}</span>
                            <span className="order-confirmation-hint">Guardá este número para hacer el seguimiento de tu compra</span>
                        </div>
                    )}

                    {detalles && (
                        <div className="payment-details">
                            <h3>Detalles del Pago</h3>
                            <div className="details-grid">
                                {detalles.payment_id && (
                                    <div className="detail-item">
                                        <span className="label">ID de Pago:</span>
                                        <span className="value">{detalles.payment_id}</span>
                                    </div>
                                )}
                                {detalles.external_reference && (
                                    <div className="detail-item">
                                        <span className="label">Referencia:</span>
                                        <span className="value">{detalles.external_reference}</span>
                                    </div>
                                )}
                                {detalles.payment_type && (
                                    <div className="detail-item">
                                        <span className="label">Método de Pago:</span>
                                        <span className="value">{detalles.payment_type}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <div className="result-actions">
                        {esExitoso ? (
                            <>
                                <Link to="/mis-pedidos" className="btn btn-primary">
                                    Ver mis pedidos
                                </Link>
                                <Link to="/" className="btn btn-secondary">
                                    Continuar comprando
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/cart" className="btn btn-primary">
                                    Volver al carrito
                                </Link>
                                <Link to="/" className="btn btn-secondary">
                                    Ir al inicio
                                </Link>
                            </>
                        )}
                    </div>

                    {esExitoso && (
                        <div className="success-info">
                            <p>
                                <strong>¿Qué sigue?</strong><br/>
                                Podés hacer seguimiento de tu compra en la sección "Mis Pedidos".
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default PaymentSuccess;