const { MercadoPagoConfig, Preference } = require('mercadopago');
const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const Carrito = require('../models/Carrito');
const Usuario = require('../models/Usuario');
const Pago = require('../models/Pago');
const emailService = require('../services/emailService');

// Inicializar el cliente de Mercado Pago con el token correcto
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const isTestMode = accessToken && accessToken.startsWith('TEST-');

console.log('🔑 Configurando MercadoPago con token:', accessToken ? accessToken.substring(0, 20) + '...' : 'NO CONFIGURADO');
console.log('🧪 Modo de prueba:', isTestMode ? 'ACTIVADO' : 'DESACTIVADO');

if (!accessToken) {
    console.error('❌ MERCADOPAGO_ACCESS_TOKEN no está configurado en .env');
}

const client = new MercadoPagoConfig({
    accessToken: accessToken,
    options: {
        timeout: 5000,
        integratorId: 'dev_24c65fb163bf11ea96500242ac130004'
    }
});

// Inicializar el servicio de preferencias
const preference = new Preference(client);

const crearPreferencia = async (req, res) => {
    try {
        console.log('💳 === CREAR PREFERENCIA DE PAGO ===');
        console.log('📦 Body recibido:', JSON.stringify(req.body, null, 2));

        const { items, total, payer, backUrls, auto_return, external_reference, usuario_id, session_id } = req.body;

        // Validaciones básicas
        if (!items || !Array.isArray(items) || items.length === 0) {
            console.error('❌ [Backend] Items inválidos:', { items, type: typeof items, isArray: Array.isArray(items) });
            return res.status(400).json({
                success: false,
                message: 'Items del carrito son requeridos'
            });
        }

        if (!payer || !payer.email) {
            console.error('❌ [Backend] Payer inválido:', { payer });
            return res.status(400).json({
                success: false,
                message: 'Información del pagador es requerida'
            });
        }

        // Configurar URLs base
        const frontendUrl = process.env.FRONTEND_URL;

        // Crear external_reference con información del usuario/sesión
        const referenceData = {
            referencia: external_reference || `CV_${Date.now()}`,
            usuario_id: usuario_id || null,
            session_id: session_id || null,
            customer_email: payer?.email || null,
            customer_nombre: payer?.name || null,
            timestamp: Date.now()
        };

        console.log('🔗 External Reference Data:', referenceData);

        // Base URL para back_urls de MercadoPago (debe ser HTTPS en producción)
        // Usar MP_BACK_URL_BASE si está definida, sino FRONTEND_URL
        const backUrlBase = process.env.MP_BACK_URL_BASE || process.env.FRONTEND_URL;
        const backUrlIsHttps = backUrlBase && backUrlBase.startsWith('https');
        console.log('🔗 Back URLs base:', backUrlBase, '| HTTPS:', backUrlIsHttps);

        // Formatear preferencia para MercadoPago
        const preferenceData = {
            items: items.map((item, index) => ({
                id: String(item.id || `item_${index + 1}`),
                title: String(item.title || 'Producto'),
                description: String(item.description || 'Producto de CalmateVibes'),
                quantity: Math.max(1, parseInt(item.quantity) || 1),
                unit_price: Math.max(0.01, parseFloat(item.unit_price) || 0.01),
                currency_id: 'ARS'
            })),
            payer: {
                name: String(payer.name || 'Cliente'),
                surname: String(payer.surname || 'Test'),
                email: String(payer.email)
            },
            back_urls: {
                success: `${backUrlBase}/pago/exito`,
                failure: `${backUrlBase}/pago/error`,
                pending: `${backUrlBase}/pago/pendiente`,
            },
            // auto_return solo funciona con URLs HTTPS (requerido por MercadoPago)
            ...(backUrlIsHttps && { auto_return: 'approved' }),
            notification_url: `${process.env.BACKEND_URL}/api/pagos/webhook`,
            external_reference: JSON.stringify(referenceData)
        }
        const response = await preference.create({ body: preferenceData });

        // Verificar estructura antes de acceder
        const responseBody = response?.body || response;
        // Usar la estructura correcta según el SDK
        const responseData = response?.body || response;


        res.json({
            success: true,
            preferenceId: responseData?.id,
            initPoint: responseData?.init_point,
            sandboxInitPoint: responseData?.sandbox_init_point,
            externalReference: preferenceData.external_reference,
            total: total,
            metadata: {
                items_count: preferenceData.items.length,
                subtotal: total,
                envio: 0,
                descuento: 0
            }
        });

    } catch (error) {
        console.error('❌ [Backend] Error completo:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data
        });

        res.status(500).json({
            success: false,
            message: 'Error al crear la preferencia de pago',
            error: error.message
        });
    }
};

