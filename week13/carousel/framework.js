/**
 * @description: description
 * @author: liuyun03
 * @Date: 2020-11-01 22:28:28
 * @LastEditors: liuyun03
 * @LastEditTime: 2020-11-01 23:17:26
 */
export function createElement(type, attributes, ...children) {
  let element;
  if (typeof type === "string") {
    element = new ElementWrapper(type);
  } else {
    element = new type();
  }
  for (let name in attributes) {
    element.setAttribute(name, attributes[name]);
  }
  for (let child of children) {
    if (typeof child === "string") {
      child = new TextWrapper(child);
    }
    element.appendChild(child);
  }
  return element;
}

export class Component {
  constructor(type) {
    // this.root = this.render();
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(child) {
    child.mountTo(this.root);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}

class ElementWrapper extends Component {
  constructor(type) {
    this.root = document.createElement(type);
  }
}

class TextWrapper extends Component {
  constructor(type) {
    this.root = document.createTextNode(type);
  }
}
