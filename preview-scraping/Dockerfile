# Use the official Python 3.11 slim image as the base image for a lightweight container
FROM python:3.11-slim

# Set environment variables to ensure non-interactive installation
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies required for Playwright and FastAPI
RUN apt-get update \
    && apt-get install -y \
        libx11-xcb1 \
        libxtst6 \
        libnss3 \
        libatk-bridge2.0-0 \
        libatk1.0-0 \
        libcups2 \
        libxcomposite1 \
        libxrandr2 \
        libxss1 \
        libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/requirements.txt
WORKDIR /app
RUN pip install --no-cache-dir -r requirements.txt

# Copy the FastAPI application code into the container
COPY . /app

# Expose the FastAPI port
EXPOSE 8000

# Command to run the FastAPI application
CMD ["uvicorn", "scraper:app", "--host", "0.0.0.0", "--port", "8000"]
