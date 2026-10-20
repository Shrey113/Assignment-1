import { getPool } from '../config/db.js';
import { GUJARAT_DISTRICTS_34, resolveDistrict } from '../constants/districts.js';

/**
 * Register a donor into the database.
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

    console.log('[Server Log: Donor] Received request to add donor:');
    console.log({ name, email, phone, age, weight, city, bloodGroup, lastDonatedDate, isFirstTime });

    const pool = getPool();

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

/**
 * Fetch aggregated donor statistics for all 34 Gujarat districts.
 * Handled by: GET /api/donors/districts
 */
export async function getDistrictStats(req, res, next) {
  try {
    const pool = getPool();

    // Fetch donor summary records for district aggregation
    const [rows] = await pool.query(`
      SELECT 
        city,
        blood_group,
        is_active,
        is_first_time,
        phone
      FROM donors
    `);

    // Initialize 34 districts structure
    const districtStats = {};
    for (const d of GUJARAT_DISTRICTS_34) {
      districtStats[d] = {
        district: d,
        totalDonors: 0,
        availableDonors: 0,
        verifiedDonors: 0,
        firstTimeDonors: 0,
        bloodGroups: {
          'O+': 0, 'O-': 0,
          'A+': 0, 'A-': 0,
          'B+': 0, 'B-': 0,
          'AB+': 0, 'AB-': 0
        }
      };
    }

    let overallTotal = 0;
    let overallAvailable = 0;

    for (const row of rows) {
      const district = resolveDistrict(row.city);
      if (!districtStats[district]) {
        districtStats[district] = {
          district,
          totalDonors: 0,
          availableDonors: 0,
          verifiedDonors: 0,
          firstTimeDonors: 0,
          bloodGroups: {
            'O+': 0, 'O-': 0,
            'A+': 0, 'A-': 0,
            'B+': 0, 'B-': 0,
            'AB+': 0, 'AB-': 0
          }
        };
      }

      const d = districtStats[district];
      d.totalDonors += 1;
      overallTotal += 1;

      const isActive = row.is_active === 1 || row.is_active === true;
      if (isActive) {
        d.availableDonors += 1;
        overallAvailable += 1;
      }

      if (row.phone) {
        d.verifiedDonors += 1;
      }

      if (row.is_first_time === 1 || row.is_first_time === true) {
        d.firstTimeDonors += 1;
      }

      if (row.blood_group && d.bloodGroups[row.blood_group] !== undefined) {
        d.bloodGroups[row.blood_group] += 1;
      }
    }

    return res.json({
      success: true,
      totalDonors: overallTotal,
      availableDonors: overallAvailable,
      districtsCount: GUJARAT_DISTRICTS_34.length,
      districts: districtStats
    });
  } catch (error) {
    console.error('[Server Log: getDistrictStats Error]', error.message);
    next(error);
  }
}
