# Use a lightweight base image with Python 3.10
FROM python:3.10-slim-buster

# Set environment variables for Chromium
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

# Install necessary system packages and dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium chromium-driver fonts-liberation \
    libnss3 libnspr4 libx11-xcb1 libgbm1 libxcomposite1 \
    libxrandr2 libxi6 libatk1.0-0 libpangocairo-1.0-0 \
    libgtk-3-0 libasound2 libxdamage1 libxcursor1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy Python dependencies file and install them
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code to the working directory
COPY . .

# Expose the application's port
EXPOSE 8001

# Run the application with Gunicorn
# CMD ["gunicorn", "scraper:app", "--workers", "1", "--threads", "2", "--bind", "0.0.0.0:8001", "-k", "uvicorn.workers.UvicornWorker", "--timeout", "120"] 
# Use the PORT environment variable (Cloud Run's default is 8080)
CMD ["gunicorn", "scraper:app", "--workers", "1", "--threads", "2", "--bind", "0.0.0.0:${PORT}", "-k", "uvicorn.workers.UvicornWorker", "--timeout", "120"]
