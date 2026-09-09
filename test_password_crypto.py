import unittest

from password_crypto import DecryptionError, decrypt_text, encrypt_text


class PasswordCryptoTests(unittest.TestCase):
    def test_round_trip(self):
        message = "A private note with unicode: cafe"
        payload = encrypt_text(message, "correct horse")
        self.assertNotEqual(payload, message)
        self.assertEqual(decrypt_text(payload, "correct horse"), message)

    def test_wrong_passphrase_fails(self):
        payload = encrypt_text("secret", "right passphrase")
        with self.assertRaises(DecryptionError):
            decrypt_text(payload, "wrong passphrase")


if __name__ == "__main__":
    unittest.main()
