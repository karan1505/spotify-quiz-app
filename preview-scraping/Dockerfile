FROM python:3.10-slim

# Install Chromium and ChromeDriver
RUN apt-get update && apt-get install -y \
    chromium chromium-driver wget unzip fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for Chromium
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port for FastAPI
EXPOSE 8000

# Command to run the FastAPI service
CMD ["gunicorn", "scraper_service:app", "--workers", "4", "--bind", "0.0.0.0:8000", "-k", "uvicorn.workers.UvicornWorker"]
