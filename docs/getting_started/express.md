
# Starting up the Web Server Backend

This guide outlines the steps to start up the backend server for ClassifAI.
---

## Step 1: Sync with GitHub Repository
Ensure you have the latest version of our codebase:

- **Pull Latest Files**: Execute `git pull origin main` to fetch the most recent files from the main branch on GitHub.
- **Merge Development Branch**: If working on a feature, merge the latest changes from the development branch into your current branch using `git merge dev`

## Step 2: Set Up Environment Variables
- **Retrieve .env File**: Download the `.env` file from our shared Google Drive, or copy the contents of the `.env` file into your local `.env` file.

## Step 3: Install Dependencies
Run `npm install` in the project directory to install all necessary dependencies.

## Step 4: Initialize MongoDB with Docker
Assuming you are in the ClassifAI parent directory:

- **Start Jaxon's Development MongoDB**: Use Docker to launch the MongoDB instance with `docker-compose -f ./resources/docker-compose.yml up`
- **Verify Connection**: Ensure that the MongoDB instance is running and accessible.

## Step 5: Populate Database with Test Data
- **Run Faker.js Script**: Execute `node ./backend/DB_Testing/faker.js` to fill the MongoDB database with test data.

## Step 6: Launch the test workstation
- **Start test workstation**: Run `python ./backend/Workstation_Testing/testWorkstation.py` to simulate the workstation server. (Useful for testing if your file is actually uploaded/sent)

## Step 7: Launch the Backend Server
- **Start Backend**: Run `node ./backend/server.js` to initiate the backend server.
- **Verify Operation**: Check `localhost:5000` to ensure the server is running and can connect to the MongoDB instance.
--- 

# Notes and Troubleshooting
- Ensure Docker is running before initiating MongoDB.
- For any issues related to database connections, check the MongoDB logs and the .env file configurations.
---

# (Optional) Easily View MongoDB Documents

Connect MongoDB Compass to the development MongoDB for easy data viewing:

### Step-by-Step Guide

#### Step 1: Install MongoDB Compass
Ensure you have MongoDB Compass installed on your system. If not, download and install it from the [MongoDB Compass Download Page](https://www.mongodb.com/try/download/compass).

#### Step 2: Gather Connection Details
Obtain the necessary connection details for your development MongoDB. Typically, this information includes:

- **Hostname**: The address of the MongoDB server.

- **Port**: The port number MongoDB is listening on.

- **Authentication**: Username and password if authentication is enabled.

- **Database**: The specific database you want to connect to (optional).

#### Step 3: Open MongoDB Compass
Launch MongoDB Compass. The initial screen will prompt you to enter your connection details.

#### Step 4: Enter Connection String
In MongoDB Compass, input the connection string in the format:

```
mongodb://[username]:[password]@[hostname]:[port]/[database]
```

Replace `[username]`, `[password]`, `[hostname]`, `[port]`, and `[database]` with the information found in the `.env` file.

#### Step 5: Connect to the Database
After entering the connection string, click the 'Connect' button. MongoDB Compass will attempt to connect to the development MongoDB instance.

#### Step 6: Explore the Data
Once connected, you can browse collections, view documents, and query the data using MongoDB Compass's user-friendly interface.



