CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT NOT NULL,
    task_type TEXT NOT NULL,
    word_count INTEGER NOT NULL,
    energy_kwh REAL NOT NULL,
    water_ml REAL NOT NULL,
    department TEXT,
    hostel TEXT,
    sustainability_score INTEGER,
    nudge_type TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_aggregates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    department TEXT NOT NULL,
    total_sessions INTEGER DEFAULT 0,
    total_energy REAL DEFAULT 0.0,
    total_water REAL DEFAULT 0.0,
    avg_score REAL DEFAULT 100.0,
    UNIQUE(date, department)
);

CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_dept ON sessions(department);
CREATE INDEX IF NOT EXISTS idx_sessions_hostel ON sessions(hostel);
