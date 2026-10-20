#!/usr/bin/env python3
"""
=============================================================================
 BloodLink - Generate & Insert 500 Additional Gujarati Donors
 Ensures EVERY district has a MINIMUM of 2 donors for EVERY blood group
=============================================================================
"""

import os
import random
import datetime
import json
import mysql.connector

TOTAL_RECORDS = 500

GUJARAT_DISTRICTS_34 = [
    'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar',
    'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhumi Dwarka', 'Gandhinagar',
    'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana',
    'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan', 'Porbandar', 'Rajkot',
    'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad', 'Vav-Tharad'
]

CITY_TO_DISTRICT = {
    'Ahmedabad': 'Ahmedabad', 'Amreli': 'Amreli', 'Anand': 'Anand', 'Ankleshwar': 'Bharuch',
    'Bharuch': 'Bharuch', 'Bhavnagar': 'Bhavnagar', 'Bhuj': 'Kutch', 'Bilimora': 'Navsari',
    'Botad': 'Botad', 'Dahod': 'Dahod', 'Deesa': 'Banaskantha', 'Gandhinagar': 'Gandhinagar',
    'Godhra': 'Panchmahal', 'Gondal': 'Rajkot', 'Himmatnagar': 'Sabarkantha', 'Jamnagar': 'Jamnagar',
    'Jetpur': 'Rajkot', 'Junagadh': 'Junagadh', 'Kalol': 'Gandhinagar', 'Keshod': 'Junagadh',
    'Mehsana': 'Mehsana', 'Modasa': 'Aravalli', 'Morbi': 'Morbi', 'Navsari': 'Navsari',
    'Palanpur': 'Banaskantha', 'Patan': 'Patan', 'Porbandar': 'Porbandar', 'Rajkot': 'Rajkot',
    'Surat': 'Surat', 'Surendranagar': 'Surendranagar', 'Vadodara': 'Vadodara', 'Valsad': 'Valsad',
    'Vapi': 'Valsad', 'Veraval': 'Gir Somnath', 'Vyara': 'Tapi', 'Wadhwan': 'Surendranagar',
    'Vav-Tharad': 'Vav-Tharad', 'Tharad': 'Vav-Tharad', 'Vav': 'Vav-Tharad', 'Dang': 'Dang',
    'Narmada': 'Narmada', 'Mahisagar': 'Mahisagar', 'Kheda': 'Kheda', 'Devbhumi Dwarka': 'Devbhumi Dwarka',
    'Chhota Udaipur': 'Chhota Udaipur'
}

BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

GUJARATI_MALE_NAMES = [
    "Aarav", "Bhavin", "Chirag", "Dharmesh", "Hardik", "Hiren", "Jayesh", "Ketan",
    "Mehul", "Nilesh", "Parth", "Pratik", "Rajesh", "Sanjay", "Tushar", "Jignesh",
    "Bhavesh", "Shailesh", "Paresh", "Naresh", "Mukesh", "Ashok", "Haresh", "Ramesh",
    "Kalpesh", "Vimal", "Mayur", "Ashish", "Harsh", "Dhaval", "Milan", "Sagar",
    "Devang", "Ankit", "Ravi", "Gaurav", "Darshan", "Chetan", "Kirit", "Dipen",
    "Pankaj", "Vipul", "Manoj", "Krunal", "Siddharth", "Akash", "Kishan", "Deep",
    "Ronak", "Sunny", "Vijay", "Girish", "Manish", "Dinesh", "Kishor", "Hitesh"
]

GUJARATI_FEMALE_NAMES = [
    "Kinjal", "Hetal", "Pooja", "Riddhi", "Dharti", "Neha", "Tejal", "Bhavna",
    "Varsha", "Krupa", "Urvashi", "Mittal", "Alpa", "Shilpa", "Rekha", "Hansa",
    "Geeta", "Meena", "Shital", "Jagruti", "Toral", "Payal", "Komal", "Hiral",
    "Tanvi", "Disha", "Ritu", "Foram", "Mansi", "Khushbu", "Kajal", "Binal",
    "Falguni", "Dimple", "Shruti", "Dhara", "Bhumika", "Swati", "Nirali", "Avani"
]

