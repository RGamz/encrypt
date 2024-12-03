document.getElementById('togglePasswordCheckbox').addEventListener('change', function () {
    var x = document.getElementById("passwordInputField");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
});
