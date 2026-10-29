# Calmate
Esta carpeta almacena todo el codigo del backend y frontend de la pagina de Calmate

## Correos transaccionales con Gmail

El backend envía confirmaciones de compra, cambios de estado y restablecimientos
de contraseña mediante Gmail API. Para configurarlo:

1. En Google Cloud habilita Gmail API y configura la pantalla OAuth como
   aplicación externa. Agrega `calmate834@gmail.com` como usuario de prueba.
2. Crea un cliente OAuth de tipo **Web application** y registra exactamente
   `https://cal-mate.onrender.com/api/email/google/callback` como URI de
   redirección autorizada. Agrega el único scope
   `https://www.googleapis.com/auth/gmail.send`.
3. Configura en el entorno del backend `GOOGLE_OAUTH_CLIENT_ID`,
   `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`,
   `GMAIL_SENDER_EMAIL`, `GOOGLE_OAUTH_SETUP_KEY` y
   `GMAIL_TOKEN_ENCRYPTION_KEY`. Genera las dos últimas claves aleatorias; la
   clave de cifrado debe ser de 32 bytes representados como 64 caracteres
   hexadecimales. No las guardes en el repositorio ni en el frontend.
4. Despliega el backend. Solicita una URL OAuth con un POST a
   `/api/email/google/authorize`, incluyendo la clave de configuración en el
   header `x-email-setup-key`. Abre la `authorizationUrl` devuelta e inicia
   sesión con `calmate834@gmail.com` para autorizar el envío.
5. El backend guarda el refresh token cifrado en MongoDB. Las credenciales y el
   refresh token deben mantenerse secretos.

La app OAuth en estado **Testing** puede dejar de funcionar después de siete
días. Para correo continuo, revisa los requisitos de verificación de Google
para el scope sensible `gmail.send` y publica la app en producción. Requiere
Node.js 18 o superior.
