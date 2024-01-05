# Editing Documentation

This Documentation is built using MkDocs and Material for MkDocs

For full documentation visit [mkdocs.org](https://www.mkdocs.org) and [squidfunk.github.io/mkdocs-material](https://squidfunk.github.io/mkdocs-material/)

> ### **TL;DR**
> Editing this documentation is easy, just edit the markdown files in the `docs` folder and push to the `main` branch. The documentation will be automatically built and deployed to [GitHub Pages](https://pages.github.com/).

## Installation

Install the latest version of MkDocs with `pip`:

```bash
pip install mkdocs mkdocs-material
```

## Commands

* `mkdocs new [dir-name]` - Create a new project.
* `mkdocs serve` - Start the live-reloading docs server.
* `mkdocs build` - Build the documentation site.
* `mkdocs -h` - Print help message and exit.
* `mkdocs gh-deploy` - Deploy to GitHub Pages 

mkdocs are automatically built and deployed to [GitHub Pages](https://tcu-instructional-ai.github.io/classifAI-engine/) using GitHub Actions. The configuration for this can be found in `.github/workflows/deploy_docs.yml`.

## Deploying to GitHub Pages

To deploy the documentation to GitHub Pages, run the following command:

```bash
mkdocs gh-deploy
```

## Project layout

    mkdocs.yml    # The configuration file.
    docs/
        index.md  # The documentation homepage.
        ...       # Other markdown pages, images and other files.
