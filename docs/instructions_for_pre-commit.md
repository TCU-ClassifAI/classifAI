# Instructions for pre-commit


## Installation
In the backend directory of the project, run the following commands:
```bash
pip install -r requirements.txt -r requirements-dev.txt 

pre-commit install
```


## Usage
`pre-commit run --all-files` to run all hooks on all files.

Just commit as usual. The pre-commit hook will run automatically.



