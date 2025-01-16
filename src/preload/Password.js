import bcrypt from 'bcrypt'

async function hashPassword(password) {
  try {
    const saltRounds = 10 // Number of salt rounds (higher is more secure, but slower)
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    return hashedPassword
  } catch (error) {
    console.error('Error hashing password:', error)
    throw error // Re-throw the error to be handled elsewhere
  }
}

async function comparePasswords(password, hashedPassword) {
  try {
    const match = await bcrypt.compare(password, hashedPassword)
    return match
  } catch (error) {
    console.error('Error comparing passwords:', error)
    throw error
  }
}

export default { hashPassword, comparePasswords }
