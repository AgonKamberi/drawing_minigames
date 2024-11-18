const socket = io('http://localhost:3000');

sendData();

function sendData(){
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

socket.on("getId", (id) => {
    sessionStorage.setItem("id", id);
});