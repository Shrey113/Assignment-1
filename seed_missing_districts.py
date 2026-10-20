import random
import datetime
import mysql.connector

missing_districts = ['Vav-Tharad', 'Dang', 'Narmada', 'Mahisagar', 'Kheda', 'Devbhumi Dwarka', 'Chhota Udaipur']

first_names_m = ['Bhavin', 'Hardik', 'Jignesh', 'Krunal', 'Milan', 'Nirav', 'Pratik', 'Rajesh', 'Sanket', 'Tushar', 'Viral', 'Yash']
first_names_f = ['Bhavna', 'Dhara', 'Hiral', 'Kinjal', 'Mansi', 'Neha', 'Pooja', 'Riddhi', 'Swati', 'Tejal']
surnames = ['Patel', 'Shah', 'Mehta', 'Desai', 'Joshi', 'Chauhan', 'Solanki', 'Gohil', 'Jadeja', 'Prajapati', 'Thakor', 'Rathod', 'Makwana']
blood_groups = ['O+', 'B+', 'A+', 'AB+', 'O-', 'B-', 'A-']

conn = mysql.connector.connect(host='127.0.0.1', user='root', password='admin', database='bloodlink_db')
cur = conn.cursor()

today = datetime.date(2026, 10, 20)
inserted = 0

for dist in missing_districts:
    clean_dist = dist.lower().replace(" ", "").replace("-", "")
    for i in range(25):
        gender = random.choice(['m', 'f'])
        fn = random.choice(first_names_m if gender == 'm' else first_names_f)
        sn = random.choice(surnames)
        name = f'{fn} {sn}'
        email = f'{fn.lower()}.{sn.lower()}.{clean_dist}{random.randint(100, 999)}@gmail.com'
        phone = f'+91 9{random.randint(100000000, 999999999)}'
        age = random.randint(19, 58)
        weight = round(random.uniform(50.0, 85.0), 1)
        bg = random.choice(blood_groups)
        is_first = 1 if random.random() < 0.3 else 0
        days_ago = random.randint(100, 300)
        last_date = (today - datetime.timedelta(days=days_ago)).isoformat() if is_first == 0 else None
        is_active = 1 if random.random() < 0.92 else 0

        cur.execute('''
            INSERT INTO donors (name, email, phone, age, weight, city, blood_group, last_donated_date, is_first_time, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''', (name, email, phone, age, weight, dist, bg, last_date, is_first, is_active))
        inserted += 1

conn.commit()
print(f'Successfully inserted {inserted} donors across all 7 remaining districts!')
conn.close()
