import { getPool } from '../config/db.js';

const VALID_BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

/**
 * Register a new voluntary blood donor.
 * POST /api/v1/donors
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

    // Validation
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }
    if (!email?.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }
    if (!phone?.trim()) {
      return res.status(400).json({ success: false, message: 'Contact phone number is required.' });
    }
    const numAge = Number(age);
    if (!numAge || numAge < 18 || numAge > 65) {
      return res.status(400).json({ success: false, message: 'Donor age must be between 18 and 65.' });
    }
    const numWeight = Number(weight);
    if (!numWeight || numWeight < 45) {
      return res.status(400).json({ success: false, message: 'Donor weight must be at least 45 kg.' });
    }
    if (!VALID_BLOOD_GROUPS.includes(bloodGroup?.trim().toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid blood group. Allowed: ${VALID_BLOOD_GROUPS.join(', ')}`
      });
    }

    const pool = getPool();

    // Check if email already exists
    const [existing] = await pool.query(
      'SELECT id FROM donors WHERE email = ? LIMIT 1;',
      [email.trim().toLowerCase()]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A donor with this email address is already registered.'
      });
    }

    // Insert record
    const insertSQL = `
      INSERT INTO donors (
        name, email, phone, age, weight, city, blood_group, last_donated_date, is_first_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const params = [
      name.trim(),
      email.trim().toLowerCase(),
      phone.trim(),
      numAge,
      numWeight,
      city?.trim() || 'General Region',
      bloodGroup.trim().toUpperCase(),
      isFirstTime ? null : (lastDonatedDate || null),
      Boolean(isFirstTime)
    ];

    const [result] = await pool.query(insertSQL, params);

    const [newDonor] = await pool.query(
      'SELECT id, name, email, phone, age, weight, city, blood_group, last_donated_date, is_first_time, created_at FROM donors WHERE id = ?;',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Voluntary blood donor registered successfully.',
      data: newDonor[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all donors with optional filtering.
 * GET /api/v1/donors
 */
export async function getDonors(req, res, next) {
  try {
    const { bloodGroup, city, active } = req.query;
    const pool = getPool();

    let query = 'SELECT id, name, email, phone, age, weight, city, blood_group, last_donated_date, is_first_time, is_active, created_at FROM donors WHERE 1=1';
    const params = [];

    if (bloodGroup) {
      query += ' AND blood_group = ?';
      params.push(bloodGroup.trim().toUpperCase());
    }
    if (city) {
      query += ' AND city LIKE ?';
      params.push(`%${city.trim()}%`);
    }
    if (active !== undefined) {
      query += ' AND is_active = ?';
      params.push(active === 'true' || active === '1');
    }

    query += ' ORDER BY created_at DESC;';

    const [rows] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single donor by ID.
 * GET /api/v1/donors/:id
 */
export async function getDonorById(req, res, next) {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [rows] = await pool.query(
      'SELECT id, name, email, phone, age, weight, city, blood_group, last_donated_date, is_first_time, is_active, created_at FROM donors WHERE id = ?;',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Donor not found.' });
    }

    return res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
}
