# Audio Transcription Service

A real-time audio transcription web application that converts uploaded audio files to text using AssemblyAI's API with a sleek, modern UI featuring real-time progress updates through Pusher.

![Audio Transcription Service](https://i.imgur.com/your-screenshot-url.png)

## Features

- ✅ Upload audio files via drag-and-drop or file selector
- ✅ Real-time upload progress tracking
- ✅ Beautiful, animated sound wave visualizations
- ✅ Automatic transcription of audio to text
- ✅ Copy transcription text with one click
- ✅ Responsive design for all devices
- ✅ Dark mode interface with audio-inspired animations

## Technologies Used

- **Backend**: FastAPI (Python)
- **Real-time Updates**: Pusher
- **Audio Processing**: AssemblyAI API
- **Frontend**: HTML, CSS, JavaScript
- **Styling**: Tailwind CSS
- **Animations**: CSS animations & JavaScript

## Installation and Setup

### Prerequisites

- Python 3.8+
- An AssemblyAI API key
- A Pusher account and app credentials

### Setup Instructions

1. **Clone the repository**

```bash
git clone <repository-url>
cd audio-transcription-service
```

2. **Create and activate a virtual environment**

```bash
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

4. **Set up your environment variables**

Create a `.env` file in the project root with the following variables:

```
A_api_key=your_assemblyai_api_key
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster
```

5. **Configure Pusher in the frontend**

Create a file at `static/config.js` with your Pusher key:

```javascript
const PUSHER_CONFIG = {
    key: 'your_pusher_key',
    cluster: 'your_pusher_cluster'
};
```

6. **Start the server**

```bash
uvicorn app:app --reload
```

7. **Access the application**

Open your browser and navigate to [http://localhost:8000](http://localhost:8000)

## Usage

1. Drag and drop an audio file onto the upload area or click to select a file
2. The file will begin uploading with real-time progress updates
3. Once uploaded, AssemblyAI will process the audio for transcription
4. When complete, the transcribed text will appear below
5. Use the copy button to copy the transcription to your clipboard

## API Endpoints

- `GET /` - Serves the main HTML application
- `POST /upload` - Handles file uploads and transcription
- Pusher channel: `upload-channel` with event `progress-update` for progress updates

## Project Structure

```
.
├── app.py                # FastAPI application
├── static/               # Static assets
│   ├── config.js         # Pusher configuration (create this file)
│   └── index.html        # Main HTML application
├── .env                  # Environment variables (create this file)
├── requirements.txt      # Python dependencies
└── README.md             # This file
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [AssemblyAI](https://www.assemblyai.com/) for the transcription API
- [Pusher](https://pusher.com/) for real-time communication
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework 