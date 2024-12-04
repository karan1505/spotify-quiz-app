import os
import json
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
from pathlib import Path
import requests
import logging
from datetime import datetime
from pydantic import BaseModel
from gamemode1_logic import load_playlist_data, validate_playlist, generate_quiz_questions
from dynamic_scraper import update_playlist_with_previews
import asyncio


from config import Config  # Import Config from config.py

# Load environment variables
load_dotenv()

app = FastAPI()

# Enable logging
logging.basicConfig(level=logging.INFO)

# Allow requests from localhost frontend with CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Spotify OAuth setup for localhost
sp_oauth = SpotifyOAuth(
    client_id=Config.SPOTIFY_CLIENT_ID,
    client_secret=Config.SPOTIFY_CLIENT_SECRET,
    redirect_uri="http://localhost:8000/callback",
    scope=Config.SCOPE,
)

ongoing_processes = {}

@app.get("/login")
async def login():
    if Config.CACHE_PATH.exists():
        Config.CACHE_PATH.unlink()  # Clear cache on login to avoid stale tokens
    if Config.CACHE_PATH_FILE.exists():
        os.remove(Config.CACHE_PATH_FILE)
    auth_url = sp_oauth.get_authorize_url()
    return RedirectResponse(auth_url)

@app.get("/callback")
async def callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        logging.error("No authorization code received in callback")
        raise HTTPException(status_code=400, detail="Authorization code missing.")
    
    try:
        if Config.CACHE_PATH.exists():
            Config.CACHE_PATH.unlink()

        token_info = sp_oauth.get_access_token(code, as_dict=True)
        access_token = token_info.get("access_token")
        expires_at = token_info.get("expires_at")

        if not access_token:
            logging.error("Failed to retrieve access token.")
            raise HTTPException(status_code=400, detail="Failed to retrieve access token.")
        
        response = RedirectResponse("http://localhost:3000/dashboard")
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="None",
            max_age=3600
        )

        logging.info(f"Access token set, expires at {datetime.fromtimestamp(expires_at)}")

        return response

    except Exception as e:
        logging.error(f"Error during callback: {str(e)}")
        raise HTTPException(status_code=400, detail="Authorization failed")

def get_spotify_client(access_token: str):
    token_info = sp_oauth.get_cached_token()
    if token_info and token_info['expires_at'] < int(datetime.now().timestamp()):
        logging.info("Token expired, refreshing...")
        token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
        access_token = token_info['access_token']
    
    return Spotify(auth=access_token)

@app.get("/user_info")
async def user_info(request: Request):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    sp = get_spotify_client(access_token)
    try:
        user_info = sp.current_user()
        return {"user_info": user_info}
    except Exception as e:
        logging.error(f"Error fetching user info: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/logout")
async def logout():
    if Config.CACHE_PATH.exists():
        Config.CACHE_PATH.unlink()
    if Config.CACHE_PATH_FILE.exists():
        os.remove(Config.CACHE_PATH_FILE)
    
    global sp_oauth
    sp_oauth = SpotifyOAuth(
        client_id=Config.SPOTIFY_CLIENT_ID,
        client_secret=Config.SPOTIFY_CLIENT_SECRET,
        redirect_uri="http://localhost:8000/callback",
        scope=Config.SCOPE,
        cache_path=str(Config.CACHE_PATH)
    )

    response = RedirectResponse(url="http://localhost:3000", status_code=303)
    response.delete_cookie("access_token")
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"

    return response

@app.get("/user_playlists")
async def user_playlists(request: Request):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    sp = get_spotify_client(access_token)
    try:
        playlists = sp.current_user_playlists()
        return {"items": playlists["items"]}
    except Exception as e:
        logging.error(f"Error fetching user playlists: {str(e)}")
        raise HTTPException(status_code=400, detail="Error fetching playlists")


@app.post("/cancel_process")
async def cancel_process(request: Request):
    """
    Cancels an ongoing playlist extraction process and deletes associated JSON files.
    """
    try:
        body = await request.json()
        playlist_id = body.get("playlistId")
        if not playlist_id:
            raise HTTPException(status_code=400, detail="Missing playlist ID")

        # Check if the process exists
        process = ongoing_processes.get(playlist_id)
        if process and not process.done():
            process.cancel()  # Cancel the asyncio task
            del ongoing_processes[playlist_id]
            logging.info(f"Canceled process for playlist ID: {playlist_id}")
            return {"message": "Processing canceled successfully."}
        else:
            logging.info(f"No active process found for playlist ID: {playlist_id}")
            return {"message": "No active process to cancel."}
    except Exception as e:
        logging.error(f"Error in cancel_process: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to cancel process.")

