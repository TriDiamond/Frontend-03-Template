/**
 * 状态机匹配字符串
 * @param {*} string 被匹配的字符
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
  if (letter === 'a') return matchedA2;
  return start(letter);
}

function matchedA2(letter) {
  if (letter === 'b') return matchedB2;
  return start(letter);
}

function matchedB2(letter) {
  if (letter === 'x') return end;
  return matchedB(letter);
}

console.log('result: ', match('abcabcabx'));
