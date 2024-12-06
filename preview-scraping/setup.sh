#!/bin/bash

# Update and install prerequisites
apt-get update && apt-get install -y chromium wget unzip

# Fetch Chromium version
CHROMIUM_VERSION=$(chromium --version | grep -oP '\d+\.\d+\.\d+')

# Determine the compatible ChromeDriver version
CHROMEDRIVER_VERSION=$(curl -s https://chromedriver.storage.googleapis.com/LATEST_RELEASE_$CHROMIUM_VERSION)

# Install ChromeDriver
wget https://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip
unzip chromedriver_linux64.zip -d /usr/local/bin/
chmod +x /usr/local/bin/chromedriver

# Clean up
rm chromedriver_linux64.zip
