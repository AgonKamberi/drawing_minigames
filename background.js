amount = 100;
setInterval(createObject, 0);

function createObject(){
  for(let i = 0; i < amount; i++){
    const section = document.querySelector('section');
    const object = document.createElement('img');
    object.classList.add("object");

    var size = Math.random() * 50;

    var images = ["car-solid", "apple-alt-solid", "bell-solid", "bicycle-solid", "bomb-solid", "building-solid", "couch-solid", "desktop-solid"];
    var image = images[Math.floor(Math.random()*images.length)];

    object.src = `../img/backgroundIcons/${image}.svg`;

    object.style.width = 20 + size + 'px';
    object.style.height = 20 + size + 'px';

    object.style.top = `${randomNumberBeetwen(0, 100)}%`;
    object.style.left = `${randomNumberBeetwen(0, 100)}%`;

    object.style.setProperty("--moveY", `${randomNumberBeetwen(0, 100)}%`)
    object.style.setProperty("--moveX", `${randomNumberBeetwen(0, 100)}%`)

    object.style.setProperty("--rotation", `${randomNumberBeetwen(0, 360)}deg`)

    section.append(object);

    amount -= 1;
  }
}

function randomNumberBeetwen(min, max){
  return Math.floor(Math.random() * (max - min + 1) + min)
}