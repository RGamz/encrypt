document.getElementById('passwordInputForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const enteredPassword = document.getElementById('passwordInputField').value;

    // Use the exposed API to verify the password
    window.electronAPI.verifyPassword(enteredPassword);
});

// Handle incorrect password feedback
window.electronAPI.onPasswordIncorrect(() => {
    alert('Incorrect password. Please try again.');
});
