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

  socket.on('getLobbyData', (id) => {
    const lobbyUserExists = allLobbys.find(lobby =>
      lobby.some(user => user.id === id)
    );
    socket.emit("lobbyPlayers", lobbyUserExists, lobbyUserExists.gameState);
  });

  socket.on("changeId", (id) => {
    const newId = socket.id;
    const userLobby = allLobbys.find(lobby =>
      lobby.some(user => user.id === id)
    );
  
    if (userLobby) {
      const user = userLobby.find(user => user.id === id);
      if (user) {
        user.id = newId;
  
        if (userLobby.gameState && userLobby.gameState.scores) {
          const scores = userLobby.gameState.scores;
          if (scores[id] !== undefined) {
            scores[newId] = scores[id];
            delete scores[id];
          }
        }
      }
  
      socket.emit("newId", newId);
    } else {
      console.error("User not found in any lobby.");
    }
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

  socket.on("startGuessingGame", () => {
    const userLobby = allLobbys.find(lobby =>
      lobby.some(user => user.id === socket.id)
    );

    if (userLobby) {
      const partyLeader = userLobby.find(user => user.partyLeader);
      if (partyLeader.id === socket.id) {
        userLobby.gameState = {
          currentRound: 1,
          currentDrawerIndex: 0,
          scores: {},
          totalRounds: 5
        };

        userLobby.forEach(user => {
          userLobby.gameState.scores[user.id] = 0;
          io.to(user.id).emit('enterGuessingGame', userLobby.gameState);
        });
      }
    }
  });

  socket.on('drawing', (...args) => {
    const userId = args[args.length - 1];
    const userLobby = allLobbys.find(lobby =>
      lobby.some(user => user.id === userId)
    );

    if (userLobby) {
      userLobby.forEach(user => {
        io.to(user.id).emit("drawingServer", ...args);
      });
    }
  });

  socket.on('clearCanvas', (userId) => {
    const userLobby = allLobbys.find(lobby =>
      lobby.some(user => user.id === userId)
    );

    if (userLobby) {
      userLobby.forEach(user => {
        io.to(user.id).emit("clearCanvas", user.id);
      });
    }
  });

  // socket.on("submitGuess", (guess) => {
  //   const userLobby = allLobbys.find(lobby =>
  //     lobby.some(user => user.id === socket.id)
  //   );

  //   if (userLobby && userLobby.gameState) {
  //     const currentDrawer = userLobby[userLobby.gameState.currentDrawerIndex];

  //     if (guess.correct) {
  //       userLobby.gameState.scores[socket.id] += 10;

  //       userLobby.forEach(user => {
  //         io.to(user.id).emit('scoreUpdated', userLobby.gameState.scores);
  //       });

  //       if (Object.values(userLobby.gameState.scores).length === userLobby.length - 1) {
  //         userLobby.gameState.currentDrawerIndex = (userLobby.gameState.currentDrawerIndex + 1) % userLobby.length;

  //         if (userLobby.gameState.currentDrawerIndex === 0) {
  //           userLobby.gameState.currentRound++;

  //           if (userLobby.gameState.currentRound > userLobby.gameState.totalRounds) {
  //             const winners = Object.keys(userLobby.gameState.scores).sort((a, b) => userLobby.gameState.scores[b] - userLobby.gameState.scores[a]);
  //             userLobby.forEach(user => {
  //               io.to(user.id).emit('gameEnded', { winners, scores: userLobby.gameState.scores });
  //             });
  //             delete userLobby.gameState;
  //             return;
  //           }
  //         }

  //         io.to(userLobby[userLobby.gameState.currentDrawerIndex].id).emit('yourTurnToDraw');
  //       }
  //     }
  //   }
  // });

  socket.on('disconnect', () => {
    connectedClients = connectedClients.filter(user => user.id !== socket.id);

    const userLobby = allLobbys.find(lobby =>
      lobby.some(user => user.id === socket.id)
    );

    if (userLobby && userLobby.gameState == null) {
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
