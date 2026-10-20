#!/usr/bin/env python3
"""
=============================================================================
 BloodLink - Gujarati Donor Data Generator (1000 Diverse Records)
=============================================================================
 Description:
   Generates 1,000 highly diverse, realistic blood donor profiles with authentic
   Gujarati first names, patronymics, and community surnames from across Gujarat.
   
 Outputs:
   1. Generates 'seed_donors_1000.sql' (Ready-to-execute batch SQL insert)
   2. Generates 'seed_donors_1000.json' (JSON export for API ingestion/inspection)
   3. Optional direct MySQL database insertion (reads credentials from .env)

 Note:
   As requested, this script has been generated but NOT executed.
   You can run it anytime with: python seed_donors.py
=============================================================================
"""

import os
import sys
import json
import random
import datetime
from pathlib import Path

# Total number of records to generate
TOTAL_RECORDS = 1000

# ---------------------------------------------------------------------------
# 1. Authentic Gujarati First Names & Surnames
# ---------------------------------------------------------------------------
GUJARATI_MALE_NAMES = [
    "Aarav", "Bhavin", "Chirag", "Dharmesh", "Hardik", "Hiren", "Jayesh", "Ketan",
    "Mehul", "Nilesh", "Parth", "Pratik", "Rajesh", "Sanjay", "Tushar", "Jignesh",
    "Bhavesh", "Shailesh", "Paresh", "Naresh", "Mukesh", "Ashok", "Haresh", "Ramesh",
    "Kalpesh", "Vimal", "Mayur", "Ashish", "Harsh", "Dhaval", "Milan", "Sagar",
    "Devang", "Ankit", "Ravi", "Gaurav", "Darshan", "Chetan", "Kirit", "Dipen",
    "Pankaj", "Vipul", "Manoj", "Krunal", "Siddharth", "Akash", "Kishan", "Deep",
    "Ronak", "Sunny", "Vijay", "Girish", "Manish", "Dinesh", "Kishor", "Hitesh",
    "Nitin", "Bharat", "Mahesh", "Pravin", "Sunil", "Hemant", "Rohit", "Sameer",
    "Umesh", "Yogesh", "Brijesh", "Alok", "Chintan", "Nirav", "Sanket", "Pranav"
]

GUJARATI_FEMALE_NAMES = [
    "Kinjal", "Hetal", "Pooja", "Riddhi", "Dharti", "Neha", "Tejal", "Bhavna",
    "Varsha", "Krupa", "Urvashi", "Mittal", "Alpa", "Shilpa", "Rekha", "Hansa",
    "Geeta", "Meena", "Shital", "Jagruti", "Toral", "Payal", "Komal", "Hiral",
    "Tanvi", "Disha", "Ritu", "Foram", "Mansi", "Khushbu", "Kajal", "Binal",
    "Falguni", "Dimple", "Shruti", "Dhara", "Bhumika", "Swati", "Nirali", "Avani",
    "Janki", "Priyanka", "Deepa", "Sneha", "Kavita", "Dipti", "Ankita", "Prachi",
    "Ami", "Bindiya", "Chetna", "Dakshaben", "Gopi", "Heena", "Ila", "Jyoti",
    "Kokila", "Lata", "Manisha", "Nayana", "Parul", "Radhika", "Sapna", "Trushna"
]

GUJARATI_SURNAMES = [
    "Patel", "Shah", "Mehta", "Desai", "Joshi", "Trivedi", "Pandya", "Vora",
    "Zaveri", "Solanki", "Chauhan", "Gohil", "Jadeja", "Raval", "Bhatt", "Shukla",
    "Dave", "Barot", "Prajapati", "Soni", "Parmar", "Makwana", "Thakor", "Rathod",
    "Dabhi", "Kothari", "Parekh", "Chudasama", "Jhala", "Vaghela", "Panchal", "Mistry",
    "Gadhvi", "Limbachiya", "Modh", "Sheth", "Dalal", "Kansara", "Gandhi", "Kapadia",
    "Khandwala", "Majmudar", "Munshi", "Oza", "Pathak", "Purohit", "Rajyaguru", "Sarvaiya",
    "Somani", "Upadhyay", "Vala", "Vyas", "Waghela", "Bhuva", "Kakadiya", "Lakhani",
    "Sanghani", "Radadiya", "Savani", "Bhesaniya", "Gajera", "Dhameliya", "Vekariya"
]

# Gujarati name suffixes & middle name variants for natural diversity
MALE_SUFFIXES = ["bhai", "kumar", ""]
FEMALE_SUFFIXES = ["ben", ""]

# ---------------------------------------------------------------------------
# 2. Major Gujarat Cities & Depots
# ---------------------------------------------------------------------------
GUJARAT_CITIES = [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar",
    "Gandhinagar", "Junagadh", "Anand", "Navsari", "Morbi", "Bharuch",
    "Porbandar", "Mehsana", "Bhuj", "Valsad", "Vapi", "Gondal",
    "Palanpur", "Patan", "Deesa", "Jetpur", "Amreli", "Godhra",
    "Dahod", "Veraval", "Surendranagar", "Kalol", "Botad", "Himmatnagar",
    "Ankleshwar", "Modasa", "Vyara", "Bilimora", "Keshod", "Wadhwan"
]

