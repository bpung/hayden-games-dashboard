# Hayden's Games Dashboard

This repository hosts a static portal site named **Hayden's Games** and aggregates each game repository as a Git submodule.

## Repository model

- `hayden-games-dashboard` is the deployable hub site.
- Each individual game remains an independent Git repository.
- `hayden-games-dashboard` pins exact game revisions via submodule commits.

## Structure

- `games/<slug>/` - game submodules
- `games.manifest.json` - game metadata for tiles and build behavior
- `scripts/build-site.mjs` - builds an aggregated static site into `site/`

## First-time setup

```bash
git submodule update --init --recursive
```

## Build and run

```bash
npm run build
npm run serve
```

Then open `http://localhost:4188`.

## Deployment (GitHub Pages)

This repo includes a workflow at `.github/workflows/deploy-pages.yml` that:

- checks out submodules
- runs `npm run build`
- deploys the generated `site/` folder to GitHub Pages

After the first push:

1. Open repo settings on GitHub.
2. Go to **Pages**.
3. Set **Source** to **GitHub Actions**.

## Updating a game

1. Commit/push changes in the game's own repository.
2. In this repository, update that submodule to the desired commit.
3. Commit the submodule pointer update in this repo.
4. Rebuild and deploy this repo.
