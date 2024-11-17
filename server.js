const express = require('express');
const app = express();
const port = 3000;
const server = app.listen(port);

const io = require('socket.io')(server, {
  cors: {
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

let connectedClients = [];

app.get('/', (req, res) => {
  res.send('Hello World!');
});

io.on('connection', (socket) => {
  socket.on('sendUserDetails', (userDetails) => {
    const { username, icon } = userDetails;
    
    const userExists = connectedClients.some(user => user.username === username);

      if (!userExists) {
        const user = {
          id: socket.id,
          username: username,
          icon: icon
        };
      
        connectedClients.push(user);

        socket.emit("getId", user.id);
      }
      else{
        console.log("User exists!");
      }
  });

  socket.on('disconnect', () => {
    connectedClients = connectedClients.filter(user => user.id !== socket.id);
  });
});
