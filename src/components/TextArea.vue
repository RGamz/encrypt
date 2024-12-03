<template>
    <form class="form">
        <div class="form-group flex-grow-1 w-100">
            <textarea class="form-control textarea" placeholder="Enter the text to encrypt" id="textToEncrypt"></textarea>
        </div>
    </form>
</template>

<script lang="ts">

</script>

<style scoped>
  .textarea {
    flex: 1;
    resize: none; /* Prevent manual resizing */
    background-color: #e3eaf5;
    border: 1px solid #b0c4de;
    color: #333333;
    padding: 15px;
    font-size: 16px;
    border-radius: 4px;
  }
</style>
