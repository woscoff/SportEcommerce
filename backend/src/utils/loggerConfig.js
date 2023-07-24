import winston from 'winston'

const logFileName = './errors.log'

const levels = {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5
}



const errorTransport = new winston.transports.File({
    filename: logFileName,
    level: 'error' 
})


const outputPrintfFormat = winston.format.printf(info => {
    return `[${info.level}] ${[info.timestamp]}: ${info.message}`
})


const devLogger = winston.createLogger({
    levels,
    format: winston.format.combine(
        //winston.format.colorize({ colors: colors }),
        winston.format.timestamp({
            format: 'DD-MMM-YYYY HH:mm:ss'
        }),
        outputPrintfFormat
    ),
    transports: [new winston.transports.Console({ level: 'debug' })]
})


const prodLogger = winston.createLogger({
    levels,
    format: winston.format.combine(
        //winston.format.colorize({ colors: colors }),
        winston.format.timestamp({
            format: 'DD-MMM-YYYY HH:mm:ss'
        }),
        outputPrintfFormat
    ),
    transports: [
        new winston.transports.Console({ level: 'info' }),
        errorTransport
    ]
})


const getLogger = () => {
    if (process.env.NODE_ENV === 'prod') {
        return prodLogger
    }
    return devLogger
}


export const logger = getLogger()
