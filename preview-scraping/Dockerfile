# Use a lightweight Python 3.11 image
FROM python:3.11-slim

# Install necessary dependencies for Chromium and Selenium
RUN apt-get update && apt-get install -y \
    # Install dependencies for running Chromium in headless mode
    chromium \
    # Install Xvfb to simulate display for headless mode
    xvfb \
    # Install necessary libraries for Selenium
    libglib2.0-0 libnss3 libgdk-pixbuf2.0-0 libx11-xcb1 libxcomposite1 libxrandr2 \
    # Clean up to reduce image size
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set the environment variable for Chromium
ENV CHROMIUM_PATH=/usr/bin/chromium

# Install Python dependencies
COPY requirements.txt /app/requirements.txt
WORKDIR /app
RUN pip install --no-cache-dir -r requirements.txt

# Install the ChromeDriver (matches Chromium version)
RUN wget -q "https://chromedriver.storage.googleapis.com/114.0.5735.90/chromedriver_linux64.zip" -O /tmp/chromedriver.zip \
    && unzip /tmp/chromedriver.zip -d /usr/local/bin/ \
    && rm /tmp/chromedriver.zip

# Expose the port that the app will run on
EXPOSE 8000

# Copy the FastAPI app and related files into the container
COPY . /app

# Command to run FastAPI using Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
