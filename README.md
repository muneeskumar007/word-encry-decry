# Cipherline

A small Flask app for password-based text encryption and decryption.

## Run locally

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
py app.py
```

Open http://127.0.0.1:5000.

Encrypted payloads include their random salt, so the server does not need to store keys or messages. Keep your passphrase safe: it cannot be recovered.

## Deploy to Netlify

This repository includes a Netlify serverless function and `netlify.toml` configuration.

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. In Netlify, choose **Add new site** and **Import an existing project**.
3. Select the repository and use the default build settings. The publish directory is `.` and the function directory is `netlify/functions`.
4. Deploy the site.

The static page is served from `index.html`, while `/api/transform` is routed to the Netlify function. The local Flask app remains available for development.
