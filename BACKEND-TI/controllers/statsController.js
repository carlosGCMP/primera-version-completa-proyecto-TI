const statsModel = require('../models/statsModel');

async function saveStats(req, res) {
  const { mode, minutes } = req.body;
  const userId = req.userId;
  const date = new Date().toISOString().split('T')[0];

  try {
    await statsModel.updateStats(userId, date, mode, minutes);
    res.json({ message: 'Estadística guardada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar estadísticas' });
  }
}

async function getMonthlyStats(req, res) {
  const userId = req.userId;
  const { month } = req.query;

  try {
    const stats = await statsModel.getMonthlyStats(userId, month);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}

module.exports = { saveStats, getMonthlyStats };
