const socket = io('http://localhost:3000');

var id = sessionStorage.getItem("id");
var username = sessionStorage.getItem("username");
var isLoggedIn = false;
var userData = [];

if(username == null){
  fetch("http://localhost/drawing_minigames_be/isLoggedIn.php", {
      method: "GET",
      credentials: 'include'
  })
  .then(response => response.json())
  .then(data => {
      username = data.data.username;
      userData = data.data;
      isLoggedIn = true;
  })
  .catch(error => console.error("Error:", error));
}

var currentDrawer = false;
var guessedIt = false;
socket.emit("getLobbyData", id);
socket.emit("changeId", id);

socket.on("newId", (newId) => {
  sessionStorage.setItem("id", newId);
  id = newId;
  socket.emit("connectedGuessingGame", id);
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
  if(currentDrawer){
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
  if(currentDrawer){
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

socket.on("addMessage", (message) => {
  document.getElementById('chatRows').innerHTML += "<span>" + message + "</span>" + "</br>";
});

socket.on("getWord", (word) => {
  currentDrawer = true;
  document.getElementById("wordPicker").innerHTML = word;
});

socket.on("getWordLength", (length) => {
  currentDrawer = false;
  guessedIt = false;
  document.getElementById("wordPicker").innerHTML = "";

  while(length > 0){
    document.getElementById("wordPicker").innerHTML += "_";
    length--;
  }
});

socket.on("guessedIt", (word) => {
  document.getElementById("wordPicker").innerHTML = word;

  guessedIt = true;
});

function chat(){
  var guess = document.getElementById('chat').value;

  if(!currentDrawer && !guessedIt){
    socket.emit("submitGuess", guess, username, id);
  }
};

let animationFrameId = null;

socket.on("startTimer", (duration) => {
  const progressCircle = document.querySelector(".progress-circle");
  const circleRadius = 45;
  const circleCircumference = 2 * Math.PI * circleRadius;

  progressCircle.style.strokeDasharray = circleCircumference;
  progressCircle.style.strokeDashoffset = circleCircumference;

  let startTime = null;

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  function animate(time) {
    if (!startTime) startTime = time;
    const elapsed = (time - startTime) / 1000;

    const progress = Math.max(0, circleCircumference - (elapsed / duration) * circleCircumference);
    progressCircle.style.strokeDashoffset = progress;

    if (elapsed < duration) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      progressCircle.style.strokeDashoffset = 0;
      if (currentDrawer) {
        socket.emit("finishedRound", id);
      }
    }
  }

  animationFrameId = requestAnimationFrame(animate);
});

function showLeaderboardModal() {
  const modal = document.getElementById("leaderboardModal");
  modal.classList.add("show");
}

function closeLeaderboardModal() {
  window.location.href = "../lobby.html";
}

document.getElementById("closeLeaderboardBtn").addEventListener("click", function() {
  closeLeaderboardModal();
});

function updateLeaderboard(sortedScoresWithNames) {
  const leaderboardList = document.getElementById("leaderboardList");
  leaderboardList.innerHTML = "";

  sortedScoresWithNames.forEach((player, index) => {
      const li = document.createElement("li");

      const icon = document.createElement("img");
      icon.src = `../img/faceIcons/${player.icon}.svg`;
      icon.classList.add("icon");

      li.innerHTML = `
        <span class="position">#${index + 1}</span>
        <span class="player-info">
          <img src="${icon.src}" alt="${player.username}'s icon" width="100px">
          </br>
          <span class="username">${player.username}</span>
        </span>
        <span class="score">${player.score}</span>
      `;

      leaderboardList.appendChild(li);
  });
}

socket.on('FinishedGame', (sortedScoresWithNames) => {
  updateLeaderboard(sortedScoresWithNames);
  showLeaderboardModal();
});

socket.on('GetXp', (xp) => {
  if (isLoggedIn) {
    updateXP(xp);
  }
});

async function updateXP(xp) {
  const formData = new FormData();
  formData.append('xp', xp);
  formData.append('id', userData.id);

  try {
    const response = await fetch("http://localhost/drawing_minigames_be/addXP.php", {
      method: 'POST',
      body: formData,
    });

    const textResponse = await response.text();
    const data = JSON.parse(textResponse);

    if (data.success) {
    } else {
      alert('Error updating profile: ' + data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}