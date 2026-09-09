from flask import Flask, jsonify, render_template, request

from password_crypto import DecryptionError, decrypt_text, encrypt_text

app = Flask(__name__)


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/api/transform")
def transform():
    data = request.get_json(silent=True) or {}
    mode = data.get("mode", "encrypt")
    text = data.get("text", "")
    passphrase = data.get("passphrase", "")

    if not isinstance(text, str) or not text.strip():
        return jsonify(error="Enter some text to process."), 400
    if not isinstance(passphrase, str) or len(passphrase) < 4:
        return jsonify(error="Use a passphrase with at least 4 characters."), 400
    if mode not in {"encrypt", "decrypt"}:
        return jsonify(error="Choose encrypt or decrypt."), 400

    try:
        result = encrypt_text(text, passphrase) if mode == "encrypt" else decrypt_text(text.strip(), passphrase)
    except (DecryptionError, ValueError) as error:
        return jsonify(error=str(error)), 400

    return jsonify(result=result, mode=mode)


if __name__ == "__main__":
    app.run(debug=True)
