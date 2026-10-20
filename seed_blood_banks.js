import { getPool } from './src/config/db.js';
import { GUJARAT_DISTRICTS_34 } from './src/constants/districts.js';

// Predefined detailed setups for major & key cities, plus procedural generator for all 34 districts
const CITY_TEMPLATES = {
  'Ahmedabad': [
    {
      code: '01',
      name: 'Prathama Blood Centre & Transfusion Medicine',
      category: 'Trust & Research Institute',
      address: 'Near Jivraj Mehta Hospital, Dr. V.S. Road, Vasna, Ahmedabad',
      contact_phone: '+91 79 2660 0101',
      emergency_phone: '+91 98250 11201',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 78, o_neg: 16, a_pos: 54, a_neg: 12, b_pos: 62, b_neg: 10, ab_pos: 34, ab_neg: 8 }
    },
    {
      code: '02',
      name: 'Civil Hospital Regional Blood Transfusion Depot',
      category: 'Government & Civil',
      address: 'BJ Medical College Campus, Asarwa, Ahmedabad',
      contact_phone: '+91 79 2268 3721',
      emergency_phone: '+91 79 2268 1111',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 92, o_neg: 8, a_pos: 60, a_neg: 6, b_pos: 75, b_neg: 5, ab_pos: 40, ab_neg: 3 }
    },
    {
      code: '03',
      name: 'Indian Red Cross Society Blood Centre',
      category: 'Charitable / Red Cross',
      address: 'Red Cross Bhavan, Near Juna Wadaj / Paldi Cross Road, Ahmedabad',
      contact_phone: '+91 79 2658 9110',
      emergency_phone: '+91 98251 44550',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 64, o_neg: 14, a_pos: 42, a_neg: 9, b_pos: 58, b_neg: 11, ab_pos: 28, ab_neg: 6 }
    },
    {
      code: '04',
      name: 'Gujarat Cancer & Research Institute Blood Bank',
      category: 'Specialized Oncology Depot',
      address: 'M.P. Shah Cancer Hospital, Civil Campus, Asarwa, Ahmedabad',
      contact_phone: '+91 79 2268 8000',
      emergency_phone: '+91 98790 33441',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 45, o_neg: 4, a_pos: 35, a_neg: 5, b_pos: 48, b_neg: 4, ab_pos: 20, ab_neg: 2 }
    },
    {
      code: '05',
      name: 'Sardar Vallabhbhai Patel (SVP) Blood Bank',
      category: 'Municipal Corporation Medical',
      address: 'Ellisbridge Riverfront West, Ahmedabad',
      contact_phone: '+91 79 2657 7621',
      emergency_phone: '+91 94260 88990',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 55, o_neg: 9, a_pos: 38, a_neg: 7, b_pos: 50, b_neg: 8, ab_pos: 24, ab_neg: 4 }
    }
  ],

  'Vadodara': [
    {
      code: '01',
      name: 'Indian Red Cross Society Regional Blood Centre',
      category: 'Charitable / Red Cross',
      address: 'Red Cross Bhavan, Jubilee Baug Road, Raopura, Vadodara',
      contact_phone: '+91 265 243 0081',
      emergency_phone: '+91 98250 33211',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 58, o_neg: 6, a_pos: 44, a_neg: 8, b_pos: 52, b_neg: 7, ab_pos: 26, ab_neg: 4 }
    },
    {
      code: '02',
      name: 'Sir Sayajirao General (SSG) Hospital Blood Depot',
      category: 'Government & Civil',
      address: 'Medical College Campus, Jail Road, Anandpura, Vadodara',
      contact_phone: '+91 265 242 4848',
      emergency_phone: '+91 265 242 4141',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 70, o_neg: 4, a_pos: 50, a_neg: 3, b_pos: 60, b_neg: 5, ab_pos: 30, ab_neg: 2 }
    },
    {
      code: '03',
      name: 'Kashiben Gordhandas Patel Voluntary Blood Bank',
      category: 'Trust & Charitable',
      address: 'Near Anand Flats, Karelibaug Water Tank Road, Vadodara',
      contact_phone: '+91 265 246 1500',
      emergency_phone: '+91 98240 77112',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 42, o_neg: 12, a_pos: 36, a_neg: 9, b_pos: 45, b_neg: 8, ab_pos: 22, ab_neg: 5 }
    },
    {
      code: '04',
      name: 'Baroda Citizens Welfare Rotary Blood Centre',
      category: 'Rotary Lifeline',
      address: 'Dr. Jivraj Mehta Marg, Alkapuri, Vadodara',
      contact_phone: '+91 265 233 4455',
      emergency_phone: '+91 98252 66330',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 38, o_neg: 5, a_pos: 28, a_neg: 4, b_pos: 34, b_neg: 3, ab_pos: 18, ab_neg: 2 }
    },
    {
      code: '05',
      name: 'Sterling Emergency Blood Transfusion Unit',
      category: 'Hospital Emergency Unit',
      address: 'Race Course Circle, Alkapuri West, Vadodara',
      contact_phone: '+91 265 661 1111',
      emergency_phone: '+91 99099 22100',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 32, o_neg: 7, a_pos: 24, a_neg: 5, b_pos: 30, b_neg: 6, ab_pos: 15, ab_neg: 3 }
    }
  ],

  'Surat': [
    {
      code: '01',
      name: 'Surat Raktdaan Kendra & Research Centre',
      category: 'Trust & Research Institute',
      address: 'Opp. Old Khatodara Police Station, Khatodara, Surat',
      contact_phone: '+91 261 242 4110',
      emergency_phone: '+91 98251 14420',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 85, o_neg: 15, a_pos: 62, a_neg: 11, b_pos: 70, b_neg: 12, ab_pos: 38, ab_neg: 7 }
    },
    {
      code: '02',
      name: 'New Civil Hospital Regional Blood Centre',
      category: 'Government & Civil',
      address: 'Government Medical College, Majura Gate, Surat',
      contact_phone: '+91 261 224 4175',
      emergency_phone: '+91 261 224 4444',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 76, o_neg: 5, a_pos: 55, a_neg: 4, b_pos: 64, b_neg: 6, ab_pos: 32, ab_neg: 3 }
    },
    {
      code: '03',
      name: 'SMIMER Municipal Medical College Blood Depot',
      category: 'Municipal Medical Depot',
      address: 'Opp. Bombay Market, Umarwada, Surat',
      contact_phone: '+91 261 236 8040',
      emergency_phone: '+91 98254 99001',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 60, o_neg: 8, a_pos: 45, a_neg: 7, b_pos: 54, b_neg: 9, ab_pos: 26, ab_neg: 4 }
    },
    {
      code: '04',
      name: 'Rotary Blood Bank & Component Lab',
      category: 'Rotary Lifeline',
      address: 'Near J.K. Tower, Ring Road, Surat',
      contact_phone: '+91 261 245 6789',
      emergency_phone: '+91 98791 22334',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 44, o_neg: 6, a_pos: 32, a_neg: 5, b_pos: 38, b_neg: 5, ab_pos: 19, ab_neg: 2 }
    }
  ],

  'Rajkot': [
    {
      code: '01',
      name: 'Rajkot Voluntary Blood Bank & Research Institute',
      category: 'Trust & Research Institute',
      address: 'Malaviya Nagar Main Road, Gondal Road Corner, Rajkot',
      contact_phone: '+91 281 246 5500',
      emergency_phone: '+91 98242 11002',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 68, o_neg: 11, a_pos: 48, a_neg: 9, b_pos: 56, b_neg: 8, ab_pos: 30, ab_neg: 5 }
    },
    {
      code: '02',
      name: 'P.D.U. Government Civil Hospital Blood Depot',
      category: 'Government & Civil',
      address: 'Jamnagar Road, Near Sadar Police Station, Rajkot',
      contact_phone: '+91 281 245 4220',
      emergency_phone: '+91 281 245 1111',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 72, o_neg: 4, a_pos: 50, a_neg: 3, b_pos: 62, b_neg: 5, ab_pos: 28, ab_neg: 2 }
    },
    {
      code: '03',
      name: 'Nathwani Charitable Trust Blood Centre',
      category: 'Charitable Trust',
      address: 'Dhebar Road South, Near ST Bus Stand, Rajkot',
      contact_phone: '+91 281 223 1890',
      emergency_phone: '+91 94282 33455',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 45, o_neg: 8, a_pos: 34, a_neg: 6, b_pos: 40, b_neg: 7, ab_pos: 21, ab_neg: 3 }
    },
    {
      code: '04',
      name: 'Saurashtra Rotary Lifeline Blood Bank',
      category: 'Rotary Lifeline',
      address: 'Yagnik Road, Near Jagnath Plot, Rajkot',
      contact_phone: '+91 281 247 8899',
      emergency_phone: '+91 98255 77880',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 36, o_neg: 6, a_pos: 26, a_neg: 4, b_pos: 32, b_neg: 4, ab_pos: 16, ab_neg: 2 }
    }
  ],

  'Vav-Tharad': [
    {
      code: '01',
      name: 'Tharad Referral Hospital Sub-District Blood Storage Unit',
      category: 'Government Sub-District Hospital',
      address: 'National Highway 68, Near Bus Station, Tharad, Vav-Tharad',
      contact_phone: '+91 2747 222 105',
      emergency_phone: '+91 94270 55401',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 28, o_neg: 3, a_pos: 18, a_neg: 2, b_pos: 24, b_neg: 3, ab_pos: 12, ab_neg: 1 }
    },
    {
      code: '02',
      name: 'Vav Community Health Blood Storage Centre',
      category: 'Rural Health Care Unit',
      address: 'Main Bazaar Road, Near Taluka Panchayat, Vav, Vav-Tharad',
      contact_phone: '+91 2740 231 220',
      emergency_phone: '+91 98259 88123',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 22, o_neg: 2, a_pos: 15, a_neg: 2, b_pos: 20, b_neg: 2, ab_pos: 9, ab_neg: 1 }
    }
  ],

  'Banaskantha': [
    {
      code: '01',
      name: 'Palanpur General Civil Hospital Blood Depot',
      category: 'Government & Civil',
      address: 'Abu Highway Road, Near Circuit House, Palanpur',
      contact_phone: '+91 2742 252 030',
      emergency_phone: '+91 94263 11890',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 50, o_neg: 5, a_pos: 36, a_neg: 4, b_pos: 42, b_neg: 6, ab_pos: 20, ab_neg: 2 }
    },
    {
      code: '02',
      name: 'Banaskantha Red Cross Society Blood Bank',
      category: 'Charitable / Red Cross',
      address: 'Opp. Railway Station, Station Road, Palanpur',
      contact_phone: '+91 2742 257 410',
      emergency_phone: '+91 98254 66120',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 38, o_neg: 6, a_pos: 28, a_neg: 5, b_pos: 34, b_neg: 4, ab_pos: 16, ab_neg: 3 }
    },
    {
      code: '03',
      name: 'Deesa General Hospital Blood Storage Centre',
      category: 'Trust & Hospital',
      address: 'College Road, Near Gayatrimandir, Deesa, Banaskantha',
      contact_phone: '+91 2744 220 560',
      emergency_phone: '+91 98790 44512',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 32, o_neg: 4, a_pos: 22, a_neg: 3, b_pos: 28, b_neg: 3, ab_pos: 14, ab_neg: 2 }
    }
  ],

  'Bhavnagar': [
    {
      code: '01',
      name: 'Sir T. General Civil Hospital Blood Bank',
      category: 'Government & Civil',
      address: 'Medical College Campus, Jail Road, Bhavnagar',
      contact_phone: '+91 278 251 1511',
      emergency_phone: '+91 278 251 2222',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 56, o_neg: 6, a_pos: 40, a_neg: 5, b_pos: 48, b_neg: 6, ab_pos: 24, ab_neg: 3 }
    },
    {
      code: '02',
      name: 'Indian Red Cross Society Blood Bank Bhavnagar',
      category: 'Charitable / Red Cross',
      address: 'Waghawadi Road, Near Victoria Park, Bhavnagar',
      contact_phone: '+91 278 242 8890',
      emergency_phone: '+91 98252 33411',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 44, o_neg: 8, a_pos: 32, a_neg: 6, b_pos: 38, b_neg: 7, ab_pos: 18, ab_neg: 4 }
    },
    {
      code: '03',
      name: 'Bhavnagar Voluntary Blood Centre',
      category: 'Trust & Charitable',
      address: 'Kalanala Main Road, Bhavnagar',
      contact_phone: '+91 278 243 1200',
      emergency_phone: '+91 94268 77123',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 30, o_neg: 4, a_pos: 22, a_neg: 3, b_pos: 26, b_neg: 4, ab_pos: 12, ab_neg: 2 }
    }
  ],

  'Jamnagar': [
    {
      code: '01',
      name: 'M.P. Shah Medical College & G.G. Hospital Blood Bank',
      category: 'Government & Civil',
      address: 'Pandit Nehru Marg, Jamnagar',
      contact_phone: '+91 288 255 0204',
      emergency_phone: '+91 288 255 1111',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 60, o_neg: 5, a_pos: 42, a_neg: 4, b_pos: 50, b_neg: 5, ab_pos: 25, ab_neg: 2 }
    },
    {
      code: '02',
      name: 'Oshwal Medical Trust Voluntary Blood Bank',
      category: 'Trust & Charitable',
      address: 'Patel Colony, Street No. 9, Jamnagar',
      contact_phone: '+91 288 267 8900',
      emergency_phone: '+91 98242 55678',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 42, o_neg: 7, a_pos: 30, a_neg: 5, b_pos: 36, b_neg: 6, ab_pos: 18, ab_neg: 3 }
    },
    {
      code: '03',
      name: 'Rotary Club of Senor Jamnagar Blood Centre',
      category: 'Rotary Lifeline',
      address: 'Summair Club Road, Digvijay Plot, Jamnagar',
      contact_phone: '+91 288 256 3410',
      emergency_phone: '+91 94269 88301',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 28, o_neg: 4, a_pos: 20, a_neg: 3, b_pos: 25, b_neg: 3, ab_pos: 12, ab_neg: 2 }
    }
  ],

  'Gandhinagar': [
    {
      code: '01',
      name: 'GMERS Medical College & Civil Hospital Blood Depot',
      category: 'Government & Civil',
      address: 'Sector 12, Near Pathikashram, Gandhinagar',
      contact_phone: '+91 79 2322 1931',
      emergency_phone: '+91 79 2322 1111',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 55, o_neg: 7, a_pos: 40, a_neg: 5, b_pos: 46, b_neg: 6, ab_pos: 22, ab_neg: 3 }
    },
    {
      code: '02',
      name: 'Red Cross Society Blood Centre Gandhinagar',
      category: 'Charitable / Red Cross',
      address: 'Sector 16, Near GH Road, Gandhinagar',
      contact_phone: '+91 79 2324 5500',
      emergency_phone: '+91 98253 44102',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 40, o_neg: 8, a_pos: 30, a_neg: 6, b_pos: 35, b_neg: 7, ab_pos: 16, ab_neg: 4 }
    },
    {
      code: '03',
      name: 'Apollo Hospital Emergency Transfusion Centre',
      category: 'Hospital Emergency Unit',
      address: 'Plot 1A, GIDC Estate, Bhat, Gandhinagar',
      contact_phone: '+91 79 6670 1800',
      emergency_phone: '+91 99099 33201',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 35, o_neg: 6, a_pos: 26, a_neg: 4, b_pos: 30, b_neg: 5, ab_pos: 15, ab_neg: 2 }
    }
  ],

  'Anand': [
    {
      code: '01',
      name: 'Shree Krishna Hospital & Pramukhswami Medical College Blood Bank',
      category: 'Trust & Medical College',
      address: 'Gokalnagar, Karamsad, Anand',
      contact_phone: '+91 2692 228 411',
      emergency_phone: '+91 98251 99120',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 52, o_neg: 7, a_pos: 38, a_neg: 5, b_pos: 44, b_neg: 6, ab_pos: 22, ab_neg: 3 }
    },
    {
      code: '02',
      name: 'Indian Red Cross Society Blood Centre Anand',
      category: 'Charitable / Red Cross',
      address: 'Station Road, Near Anand Municipality, Anand',
      contact_phone: '+91 2692 254 300',
      emergency_phone: '+91 94260 55100',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 36, o_neg: 6, a_pos: 28, a_neg: 4, b_pos: 32, b_neg: 5, ab_pos: 16, ab_neg: 3 }
    },
    {
      code: '03',
      name: 'Anand Voluntary Blood Bank & Lifeline',
      category: 'Charitable Trust',
      address: 'Amul Dairy Road, Anand',
      contact_phone: '+91 2692 260 120',
      emergency_phone: '+91 98792 11440',
      operating_hours: '24/7 Emergency Service',
      stock: { o_pos: 30, o_neg: 4, a_pos: 22, a_neg: 3, b_pos: 25, b_neg: 3, ab_pos: 12, ab_neg: 2 }
    }
  ]
};

