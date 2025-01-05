const socket = io('http://localhost:3000');

var icon;

sendData();

function sendData(){
    var username = sessionStorage.getItem("username");
    icon = sessionStorage.getItem("icon");
    var id = sessionStorage.getItem("id");
    var userDetails = {username, icon, id};

    if(username == null){
        fetch("http://localhost/drawing_minigames_be/isLoggedIn.php", {
            method: "GET",
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            icon = data.data.icon;
            username = data.data.username;
            userDetails = {username, icon, id}

            console.log(userDetails);

            socket.emit("sendUserDetails", userDetails);
        })
        .catch(error => console.error("Error:", error));
    }
    else{
        fetch("http://localhost/drawing_minigames_be/logout.php", {
            credentials: 'include'
        })
        .then(response => response.text())
        .catch(error => console.error("Error:", error));

        socket.emit("sendUserDetails", userDetails);
    }
}

function createLobby(lobbys){
    var parent = document.getElementById("lobby");

    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }

    lobbys.forEach(player => {
        var holder = document.createElement("div");
        holder.classList.add("item");

        var icon = document.createElement("img");
        icon.src = `img/faceIcons/${player.icon}.svg`
        icon.classList.add("icon");

        var usernameText = document.createElement("p");
        usernameText.innerHTML = player.username;
        usernameText.classList.add("usernameText");

        holder.appendChild(icon);
        holder.appendChild(usernameText);
        parent.appendChild(holder);
    });

    invites.forEach(player => {
        var holder = document.createElement("div");
        holder.classList.add("item");

        var icon = document.createElement("img");
        icon.src = `img/faceIcons/${player.icon}.svg`
        icon.classList.add("icon");

        var usernameText = document.createElement("p");
        usernameText.innerHTML = player.username;
        usernameText.classList.add("usernameText");

        var acceptButton = document.createElement("button");
        acceptButton.innerHTML = "Accept";
        acceptButton.classList.add("inviteButton");
        acceptButton.onclick = function () {
            acceptInvite(player.id);
        };

        holder.appendChild(icon);
        holder.appendChild(usernameText);
        holder.appendChild(acceptButton);
        parent.appendChild(holder);
    });
}

function createOnlineLobby(online){
    var parent = document.getElementById("onlineLobby");

    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }

    online.forEach(player => {
        var holder = document.createElement("div");
        holder.classList.add("item");

        var icon = document.createElement("img");
        icon.src = `img/faceIcons/${player.icon}.svg`
        icon.classList.add("icon");

        var usernameText = document.createElement("p");
        usernameText.innerHTML = player.username;
        usernameText.classList.add("usernameText");

        var inviteButton = document.createElement("button");
        inviteButton.innerHTML = "Invite";
        inviteButton.classList.add("inviteButton");
        inviteButton.onclick = function () {
            invitePlayer(player.id);
        };

        holder.appendChild(icon);
        holder.appendChild(usernameText);
        holder.appendChild(inviteButton);
        parent.appendChild(holder);
    });
}

function invitePlayer(playerId){
    socket.emit("invitePlayer", playerId);
}

invites = [];

function createInvite(player){
    invites.push(player);

    var parent = document.getElementById("lobby");

    var holder = document.createElement("div");
    holder.classList.add("item");

    var icon = document.createElement("img");
    icon.src = `img/faceIcons/${player.icon}.svg`
    icon.classList.add("icon");

    var usernameText = document.createElement("p");
    usernameText.innerHTML = player.username;
    usernameText.classList.add("usernameText");

    var acceptButton = document.createElement("button");
    acceptButton.innerHTML = "Accept";
    acceptButton.classList.add("inviteButton");
    acceptButton.onclick = function () {
        acceptInvite(player.id);
    };

    holder.appendChild(icon);
    holder.appendChild(usernameText);
    holder.appendChild(acceptButton);
    parent.appendChild(holder);
}

socket.on("getId", (id) => {
    sessionStorage.setItem("id", id);
});

socket.on("getStarterLobby", (lobbys) => {
    createLobby(lobbys);
});

socket.on("onlinePlayers", (online) => {
    createOnlineLobby(online);
});

socket.on("lobbyPlayers", (lobby) => {
    createLobby(lobby);
});

socket.on("receiveInvite", (player) => {
    createInvite(player);
});

function enableOnline(){
    socket.emit("getPlayersOnline");

    document.getElementById("lobbyButton").classList.remove("active");
    document.getElementById("onlineButton").classList.add("active");

    document.getElementById("lobby").classList.remove("active");
    document.getElementById("onlineLobby").classList.add("active");
}

function enableLobby(){
    var id = sessionStorage.getItem("id");
    socket.emit("getPlayersLobby", id);

    document.getElementById("lobbyButton").classList.add("active");
    document.getElementById("onlineButton").classList.remove("active");

    document.getElementById("lobby").classList.add("active");
    document.getElementById("onlineLobby").classList.remove("active");
}

function enableGameModes(){
    document.getElementById("chooseGamemode").classList.add("active");
    document.getElementById("chooseIcon").classList.remove("active");
}

function enableIconPicker(){
    document.getElementById("chooseGamemode").classList.remove("active");
    document.getElementById("chooseIcon").classList.add("active");
}