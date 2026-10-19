import { getPool } from '../config/db.js';

const VALID_BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const VALID_URGENCY_LEVELS = ['CRITICAL', 'URGENT', 'SCHEDULED'];

// Red cell compatibility lookup (Recipient -> Compatible Donors)
const COMPATIBILITY_MAP = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

/**
 * Create a new blood requisition (Emergency or Scheduled).
 * POST /api/v1/requests
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

    // Validation
    if (!patientName?.trim()) {
      return res.status(400).json({ success: false, message: 'Patient full name is required.' });
    }
    if (!hospital?.trim()) {
      return res.status(400).json({ success: false, message: 'Hospital and ward details are required.' });
    }
    const cleanBloodGroup = bloodGroup?.trim().toUpperCase();
    if (!VALID_BLOOD_GROUPS.includes(cleanBloodGroup)) {
      return res.status(400).json({
        success: false,
        message: `Invalid blood group. Allowed: ${VALID_BLOOD_GROUPS.join(', ')}`
      });
    }
    const numUnits = Number(units) || 1;
    if (numUnits < 1 || numUnits > 50) {
      return res.status(400).json({ success: false, message: 'Units needed must be at least 1.' });
    }

    let finalUrgency = urgency ? urgency.trim().toUpperCase() : null;
    if (finalUrgency && !VALID_URGENCY_LEVELS.includes(finalUrgency)) {
      finalUrgency = 'SCHEDULED';
    }

    const pool = getPool();

    const insertSQL = `
      INSERT INTO requests (
        patient_name, hospital, city, blood_group, units, urgency, required_date, is_immediate, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING');
    `;
    const params = [
      patientName.trim(),
      hospital.trim(),
      city?.trim() || 'General Depot',
      cleanBloodGroup,
      numUnits,
      finalUrgency,
      isImmediate ? null : (requiredDate || null),
      Boolean(isImmediate)
    ];

    const [result] = await pool.query(insertSQL, params);

    // Find compatible donors in matching or general region
    const compatibleGroups = COMPATIBILITY_MAP[cleanBloodGroup] || [cleanBloodGroup];
    const placeholders = compatibleGroups.map(() => '?').join(', ');
    const [matchingDonors] = await pool.query(
      `SELECT id, name, phone, city, blood_group FROM donors WHERE is_active = TRUE AND blood_group IN (${placeholders});`,
      compatibleGroups
    );

    const [newRequest] = await pool.query(
      'SELECT id, patient_name, hospital, city, blood_group, units, urgency, required_date, is_immediate, status, created_at FROM requests WHERE id = ?;',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Blood requisition broadcasted successfully.',
      data: newRequest[0],
      compatibility: {
        safeBloodGroups: compatibleGroups,
        availableMatchingDonorsCount: matchingDonors.length,
        potentialDonors: matchingDonors.slice(0, 5) // Return up to 5 immediate donor matches
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all blood requests with optional filtering.
 * GET /api/v1/requests
 */
export async function getRequests(req, res, next) {
  try {
    const { bloodGroup, urgency, status, city } = req.query;
    const pool = getPool();

    let query = 'SELECT id, patient_name, hospital, city, blood_group, units, urgency, required_date, is_immediate, status, created_at FROM requests WHERE 1=1';
    const params = [];

    if (bloodGroup) {
      query += ' AND blood_group = ?';
      params.push(bloodGroup.trim().toUpperCase());
    }
    if (urgency) {
      query += ' AND urgency = ?';
      params.push(urgency.trim().toUpperCase());
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status.trim().toUpperCase());
    }
    if (city) {
      query += ' AND city LIKE ?';
      params.push(`%${city.trim()}%`);
    }

    // Sort: Critical first, then Urgent, then Scheduled, then by creation date
    query += `
      ORDER BY 
        CASE urgency
          WHEN 'CRITICAL' THEN 1
          WHEN 'URGENT' THEN 2
          WHEN 'SCHEDULED' THEN 3
          ELSE 4
        END,
        created_at DESC;
    `;

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
 * Get a single blood request by ID.
 * GET /api/v1/requests/:id
 */
export async function getRequestById(req, res, next) {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [rows] = await pool.query(
      'SELECT id, patient_name, hospital, city, blood_group, units, urgency, required_date, is_immediate, status, created_at FROM requests WHERE id = ?;',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Blood requisition not found.' });
    }

    const request = rows[0];
    const compatibleGroups = COMPATIBILITY_MAP[request.blood_group] || [request.blood_group];
    const placeholders = compatibleGroups.map(() => '?').join(', ');
    const [matchingDonors] = await pool.query(
      `SELECT id, name, phone, city, blood_group FROM donors WHERE is_active = TRUE AND blood_group IN (${placeholders});`,
      compatibleGroups
    );

    return res.status(200).json({
      success: true,
      data: request,
      compatibility: {
        safeBloodGroups: compatibleGroups,
        availableMatchingDonorsCount: matchingDonors.length,
        potentialDonors: matchingDonors
      }
    });
  } catch (error) {
    next(error);
  }
}
