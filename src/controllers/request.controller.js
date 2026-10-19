import { getPool } from '../config/db.js';

/**
 * Simple controller to add a blood request to the database.
 * Handled by: POST /api/requests
 */
export async function createRequest(req, res, next) {
  try {
    const {
      patientName,
      hospital,
      city,
      bloodGroup,
      units,
      urgency,
      requiredDate,
      isImmediate
    } = req.body;

    // Spying on the server side - log incoming request
    console.log('[Server Log: Request] Received request to add blood request:');
    console.log({ patientName, hospital, city, bloodGroup, units, urgency, requiredDate, isImmediate });

    const pool = getPool();

    // Simple, direct INSERT query
    const query = `
      INSERT INTO requests (
        patient_name, hospital, city, blood_group, units, urgency, required_date, is_immediate, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING');
    `;

    const values = [
      patientName || 'Emergency Patient',
      hospital || 'General Hospital',
      city || null,
      bloodGroup || null,
      Number(units) || 1,
      urgency || null,
      isImmediate ? null : (requiredDate || null),
      isImmediate ? 1 : 0
    ];

    const [result] = await pool.query(query, values);

    console.log(`[Server Log: Request] Successfully saved blood request with ID: ${result.insertId}`);

    return res.status(201).json({
      success: true,
      message: 'Blood request added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('[Server Log: Request Error]', error.message);
    next(error);
  }
}
