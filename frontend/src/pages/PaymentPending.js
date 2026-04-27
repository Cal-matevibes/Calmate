import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { procesarResultadoPago, verificarEstadoPago } from '../services/pagoService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './styles/PaymentResult.css';
import Loading from '../components/shared/Loading';

function PaymentPending() {
    const [searchParams] = useSearchParams();
    const [paymentResult, setPaymentResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const processPaymentPending = async () => {
            try {
                // Obtener parámetros de MercadoPago
                const status = searchParams.get('status') || 'pending';
                const payment_id = searchParams.get('payment_id');
                const external_reference = searchParams.get('external_reference');
                const payment_type = searchParams.get('payment_type');
                const merchant_order_id = searchParams.get('merchant_order_id');

                console.log('⏳ Procesando pago pendiente:', {
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
                console.error('❌ Error procesando pendiente:', error);
                setPaymentResult({
                    estado: 'pendiente',
                    mensaje: 'Tu pago está siendo procesado.',
                    esExitoso: false,
                    detalles: null
                });
            } finally {
                setLoading(false);
            }
        };

        processPaymentPending();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="payment-result-page">
                <Header />
                <div className="payment-result-container">
                    <Loading text="Procesando información..." />
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
                <div className="payment-result pending">
                    <div className="result-icon">⏳</div>
                    
                    <h1 className="result-title">Pago en Proceso</h1>
                    
                    <p className="result-message">{mensaje}</p>
                    
                    <div className="pending-info">
                        <h3>¿Qué significa esto?</h3>
                        <ul>
                            <li>Tu pago está siendo verificado por el banco</li>
                            <li>Recibirás una notificación cuando se complete</li>
                            <li>El proceso puede tomar hasta 24 horas</li>
                            <li>Tu pedido quedará reservado mientras tanto</li>
                        </ul>
                    </div>
                    
                    {detalles && (
                        <div className="payment-details">
                            <h3>Información del Pago</h3>
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
                                        <span className="label">Método:</span>
                                        <span className="value">{detalles.payment_type}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <div className="result-actions">
                        <Link to="/mis-pedidos" className="btn btn-primary">
                            Ver mis pedidos
                        </Link>
                        <Link to="/" className="btn btn-secondary">
                            Continuar navegando
                        </Link>
                    </div>

                    <div className="notification-info">
                        <p>
                            <strong>Te mantendremos informado</strong><br/>
                            Te enviaremos un email cuando tu pago sea confirmado. 
                            También puedes verificar el estado en "Mis Pedidos".
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default PaymentPending;