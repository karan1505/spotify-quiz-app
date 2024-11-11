import spotipy
from spotipy.oauth2 import SpotifyOAuth

def create_spotify_client():
    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
        client_id="e24a1c8aefb543f2845f9b60266f7a7e",
        client_secret="985edfaea59c43698006e0c6059b94a3",
        redirect_uri="http://localhost:8000/redirect",
        scope="user-read-playback-state user-read-currently-playing"
    ))
    return sp
