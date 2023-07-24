import passport from 'passport';
import jwt from 'jsonwebtoken'
import { createHash, validatePassword } from '../utils/bcrypt.js';
import { transporter } from '../index.js';
import { findUserByEmail, findUserById } from '../services/userServices.js';
import { updateUser } from '../services/userServices.js';

// Public functions
export const registerUser = async (req, res, next) => {
  try {
    passport.authenticate('register', async (err, user) => {
      if (err) {
        req.logger.error(`Error on register procedure - ${err.message}`)
        return res.status(401).send({
          message: `Error on register`,
          error: err.message
        })
      }
      if (!user) {
        req.logger.info('Register process cancelled - Email already in use')
        return res.status(401).send('Email already in use')
      }
      req.logger.info(`User registered`)
      return res.status(200).send('User succesfully registered')
    })(req, res, next)
  } catch (error) {
    req.logger.error(`Error in register procedure - ${error.message}`)
    res.status(500).send({
      message: 'Internal server error',
      error: error.message
    })
  }
}

export const loginUser = async (req, res, next) => {
  try {
    passport.authenticate('login', (err, user) => {
      if (err) {
        req.logger.error(`Login error - ${err.message}`)
        return res.status(401).send({
          message: `Error on login`,
          error: err.message
        })
      }
      if (!user) {
        req.logger.info(`Login error - wrong credentials`)
        return res.status(401).send(`Wrong credentials`)
      }
      req.session.login = true
      req.session.user = user

      req.logger.info(`User logged in < ${req.session.user.email} >`)

      return res.status(200).send(`Welcome ${req.session.user.first_name}`)
    })(req, res, next)
  } catch (error) {
    req.logger.error(`Error in log-in procedure - ${error.message}`)
    res.status(500).send({
      message: "Server internal error",
      error: error.message
    })
  }
}

export const sendResetPasswordLink = async (req, res, next) => {
  const { email } = req.body

  try {
    const user = await findUserByEmail(email)
    if (!user) {
      res.status(404).send({
        status: 'error',
        message: 'Email not found in database'
      })
      return
    }
    // * User email found

    const resetLink = await generatePasswordResetLink(user, req, res)

    const mailToSend = {
      from: 'no-reply',
      to: email,
      subject: 'Password reset link',
      html: `
      <p>Hola ${user.first_name},</p>
      <p>Haz click <a href="${resetLink}">aquí</a> para reestablecer tu contraseña:</p>
      
      <p>Si no solicitaste un cambio de contraseña, ignora este email.</p>`
    }
    transporter.sendMail(mailToSend)

    req.logger.info(`Password reset link sent to ${email}`)
    res.status(200).send({
      status: 'success',
      message: `Password reset link sent to ${email}`
    })

  } catch (error) {
    req.logger.error(`Error in password reset procedure - ${error.message}`)
    res.status(500).send({
      status: 'error',
      message: error.message
    })
    next(error)
  }
}

export const resetPassword = async (req, res, next) => {
  const { password, confirmPassword, token } = req.body

  if (!token) {
    res.status(401).send({
      status: 'error',
      message: 'Token expired'
    })
    return
  }

  if (!password) {
    res.status(400).send({
      status: 'error',
      message: 'Enter a valid password'
    })
    return
  }

  try {
    const readToken = jwt.verify(token, process.env.JWT_SECRET)
    const userID = readToken.user_id
    const foundUser = await findUserById(userID)

    if (!foundUser) {
      res.status(404).send({
        status: 'error',
        message: 'User not found'
      })
    }

    if (password !== confirmPassword) {
      res.status(400).send({
        status: 'error',
        message: 'Both password must match'
      })
      return
    }

    if (await validatePassword(password, foundUser.password)) {
      res.status(400).send({
        status: 'error',
        message: 'New password must be different from the current one'
      })
      return
    }

    // * All test passed, change the password
    const newPassword = await createHash(password.toString())
    await updateUser(foundUser._id, { password: newPassword, })
    res.status(200).send({
      status: 'success',
      message: 'Password updated succesfully'
    })

  } catch (error) {
    res.status(500).send({
      message: 'Error on password reset',
      error: error.message
    })
    next(error)
  }
}

export const destroySession = async (req, res) => {
  try {
    if (req.session.login) {
      const username = req.session.user.first_name
      req.session.destroy()
      req.logger.info(`${username} logged out`)
      res.status(200).send(`Session "${username}" terminated.`)
    } else {
      req.logger.debug('No active session')
      return res.status(401).send(`No active session found`)
    }
  } catch (error) {
    req.logger.error(`Error in logout procedure - ${error.message}`)
    res.status(500).send({
      message: "Server internal error",
      error: error.message
    })
  }
}
export const getSession = async (req, res) => {
  try {
    if (req.session.login) {
      req.logger.debug(req.session.user)
      res.status(200).json(req.session.user);
    } else {
      req.logger.debug('No active session')
      return res.status(401).send(`No active session found`)
    }
  } catch (error) {
    res.status(500).send({
      message: "Server internal error",
      error: error.message
    })
  }
}

// Internal functions 
async function generatePasswordResetLink(user, req, res) {

  const token = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })
  req.logger.info(`Created password reset cookie: ${token}`)

  return `http://localhost:${process.env.PORT}/password/reset/${token}`
}
