<template>

    <body>
        <div class="passwordWindowWrapper">
            <form class="passwordInputForm" id="passwordInputForm">
                <div class="mb-3 passwordInputField">
                    <input type="password" class="form-control" id="passwordInputField" placeholder="Enter your password" required>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="togglePasswordCheckbox">
                    <label class="form-check-label" for="togglePasswordCheckbox">
                        Show Password
                    </label>
                </div>

                <div class="passwordInputBtn">
                    <button type="submit" class="btn btn-primary mt-2">Submit</button>
                </div>
            </form>
        </div>

    </body>

</template>

<script>

    export default {
        
    }

</script>

<style>

</style>


