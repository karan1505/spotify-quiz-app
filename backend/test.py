from selenium import webdriver
from selenium.webdriver.chrome.service import Service

# Replace 'path/to/chromedriver' with the actual path to your ChromeDriver binary
driver_path = "/usr/bin/chromedriver"
service = Service(driver_path)

driver = webdriver.Chrome(service=service)
driver.get("https://www.google.com")
print(driver.title)
driver.quit()
