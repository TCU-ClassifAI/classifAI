# Project Structure

## Directory Structure of the Project


```bash
C: ClassifAI
├── .github
│   └── workflows              # Github Actions for CI/CD. Includes automated testing and deployment.
├── docs                       # Folder for documentation. Uses mkdocs.
│   ├── assets
│   ├── images                 # Images for documentation.
│   ├── swagger.yaml           # OpenAPI spec for the API, see API Reference for more information.
│   └── [various .md files]    # Documentation files. See docs/contribution/editing_docs.md for more information.
├── frontend                   # Front end for the engine. Uses React/Vite.
│   ├── public
│   └── src
│       ├── Account
│       ├── Login
│       ├── Navbar
│       ├── SignUp
│       ├── SignOut
│       ├── Main
│       │   ├── Submission     # Where the user submits the file to be processed.
│       │   ├── components
│       │   ├── pages
│       │   ├── App.js
│       │   ├── index.css
│       │   └── files
│       ├── Upload
│       ├── css
│       ├── images
│       └── pages
│           ├── classification
│           ├── dashboard
│           ├── home
│           ├── login
│           ├── register
│           ├── transcription
│           └── upload
├── backend                    # Backend for the engine. Includes routes, database config, server entry point.
│   ├── routes
│   │   ├── transcription.js
│   │   ├── upload.js
│   │   ├── user.js
│   │   └── utils.js
│   ├── testing
│   ├── mongo.js               # MongoDB configuration script.
│   ├── server.js              # Backend server entry point.
│   └── package.json/package-lock.json
├── resources                  # Resources for Docker and database initialization.
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── mongo-init.js          # MongoDB initialization script.
│   └── .dockerignore
├── .gitignore
├── .pre-commit-config.yaml
├── mkdocs.yml
└── README.md
```
