const socket = io('http://localhost:3000');

function enableGuest() {
  document.querySelector('.guest').classList.add('active');
  document.querySelector('.login').classList.remove('active');
  document.querySelector('.register').classList.remove('active');
  document.querySelector('.guestButton').classList.add('active');
  document.querySelector('.loginButton').classList.remove('active');
}

function enableLogin() {
  document.querySelector('.guest').classList.remove('active');
  document.querySelector('.login').classList.add('active');
  document.querySelector('.register').classList.remove('active');
  document.querySelector('.loginButton').classList.add('active');
  document.querySelector('.guestButton').classList.remove('active');
}

function enableRegister() {
  document.querySelector('.guest').classList.remove('active');
  document.querySelector('.login').classList.remove('active');
  document.querySelector('.register').classList.add('active');
}

var faceCount = 1;
var images = ["bear", "donkey",  "elephant",  "elephant2",  "goat",  "hippo",  "hippopotamus",  "horse",  "kangaroo",  "monkey",  "monkey2",  "seal"];

changeIcon();

function changeIcon(){
  const face = document.getElementById('faceIcon');

  face.src = `img/faceIcons/${images[faceCount]}.svg`;

  if(faceCount == images.length - 1){
    faceCount = 0;
  }
  else{
    faceCount += 1;
  }
}

function startGuest(){
  var username = document.getElementById("guestUsername").value;
  sessionStorage.setItem("username", username);
  sessionStorage.setItem("icon", images[faceCount - 1]);
  window.location.href = "lobby.html";
}

function startLogin(){
  var username = document.getElementById("loginUsername").value;
  var password = document.getElementById("loginPassword").value;

  var formData = new FormData();

  formData.append("username", username);
  formData.append("password", password);
  
  fetch("http://localhost/drawing_minigames_be/login.php", {
    method: "POST",
    body: formData,
    credentials: 'include'
  })
  .then(response => response.json())
  .then(data => {
    if(data.loggedIn){
      sessionStorage.removeItem("username");
      window.location.href = "lobby.html";
    }
  })
  .catch(error => console.error("Error:", error));
}

function startRegister(){
  var username = document.getElementById("registerUsername").value;
  var email = document.getElementById("registerEmail").value;
  var password = document.getElementById("registerPassword").value;

  var formData = new FormData();

  formData.append("username", username);
  formData.append("email", email);
  formData.append("password", password);
  formData.append("icon", "bear");
  
  fetch("http://localhost/drawing_minigames_be/signup.php", {
      method: "POST",
      body: formData
  })
  .then(response => response.text())
  .then(data => {
    if(data.created){
      sessionStorage.removeItem("username");
      window.location.href = "lobby.html";
    }
  })
  .catch(error => console.error("Error:", error));
}