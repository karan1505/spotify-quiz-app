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

# Semaphore to limit concurrency to 1 (prevent resource overload)
SEMAPHORE = asyncio.Semaphore(1)


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
    Optimized to reduce memory usage by using browser.new_page() directly.
    """
    log_resource_usage()
    try:
        async with SEMAPHORE:  # Limit concurrency
            async with async_playwright() as p:
                # Launch the browser with optimized flags to reduce memory usage
                browser = await p.chromium.launch(
                    headless=True,
                    args=[
                        "--no-sandbox",
                        "--disable-gpu",
                        "--disable-dev-shm-usage",
                        "--disable-extensions",  # Disable unnecessary extensions
                        "--disable-background-networking",
                        "--disable-sync",
                        "--disable-default-apps",
                        "--disable-popup-blocking",
                        "--no-first-run",
                    ]
                )
                page = None
                try:
                    # Create a new page directly in the default browser context
                    page = await browser.new_page()

                    # Construct the search URL
                    query = f"{song_name} {artist_name}".strip()
                    encoded_query = urllib.parse.quote(query)
                    url = f"https://music.apple.com/us/search?term={encoded_query}"
                    logging.info(f"Navigating to search URL: {url}")

                    # Navigate to the URL with a shorter timeout
                    await page.goto(url, timeout=15000)

                    # Wait for the top search result container to appear
                    play_button = page.locator(".top-search-lockup").first
                    if not await play_button.is_visible():
                        logging.warning("Top search lockup element not found.")
                        return None

                    # Hover over the top search result to reveal the play button
                    await play_button.hover()
                    button = play_button.locator("button.play-button")
                    if not await button.is_visible():
                        logging.warning("Play button not visible.")
                        return None

                    # Click the play button
                    await button.click()
                    logging.info("Clicked play button. Waiting for audio player to load.")

                    # Wait for the audio player to appear and extract the 'src' attribute
                    audio_player = page.locator("#apple-music-player")
                    await audio_player.wait_for(state="attached", timeout=7000)
                    audio_src = await audio_player.evaluate("el => el.getAttribute('src')")

                    if audio_src:
                        logging.info(f"Retrieved preview URL: {audio_src}")
                        return audio_src
                    else:
                        logging.warning("Audio source not found.")
                        return None

                except PlaywrightTimeoutError:
                    logging.error("Page load or selector timeout occurred.")
                    return None
                except Exception as e:
                    logging.error(f"Error in get_song_preview: {e}")
                    return None
                finally:
                    # Clean up the page and browser to release memory
                    if page:
                        await page.close()
                    await browser.close()

    except Exception as e:
        logging.error(f"Unhandled exception in get_song_preview: {e}")
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
