class Foo {
  constructor() {
    this.method = this.fooMethod;
  }

  try(char) {
    this.method(char);
  }

  change() {
    this.method = this.fooMethod2;
    return this;
  }

  fooMethod(char) {
    console.log(char);
  }

  fooMethod2(char) {
    console.log(char + '-2');
  }
}

const foo = new Foo();
foo.try('hello world');
foo.change().try('hello world');
