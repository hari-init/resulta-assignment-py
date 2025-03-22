from flask import Flask, render_template
from flask_socketio import SocketIO
import requests
import time
import threading
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

# URL for the mock API
MOCK_API_URL = 'http://localhost:5000/api/teams'

# Store the last known update time
last_update_time = None


def check_for_updates():
    """Check for updates from the mock API server"""
    global last_update_time

    while True:
        try:
            response = requests.get(MOCK_API_URL)
            if response.status_code == 200:
                data = response.json()
                current_update_time = data.get('last_updated')

                # If this is a new update, emit it to clients
                if current_update_time != last_update_time:
                    print(
                        f"New data detected, update time: {current_update_time}")
                    last_update_time = current_update_time
                    socketio.emit('data_update', data)
            else:
                print(f"Error fetching data: {response.status_code}")
        except Exception as e:
            print(f"Exception during update check: {e}")

        # Check every 5 seconds (more frequent than the 30 second update)
        time.sleep(5)


@socketio.on('connect')
def handle_connect():
    print('Client connected')
    # Get the latest data and send it immediately
    try:
        response = requests.get(MOCK_API_URL)
        if response.status_code == 200:
            socketio.emit('data_update', response.json())
    except Exception as e:
        print(f"Error fetching initial data: {e}")


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


if __name__ == '__main__':
    # Start the update check thread
    update_thread = threading.Thread(target=check_for_updates, daemon=True)
    update_thread.start()

    # Run the socketio app
    socketio.run(app, host='0.0.0.0', port=5001, debug=True)
