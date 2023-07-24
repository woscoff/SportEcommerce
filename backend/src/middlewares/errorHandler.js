import { EErrors } from "../utils/errors/enums.js"

export const errorHandler = (error, req, res, next) => {
    switch (error.code) {
        case EErrors.REQUIRED_ERROR:
            res.send({ status: `error`, error: error.name })
            break
        default:
            res.send({ status: `error`, error: `Unhandled error` })
    }
}