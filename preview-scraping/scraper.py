'''
from fastapi import FastAPI, HTTPException
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
import urllib.parse

# FastAPI instance
app = FastAPI()

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
    try:
        driver_path = "/usr/bin/chromedriver"
        service = Service(driver_path)

        # Set up Chrome options to run in headless mode
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Run in headless mode
        chrome_options.add_argument("--no-sandbox")  # Required for certain environments like Docker or Render
        chrome_options.add_argument("--disable-dev-shm-usage")  # To overcome some issues in containers

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
        return None
    finally:
        driver.quit()

def fetch_preview_url_with_retries(song_name, artist_name, retries=2):
    """
    Try fetching the preview URL with the original and fallback strategies.
    Retries the process twice before setting URL to None.
    """
    for attempt in range(retries + 1):
        query_name = f"{song_name} by {artist_name}" if attempt == 0 else song_name
        preview_url = get_song_preview(song_name, artist_name if attempt == 0 else "")
        if preview_url:
            return preview_url
    return None

def update_playlist_with_previews(input_file, output_file):
    """
    Update a playlist JSON file with preview URLs.
    """
    try:
        with open(input_file, "r") as file:
            playlist_tracks = json.load(file)

        updated_tracks = []
        for track in playlist_tracks:
            song_name = sanitize_input(track.get("name", ""))
            artist_name = sanitize_input(track.get("artist", ""))
            preview_url = fetch_preview_url_with_retries(song_name, artist_name)
            track["preview_url"] = preview_url
            updated_tracks.append(track)

        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, "w", encoding="utf-8") as file:
            json.dump(updated_tracks, file, ensure_ascii=False, indent=4)

    except Exception as e:
        print(f"An error occurred: {e}")

# API Models
class TrackRequest(BaseModel):
    name: str
    artist: str
    playlistsIncluded: str  # Assuming this is already a comma-separated string
    album_cover: str        # Added the album_cover field

class TracksRequest(BaseModel):
    tracks: list[TrackRequest]

# API Endpoint
@app.post("/fetch_preview_urls")
async def fetch_preview_urls(request: TracksRequest):
    try:
        enriched_tracks = []
        for track in request.tracks:
            song_name = sanitize_input(track.name)
            artist_name = sanitize_input(track.artist)
            preview_url = fetch_preview_url_with_retries(song_name, artist_name)
            enriched_tracks.append({
                "name": track.name,
                "artist": track.artist,
                "album_cover": track.album_cover,
                "preview_url": preview_url,
                "playlistsIncluded": track.playlistsIncluded,
            })
        return {"tracks": enriched_tracks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing tracks: {str(e)}")

'''

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from fastapi.concurrency import run_in_threadpool
import json
import re
import os
import time
import urllib.parse

# FastAPI instance
app = FastAPI()

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
    try:
        driver_path = "/usr/bin/chromedriver"
        service = Service(driver_path)

        # Set up Chrome options to run in headless mode
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Run in headless mode
        chrome_options.add_argument("--no-sandbox")  # Required for certain environments like Docker or Render
        chrome_options.add_argument("--disable-dev-shm-usage")  # To overcome some issues in containers

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
        return None
    finally:
        driver.quit()

def fetch_preview_url_with_retries(song_name, artist_name, retries=2):
    """
    Try fetching the preview URL with the original and fallback strategies.
    Retries the process twice before setting URL to None.
    """
    for attempt in range(retries + 1):
        query_name = f"{song_name} by {artist_name}" if attempt == 0 else song_name
        preview_url = get_song_preview(song_name, artist_name if attempt == 0 else "")
        if preview_url:
            return preview_url
    return None

def update_playlist_with_previews(input_file, output_file):
    """
    Update a playlist JSON file with preview URLs.
    """
    try:
        with open(input_file, "r") as file:
            playlist_tracks = json.load(file)

        updated_tracks = []
        for track in playlist_tracks:
            song_name = sanitize_input(track.get("name", ""))
            artist_name = sanitize_input(track.get("artist", ""))
            preview_url = fetch_preview_url_with_retries(song_name, artist_name)
            track["preview_url"] = preview_url
            updated_tracks.append(track)

        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, "w", encoding="utf-8") as file:
            json.dump(updated_tracks, file, ensure_ascii=False, indent=4)

    except Exception as e:
        print(f"An error occurred: {e}")

# API Models
class TrackRequest(BaseModel):
    name: str
    artist: str
    playlistsIncluded: str  # Assuming this is already a comma-separated string
    album_cover: str        # Added the album_cover field

class TracksRequest(BaseModel):
    tracks: list[TrackRequest]



@app.post("/fetch_preview_urls")
async def fetch_preview_urls(request: TracksRequest):
    try:
        def process_tracks_sync():
            enriched_tracks = []
            for track in request.tracks:
                song_name = sanitize_input(track.name)
                artist_name = sanitize_input(track.artist)
                preview_url = fetch_preview_url_with_retries(song_name, artist_name)
                enriched_tracks.append({
                    "name": track.name,
                    "artist": track.artist,
                    "album_cover": track.album_cover,
                    "preview_url": preview_url,
                    "playlistsIncluded": track.playlistsIncluded,
                })
            return {"tracks": enriched_tracks}

        # Run the long-running task in a thread pool
        result = await run_in_threadpool(process_tracks_sync)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing tracks: {str(e)}")