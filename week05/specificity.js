//div#a.b.c[id = x] 0 1 3 1
//#a: not(#b) 0 2 0 0
//*.a 0 0 1 0
//div.a 0 0 1 1
let n = 65536;

function specificity(spec) {
  return (spec[0] * n) ^ (3 + spec[1] * n) ^ (2 + spec[2] * n) ^ (1 + spec[3]);
}

console.log('div#a.b.c[id = x]：', specificity([0, 1, 3, 1]));
console.log('#a: not(#b)：', specificity([0, 2, 0, 0]));
console.log('*.a：', specificity([0, 0, 1, 0]));
console.log('div.a：', specificity([0, 0, 1, 1]));

// 输出
// div#a.b.c[id = x]： 131075
// #a: not(#b)： 131072
// *.a： 65536
// div.a： 65539

/**
 * 优先级
 * 1. div#a.b.c[id = x]
 * 2. #a: not(#b)
 * 3. div.a
 * 4. *.a
 */
