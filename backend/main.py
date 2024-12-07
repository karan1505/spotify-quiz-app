import os
import json
from fastapi import FastAPI, Request, HTTPException, Body
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
# from dynamic_scraper import update_playlist_with_previews
import asyncio

from config import Config  # Import Config from config.py
from pymongo import MongoClient
MONGO_URI = "mongodb+srv://srinathquizzify:Quizzify123@quizzifycluster.i7npc.mongodb.net/Spotify?retryWrites=true&w=majority"

client = MongoClient(MONGO_URI)
db = client["Spotify"]  # Database name
playlists_collection = db["Playlists"]  # Collection name

# Load environment variables
load_dotenv()

class SelectedOption(BaseModel):
    name: str
    artist: str
    album_cover: str

class ValidateAnswerRequest(BaseModel):
    question_id: int
    selected_option: SelectedOption

app = FastAPI()

# Enable logging
logging.basicConfig(level=logging.INFO)

# Allow requests from localhost frontend with CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://quizzify-frontend-6sp3.onrender.com"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Spotify OAuth setup for localhost
sp_oauth = SpotifyOAuth(
    client_id=Config.SPOTIFY_CLIENT_ID,
    client_secret=Config.SPOTIFY_CLIENT_SECRET,
    redirect_uri="https://quizzify-backend-5kpq.onrender.com/callback",
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
        
        response = RedirectResponse("https://quizzify-frontend-6sp3.onrender.com/dashboard")
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
        redirect_uri="https://quizzify-backend-5kpq.onrender.com/callback",
        scope=Config.SCOPE,
        cache_path=str(Config.CACHE_PATH)
    )

    response = RedirectResponse(url="https://quizzify-frontend-6sp3.onrender.com", status_code=303)
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

@app.get("/saved_playlists")
async def saved_playlists(request: Request):
    """
    Fetches the user's playlists from Spotify and returns the playlists 
    that are already saved in the database.
    """
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    sp = get_spotify_client(access_token)

    try:
        # Fetch playlists from Spotify
        playlists = sp.current_user_playlists()
        user_playlists = playlists["items"]

        # Extract playlist IDs from user's playlists
        playlist_ids = [playlist["id"] for playlist in user_playlists]

        # Query the database for saved playlist IDs
        saved_playlist_ids = set(
            playlists_collection.distinct("playlistsIncluded", {"playlistsIncluded": {"$in": playlist_ids}})
        )

        # Filter user playlists to only include saved ones
        saved_playlists = [
            playlist for playlist in user_playlists if playlist["id"] in saved_playlist_ids
        ]

        return {"saved_playlists": saved_playlists}

    except Exception as e:
        logging.error(f"Error fetching saved playlists: {str(e)}")
        raise HTTPException(status_code=400, detail="Error fetching saved playlists")

def cleanup_tracks():
    """
    Removes tracks from the database where `preview_url` is null.
    """
    result = playlists_collection.delete_many({"preview_url": None})
    logging.info(f"Cleanup completed: Removed {result.deleted_count} tracks with null preview_url.")

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
                "album_cover": track['album']['images'][0]['url'],
                "playlistsIncluded": playlist_id,
            })

        # Check the database for existing tracks
        missing_tracks = []
        for track in tracks:
            existing_track = playlists_collection.find_one({"name": track["name"], "artist": track["artist"]})
            if existing_track:
                # Track exists, append playlist_id if not already present
                playlists_collection.update_one(
                    {"_id": existing_track["_id"]},
                    {"$addToSet": {"playlistsIncluded": playlist_id}}
                )
            else:
                # Track does not exist, add to missing_tracks for scraping
                missing_tracks.append(track)

        # Process missing tracks one by one
        enriched_tracks = []
        for track in missing_tracks:
            response = requests.post(
                "https://scraperimg5-929406927292.us-central1.run.app/fetch_preview_url",
                json=track
            )
            if response.status_code != 200:
                logging.warning(f"Scraper service failed for track: {track['name']}. Skipping...")
                continue  # Skip this track and move to the next
            enriched_track = response.json()
            enriched_tracks.append(enriched_track)

            # Insert the enriched track into the database
            playlists_collection.insert_one({
                "name": enriched_track["name"],
                "artist": enriched_track["artist"],
                "preview_url": enriched_track.get("preview_url"),
                "playlistsIncluded": [playlist_id],
                "album_cover": enriched_track.get("album_cover")
            })

        # Save to JSON file
        sanitized_name = "".join(c if c.isalnum() else "_" for c in playlist_name)
        output_path = Path(f"./user_playlists/{sanitized_name}.json")
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, "w", encoding="utf-8") as file:
            json.dump(enriched_tracks, file, ensure_ascii=False, indent=4)

        logging.info(f"Playlist saved successfully: {output_path}")

        # Perform cleanup of tracks with null preview_url
        cleanup_tracks()

        return {"message": "Playlist processed successfully."}

    except Exception as e:
        logging.error(f"Error processing playlist: {str(e)}")
        raise HTTPException(status_code=400, detail="Error processing playlist")