// Procesar resultado del pago
const procesarResultado = async (req, res) => {
    try {
        console.log('📋 === PROCESANDO RESULTADO DE PAGO ===');
        console.log('🔍 Query params:', req.query);
        console.log('📦 Body:', req.body);

        const {
            payment_id,
            status,
            external_reference,
            merchant_order_id
        } = req.query;

        if (status === 'approved' && payment_id) {
            console.log('✅ Pago aprobado, procesando...');

            // Extraer información del external_reference
            let usuarioId = null;
            let sessionId = null;

            if (external_reference) {
                try {
                    const refData = JSON.parse(external_reference);
                    usuarioId = refData.usuario_id;
                    sessionId = refData.session_id;
                    console.log('📋 Datos extraídos del external_reference:', { usuarioId, sessionId });
                } catch (e) {
                    console.log('⚠️ No se pudo parsear external_reference:', external_reference);
                }
            }

            // Procesar el pago exitoso
            const paymentData = {
                payment_id,
                external_reference,
                usuario_id: usuarioId,
                session_id: sessionId,
                payer_email: req.query.payer_email || req.body.payer_email,
                transaction_amount: req.query.transaction_amount || req.body.transaction_amount,
                payment_method_id: req.query.payment_method_id || req.body.payment_method_id,
                payment_type_id: req.query.payment_type_id || req.body.payment_type_id
            };

            try {
                const resultado = await procesarPagoExitoso(paymentData);
                console.log('🎉 Pago procesado exitosamente:', resultado);

                return res.json({
                    success: true,
                    message: 'Pago procesado exitosamente',
                    pedidoId: resultado.pedidoId,
                    numeroPedido: resultado.numeroPedido
                });
            } catch (processingError) {
                console.error('❌ Error procesando pago exitoso:', processingError);
                return res.status(500).json({
                    success: false,
                    message: 'Error procesando el pago exitoso: ' + processingError.message
                });
            }
        }

        // Para otros estados (pending, rejected, etc.)
        res.json({
            success: true,
            message: 'Resultado procesado correctamente',
            status,
            payment_id
        });

    } catch (error) {
        console.error('❌ Error procesando resultado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar el resultado del pago'
        });
    }
};

// Función para guardar pago en la base de datos
const guardarPago = async (paymentData, usuarioId, sessionId) => {
    try {
        console.log(`💾 Guardando pago ${paymentData.id} - Usuario: ${usuarioId}, Sesión: ${sessionId}`);
        
        // Usar findOneAndUpdate con upsert para manejar duplicados automáticamente
        const pagoData = {
            paymentId: paymentData.id.toString(),
            status: paymentData.status,
            transactionAmount: paymentData.transaction_amount,
            externalReference: paymentData.external_reference,
            
            // Información del pagador
            payer: {
                email: paymentData.payer?.email || null,
                identification: paymentData.payer?.identification ? {
                    type: paymentData.payer.identification.type || null,
                    number: paymentData.payer.identification.number || null
                } : {
                    type: null,
                    number: null
                },
                phone: paymentData.payer?.phone ? {
                    area_code: paymentData.payer.phone.area_code || null,
                    number: paymentData.payer.phone.number || null
                } : {
                    area_code: null,
                    number: null
                }
            },
            
            // Método de pago
            paymentMethodId: paymentData.payment_method_id,
            paymentTypeId: paymentData.payment_type_id,
            
            // Fechas
            dateCreated: new Date(paymentData.date_created),
            dateApproved: paymentData.date_approved ? new Date(paymentData.date_approved) : null,
            dateLastUpdated: paymentData.date_last_updated ? new Date(paymentData.date_last_updated) : null,
            
            // Usuario/sesión
            usuario: usuarioId || null,
            sessionId: sessionId || null,
            
            // Datos completos para auditoría
            mercadoPagoData: paymentData
        };

        // Intentar actualizar o crear el pago
        const resultado = await Pago.findOneAndUpdate(
            { paymentId: paymentData.id.toString() },
            {
                $set: pagoData,
                $push: {
                    historial: {
                        estado: paymentData.status,
                        descripcion: `Webhook procesado - ${new Date().toLocaleString()}`
                    }
                }
            },
            { 
                upsert: true, 
                new: true,
                setDefaultsOnInsert: true
            }
        );

        console.log(`✅ Pago ${resultado.paymentId} ${resultado.isNew ? 'creado' : 'actualizado'} exitosamente`);
        return resultado;
        
    } catch (error) {
        // Si aún hay error de duplicado, intentar solo actualizar
        if (error.code === 11000) {
            console.log('🔄 Conflicto de duplicado, actualizando registro existente...');
            
            // Actualizar pago existente
            const pagoActualizado = await Pago.findOneAndUpdate(
                { paymentId: paymentData.id.toString() },
                {
                    status: paymentData.status,
                    transactionAmount: paymentData.transaction_amount,
                    dateLastUpdated: paymentData.date_last_updated ? new Date(paymentData.date_last_updated) : null,
                    dateApproved: paymentData.date_approved ? new Date(paymentData.date_approved) : null,
                    mercadoPagoData: paymentData,
                    $push: {
                        historial: {
                            estado: paymentData.status,
                            descripcion: `Estado actualizado por conflicto - ${new Date().toLocaleString()}`
                        }
                    }
                },
                { new: true }
            );
            
            return pagoActualizado;
        }
        
        console.error('❌ Error en guardarPago:', error);
        throw error;
    } 
};

