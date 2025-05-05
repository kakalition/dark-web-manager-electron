const bcrypt = require('bcrypt')

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

async function main() {
  console.log('Hashing password...')
  console.log(await hashPassword('00000000'))
}

main()