@app.get("/filtered_playlists")
async def filtered_playlists(request: Request):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    sp = get_spotify_client(access_token)
    try:
        playlists = sp.current_user_playlists()
        user_playlists = playlists["items"]

        # Filter playlists with more than 20 tracks
        filtered_playlists = [
            playlist for playlist in user_playlists if playlist["tracks"]["total"] > 20
        ]

        return {"filtered_playlists": filtered_playlists}
    except Exception as e:
        logging.error(f"Error fetching filtered playlists: {str(e)}")
        raise HTTPException(status_code=400, detail="Error fetching playlists")


@app.delete("/remove_playlist")
async def remove_playlist(request: Request):
    """
    Removes a playlist ID from the playlistsIncluded field in the database.
    """
    try:
        # Parse playlist ID from the request body
        body = await request.json()
        playlist_id = body.get("playlistId")

        if not playlist_id:
            raise HTTPException(status_code=400, detail="Missing playlist ID")

        # Perform the update operation
        result = playlists_collection.update_many(
            {"playlistsIncluded": playlist_id},  # Match songs containing the playlist ID
            {"$pull": {"playlistsIncluded": playlist_id}}  # Remove the playlist ID from the array
        )

        logging.info(f"Playlist ID {playlist_id} removed from {result.modified_count} tracks")

        return {
            "message": f"Playlist ID {playlist_id} successfully removed from tracks.",
            "modified_count": result.modified_count
        }

    except Exception as e:
        logging.error(f"Error removing playlist ID: {str(e)}")
        raise HTTPException(status_code=400, detail="Error removing playlist ID")


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
            track = item['track']
            tracks.append({
                "name": track['name'],
                "artist": ", ".join([artist['name'] for artist in track['artists']]),
                "album_cover": track['album']['images'][0]['url'],  # Ensure the album cover is included
                "playlistsIncluded": playlist_id,
            })

        # Call the scraper API and wait for the response synchronously
        response = requests.post(
            "https://quizzify-frontend-6sp3.onrender.com",
            json={"tracks": tracks},
            timeout=None  # No timeout
        )

        if response.status_code != 200:
            raise Exception(f"Scraper API failed: {response.json()}")

        enriched_tracks = response.json()["tracks"]

        # Save enriched tracks to a JSON file
        final_file_path = Path(f"./user_playlists/{sanitized_playlist_name}.json")
        final_file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(final_file_path, "w", encoding="utf-8") as file:
            json.dump(enriched_tracks, file, ensure_ascii=False, indent=4)

        return {"tracks": enriched_tracks, "message": "Playlist processed successfully."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing playlist: {str(e)}")


@app.post("/fetch_gamemode1")
async def fetch_gamemode1(payload: dict = Body(...)):
    playlist_id = payload.get("playlistID")
    if not playlist_id:
        raise HTTPException(status_code=400, detail="Playlist ID is required.")

    try:
        # Query MongoDB for tracks associated with the given playlistID
        tracks_cursor = playlists_collection.find({"playlistsIncluded": playlist_id})
        tracks = list(tracks_cursor)

        if not tracks:
            raise HTTPException(status_code=404, detail="No tracks found for this playlist.")

        # Generate quiz questions
        questions = generate_quiz_questions(tracks)

        return {"questions": questions}

    except Exception as e:
        logging.error(f"Error in fetch_gamemode1: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing gamemode1.")

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