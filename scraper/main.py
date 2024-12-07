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
    Scrape Apple Music for a song preview URL using Playwright's async API with detailed logging.
    """
    log_resource_usage()  # Log resource usage before starting the function
    logging.info("Starting 'get_song_preview' function.")
    try:
        async with async_playwright() as p:
            logging.info("Launching browser...")
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            logging.info("Browser launched successfully.")

            # Encode the query for the URL
            query = song_name.strip()
            if artist_name.strip():
                query += f" {artist_name.strip()}"
            encoded_query = urllib.parse.quote(query)
            url = f"https://music.apple.com/us/search?term={encoded_query}"

            logging.info(f"Navigating to search URL: {url}")
            try:
                await page.goto(url, timeout=30000)
                logging.info("Page navigation successful.")
            except Exception as e:
                logging.error(f"Failed to navigate to the page: {e}")
                await browser.close()
                return None

            # Check page content
            page_content = await page.content()
            logging.debug(f"Page content (truncated): {page_content[:500]}")  # Log first 500 characters of page content

            # Wait for the top result to load
            try:
                logging.info("Waiting for '.top-search-lockup' selector to appear...")
                await page.wait_for_selector(".top-search-lockup", timeout=15000)
                logging.info("Selector '.top-search-lockup' found.")
            except Exception as e:
                logging.error(f"Selector '.top-search-lockup' not found: {e}")
                await browser.close()
                return None

            # Hover over the top result element
            try:
                logging.info("Hovering over the top search result...")
                play_button = page.locator(".top-search-lockup").nth(0)
                await play_button.hover()
                logging.info("Hovered over the top search result.")
            except Exception as e:
                logging.error(f"Failed to hover over the search result: {e}")
                await browser.close()
                return None

            # Click the play button
            try:
                logging.info("Attempting to click the play button...")
                button = play_button.locator("button.play-button")
                await button.click()
                logging.info("Play button clicked.")
            except Exception as e:
                logging.error(f"Failed to click the play button: {e}")
                await browser.close()
                return None

            # Wait for the audio element to appear in the DOM
            try:
                logging.info("Waiting for the audio player to load...")
                audio_player = page.locator("#apple-music-player")
                await audio_player.wait_for(state="attached", timeout=10000)
                logging.info("Audio player loaded.")
            except Exception as e:
                logging.error(f"Audio player did not load: {e}")
                await browser.close()
                return None

            # Retrieve the `src` attribute directly
            try:
                logging.info("Retrieving the audio source URL...")
                audio_src = await audio_player.evaluate("el => el.getAttribute('src')")
                if audio_src:
                    logging.info(f"Audio source URL retrieved: {audio_src}")
                else:
                    logging.warning("Audio source URL is None.")
            except Exception as e:
                logging.error(f"Failed to retrieve the audio source URL: {e}")
                audio_src = None

            await browser.close()
            logging.info("Browser closed successfully.")
            return audio_src

    except Exception as e:
        logging.error(f"An unexpected error occurred in 'get_song_preview': {e}")
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
