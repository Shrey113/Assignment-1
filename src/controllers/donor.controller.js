import { getPool } from '../config/db.js';

/**
 * Simple controller to add a donor to the database.
 * Handled by: POST /api/donors
 */
export async function registerDonor(req, res, next) {
  try {
    const {
      name,
      email,
      phone,
      age,
      weight,
      city,
      bloodGroup,
      lastDonatedDate,
      isFirstTime
    } = req.body;

    // Spying on the server side - log incoming request
    console.log('[Server Log: Donor] Received request to add donor:');
    console.log({ name, email, phone, age, weight, city, bloodGroup, lastDonatedDate, isFirstTime });

    const pool = getPool();

    // Simple, direct INSERT query
    const query = `
      INSERT INTO donors (
        name, email, phone, age, weight, city, blood_group, last_donated_date, is_first_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
      name || 'Anonymous',
      email || null,
      phone || null,
      Number(age) || null,
      Number(weight) || null,
      city || null,
      bloodGroup || null,
      isFirstTime ? null : (lastDonatedDate || null),
      isFirstTime ? 1 : 0
    ];

    const [result] = await pool.query(query, values);

    console.log(`[Server Log: Donor] Successfully saved donor with ID: ${result.insertId}`);

    return res.status(201).json({
      success: true,
      message: 'Donor added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('[Server Log: Donor Error]', error.message);
    next(error);
  }
}
