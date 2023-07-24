import { logger } from "../utils/loggerConfig.js"

export const middlewareLogger = (req, res, next) => {
    req.logger = logger
    next()
}

export const log = (level, message) => {
    const logLevels = {
        http: logger.http,
        error: logger.error,
        info: logger.info,
        warning: logger.warning,
        fatal: logger.fatal,
        debug: logger.debug,
    };

    const logFunction = logLevels[level];
    if (logFunction) {
        logFunction(message);
    }
};


export const logRequest = (req, res, next) => {
    const { method, url} = req

    req.logger.http(`${method} on ${url}`)
    next()
}