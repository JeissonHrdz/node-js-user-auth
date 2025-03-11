import express from 'express'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { PORT, SECRETE_JWT_KEY } from './config.js'
import { UserRepository } from './user-repository.js'

const app = express()

app.set('view engine', 'ejs')
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
  const token = req.cookies.access_token
  if (!token) return res.render('index')
  try {
    const data = jwt.verify(token, SECRETE_JWT_KEY)
    res.render('index', data)
  } catch (error) {
    res.render('index')
  }
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body // Cuerpo de la peticion
  try {
    const user = await UserRepository.login({ username, password })
    const token = jwt.sign({ id: user._id, username: user.username }, SECRETE_JWT_KEY, {
      expiresIn: '1h'
    })
    res
      .cookie('access_token', token, {
        httpOnly: true, // la coockie solo se puede leer en el servidor
        secure: process.env.NODE_ENV === 'production', // solo se puede acceder en https
        sameSite: 'strict', // solo se puede acceder desde el mismo dominio
        maxAge: 60 * 60 * 1000 // 1 hora
      })
      .send(user)
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body // Cuerpo de la peticion
  console.log(req.body)
  try {
    const id = await UserRepository.create({ username, password })
    res.send({ id })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.post('/logout', (req, res) => {

})

app.get('/protected', (req, res) => {
  const token = req.cookies.access_token
  if (!token) return res.status(403).send('unauthorized')
  try {
    const data = jwt.verify(token, SECRETE_JWT_KEY)
    res.render('protected', data)
  } catch (error) {
    res.status(401).send('unauthorized')
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
