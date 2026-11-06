let token = '';
const healthLabel = document.querySelector('#health-label');
const loginMessage = document.querySelector('#login-message');
const adminButton = document.querySelector('#admin-button');
const adminResult = document.querySelector('#admin-result');

fetch('/health')
  .then((response) => {
    if (!response.ok) throw new Error('API no disponible');
    healthLabel.textContent = 'API operativa';
  })
  .catch(() => {
    healthLabel.textContent = 'API no disponible';
    document.querySelector('.status-dot').style.background = '#fb7185';
  });

document.querySelector('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  loginMessage.textContent = 'Generando token...';
  const user = document.querySelector('#user').value;
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ user }),
  });
  const data = await response.json();
  if (!response.ok) {
    loginMessage.textContent = data.error;
    return;
  }
  token = data.token;
  loginMessage.textContent = 'Token generado correctamente.';
  adminButton.disabled = false;
});

adminButton.addEventListener('click', async () => {
  const response = await fetch('/api/admin', {
    headers: { authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) {
    adminResult.textContent = data.error;
    return;
  }
  adminResult.textContent = `Acceso autorizado. Bienvenido, ${data.user.username}. Rol: ${data.user.role}`;
  adminResult.classList.remove('muted');
});
