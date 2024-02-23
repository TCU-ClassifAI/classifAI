import time
from flask import Flask, jsonify, request
import os
import threading
import json


app = Flask(__name__)

job_status = {}
mock_duration = 6

# Simulates an asynchronous transcription process.
def mock_transcription_process_async(job_id):
    job_status[job_id] = {'status': 'in progress', 'start_time': time.time(), 'end_time': None, 'model_type': 'large-v3'}

    def transcription_task():
        start_time = time.time()
        mock_duration = 6  # Simulated duration in seconds
        job_status[job_id].update({'status': 'in progress', 'start_time': start_time, 'duration': mock_duration})
        time.sleep(mock_duration)  # Simulate processing delay
        end_time = start_time + mock_duration
        mock_result = json.dumps([
            {"speaker": "Speaker 3", "start_time": 60, "end_time": 7458, 
             "text": "We will hear argument this morning in Case Nineteen, Thirteen, Ninety-Two, Dobbs v. Jackson Women's Health Organization."},
            {"speaker": "Speaker 3", "start_time": 8219, "end_time": 8759, "text": "General Stewart."},
            {"speaker": "Speaker 0", "start_time": 9479, "end_time": 9700, "text": "Mr."},
            {"speaker": "Speaker 0", "start_time": 9720, "end_time": 15583, 
             "text": "Chief Justice, and may it please the Court, Roe v. Wade and Planned Parenthood v. Casey haunt our country."}
        ])
        job_status[job_id].update({'status': 'completed', 'start_time': start_time, 'end_time': end_time, 'result': mock_result})  
    # Start the transcription task in a new thread for non-blocking execution
    thread = threading.Thread(target=transcription_task)
    thread.start()



# Testing to see if Backend works properly
@app.route('/transcription/start_transcription', methods=['POST'])
def start_transcription():
    audio_file = request.files.get('file')
    report_id = request.form.get('reportId')
    print(report_id)
    
    # Just test if the audio is recieved properly
    script_dir = os.path.dirname(__file__)

    # Folder for storing audios relative to the script directory
    folder_path = os.path.join(script_dir, "audios")

    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    file_path = os.path.join(folder_path, audio_file.filename)
    audio_file.save(file_path)
    
    # Mock: Assuming job_id is generated and associated with the report_id for tracking.
    job_id = "mock_job_id_for_" + report_id
    
    # Mock: Transcription process
    mock_transcription_process_async(job_id)

    return jsonify({'message': 'File received and transcription started', 'job_id':job_id}),200 # return job_Id start "transcript"


# get status, return srt if complete
@app.route('/transcription/get_transcription_status', methods=['GET'])
def get_transcription_status():
    job_id = request.args.get('job_id')
    
    if job_id not in job_status:
        return jsonify({'error': 'Invalid job_id'}), 404

    job_info = job_status[job_id]
    if job_info['status'] == 'completed':
        duration = job_info['end_time'] - job_info['start_time']      
        response = {
            "job_id": job_id,
            "model_type": job_info['model_type'],
            "status": job_info['status'],
            "start_time": job_info['start_time'],
            "end_time": job_info['end_time'],
            "duration": duration,
            "result": job_info['result'] 
        }
        return jsonify(response), 200
    
    else:
        return jsonify({'job_id': job_id, 'status': job_info['status'], 'duration': mock_duration, 'message': 'Transcription is not completed yet.'})


if __name__ == '__main__':
    app.run(host='localhost', port=5555)  # random port
