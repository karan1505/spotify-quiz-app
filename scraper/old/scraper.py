from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import json
import re
import os
import time
import logging
import psutil
import urllib.parse

# Configure logging
logging.basicConfig(level=logging.INFO)

# FastAPI instance
app = FastAPI()

def log_resource_usage():
    """
    Logs the current process's memory and CPU usage.
    """
    process = psutil.Process(os.getpid())
    logging.info(f"Memory usage: {process.memory_info().rss / 1e6:.2f} MB")
    logging.info(f"CPU usage: {process.cpu_percent(interval=None):.2f}%")

# Utility functions
def sanitize_input(text):
    """
    Sanitize the input string to ensure it's compatible with US English keyboard typing.
    Removes special characters and trims extra spaces.
    """
    sanitized = re.sub(r"[^\w\s]", "", text)  # Remove non-alphanumeric characters except spaces
    sanitized = re.sub(r"\s+", " ", sanitized).strip()  # Replace multiple spaces with a single space
    return sanitized

def get_song_preview(song_name, artist_name=""):
    """
    Scrape Apple Music for a song preview URL.
    """
    log_resource_usage()
    try:
        driver_path = "/usr/bin/chromedriver"
        service = Service(driver_path)

        # Set up Chrome options to run in headless mode
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Run in headless mode
        chrome_options.add_argument("--no-sandbox")  # Required for certain environments like Docker
        chrome_options.add_argument("--disable-dev-shm-usage")  # To overcome some issues in containers
        chrome_options.add_argument("--disable-background-networking")
        chrome_options.add_argument("--disable-default-apps")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--disable-sync")
        chrome_options.add_argument("--no-first-run")
        chrome_options.add_argument("--disable-software-rasterizer")
        chrome_options.add_argument("--single-process")

        # Initialize the WebDriver with the options
        driver = webdriver.Chrome(service=service, options=chrome_options)

        # Encode the query for the URL
        query = song_name.strip()
        if artist_name.strip():
            query += " " + artist_name.strip()
        encoded_query = urllib.parse.quote(query)
        url = f"https://music.apple.com/us/search?term={encoded_query}"
        driver.get(url)

        # Wait for the search results to load
        wait = WebDriverWait(driver, 20)
        top_result = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "top-search-lockup")))

        # Locate the play button's parent element
        play_button_parent = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".top-search-lockup")))

        # Use ActionChains to hover over the parent element
        actions = ActionChains(driver)
        actions.move_to_element(play_button_parent).perform()
        time.sleep(1)  # Allow any hover-triggered animations to complete

        # Locate and click the play button
        play_button = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".interactive-play-button button.play-button"))
        )
        play_button.click()
        time.sleep(2)  # Allow audio element to update

        # Locate the <audio> element and get the src attribute
        audio_element = driver.find_element(By.ID, "apple-music-player")
        audio_src = audio_element.get_attribute("src")

        return audio_src

    except Exception as e:
        logging.error(f"Error in get_song_preview: {e}")
        return None
    finally:
        driver.quit()

@app.post("/fetch_preview_url")
async def fetch_preview_url(request: Request):
    try:
        log_resource_usage()
        body = await request.json()
        song_name = sanitize_input(body["name"])
        artist_name = sanitize_input(body["artist"])
        preview_url = get_song_preview(song_name, artist_name)

        enriched_track = {
            "name": body["name"],
            "artist": body["artist"],
            "album_cover": body["album_cover"],
            "preview_url": preview_url,
            "playlistsIncluded": body["playlistsIncluded"],
        }

        return enriched_track
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing track: {str(e)}")
