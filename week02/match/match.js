function match(string) {
  for (let letter of string) {
    if (letter == 'a') return true;
  }
  return false;
}

console.log(match('I am TriDiamond'));
