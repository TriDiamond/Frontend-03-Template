import { Carousel } from './carousel.js';
import { Timeline, Animation } from './animation.js';
import { Component, createElement } from './framework.js';

let d = ['./img/1.png', './img/2.png', './img/3.png', './img/4.png'];

let a = <Carousel src={d} />;

a.mountTo(document.body);

let tl = new Timeline();
window.tl = tl;
window.animation = new Animation(
  {
    set a(v) {
      console.log(v);
    },
  },
  'a',
  0,
  100,
  1000,
  null
);
tl.start();
