This repository is a Streamlit-based real-time pipeline monitor and anomaly detection demo.
Keep guidance short and actionable so an AI coding assistant can make safe, high-value edits.

What this project is (big picture)
- A Streamlit app (`app.py`) that simulates a 5-stage ETL pipeline: ingestion -> validation -> transformation -> anomaly detection -> storage.
- Anomaly logic lives in `anomaly_detector.py` (IsolationForest + statistical rules). Pipeline instrumentation is in `pipeline_monitor.py`.
- Persistence and schema are defined with SQLAlchemy in `database.py`; CRUD helpers are in `db_operations.py`.

Primary developer workflows
- Local dev (fast): install deps and run the app locally
  - pip install -r FraudGuardStream/requirements.txt
  - streamlit run FraudGuardStream/app.py
- Containerized: Dockerfile is provided and installs requirements from `FraudGuardStream/requirements.txt`. Image runs `python app.py`.
- Database: the app expects `DATABASE_URL` env var (Postgres recommended). If unset, the app may raise at startup when DB functions are invoked.

Project-specific conventions & patterns
- Single-process Streamlit UI coordinates components. State is kept in `st.session_state` (look for keys like `pipeline_running`, `transaction_data`, `processed_data`).
- Use `@st.cache_resource` wrappers for expensive initializations: `initialize_database()` and `get_components()` in `app.py`.
- Data frames flow between modules (generator -> monitor -> detector -> db). Most functions accept/return pandas.DataFrame objects.
- Persistence is optional at runtime (controlled by `st.session_state.persist_to_db`). Many DB helpers assume SQLAlchemy session creation via `database.get_session()`.

Integration points & external dependencies
- Email alerts: `email_notifier.py` reads SMTP config from env vars: `SMTP_SERVER`, `SMTP_PORT`, `ALERT_SENDER_EMAIL`, `ALERT_SENDER_PASSWORD`, `ALERT_RECIPIENTS`.
- DB: `DATABASE_URL` must be set for SQLAlchemy engine (see `database.get_engine()`).
- ML: scikit-learn IsolationForest is used; model state is kept in-memory inside `AnomalyDetector` (no model file persistence).

Quick, safe edit rules for the assistant
- When changing runtime behavior, prefer adding feature flags or new env vars rather than modifying existing defaults.
- For DB schema changes, update `database.py` declarative models and add a migration note in `DEPLOYMENT.md` (no migrations toolkit present).
- Keep Streamlit-only changes idempotent: respect `st.session_state` and do not run long-blocking loops on the main thread.

Concrete examples the assistant can use
- Add a health endpoint: modify `app.py` to provide a `/health` route used by the Dockerfile healthcheck (search for `HEALTHCHECK` in `Dockerfile`).
- Add a CLI runner: create a small `run.py` that sets env vars and runs Streamlit in dev mode, using the same imports as `app.py`.
- Add tests: unit-test `utils.calculate_data_quality_metrics()` and `pipeline_monitor.ProcessBatch()` using small deterministic DataFrames.

Files to read first when working here
- `FraudGuardStream/app.py`, `FraudGuardStream/anomaly_detector.py`, `FraudGuardStream/pipeline_monitor.py`, `FraudGuardStream/database.py`, `FraudGuardStream/db_operations.py`, `FraudGuardStream/data_generator.py`, `FraudGuardStream/utils.py`, `DEPLOYMENT.md`, `Dockerfile`, `FraudGuardStream/requirements.txt`.

If you change anything that affects runtime, update `DEPLOYMENT.md` with new environment variables, required commands, and a short verification step (how to confirm the app starts and the DB initializes).

Ask for clarification when:
- The intended production DB type or migration strategy is unclear. (Assume Postgres if `DATABASE_URL` present.)
- Changes would affect persistent data layout (schema changes, column renames).

End of file — ask for feedback and iterate.