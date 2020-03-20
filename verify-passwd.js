const argon2 = require('argon2');

/*
 * Argv[0] = Hash
 * Argv[1] = Password
 * Argv[2] = Salt
 */
async function main(argv) {
    try {
        if (await argon2.verify(argv[0], argv[1] + argv[2])) {
            console.log('Password matched.');
        } else {
            console.log('Password did not match.');
        }
    } catch (err) {
        console.log('An internal error happened while attempting to verify the password, try again!');
    }
}

main(process.argv.slice(2));