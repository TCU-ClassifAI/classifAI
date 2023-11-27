# Project Structure

## Directory Structure of the Project


```bash
C: ClassifAI-engine
├───.github
│   └───workflows # Github Actions for CI/CD. Includes automated testing and deployment.
├───docs # Folder for documentation. Uses mkdocs.
│   ├───assets
│   ├───contribution
│   └─── # Documentation files. See docs/contribution/editing_docs.md for more information.
└───frontend # Front end for the engine. Uses React.
    ├───public
    └───src
        ├───Account
        ├───Login
        ├───Navbar
        ├───SignUp
        ├───SignOut
        ├───Main
            ├───Submission # Where the user submits the file to be processed.
            ├───components
            ├───pages
            ├───App.js
            ├───index.css
            └─── files
        ├───Upload
        ├───css
        ├───images
        └───pages
            ├───classification
            ├───dashboard
            ├───home
            ├───login
            ├───register
            ├───transcription
            └───upload
```

    
    
```

## Other Files

There are also a few other files that are not included in the above tree. These are:

* .pre-commit-config.yaml - Configuration for pre-commit hooks
* mkdocs.yml - Configuration for mkdocs (documentation)
* .gitignore - Files to ignore in git

