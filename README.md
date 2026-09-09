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
