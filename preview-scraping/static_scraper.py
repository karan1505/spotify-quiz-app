import json
import os
import re
from apple_music_scraper import get_song_preview

def sanitize_input(text):
    """
    Sanitize the input string to ensure it's compatible with US English keyboard typing.
    Removes special characters and trims extra spaces.
    """
    sanitized = re.sub(r'[^\w\s]', '', text)  # Remove non-alphanumeric characters except spaces
    sanitized = re.sub(r'\s+', ' ', sanitized).strip()  # Replace multiple spaces with a single space
    return sanitized

def fetch_preview_url_with_retries(song_name, artist_name, retries=2):
    """
    Try fetching the preview URL with the original and fallback strategies.
    Retries the process twice before setting URL to None.
    """
    for attempt in range(retries + 1):
        if attempt == 0:
            # Try with song name and artist name
            query_name = f"{song_name} by {artist_name}"
        else:
            # Try with only the song name
            query_name = song_name
        
        print(f"Attempt {attempt + 1}: Fetching preview URL for {query_name}")
        preview_url = get_song_preview(song_name, artist_name if attempt == 0 else "")
        
        if preview_url:
            print(f"Preview URL fetched: {preview_url}")
            return preview_url
        
        print(f"Attempt {attempt + 1} failed for {query_name}")
    
    print(f"All attempts failed for: {song_name}")
    return None

def update_playlist_with_previews(json_file, output_file):
    try:
        # Load the JSON data
        with open(json_file, 'r') as file:
            playlist_tracks = json.load(file)

        updated_tracks = []

        # Update each track with the preview URL
        for track in playlist_tracks:
            song_name = sanitize_input(track.get("name", ""))
            artist_name = sanitize_input(track.get("artist", ""))
            
            print(f"Fetching preview URL for sanitized: {song_name} by {artist_name}")
            preview_url = fetch_preview_url_with_retries(song_name, artist_name)

            track["preview_url"] = preview_url
            updated_tracks.append(track)

        # Save the updated JSON to the new file
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, 'w') as file:
            json.dump(updated_tracks, file, indent=4)

        print(f"Updated JSON saved to {output_file}")

        # Clear the original playlist file
        with open(json_file, 'w') as file:
            json.dump([], file, indent=4)

        print(f"Original playlist file {json_file} has been cleared.")

    except Exception as e:
        print(f"An error occurred while updating the playlist: {e}")

if __name__ == "__main__":
    json_file_path = "spotify-quiz-app/backend/playlist_data/playlist_tracks.json"
    output_file_path = "../game_playlists/playlistname_for_gamemode.json"

    if os.path.exists(json_file_path):
        update_playlist_with_previews(json_file_path, output_file_path)
    else:
        print(f"JSON file not found at: {json_file_path}")