GUJARATI_SURNAMES = [
    "Patel", "Shah", "Mehta", "Desai", "Joshi", "Trivedi", "Pandya", "Vora",
    "Zaveri", "Solanki", "Chauhan", "Gohil", "Jadeja", "Raval", "Bhatt", "Shukla",
    "Dave", "Barot", "Prajapati", "Soni", "Parmar", "Makwana", "Thakor", "Rathod",
    "Dabhi", "Kothari", "Parekh", "Chudasama", "Jhala", "Vaghela", "Panchal", "Mistry",
    "Gadhvi", "Limbachiya", "Modh", "Sheth", "Dalal", "Kansara", "Gandhi", "Kapadia"
]

def load_env():
    config = {
        "DB_HOST": "127.0.0.1",
        "DB_PORT": "3306",
        "DB_USER": "root",
        "DB_PASSWORD": "",
        "DB_NAME": "bloodlink_db"
    }
    if os.path.exists(".env"):
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    config[k.strip()] = v.strip().strip("'\"")
    return config

def main():
    cfg = load_env()
    print(f"Connecting to MySQL at {cfg['DB_HOST']}:{cfg['DB_PORT']}...")
    conn = mysql.connector.connect(
        host=cfg["DB_HOST"],
        port=int(cfg["DB_PORT"]),
        user=cfg["DB_USER"],
        password=cfg["DB_PASSWORD"],
        database=cfg["DB_NAME"]
    )
    cur = conn.cursor()

    # 1. Fetch current distribution per district and blood group
    cur.execute("SELECT city, blood_group, COUNT(*) FROM donors GROUP BY city, blood_group")
    grid = {d: {bg: 0 for bg in BLOOD_GROUPS} for d in GUJARAT_DISTRICTS_34}
    for city, bg, cnt in cur.fetchall():
        dist = CITY_TO_DISTRICT.get(city, city)
        if dist in grid and bg in grid[dist]:
            grid[dist][bg] += cnt

    # 2. Plan records: Phase 1 brings every (district, bg) with < 2 up to at least 2
    planned = []
    for d in GUJARAT_DISTRICTS_34:
        for bg in BLOOD_GROUPS:
            current = grid[d][bg]
            if current < 2:
                needed = 2 - current
                for _ in range(needed):
                    planned.append((d, bg))
                    grid[d][bg] += 1

    print(f"Phase 1: Added {len(planned)} records to guarantee minimum 2 donors for EVERY blood group in all 34 districts.")

    # 3. Phase 2: Add remaining records to reach exactly 500 total, cycling evenly
    remaining = TOTAL_RECORDS - len(planned)
    print(f"Phase 2: Distributing remaining {remaining} records across districts and blood groups...")
    dist_idx = 0
    bg_idx = 0
    for _ in range(remaining):
        d = GUJARAT_DISTRICTS_34[dist_idx % len(GUJARAT_DISTRICTS_34)]
        bg = BLOOD_GROUPS[bg_idx % len(BLOOD_GROUPS)]
        planned.append((d, bg))
        grid[d][bg] += 1
        dist_idx += 1
        bg_idx += 1

    print(f"Total planned records: {len(planned)} (Target: {TOTAL_RECORDS})")

    # 4. Generate realistic donor data for all planned records
    today = datetime.date(2026, 10, 20)
    donors_to_insert = []
    used_emails = set()

    # Fetch existing emails to avoid duplicate keys
    cur.execute("SELECT email FROM donors WHERE email IS NOT NULL")
    for r in cur.fetchall():
        used_emails.add(r[0].lower())

    for i, (district, bg) in enumerate(planned):
        gender = random.choice(["m", "f"])
        fn = random.choice(GUJARATI_MALE_NAMES if gender == "m" else GUJARATI_FEMALE_NAMES)
        sn = random.choice(GUJARATI_SURNAMES)
        suffix = random.choice(["bhai", "kumar", ""]) if gender == "m" else random.choice(["ben", ""])
        display_name = f"{fn}{suffix} {sn}".strip()

        # Unique email
        clean_dist = district.lower().replace(" ", "").replace("-", "")
        clean_sn = sn.lower()
        clean_fn = fn.lower()
        dom = random.choice(["gmail.com", "yahoo.in", "outlook.com"])
        email = f"{clean_fn}.{clean_sn}.{clean_dist}{random.randint(1000, 99999)}@{dom}"
        while email in used_emails:
            email = f"{clean_fn}.{clean_sn}.{clean_dist}{random.randint(10000, 999999)}@{dom}"
        used_emails.add(email)

        # Phone (+91 9xxx / 8xxx / 7xxx / 6xxx)
        phone = f"+91 {random.choice([9, 8, 7, 6])}{random.randint(10000000, 99999999)}"
        age = random.randint(19, 58)
        weight = round(random.uniform(50.0, 85.0), 1)

        is_first = 1 if random.random() < 0.28 else 0
        days_ago = random.randint(95, 320)
        last_date = (today - datetime.timedelta(days=days_ago)).isoformat() if is_first == 0 else None
        is_active = 1 if random.random() < 0.94 else 0

        donors_to_insert.append((
            display_name,
            email,
            phone,
            age,
            weight,
            district,
            bg,
            last_date,
            is_first,
            is_active
        ))

    # 5. Batch insert into MySQL
    insert_sql = """
        INSERT INTO donors (
            name, email, phone, age, weight, city, blood_group, last_donated_date, is_first_time, is_active
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    print("Inserting 500 donor records into MySQL database...")
    batch_size = 100
    for i in range(0, len(donors_to_insert), batch_size):
        cur.executemany(insert_sql, donors_to_insert[i:i + batch_size])
        conn.commit()

    print(f"Successfully inserted {len(donors_to_insert)} records into MySQL!")

    # 6. Verify that EVERY district has count >= 2 for EVERY blood group
    cur.execute("SELECT city, blood_group, COUNT(*) FROM donors GROUP BY city, blood_group")
    verified_grid = {d: {bg: 0 for bg in BLOOD_GROUPS} for d in GUJARAT_DISTRICTS_34}
    for city, bg, cnt in cur.fetchall():
        dist = CITY_TO_DISTRICT.get(city, city)
        if dist in verified_grid and bg in verified_grid[dist]:
            verified_grid[dist][bg] += cnt

    zero_or_one = 0
    min_found = 999
    for d in GUJARAT_DISTRICTS_34:
        for bg in BLOOD_GROUPS:
            c = verified_grid[d][bg]
            if c < min_found:
                min_found = c
            if c < 2:
                zero_or_one += 1
                print(f"WARNING: {d} for {bg} has count {c} < 2")

    cur.execute("SELECT COUNT(*) FROM donors")
    total_in_db = cur.fetchone()[0]

    print("=" * 65)
    print("VERIFICATION RESULT:")
    print(f"Total donors now in database: {total_in_db}")
    print(f"Minimum donors for ANY blood group in ANY district: {min_found}")
    print(f"Districts with < 2 donors for ANY blood group: {zero_or_one} (Expected: 0)")
    print("=" * 65)

    # 7. Also save JSON export for reference
    json_export = [
        {
            "name": d[0], "email": d[1], "phone": d[2], "age": d[3],
            "weight": d[4], "district": d[5], "blood_group": d[6],
            "last_donated_date": d[7], "is_first_time": bool(d[8]), "is_active": bool(d[9])
        }
        for d in donors_to_insert
    ]
    with open("seed_donors_500.json", "w", encoding="utf-8") as jf:
        json.dump(json_export, jf, indent=2)
    print("Saved generated records to seed_donors_500.json")

    conn.close()

if __name__ == "__main__":
    main()
