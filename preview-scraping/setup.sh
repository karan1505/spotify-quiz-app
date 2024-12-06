#!/bin/bash

# Install chromium
apt-get update
apt-get install -y chromium

# Install wget (if it's not already installed)
apt-get install -y wget

# Install ChromeDriver
CHROMEDRIVER_VERSION=114.0.5735.90
wget https://chromedriver.storage.googleapis.com/$CHROMEDRIVER_VERSION/chromedriver_linux64.zip
unzip chromedriver_linux64.zip
mv chromedriver /usr/local/bin/

# Clean up
rm chromedriver_linux64.zip
