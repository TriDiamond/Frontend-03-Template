var assert = require('assert');

import { parseHTML } from '../src/parser.js';

describe('parse html', () => {
  it('<a></a>', function() {
    let tree  = parseHTML('<a></a>');
    assert.strictEqual(tree.children[0].tagName, 'a');
    assert.strictEqual(tree.children[0].children.length, 0);
  });
  it('<a-', function() {
    let tree  = parseHTML('<a-');
    assert.strictEqual(tree.children[0].tagName, 'a');
  });
  it('<a>123</a>', function() {
    let tree  = parseHTML('<a></a>');
    console.log(tree)
    assert.strictEqual(tree.children[0].tagName, 'a');
    assert.strictEqual(tree.children.children.length, 0);
  });
  it('123', function() {
    let tree  = parseHTML('"123"');
    assert.strictEqual(tree.children[0].tagName, 'a');
  });
  it('<a href="//.baidu.com"></a>', function() {
    let tree  = parseHTML('<a href="//.baidu.com"></a>');
    assert.strictEqual(tree.children.length,1);
  });
  it('<a href></a>', function() {
    let tree  = parseHTML('<a href></a>');
    assert.strictEqual(tree.children.length, 1);
  });
  it('<a id href></a>', function() {
    let tree  = parseHTML('<a id href></a>');
    assert.strictEqual(tree.children.length, 1);
  });
  it('<a id href="abc"></a>', function() {
    let tree  = parseHTML('<a id  href="abc"></a>');
    assert.strictEqual(tree.children.length, 1);
  });
  it('<a /id></a>', function() {
    let tree  = parseHTML('<a /id></a>');
    assert.strictEqual(tree.children.length, 1);
  });
  it('<a id=/"na"></a>', function() {
    let tree  = parseHTML('<a id=/"na></a>');
    assert.strictEqual(tree.children.length, 1);
  });
  it('<a id="\'"></a>', function() {
    let tree  = parseHTML('<a id="\'"></a>');
    assert.strictEqual(tree.children.length, 1);
  });
  it('<a id="cici" \n></a>', function() {
    let tree  = parseHTML('<a id="cici" \n></a>');
    assert.strictEqual(tree.children.length, 1);
  });
  it('<div class="a"b>', function() {
    let tree  = parseHTML('<div class="a"b>');
    assert.strictEqual(tree.children.length, 1);
  });
  it('<div class="a"b>', function() {
    let tree  = parseHTML('<div class="a"b>');
    assert.strictEqual(tree.children.length, 1);
  });
  // it('<input type=\n/>', function() {
  //   let tree  = parseHTML('<input type=\n/>');
  //   assert.strictEqual(tree.children.length, 1);
  // });
  it('<a id=abc/>', function() {
    let tree  = parseHTML('<a  id=abc/>');
    assert.strictEqual(tree.children.length, 1);
  });
  it('<a id=\'abc\'/>',()  => {
    let tree  = parseHTML('<a id=\'abc\'/>');
    assert.strictEqual(tree.children.length, 0);
  });
  it('<a id="\nabc"/>case',()  => {
    let tree  = parseHTML('<a id="\nabc"/>');
    assert.strictEqual(tree.children.length, 1);
  });
  it('<a \n id="abc"/> case',()  => {
    let tree  = parseHTML('<a \n id="abc"/>');
    assert.strictEqual(tree.children.length, 1);
  });
  it('singleQuotedAttributeValue>',()  => {
    let tree  = parseHTML('<input type=\' />');
  });
   // it('end Tag',()  => {
  //   let tree  = parseHTML('<a>>');
  // });
  // it('end Tag',()  => {
  //   let tree  = parseHTML('<a>>');
  // });
  it('<a id="j" name=/>', function() {
    let tree  = parseHTML('<a id="j" name=/>');
    assert.strictEqual(tree.children.length, 1);
  });
  it('<a/>', function() {
    let tree  = parseHTML('<a/>');
    assert.strictEqual(tree.children.length, 1);
  });
  it('<A/> upper case', function() {
    let tree  = parseHTML('<A/>');
    assert.strictEqual(tree.children.length, 1);
  });
  it('<>  case', function() {
    let tree  = parseHTML('<>');
    assert.strictEqual(tree.children.length, 0);
  });
  it('<div><a/></div>', function() {
    let tree  = parseHTML('<div><a/></div>');
    assert.strictEqual(tree.children[0].tagName, 'div');
  });
})
