/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Frontend Form Validation Functions
 * Simple, beginner-friendly validators for BloodLink Donor & Requester portals.
 * Each field has its own separate function.
 * Returns: error message string if invalid, or empty string "" if valid.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// 1. Full Name (Donor)
export function validateFullName(name) {
  if (!name || name.trim() === '') {
    return 'Full name is required';
  }
  if (name.trim().length < 3) {
    return 'Name must be at least 3 characters';
  }
  return '';
}

// 2. Patient Name (Requester)
export function validatePatientName(name) {
  if (!name || name.trim() === '') {
    return 'Patient full name is required';
  }
  if (name.trim().length < 3) {
    return 'Patient name must be at least 3 characters';
  }
  return '';
}

// 3. Email Address
export function validateEmail(email) {
  if (!email || email.trim() === '') {
    return 'Email address is required';
  }
  // Simple standard email pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return '';
}

// 4. Mobile Number (Must be exactly 10 digits)
export function validatePhone(phone) {
  if (!phone || phone.trim() === '') {
    return 'Contact mobile number is required';
  }

  // Remove spaces, dashes, +91 prefix
  const digits = phone.replace(/\D/g, '');
  const cleanDigits = digits.startsWith('91') && digits.length === 12
    ? digits.slice(2)
    : digits;

  if (cleanDigits.length !== 10) {
    return 'Mobile number must be exactly 10 digits';
  }
  return '';
}

// 5. Age (18 to 65)
export function validateAge(age) {
  if (age === '' || age === null || age === undefined) {
    return 'Age is required';
  }
  const num = Number(age);
  if (isNaN(num)) {
    return 'Age must be a valid number';
  }
  if (num < 18 || num > 65) {
    return 'Donor age must be between 18 and 65 years';
  }
  return '';
}

// 6. Weight (minimum 45 kg)
export function validateWeight(weight) {
  if (weight === '' || weight === null || weight === undefined) {
    return 'Weight is required';
  }
  const num = Number(weight);
  if (isNaN(num)) {
    return 'Weight must be a valid number';
  }
  if (num < 45) {
    return 'Weight must be at least 45 kg to donate blood';
  }
  return '';
}

// 7. City / Depot Selection
export function validateCity(city) {
  if (!city || city.trim() === '') {
    return 'Please select a city / depot';
  }
  return '';
}

// 8. Blood Group Selection
export function validateBloodGroup(bloodGroup) {
  if (!bloodGroup || bloodGroup.trim() === '') {
    return 'Please select a blood group';
  }
  return '';
}

// 9. Hospital & Ward (Requester)
export function validateHospital(hospital) {
  if (!hospital || hospital.trim() === '') {
    return 'Hospital and ward details are required';
  }
  if (hospital.trim().length < 3) {
    return 'Please enter a valid hospital and ward';
  }
  return '';
}

// 10. Units Needed (Requester)
export function validateUnits(units) {
  if (!units) {
    return 'Please select units needed';
  }
  return '';
}

// 11. Required By Date (Requester)
export function validateRequiredDate(date, isImmediate) {
  if (isImmediate) {
    return '';
  }
  if (!date) {
    return '';
  }
  // Calculate tomorrow's date string YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  const minDate = `${yyyy}-${mm}-${dd}`;

  if (date < minDate) {
    return 'Date must be from tomorrow onwards (minimum 24h notice)';
  }
  return '';
}

// 12. Last Donation Date (Cannot be future date)
export function validateLastDonationDate(date, isFirstTime) {
  if (isFirstTime || !date) {
    return '';
  }
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  if (date > todayStr) {
    return 'Last donation date cannot be in the future';
  }
  return '';
}

