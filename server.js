const express = require('express');
const app = express();
const port = 3000;
const server = app.listen(port);

const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:5500",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

let connectedClients = [];
let allLobbys = [];

app.get('/', (req, res) => {
  res.send('Hello World!');
});

io.on('connection', (socket) => {
  socket.on('sendUserDetails', (userDetails) => {
    const { username, icon, id } = userDetails;

    const userExists = connectedClients.some(user => user.id === id);
    const lobbyUserExists = allLobbys.find(lobby =>
      lobby.some(user => user.id === id)
    );

    if (!userExists) {
      const user = {
        id: socket.id,
        username: username,
        icon: icon
      };

      connectedClients.push(user);
      socket.emit("getId", user.id);
    } else {
      socket.id = id;
    }

    if (!lobbyUserExists) {
      const user = {
        id: socket.id,
        username: username,
        icon: icon,
        partyLeader: true
      };

      const newLobby = [user];
      allLobbys.push(newLobby);

      socket.emit("getStarterLobby", newLobby);
    } else {
      socket.emit("getStarterLobby", lobbyUserExists);
    }
  });

  socket.on('getPlayersOnline', () => {
    const userLobby = allLobbys.find(lobby =>
      lobby.some(user => user.id === socket.id)
    );

    const filteredClients = connectedClients.filter(client => {
      if (client.id === socket.id) return false;

      if (userLobby && userLobby.some(user => user.id === client.id)) {
        return false;
      }
      return true;
    });

    socket.emit("onlinePlayers", filteredClients);
  });

  socket.on('getPlayersLobby', (id) => {
    const lobbyUserExists = allLobbys.find(lobby =>
      lobby.some(user => user.id === id)
    );
    socket.emit("lobbyPlayers", lobbyUserExists);
  });

  socket.on('invitePlayer', (playerId) => {
    const user = connectedClients.find(user => user.id === socket.id);
    io.to(playerId).emit('receiveInvite', user);
  });

  socket.on('acceptInvite', (playerId, userId) => {
    const playerLobby = allLobbys.find(lobby =>
      lobby.some(user => user.id === playerId)
    );

    const userLobby = allLobbys.find(lobby =>
      lobby.some(user => user.id === userId)
    );

    const user = userLobby.find(user => user.id === userId);

    userLobby.splice(userLobby.indexOf(user), 1);

    if (userLobby.length === 0) {
      allLobbys = allLobbys.filter(lobby => lobby !== userLobby);
    }

    user.partyLeader = false;

    playerLobby.push(user);

    playerLobby.forEach(userInLobby => {
      io.to(userInLobby.id).emit("lobbyPlayers", playerLobby);
    });

    if (userLobby.length > 0) {
      userLobby.forEach(userInLobby => {
        io.to(userInLobby.id).emit("lobbyPlayers", userLobby);
      });
    }
  });

  socket.on('kickPlayer', (kickedUserId) => {
    const userLobby = allLobbys.find(lobby =>
      lobby.some(user => user.id === socket.id)
    );
  
    if (userLobby) {
      const partyLeader = userLobby.find(user => user.partyLeader);
      if (partyLeader && partyLeader.id === socket.id) {
        const kickedUser = userLobby.find(user => user.id === kickedUserId);
        if (kickedUser) {
          userLobby.splice(userLobby.indexOf(kickedUser), 1);
  
          io.to(kickedUser.id).emit('kicked');
  
          userLobby.forEach(user => {
            io.to(user.id).emit('lobbyPlayers', userLobby);
          });
  
          if (userLobby.length === 0) {
            allLobbys = allLobbys.filter(lobby => lobby !== userLobby);
          }
  
          kickedUser.partyLeader = true;
          const newLobby = [kickedUser];
          allLobbys.push(newLobby);
  
          io.to(kickedUser.id).emit('newLobbyCreated', newLobby);
        }
      }
    }
  });

  socket.on('disconnect', () => {
    connectedClients = connectedClients.filter(user => user.id !== socket.id);

    const userLobby = allLobbys.find(lobby =>
      lobby.some(user => user.id === socket.id)
    );

    if (userLobby) {
      const userIndex = userLobby.findIndex(user => user.id === socket.id);
      if (userIndex !== -1) {
        userLobby.splice(userIndex, 1);
      }

      if (userLobby.length > 0) {
        if (!userLobby.some(user => user.partyLeader)) {
          userLobby[0].partyLeader = true;
        }

        userLobby.forEach(user => {
          io.to(user.id).emit("lobbyPlayers", userLobby);
        });
      } else {
        allLobbys = allLobbys.filter(lobby => lobby !== userLobby);
      }
    }
  });
});
