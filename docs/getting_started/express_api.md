# API Endpoints
This documentation includes information about the endpoint, parameters, request body, response, and error handling. This documentation assumes familiarity with the Express.js framework and the multer library for file uploading.

---

Below is a simple API documentation for your POST route, formatted in Markdown:

---

## API Documentation for File Upload Endpoint

### POST `/upload`
This endpoint is responsible for uploading files to the web server, updating information in MongoDB, and transferring audio files to a specified workstation.

#### Request
- **URL**: `/upload`
- **Method**: `POST`
- **Headers**:
  - `Content-Type`: `multipart/form-data`
- **Body**:
  - `userId` (string, required): The user's unique identifier.
  - `file` (file, required): The file to be uploaded.
  - `reportID` (string, optional): The report's unique identifier.
  - Other optional attributes like `subject`, `grade level`, and `is_premium`.

#### Response
- **Success (File Uploaded and Processed)**:
  - **Status Code**: `200 OK`
  - **Content**:
    ```json
    {
      "uploadStatus": "successful",
      "transferStatus": "successful",
      "message": "File uploaded and [database entry created/transferred] successfully",
      "id": "[reportID]"
    }
    ```
- **Invalid File Type**:
  - **Status Code**: `400 Bad Request`
  - **Content**:
    ```json
    {
      "uploadStatus": "failed",
      "message": "Invalid file type provided"
    }
    ```
- **Missing User ID or File**:
  - **Status Code**: `400 Bad Request`
  - **Content**:
    ```json
    {
      "uploadStatus": "failed",
      "message": "No userId or file uploaded"
    }
    ```
- **Server Error or File Transfer Error**:
  - **Status Code**: `500 Internal Server Error`
  - **Content**:
    ```json
    {
      "uploadStatus": "failed",
      "transferStatus": "failed",
      "message": "An error occurred"
    }
    ```

#### Notes
- The endpoint supports a range of file types, including JSON, CSV, PDF, and several audio formats. Unsupported file types will result in an error.
- If the file is an audio file, it will be transferred to a workstation for additional processing.
- The `uploadStatus` and `transferStatus` fields in the response indicate the status of the file upload and the transfer process, respectively.

---

## API Documentation for Transcript Retrieval

### GET `/transcript/reportID`
This endpoint retrieves the transcription associated with a given report ID. The transcription status can be either in progress, completed, or encountered an error.

#### Request
- **URL**: `/transcript/reportID`
- **Method**: `GET`
- **URL Parameters**:
  - `reportID` (string): The unique identifier of the report for which the transcription is requested.

#### Response
- **Transcription Completed**:
  - **Status Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "transcription": "[transcription text]"
    }
    ```
- **Transcription in Progress**:
  - **Status Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": false,
      "message": "Transcription in progress."
    }
    ```
- **Transcription Error**:
  - **Status Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": false,
      "message": "An error occurred during transcription"
    }
    ```
- **Server Error**:
  - **Status Code**: `500 Internal Server Error`
  - **Content**:
    ```json
    {
      "success": false,
      "message": "An error occurred"
    }
    ```

#### Notes
- The API returns a `200 OK` status for all transcription states, with the `success` field in the JSON response indicating whether the transcription was completed successfully, is still in progress, or encountered an error.
- A `500 Internal Server Error` is returned for any server-side errors during the processing of the request.

---

## API Documentation for Transcription Update

### PUT `/transcript/reportID`
This endpoint is used to update the transcription of a report, provided that the report's status is marked as 'Completed'.

#### Request
- **URL**: `/transcript/reportID`
- **Method**: `PUT`
- **URL Parameters**:
  - `reportID` (string): The unique identifier of the report whose transcription is to be updated.
- **Body**:
  - `transcription` (string): The updated text of the transcription.

#### Response
- **Transcription Updated Successfully**:
  - **Status Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Transcription updated successfully"
    }
    ```
- **Transcription Update Failed**:
  - **Status Code**: `400 Bad Request`
  - **Content**:
    ```json
    {
      "success": false,
      "message": "Transcription can only be updated for completed files."
    }
    ```
- **Report Not Found**:
  - **Status Code**: `404 Not Found`
  - **Content**:
    ```json
    {
      "success": false,
      "message": "Report file not found."
    }
    ```
- **Server Error**:
  - **Status Code**: `500 Internal Server Error`
  - **Content**:
    ```json
    {
      "success": false,
      "message": "An error occurred"
    }
    ```

#### Notes
- The transcription can only be updated if the report's status is 'Completed'. Attempting to update a transcription for a report in any other status will result in a `400 Bad Request` response.
- A `404 Not Found` status is returned if the specified report ID does not correspond to an existing report.
- Any server-side errors during the process will result in a `500 Internal Server Error` response.

