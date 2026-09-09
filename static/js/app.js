const form = document.querySelector('#crypto-form');
const message = document.querySelector('#message');
const passphrase = document.querySelector('#passphrase');
const resultWrap = document.querySelector('#result-wrap');
const result = document.querySelector('#result');
const errorMessage = document.querySelector('#error-message');
const submitLabel = document.querySelector('#submit-label');
const resultLabel = document.querySelector('#result-label');
const messageHint = document.querySelector('#message-hint');
const modeButtons = document.querySelectorAll('.mode-button');
let mode = 'encrypt';

function setMode(nextMode) {
  mode = nextMode;
  modeButtons.forEach((button) => button.classList.toggle('active', button.dataset.mode === mode));
  const encrypting = mode === 'encrypt';
  submitLabel.textContent = encrypting ? 'Encrypt message' : 'Decrypt message';
  resultLabel.textContent = encrypting ? 'Encrypted output' : 'Decrypted output';
  messageHint.textContent = encrypting ? 'Plain text in' : 'Encrypted payload in';
  message.placeholder = encrypting ? 'Write or paste something private...' : 'Paste a Cipherline payload...';
  resultWrap.hidden = true;
  errorMessage.hidden = true;
}

modeButtons.forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode)));

document.querySelector('#toggle-passphrase').addEventListener('click', (event) => {
  const isPassword = passphrase.type === 'password';
  passphrase.type = isPassword ? 'text' : 'password';
  event.currentTarget.textContent = isPassword ? 'Hide' : 'Show';
  event.currentTarget.setAttribute('aria-label', `${isPassword ? 'Hide' : 'Show'} passphrase`);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorMessage.hidden = true;
  resultWrap.hidden = true;
  submitLabel.textContent = 'Working...';

  try {
    const response = await fetch('/api/transform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, text: message.value, passphrase: passphrase.value }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Something went wrong.');
    result.textContent = data.result;
    resultWrap.hidden = false;
  } catch (error) {
    errorMessage.textContent = error.message;
    errorMessage.hidden = false;
  } finally {
    submitLabel.textContent = mode === 'encrypt' ? 'Encrypt message' : 'Decrypt message';
  }
});

document.querySelector('#copy-result').addEventListener('click', async (event) => {
  await navigator.clipboard.writeText(result.textContent);
  event.currentTarget.innerHTML = 'Copied <span aria-hidden="true">&#10003;</span>';
  window.setTimeout(() => { event.currentTarget.innerHTML = 'Copy <span aria-hidden="true">&#8599;</span>'; }, 1600);
});
