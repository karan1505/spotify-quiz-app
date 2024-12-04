from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
import time
import urllib.parse

def get_song_preview(song_name, artist_name=""):
    try:
        driver_path = "/usr/bin/chromedriver"
        service = Service(driver_path)

        # Initialize the WebDriver
        driver = webdriver.Chrome(service=service)

        # Encode the query for the URL
        query = song_name.strip()
        if artist_name.strip():
            query += " " + artist_name.strip()
        encoded_query = urllib.parse.quote(query)
        url = f"https://music.apple.com/us/search?term={encoded_query}"
        print(f"Navigating to: {url}")
        driver.get(url)

        # Wait for the search results to load
        wait = WebDriverWait(driver, 20)
        top_result = wait.until(
            EC.presence_of_element_located((By.CLASS_NAME, "top-search-lockup"))
        )
        print("Search results loaded.")

        # Locate the play button's parent element
        play_button_parent = wait.until(
            EC.presence_of_element_located((
                By.CSS_SELECTOR, 
                ".top-search-lockup"
            ))
        )
        print("Parent element located.")

        # Use ActionChains to hover over the parent element
        actions = ActionChains(driver)
        actions.move_to_element(play_button_parent).perform()
        time.sleep(1)  # Allow any hover-triggered animations to complete

        # Now locate and click the play button
        play_button = wait.until(
            EC.element_to_be_clickable((
                By.CSS_SELECTOR, 
                ".top-search-lockup__play-button-wrapper .interactive-play-button button.play-button"
            ))
        )
        print("Play button found after hover.")

        # Click the play button
        play_button.click()
        print("Play button clicked. Song should start playing.")

        # Wait briefly to ensure the audio element is updated
        time.sleep(2)

        # Locate the <audio> element and get the src attribute
        audio_element = driver.find_element(By.ID, "apple-music-player")
        audio_src = audio_element.get_attribute("src")
        print(f"Audio source URL: {audio_src}")

        # Return the audio src
        return audio_src

    except Exception as e:
        print(f"An error occurred: {e}")
        driver.save_screenshot("error_screenshot.png")
        print("Screenshot saved for debugging.")
        return None
    finally:
        # Quit the driver
        driver.quit()