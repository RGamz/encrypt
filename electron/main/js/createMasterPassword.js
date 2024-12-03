document.querySelector('.passwordWindowForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const password = document.getElementById('passwordInputField').value;

  let [hashedPassword, salt ] = hashPassword(password);

  // Prepare data to send
  const data = { hashedPassword: hashedPassword, salt: salt };

  // Use the exposed API to send the hashed password and salt
  window.electronAPI.submitPassword(data);
});
