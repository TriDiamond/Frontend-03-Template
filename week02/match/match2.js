/**
 * 通用字符串匹配 - 方法1（自己写的）
 * @param {*} match 需要匹配的字符
 * @param {*} string 被匹配的字符
 */
function matchString(match, string) {
  const resultLetters = match.split(''); // 需要匹配的字符拆解成数组来记录
  const stringArray = string.split(''); // 把被匹配的字符串内容也拆解成数组
  let index = 0; // 匹配字符串的指针

  for (let i = 0; i <= stringArray.length; i++) {
    // 因为要保证字符的绝对匹配，如 “ab” 不能是 "abc",不能是 "a b"
    // 所以这里需要两个字符必须是有顺序的关系的
    if (stringArray[i] == resultLetters[index]) {
      // 如果找到一个字符是吻合的，就 index + 1 找下一个字符
      index++;
    } else {
      // 如果下一个字符不吻合，就重置重新匹配
      // 重置后，尝试用匹配数组的第一个与被匹配的当前字母匹配
      // 如果能匹配上，就可以从下一位开始，如果不能就从 0 为开始
      if (stringArray[i] == resultLetters[0]) {
        index = 1;
      } else {
        index = 0;
      }
    }
    // 如果已经匹配完所有的字符了，直接可以返回 true
    // 证明字符中含有需要寻找的字符
    if (index > resultLetters.length - 1) return true;
  }
  return false;
}

console.log('方法1', matchString('abcdef', 'abcabcdef'));

/**
 * 通用字符串匹配 - 参考方法2（使用substring）
 * @param {*} match 需要匹配的字符
 * @param {*} string 被匹配的字符
 */
function matchWithSubstring(match, string) {
  for (let i = 0; i < string.length - 1; i++) {
    if (string.substring(i, i + match.length) === match) {
      return true;
    }
  }
  return false;
}

console.log('方法2', matchWithSubstring('ab', 'hello abert'));

function matchAB(string) {
  let hasA = false;
  for (let letter of string) {
    if (letter == 'a') {
      hasA = true;
    } else if (hasA && letter == 'b') {
      return true;
    } else {
      hasA = false;
    }
  }
  return false;
}

console.log('方法3', matchAB('hello abert'));
