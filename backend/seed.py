import sqlite3
from datetime import datetime, timedelta
import random

db_path = 'neerai.db'

def seed_data():
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # Interactions: 44
    # Energy: 2.6781
    # Water: 6427.37
    # Score: 94
    
    interactions = 44
    energy_per_interaction = 2.6781 / interactions
    water_per_interaction = 6427.37 / interactions
    
    sectors = ["Education", "IT & Software", "Government", "Healthcare", "Research"]
    regions = ["North", "South", "East", "West", "Central"]
    providers = ["chatgpt", "gemini", "claude"]
    
    # Check if table exists
    c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'")
    if not c.fetchone():
        print("Database not initialized, please run backend once first.")
        return

    # Delete existing to match exactly
    c.execute("DELETE FROM sessions")
    
    now = datetime.now()
    
    for i in range(interactions):
        timestamp = now - timedelta(hours=random.randint(0, 48), minutes=random.randint(0, 60))
        
        c.execute('''
            INSERT INTO sessions (created_at, provider, task_type, word_count, energy_kwh, water_ml, sector, region, sustainability_score, nudge_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            random.choice(providers),
            "chat",
            random.randint(100, 300),
            energy_per_interaction,
            water_per_interaction,
            random.choice(sectors),
            random.choice(regions),
            94,
            None
        ))
        
    conn.commit()
    conn.close()
    print("Database seeded successfully with 44 interactions.")

if __name__ == '__main__':
    seed_data()
