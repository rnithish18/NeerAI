import sqlite3
import os
import random
from datetime import datetime, timedelta
from contextlib import contextmanager
import csv
import io

DB_PATH = os.path.join(os.path.dirname(__file__), "neerai.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")

class DatabaseManager:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        
    @contextmanager
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()
            
    def init_db(self):
        if not os.path.exists(SCHEMA_PATH):
            raise FileNotFoundError("schema.sql not found")
        with open(SCHEMA_PATH, 'r') as f:
            schema_script = f.read()
            
        with self.get_connection() as conn:
            conn.executescript(schema_script)
            conn.commit()
            
    def log_session(self, data):
        query = '''
            INSERT INTO sessions 
            (provider, task_type, word_count, energy_kwh, water_ml, sector, region, sustainability_score, nudge_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        '''
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (
                data.get('provider', 'unknown'),
                data.get('task_type', 'chat'),
                data.get('word_count', 0),
                data.get('energy_kwh', 0.0),
                data.get('water_ml', 0.0),
                data.get('sector'),
                data.get('region'),
                data.get('sustainability_score', 100),
                data.get('nudge_type')
            ))
            conn.commit()
            return cursor.lastrowid
            
    def get_dashboard_summary(self, days=7):
        query = '''
            SELECT 
                COUNT(id) as total_sessions,
                SUM(energy_kwh) as total_energy,
                SUM(water_ml) as total_water,
                AVG(sustainability_score) as avg_score
            FROM sessions
            WHERE created_at >= date('now', ?)
        '''
        with self.get_connection() as conn:
            row = conn.execute(query, (f'-{days} days',)).fetchone()
            return {
                "total_sessions": row['total_sessions'] or 0,
                "total_energy": row['total_energy'] or 0.0,
                "total_water": row['total_water'] or 0.0,
                "avg_score": row['avg_score'] or 100.0
            }
            
    def get_daily_trends(self, days=30):
        query = '''
            SELECT 
                date(created_at) as session_date,
                SUM(energy_kwh) as daily_energy,
                SUM(water_ml) as daily_water
            FROM sessions
            WHERE created_at >= date('now', ?)
            GROUP BY date(created_at)
            ORDER BY session_date ASC
        '''
        with self.get_connection() as conn:
            rows = conn.execute(query, (f'-{days} days',)).fetchall()
            return [dict(row) for row in rows]
            
    def get_sector_stats(self):
        query = '''
            SELECT 
                sector,
                SUM(energy_kwh) as total_energy,
                SUM(water_ml) as total_water,
                AVG(sustainability_score) as avg_score,
                COUNT(id) as session_count
            FROM sessions
            WHERE sector IS NOT NULL
            GROUP BY sector
            ORDER BY total_water DESC
        '''
        with self.get_connection() as conn:
            rows = conn.execute(query).fetchall()
            return [dict(row) for row in rows]
            
    def get_region_stats(self):
        query = '''
            SELECT 
                region,
                SUM(energy_kwh) as total_energy,
                SUM(water_ml) as total_water,
                AVG(sustainability_score) as avg_score
            FROM sessions
            WHERE region IS NOT NULL
            GROUP BY region
            ORDER BY total_water DESC
        '''
        with self.get_connection() as conn:
            rows = conn.execute(query).fetchall()
            return [dict(row) for row in rows]

    def generate_demo_data(self):
        from config import USAGE_SECTORS, REGIONS_INDIA
        with self.get_connection() as conn:
            cursor = conn.cursor()
            for i in range(30):
                date_val = datetime.now() - timedelta(days=29-i)
                date_str = date_val.strftime('%Y-%m-%d %H:%M:%S')
                
                # generate random sessions
                num_sessions = random.randint(10, 50)
                for _ in range(num_sessions):
                    sector_val = random.choice(USAGE_SECTORS)
                    region_val = random.choice(REGIONS_INDIA)
                    task = random.choice(["chat", "code", "image"])
                    words = random.randint(10, 1000)
                    
                    from estimator import estimate_footprint, calculate_sustainability_score
                    footprint = estimate_footprint(words, task, "india")
                    
                    score = calculate_sustainability_score({"word_count": words, "task_type": task})
                    
                    cursor.execute('''
                        INSERT INTO sessions 
                        (provider, task_type, word_count, energy_kwh, water_ml, sector, region, sustainability_score, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', ("demo", task, words, footprint['energy_kwh'], footprint['water_ml'], sector_val, region_val, score, date_str))
            conn.commit()

    def clear_demo_data(self):
        with self.get_connection() as conn:
            conn.execute("DELETE FROM sessions")
            conn.commit()
            
    def export_csv(self):
        with self.get_connection() as conn:
            rows = conn.execute("SELECT * FROM sessions ORDER BY created_at DESC").fetchall()
            if not rows:
                return "id,provider,task_type,word_count,energy_kwh,water_ml,sector,region,sustainability_score,nudge_type,created_at\n"
                
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(rows[0].keys())
            for row in rows:
                writer.writerow(row)
            return output.getvalue()
