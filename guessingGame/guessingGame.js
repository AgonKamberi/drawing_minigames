const socket = io('http://localhost:3000');

var id = sessionStorage.getItem("id");
socket.emit("getLobbyData", id);
socket.emit("changeId", id);

socket.on("newId", (newId) => {
  sessionStorage.setItem("id", newId);
  id = newId;
});

socket.on("lobbyPlayers", (players, state) => {
    var parent = document.querySelector(".lobbyBody");
    parent.innerHTML = "";

    players.forEach(player => {
        var holder = document.createElement("div");
        holder.classList.add("item");

        var icon = document.createElement("img");
        icon.src = `../img/faceIcons/${player.icon}.svg`
        icon.classList.add("icon");

        const score = state.scores ? state.scores[player.id] : 0;

        var usernameText = document.createElement("p");
        usernameText.innerHTML = player.username + ": " + score;
        usernameText.classList.add("usernameText");

        holder.appendChild(icon);
        holder.appendChild(usernameText);
        parent.appendChild(holder);
    });
});

const colorCircle = document.querySelectorAll(".color-circle");

let isDrawing = false;
let lastPos = null;
let drawColor = "black";
let lineWidth = 15;
let canDraw = true;
let playerCount = 0;

var canvas = document.querySelector("canvas");
ctx = canvas.getContext("2d");

createPalette();

function createPalette() {
    const COLORS = [
        "black",
        "white",
        "blue",
        "purple",
        "red",
        "orange",
        "yellow",
        "green",
    ];
    const palette = document.getElementById("palette");
    COLORS.forEach((colorName) => {
        const colorElement = document.createElement("div");
        colorElement.classList.add("colorSquare");
        colorElement.style.backgroundColor = colorName;
        palette.appendChild(colorElement);
    });
}

function draw(e) {
  if(canDraw){
    const [x, y] = mousePos(e);
    if (lastPos) {
        socket.emit("drawing", drawColor, lineWidth, lastPos, [x, y], id);
        lastPos = [x, y];
    } else {
        lastPos = [x, y];
        socket.emit("drawing", drawColor, lineWidth, lastPos, [x, y], id);
    }
  }
}

socket.on("drawingServer", (color, width, startPos, endPos) => {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  ctx.moveTo(...startPos);
  ctx.lineTo(...endPos);
  ctx.closePath();
  ctx.stroke();
});

function mousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return [
      (e.clientX - rect.left) * (canvas.width / rect.width),
      (e.clientY - rect.top) * (canvas.height / rect.height),
  ];
}
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  draw(e);
});

canvas.addEventListener("mousemove", (e) => {
  if(isDrawing){
    draw(e);
  }
});

canvas.addEventListener("mouseleave", () => {
  lastPos = null;
});

canvas.addEventListener("mouseup", (e) => {
  isDrawing = false;
  lastPos = null;
});

document.getElementById("clearBtn").addEventListener("click", () => {
  if(canDraw){
    socket.emit("clearCanvas", id);
  }
});

document.getElementById("pen").addEventListener("click", () => {
  drawColor = "black";
  document.querySelectorAll(".widthExample").forEach((ex) => {
    ex.style.backgroundColor = "black";
  });
});

document.getElementById("eraser").addEventListener("click", () => {
  drawColor = "white";
  document.querySelectorAll(".widthExample").forEach((ex) => {
    ex.style.backgroundColor = "white";
  });
});

socket.on("clearCanvas", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

clearCanvas();

function clearCanvas(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

document.querySelectorAll(".colorSquare").forEach((square) => {
  square.addEventListener("click", () => {
      drawColor = square.style.backgroundColor;
      document.querySelectorAll(".widthExample").forEach((ex) => {
          ex.style.backgroundColor = drawColor;
      });
  });
});

document.querySelectorAll(".widthExample").forEach((ex) => {
  ex.addEventListener("click", () => {
      lineWidth = ex.clientWidth;
      document.querySelectorAll(".widthExample").forEach((other) => {
          other.style.opacity = 0.4;
      });
      ex.style.opacity = 1;
  });
});

// var isLeader = true;

// if(isLeader == true){
//   var word=['apple','purple','sun','table','computer','house','car','rocket','alien'];
  
//   wordPicker = word[Math.floor(Math.random()*word.length)];

//   socket.emit("getWord", wordPicker);
// }

// socket.emit("giveWord");

// var wordToType;
// var youGuestIt = false;

// socket.on("word", word => {
//   document.getElementById("wordPicker").innerHTML = word;
//   wordToType = word;
// });

// var username = sessionStorage.getItem("storageName");
// var icon = sessionStorage.getItem("storageIcon");
// var score;

// var wonPoints = false;

// function chat(){
//   var message = document.getElementById('chat').value;

//   if(canDraw == false){
//     if(username != ""){
//       if(message != ""){
//         if(message == wordToType){
//           youGuestIt = true;

//           messageSend = username + " guest it!";
//           socket.emit('send-message', messageSend);
//           document.getElementById('chatRows').innerHTML += "<span>" + username + " guest it!" + "</span>" + "</br>";
//           if(wonPoints == false){
//             score += 50;
//             wonPoints = true;
//           }
//         }
//         else{
//           if(youGuestIt == false){
//             document.getElementById('chatRows').innerHTML += "<span>" + username + ":" + " " + message + "</span>" + "</br>";
  
//             messageSend = username + ":" + " " + message;
          
//             socket.emit('send-message', messageSend);
          
//             document.getElementById('chat').value = "";
//           }
//         }
//       }
//     }
//   }
// };

// socket.on('recieve-message', (messageSend) => {
//   document.getElementById('chatRows').innerHTML += "<span>" + messageSend + "</span> </br>";
// });

// var lobbyBody;

// socket.on("getAllDivs", getGameDivs => {
//   playerCount = getGameDivs.length;
//   document.getElementById("numberOfPlayers").innerHTML = playerCount;
//   getGameDivs.forEach(element => {
//     document.querySelector(".lobbyBody").innerHTML += element;
//   });
// });

// socket.on("becomeArtist", randomUsername => {
//   if(username == randomUsername){
//     canDraw = true;
//     wordText.style.visibility = "visible";
//   }
// });

// function noTime(){
//   if(canDraw){
//     socket.emit("removeDivsFromArray");
//   }
//   sessionStorage.setItem("storageScore", score);
//   canDraw = false;
//   window.location.href = 'http://localhost:5500';
// }

// socket.emit("retry");

// setTimeout(function() {
//   socket.emit("giveBodyDiv");
//   socket.emit("pickRandom");
// }, 1000);

// socket.emit("pickRandom");

// setTimeout(function() {
//   $('.lobbyBodyDiv').remove();
//   socket.emit("giveBodyDiv");
// }, 2000);

// socket.on("getGameDiv", (sendThisGameBodyDiv) => {
//   document.querySelector(".lobbyBody").innerHTML += sendThisGameBodyDiv
// })

// socket.on("canDraw", function(){
//   canDraw = true;
// })