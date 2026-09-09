const crypto = require('node:crypto');

const ITERATIONS = 600000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url');
}

function deriveKey(passphrase, salt) {
  return crypto.pbkdf2Sync(passphrase, salt, ITERATIONS, 32, 'sha256');
}

function encryptText(text, passphrase) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', deriveKey(passphrase, salt), iv);
  const ciphertext = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const envelope = {
    salt: base64UrlEncode(salt),
    iv: base64UrlEncode(iv),
    tag: base64UrlEncode(cipher.getAuthTag()),
    data: base64UrlEncode(ciphertext),
  };
  return base64UrlEncode(JSON.stringify(envelope));
}

function decryptText(payload, passphrase) {
  const envelope = JSON.parse(base64UrlDecode(payload).toString('utf8'));
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    deriveKey(passphrase, base64UrlDecode(envelope.salt)),
    base64UrlDecode(envelope.iv),
  );
  decipher.setAuthTag(base64UrlDecode(envelope.tag));
  return Buffer.concat([
    decipher.update(base64UrlDecode(envelope.data)),
    decipher.final(),
  ]).toString('utf8');
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'POST requests only.' }) };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { mode = 'encrypt', text = '', passphrase = '' } = data;
    if (typeof text !== 'string' || !text.trim()) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Enter some text to process.' }) };
    }
    if (typeof passphrase !== 'string' || passphrase.length < 4) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Use a passphrase with at least 4 characters.' }) };
    }
    if (mode !== 'encrypt' && mode !== 'decrypt') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Choose encrypt or decrypt.' }) };
    }

    const result = mode === 'encrypt'
      ? encryptText(text, passphrase)
      : decryptText(text.trim(), passphrase);
    return { statusCode: 200, body: JSON.stringify({ result, mode }) };
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Unable to decrypt. Check the payload and passphrase.' }),
    };
  }
};
