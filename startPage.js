function enableGuest() {
    document.querySelector('.guest').classList.add('active');
    document.querySelector('.login').classList.remove('active');
    document.querySelector('.register').classList.remove('active');
}

function enableLogin() {
    document.querySelector('.guest').classList.remove('active');
    document.querySelector('.login').classList.add('active');
    document.querySelector('.register').classList.remove('active');
}

function enableRegister() {
    document.querySelector('.guest').classList.remove('active');
    document.querySelector('.login').classList.remove('active');
    document.querySelector('.register').classList.add('active');
}