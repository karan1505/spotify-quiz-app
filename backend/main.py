import os
import json
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
from pathlib import Path
import logging
from datetime import datetime

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
            secure=False,
            samesite="Lax",
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

# New function to fetch a playlist by URL and return track previews
@app.get("/fetch_playlist")
async def fetch_playlist(request: Request, playlist_url: str):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    sp = get_spotify_client(access_token)
    try:
        # Extract playlist ID from URL (assuming format 'https://open.spotify.com/playlist/{playlist_id}')
        playlist_id = playlist_url.split('/')[-1].split('?')[0]
        
        # Fetch playlist details
        playlist = sp.playlist(playlist_id)
        
        # Extract track names, artists, and preview URLs
        tracks = []
        for item in playlist['tracks']['items']:
            track = item['track']
            track_info = {
                "name": track['name'],
                "artist": ", ".join([artist['name'] for artist in track['artists']]),
                "preview_url": track['preview_url'],
                "album_cover": track['album']['images'][0]['url'] if track['album']['images'] else None
            }
            tracks.append(track_info)
        
        return {"playlist_name": playlist['name'], "tracks": tracks}

    except Exception as e:
        logging.error(f"Error fetching playlist: {str(e)}")
        raise HTTPException(status_code=400, detail="Error fetching playlist")
