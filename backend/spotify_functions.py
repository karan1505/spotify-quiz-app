# spotify_functions.py

def execute_actions(access_token):
    # You can use the access_token to execute actions like fetching top tracks
    from spotipy import Spotify
    sp = Spotify(auth=access_token)

    # Example: Fetch the current user’s top tracks
    results = sp.current_user_top_tracks(limit=5)
    for idx, track in enumerate(results['items']):
        print(f"{idx + 1}. {track['name']} by {track['artists'][0]['name']}")
