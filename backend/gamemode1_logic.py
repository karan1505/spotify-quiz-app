import random
from fastapi import HTTPException
import json
import logging

# Path to the game mode playlist file
GAME_MODE_PLAYLIST_FILE = "game_playlists/top50_global.json"

def load_playlist_data():
    """
    Loads the playlist data from the JSON file.
    """
    try:
        with open(GAME_MODE_PLAYLIST_FILE, 'r') as file:
            tracks = json.load(file)
        return tracks
    except FileNotFoundError:
        logging.error("Playlist file not found.")
        raise HTTPException(status_code=404, detail="Playlist file not found.")
    except Exception as e:
        logging.error(f"Error loading playlist file: {str(e)}")
        raise HTTPException(status_code=500, detail="Error loading playlist data.")

def validate_playlist(tracks):
    """
    Validates the playlist to ensure it has at least 20 tracks.
    """
    if len(tracks) < 20:
        logging.error("Invalid playlist: Less than 20 tracks.")
        raise HTTPException(status_code=400, detail="Invalid playlist for gamemode. Less than 20 tracks.")
    return True

def generate_quiz_questions(tracks):
    """
    Generates quiz questions based on the provided tracks.
    """
    questions = []
    selected_tracks = random.sample(tracks, 20)

    for i in range(5):
        # Select correct track and 3 incorrect options
        correct_track = random.choice(selected_tracks)
        selected_tracks.remove(correct_track)
        incorrect_tracks = random.sample(selected_tracks, 3)
        selected_tracks.append(correct_track)

        # Shuffle options
        options = incorrect_tracks + [correct_track]
        random.shuffle(options)

        questions.append({
            "question_id": i + 1,
            "audio_preview_url": correct_track["preview_url"],
            "options": [
                {
                    "name": option["name"],
                    "artist": option["artist"],
                    "album_cover": option["album_cover"]
                } for option in options
            ],
            "correct_option": {
                "name": correct_track["name"],
                "artist": correct_track["artist"],
                "album_cover": correct_track["album_cover"]
            }
        })

    # Save questions to a file
    with open("quiz_questions.json", "w") as file:
        json.dump(questions, file)

    return questions


