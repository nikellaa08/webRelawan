// controllers/eventController.js

const { getAllEvents } = require('../db');

/**
 * Mendapatkan semua event.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
async function getEvents(req, res) {
  try {
    const events = await getAllEvents();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error saat mengambil event:', error.message);
    res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil event.', error: error.message });
  }
}

module.exports = {
  getEvents
};
