class Utilities {
    // Converts a buffer to a UTF-8 string.
    static bufferToString(buffer) {
        return Buffer.from(buffer).toString('utf8');
    }
}

module.exports = Utilities;