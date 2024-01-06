# React Component Guides
Here are quickstart example guides with starter code for getting familiar with the Express backend, adjust code as needed.

## React Component Guide for Testing File Upload Endpoint

### Overview
This quickstart guide provides instructions for creating a React component to test the file upload endpoint of the Express server. The endpoint supports file uploads with additional data like `userId`, `reportID`, and other optional attributes.

### Prerequisites
- `axios` for making HTTP requests.

### Step-by-Step Guide

#### Step 1: Create a New React Component
Create a new React component.

#### Step 2: Import Dependencies
Import necessary dependencies:
```jsx
import React, { useState } from 'react';
import axios from 'axios';
```

#### Step 3: Create Form State
Set up state hooks for form data:
```jsx
const [file, setFile] = useState(null);
const [userId, setUserId] = useState('');
const [reportID, setReportID] = useState('');
```

#### Step 4: Handle File Change
Implement a function to handle file selection:
```jsx
const handleFileChange = (event) => {
  setFile(event.target.files[0]);
};
```

#### Step 5: Handle Form Submission
Create a function to handle form submission:
```jsx
const handleSubmit = async (event) => {
  event.preventDefault();
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);
  formData.append('reportID', reportID);

  try {
    const response = await axios.post('http://localhost:5000/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};
```

#### Step 6: Create Form in Render Method
In the component's render method, create a form for file upload:
```jsx
return (
  <form onSubmit={handleSubmit}>
    <input type="file" onChange={handleFileChange} />
    <input type="text" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
    <input type="text" placeholder="Report ID (optional)" value={reportID} onChange={(e) => setReportID(e.target.value)} />
    <button type="submit">Upload</button>
  </form>
);
```

#### Step 7: Integrate Component
Integrate into your React application where necessary.

### Testing
- Run your React app.
- Use the component to select a file and input the required fields.
- Submit the form and observe the console for responses or errors.

Ideally the reportID will come from our cognito auth instead of being entered, so the above code would need to be adjusted.

---

## React Component Guide for Testing Transcript Retrieval Endpoint

### Overview
This quickstart guide shows the basic idea to create a React component for testing the transcript retrieval endpoint in an Express server. The endpoint fetches a transcription based on a provided `reportID`.

### Step-by-Step Guide

#### Step 1: Create a New React Component
Create a new React component

#### Step 2: Import Dependencies
import necessary dependencies:
```jsx
import React, { useState } from 'react';
import axios from 'axios';
```

#### Step 3: Set Up State for Report ID and Transcript
Create state hooks for the report ID and fetched transcript:
```jsx
const [reportID, setReportID] = useState('');
const [transcript, setTranscript] = useState('');
const [error, setError] = useState('');
```

Here's how you can use the component to handle and display the test transcript data:

#### Step 4: Adjust Fetch Function

Make sure the fetch function correctly handles the JSON array response:

```jsx
const fetchTranscript = async () => {
  try {
    const response = await axios.get(`http://localhost:5000/transcript/${reportID}`);
    if (response.data.success) {
      setTranscript(response.data.transcription);
    } else {
      setError(response.data.message);
    }
  } catch (err) {
    setError(err.message);
  }
};
```

#### Step 5: Create Display Function for Structured Transcript

Modify the render method to include a function that maps over the array of transcript objects and displays the relevant information:

```jsx
const renderTranscript = () => {
  if (!transcript || transcript.length === 0) return <p>No transcript available.</p>;

  return transcript.map((item, index) => (
    <div key={index}>
      <p>Speaker {item.speaker_label} (from {item.start_time}s to {item.end_time}s):</p>
      <p>{item.transcript}</p>
    </div>
  ));
};
```

Then, use this function in your component's return statement:

```jsx
return (
  <div>
    <input type="text" placeholder="Report ID" value={reportID} onChange={(e) => setReportID(e.target.value)} />
    <button onClick={fetchTranscript}>Get Transcript</button>
    <div>{renderTranscript()}</div>
    {error && <p>Error: {error}</p>}
  </div>
);
```

#### Step 6: Integrate Component
Include the component in your React application where necessary.

### Testing
- Run your React application.
- Use the component to input a `reportID`.
- Click the button to fetch the transcript and observe the results displayed on the screen.

---

## React Component Guide for Testing Transcript Update Endpoint

### Overview
This quickstart guide outlines how to create a React component for testing the endpoint that updates a transcript. This endpoint accepts a `reportID` and new transcription text for a completed report.

### Prerequisites
- Install `axios` for making HTTP requests: `npm install axios`.

### Step-by-Step Guide

#### Step 1: Create a New React Component
Create a new React component.

#### Step 2: Import Dependencies
Import necessary dependencies:
```jsx
import React, { useState } from 'react';
import axios from 'axios';
```

#### Step 3: Set Up State for Inputs
Create state hooks for the `reportID`, new transcription text, and response message:
```jsx
const [reportID, setReportID] = useState('');
const [newTranscription, setNewTranscription] = useState('');
const [message, setMessage] = useState('');
```

#### Step 4: Implement Update Function
Create a function to handle the update request:
```jsx
const updateTranscription = async () => {
  try {
    const response = await axios.put(`http://localhost:5000/transcript/${reportID}`, {
      transcription: newTranscription
    });

    setMessage(response.data.message);
  } catch (err) {
    setMessage(err.response ? err.response.data.message : err.message);
  }
};
```

#### Step 5: Create Form in Render Method
In the component's render method, create a form for updating the transcript:
```jsx
return (
  <div>
    <input type="text" placeholder="Report ID" value={reportID} onChange={(e) => setReportID(e.target.value)} />
    <textarea placeholder="New Transcription" value={newTranscription} onChange={(e) => setNewTranscription(e.target.value)} />
    <button onClick={updateTranscription}>Update Transcription</button>
    <p>{message}</p>
  </div>
);
```

#### Step 6: Integrate Component
Integrate into your React application where necessary.

### Testing
- Run your React application.
- Use the component to input a `reportID` and new transcription text.
- Click the button to send the update request and observe the response message displayed on the screen.

