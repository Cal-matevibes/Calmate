import React, { useState, useEffect, useRef } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { crearPreferenciaPago, formatearDatosOrden } from '../../services/pagoService';
import { useAuth } from '../../context/AuthContext';

// Configuración inicial de MercadoPago
const publicKey = process.env.REACT_APP_MERCADOPAGO_PUBLIC_KEY;
let isInitialized = false;

if (publicKey && publicKey !== 'undefined' && !isInitialized) {
    try {
        initMercadoPago(publicKey);
        isInitialized = true;
        console.log('✅ MercadoPago inicializado');
    } catch (error) {
        console.error('❌ Error al inicializar MercadoPago:', error);
    }
} else if (!publicKey) {
    console.error('❌ No se encontró PUBLIC_KEY válida');
}

function MercadoPagoButton({
    orderData,
    onPaymentCreated,
    onPaymentError,
    disabled = false,
    className = ''
}) {
    const { user } = useAuth();
    const [preferenceId, setPreferenceId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isCreatingRef = useRef(false);
    const lastOrderDataRef = useRef(null);

    // Función para crear preferencia de pago
    async function createPaymentPreference() {
        if (isCreatingRef.current || loading || disabled || !orderData) {
            return;
        }

        const currentOrderData = JSON.stringify(orderData);
        if (currentOrderData === lastOrderDataRef.current) {
            return;
        }

        try {
            isCreatingRef.current = true;
            lastOrderDataRef.current = currentOrderData;
            setLoading(true);
            setError(null);
            setPreferenceId(null);

            console.log('🚀 Creando preferencia de pago...');

            // Formatear datos
            const formattedData = formatearDatosOrden(
                orderData.carrito,
                orderData.customer,
                orderData.shipping 
            );

            console.log('📋 Datos formateados:', formattedData);

            // Crear preferencia
            const response = await crearPreferenciaPago(formattedData, user);

            console.log('📨 Respuesta del servidor:', response);

            if (!response || !response.success) {
                throw new Error(response?.message || 'Error al crear preferencia');
            }

            if (!response.preferenceId) {
                throw new Error('No se recibió preferenceId del servidor');
            }

            console.log('✅ Preferencia creada:', response.preferenceId);
            setPreferenceId(response.preferenceId);

            if (onPaymentCreated) {
                onPaymentCreated(response);
            }

        } catch (err) {
            console.error('❌ Error creando preferencia:', err);
            const errorMessage = err.message || 'Error desconocido';
            setError(errorMessage);

            if (onPaymentError) {
                onPaymentError(err);
            }
        } finally {
            setLoading(false);
            isCreatingRef.current = false;
        }
    }

    // Effect para crear preferencia cuando cambian los datos
    useEffect(() => {
        if (orderData && !disabled) {
            createPaymentPreference();
        }
    }, [orderData, disabled]);

    // Función para reintentar
    const handleRetry = () => {
        isCreatingRef.current = false;
        lastOrderDataRef.current = null;
        setError(null);
        createPaymentPreference();
    };

    // Renderizar error
    if (error) {
        return (
            <div className={`mercadopago-error ${className}`}>
                <div style={{ 
                    textAlign: 'center', 
                    padding: '20px',
                    border: '1px solid #e74c3c',
                    borderRadius: '8px',
                    backgroundColor: '#fdf2f2'
                }}>
                    <p style={{ color: '#e74c3c', marginBottom: '10px' }}>
                        ❌ {error}
                    </p>
                    <button
                        onClick={handleRetry}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    // Renderizar loading
    if (loading) {
        return (
            <div className={`mercadopago-loading ${className}`}>
                <div style={{ 
                    textAlign: 'center', 
                    padding: '30px',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                }}>
                    <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid #f3f3f3',
                        borderTop: '2px solid #3498db',
                        borderRadius: '50%',
                        margin: '0 auto 10px'
                    }}></div>
                    <p style={{ color: '#666', margin: 0 }}>
                        Preparando método de pago...
                    </p>
                </div>
            </div>
        );
    }

    // Renderizar Wallet
    if (preferenceId) {
        return (
            <div className={`mercadopago-wallet ${className}`} key={preferenceId}>
                <Wallet
                    initialization={{
                        preferenceId: preferenceId,
                        redirectMode: 'blank'
                    }}
                />
            </div>
        );
    }

    // Estado inicial
    return (
        <div className={`mercadopago-initial ${className}`}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#999' }}>Inicializando...</p>
            </div>
        </div>
    );
}

export default MercadoPagoButton;