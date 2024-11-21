<script setup lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <!-- <div>
    <a href="https://www.electronjs.org/" target="_blank">
      <img src="./assets/electron.svg" class="logo electron" alt="Electron logo" />
    </a>
  </div>
  <HelloWorld msg="Electron + Vite + Vue" />
  <div class="flex-center">
    Place static files into the <code>/public</code> folder
    <img style="width: 2.4em; margin-left: .4em;" src="/logo.svg" alt="Logo">
  </div> -->
  <div class="wrapper">
    <form class="form">
        <div class="form-group flex-grow-1 w-100">
            <textarea class="form-control textarea" placeholder="Enter the text to encrypt" id="textToEncrypt"></textarea>
        </div>
        <button type="submit" class="btn btn-primary mt-2">Submit</button>
    </form>
  </div>  
</template>

<style>

</style>
