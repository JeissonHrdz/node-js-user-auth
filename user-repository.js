import DBLocal from 'db-local'
import crypto from 'crypto'

import bcrypt from 'bcrypt'
import { SALT_ROUNDS } from './config.js'

const { Schema } = DBLocal({ path: './db' })

const User = Schema('user', {
  _id: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
})

export class UserRepository {
  static async create ({ username, password }) {
    Validation.username(username)
    Validation.password(password)
    // 3. Asegurarse que el username no exista
    const user = User.findOne({ username })
    if (user) throw new Error('username already exists')

    const id = crypto.randomUUID()
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    User.create({ _id: id, username, password: hashedPassword }).save()

    return id
  }

  static async login ({ username, password }) {
    Validation.username(username)
    Validation.password(password)

    const user = User.findOne({ username })
    if (!user) throw new Error('user not found')

    const isValid = await bcrypt.compareSync(password, user.password)
    if (!isValid) throw new Error('invalid password')

    const { password: _, ...publicUser } = user

    return publicUser
  }
}

class Validation {
  static username (username) {
    if (typeof username !== 'string') throw new Error('username must be a string')
    if (username.length < 3) throw new Error('username must be at least 3 characters')
  }

  static password (password) {
    if (typeof password !== 'string') throw new Error('password must be a string')
    if (password.length < 6) throw new Error('password must be at least 6 characters')
  }
}
