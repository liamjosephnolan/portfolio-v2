# portfolio-v2

Liam Nolan's website, built with Astro. Deployed to GitHub Pages at
https://liamjosephnolan.com/ (the previous Jekyll site is archived in
`liamjosephnolan/liamjosephnolan.github.io` and still served at https://liamjosephnolan.github.io/).

```sh
npm install
npm run dev      # http://localhost:4321/
npm run build    # outputs to dist/
npm run preview
```

## Editing content

- `src/content/projects/*.md`: one file per main work item (carousel slide + `/projects/<file-name>/` page), ordered by `order`.
- `src/content/side-projects/*.md`: one file per side project (grid card + `/side-projects/<file-name>/` page), ordered by `order`. Images used inside a write-up go in `src/assets/side/` and are referenced by relative path (`../../assets/side/x.webp`).
- `src/content/site.json`: name, tagline, navigation, socials, About, Resume and Contact copy, 404 ring images.
- Images live in `public/assets/`. Reference them as `/assets/...`; `url()` in `src/lib/site.ts` adds the base path if one is ever set in `astro.config.mjs`.
- Colors and type are tokens in `src/styles/global.css`.

Search for `TODO:` to find placeholder text and images.

## Resume

The resume PDF is not committed. The deploy workflow fetches `LiamNolanCV.pdf` from the private
`liamjosephnolan/resume` repo with the `WEBSITE_REPO_TOKEN` secret and puts it in `public/resume/`
(gitignored) before the build, and copies it to `/assets/LiamNolanCV.pdf` (the old site's path). The resume repo's workflow re-runs this deploy whenever the CV changes. Without it the site shows a placeholder. To test locally:

```sh
mkdir -p public/resume
gh api -H "Accept: application/vnd.github.raw" repos/liamjosephnolan/resume/contents/LiamNolanCV.pdf > public/resume/LiamNolanCV.pdf
```

## Deploy

`.github/workflows/deploy.yml` builds with `withastro/action` and deploys with `actions/deploy-pages`
on every push to `main`. Settings → Pages → Source must be "GitHub Actions".

## Credits

Based on the [Elias Vent](https://github.com/agnilem/elias-vent-astro) Astro theme (MIT, see `LICENSE`),
with the WebGL carousel, footer shader and several sections removed. Sora is by Jonathan Barnbrook and
Julián Moncada, licensed under the SIL Open Font License 1.1.
