import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { procesarResultadoPago } from '../services/pagoService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './styles/PaymentResult.css';
import Loading from '../components/shared/Loading';

function PaymentFailure() {
    const [searchParams] = useSearchParams();
    const [paymentResult, setPaymentResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const processPaymentFailure = () => {
            try {
                const getParam = (...names) => {
                    for (const name of names) {
                        const value = searchParams.get(name);
                        if (value && value.toLowerCase() !== 'null' && value.toLowerCase() !== 'undefined') {
                            return value;
                        }
                    }
                    return null;
                };

                const status = getParam('status', 'collection_status') || 'rejected';
                const payment_id = getParam('payment_id', 'collection_id');
                const external_reference = getParam('external_reference');
                const payment_type = getParam('payment_type');
                const merchant_order_id = getParam('merchant_order_id');

                const resultado = procesarResultadoPago({
                    status,
                    payment_id,
                    external_reference,
                    payment_type,
                    merchant_order_id
                });

                setPaymentResult(resultado);
            } catch (error) {
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

    const { estado, mensaje, detalles } = paymentResult;
    const detalleMensaje = estado === 'rechazado'
        ? 'Mercado Pago no pudo aprobar la operación. No vuelvas a ingresar los datos de tu tarjeta desde esta página; podés revisar el medio de pago o probar con otro.'
        : estado === 'cancelado'
            ? 'El proceso de pago se canceló antes de confirmarse. Si querés, podés volver al carrito y elegir otro medio.'
            : 'No recibimos una confirmación del pago. Revisá el estado en Mercado Pago antes de volver a intentarlo.';
    const paymentId = detalles?.paymentId;
    const externalReference = detalles?.externalReference;

    return (
        <div className="payment-result-page payment-failure-page">
            <Header />
            <main className="payment-result-container payment-failure-container">
                <article className="payment-result failure payment-failure-card">
                    <header className="payment-failure-heading">
                        <div className="payment-failure-icon" aria-hidden="true">
                            <i className="bi bi-exclamation-lg"></i>
                        </div>
                        <p className="payment-failure-eyebrow">Estado de tu compra</p>
                        <h1 className="result-title">No se pudo completar el pago</h1>
                        <p className="result-message">{mensaje}</p>
                    </header>

                    <section className="payment-failure-next-step">
                        <h2>¿Qué podés hacer?</h2>
                        <p>{detalleMensaje}</p>
                    </section>

                    {(paymentId || externalReference) && (
                        <dl className="payment-failure-reference">
                            {paymentId && (
                                <div>
                                    <dt>Número de operación</dt>
                                    <dd>{paymentId}</dd>
                                </div>
                            )}
                            {externalReference && (
                                <div>
                                    <dt>Referencia del pedido</dt>
                                    <dd>{externalReference}</dd>
                                </div>
                            )}
                        </dl>
                    )}

                    <div className="payment-failure-actions">
                        <Link to="/cart" className="btn btn-primary">
                            Volver al carrito
                            <i className="bi bi-arrow-right" aria-hidden="true"></i>
                        </Link>
                        <Link to="/" className="btn btn-secondary">
                            Seguir explorando
                        </Link>
                    </div>

                    <p className="payment-failure-support">
                        ¿Necesitás ayuda? <Link to="/contact">Contactá al equipo de Cal-Mate</Link>.
                    </p>
                </article>
            </main>
            <Footer />
        </div>
    );
}

export default PaymentFailure;