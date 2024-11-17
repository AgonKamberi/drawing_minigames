const express = require('express')
const { Socket } = require('socket.io')
const app = express()
const port = 3000
const server = app.listen(port)

const io = require('socket.io')(server, {
    cors: {
        origin: ['http://localhost:5500']
    }
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})