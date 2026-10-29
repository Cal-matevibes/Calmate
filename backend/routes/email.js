const express = require('express');
const emailService = require('../services/emailService');

const router = express.Router();

router.post('/google/authorize', (req, res) => {
  try {
    const authorizationUrl = emailService.createAuthorizationUrl(req.get('x-email-setup-key'));
    res.set('Cache-Control', 'no-store');
    res.json({ authorizationUrl });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) console.error('Error iniciando OAuth de Gmail:', error.message);
    res.status(statusCode).json({
      success: false,
      message: statusCode === 401 ? error.message : 'No se pudo iniciar la autorización de Gmail'
    });
  }
});

router.get('/google/callback', async (req, res) => {
  res.set({
    'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
    'X-Content-Type-Options': 'nosniff'
  });

  if (req.query.error) {
    return res.status(400).send('Autorización de Gmail cancelada o rechazada. Puedes cerrar esta ventana.');
  }
  if (typeof req.query.code !== 'string' || typeof req.query.state !== 'string') {
    return res.status(400).send('Faltan datos de autorización. Puedes cerrar esta ventana.');
  }

  try {
    await emailService.handleOAuthCallback(req.query.code, req.query.state);
    res.send('Gmail quedó autorizado para Calmate. Ya puedes cerrar esta ventana.');
  } catch (error) {
    console.error('Error completando OAuth de Gmail:', error.message);
    res.status(400).send('No se pudo completar la autorización de Gmail. Revisa los logs del backend y vuelve a intentarlo.');
  }
});

module.exports = router;
