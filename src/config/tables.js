import mysql from 'mysql2/promise';
import { config } from './env.js';

const ALLOWED_TABLES = ['donors', 'requests', 'blood_banks'];

/**
 * Creates raw MySQL connection for administrative DDL commands.
 */
async function getAdminConnection(includeDatabase = true) {
  return mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: includeDatabase ? config.db.database : undefined
  });
}

/**
 * Creates the database and all required tables if they don't already exist.
 */
export async function createAllTables() {
  let adminConn = null;
  try {
    // 1. Ensure Database exists
    adminConn = await getAdminConnection(false);
    await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await adminConn.end();

    // 2. Connect to the database and create tables
    adminConn = await getAdminConnection(true);

    // Donors Table
    const createDonorsTableSQL = `
      CREATE TABLE IF NOT EXISTS \`donors\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(120) NOT NULL UNIQUE,
        \`phone\` VARCHAR(20) NOT NULL,
        \`age\` INT NOT NULL,
        \`weight\` DECIMAL(5,2) NOT NULL,
        \`city\` VARCHAR(100) NOT NULL,
        \`blood_group\` VARCHAR(5) NOT NULL,
        \`last_donated_date\` DATE NULL,
        \`is_first_time\` BOOLEAN DEFAULT FALSE,
        \`is_active\` BOOLEAN DEFAULT TRUE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_donor_blood_group\` (\`blood_group\`),
        INDEX \`idx_donor_city\` (\`city\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await adminConn.query(createDonorsTableSQL);

    // Requests Table
    const createRequestsTableSQL = `
      CREATE TABLE IF NOT EXISTS \`requests\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`patient_name\` VARCHAR(100) NOT NULL,
        \`hospital\` VARCHAR(150) NOT NULL,
        \`city\` VARCHAR(100) NULL,
        \`blood_group\` VARCHAR(5) NOT NULL,
        \`units\` INT NOT NULL DEFAULT 1,
        \`urgency\` ENUM('CRITICAL', 'URGENT', 'SCHEDULED') NULL,
        \`required_date\` DATE NULL,
        \`is_immediate\` BOOLEAN DEFAULT FALSE,
        \`status\` ENUM('PENDING', 'MATCHED', 'FULFILLED', 'CANCELLED') DEFAULT 'PENDING',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_req_blood_group\` (\`blood_group\`),
        INDEX \`idx_req_urgency\` (\`urgency\`),
        INDEX \`idx_req_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await adminConn.query(createRequestsTableSQL);

    // Blood Banks Table
    const createBloodBanksTableSQL = `
      CREATE TABLE IF NOT EXISTS \`blood_banks\` (
        \`id\` VARCHAR(60) PRIMARY KEY,
        \`bank_code\` VARCHAR(20) NOT NULL,
        \`name\` VARCHAR(150) NOT NULL,
        \`city\` VARCHAR(100) NOT NULL,
        \`category\` VARCHAR(60) DEFAULT 'Charitable / Red Cross',
        \`address\` VARCHAR(255) NOT NULL,
        \`contact_phone\` VARCHAR(30) NOT NULL,
        \`emergency_phone\` VARCHAR(30) NOT NULL,
        \`operating_hours\` VARCHAR(100) DEFAULT '24/7 Emergency Service',
        \`stock_o_pos\` INT DEFAULT 0,
        \`stock_o_neg\` INT DEFAULT 0,
        \`stock_a_pos\` INT DEFAULT 0,
        \`stock_a_neg\` INT DEFAULT 0,
        \`stock_b_pos\` INT DEFAULT 0,
        \`stock_b_neg\` INT DEFAULT 0,
        \`stock_ab_pos\` INT DEFAULT 0,
        \`stock_ab_neg\` INT DEFAULT 0,
        \`total_units\` INT DEFAULT 0,
        \`is_verified\` BOOLEAN DEFAULT TRUE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`last_updated\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_bank_city\` (\`city\`),
        INDEX \`idx_bank_code\` (\`bank_code\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await adminConn.query(createBloodBanksTableSQL);

    console.log(`[Database] Database '${config.db.database}' & tables (donors, requests, blood_banks) verified/created successfully.`);
    return { success: true, database: config.db.database, tables: ['donors', 'requests', 'blood_banks'] };
  } catch (error) {
    console.error('[Database Error] Failed to create tables:', error.message);
    throw error;
  } finally {
    if (adminConn) {
      try { await adminConn.end(); } catch (_) { }
    }
  }
}

/**
 * Drops a specific table safely if it exists.
 * @param {string} tableName - 'donors' or 'requests'
 */
export async function dropTable(tableName) {
  if (!ALLOWED_TABLES.includes(tableName)) {
    throw new Error(`Invalid table name '${tableName}'. Allowed: ${ALLOWED_TABLES.join(', ')}`);
  }

  let adminConn = null;
  try {
    adminConn = await getAdminConnection(true);
    await adminConn.query(`DROP TABLE IF EXISTS \`${tableName}\`;`);
    console.log(`[Database] Table '${tableName}' dropped successfully.`);
    return { success: true, table: tableName };
  } catch (error) {
    console.error(`[Database Error] Failed to drop table '${tableName}':`, error.message);
    throw error;
  } finally {
    if (adminConn) {
      try { await adminConn.end(); } catch (_) { }
    }
  }
}

/**
 * Retrieves the current status and names of existing tables in the database.
 */
export async function getTableStatus() {
  let adminConn = null;
  try {
    adminConn = await getAdminConnection(true);
    const [rows] = await adminConn.query('SHOW TABLES;');
    const tables = rows.map((r) => Object.values(r)[0]);
    return { database: config.db.database, tables };
  } catch (error) {
    console.error('[Database Error] Failed to get table status:', error.message);
    throw error;
  } finally {
    if (adminConn) {
      try { await adminConn.end(); } catch (_) { }
    }
  }
}

// Allow direct execution from CLI: `node src/config/tables.js --init` or `node src/config/tables.js --drop donors`
if (process.argv[1]?.endsWith('tables.js')) {
  const arg = process.argv[2];
  if (arg === '--init') {
    createAllTables().then(() => process.exit(0)).catch(() => process.exit(1));
  } else if (arg === '--drop') {
    const tableToDrop = process.argv[3];
    dropTable(tableToDrop).then(() => process.exit(0)).catch(() => process.exit(1));
  } else if (arg === '--status') {
    getTableStatus().then((s) => {
      console.log('Current Database Status:', s);
      process.exit(0);
    }).catch(() => process.exit(1));
  }
}
