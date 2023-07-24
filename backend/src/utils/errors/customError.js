export default class CustomError extends Error {
    constructor({ name = `Error`, cause, message, code = 4 }) {
        super(message);
        this.name = name;
        this.cause = cause;
        this.code = code;
    }

    // This method generates a new instance when called
    static createError({ name = `Error`, cause, message, code = 4 }) {
        const error = new CustomError({ name, cause, message, code });
        console.log(`${error.name}: ${error.cause}`)
        throw error;
    }
}