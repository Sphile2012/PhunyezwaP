# FraudGuardStream

A real-time transaction monitoring system with anomaly detection, built with Streamlit.

## Quick Start

### Run Locally
```bash
# Install dependencies
pip install -r requirements.txt

# Run the app
python run.py
```

Visit http://localhost:8501 in your browser.

### Deploy to Streamlit Cloud

1. Visit https://share.streamlit.io
2. Sign in with GitHub
3. Click "New app"
4. Select this repository
5. Set:
   - Repository: wushwekaz/FraudGuardStream
   - Branch: streamlit-deploy
   - Main file path: FraudGuardStream/app.py
6. Click "Deploy"

3. Open the app in your browser:
   - Local URL: http://localhost:8501
   - Network URL will be shown in the terminal

## Environment Variables

- `DATABASE_URL` - Database connection string (default: SQLite)
- `PORT` - Port to run Streamlit server (default: 8501)
- `SMTP_*` - Email notification settings (optional)

## Development

The app is structured as a multi-stage ETL pipeline:
- Ingestion (data generation)
- Validation (data quality checks)
- Transformation (feature engineering)
- Anomaly Detection (ML-based)
- Storage (SQLAlchemy ORM)

Key files:
- `FraudGuardStream/app.py` - Main Streamlit application
- `FraudGuardStream/anomaly_detector.py` - ML-based anomaly detection
- `FraudGuardStream/pipeline_monitor.py` - Pipeline instrumentation
- `FraudGuardStream/database.py` - Database models and connection
- `FraudGuardStream/db_operations.py` - Database CRUD operations

## Deployment

See [DEPLOYMENT.md](FraudGuardStream/DEPLOYMENT.md) for detailed deployment instructions for:
- Streamlit Cloud (recommended)
- Docker
- Render
- Heroku