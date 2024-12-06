from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import asyncio
import json
import re
import os
import urllib.parse
from concurrent.futures import ThreadPoolExecutor

# FastAPI instance
app = FastAPI()

# Utility functions
def sanitize_input(text: str) -> str:
    """
    Sanitize the input string to ensure it's compatible with US English keyboard typing.
    """
    sanitized = re.sub(r"[^\w\s]", "", text)  # Remove non-alphanumeric characters except spaces
    sanitized = re.sub(r"\s+", " ", sanitized).strip()  # Replace multiple spaces with a single space
    return sanitized

def initialize_driver() -> webdriver.Chrome:
    """
    Initializes a headless Chrome WebDriver with minimal resource usage.
    """
    driver_path = "/usr/bin/chromedriver"
    service = Service(driver_path)

    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-logging")
    
    return webdriver.Chrome(service=service, options=chrome_options)

def fetch_song_preview(song_name: str, artist_name: str = "") -> str:
    """
    Scrape Apple Music for a song preview URL.
    """
    try:
        driver = initialize_driver()
        query = f"{song_name} {artist_name}".strip()
        encoded_query = urllib.parse.quote(query)
        url = f"https://music.apple.com/us/search?term={encoded_query}"

        driver.get(url)
        wait = WebDriverWait(driver, 10)
        top_result = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "top-search-lockup")))

        play_button_parent = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".top-search-lockup")))
        play_button = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".interactive-play-button button.play-button"))
        )
        play_button.click()
        wait.until(EC.presence_of_element_located((By.ID, "apple-music-player")))
        audio_element = driver.find_element(By.ID, "apple-music-player")
        return audio_element.get_attribute("src")
    except Exception:
        return None
    finally:
        driver.quit()

async def fetch_preview_url(song_name: str, artist_name: str, retries: int = 2) -> str:
    """
    Async wrapper for fetching preview URLs with retry logic.
    """
    with ThreadPoolExecutor() as executor:
        for attempt in range(retries + 1):
            preview_url = await asyncio.get_event_loop().run_in_executor(
                executor, fetch_song_preview, song_name, artist_name
            )
            if preview_url:
                return preview_url
    return None

# API Models
class TrackRequest(BaseModel):
    name: str
    artist: str
    playlistsIncluded: str
    album_cover: str

class TracksRequest(BaseModel):
    tracks: list[TrackRequest]

# API Endpoint
@app.post("/fetch_preview_urls")
async def fetch_preview_urls(request: TracksRequest):
    try:
        tasks = []
        for track in request.tracks:
            sanitized_name = sanitize_input(track.name)
            sanitized_artist = sanitize_input(track.artist)
            tasks.append(fetch_preview_url(sanitized_name, sanitized_artist))

        preview_urls = await asyncio.gather(*tasks)
        enriched_tracks = [
            {
                "name": track.name,
                "artist": track.artist,
                "album_cover": track.album_cover,
                "preview_url": preview_urls[i],
                "playlistsIncluded": track.playlistsIncluded,
            }
            for i, track in enumerate(request.tracks)
        ]
        return {"tracks": enriched_tracks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing tracks: {str(e)}")