# ---------------------------------------------------------------------------
# 3. Blood Group Distribution (Weighted realistically for Indian demographics)
# ---------------------------------------------------------------------------
BLOOD_GROUPS = ["O+", "B+", "A+", "AB+", "O-", "B-", "A-", "AB-"]
BLOOD_WEIGHTS = [0.37, 0.32, 0.19, 0.08, 0.015, 0.013, 0.008, 0.004]

# Availability options
DAYS_LIST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
TIME_SLOTS = ["Morning", "Afternoon", "Evening", "Flexible"]

# Email domains
EMAIL_DOMAINS = ["gmail.com", "yahoo.in", "outlook.com", "rediffmail.com", "hotmail.com"]

# ---------------------------------------------------------------------------
# Helper: Parse .env file safely without external libraries
# ---------------------------------------------------------------------------
def load_env(env_path):
    config = {
        "DB_HOST": "127.0.0.1",
        "DB_PORT": "3306",
        "DB_USER": "root",
        "DB_PASSWORD": "",
        "DB_NAME": "bloodlink_db"
    }
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    config[key.strip()] = val.strip().strip("'\"")
    return config

# ---------------------------------------------------------------------------
# Generator: Create 1000 diverse Gujarati Donor Records
# ---------------------------------------------------------------------------
def generate_donor_data(count=TOTAL_RECORDS):
    random.seed(42)  # Reproducible yet varied data
    today = datetime.date.today()
    
    donors = []
    used_emails = set()
    used_phones = set()

    # Typical Gujarat telecom mobile prefixes: 9825, 9898, 9727, 9909, 9426, 9824, etc.
    gujarat_mobile_prefixes = ["9825", "9898", "9727", "9909", "9426", "9824", "9879", "9979", "9712", "9925", "9825", "9427"]

    for i in range(1, count + 1):
        # 1. Gender, Name and Surname
        is_female = random.random() < 0.38  # ~38% female voluntary donors
        first_name = random.choice(GUJARATI_FEMALE_NAMES if is_female else GUJARATI_MALE_NAMES)
        surname = random.choice(GUJARATI_SURNAMES)
        
        # Add cultural suffix with some probability
        suffix = random.choice(FEMALE_SUFFIXES if is_female else MALE_SUFFIXES)
        display_first = f"{first_name}{suffix}" if suffix and not first_name.endswith(suffix) else first_name
        full_name = f"{display_first} {surname}"

        # 2. Email Address (Guaranteed unique)
        clean_first = first_name.lower().replace(" ", "")
        clean_last = surname.lower().replace(" ", "")
        separator = random.choice([".", "_", ""])
        num_suffix = random.choice([i, random.randint(10, 999), f"{i}{random.randint(1, 9)}"])
        domain = random.choice(EMAIL_DOMAINS)
        
        email = f"{clean_first}{separator}{clean_last}{num_suffix}@{domain}"
        while email in used_emails:
            num_suffix = random.randint(1000, 99999)
            email = f"{clean_first}{separator}{clean_last}{num_suffix}@{domain}"
        used_emails.add(email)

        # 3. 10-Digit Mobile Phone (Guaranteed unique)
        prefix = random.choice(gujarat_mobile_prefixes)
        remaining_digits = str(random.randint(100000, 999999))
        phone = f"{prefix}{remaining_digits}"
        while phone in used_phones:
            phone = f"{random.choice(gujarat_mobile_prefixes)}{random.randint(100000, 999999)}"
        used_phones.add(phone)

        # 4. Age & Weight (Realistic distribution for eligible blood donors: 18 - 65)
        # Weighting towards 20 - 45 years
        if random.random() < 0.70:
            age = random.randint(20, 42)
        else:
            age = random.randint(18, 62)

        # Weight >= 45 kg (normally distributed around 66kg, clamped 46 - 98kg)
        raw_weight = random.gauss(65.0, 11.0)
        weight = round(max(46.0, min(99.0, raw_weight)), 1)

        # 5. City
        city = random.choice(GUJARAT_CITIES)

        # 6. Blood Group
        blood_group = random.choices(BLOOD_GROUPS, weights=BLOOD_WEIGHTS, k=1)[0]

        # 7. First-time donor or Previous donation date (Strictly in the past, never future!)
        is_first_time = random.random() < 0.32  # ~32% first-time donors
        
        if is_first_time:
            last_donated_date = None
        else:
            # Last donation between 90 days ago and 800 days ago (3 months to ~2.2 years)
            days_ago = random.randint(90, 800)
            donation_date = today - datetime.timedelta(days=days_ago)
            last_donated_date = donation_date.strftime("%Y-%m-%d")

        # 8. Active status (~95% active)
        is_active = random.random() < 0.95

        donors.append({
            "id": i,
            "name": full_name,
            "email": email,
            "phone": phone,
            "age": age,
            "weight": weight,
            "city": city,
            "blood_group": blood_group,
            "last_donated_date": last_donated_date,
            "is_first_time": 1 if is_first_time else 0,
            "is_active": 1 if is_active else 0
        })

    return donors

