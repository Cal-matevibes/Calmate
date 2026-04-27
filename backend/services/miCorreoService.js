const axios = require('axios');

class MiCorreoService {
  constructor() {
    this.baseUrl = process.env.MICORREO_BASE_URL;
    this.user = process.env.MICORREO_USER;
    this.password = process.env.MICORREO_PASSWORD;
    this.customerId = process.env.MICORREO_CUSTOMER_ID;
    this.token = null;
    this.tokenExpiry = null;
  }

  /**
   * Obtiene un token JWT para autenticación
   * @returns {Promise<string>} Token JWT
   */
  async getToken() {
    try {
      // Si ya tenemos un token válido, lo reutilizamos
      if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.token;
      }

      console.log('🔑 Obteniendo nuevo token de MiCorreo...');
      
      const response = await axios.post(
        `${this.baseUrl}/token`,
        {},
        {
          auth: {
            username: this.user,
            password: this.password
          }
        }
      );

      this.token = response.data.token;
      this.tokenExpiry = new Date(response.data.expires);
      
      console.log('✅ Token obtenido exitosamente, expira:', response.data.expires);
      
      return this.token;
    } catch (error) {
      console.error('❌ Error al obtener token de MiCorreo:', error.response?.data || error.message);
      throw new Error('Error al autenticar con MiCorreo');
    }
  }

  /**
   * Obtiene headers con autenticación para las peticiones
   * @returns {Promise<Object>} Headers con Bearer token
   */
  async getHeaders() {
    const token = await this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Cotiza un envío
   * @param {Object} params - Parámetros de cotización
   * @param {string} params.postalCodeOrigin - Código postal de origen
   * @param {string} params.postalCodeDestination - Código postal de destino
   * @param {string} [params.deliveredType] - "D" para domicilio, "S" para sucursal, omitir para ambos
   * @param {Object} params.dimensions - Dimensiones del paquete
   * @param {number} params.dimensions.weight - Peso en gramos (1-25000)
   * @param {number} params.dimensions.height - Alto en cm (max 150)
   * @param {number} params.dimensions.width - Ancho en cm (max 150)
   * @param {number} params.dimensions.length - Largo en cm (max 150)
   * @returns {Promise<Object>} Cotización con precios y tiempos de entrega
   */
  async getRates({
    postalCodeOrigin,
    postalCodeDestination,
    deliveredType,
    dimensions
  }) {
    try {
      const headers = await this.getHeaders();
      
      const body = {
        customerId: this.customerId,
        postalCodeOrigin,
        postalCodeDestination,
        dimensions: {
          weight: parseInt(dimensions.weight),
          height: parseInt(dimensions.height),
          width: parseInt(dimensions.width),
          length: parseInt(dimensions.length)
        }
      };

      // Solo agregar deliveredType si se especifica
      if (deliveredType) {
        body.deliveredType = deliveredType;
      }

      console.log('📦 Cotizando envío:', body);

      const response = await axios.post(
        `${this.baseUrl}/rates`,
        body,
        { headers }
      );

      console.log('✅ Cotización obtenida:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error al cotizar envío:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Importa un envío a MiCorreo
   * @param {Object} orderData - Datos del pedido
   * @param {string} orderData.extOrderId - ID externo de la orden
   * @param {string} orderData.orderNumber - Número de orden para mostrar
   * @param {Object} orderData.recipient - Información del destinatario
   * @param {Object} orderData.shipping - Información del envío
   * @returns {Promise<Object>} Información de la orden importada
   */
  async importShipping(orderData) {
    try {
      const headers = await this.getHeaders();

      const body = {
        customerId: this.customerId,
        extOrderId: orderData.extOrderId,
        orderNumber: orderData.orderNumber,
        sender: {
          name: null,
          phone: null,
          cellPhone: null,
          email: null,
          originAddress: {
            streetName: null,
            streetNumber: null,
            floor: null,
            apartment: null,
            city: null,
            provinceCode: null,
            postalCode: null
          }
        },
        recipient: {
          name: orderData.recipient.name,
          phone: orderData.recipient.phone || '',
          cellPhone: orderData.recipient.cellPhone || '',
          email: orderData.recipient.email
        },
        shipping: {
          deliveryType: orderData.shipping.deliveryType, // "D" o "S"
          productType: 'CP', // Correo Argentino Clásico
          agency: orderData.shipping.agency || null,
          address: {
            streetName: orderData.shipping.address.streetName,
            streetNumber: orderData.shipping.address.streetNumber,
            floor: orderData.shipping.address.floor || '',
            apartment: orderData.shipping.address.apartment || '',
            city: orderData.shipping.address.city,
            provinceCode: orderData.shipping.address.provinceCode,
            postalCode: orderData.shipping.address.postalCode
          },
          weight: parseInt(orderData.shipping.weight),
          declaredValue: parseFloat(orderData.shipping.declaredValue),
          height: parseInt(orderData.shipping.height),
          length: parseInt(orderData.shipping.length),
          width: parseInt(orderData.shipping.width)
        }
      };

      console.log('📮 Importando envío a MiCorreo:', {
        extOrderId: body.extOrderId,
        orderNumber: body.orderNumber,
        deliveryType: body.shipping.deliveryType
      });

      const response = await axios.post(
        `${this.baseUrl}/shipping/import`,
        body,
        { headers }
      );

      console.log('✅ Envío importado exitosamente:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error al importar envío:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtiene el tracking de un envío
   * @param {string} shippingId - ID del envío en MiCorreo
   * @returns {Promise<Object>} Información de seguimiento
   */
  async getTracking(shippingId) {
    try {
      const headers = await this.getHeaders();

      console.log('🔍 Consultando tracking:', shippingId);

      const response = await axios.get(
        `${this.baseUrl}/shipping/tracking`,
        {
          headers,
          data: { shippingId }
        }
      );

      console.log('✅ Tracking obtenido:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener tracking:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Valida que las credenciales estén configuradas
   * @returns {boolean} True si las credenciales están configuradas
   */
  isConfigured() {
    return !!(this.baseUrl && this.user && this.password && this.customerId);
  }
}

// Exportar una instancia única del servicio
module.exports = new MiCorreoService();
