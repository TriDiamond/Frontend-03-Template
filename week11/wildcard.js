function find(source, pattern) {
  if (pattern === '') return true;

  let counter = 0;
  for (let char of pattern) {
    if (char === '*') counter++;
  }

  if (counter === 0) {
    if (source.length !== pattern.length) return false;
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] !== source[i] && pattern[i] !== '?') return false;
    }
    return true;
  }

  let i = 0;
  while (pattern[i] !== '*') {
    if (pattern[i] !== source[i] && pattern[i] !== '?') return false;
    i++;
  }

  let lastIndex = i;
  for (let j = 1; j < counter; j++) {
    let str = '';
    i++;
    while (pattern[i] !== '*') {
      str += pattern[i];
      i++;
    }
    let reg = new RegExp(str.replace(/\?/g, '[\\s\\S]'), 'g');

    reg.lastIndex = lastIndex;
    if (!reg.exec(source)) return false;
    lastIndex = reg.lastIndex;
  }

  i++;
  let pLen = pattern.length;
  let sLen = source.length;
  if (sLen - lastIndex < pLen - i) return false;
  for (let j = 1; i < pLen; i++, j++) {
    if (pattern[pLen - j] !== source[sLen - j] && pattern[pLen - j] !== '?') return false;
  }

  return true;
}

console.log(find('abcavaabaplmmqaghn', 'a*aab?*?m*ag?n'));
console.log(find('aab', 'aab'));
console.log(find('aabbbbbab', 'aab*b?'));
console.log(find('aabbbbbab', 'aabc*ab'));
console.log(find('aabbbbbab', ''));
console.log(find('', 'aaa'));

// expect
// true ture false false true false
