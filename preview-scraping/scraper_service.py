from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import json
from dynamic_scraper import fetch_preview_url_with_retries, sanitize_input

app = FastAPI()

class TrackRequest(BaseModel):
    name: str
    artist: str

class TracksRequest(BaseModel):
    tracks: list[TrackRequest]

@app.post("/fetch_preview_urls")
async def fetch_preview_urls(request: TracksRequest):
    try:
        enriched_tracks = []
        for track in request.tracks:
            song_name = sanitize_input(track.name)
            artist_name = sanitize_input(track.artist)
            preview_url = fetch_preview_url_with_retries(song_name, artist_name)
            enriched_tracks.append({
                "name": track.name,
                "artist": track.artist,
                "preview_url": preview_url
            })

        return {"tracks": enriched_tracks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing tracks: {str(e)}")
