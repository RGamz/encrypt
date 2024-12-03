function hashPassword(password) {
    // Initialize SJCL's random number generator
    sjcl.random.startCollectors();

    // Generate a random salt
    const saltBits = sjcl.random.randomWords(2); // Generates a 64-bit salt
    const saltHex = sjcl.codec.hex.fromBits(saltBits);

    // Use PBKDF2 to hash the password with the salt
    const iterations = 10000;
    const hashedPasswordBits = sjcl.misc.pbkdf2(password, saltBits, iterations, 256);
    const hashedPasswordHex = sjcl.codec.hex.fromBits(hashedPasswordBits);


    return [hashedPasswordHex , saltHex ];
}

window.hashPassword = hashPassword;