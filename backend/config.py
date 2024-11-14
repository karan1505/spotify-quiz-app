import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file
load_dotenv()

class Config:
    # Spotify OAuth configuration
    SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
    SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
    SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")
    ENV = os.getenv("ENV", "development")  # Default to 'development' if not set

    # Caching settings
    CACHE_PATH = Path("token_cache.json")
    CACHE_PATH_FILE = Path(".cache")

    # OAuth scopes
    SCOPE = (
        "user-library-read user-read-private user-read-email "
        "user-top-read user-follow-read playlist-modify-public "
        "user-read-playback-state user-modify-playback-state"
    )

    # Frontend CORS settings
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN")  # Now loads from .env
    FRONTEND_DASHBOARD_URL = os.getenv("FRONTEND_DASHBOARD_URL")  # Now loads from .env
    
    # Other configurations
    MAX_PLAYLISTS = 10
    TRACK_PREVIEW_LIMIT = 10
