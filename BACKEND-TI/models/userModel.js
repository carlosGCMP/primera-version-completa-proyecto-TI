// models/userModel.js
const db = require('../db');

async function createUser(name, email, passwordHash) {
  const [result] = await db.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, passwordHash]
  );
  return result.insertId;
}

async function getUserByEmail(email) {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

module.exports = { createUser, getUserByEmail };
