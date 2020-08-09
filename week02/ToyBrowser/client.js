const net = require('net');

class Request {
  constructor(options) {
    // 首先在 constructor 赋予需要使用的默认值
    this.method = options.method || 'GET';
    this.host = options.host;
    this.port = options.port || 80;
    this.path = options.path || '/';
    this.body = options.body || {};
    this.headers = options.headers || {};

    if (!this.headers['Content-Type']) {
      this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    // 根据 Content-Type 转换 body 的格式
    if (this.headers['Content-Type'] === 'application/json') {
      this.bodyText = JSON.stringify(this.body);
    } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      this.bodyText = Object.keys(this.body)
        .map(key => `${key}=${encodeURIComponent(this.body[key])}`)
        .join('&');
    }
    // 自动计算 body 内容长度，如果长度不对，就会是一个非法请求
    this.headers['Content-Length'] = this.bodyText.length;
  }
  // 发送请求的方法，返回 Promise 对象
  send(connection) {
    return new Promise((resolve, reject) => {
      const parser = new ResponseParser();
      // 先判断 connection 是否有传送过来
      // 没有就根据，Host 和 port 来创建一个 TCP 连接
      // `toString` 中是把请求参数按照 HTTP Request 的格式组装
      if (connection) {
        connection.write(this.toString());
      } else {
        connection = net.createConnection(
          {
            host: this.host,
            port: this.port,
          },
          () => {
            connection.write(this.toString());
          }
        );
      }
      // 监听 connection 的 data
      // 然后原封不动传给 parser
      // 如果 parser 已经结束的话，我们就可以进行 resolve
      // 最后断开连接
      connection.on('data', data => {
        console.log(data.toString());
        parser.receive(data.toString());

        if (parser.isFinished) {
          resolve(parser.response);
          connection.end();
        }
      });
      // 监听 connection 的 error
      // 如果请求出现错误，首先 reject 这个promise
      // 然后断开连接，避免占着连接的情况
      connection.on('error', err => {
        reject(err);
        connection.end();
      });
    });
  }
  /**
   * 组装 HTTP Request 文本内容
   */
  toString() {
    return `${this.method} ${this.path} HTTP/1.1\r\n${Object.keys(this.headers)
      .map(key => `${key}: ${this.headers[key]}`)
      .join('\r\n')}\r\n\r\n${this.bodyText}`;
  }
}

/**
 * Response 解析器
 */
class ResponseParser {
  constructor() {
    this.state = this.waitingStatusLine;
    this.statusLine = '';
    this.headers = {};
    this.headerName = '';
    this.headerValue = '';
    this.bodyParser = null;
  }

  get isFinished() {
    return this.bodyParser && this.bodyParser.isFinished;
  }

  get response() {
    this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
    return {
      statusCode: RegExp.$1,
      statusText: RegExp.$2,
      headers: this.headers,
      body: this.bodyParser.content.join(''),
    };
  }

  receive(string) {
    for (let i = 0; i < string.length; i++) {
      this.state = this.state(string.charAt(i));
    }
  }

  receiveEnd(char) {
    return receiveEnd;
  }

  /**
   * 等待状态行内容
   * @param {*} char 文本
   */
  waitingStatusLine(char) {
    if (char === '\r') return this.waitingStatusLineEnd;
    this.statusLine += char;
    return this.waitingStatusLine;
  }

  /**
   * 等待状态行结束
   * @param {*} char 文本
   */
  waitingStatusLineEnd(char) {
    if (char === '\n') return this.waitingHeaderName;
    return this.waitingStatusLineEnd;
  }

  /**
   * 等待 Header 名
   * @param {*} char 文本
   */
  waitingHeaderName(char) {
    if (char === ':') return this.waitingHeaderSpace;
    if (char === '\r') {
      if (this.headers['Transfer-Encoding'] === 'chunked') {
        this.bodyParser = new ChunkedBodyParser();
      }
      return this.waitingHeaderBlockEnd;
    }
    this.headerName += char;
    return this.waitingHeaderName;
  }

  /**
   * 等待 Header 空格
   * @param {*} char 文本
   */
  waitingHeaderSpace(char) {
    if (char === ' ') return this.waitingHeaderValue;
    return this.waitingHeaderSpace;
  }

  /**
   * 等待 Header 值
   * @param {*} char 文本
   */
  waitingHeaderValue(char) {
    if (char === '\r') {
      this.headers[this.headerName] = this.headerValue;
      this.headerName = '';
      this.headerValue = '';
      return this.waitingHeaderLineEnd;
    }
    this.headerValue += char;
    return this.waitingHeaderValue;
  }

  /**
   * 等待 Header 行结束
   * @param {*} char 文本
   */
  waitingHeaderLineEnd(char) {
    if (char === '\n') return this.waitingHeaderName;
    return this.waitingHeaderLineEnd;
  }

  /**
   * 等待 Header 内容结束
   * @param {*} char 文本
   */
  waitingHeaderBlockEnd(char) {
    if (char === '\n') return this.waitingBody;
    return this.waitingHeaderBlockEnd;
  }

  /**
   * 等待 body 内容
   * @param {*} char 文本
   */
  waitingBody(char) {
    this.bodyParser.receiveChar(char);
    return this.waitingBody;
  }
}

/**
 * Chunked Body 解析器
 */
class ChunkedBodyParser {
  constructor() {
    this.state = this.waitingLength;
    this.length = 0;
    this.content = [];
    this.isFinished = false;
  }

  receiveChar(char) {
    this.state = this.state(char);
  }

  /**
   * 等待 Body 长度
   * @param {*} char 文本
   */
  waitingLength(char) {
    if (char === '\r') {
      if (this.length === 0) this.isFinished = true;
      return this.waitingLengthLineEnd;
    } else {
      // 转换十六进制长度
      this.length *= 16;
      this.length += parseInt(char, 16);
    }
    return this.waitingLength;
  }

  /**
   * 等待 Body line 结束
   * @param {*} char 文本
   */
  waitingLengthLineEnd(char) {
    if (char === '\n') return this.readingTrunk;
    return this.waitingLengthLineEnd;
  }

  /**
   * 读取 Trunk 内容
   * @param {*} char 文本
   */
  readingTrunk(char) {
    this.content.push(char);
    this.length--;
    if (this.length === 0) return this.waitingNewLine;
    return this.readingTrunk;
  }

  /**
   * 等待新的一行
   * @param {*} char 文本
   */
  waitingNewLine(char) {
    if (char === '\r') return this.waitingNewLineEnd;
    return this.waitingNewLine;
  }

  /**
   * 等待新的一行结束
   * @param {*} char 文本
   */
  waitingNewLineEnd(char) {
    if (char === '\n') return this.waitingLength;
    return this.waitingNewLineEnd;
  }
}

/**
 * 请求方法
 */
void (async function () {
  let request = new Request({
    method: 'POST',
    host: '127.0.0.1',
    port: '8080',
    path: '/',
    headers: {
      ['X-Foo2']: 'custom',
    },
    body: {
      name: 'tridiamond',
    },
  });

  let response = await request.send();

  console.log(response);
})();
