from fastapi import FastAPI, HTTPException, Request
from playwright.async_api import async_playwright  # Async Playwright
import re
import os
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

async def get_song_preview(song_name, artist_name=""):
    """
    Scrape Apple Music for a song preview URL using Playwright's async API.
    """
    log_resource_usage()
    try:
        async with async_playwright() as p:
            logging.info("Launching browser...")
            browser = await p.chromium.launch(headless=True)
            logging.info("Browser launched successfully.")

            context = await browser.new_context()
            page = await context.new_page()

            # Encode the query for the URL
            query = song_name.strip()
            if artist_name.strip():
                query += " " + artist_name.strip()
            encoded_query = urllib.parse.quote(query)
            url = f"https://music.apple.com/us/search?term={encoded_query}"

            logging.info(f"Navigating to search URL: {url}")
            await page.goto(url, timeout=30000)  # 30-second timeout for navigation
            logging.info("Page navigation successful.")

            # Wait before searching for the selector
            logging.info("Waiting for '.top-search-lockup' selector to appear...")
            await page.wait_for_selector(".top-search-lockup", timeout=15000)
            logging.info("Selector '.top-search-lockup' found.")

            # Hover over the top search result
            logging.info("Hovering over the top search result...")
            play_button = page.locator(".top-search-lockup").nth(0)
            await play_button.hover()
            logging.info("Hovered over the top search result.")

            # Wait before attempting to click the play button
            logging.info("Attempting to click the play button...")
            await page.wait_for_timeout(2000)  # Wait 2 seconds before clicking
            button = play_button.locator("button.play-button")
            await button.click()
            logging.info("Play button clicked.")

            # Wait for the audio player to load
            logging.info("Waiting for the audio player to load...")
            audio_player = page.locator("#apple-music-player")
            await audio_player.wait_for(state="attached", timeout=10000)
            logging.info("Audio player loaded.")

            # Extra debugging steps
            logging.info("Retrieving and logging audio player HTML and attributes...")
            audio_player_html = await audio_player.inner_html()
            logging.info(f"Audio player HTML: {audio_player_html}")

            audio_attributes = await audio_player.evaluate("el => Object.fromEntries([...el.attributes].map(attr => [attr.name, attr.value]))")
            logging.info(f"Audio player attributes: {audio_attributes}")

            logging.info("Waiting for audio source to populate...")
            await page.wait_for_timeout(3000)

            # Attempt to retrieve the `src` attribute
            audio_src = await audio_player.evaluate("el => el.getAttribute('src')")
            if audio_src:
                logging.info(f"Retrieved preview URL: {audio_src}")
            else:
                logging.warning("Audio source URL is None. Investigating further...")

            # Log network requests to see if the audio URL is fetched dynamically
            page.on("request", lambda request: logging.info(f"Request made: {request.url}"))
            page.on("response", lambda response: logging.info(f"Response received: {response.url}"))

            # Close the browser
            await browser.close()
            logging.info("Browser closed successfully.")

            return audio_src

    except Exception as e:
        logging.error(f"Error in get_song_preview: {e}")
        return None

@app.post("/fetch_preview_url")
async def fetch_preview_url(request: Request):
    """
    API endpoint to fetch the song preview URL.
    """
    try:
        log_resource_usage()
        body = await request.json()
        song_name = sanitize_input(body["name"])
        artist_name = sanitize_input(body["artist"])
        preview_url = await get_song_preview(song_name, artist_name)

        # Enrich response with additional metadata
        enriched_track = {
            "name": body["name"],
            "artist": body["artist"],
            "album_cover": body["album_cover"],
            "preview_url": preview_url,
            "playlistsIncluded": body["playlistsIncluded"],
        }

        return enriched_track
    except Exception as e:
        logging.error(f"Error processing track: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing track: {str(e)}")
