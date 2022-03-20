const box1 = document.querySelector(".box-1");

box1.onclick = function () {
  this.style.backgroundColor = "#" + ((Math.random() * 0xffffff) | 0);
};
