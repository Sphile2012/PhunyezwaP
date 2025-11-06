# Use Python 3.11 as base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=80

# Create a non-root user
RUN useradd -m -r appuser && \
    mkdir -p /app && \
    chown appuser:appuser /app

# Set working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl netcat-openbsd && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy project files
COPY . .

# Install Python packages
RUN pip install --no-cache-dir -r FraudGuardStream/requirements.txt

# Change ownership of the app files to appuser
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose the port the app runs on
EXPOSE ${PORT}

# Add healthcheck (probe root - Streamlit serves UI at /)
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/ || exit 1

# Specify the command to run on container start (use Streamlit CLI)
CMD streamlit run FraudGuardStream/app.py --server.port $PORT --server.headless true