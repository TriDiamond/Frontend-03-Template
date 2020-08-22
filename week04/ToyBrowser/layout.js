/**
 * 预处理元素中的 Style 属性
 * @param {*} element
 */
function getStyle(element) {
  if (!element.style) element.style = {};

  for (let prop in element.computedStyle) {
    let p = element.computedStyle[prop].value.toString();
    element.style[prop] = p;

    // 把 px 单位的数字用 parseInt 转成数字类型
    let pxReg = /(\d+)px$/;
    if (p.match(pxReg)) {
      element.style[prop] = parseInt(p.match(pxReg)[0]);
    }
    // 纯数字的也用 parseInt 转成数字类型
    let numReg = /^\d+$|^\d+\.$|^\d+\.\d+$/;
    if (p.match(numReg)) {
      element.style[prop] = parseInt(p.match(numReg)[0]);
    }
  }

  return element.style;
}

/**
 * 元素排版
 * @param {*} element
 */
function layout(element) {
  // 如果没有 computedStyle 的可以直接跳过
  if (!element.computedStyle) return;
  // 对 Style 做一些预处理
  let elementStyle = getStyle(element);
  // 我们的模拟浏览器只做 flex 布局，其他的跳过
  if (elementStyle.display !== 'flex') return;

  // 过滤掉所有文本节点
  // 为了支持 flex 排班中的排序属性 order
  let childElements = element.children
    .filter(e => e.type === 'element')
    .sort((a, b) => {
      return (a.order || 0) - (b.order || 0);
    });

  let style = elementStyle;

  // 把所有 auto 和空的宽高变成 null 方便我们后面判断
  ['width', 'height'].forEach(size => {
    if (style[size] === 'auto' || style[size] === '') {
      style[size] = null;
    }
  });

  // 把 flex 排版的关键属性都给予默认值
  if (!style.flexDirection || style.flexDirection === 'auto') style.flexDirection = 'row';
  if (!style.alignItems || style.alignItems === 'auto') style.alignItems = 'stretch';
  if (!style.justifyContent || style.justifyContent === 'auto') style.justifyContent = 'flex-start';
  if (!style.flexWrap || style.flexWrap === 'auto') style.flexWrap = 'nowrap';
  if (!style.alignContent || style.alignContent === 'auto') style.alignContent = 'stretch';

  let mainSize, // 主轴长度
    mainStart, // 主轴开始方向
    mainEnd, // 主轴结束方向
    mainSign, // 主轴标记 +1: 就是叠加，-1: 就是叠减
    mainBase; // 主轴开始值

  let crossSize, // 交叉轴长度
    crossStart, // 交叉轴开始方向
    crossEnd, // 交叉轴结束方向
    crossSign, // 交叉轴标记 +1: 就是叠加，-1: 就是叠减
    crossBase; // 交叉轴开始值

  if (style.flexDirection === 'row') {
    mainSize = 'width';
    mainStart = 'left';
    mainEnd = 'right';
    mainSign = +1;
    mainBase = 0;

    crossSize = 'height';
    crossStart = 'top';
    crossEnd = 'bottom';
  }

  if (style.flexDirection === 'row-reverse') {
    mainSize = 'width';
    mainStart = 'right';
    mainEnd = 'left';
    mainSign = -1;
    mainBase = style.width;

    crossSize = 'height';
    crossStart = 'top';
    crossEnd = 'bottom';
  }

  if (style.flexDirection === 'column') {
    mainSize = 'height';
    mainStart = 'top';
    mainEnd = 'bottom';
    mainSign = +1;
    mainBase = 0;

    crossSize = 'width';
    crossStart = 'left';
    crossEnd = 'right';
  }

  if (style.flexDirection === 'column-reverse') {
    mainSize = 'height';
    mainStart = 'bottom';
    mainEnd = 'top';
    mainSign = -1;
    mainBase = style.height;

    crossSize = 'width';
    crossStart = 'left';
    crossEnd = 'right';
  }

  // 交叉轴反转的时候，直接调换 crossStart 和 crossEnd 的值
  if (style.flexWrap === 'wrap-reverse') {
    let dummy = crossStart;
    crossStart = crossEnd;
    crossEnd = dummy;
    crossSign = -1;
  } else {
    crossBase = 0;
    crossSign = +1;
  }

  /**
   * =================================
   * 把元素放入行
   * =================================
   */
  let isAutoMainSize = false;
  // 如果是 auto 或者是空时，就是没有这是尺寸
  // 所以父元素的 flex 行尺寸时根据子元素的总和而定的
  // 也就是说无论子元素有多少，都不会超出第一行，所以全部放入第一行即可
  if (!style[mainSize]) {
    elementStyle[mainSize] = 0;
    for (let i = 0; i < childElements.length; i++) {
      let item = childElements[i];
      let itemStyle = getStyle(item);
      if (itemStyle[mainSize] !== null || itemStyle[mainSize] !== 0)
        elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize];
    }

    isAutoMainSize = true;
  }

  let flexLine = []; // 当前行
  let flexLines = [flexLine]; // 所有 flex 行

  let mainSpace = elementStyle[mainSize]; // 主轴尺寸
  let crossSpace = 0; // 交叉轴尺寸

  for (let i = 0; i < childElements.length; i++) {
    let item = childElements[i];
    let itemStyle = getStyle(item);

    if (itemStyle[mainSize] === null) itemStyle[mainSize] = 0;

    // 如果当前元素拥有 flex 属性，那这个元素就是弹性的
    // 无论当前行剩余多少空间都是可以放下的
    if (itemStyle.flex) {
      flexLine.push(item);
    } else if (style.flexWrap === 'nowrap' || isAutoMainSize) {
      mainSpace -= itemStyle[mainSize];
      // 因为 Flex 行的高度取决于行内元素最高的元素的高度，所以这里取行内最好的元素
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0)
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      flexLine.push(item);
    } else {
      // 如果子元素主轴尺寸大于父元素主轴尺寸，直接把子元素尺寸压成父元素相同即可
      if (itemStyle[mainSize] > style[mainSize]) itemStyle[mainSize] = style[mainSize];
      // 当前行不够空间放入当前子元素时
      if (mainSpace < itemStyle[mainSize]) {
        flexLine.mainSpace = mainSpace;
        flexLine.crossSpace = crossSpace;
        flexLine = [item];
        flexLines.push(flexLine);
        mainSpace = style[mainSize];
        crossSpace = 0;
      } else {
        flexLine.push(item);
      }
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0)
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
    }
  }
  // 分配每一行的剩余空间
  flexLine.mainSpace = mainSpace;

  /**
   * =================================
   * 计算主轴
   * =================================
   */
  if (style.flexWrap === 'nowrap' || isAutoMainSize) {
    flexLine.crossSpace = style[crossSize] !== undefined ? style[crossSize] : crossSpace;
  } else {
    flexLine.crossSpace = crossSpace;
  }

  if (mainSpace < 0) {
    // 等比伸缩比例 = 容器尺寸 / (容器尺寸 + 剩余空间)
    let scale = style[mainSize] / (style[mainSize] + abs(mainSpace));
    // 开始位置
    let currentMain = mainBase;
    for (let i = 0; i < childElements.length; i++) {
      let item = childElements[i];
      let itemStyle = getStyle(item);

      // 拥有 flex 属性的不参与等比伸缩
      if (itemStyle.flex) itemStyle[mainSize] = 0;
      // 其他元素都参与等比伸缩
      itemStyle[mainSize] = itemStyle[mainSize] * scale;

      // 元素的开始位置 = currentMain （排列到当前元素时的开始位置）
      itemStyle[mainStart] = currentMain;
      // 元素结束位置 = 元素开始位置 + 方向标志（可能是 + / -）* 元素的尺寸
      itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
      // 下一个元素的开始位置，就是当前元素的结束位置
      currentMain = itemStyle[mainEnd];
    }
  } else {
    flexLines.forEach(items => {
      let mainSpace = items.mainSpace;
      let flexTotal = 0;
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let itemStyle = getStyle(item);

        if (itemStyle.flex !== null && itemStyle.flex !== void 0) {
          flexTotal += itemStyle.flex;
          continue;
        }
      }

      if (flexTotal > 0) {
        // 证明拥有 flexible 元素
        // 那就可以把 mainSpace(容器剩余空间) 均匀分配给 flex 元素
        let currentMain = mainBase;
        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          let itemStyle = getStyle(item);
          // 把容器剩余空间，均匀分配给 flex 元素
          if (itemStyle.flex) itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
          // 赋予元素定位
          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd];
        }
      } else {
        /** 没有找到 flexible 元素
         * 那么 JustifyContent 就可以生效
         * =================================
         * Justify-content 定义：
         * - flex-start:从行首起始位置开始排列
         * - flex-end: 从行尾位置开始排列
         * - center: 居中排列
         * - space-between:均匀排列每个元素，首个元素放置于起点，末尾元素放置于终点
         * - space-around: 均匀排列每个元素，每个元素周围分配相同的空间
         */
        if (style.justifyContent === 'flex-start') {
          let currentMain = mainBase;
          let step = 0;
        }

        if (style.justifyContent === 'flex-end') {
          let currentMain = mainBase + mainSpace * mainSign;
          let step = 0;
        }

        if (style.justifyContent === 'center') {
          let currentMain = mainBase + (mainSign * mainSpace) / 2;
          let step = 0;
        }

        if (style.justifyContent === 'space-between') {
          // 间隔空间 = 剩余空间 / (元素总数 - 1) * 方向表示
          let step = (mainSpace / (items.length - 1)) * mainSign;
          let currentMain = mainBase;
        }

        if (style.justifyContent === 'space-around') {
          let step = (mainSpace / items.length) * mainSign;
          let currentMain = mainBase + step / 2;
        }

        // 给每一个元素分配定位信息
        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          let itemStyle = getStyle(item);

          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd] + step;
        }
      }
    });
  }

  /**
   * =================================
   * 计算交叉轴
   * =================================
   */
  if (!style[crossSize]) {
    // 没有定义行高，叠加每一个 flex 行的高度做为行高
    crossSpace = 0;
    elementStyle[crossSize] = 0;
    for (let i = 0; i < flexLines.length; i++) {
      elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSpace;
    }
  } else {
    // 如果有定义行高，那就用叠减每一个 flex 行的高度获取剩余行高
    crossSpace = style[crossSize];
    for (let i = 0; i < flexLines.length; i++) {
      crossSpace -= flexLines[i].crossSpace;
    }
  }

  // 根据 flex align 属性来分配行高
  if (style.flexWrap === 'wrap-reverse') {
    crossBase - style[crossSize];
  } else {
    crossBase = 0;
  }

  // 获取每一个 flex 行的尺寸
  let lineSize = style[crossSize] / flexLines.length;

  // 根据 alignContent 属性来矫正 crossBase 值
  let step;
  if (style.alignContent === 'flex-start' || style.alignContent === 'stretch') {
    crossBase += 0;
    step = 0;
  }

  if (style.alignContent === 'flex-end') {
    crossBase += crossSign * crossSpace;
    step = 0;
  }

  if (style.alignContent === 'center') {
    crossBase += (crossSign * crossSpace) / 2;
    step = 0;
  }

  if (style.alignContent === 'space-between') {
    crossBase += 0;
    step = crossSpace / (flexLines.length - 1);
  }

  if (style.alignContent === 'space-around') {
    step = crossSpace / flexLines.length;
    crossBase += (crossSigh * step) / 2;
  }

  flexLines.forEach(items => {
    let lineCrossSize =
      style.alignContent === 'stretch'
        ? items.crossSpace + crossSpace / flexLines.length
        : items.crossSpace;

    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      let itemStyle = getStyle(item);

      let align = itemStyle.alignSelf || style.alignItems;

      if (itemStyle[crossSize] === null)
        itemStyle[crossSize] = align === 'stretch' ? lineCrossSize : 0;

      if (align === 'flex-start') {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }

      if (align === 'flex-end') {
        itemStyle[crossStart] = crossBase + crossSign * lineCrossSize;
        itemStyle[crossEnd] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
      }

      if (align === 'center') {
        itemStyle[crossStart] =
          crossBase + (crossSign * (lineCrossSize - itemStyle[crossSize])) / 2;
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }

      if (align === 'stretch') {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] =
          crossBase +
          crossSign *
            (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0
              ? itemStyle[crossSize]
              : items.crossSpace);
        itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart]);
      }
    }
    crossBase += crossSign * (lineCrossSize + step);
  });

  console.log(childElements);
}

module.exports = layout;
