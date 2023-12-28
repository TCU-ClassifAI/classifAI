from flask import Flask, request
import os


app = Flask(__name__)

# Testing to see if Backend works properly
@app.route('/start_transcription', methods=['POST'])
def start_transcription():
    audio_file = request.files.get('file')
    report_id = request.form.get('reportID')
    print(report_id)
    
    # Just test if the audio is recieved properly
    folder_path = os.path.join(os.getcwd(), "audios")

    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    file_path = os.path.join(folder_path, audio_file.filename)
    audio_file.save(file_path)
    
    return {'success': True, 'message': 'File received and transcription started'}

if __name__ == '__main__':
    app.run(host='localhost', port=5555)  # random port
