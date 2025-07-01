// routes/auth.js
const express = require('express');
const router = express.Router();

// ✅ Ruta de prueba para verificar si el servidor responde
router.get('/test', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente' });
});

// Ya debes tener estas líneas si seguiste la estructura completa
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

module.exports = router;