@app.post("/extract_playlist")
async def extract_playlist(request: Request):
    """
    Extracts playlist data and processes it using the scraper service.
    """
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Unauthorized")

    sp = get_spotify_client(access_token)

    try:
        # Parse playlist ID and name from the request body
        body = await request.json()
        playlist_id = body.get("playlistId")
        playlist_name = body.get("playlistName")

        if not playlist_id or not playlist_name:
            raise HTTPException(status_code=400, detail="Missing playlist ID or name")

        # Fetch playlist details
        playlist = sp.playlist(playlist_id)
        tracks = []
        for item in playlist['tracks']['items']:
            track = item['track']
            tracks.append({
                "name": track['name'],
                "artist": ", ".join([artist['name'] for artist in track['artists']]),
            })

        # Call the scraper service
        response = requests.post(
            "http://localhost:8001/fetch_preview_urls",
            json={"tracks": tracks}
        )
        if response.status_code != 200:
            raise Exception("Scraper service failed")

        enriched_tracks = response.json()["tracks"]

        # Save to JSON file
        sanitized_name = "".join(c if c.isalnum() else "_" for c in playlist_name)
        output_path = Path(f"./user_playlists/{sanitized_name}.json")
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, "w", encoding="utf-8") as file:
            json.dump(enriched_tracks, file, ensure_ascii=False, indent=4)

        logging.info(f"Playlist saved successfully: {output_path}")

        return {"message": "Request received. Playlist processing started."}

    except Exception as e:
        logging.error(f"Error processing playlist: {str(e)}")
        raise HTTPException(status_code=400, detail="Error processing playlist")


async def process_playlist(sp, playlist_id):
    """
    Processes the playlist and retrieves preview URLs using an external API.
    """
    try:
        playlist = sp.playlist(playlist_id)
        playlist_name = playlist['name']
        sanitized_playlist_name = "".join([c if c.isalnum() else "_" for c in playlist_name])

        tracks = []
        for item in playlist['tracks']['items']:
            if asyncio.current_task().cancelled():
                raise asyncio.CancelledError()

            track = item['track']
            tracks.append({
                "name": track['name'],
                "artist": ", ".join([artist['name'] for artist in track['artists']])
            })

        # Call the external scraper API
        response = requests.post(
            "http://localhost:8001/fetch_preview_urls",
            json={"tracks": tracks}
        )
        if response.status_code != 200:
            raise Exception(f"Scraper API failed: {response.json()}")

        enriched_tracks = response.json()["tracks"]

        # Save enriched tracks
        final_file_path = Path(f"./user_playlists/{sanitized_playlist_name}.json")
        final_file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(final_file_path, "w", encoding="utf-8") as file:
            json.dump(enriched_tracks, file, ensure_ascii=False, indent=4)

        return {"tracks": enriched_tracks, "message": "Playlist processed successfully."}
    except asyncio.CancelledError:
        logging.info(f"Task canceled for playlist {playlist_id}")
        raise
    except Exception as e:
        logging.error(f"Error in process_playlist: {str(e)}")
        raise HTTPException(status_code=400, detail="Error processing playlist")




@app.get("/fetch_gamemode1")
async def fetch_gamemode1():
    try:
        # Load and validate the playlist
        tracks = load_playlist_data()
        validate_playlist(tracks)

        # Generate quiz questions
        questions = generate_quiz_questions(tracks)

        return {"questions": questions}

    except HTTPException as e:
        raise e
    except Exception as e:
        logging.error(f"Error in fetch_gamemode1: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing gamemode1.")

class SelectedOption(BaseModel):
    name: str
    artist: str
    album_cover: str

class ValidateAnswerRequest(BaseModel):
    question_id: int
    selected_option: SelectedOption

@app.post("/validate_answer")
async def validate_answer(payload: ValidateAnswerRequest):
    try:
        # Simulating fetching the correct question for validation
        with open("quiz_questions.json", "r") as file:
            questions = json.load(file)

        question_data = next(
            (q for q in questions if q["question_id"] == payload.question_id), None
        )

        if not question_data:
            raise HTTPException(status_code=404, detail="Question not found.")

        is_correct = question_data["correct_option"]["name"] == payload.selected_option.name
        return {"is_correct": is_correct}

    except Exception as e:
        logging.error(f"Validation error: {e}")
        raise HTTPException(status_code=500, detail="Error validating answer.")

