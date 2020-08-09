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
// a
function start(letter) {
  if (letter === 'a') return matchedA;
  return start;
}

function end(letter) {
  return end;
}
// ab
function matchedA(letter) {
  if (letter === 'b') return matchedB;
  return start(letter);
}
// aba
function matchedB(letter) {
  if (letter === 'a') return matchedA2;
  return start(letter);
}
// abab
function matchedA2(letter) {
  if (letter === 'b') return matchedB2;
  return start(letter);
}
//ababa
function matchedB2(letter) {
  if (letter === 'a') return matchedA3;
  return start(letter);
}
//ababab
function matchedA3(letter) {
  if (letter === 'b') return matchedB3;
  return start(letter);
}
//abababx
function matchedB3(letter) {
  if (letter === 'x') return end;
  return matchedB2(letter);
}

console.log('result: ', match('ababxabxababababx'));
