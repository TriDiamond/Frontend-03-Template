function kmp(source, pattern) {
  // 第一部分：计算table
  let table = new Array(pattern.length).fill(0);

  {
    // i 表示自重复串的开始位置，j 表示已重复字数
    let i = 1,
      j = 0;
    while (i < pattern.length) {
      // 有自重复
      if (pattern[i] === pattern[j]) {
        ++j, ++i;
        // table[i]=j 代表第i位前面有长度为j的公共子串
        table[i] = j;
      } else {
        // 不匹配
        if (j > 0) {
          j = table[j];
        } else {
          ++i;
        }
      }
    }
  }
  // console.log(table);
  // abcdabce
  // aabaaac

  // 第二部分：匹配
  {
    // i表示source串的位置  j表示pattern串的位置
    let i = 0,
      j = 0;

    while (i < source.length) {
      if (pattern[j] === source[i]) {
        ++i, ++j;
      } else {
        // 不匹配，pattern位置就要回退到table里
        if (j > 0) {
          j = table[j];
        } else {
          ++i;
        }
      }
      // 如果模式串匹配到头了，结束
      if (j === pattern.length) {
        return true;
      }
    }
    // 如果source串到头了，return false
    return false;
  }
}

// kmp("", "abcdabce");
// kmp("", "abababc");
// kmp("", "aabaaac");

// console.log(kmp("Hello", "ll"));
// console.log(kmp("abcdabcdabcex", "abcdabce"));
// console.log(kmp("aabaabaaacx", "aabaaac"));
console.log(kmp('abc', 'abc'));

// a a b a a a c
// 0 0 1 0 1 2 2
