# Real-Time Data Pipeline Monitor

A Streamlit-based real-time pipeline monitor and anomaly detection demo.

## Quick Start

1. Install Python dependencies:
   ```bash
   pip install -r FraudGuardStream/requirements.txt
   ```

2. Run the app:
   ```bash
   python run.py
   ```

   Or run directly with Streamlit:
   ```bash
   streamlit run FraudGuardStream/app.py
   ```

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