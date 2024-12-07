FROM python:3.10-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    chromium chromium-driver wget unzip fonts-liberation \
    libnss3 libnspr4 libx11-xcb1 libgbm-dev libxcomposite-dev \
    libxrandr2 libxi6 libatk1.0-0 libpangocairo-1.0-0 \
    libgtk-3-0 libasound2 libxdamage1 libxcursor1 \
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
EXPOSE 8001

# Command to run the FastAPI service
CMD ["gunicorn", "scraper:app", "--workers", "2", "--bind", "0.0.0.0:8001", "-k", "uvicorn.workers.UvicornWorker", "--timeout", "120"]
