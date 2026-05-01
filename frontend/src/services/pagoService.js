// Función para crear preferencia de pago
export const crearPreferenciaPago = async (orderData, usuario = null) => {
  try {

    // Validaciones básicas
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('No hay productos en el carrito');
    }

    // Asegurar que tengamos información del pagador
    const payer = {
      name: orderData.payer?.name || usuario?.nombre || 'Cliente',
      surname: orderData.payer?.surname || usuario?.apellido || 'Test',
      email: orderData.payer?.email || usuario?.email || 'test@calmatevibes.com'
    };

    if (!payer.email || payer.email === '') {
      throw new Error('Se requiere un email válido del cliente');
    }

    // Obtener información del usuario o sesión
    let usuario_id = null;
    let session_id = null;

    if (usuario && usuario.id) {
      usuario_id = usuario.id;
    } else {
      // Para usuarios invitados, usar sessionId
      session_id = localStorage.getItem('sessionId');
      if (!session_id) {
        session_id = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sessionId', session_id);
      }
    }

    // Estructura que espera el backend de MercadoPago
    const requestData = {
      items: orderData.items.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || 'Producto de CalmateVibes',
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'ARS'
      })),
      payer: payer,
      total: orderData.total,
      external_reference: orderData.external_reference || `CV_${Date.now()}`,
      usuario_id: usuario_id,
      session_id: session_id
      // Las back_urls y auto_return se configuran en el backend
    };


    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/pagos/crear-preferencia`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      throw new Error(errorData.message || `Error ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'El servidor respondió con error');
    }

    if (!data.preferenceId) {
      throw new Error('El servidor no devolvió un preferenceId válido');
    }

    return data;

  } catch (error) {
    throw new Error(`Error al crear preferencia: ${error.message}`);
  }
};

export const formatearDatosOrden = (carrito, customer = {}, shipping = {}) => {
  try {
    // Formatear items del carrito
    const items = carrito.items ? carrito.items.map(item => ({
      id: item._id || item.id,
      title: item.nombre || item.title,
      description: item.descripcion || item.description,
      quantity: item.cantidad || 1,
      unit_price: parseFloat(item.precioUnitario || item.precioVenta || item.precio || 0),
      currency_id: 'ARS'
    })) : [];

    // Calcular total
    const total = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

    // Validar que tengamos al menos email del cliente
    if (!customer.email || customer.email.trim() === '') {
      throw new Error('Se requiere un email válido para procesar el pago');
    }

    // Formatear datos del cliente con validaciones
    const payer = {
      name: customer.nombre?.trim(),
      surname: customer.apellido?.trim(), 
      email: customer.email?.trim(),
      phone: customer.telefono && customer.telefono.trim() ? {
        area_code: customer.codigoArea,
        number: customer.telefono.trim()
      } : undefined,
      address: shipping.direccion && shipping.direccion.trim() ? {
        street_name: shipping.direccion.trim(),
        street_number: parseInt(shipping.numero),
        zip_code: shipping.codigoPostal?.trim() 
      } : undefined
    };


    const orderData = {
      items,
      total,
      payer,
      external_reference: `CV_${Date.now()}`
      // Las URLs de retorno se configuran en el backend
    };
    
    return orderData;

  } catch (error) {
    throw new Error(`Error al formatear datos: ${error.message}`);
  }
};

// Función para procesar resultado del pago (procesamiento local)
export const procesarResultadoPago = (params) => {
  try {
    const { status, payment_id, external_reference, payment_type, merchant_order_id } = params;


    // Mapear estados de MercadoPago
    let estado, mensaje, esExitoso;

    switch (status) {
      case 'approved':
        estado = 'exitoso';
        mensaje = '¡Pago aprobado exitosamente!';
        esExitoso = true;
        break;
      case 'pending':
        estado = 'pendiente';
        mensaje = 'Tu pago está siendo procesado';
        esExitoso = false;
        break;
      case 'rejected':
        estado = 'rechazado';
        mensaje = 'El pago fue rechazado';
        esExitoso = false;
        break;
      case 'cancelled':
        estado = 'cancelado';
        mensaje = 'El pago fue cancelado';
        esExitoso = false;
        break;
      default:
        estado = 'desconocido';
        mensaje = 'Estado de pago desconocido';
        esExitoso = false;
    }

    return {
      estado,
      mensaje,
      esExitoso,
      detalles: {
        paymentId: payment_id,
        externalReference: external_reference,
        paymentType: payment_type,
        merchantOrderId: merchant_order_id,
        status
      }
    };

  } catch (error) {
    return {
      estado: 'error',
      mensaje: 'Error al procesar el resultado del pago',
      esExitoso: false,
      detalles: null
    };
  }
};

// Función para enviar resultado del pago al backend para procesamiento
export const procesarPagoEnBackend = async (searchParams) => {
  try {

    // Convertir searchParams a objeto
    const params = {};
    for (let [key, value] of searchParams) {
      params[key] = value;
    }


    // Crear URL con query parameters
    const queryString = new URLSearchParams(params).toString();
    const url = `${process.env.REACT_APP_API_URL}/api/pagos/procesar-resultado?${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    throw error;
  }
};

// Función para verificar estado del pago en el backend
export const verificarEstadoPago = async (externalReference, paymentId = null) => {
  try {

    // Si tenemos paymentId, usar la ruta completa
    let url;
    if (paymentId) {
      url = `${process.env.REACT_APP_API_URL}/api/pagos/verificar/${paymentId}/${externalReference}`;
    } else {
      // Usar solo external_reference como ambos parámetros por ahora
      url = `${process.env.REACT_APP_API_URL}/api/pagos/verificar/none/${externalReference}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return null; // No es crítico si falla
    }

    const data = await response.json();
    return data;

  } catch (error) {
    return null; // No es crítico si falla
  }
};

// Test de conectividad
export const testConexion = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/pagos/test`);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};