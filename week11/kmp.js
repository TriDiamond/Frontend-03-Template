// function kmp(source, pattern) {
//   // 第一部分：计算table
//   let table = new Array(pattern.length).fill(0);

//   {
//     // i 表示自重复串的开始位置，j 表示已重复字数
//     let i = 1,
//       j = 0;
//     while (i < pattern.length) {
//       // 有自重复
//       if (pattern[i] === pattern[j]) {
//         ++j, ++i;
//         // table[i]=j 代表第i位前面有长度为j的公共子串
//         table[i] = j;
//       } else {
//         // 不匹配
//         if (j > 0) {
//           j = table[j];
//         } else {
//           ++i;
//         }
//       }
//     }
//   }
//   // console.log(table);
//   // abcdabce
//   // aabaaac

//   // 第二部分：匹配
//   {
//     // i表示source串的位置  j表示pattern串的位置
//     let i = 0,
//       j = 0;

//     while (i < source.length) {
//       if (pattern[j] === source[i]) {
//         ++i, ++j;
//       } else {
//         // 不匹配，pattern位置就要回退到table里
//         if (j > 0) {
//           j = table[j];
//         } else {
//           ++i;
//         }
//       }
//       // 如果模式串匹配到头了，结束
//       if (j === pattern.length) {
//         return true;
//       }
//     }
//     // 如果source串到头了，return false
//     return false;
//   }
// }

// // kmp("", "abcdabce");
// // kmp("", "abababc");
// // kmp("", "aabaaac");

// // console.log(kmp("Hello", "ll"));
// // console.log(kmp("abcdabcdabcex", "abcdabce"));
// // console.log(kmp("aabaabaaacx", "aabaaac"));
// console.log(kmp('abc', 'abc'));

// // a a b a a a c
// // 0 0 1 0 1 2 2

function kmp(source, pattern) {
  // 计算 Next 数组
  // 因为我们的 next 数组从 1 开始，所以我们要长度加一
  let next = new Array(pattern.length + 1).fill(0);

  // i 是模式串的指针，j 是主串的指针
  let i = 1,
    j = pattern.length,
    prefix = '',
    suffix = ''

  while (i < pattern.length) {

    if (pattern[i] === pattern[j])
  }
}
