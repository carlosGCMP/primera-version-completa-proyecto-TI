// models/statsModel.js
const db = require('../db');

async function getStatsByUserAndDate(userId, date) {
  const [rows] = await db.query(
    'SELECT * FROM stats WHERE user_id = ? AND date = ?',
    [userId, date]
  );
  return rows[0];
}

async function updateStats(userId, date, mode, minutes) {
  let stats = await getStatsByUserAndDate(userId, date);

  if (!stats) {
    await db.query(
      'INSERT INTO stats (user_id, date, pomodoros, short_breaks, long_breaks, total_minutes) VALUES (?, ?, 0, 0, 0, 0)',
      [userId, date]
    );
  }

  const fieldMap = {
    pomodoro: 'pomodoros',
    short: 'short_breaks',
    long: 'long_breaks'
  };

  await db.query(
    `UPDATE stats SET ${fieldMap[mode]} = ${fieldMap[mode]} + 1, total_minutes = total_minutes + ? WHERE user_id = ? AND date = ?`,
    [minutes, userId, date]
  );
}

async function getMonthlyStats(userId, month) {
  const [rows] = await db.query(
    'SELECT date, pomodoros FROM stats WHERE user_id = ? AND DATE_FORMAT(date, "%Y-%m") = ? ORDER BY date',
    [userId, month]
  );
  return rows;
}

module.exports = { updateStats, getMonthlyStats };
