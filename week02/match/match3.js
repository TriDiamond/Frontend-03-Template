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
      index = 0;
    }
    // 如果已经匹配完所有的字符了，直接可以返回 true
    // 证明字符中含有需要寻找的字符
    if (index > resultLetters.length - 1) return true;
  }
  return false;
}

console.log('方法1', matchString('abcdef', 'hello abert abcdef'));

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

console.log('方法2', matchWithSubstring('abcdef', 'hello abert abcdef'));

/**
 * 逐个查找，直到找到最终结果
 * @param {*} string 被匹配的字符
 */
function match(string) {
  let matchStatus = [false, false, false, false, false, false];
  let matchLetters = ['a', 'b', 'c', 'd', 'e', 'f'];
  let statusIndex = 0;

  for (let letter of string) {
    if (letter == matchLetters[0]) {
      matchStatus[0] = true;
      statusIndex++;
    } else if (matchStatus[statusIndex - 1] && letter == matchLetters[statusIndex]) {
      matchStatus[statusIndex] = true;
      statusIndex++;
    } else {
      matchStatus = [false, false, false, false, false, false];
      statusIndex = 0;
    }

    if (statusIndex > matchLetters.length - 1) return true;
  }
  return false;
}

console.log('方法3', match('hello abert abcdef'));
