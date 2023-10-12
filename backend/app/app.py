from flask import Flask
from services.transcription import transcription

app = Flask(__name__)


# Define routes
@app.route("/")
def index():
    return "Hello, World!"


@app.route("/transcription")
def service1():
    result = transcription()
    return f"Service 1: {result}"


if __name__ == "__main__":
    app.run(debug=True)
