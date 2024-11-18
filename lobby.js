const socket = io('http://localhost:3000');

sendData();

function sendData(){
    loggedIn = false;

    fetch("http://localhost/drawing_minigames_be/isLoggedIn.php", {
        credentials: 'same-origin'
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
    })
    .catch(error => console.error("Error:", error));

    if(!loggedIn){
        var username = sessionStorage.getItem("username");
        var icon = sessionStorage.getItem("icon");
        var id = sessionStorage.getItem("id");
        if(id == null){
            socket.emit("sendUserDetails", {
                username: username,
                icon: icon
            });
        }
    }
}

socket.on("getId", (id) => {
    sessionStorage.setItem("id", id);
});