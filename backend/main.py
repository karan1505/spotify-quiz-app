import os
import json
from fastapi import FastAPI, Request, Header, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
from pathlib import Path
import urllib.parse

from spotify_functions import execute_actions  # Import from spotify_functions

# Load environment variables
load_dotenv()

app = FastAPI()

# Allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

        # Redirect to the React dashboard with access token in query params
        return RedirectResponse(f"http://localhost:3000/dashboard?access_token={access_token}")
    else:
        return JSONResponse({"error": "Authorization failed"}, status_code=400)

# Endpoint to retrieve user information with access token
@app.get("/user_info")
async def user_info(authorization: str = Header(None)):
    token = authorization.split(" ")[1]  # Extract token from header
    sp = Spotify(auth=token)
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
    return JSONResponse({"message": "Logged out successfully"})