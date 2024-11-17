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

changeIcon();

function changeIcon(){
  const icons = document.getElementById("faceIcons");
  const face = document.getElementById('faceIcon');

  var images = ["grin-squint-tears-regular", "grin-stars-regular",  "meh-regular",  "sad-cry-regular",  "sad-tear-regular",  "smile-beam-regular",  "smile-wink-regular",  "surprise-regular", "diamondIcon"];

  face.src = `img/faceIcons/${images[faceCount]}.svg`;

  if(faceCount == 7){
    faceCount = 0;
  }
  else{
    faceCount += 1;
  }
}