import os
import json
from fastapi import FastAPI, Request, Header, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
from pathlib import Path
import logging
from datetime import datetime

from config import Config  # Import Config from the new config.py

# Load environment variables
load_dotenv()

app = FastAPI()

# Enable logging
logging.basicConfig(level=logging.INFO)

# Allow requests from the frontend with CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[Config.FRONTEND_ORIGIN],  # Use Config.FRONTEND_ORIGIN
    allow_credentials=True,
    #allow_methods=["GET", "POST", "PUT", "DELETE"],  # Specify allowed methods
    allow_methods = ["*"],
    allow_headers=["*"],  # Allow all headers 
)

# Spotify OAuth setup
sp_oauth = SpotifyOAuth(
    client_id=Config.SPOTIFY_CLIENT_ID,
    client_secret=Config.SPOTIFY_CLIENT_SECRET,
    redirect_uri=Config.SPOTIFY_REDIRECT_URI,
    scope=Config.SCOPE,
    cache_path=str(Config.CACHE_PATH)
)

# Redirect to Spotify login
@app.get("/login")
async def login():
    # Clear cache file on login to avoid using the same access token
    if Config.CACHE_PATH.exists():
        Config.CACHE_PATH.unlink()
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
        # Clear the cache to prevent using an expired token
        if Config.CACHE_PATH.exists():
            Config.CACHE_PATH.unlink()

        # Get the access token using the code
        token_info = sp_oauth.get_access_token(code, as_dict=True)
        access_token = token_info.get("access_token")
        expires_at = token_info.get("expires_at")

        # Check if the access token is valid
        if not access_token:
            logging.error("Failed to retrieve access token.")
            raise HTTPException(status_code=400, detail="Failed to retrieve access token.")
        
        # Store access token with expiration details
        sp = Spotify(auth=access_token)
        user_info = sp.current_user()

        # Set the access token in an HttpOnly cookie with expiration time
        response = RedirectResponse(Config.FRONTEND_DASHBOARD_URL)
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=Config.ENV == "production",  # Only use secure cookies in production
            samesite="None",  # Allows cross-origin cookies
            max_age=3600  # Optional: set expiration time
        )

        # Log the success
        logging.info(f"User info fetched successfully: {user_info}")
        logging.info(f"Access token set in cookie, expires at {datetime.fromtimestamp(expires_at)}")

        return response

    except Exception as e:
        logging.error(f"Error during callback: {str(e)}")
        raise HTTPException(status_code=400, detail="Authorization failed")

# Helper function to get Spotify client and refresh token if expired
def get_spotify_client(access_token: str):
    token_info = sp_oauth.get_cached_token()
    if token_info and token_info['expires_at'] < int(datetime.now().timestamp()):
        logging.info("Token expired, refreshing...")
        token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
        access_token = token_info['access_token']
    
    return Spotify(auth=access_token)

# Endpoint to retrieve user information with access token
@app.get("/user_info")
async def user_info(request: Request):
    access_token = request.cookies.get("access_token")  # Retrieve access token from cookies
    if not access_token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    sp = get_spotify_client(access_token)
    try:
        user_info = sp.current_user()
        return {"user_info": user_info}
    except Exception as e:
        logging.error(f"Error fetching user info: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")

# Logout endpoint
@app.get("/logout")
async def logout():
    if Config.CACHE_PATH.exists():
        Config.CACHE_PATH.unlink()
    response = JSONResponse({"message": "Logged out successfully"})
    response.delete_cookie("access_token")  # Remove access token cookie
    return response