# ---------------------------------------------------------------------------
# Export 1: Generate SQL Seed File
# ---------------------------------------------------------------------------
def export_sql(donors, output_path):
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("-- =============================================================\n")
        f.write("-- BloodLink Seed Data: 1,000 Verified Gujarati Blood Donors\n")
        f.write(f"-- Generated At: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("-- Target Table: donors\n")
        f.write("-- =============================================================\n\n")
        f.write("USE `bloodlink_db`;\n\n")
        
        f.write("INSERT INTO `donors` (\n")
        f.write("  `name`, `email`, `phone`, `age`, `weight`, `city`, `blood_group`, `last_donated_date`, `is_first_time`, `is_active`\n")
        f.write(") VALUES\n")

        total = len(donors)
        for idx, d in enumerate(donors, 1):
            name_esc = d["name"].replace("'", "''")
            email_esc = d["email"].replace("'", "''")
            phone_esc = d["phone"].replace("'", "''")
            city_esc = d["city"].replace("'", "''")
            bg = d["blood_group"]
            date_val = f"'{d['last_donated_date']}'" if d["last_donated_date"] else "NULL"
            comma = "," if idx < total else ";"
            
            f.write(f"  ('{name_esc}', '{email_esc}', '{phone_esc}', {d['age']}, {d['weight']}, '{city_esc}', '{bg}', {date_val}, {d['is_first_time']}, {d['is_active']}){comma}\n")
            
        f.write("\n-- End of 1,000 donor records\n")
    print(f"[OK] SQL seed file successfully generated: {output_path}")

# ---------------------------------------------------------------------------
# Export 2: Generate JSON Seed File
# ---------------------------------------------------------------------------
def export_json(donors, output_path):
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(donors, f, indent=2, ensure_ascii=False)
    print(f"[OK] JSON data file successfully generated: {output_path}")

# ---------------------------------------------------------------------------
# Optional: Direct MySQL Ingestion
# ---------------------------------------------------------------------------
def insert_into_mysql(donors, env_config):
    try:
        import mysql.connector
    except ImportError:
        try:
            import pymysql as mysql_connector
            mysql = mysql_connector
        except ImportError:
            print("[INFO] Python MySQL client (mysql-connector-python or pymysql) not installed.")
            print("       You can easily import the generated 'seed_donors_1000.sql' directly via MySQL Workbench, phpMyAdmin, or mysql CLI.")
            return

    host = env_config.get("DB_HOST", "127.0.0.1")
    port = int(env_config.get("DB_PORT", 3306))
    user = env_config.get("DB_USER", "root")
    password = env_config.get("DB_PASSWORD", "")
    database = env_config.get("DB_NAME", "bloodlink_db")

    print(f"[*] Connecting to MySQL ({user}@{host}:{port}/{database})...")
    conn = mysql.connector.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database
    )
    cursor = conn.cursor()

    query = """
        INSERT INTO donors (
            name, email, phone, age, weight, city, blood_group, last_donated_date, is_first_time, is_active
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    data_tuples = [
        (
            d["name"], d["email"], d["phone"], d["age"], d["weight"],
            d["city"], d["blood_group"], d["last_donated_date"],
            d["is_first_time"], d["is_active"]
        )
        for d in donors
    ]

    # Batch insert in chunks of 100 for optimal performance
    batch_size = 100
    for i in range(0, len(data_tuples), batch_size):
        chunk = data_tuples[i:i + batch_size]
        cursor.executemany(query, chunk)
        conn.commit()

    cursor.close()
    conn.close()
    print(f"[OK] Successfully inserted {len(donors)} records into MySQL table 'donors'!")

# ---------------------------------------------------------------------------
# Main Routine
# ---------------------------------------------------------------------------
def main():
    base_dir = Path(__file__).resolve().parent
    env_file = base_dir / ".env"
    sql_file = base_dir / "seed_donors_1000.sql"
    json_file = base_dir / "seed_donors_1000.json"

    print("=================================================================")
    print("      BloodLink - Gujarati Donor Data Generator (1,000 Records)  ")
    print("=================================================================")

    # 1. Generate in-memory dataset
    print(f"[*] Generating {TOTAL_RECORDS} authentic Gujarati blood donor records...")
    donors = generate_donor_data(TOTAL_RECORDS)
    print(f"[OK] Generated {len(donors)} unique donor profiles.")

    # 2. Export to SQL file
    export_sql(donors, sql_file)

    # 3. Export to JSON file
    export_json(donors, json_file)

    # 4. Optional Direct Ingestion Flag (e.g. `python seed_donors.py --insert`)
    if "--insert" in sys.argv:
        env_config = load_env(env_file)
        insert_into_mysql(donors, env_config)
    else:
        print("\n[*] Script completed in generate-only mode.")
        print(f"    - SQL File : {sql_file.name}")
        print(f"    - JSON File: {json_file.name}")
        print("    - To insert into MySQL directly, run: python seed_donors.py --insert")

if __name__ == "__main__":
    main()
