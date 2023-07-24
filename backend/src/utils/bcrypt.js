import bcrypt from 'bcrypt'

/**@param password Password to be hashed */
export const createHash = async (password) => {
  return bcrypt.hash(password, await bcrypt.genSalt(parseInt(process.env.SALT)))
}

/** 
* @param password Password to be tested, not hashed
* @param storedPassword Password already hashed
*/
export const validatePassword = async (password, storedPassword) => {
  return await bcrypt.compare(password, storedPassword)
}