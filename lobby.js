const socket = io('http://localhost:3000');

sendData();

function sendData(){
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

socket.on("getId", (id) => {
    sessionStorage.setItem("id", id);
});