// Generic Generator for districts without specific manual override
function generateDistrictsBloodBanks(districtName) {
  const cleanSlug = districtName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  // Vary between 2 to 4 banks based on district
  let count = 3;
  if (['Dang', 'Chhota Udaipur'].includes(districtName)) {
    count = 2;
  } else if (['Kutch', 'Mehsana', 'Junagadh', 'Bharuch', 'Valsad', 'Panchmahal'].includes(districtName)) {
    count = 4;
  }

  const banks = [];
  const templates = [
    {
      code: '01',
      name: `${districtName} District General Civil Hospital Blood Centre`,
      category: 'Government & Civil',
      suffix: 'Civil Hospital Campus, Hospital Road',
      baseStock: { o_pos: 48, o_neg: 5, a_pos: 35, a_neg: 4, b_pos: 40, b_neg: 5, ab_pos: 20, ab_neg: 2 }
    },
    {
      code: '02',
      name: `Indian Red Cross Society Blood Bank ${districtName}`,
      category: 'Charitable / Red Cross',
      suffix: 'Red Cross Bhavan, Station Road',
      baseStock: { o_pos: 35, o_neg: 7, a_pos: 26, a_neg: 5, b_pos: 30, b_neg: 6, ab_pos: 15, ab_neg: 3 }
    },
    {
      code: '03',
      name: `${districtName} Rotary Community Lifeline Blood Depot`,
      category: 'Rotary Lifeline',
      suffix: 'Rotary Bhavan, Main Highway Circle',
      baseStock: { o_pos: 28, o_neg: 4, a_pos: 20, a_neg: 3, b_pos: 24, b_neg: 3, ab_pos: 12, ab_neg: 2 }
    },
    {
      code: '04',
      name: `${districtName} Citizens Welfare Medical Trust Blood Unit`,
      category: 'Trust & Charitable',
      suffix: 'Near Bus Port, College Road',
      baseStock: { o_pos: 30, o_neg: 3, a_pos: 22, a_neg: 2, b_pos: 25, b_neg: 4, ab_pos: 11, ab_neg: 1 }
    }
  ];

  for (let i = 0; i < count; i++) {
    const t = templates[i];
    // Slightly randomize stock to make it natural and tastable
    const jitter = (n) => Math.max(1, Math.round(n + (Math.random() * 6 - 3)));
    const stock = {
      o_pos: jitter(t.baseStock.o_pos),
      o_neg: jitter(t.baseStock.o_neg),
      a_pos: jitter(t.baseStock.a_pos),
      a_neg: jitter(t.baseStock.a_neg),
      b_pos: jitter(t.baseStock.b_pos),
      b_neg: jitter(t.baseStock.b_neg),
      ab_pos: jitter(t.baseStock.ab_pos),
      ab_neg: jitter(t.baseStock.ab_neg)
    };

    const phoneRand = Math.floor(1000 + Math.random() * 9000);
    const mobileRand = Math.floor(10000 + Math.random() * 90000);

    banks.push({
      code: t.code,
      name: t.name,
      category: t.category,
      address: `${t.suffix}, ${districtName}, Gujarat`,
      contact_phone: `+91 2${Math.floor(60 + Math.random() * 28)} 2${phoneRand}`,
      emergency_phone: `+91 9825${mobileRand}`,
      operating_hours: '24/7 Emergency Service',
      stock
    });
  }

  return banks;
}

