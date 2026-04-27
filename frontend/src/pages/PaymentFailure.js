import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { procesarResultadoPago, verificarEstadoPago } from '../services/pagoService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './styles/PaymentResult.css';
import Loading from '../components/shared/Loading';

function PaymentFailure() {
    const [searchParams] = useSearchParams();
    const [paymentResult, setPaymentResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const processPaymentFailure = async () => {
            try {
                // Obtener parámetros de MercadoPago
                const status = searchParams.get('status') || 'rejected';
                const payment_id = searchParams.get('payment_id');
                const external_reference = searchParams.get('external_reference');
                const payment_type = searchParams.get('payment_type');
                const merchant_order_id = searchParams.get('merchant_order_id');

                console.log('❌ Procesando pago fallido:', {
                    status,
                    payment_id,
                    external_reference,
                    payment_type,
                    merchant_order_id,
                    allParams: Object.fromEntries(searchParams.entries())
                });

                // Procesar resultado localmente
                const resultado = procesarResultadoPago({
                    status,
                    payment_id,
                    external_reference,
                    payment_type,
                    merchant_order_id
                });

                setPaymentResult(resultado);

                // Verificar estado en backend si tenemos referencia externa
                if (external_reference) {
                    try {
                        const backendVerification = await verificarEstadoPago(external_reference, payment_id);
                        if (backendVerification) {
                            console.log('✅ Verificación backend exitosa:', backendVerification);
                        }
                    } catch (error) {
                        console.warn('⚠️ No se pudo verificar en backend:', error);
                        // No es crítico, continuamos con el resultado local
                    }
                }

            } catch (error) {
                console.error('❌ Error procesando fallo:', error);
                setPaymentResult({
                    estado: 'error',
                    mensaje: 'No se pudo procesar el resultado del pago.',
                    esExitoso: false,
                    detalles: null
                });
            } finally {
                setLoading(false);
            }
        };

        processPaymentFailure();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="payment-result-page">
                <Header />
                <div className="payment-result-container">
                    <Loading text="Procesando resultado..." />
                </div>
                <Footer />
            </div>
        );
    }

    const { mensaje, detalles } = paymentResult;

    return (
        <div className="payment-result-page">
            <Header />
            <div className="payment-result-container">
                <div className="payment-result failure">
                    <div className="result-icon">❌</div>
                    
                    <h1 className="result-title">Pago No Completado</h1>
                    
                    <p className="result-message">{mensaje}</p>
                    
                    <div className="failure-reasons">
                        <h3>Posibles causas:</h3>
                        <ul>
                            <li>Fondos insuficientes en tu cuenta</li>
                            <li>Datos de tarjeta incorrectos</li>
                            <li>Límite de compra excedido</li>
                            <li>Problemas de conectividad</li>
                        </ul>
                    </div>
                    
                    {detalles && detalles.payment_id && (
                        <div className="payment-details">
                            <h3>Información del Intento</h3>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <span className="label">ID de Transacción:</span>
                                    <span className="value">{detalles.payment_id}</span>
                                </div>
                                {detalles.external_reference && (
                                    <div className="detail-item">
                                        <span className="label">Referencia:</span>
                                        <span className="value">{detalles.external_reference}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <div className="result-actions">
                        <Link to="/cart" className="btn btn-primary">
                            Intentar nuevamente
                        </Link>
                        <Link to="/" className="btn btn-secondary">
                            Continuar navegando
                        </Link>
                    </div>

                    <div className="help-info">
                        <p>
                            <strong>¿Necesitas ayuda?</strong><br/>
                            Si el problema persiste, puedes contactarnos por WhatsApp 
                            o elegir otro método de pago.
                        </p>
                        <Link to="/contact" className="help-link">
                            Contactar soporte
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default PaymentFailure;