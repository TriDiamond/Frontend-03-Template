class Human {
  constructor(name = '人') {
    this.name = name;
    this.hp = 100;
  }

  hurt(damage) {
    this.hp -= damage;
    console.log(`${this.name} 受到了 ${damage} 点伤害，剩余生命中为 ${this.hp}`);
  }
}

class Dog {
  constructor(name = '狗') {
    this.name = name;
    this.attackPower = 10; // 攻击力
  }

  bite() {
    return this.attackPower;
  }
}

let human = new Human('三钻');
let dog = new Dog();

human.hurt(dog.bite());
