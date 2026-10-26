# Calmate
Esta carpeta almacena todo el codigo del backend y frontend de la pagina de Calmate

## Correos transaccionales

El backend envía confirmaciones de compra, cambios de estado y restablecimientos
de contraseña mediante la API de Postmark. Para habilitar los envíos:

1. Crea una cuenta de Postmark y verifica el dominio remitente; configura los
   registros SPF y DKIM que indica Postmark.
2. Copia `backend/.env.example` a tu archivo `.env` local y configura
   `POSTMARK_SERVER_TOKEN` y `EMAIL_FROM` con credenciales y una dirección
   verificadas en Postmark.
3. Configura esas mismas variables como secretos/variables de entorno del
   servicio que despliega el backend. No agregues el token al frontend ni al
   repositorio.

La integración usa el plan gratuito de Postmark (hasta 100 correos al mes) y
requiere Node.js 18 o superior en el backend.
