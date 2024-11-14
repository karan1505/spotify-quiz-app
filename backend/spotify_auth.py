import spotipy
from spotipy.oauth2 import SpotifyOAuth
from config import Config

def create_spotify_client():
    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
        client_id=Config.SPOTIFY_CLIENT_ID,
        client_secret=Config.SPOTIFY_CLIENT_SECRET,
        redirect_uri=Config.SPOTIFY_REDIRECT_URI,
        scope=Config.SCOPE
    ))
    return sp
