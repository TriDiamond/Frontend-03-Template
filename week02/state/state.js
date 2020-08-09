/**
 * 状态机字符串匹配
 * @param {*} string
 */
function match(string) {
  let state = start;

  for (let letter of string) {
    state = state(letter);
  }

  return state === end;
}

function start(letter) {
  if (letter === 'a') return matchedA;
  return start;
}

function end(letter) {
  return end;
}

function matchedA(letter) {
  if (letter === 'b') return matchedB;
  return start(letter);
}

function matchedB(letter) {
  if (letter === 'c') return matchedC;
  return start(letter);
}

function matchedC(letter) {
  if (letter === 'd') return matchedD;
  return start(letter);
}

function matchedD(letter) {
  if (letter === 'e') return matchedE;
  return start(letter);
}

function matchedE(letter) {
  if (letter === 'f') return end(letter);
  return start(letter);
}

console.log(match('I am abcdef'));
