import mysql.connector
import random
import datetime

conn = mysql.connector.connect(
    host="127.0.0.1",
    user="root",
    password="admin",
    database="bloodlink_db"
)
cur = conn.cursor()

# 1. Add preferred_slot column if not exists
try:
    cur.execute("ALTER TABLE donors ADD COLUMN preferred_slot VARCHAR(20) DEFAULT 'flexible' AFTER last_donated_date")
    conn.commit()
    print("Added 'preferred_slot' column to 'donors' table.")
except mysql.connector.Error as err:
    if "Duplicate column name" in str(err):
        print("'preferred_slot' column already exists.")
    else:
        print("Error adding column:", err)

# 2. Update existing donors with realistic preferred_slot and some recent cooldown dates (<90 days)
cur.execute("SELECT id, is_first_time, last_donated_date FROM donors")
rows = cur.fetchall()

slots_pool = ["flexible"] * 50 + ["morning"] * 20 + ["afternoon"] * 15 + ["evening"] * 15
today = datetime.date(2026, 10, 20)

updated_count = 0
cooldown_count = 0

for row in rows:
    donor_id = row[0]
    is_first = row[1]
    last_date = row[2]

    slot = random.choice(slots_pool)

    # For ~12% of repeat donors (not first-time), set a recent donation date within last 90 days (10 to 80 days ago)
    new_date = last_date
    if is_first == 0 and random.random() < 0.12:
        recent_days = random.randint(10, 80)
        new_date = today - datetime.timedelta(days=recent_days)
        cooldown_count += 1

    cur.execute(
        "UPDATE donors SET preferred_slot = %s, last_donated_date = %s WHERE id = %s",
        (slot, new_date, donor_id)
    )
    updated_count += 1

conn.commit()
print(f"Updated {updated_count} donors with preferred slots.")
print(f"Assigned {cooldown_count} repeat donors to active medical cooldown (< 90 days).")

# 3. Print breakdown
cur.execute("SELECT preferred_slot, COUNT(*) FROM donors GROUP BY preferred_slot")
print("\nPreferred Slot Distribution:")
for s, cnt in cur.fetchall():
    print(f"  {s:12s}: {cnt}")

conn.close()
