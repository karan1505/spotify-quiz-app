import os
import json
from fastapi import FastAPI, Request, Header, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
from pathlib import Path

from spotify_functions import execute_actions  # Import from spotify_functions

# Load environment variables
load_dotenv()

app = FastAPI()

# Allow requests from the frontend with CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend origin
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # Specify allowed methods
    allow_headers=["*"],  # Allow all headers 
)

# Path to the token cache file
CACHE_PATH = Path("token_cache.json")

# Spotify OAuth setup
sp_oauth = SpotifyOAuth(
    client_id=os.getenv("SPOTIFY_CLIENT_ID"),
    client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
    redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI"),
    scope="user-library-read user-read-private user-read-email user-top-read user-follow-read playlist-modify-public user-read-playback-state user-modify-playback-state",
    cache_path=str(CACHE_PATH)
)

# Redirect to Spotify login
@app.get("/login")
async def login():
    auth_url = sp_oauth.get_authorize_url()
    return RedirectResponse(auth_url)

# Spotify callback after user login
@app.get("/callback")
async def callback(request: Request):
    code = request.query_params.get("code")
    if code:
        token_info = sp_oauth.get_access_token(code)
        access_token = token_info.get("access_token")
        sp = Spotify(auth=access_token)
        user_info = sp.current_user()

        # Set the access token in an HttpOnly cookie
        response = RedirectResponse("http://localhost:3000/dashboard")
        response.set_cookie(
            key="access_token", 
            value=access_token, 
            httponly=True,  # Make the cookie HttpOnly
            secure=False,  # Set to True for HTTPS
            max_age=3600  # Optional: set expiration time
        )
        return response
    else:
        return JSONResponse({"error": "Authorization failed"}, status_code=400)

# Endpoint to retrieve user information with access token
@app.get("/user_info")
async def user_info(request: Request):
    access_token = request.cookies.get("access_token")  # Retrieve access token from cookies
    if not access_token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    sp = Spotify(auth=access_token)
    try:
        user_info = sp.current_user()
        return {"user_info": user_info}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

# Logout endpoint
@app.get("/logout")
async def logout():
    if CACHE_PATH.exists():
        CACHE_PATH.unlink()
    response = JSONResponse({"message": "Logged out successfully"})
    response.delete_cookie("access_token")  # Remove access token cookie
    return response


# main.py

# Add the new endpoint for fetching track preview URLs
@app.get("/track_preview")
async def track_preview(track_id: str, request: Request):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    sp = Spotify(auth=access_token)
    try:
        track = sp.track(track_id)
        preview_url = track.get("preview_url")
        if preview_url:
            return {"preview_url": preview_url}
        else:
            return JSONResponse({"error": "No preview available for this track"}, status_code=404)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch track preview")

@app.get("/user_playlists")
async def user_playlists(request: Request):
        access_token = request.cookies.get("access_token")
        if not access_token:
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        sp = Spotify(auth=access_token)

        try:
            # Fetch the user's playlists with the full data for each playlist
            playlists = sp.current_user_playlists(limit=10)  # Adjust the limit as needed
            return playlists  # Return the full JSON response from Spotify
        except Exception as e:
            # Handle potential errors from Spotify API
            raise HTTPException(status_code=500, detail=f"Error fetching playlists: {str(e)}")
        
@app.get("/global-top-playlists")
async def global_top_playlists(request: Request):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    sp = Spotify(auth=access_token)
    
    try:
        # Fetch featured playlists (can be considered as global popular playlists)
        featured_playlists = sp.featured_playlists(limit=10)  # Adjust limit as needed
        playlists_data = [
            {
                "name": playlist["name"],
                "description": playlist["description"],
                "image": playlist["images"][0]["url"] if playlist["images"] else None,
                "id": playlist["id"],
            }
            for playlist in featured_playlists["playlists"]["items"]
        ]
        return {"global_top_playlists": playlists_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching global top playlists: {str(e)}")
