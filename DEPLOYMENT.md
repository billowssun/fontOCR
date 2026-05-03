# Vercel Deployment

This project is a static page with one Vercel Serverless Function for Baidu OCR.

## Required environment variables

Set these in Vercel Project Settings before using Baidu OCR:

- `BAIDU_API_KEY`
- `BAIDU_SECRET_KEY`

Without these variables, the page still works with local Tesseract OCR fallback.

## Deployment notes

- Deploy from the repository root, not from the `index` folder.
- `log/` and `ssl/` are excluded by `.vercelignore`.
- Do not upload `ssl/privkey.pem` to Vercel or Git.
