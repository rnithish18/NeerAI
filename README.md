# 🌊 NeerAI — The Sustainability Layer for AI

> **Think Smarter. Use AI Wisely. Save Water.**

NeerAI makes the invisible environmental footprint of AI visible and actionable. It estimates the water and energy footprint of AI interactions and provides behavioral nudges to optimize AI usage.

---

## 🎯 What is NeerAI?

Every AI interaction requires computation, electricity, and cooling. Depending on the data center, cooling technology, location, and electricity source, AI workloads have an associated water footprint that users cannot see.

NeerAI introduces an **AI Sustainability Layer** that helps users answer:
> *"Did I really need this much AI computation?"*

**NeerAI is NOT an anti-AI product.** The philosophy is:
> Don't stop AI. Use the right amount of AI.

**MEASURE → UNDERSTAND → OPTIMIZE → REDUCE**

---

## 🏗️ Architecture — Three Connected Layers

### Layer 1: Browser Extension (Chrome MV3)
- Detects AI responses on **ChatGPT**, **Gemini**, and **Claude**
- Estimates energy and water footprint locally
- Provides behavioral nudges (duplicate detection, regeneration warnings)
- Works offline — no backend required for core estimation

### Layer 2: Institutional Dashboard (React + Vite)
- Premium command center for colleges, companies, government
- Aggregated sustainability analytics by department and hostel
- Interactive charts and data visualization
- Demo mode with synthetic data for presentations

### Layer 3: Nudge Engine (Deterministic Rules)
- Detects simple tasks, duplicates, excessive regeneration, and long outputs
- Returns structured optimization recommendations
- No ML model — pure deterministic rules

---

## 📁 Project Structure

```
neerai/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── estimator.py          # Energy & water estimation
│   ├── nudge_engine.py       # Behavioral intelligence
│   ├── database.py           # SQLite manager
│   ├── config.py             # All configurable constants
│   ├── schema.sql            # Database schema
│   ├── requirements.txt      # Python dependencies
│   └── tests/                # pytest suite
│       ├── test_estimator.py
│       ├── test_nudge_engine.py
│       └── test_api.py
│
├── extension/
│   ├── manifest.json         # Chrome Manifest V3
│   ├── content.js            # AI response detection engine
│   ├── popup.html            # Extension popup
│   ├── popup.js              # Popup logic
│   ├── popup.css             # Premium dark-mode styling
│   └── icons/                # SVG icons
│
├── dashboard/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx           # React Router setup
│       ├── main.jsx          # Entry point
│       ├── api.js            # Backend API integration
│       ├── data/
│       │   └── demoData.js   # Client-side demo data
│       ├── components/
│       │   ├── Hero.jsx
│       │   ├── Layout.jsx
│       │   ├── FootprintCard.jsx
│       │   ├── StatsGrid.jsx
│       │   ├── SustainabilityScore.jsx
│       │   ├── WaterRipple.jsx
│       │   ├── IndiaContext.jsx
│       │   ├── DemoModeBanner.jsx
│       │   └── charts/
│       │       ├── DailyWaterChart.jsx
│       │       ├── DepartmentChart.jsx
│       │       ├── OptimizationChart.jsx
│       │       └── TaskDistributionChart.jsx
│       ├── pages/
│       │   ├── Overview.jsx
│       │   ├── WaterImpact.jsx
│       │   ├── Energy.jsx
│       │   ├── Departments.jsx
│       │   ├── Hostels.jsx
│       │   ├── Optimization.jsx
│       │   ├── Methodology.jsx
│       │   └── Privacy.jsx
│       └── styles/
│           ├── variables.css
│           └── global.css
│
├── .gitignore
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- Google Chrome (for extension)

### 1. Backend

```bash
cd neerai/backend
pip install -r requirements.txt
```

### 2. Dashboard

```bash
cd neerai/dashboard
npm install
```

### 3. Extension
No installation needed — loaded directly into Chrome.

---

## ▶️ Deployment Options (Hybrid Architecture)

For an SIH-style demo, NeerAI uses a **hybrid deployment** to maintain its zero-cost, privacy-first architecture while still being easily presentable to judges.

### Option 1: Hosted Demo (Quick Look)
The dashboard can be deployed to any free static host (Vercel, Netlify, GitHub Pages) without needing a backend.
1. Run `npm run build` in the `dashboard` directory.
2. Deploy the `dist` folder to your static host.
3. The live dashboard will automatically run in **Demo Mode**, populated with synthetic data clearly labeled with a "Demo Mode Active" badge. No real backend is required.

### Option 2: Full Local Demo (Live Extension Sync)
For the full experience showing the browser extension communicating live with the dashboard, run everything locally.
This ensures no API keys or cloud databases are needed, preserving absolute user privacy.

**One-Command Start:**
Just run `start.bat` (Windows) or `start.sh` (Mac/Linux) in the root directory. This will start both the backend and frontend simultaneously.

**Manual Start:**
1. Start the Backend: `cd backend && uvicorn main:app --reload` (Runs on http://localhost:8000)
2. Start the Dashboard: `cd dashboard && npm run dev` (Runs on http://localhost:5173)

### Load the Extension
1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `neerai/extension/` folder
5. Visit ChatGPT, Gemini, or Claude to see live real-data synchronization.

---

## 🧪 Running Tests

```bash
cd neerai/backend
python -m pytest tests/ -v
```

Tests cover:
- **Estimator**: 0/100/500/1000 words, chat/code/image, India/global regions
- **Nudge Engine**: Simple task, duplicate, regeneration, excessive output detection
- **API**: All endpoints including health, estimate, log, dashboard, methodology, export, demo

---

## 🎮 Demo Mode

For presentations and SIH judging:

1. Start the backend: `uvicorn main:app --reload`
2. Generate demo data: `POST http://localhost:8000/demo/generate`
3. Open dashboard: `npm run dev` → http://localhost:5173
4. All demo data is clearly labeled as **"Demonstration Data"**

