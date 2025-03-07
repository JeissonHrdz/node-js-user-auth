import express from 'express'

import { PORT } from './config.js'

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.post('/login', (req, res) => {
  res.json({ user: 'Jeisson' })
})

app.post('/register', (req, res) => {

})

app.post('/logout', (req, res) => {

})

app.post('/protected', (req, res) => {

})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
