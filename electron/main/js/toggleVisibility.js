
// This function sets up the event listener on the checkbox.
// Instead of querying `document`, we accept a container element (e.g., your component's root).
export function initToggleVisibility(container) {
  const toggleCheckbox = container.querySelector('#togglePasswordCheckbox');
  const passwordField = container.querySelector('#passwordInputField');
  
  if (toggleCheckbox && passwordField) {
    toggleCheckbox.addEventListener('change', () => {
      passwordField.type = (passwordField.type === "password") ? "text" : "password";
    });
  }
}
