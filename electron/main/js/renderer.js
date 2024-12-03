document.getElementById("saveAndEncryptButton").addEventListener("click", (event) => {
    const textInApp = document.getElementById("textToEncrypt").value;
    window.electronAPI.sendAndEncrypt(textInApp);
  });

// call method form preload.js and install text from textarea in app
window.electronAPI.loadText().then(text => {
  document.getElementById("textToEncrypt").value = text;
});