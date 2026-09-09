"""Password-based text encryption helpers."""

import base64
import json
import os
from typing import Final

from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

SALT_LENGTH: Final = 16
ITERATIONS: Final = 600_000


class DecryptionError(ValueError):
    """Raised when an encrypted value cannot be decrypted."""


def _derive_key(passphrase: str, salt: bytes) -> bytes:
    if not passphrase:
        raise ValueError("A passphrase is required.")

    derivation = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=ITERATIONS,
    )
    return base64.urlsafe_b64encode(derivation.derive(passphrase.encode("utf-8")))


def encrypt_text(plain_text: str, passphrase: str) -> str:
    """Encrypt text and return a portable, URL-safe encrypted payload."""
    if not plain_text:
        raise ValueError("Text to encrypt is required.")

    salt = os.urandom(SALT_LENGTH)
    token = Fernet(_derive_key(passphrase, salt)).encrypt(plain_text.encode("utf-8"))
    envelope = {"salt": base64.urlsafe_b64encode(salt).decode("ascii"), "token": token.decode("ascii")}
    return base64.urlsafe_b64encode(json.dumps(envelope, separators=(",", ":")).encode("utf-8")).decode("ascii")


def decrypt_text(payload: str, passphrase: str) -> str:
    """Decrypt a payload created by :func:`encrypt_text`."""
    if not payload:
        raise ValueError("Encrypted payload is required.")

    try:
        envelope = json.loads(base64.urlsafe_b64decode(payload.encode("ascii")))
        salt = base64.urlsafe_b64decode(envelope["salt"].encode("ascii"))
        token = envelope["token"].encode("ascii")
        plain_text = Fernet(_derive_key(passphrase, salt)).decrypt(token)
        return plain_text.decode("utf-8")
    except (KeyError, TypeError, ValueError, UnicodeDecodeError, InvalidToken, json.JSONDecodeError) as error:
        raise DecryptionError("Unable to decrypt. Check the payload and passphrase.") from error
