export const Roles = Object.freeze({
  USER: 1,
  ADMIN: 2,
})

export const isSessionActive = async (req, res, next) => {
  try {
    if (req.session.login) {
      return next()
    }
    return res.status(401).send('No active session')

  } catch (error) {
    res.status(500).send({
      message: "Server internal error",
      error: error.message
    })
  }
}

/** 
 * @param minRequiredRole The minimum level of role required to continue with the request
*/
export const checkRole = (minRequiredRole) => {

  return (req, res, next) => {
    if (req.session.login || req.session.user.role === Roles.ADMIN) {
      if (req.session.user.role < minRequiredRole) {
        req.logger.info(`Rejecting request - reason: Insufficient permissions`)
        return res.status(401).send('Insufficient permissions')
      }
      return next()
    }
    req.logger.info('Rejecting request - reason: No active session')
    return res.status(401).send(`No active session found`)
  }
}