To clear: `POST http://localhost:8000/demo/clear`

---

## 🔬 Scientific Methodology

### Formula

```
Energy (kWh) = (output_word_count / 100) × energy_per_100_words
Water (litres) = Energy × (WUE_onsite + PUE × EWIF_offsite)
Water (mL) = Water (litres) × 1000
```

### Default Parameters

| Parameter | Value | Unit | Description |
|-----------|-------|------|-------------|
| WUE_ONSITE | 1.0 | L/kWh | On-site water usage effectiveness |
| PUE | 1.3 | ratio | Power usage effectiveness |
| EWIF_OFFSITE | 3.4 | L/kWh | Off-site electricity water intensity |
| Chat energy | 0.002 | kWh/100 words | General conversation |
| Code energy | 0.015 | kWh/100 words | Code generation |
| Image energy | 0.05 | kWh/100 words | Image generation |

### Reference

Li et al., 2023 — *"Making AI Less 'Thirsty': Uncovering and Addressing the Secret Water Footprint of AI Models"*
[https://arxiv.org/abs/2304.03271](https://arxiv.org/abs/2304.03271)

### ⚠️ Important Disclaimers

- All values are **estimates**, never measurements
- NeerAI does **NOT** physically measure data-center water consumption
- Published values are treated as **configurable benchmarks**, not universal constants
- Real footprints vary by data center, season, cooling technology, and many other factors

---

## 🔒 Privacy-First Architecture

```
AI Website → Extension (local) → Word count only → Backend → SQLite
```

**What is stored:** Session count, word count, estimated energy, estimated water, task type, provider, department, date

**What is NEVER stored:** Raw prompts, full AI responses, conversation history, personal data

---

## 🇮🇳 India-First Context

- Default region: India (grid carbon intensity: 700 gCO2eq/kWh)
- Default institution: V.S.B. Engineering College
- Departments: CSE, ECE, EEE, Mechanical, Civil
- Footprint comparison to 500 mL reference bottle
- Chennai water context (educational/historical reference)

---

## 🏆 SIH Innovation Points

1. **First-of-kind AI Sustainability Layer** — browser-level environmental feedback
2. **Privacy-first estimation** — no raw data leaves the user's device
3. **Behavioral nudge engine** — deterministic, no ML required
4. **Institutional dashboard** — campus-wide AI sustainability monitoring
5. **India-specific context** — localized benchmarks and comparisons
6. **Zero-cost architecture** — runs entirely locally, no paid APIs

---

## 💡 SIH Judge Q&A

**Q: How do you calculate water?**
A: Using a documented estimation model based on Li et al., 2023. Energy is estimated from output word count, then converted to water using WUE, PUE, and EWIF parameters.

**Q: Is this exact?**
A: No. All values are estimates based on configurable assumptions. Real footprints depend on data center infrastructure that isn't publicly exposed.

**Q: Why doesn't Google/OpenAI provide this?**
A: Per-query infrastructure data is generally not exposed to ordinary users. NeerAI fills this visibility gap with estimation.

**Q: Why not simply use less AI?**
A: NeerAI doesn't discourage AI. The goal is: right task → right amount of computation.

**Q: What is innovative?**
A: The combination of individual extension + environmental estimation + behavioral nudges + institutional dashboard + India-specific context + privacy-first architecture.

---

## 🗺️ Future Roadmap

| Version | Feature |
|---------|---------|
| V2 | Real infrastructure telemetry integration |
| V3 | Indian regional WUE database |
| V4 | Model efficiency benchmarking |
| V5 | Enterprise deployment |
| V6 | Renewable-energy-aware estimation |
| V7 | Government sustainability reporting |
| V8 | Privacy-preserving institutional analytics |

---

## ⚖️ Zero-Cost Guarantee

This entire MVP costs **₹0**. No paid APIs, no cloud databases, no subscriptions, no API keys required.

| Component | Technology | Cost |
|-----------|------------|------|
| Backend | Python FastAPI + Uvicorn | ₹0 |
| Database | SQLite | ₹0 |
| Dashboard | React + Vite | ₹0 |
| Extension | Chrome Manifest V3 | ₹0 |
| Charts | Recharts | ₹0 |
| AI/ML | None (deterministic rules) | ₹0 |

---

## 📜 License

Built for Smart India Hackathon (SIH).

---

*NeerAI — AI is changing the world. Can we make AI growth sustainable?*
*Measure. Understand. Optimize. Reduce.*