const GUJARAT_DISTRICT_CENTERS = {
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Amreli': { lat: 21.6032, lng: 71.2221 },
  'Anand': { lat: 22.5645, lng: 72.9289 },
  'Aravalli': { lat: 23.4623, lng: 73.3082 },
  'Banaskantha': { lat: 24.1724, lng: 72.4346 },
  'Bharuch': { lat: 21.7051, lng: 72.9959 },
  'Bhavnagar': { lat: 21.7645, lng: 72.1519 },
  'Botad': { lat: 22.1704, lng: 71.6668 },
  'Chhota Udaipur': { lat: 22.3072, lng: 74.0128 },
  'Dahod': { lat: 22.8344, lng: 74.2562 },
  'Dang': { lat: 20.7534, lng: 73.6983 },
  'Devbhumi Dwarka': { lat: 22.2442, lng: 68.9685 },
  'Gandhinagar': { lat: 23.2156, lng: 72.6369 },
  'Gir Somnath': { lat: 20.9009, lng: 70.3639 },
  'Jamnagar': { lat: 22.4707, lng: 70.0577 },
  'Junagadh': { lat: 21.5222, lng: 70.4579 },
  'Kheda': { lat: 22.7533, lng: 72.6841 },
  'Kutch': { lat: 23.2420, lng: 69.6669 },
  'Mahisagar': { lat: 23.1367, lng: 73.6148 },
  'Mehsana': { lat: 23.5880, lng: 72.3693 },
  'Morbi': { lat: 22.8173, lng: 70.8370 },
  'Narmada': { lat: 21.8711, lng: 73.5027 },
  'Navsari': { lat: 20.9467, lng: 72.9520 },
  'Panchmahal': { lat: 22.7756, lng: 73.6149 },
  'Patan': { lat: 23.8493, lng: 72.1266 },
  'Porbandar': { lat: 21.6417, lng: 69.6293 },
  'Rajkot': { lat: 22.3039, lng: 70.8022 },
  'Sabarkantha': { lat: 23.6022, lng: 72.9644 },
  'Surat': { lat: 21.1702, lng: 72.8311 },
  'Surendranagar': { lat: 22.7277, lng: 71.6370 },
  'Tapi': { lat: 21.2464, lng: 73.3942 },
  'Vadodara': { lat: 22.3072, lng: 73.1812 },
  'Valsad': { lat: 20.5992, lng: 72.9342 },
  'Vav-Tharad': { lat: 24.3940, lng: 71.6267 }
};

