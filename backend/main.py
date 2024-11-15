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
    allow_origins="https://spotify-quiz-app-frontend.onrender.com/",  # Frontend origin
    allow_credentials=True,                    # Allow cookies to be sent
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # Specify allowed methods
    allow_headers=["*"],                       # Allow all headers
)

# Spotify OAuth setup for localhost
sp_oauth = SpotifyOAuth(
    client_id=Config.SPOTIFY_CLIENT_ID,
    client_secret=Config.SPOTIFY_CLIENT_SECRET,
    redirect_uri=Config.SPOTIFY_REDIRECT_URI,  # Local callback URI
    scope=Config.SCOPE,
    #cache_path=str(Config.CACHE_PATH)
)

# Redirect to Spotify login
@app.get("/login")
async def login():
    if Config.CACHE_PATH.exists():
        Config.CACHE_PATH.unlink()  # Clear cache on login to avoid stale tokens
    if Config.CACHE_PATH_FILE.exists():
        os.remove(Config.CACHE_PATH_FILE)
    auth_url = sp_oauth.get_authorize_url()
    return RedirectResponse(auth_url)

# Spotify callback after user login
@app.get("/callback")
async def callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        logging.error("No authorization code received in callback")
        raise HTTPException(status_code=400, detail="Authorization code missing.")
    
    try:
        # Clear cache to prevent expired tokens
        if Config.CACHE_PATH.exists():
            Config.CACHE_PATH.unlink()

        # Retrieve access token using authorization code
        token_info = sp_oauth.get_access_token(code, as_dict=True)
        access_token = token_info.get("access_token")
        expires_at = token_info.get("expires_at")

        # Check if access token was retrieved successfully
        if not access_token:
            logging.error("Failed to retrieve access token.")
            raise HTTPException(status_code=400, detail="Failed to retrieve access token.")
        
        # Set the access token in an HttpOnly cookie for local use
        response = RedirectResponse(Config.FRONTEND_DASHBOARD_URL)  # Redirect to local dashboard
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,  # Not secure for localhost
            samesite="Lax",  # Compatible with local setup
            max_age=3600  # Optional: set expiration time
        )

        # Log success
        logging.info(f"Access token set, expires at {datetime.fromtimestamp(expires_at)}")

        return response

    except Exception as e:
        logging.error(f"Error during callback: {str(e)}")
        raise HTTPException(status_code=400, detail="Authorization failed")

# Function to retrieve Spotify client, refreshing token if expired
def get_spotify_client(access_token: str):
    token_info = sp_oauth.get_cached_token()
    if token_info and token_info['expires_at'] < int(datetime.now().timestamp()):
        logging.info("Token expired, refreshing...")
        token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
        access_token = token_info['access_token']
    
    return Spotify(auth=access_token)

# Endpoint to get user information with access token
@app.get("/user_info")
async def user_info(request: Request):
    access_token = request.cookies.get("access_token")  # Access token from cookies
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
    # Clear the cache file to prevent cached tokens from being reused
    if Config.CACHE_PATH.exists():
        Config.CACHE_PATH.unlink()

    if Config.CACHE_PATH_FILE.exists():
        os.remove(Config.CACHE_PATH_FILE)
    
    # Reinitialize SpotifyOAuth to clear in-memory tokens if required
    global sp_oauth
    sp_oauth = SpotifyOAuth(
        client_id=Config.SPOTIFY_CLIENT_ID,
        client_secret=Config.SPOTIFY_CLIENT_SECRET,
        redirect_uri=Config.SPOTIFY_REDIRECT_URI,  # Local callback URI
        scope=Config.SCOPE,
        cache_path=str(Config.CACHE_PATH)
    )

    # Create a RedirectResponse and clear the access token cookie
    response = RedirectResponse(url=Config.FRONTEND_ORIGIN, status_code=303)
    response.delete_cookie("access_token")  # Remove the access token cookie

    # Explicitly set cache headers to prevent any caching on this response
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"

    return response




# Endpoint to get user playlists
@app.get("/user_playlists")
async def user_playlists(request: Request):
    access_token = request.cookies.get("access_token")  # Access token from cookies
    if not access_token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    sp = get_spotify_client(access_token)  # Get Spotify client
    
    try:
        # Fetch user's playlists using the Spotify client
        playlists = sp.current_user_playlists()
        
        # Return the playlists data
        return {"items": playlists["items"]}
    except Exception as e:
        logging.error(f"Error fetching user playlists: {str(e)}")
        raise HTTPException(status_code=400, detail="Error fetching playlists")
