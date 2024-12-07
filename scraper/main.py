from fastapi import FastAPI, HTTPException, Request
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError
import re
import os
import logging
import psutil
import urllib.parse
import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

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

async def get_song_preview(song_name, artist_name="", max_retries=3):
    """
    Scrape Apple Music for a song preview URL using Playwright's async API.
    """
    log_resource_usage()
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()

            # Encode the query for the URL
            query = song_name.strip()
            if artist_name.strip():
                query += " " + artist_name.strip()
            encoded_query = urllib.parse.quote(query)
            url = f"https://music.apple.com/us/search?term={encoded_query}"

            logging.info(f"Navigating to search URL: {url}")

            for attempt in range(max_retries):
                try:
                    # Navigate to the page and wait for network idle
                    await page.goto(url, timeout=60000)
                    await page.wait_for_load_state("networkidle")

                    # Check if the search results container is available
                    if not await page.locator(".top-search-lockup").first.is_visible():
                        logging.warning("Top search lockup element is not visible.")
                        continue

                    logging.info("Search results loaded. Locating top result.")

                    # Get the top search result element
                    play_button = page.locator(".top-search-lockup").nth(0)
                    if not await play_button.is_visible():
                        logging.warning("Top result element is not visible.")
                        continue

                    # Hover over the top result element to reveal play button
                    await play_button.hover()

                    # Ensure the play button is available and interactable
                    button = play_button.locator("button.play-button")
                    if not await button.is_visible():
                        logging.warning("Play button is not visible.")
                        continue
                    await button.click()

                    # Wait for the audio player to load
                    logging.info("Clicked play button. Waiting for audio player to load.")
                    audio_player = page.locator("#apple-music-player")
                    await audio_player.wait_for(state="attached", timeout=15000)

                    # Retrieve the `src` attribute directly
                    audio_src = await audio_player.evaluate("el => el.getAttribute('src')")
                    if audio_src:
                        logging.info(f"Retrieved preview URL: {audio_src}")
                        await browser.close()
                        return audio_src
                    else:
                        logging.warning("Audio player loaded, but no 'src' attribute found.")

                except PlaywrightTimeoutError:
                    logging.warning(f"Attempt {attempt + 1} timed out. Retrying...")
                except Exception as e:
                    logging.error(f"Error in attempt {attempt + 1}: {e}")

            logging.error("Max retries reached. Unable to retrieve the preview URL.")
            await browser.close()
            return None

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
        song_name = sanitize_input(body.get("name", ""))
        artist_name = sanitize_input(body.get("artist", ""))
        
        if not song_name:
            raise ValueError("Song name is required.")

        preview_url = await get_song_preview(song_name, artist_name)

        # Enrich response with additional metadata
        enriched_track = {
            "name": body.get("name"),
            "artist": body.get("artist"),
            "album_cover": body.get("album_cover"),
            "preview_url": preview_url,
            "playlistsIncluded": body.get("playlistsIncluded"),
        }

        return enriched_track
    except ValueError as ve:
        logging.error(f"Validation error: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logging.error(f"Error processing track: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing track: {str(e)}")