// Webhook para notificaciones de MercadoPago - IMPLEMENTACIÓN DIRECTA
const webhook = async (req, res) => {
    const webhookId = `WH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`🔔 === WEBHOOK MERCADOPAGO RECIBIDO [${webhookId}] ===`);
    console.log('📦 Body completo:', JSON.stringify(req.body, null, 2));
    console.log('🔗 Query params:', JSON.stringify(req.query, null, 2));

    // Obtener el payment ID desde query params
    const paymentId = req.query.id || req.query['data.id'] || req.body?.data?.id;
    
    if (!paymentId) {
        console.log(`⚠️ [${webhookId}] No se encontró payment ID en el webhook`);
        return res.sendStatus(200); // Responder 200 para evitar reintentos
    }

    try {
        console.log(`🔍 [${webhookId}] Obteniendo detalles del pago ID: ${paymentId}`);
        
        // Hacer petición directa a la API de MercadoPago
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
            }
        });

        if (response.ok) {
            const paymentData = await response.json();
            console.log('💳 Detalles del pago obtenidos:', {
                id: paymentData.id,
                status: paymentData.status,
                transaction_amount: paymentData.transaction_amount,
                external_reference: paymentData.external_reference,
                payer_email: paymentData.payer?.email
            });

            // Extraer información del external_reference para todos los pagos
            let usuarioId = null;
            let sessionId = null;

            if (paymentData.external_reference) {
                try {
                    const refData = JSON.parse(paymentData.external_reference);
                    usuarioId = refData.usuario_id;
                    sessionId = refData.session_id;
                    console.log('📋 Datos extraídos del external_reference:', { usuarioId, sessionId });
                } catch (e) {
                    console.log('⚠️ No se pudo parsear external_reference:', paymentData.external_reference);
                }
            }

            // 1. SIEMPRE GUARDAR EL PAGO EN LA BASE DE DATOS (cualquier estado)
            try {
                const pagoGuardado = await guardarPago(paymentData, usuarioId, sessionId);
                console.log(`💾 Pago guardado en BD con estado: ${paymentData.status}, ID: ${pagoGuardado._id}`);
            } catch (pagoError) {
                console.error('❌ Error guardando pago en BD:', pagoError);
                // Continuar aunque falle el guardado del pago
            }

            // 2. SOLO PROCESAR PEDIDO SI EL PAGO ES EXITOSO
            if (paymentData.status === 'approved') {
                console.log('✅ Pago aprobado, procesando pedido automáticamente...');

                // Preparar datos para procesamiento del pedido
                const paymentProcessData = {
                    payment_id: paymentData.id,
                    external_reference: paymentData.external_reference,
                    usuario_id: usuarioId,
                    session_id: sessionId,
                    payer_email: paymentData.payer?.email,
                    transaction_amount: paymentData.transaction_amount,
                    payment_method_id: paymentData.payment_method_id,
                    payment_type_id: paymentData.payment_type_id
                };

                try {
                    const resultado = await procesarPagoExitoso(paymentProcessData);
                    console.log('🎉 Pago procesado exitosamente via webhook:', resultado);
                    
                    // Actualizar el pago para asociarlo con el pedido creado
                    try {
                        await Pago.findOneAndUpdate(
                            { paymentId: paymentData.id.toString() },
                            { 
                                pedido: resultado.pedidoId,
                                procesado: true,
                                $push: {
                                    historial: {
                                        estado: 'procesado',
                                        descripcion: `Pedido creado: ${resultado.pedidoId}`
                                    }
                                }
                            }
                        );
                        console.log('🔗 Pago asociado con pedido:', resultado.pedidoId);
                    } catch (updateError) {
                        console.error('⚠️ Error asociando pago con pedido:', updateError);
                    }
                } catch (processingError) {
                    console.error('❌ Error procesando pago exitoso via webhook:', processingError);
                    // Marcar el pago como fallido en el procesamiento
                    try {
                        await Pago.findOneAndUpdate(
                            { paymentId: paymentData.id.toString() },
                            {
                                $push: {
                                    historial: {
                                        estado: 'error_procesamiento',
                                        descripcion: `Error procesando pedido: ${processingError.message}`
                                    }
                                }
                            }
                        );
                    } catch (updateError) {
                        console.error('❌ Error actualizando historial de pago:', updateError);
                    }
                }
            } else {
                console.log(`⚠️ Pago con estado: ${paymentData.status} - Solo guardado en BD, no se crea pedido`);
            }
        } else {
            console.error('❌ Error obteniendo pago de MercadoPago API:', response.status, response.statusText);
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('❌ Error obteniendo detalles del pago via webhook:', error);
        res.sendStatus(200); // Responder 200 para evitar reintentos de MercadoPago
    }
};




// Funciones auxiliares removidas - ahora usamos implementación directa con fetch

// Verificar estado del pago
const verificarEstado = async (req, res) => {
    try {
        const { paymentId, externalReference } = req.params;

        res.json({
            success: true,
            message: 'Estado verificado',
            paymentId,
            externalReference
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al verificar el estado del pago'
        });
    }
};

// Ruta de prueba
const test = async (req, res) => {
    res.json({
        success: true,
        message: '🚀 API de pagos funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        hasAccessToken: !!accessToken
    });
};

// Función para procesar pago exitoso - CREAR PEDIDO, ACTUALIZAR STOCK, VACIAR CARRITO
const procesarPagoExitoso = async (paymentData) => {
    try {
        console.log('🏆 === PROCESANDO PAGO EXITOSO ===');
        console.log('💰 Datos del pago:', JSON.stringify(paymentData, null, 2));

        const {
            payment_id,
            external_reference,
            usuario_id,
            session_id,
            payer_email,
            customer_email,
            customer_nombre,
            transaction_amount,
            payment_method_id,
            payment_type_id
        } = paymentData;

        // Extraer datos del cliente del external_reference si están disponibles
        let emailFromRef = null;
        let nombreFromRef = null;
        if (external_reference) {
            try {
                const refData = JSON.parse(external_reference);
                emailFromRef = refData.customer_email || null;
                nombreFromRef = refData.customer_nombre || null;
            } catch (e) { /* ignorar */ }
        }

        // 0. Verificar si el pedido ya fue procesado (idempotencia)
        const pedidoExistente = await Pedido.findOne({ 'mercadoPago.paymentId': String(payment_id) });
        if (pedidoExistente) {
            console.log('⚠️ Pedido ya existe para este pago, evitando duplicado:', pedidoExistente._id);
            return {
                success: true,
                pedidoId: pedidoExistente._id,
                numeroPedido: pedidoExistente.numeroPedido,
                mensaje: 'Pedido ya procesado'
            };
        }

        // 1. Obtener el carrito del usuario o sesión
        let carrito;
        if (usuario_id) {
            console.log('👤 Buscando carrito para usuario:', usuario_id);
            carrito = await Carrito.findOne({
                usuario: usuario_id,
                activo: true
            }).populate('items.producto');
        } else if (session_id) {
            console.log('🔄 Buscando carrito para sesión:', session_id);
            carrito = await Carrito.findOne({
                sessionId: session_id,
                activo: true
            }).populate('items.producto');
        }

        if (!carrito || !carrito.items || carrito.items.length === 0) {
            console.error('❌ No se encontró carrito o está vacío:', { 
                carritoEncontrado: !!carrito, 
                tieneItems: carrito?.items?.length, 
                usuarioId: usuario_id, 
                sessionId: session_id 
            });
            throw new Error('No se encontró carrito o está vacío');
        }

        console.log('🛒 Carrito encontrado con', carrito.items.length, 'items');

        // 2. Verificar stock disponible
        for (const item of carrito.items) {
            const producto = await Producto.findById(item.producto._id);
            if (!producto) {
                throw new Error(`Producto ${item.producto.nombre} no encontrado`);
            }
            if (producto.stock < item.cantidad) {
                throw new Error(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}, solicitado: ${item.cantidad}`);
            }
        }

        console.log('✅ Stock verificado correctamente');

        // 3. Obtener información del usuario (si existe)
        let usuario = null;
        if (usuario_id) {
            usuario = await Usuario.findById(usuario_id);
            console.log('👤 Usuario encontrado:', usuario?.email);
        }

        // 4. Crear el pedido
        const itemsPedido = carrito.items.map(item => ({
            producto: item.producto._id,
            cantidad: item.cantidad,
            precioUnitario: item.producto.precioVenta,
            subtotal: item.cantidad * item.producto.precioVenta
        }));

        const subtotal = itemsPedido.reduce((sum, item) => sum + item.subtotal, 0);

        // Verificar si el usuario tiene una dirección completa
        const direccionCompleta = usuario?.direccion && 
            usuario.direccion.calle && 
            usuario.direccion.numero && 
            usuario.direccion.ciudad && 
            usuario.direccion.provincia && 
            usuario.direccion.codigoPostal;

        const nuevoPedido = new Pedido({
            usuario: usuario ? usuario._id : null,

            // Información de regalo desde el carrito
            esRegalo: carrito.esRegalo || false,
            ...(carrito.esRegalo && carrito.destinatarioRegalo && {
                destinatarioRegalo: {
                    nombre: carrito.destinatarioRegalo.nombre || '',
                    apellido: carrito.destinatarioRegalo.apellido || '',
                    dedicatoria: carrito.destinatarioRegalo.dedicatoria || ''
                }
            }),

            // Datos de contacto - usar datos válidos o placeholders que cumplan validaciones
            datosContacto: {
                nombre: usuario?.nombre || 'Usuario Invitado',
                apellido: usuario?.apellido || 'MercadoPago',
                email: payer_email || usuario?.email || 'no-disponible@example.com',
                telefono: usuario?.telefono || '1234567890' // Placeholder válido para completar después
            },

            // Items del pedido
            items: itemsPedido,

            // Dirección - usar dirección completa del usuario o placeholders válidos
            direccionEnvio: direccionCompleta ? usuario.direccion : {
                calle: 'A confirmar por el cliente',
                numero: '1',
                ciudad: 'Buenos Aires',
                provincia: 'Buenos Aires', 
                codigoPostal: '1000',
                pais: 'Argentina',
                referencias: 'Dirección a confirmar - Pedido creado automáticamente desde pago'
            },

            // Totales
            subtotal: subtotal,
            costoEnvio: 0,
            descuentos: 0,
            total: subtotal,

            // Estado inicial
            estado: 'confirmado', // Ya está pagado

            // Método de pago
            metodoPago: {
                tipo: 'mercadopago',
                estado: 'pagado',
                transaccionId: payment_id
            },

            // Tipo de envío por defecto
            envio: {
                tipo: 'retiro_local'
            },

            // Notas internas
            notas: {
                admin: 'Pedido creado automáticamente desde webhook de MercadoPago. Requiere confirmación de datos de contacto y envío por parte del cliente.',
                cliente: 'Su pedido ha sido confirmado. Por favor, complete sus datos de contacto y envío en su perfil.'
            },

            // Información de MercadoPago
            mercadoPago: {
                paymentId: payment_id,
                externalReference: external_reference,
                paymentStatus: 'approved',
                paymentMethod: payment_method_id,
                paymentType: payment_type_id,
                transactionAmount: transaction_amount,
                dateApproved: new Date(),
                dateCreated: new Date()
            }
        });

        console.log('💾 Intentando guardar pedido con datos completos:', JSON.stringify({
            usuario: nuevoPedido.usuario,
            datosContacto: nuevoPedido.datosContacto,
            direccionEnvio: nuevoPedido.direccionEnvio,
            items: nuevoPedido.items,
            subtotal: nuevoPedido.subtotal,
            total: nuevoPedido.total,
            estado: nuevoPedido.estado,
            metodoPago: nuevoPedido.metodoPago,
            envio: nuevoPedido.envio
        }, null, 2));

        console.log('🔄 Ejecutando nuevoPedido.save()...');
        let pedidoGuardado;
        try {
            pedidoGuardado = await nuevoPedido.save();
            console.log('✅ Pedido creado exitosamente con ID:', pedidoGuardado._id);
            console.log('📋 Número de pedido generado:', pedidoGuardado.numeroPedido);
        } catch (saveError) {
            console.error('❌ Error específico al guardar pedido:', saveError);
            if (saveError.name === 'ValidationError') {
                console.error('📋 Errores de validación del pedido:');
                Object.keys(saveError.errors).forEach(key => {
                    console.error(`  - ${key}: ${saveError.errors[key].message}`);
                    console.error(`    Valor recibido:`, saveError.errors[key].value);
                });
            }
            throw saveError; // Re-lanzar el error para que sea manejado por el catch principal
        }

        // 5. Actualizar stock de productos
        console.log('📦 Iniciando actualización de stock...');
        for (const item of carrito.items) {
            const producto = await Producto.findById(item.producto._id);
            const stockAnterior = producto.stock;
            producto.stock -= item.cantidad;
            await producto.save();
            console.log(`📦 Stock actualizado para ${producto.nombre}: ${stockAnterior} -> ${producto.stock}`);
        }
        console.log('✅ Stock actualizado completamente');

        // 5b. Enviar correo de confirmación al comprador
        const emailDestino = emailFromRef || payer_email || usuario?.email;
        const nombreDestino = nombreFromRef || usuario?.nombre || 'Cliente';
        if (emailDestino) {
            try {
                const itemsParaEmail = carrito.items.map(item => ({
                    nombre: item.producto?.nombre || 'Producto',
                    cantidad: item.cantidad,
                    precioUnitario: item.producto?.precioVenta || 0,
                    subtotal: item.cantidad * (item.producto?.precioVenta || 0)
                }));
                await emailService.sendOrderConfirmationEmail(
                    emailDestino,
                    nombreDestino,
                    {
                        numeroPedido: pedidoGuardado.numeroPedido,
                        items: itemsParaEmail,
                        subtotal: pedidoGuardado.subtotal,
                        costoEnvio: pedidoGuardado.costoEnvio || 0,
                        total: pedidoGuardado.total,
                        esRegalo: pedidoGuardado.esRegalo,
                        destinatarioRegalo: pedidoGuardado.destinatarioRegalo
                    }
                );
                console.log('📧 Correo de confirmación enviado a:', emailDestino);
            } catch (emailError) {
                console.error('⚠️ Error enviando correo de confirmación (no crítico):', emailError.message);
            }
        } else {
            console.log('⚠️ No se encontró email del comprador, omitiendo correo de confirmación');
        }

        // 6. Vaciar el carrito
        console.log('🛒 Vaciando carrito...');
        carrito.items = [];
        carrito.activo = false; // Desactivar el carrito
        await carrito.save();
        console.log('🛒 Carrito vaciado exitosamente');

        // 7. Si hay usuario, crear un nuevo carrito activo
        if (usuario_id) {
            console.log('🆕 Creando nuevo carrito para usuario...');
            const nuevoCarrito = new Carrito({
                usuario: usuario_id,
                items: [],
                activo: true
            });
            await nuevoCarrito.save();
            console.log('🆕 Nuevo carrito creado para el usuario');
        }

        console.log('🎉 === PAGO PROCESADO EXITOSAMENTE ===');
        console.log('📋 Pedido ID:', pedidoGuardado._id);
        console.log('🔢 Número de pedido:', pedidoGuardado.numeroPedido);

        return {
            success: true,
            pedidoId: pedidoGuardado._id,
            numeroPedido: pedidoGuardado.numeroPedido,
            mensaje: 'Pago procesado exitosamente'
        };

    } catch (error) {
        console.error('❌ Error al procesar pago exitoso:', error);
        
        // Log detalles específicos de errores de validación
        if (error.name === 'ValidationError') {
            console.error('📋 Errores de validación detallados:');
            Object.keys(error.errors).forEach(key => {
                console.error(`  - ${key}: ${error.errors[key].message}`);
            });
        }
        
        throw error;
    }
};

module.exports = {
    crearPreferencia,
    procesarResultado,
    procesarPagoExitoso,
    guardarPago,
    webhook,
    verificarEstado,
    test
};