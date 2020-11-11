import { Component } from './framework.js'

export class Carousel extends Component{
  constructor() {
    super()
    this.attributes = Object.create(null)
  }
  setAttribute(name, value) {
    this.attributes[name] = value
  }
  render() {
    this.root = document.createElement('div')
    this.root.classList.add('carousel')
    for(let record of this.attributes.src) {
      const child = document.createElement('div')
      child.style.backgroundImage = `url('${record}')`
      this.root.appendChild(child)
    }

    let position = 0

    this.root.addEventListener('mousedown', (event) => {
      const children = this.root.children
      // 滚动方向是恒横向，所以只需要X信息
      const startX = event.clientX

      // 用变量保存时间，方便添加和移除操作
      const move = (event) => {
        // 计算移动距离
        const x = event.clientX - startX
        const current = position - ((x - x % 500) / 500)

        for(let offset of [-1, 0, 1]) {
          let pos = current + offset
          pos = (pos + children.length) % children.length

          children[pos].style.transition = 'none'
          children[pos].style.transform = `translateX(${- pos * 500 + offset * 500 + x % 500}px)`
        }
      }
      const up = (event) => {
        const x = event.clientX - startX
        position = position - Math.round(x / 500)

        for(let offset of [0, -Math.sign(Math.round(x / 500) - x + 250 * Math.sign(x ))]) {
          let pos = position + offset
          pos = (pos + children.length) % children.length

          children[pos].style.transition = ''
          children[pos].style.transform = `translateX(${- pos * 500 + offset * 500}px)`
        }

        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
      }

      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    })

    
    // 自动播放功能
    // let currentIndex = 0
    // setInterval(() => {
    //   const children = this.root.children
    //   const nextIndex = (currentIndex + 1) % children.length

    //   const current = children[currentIndex]
    //   const next = children[nextIndex]

    //   next.style.transition = 'none'
    //   next.style.transform = `translateX(${100 - nextIndex * 100}%)`

    //   setTimeout(() => {
    //     next.style.transition = ''
    //     current.style.transform = `translateX(${-100 - currentIndex * 100}%)`
    //     next.style.transform = `translateX(${-nextIndex * 100}%)`
    //     currentIndex = nextIndex
    //   }, 16)

    // }, 2000)

    return this.root
  }
  mountTo(parent) {
    parent.appendChild(this.render())
  }
}