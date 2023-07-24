import { findUsers, updateUser, findUserById, findInactiveUsers, deleteInactiveUsers } from "../services/userServices.js";
import { transporter } from '../index.js';

export const getUsers = async (req, res) => {
  try {
    const users = await findUsers()
    res.status(200).send(users)
  } catch (error) {
    res.status(500).send(error)
  }
}

export const eraseInactiveUsers = async (req, res, next) => {
  try {
    const currentDate = new Date()

    const twoDaysAgo = new Date(currentDate)
    twoDaysAgo.setDate(currentDate.getDate() - 2)

    req.logger.info(`About to delete all inactive users inactive since ${twoDaysAgo}`)

    const inactiveUsers = await findInactiveUsers(twoDaysAgo)

    if (!inactiveUsers || inactiveUsers.length === 0) {
      req.logger.info('Cannot find inactive users. No users deleted.')
      return res.status(200).send('No inactive users found')
    }

    // Inactive users found, notify them they lost their user accounts
    inactiveUsers.forEach(user => {
      transporter.sendMail({
        from: 'no-reply',
        to: user.email,
        subject: `${user.first_name}, tu cuenta ha sido eliminada por inactividad`,
        html: `<p>Hola ${user.first_name},</p>
        
        <p>Lamentablemente, tuvimos que eliminar tu cuenta porque se durmió mas de la cuenta :(</p>
        <p>Desde este momento, el email que usaste está disponible para volver a registrarse.</p>
        
        <p>Esperamos volver a verte por Natufriend!</p>`
      })
    });

    const result = await deleteInactiveUsers(twoDaysAgo)

    req.logger.info(`Inactive users deleted`)
    res.status(200).send({
      status: 'success',
      deletedCount: `${result.deletedCount} inactive users deleted`,
      deletedUsers: inactiveUsers
    })

  } catch (error) {
    req.logger.error(error)
    res.status(500).send(`Error trying to delete inactive users`)
  }
}

export const uploadDocs = async (req, res, next) => {
  try {
    const files = req.file
    const userID = req.params.uid

    if (!files) {
      req.logger.info('No file received in the request')
      return res.status(400).send('No file received')
    }

    const isFound = await findUserById(userID)
    if (!isFound) {
      req.logger.info('User not found')
      return res.status(400).send('User not found')
    }

    const newDocsItem = {
      name: files.filename,
      reference: files.path
    }

    const isInfoUpdated = await updateUser(
      userID,
      { $push: { documents: newDocsItem } }
    )

    req.logger.debug(isInfoUpdated)

    req.logger.info(`
    <UPLOAD>
    user email: ${req.session.user.email} 
    user id:    ${userID}
    file name:  ${files.originalname}
    file type:  ${files.mimetype}
    file size:  ${files.size}
    file path:  ${files.path}
    -------------------------END------------------------`)

    res.status(201).send(`File '${files.originalname}' uploaded succesfully by '${req.session.user.email}'`)

  } catch (error) {
    res.status(500).send(`Error trying to upload files`)
  }
}