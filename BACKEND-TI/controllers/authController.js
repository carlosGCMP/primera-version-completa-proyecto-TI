const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

async function register(req, res) {
  const { name, email, password } = req.body;

  try {
    const existing = await userModel.getUserByEmail(email);
    if (existing) return res.status(400).json({ message: 'El correo ya está registrado.' });

    const hashed = await bcrypt.hash(password, 10);
    const userId = await userModel.createUser(name, email, hashed);

    res.status(201).json({ message: 'Usuario registrado', userId });
  } catch (error) {
    res.status(500).json({ error: 'Error interno al registrar' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await userModel.getUserByEmail(email);
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error interno al iniciar sesión' });
  }
}

module.exports = { register, login };
