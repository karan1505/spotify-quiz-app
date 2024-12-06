#!/bin/bash

# Exit on any error
set -e

echo "Updating and installing system dependencies..."

# Update package list and install Chromium and required libraries
apt-get update && apt-get install -y \
    chromium-browser \
    wget \
    unzip \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils

echo "Chromium and dependencies installed successfully."

# Ensure Chromium is installed
if ! command -v chromium-browser &> /dev/null; then
    echo "Chromium installation failed. Exiting..."
    exit 1
fi

# Check Chromium version
CHROMIUM_VERSION=$(chromium-browser --version | grep -oP '\d+\.\d+\.\d+')
echo "Chromium version: $CHROMIUM_VERSION"

# Determine the compatible ChromeDriver version
CHROMEDRIVER_VERSION=$(curl -s https://chromedriver.storage.googleapis.com/LATEST_RELEASE_$CHROMIUM_VERSION)

if [ -z "$CHROMEDRIVER_VERSION" ]; then
    echo "Failed to fetch the compatible ChromeDriver version. Exiting..."
    exit 1
fi

echo "Downloading ChromeDriver version: $CHROMEDRIVER_VERSION"

# Download and install ChromeDriver
wget https://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip
unzip chromedriver_linux64.zip -d /usr/local/bin/
chmod +x /usr/local/bin/chromedriver
rm chromedriver_linux64.zip

echo "ChromeDriver installed successfully."

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --no-cache-dir --upgrade pip
pip install --no-cache-dir -r requirements.txt

echo "Python dependencies installed successfully."

# Confirm installations
echo "Confirming installations..."
chromium-browser --version
chromedriver --version

echo "Setup complete. Your environment is ready to run the web service."