export async function seedAllBloodBanks() {
  const pool = getPool();
  console.log('[*] Seeding Blood Banks for all 34 Gujarat Districts with GPS coordinates...');

  // 1. Clear existing rows in blood_banks
  await pool.query('DELETE FROM blood_banks;');

  let totalInserted = 0;

  for (const district of GUJARAT_DISTRICTS_34) {
    const cleanSlug = district.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const banks = CITY_TEMPLATES[district] || generateDistrictsBloodBanks(district);
    const base = GUJARAT_DISTRICT_CENTERS[district] || { lat: 22.2587, lng: 71.1924 };

    for (const b of banks) {
      const bankId = `${cleanSlug}_${b.code}`;
      const s = b.stock;
      const totalUnits = s.o_pos + s.o_neg + s.a_pos + s.a_neg + s.b_pos + s.b_neg + s.ab_pos + s.ab_neg;

      const codeNum = parseInt(b.code, 10) || 1;
      const lat = b.latitude || Number((base.lat + (codeNum - 1) * 0.015 - 0.007).toFixed(5));
      const lng = b.longitude || Number((base.lng + (codeNum - 1) * -0.012 + 0.006).toFixed(5));

      const sql = `
        INSERT INTO blood_banks (
          id, bank_code, name, city, category, address, contact_phone, emergency_phone, operating_hours,
          latitude, longitude,
          stock_o_pos, stock_o_neg, stock_a_pos, stock_a_neg, stock_b_pos, stock_b_neg, stock_ab_pos, stock_ab_neg,
          total_units, is_verified
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;

      await pool.query(sql, [
        bankId,
        b.code,
        b.name,
        district,
        b.category,
        b.address,
        b.contact_phone,
        b.emergency_phone,
        b.operating_hours || '24/7 Emergency Service',
        lat,
        lng,
        s.o_pos,
        s.o_neg,
        s.a_pos,
        s.a_neg,
        s.b_pos,
        s.b_neg,
        s.ab_pos,
        s.ab_neg,
        totalUnits,
        1
      ]);

      totalInserted++;
    }
  }

  console.log(`[OK] Successfully seeded ${totalInserted} blood banks across all 34 Gujarat districts!`);
  return totalInserted;
}

// Allow direct run: node seed_blood_banks.js
if (process.argv[1]?.endsWith('seed_blood_banks.js')) {
  seedAllBloodBanks()
    .then((n) => {
      console.log(`Done! ${n} blood banks inserted.`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding Error:', err);
      process.exit(1);
    });
}
