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
var images = ["grin-squint-tears-regular", "grin-stars-regular",  "meh-regular",  "sad-cry-regular",  "sad-tear-regular",  "smile-beam-regular",  "smile-wink-regular",  "surprise-regular"];

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
  var username = document.getElementById("username").value;
  sessionStorage.setItem("username", username);
  sessionStorage.setItem("icon", images[faceCount]);
  window.location.href = "lobby.html";
}