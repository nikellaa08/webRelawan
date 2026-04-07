// controllers/categoryController.js

import { getAllCategories } from '../db.js';

/**
 * Mendapatkan semua kategori.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export async function getCategories(req, res) {
  try {
    const categories = await getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error saat mengambil kategori:', error.message);
    res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil kategori.', error: error.message });
  }
}
