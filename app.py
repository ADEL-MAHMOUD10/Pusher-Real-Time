from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import requests
import pusher
import dotenv
import os
import json
import time
from typing import Dict
import asyncio

dotenv.load_dotenv()

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize Pusher - using sync client
pusher_client = pusher.Pusher(
    app_id=os.getenv('PUSHER_APP_ID'),
    key=os.getenv('PUSHER_KEY'),
    secret=os.getenv('PUSHER_SECRET'),
    cluster=os.getenv('PUSHER_CLUSTER'),
    ssl=True
)

A_KEY = os.getenv("A_api_key")
upload_id = 'rco-we23-qdc4'

@app.get("/")
async def read_root():
    return FileResponse("static/index.html")

def broadcast_progress(progress_data: Dict):
    """Broadcast progress updates using Pusher - synchronous version"""
    try:
        pusher_client.trigger('upload-channel', 'progress-update', progress_data)
    except Exception as e:
        print(f"Error broadcasting to Pusher: {e}")

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if file:
        # Get file size
        file.file.seek(0, 2)  # Seek to end of file
        file_size = file.file.tell()
        file.file.seek(0)  # Reset file pointer to beginning
        
        # Convert to a simple async wrapper
        file_transcripe = await asyncio.to_thread(
            upload_audio_to_assemblyai, 
            upload_id, 
            file.file, 
            file_size
        )
        
        return {
            "status": "success",
            "file_transcripe": file_transcripe
        }
    return {"status": "error", "message": "No file provided"}

def update_progress_bar(upload_id, progress_percentage, prog_mes):
    """Synchronous version of progress update function"""
    progress_data = {
        "upload_id": upload_id,
        "progress_percentage": progress_percentage,
        "prog_mes": prog_mes
    }
    broadcast_progress(progress_data)
    return progress_data

def upload_audio_to_assemblyai(upload_id, audio_file, file_size):
    """Upload audio file to AssemblyAI in chunks with progress tracking."""
    headers = {
        "authorization": A_KEY,
        "Transfer-Encoding": "chunked"
    }

    base_url = "https://api.assemblyai.com/v2"

    def upload_chunks():
        """Generator function to upload file in chunks and track progress."""
        uploaded_size = 0
        last_update_time = time.time()
        update_interval = 0.2  # Update every 200ms for smoother UI
        
        while True:
            chunk = audio_file.read(1024 * 1024)  # Read a 1MB chunk
            if not chunk:
                break
                
            yield chunk
            uploaded_size += len(chunk)
            
            # Only update UI at certain intervals to avoid flooding
            current_time = time.time()
            if current_time - last_update_time >= update_interval:
                progress_percentage = min(99, (uploaded_size / file_size) * 100)  # Cap at 99% until confirmed
                total_mb = file_size / (1024 * 1024)
                uploaded_mb = uploaded_size / (1024 * 1024)
                prog_mes = f"Uploading: {uploaded_mb:.2f}MB / {total_mb:.2f}MB"
                update_progress_bar(upload_id, progress_percentage, prog_mes)
                last_update_time = current_time
        
        # Final update once upload is complete
        total_mb = file_size / (1024 * 1024)
        update_progress_bar(upload_id, 99, f"Upload complete! Processing... ({total_mb:.2f}MB)")

    # Upload the file to AssemblyAI and get the URL
    try:
        # Upload the audio file to AssemblyAI
        response = requests.post(
            f"{base_url}/upload", 
            headers=headers, 
            data=upload_chunks()
        )
        
        if response.status_code != 200:
            raise RuntimeError(f"File upload failed with status {response.status_code}")
        
        upload_url = response.json()["upload_url"]
        
        # Request transcription from AssemblyAI using the uploaded file URL
        data = {"audio_url": upload_url}
        response = requests.post(f"{base_url}/transcript", json=data, headers=headers)
        
        if response.status_code != 200:
            raise RuntimeError(f"Failed to start transcription with status {response.status_code}")
        
        transcript_id = response.json()["id"]
        polling_endpoint = f"{base_url}/transcript/{transcript_id}"
        
        # Poll for the transcription result until completion
        while True:
            transcription_result = requests.get(polling_endpoint, headers=headers).json()
            
            if transcription_result['status'] == 'completed':
                # Final update
                total_mb = file_size / (1024 * 1024)
                update_progress_bar(upload_id, 100, f"Transcription completed ({total_mb:.2f}MB)")
                return transcription_result.get('text', 'Transcription completed')
                
            elif transcription_result['status'] == 'processing':
                # Update progress during processing phase (50-95%)
                total_mb = file_size / (1024 * 1024)
                update_progress_bar(upload_id, 75, f"Processing transcription... ({total_mb:.2f}MB)")
                
            elif transcription_result['status'] == 'error':
                raise RuntimeError(f"Transcription failed: {transcription_result['error']}")
                
            # Sleep between polling requests
            time.sleep(2)
            
    except Exception as e:
        prog_mes = f'An error occurred: {str(e)}'
        update_progress_bar(upload_id, 0, prog_mes)
        return None

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

