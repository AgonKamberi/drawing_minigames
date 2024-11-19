const socket = io('http://localhost:3000');

sendData();

function sendData(){
    var username = sessionStorage.getItem("username");
    var icon = sessionStorage.getItem("icon");
    var userDetails = {username, icon};

    socket.emit("sendUserDetails", userDetails);

    if(username == null){
        fetch("http://localhost/drawing_minigames_be/isLoggedIn.php", {
            method: "GET",
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => console.error("Error:", error));
    }
    else{
        fetch("http://localhost/drawing_minigames_be/logout.php", {
            credentials: 'include'
        })
        .then(response => response.text())
        .catch(error => console.error("Error:", error));
    }
}

function createLobby(lobbys){
    var parent = document.getElementById("lobby");
    lobbys.forEach(client => {
        var holder = document.createElement("div");
        holder.classList.add("item");

        var icon = document.createElement("img");
        icon.src = `img/faceIcons/${client.icon}.svg`
        icon.classList.add("icon");

        var usernameText = document.createElement("p");
        usernameText.innerHTML = client.username;
        usernameText.classList.add("usernameText");

        holder.appendChild(icon);
        holder.appendChild(usernameText);
        parent.appendChild(holder);
    });
}

socket.on("getId", (id) => {
    sessionStorage.setItem("id", id);
});

socket.on("getStarterLobby", (lobbys) => {
    console.log(lobbys);
    createLobby(lobbys);
});

function enableOnline(){
    document.getElementById("lobbyButton").classList.remove("active");
    document.getElementById("onlineButton").classList.add("active");
}

function enableLobby(){
    document.getElementById("lobbyButton").classList.add("active");
    document.getElementById("onlineButton").classList.remove("active");
}

function enableGameModes(){
    document.getElementById("chooseGamemode").classList.add("active");
    document.getElementById("chooseIcon").classList.remove("active");
}

function enableIconPicker(){
    document.getElementById("chooseGamemode").classList.remove("active");
    document.getElementById("chooseIcon").classList.add("active");
}