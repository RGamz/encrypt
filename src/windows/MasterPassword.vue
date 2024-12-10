<template>
  <body>
    <div class="passwordWindowWrapper">
        <form class="passwordWindowForm">
          <div class="mb-3 passwordWindowInput">
            <input type="password" class="form-control" id="passwordInputField" placeholder="Create master password">
          </div>
          
          <TogglePasswordCheckbox> </TogglePasswordCheckbox>
          <SubmitButton></SubmitButton>
        </form>
    </div>    
    
  </body>

</template>

<script>

  import TogglePasswordCheckbox from '../components/TogglePasswordCheckbox.vue'
  import SubmitButton from '../components/SubmitButton.vue'


  import { initToggleVisibility } from '../../electron/main/js/toggleVisibility.js'
  import { hashPassword } from '../../electron/main/js/crypt.js' 

  export default {
    mounted() {
      // Initialize the toggle visibility event listener
      initToggleVisibility(this.$el)

      // Now that the component is mounted, we can safely attach the form submit listener
      const form = this.$el.querySelector('.passwordWindowForm')
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const passwordInput = this.$el.querySelector('#passwordInputField')
        const password = passwordInput.value;

        const [hashedPassword, salt] = hashPassword(password);

        // Prepare data to send
        const data = { hashedPassword, salt };

        // Use the exposed API to send the hashed password and salt
        window.electronAPI.submitPassword(data);
      })
    }
  }

</script>

<style>

</style>

