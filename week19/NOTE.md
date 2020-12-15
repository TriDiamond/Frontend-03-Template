# 发布系统---实现一个线上 Web 服务

​ 发布系统包括三个子系统：

​ 1、线上服务系统 --- 真实用户发布服务

​ 2、发布系统 --- 程序员向线上服务系统发布，与线上服务系统，可以同级部署，也可以是独立集群

​ 3、发布工具 --- 命令行工具与线上服务系统同步对接

## 初始化 Server

1、准备工作：安装虚拟机[Oracle virtualBox](https://www.virtualbox.org/)

2、创造虚拟机，选择`Linux`系统

3、选择光盘镜像，选择安装的[Ubuntu Server](https://releases.ubuntu.com/20.04/)

4、需要修改镜像地址（不修改速度则会比较慢），修改为阿里云的镜像地址： http://mirrors.aliyun.com/ubuntu

5、其他都选择默认，然后进入安装状态，可以通过日志查看

6、重启虚拟机，输入用户名、密码登录

7、安装`nodejs`： `sudo apt install nodes`

8、安装`npm`: `sudo apt install npm`

9、安装`sudo apt install n`，n 是 Node 的版本管理

10、直接使用`sudo n lasted` 就可以更新 Node 的版本，重新设置`PATH=$PATH`， Node 就可以拿到最新版本

## 利用 Express，编写服务器

​ [`Express` ](https://www.expressjs.com.cn/)是目前使用最广泛的服务器框架。如果发布模式是前后端高度分离的，则前端代码是发布 _HTML_，服务端的数据由 _HTML_ 和 _JavaScript_ 通过`Ajax` 请求来获取。本节课主要是对静态文件的发布进行介绍，服务端混合发布暂不涉及（由于可能需要和后端同学商量方案、前端是否拥有独立发布的权利等，涉及现实情况来考虑）。具体实践如下：

1、新建文件夹，初始化文件夹

```bash
mkdir server
cd server
// (如果经常使用，则全局安装)
npx express-generator
// 安装依赖
npm i
```

2、主要文件目录介绍

```markdown
| nodeServer/app.js --- 主要模板文件，可以不需要修改
--｜ nodeServer/views --- jade 模板，可以不需要
--｜ nodeServer/routes --- 路由配置，可以不需要
--｜ nodeServer/public --- 编写我们主要逻辑的目录
```

3、通过`npm start` 运行项目，默认端口号 3000。

4、把 server 的内容部署到虚拟机服务器：

    * 首先虚拟机服务器安装`apt install OpenSSH`(默认安装了则不需要在安装)，由于Ubuntu的服务器，默认是不启动，通过`service ssh start` 启动服务器，默认在22端口启动。
    * 在虚拟机里设置端口转发，在Network的Port Forwarding进行设置（每用到一个端口就需要进行一个映射）。在Mac系统上可以使用`scp`命令（其它操作系统可自行安装），将本目录的文件资源拷贝到虚拟机服务器上。

```bash
scp -P 8002 -r ./* path@127.0.0.1(实际服务器地址):/path（文件存储的目录）
```

> `SSH` 既可以远程登录，又可以传输文件。

5、实现发布服务，发布服务由发布的服务器端和发布工具构成。新建发布服务器文件夹`publish-server`，由于示例代码比较简单，因此我们使用`http` 来达到发起服务的目的。新建`server.js`编写代码，并通过`node ./server.js` 发起服务，到浏览器窗口打开`localhost:8082` 查看页面。

```javascript
let http = require('http');

http
  .createServer(function (req, res) {
    console.log(req);
    res.end('hello World');
  })
  .listen(8082);
```

新建客户端服务器文件夹`publish-tool`,编写请求代码

```javascript
let http = require('http');

// request流式写入数据
// 接收两个参数：option, callback
let request = http.request(
  {
    hostname: '127.0.0.1', // 发布服务器地址
    port: 8082, // 端口
  },
  response => {
    console.log(response);
  }
);
// 流式处理
request.end();
```

## 简单了解 Node.js 的流

Node.js 中的流分为两部分：一部分是可读的流（获取数据），主要使用的是流对象的`close` 和`data`事件；另外一部分则是只写的流，主要是用的是`write` 和 `end` 方法（其中`write` 不是同步方法，如果上一个还没有写完，则会通过排队缓存的方法进行）。

```javascript
// 客户端服务器
let http = require('http');
// 引入文件模块
let fs = require('fs');

// request流式写入数据
// 接收两个参数：option, callback
let request = http.request(
  {
    hostname: '127.0.0.1', // 发布服务器地址
    port: 8082, // 端口
    methos: 'post',
    headers: {
      'Content-Type': 'application/octet-stream',
    },
  },
  response => {
    console.log(response);
  }
);

let file = fs.createReadStream('./package.json');
file.on('data', chunk => {
  console.log(chunk.toString());
  request.write(chunk);
});
file.on('end', chunk => {
  console.log('read finish');
  request.end(chunk);
});
```

## 改造服务端

1、改造发布服务器文件夹`publish-server`，将读取到的文件写入到指定路径`../server/public/index.html`

```javascript
let http = require('http');
let fs = require('fs');

http
  .createServer(function (request, response) {
    console.log(request.headers);
    let outFile = fs.createWriteStream('../nodeServer/public/index.html');
    request.on('data', chunk => {
      console.log(chunk, '----');
      outFile.write(chunk);
    });
    request.on('end', () => {
      outFile.end(); // 为了防止服务停止后还有写入操作
      response.end('Sucess');
    });
  })
  .listen(8082);
```

2、在`nodeServer` 端新建`index.html`文件。

```javascript
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hello World!</title>
</head>
<body>
  <div>Hello World!</div>
</body>
</html>
```

3、改造客户端服务器文件夹`publish-tool`，将之前读取的文件路径进行修改。

```javascript
let http = require('http');
// 引入文件模块
let fs = require('fs');

// request流式写入数据
// 接收两个参数：option, callback
let request = http.request(
  {
    hostname: '127.0.0.1', // 发布服务器地址
    port: 8082, // 端口
    methos: 'post',
    headers: {
      'Content-Type': 'application/octet-stream',
    },
  },
  response => {
    console.log(response);
  }
);

let file = fs.createReadStream('./index.html');
file.on('data', chunk => {
  console.log(chunk.toString());
  request.write(chunk);
});
file.on('end', chunk => {
  console.log('read finish');
  request.end(chunk);
});
```

4、运行服务器，并打开`nodeServer`，运行后在`localhost:3000` 可以看到传输的内容。

5、在发布系统进行部署，由于需要多次进行部署，因此可以把运行命令添加到 package.json 的命令当中，然后同时启动两个服务。如果是虚拟机，则需要再配置端口，然后发布端口也修改。

```json
"publish": "scp -r -P 8022 ./* 虚拟服务器用户名@127.0.0.1:/home/文件目录/nodeServer"
```

## 实现多文件发布

关于流的新知识---`readable.pipe`（pipe() 能够将一个可读的流导入进一个可写的流）。通过`pipe()`就可以将之前的代码简化。

```javascript
// publish.js
let http = require('http');
// 引入文件模块
let fs = require('fs');

// request流式写入数据
// 接收两个参数：option, callback
let request = http.request(
  {
    hostname: '127.0.0.1', // 发布服务器地址
    port: 8082, // 端口
    methos: 'post',
    headers: {
      'Content-Type': 'application/octet-stream',
    },
  },
  response => {
    console.log(response);
  }
);

let file = fs.createReadStream('./index.html');
file.pipe(request);
file.on('end', chunk => {
  request.end(chunk);
});

// server.js
let http = require('http');
let fs = require('fs');

http
  .createServer(function (request, response) {
    // console.log(request.headers);
    let outFile = fs.createWriteStream('../nodeServer/public/index.html');

    request.pipe(outFile);
  })
  .listen(8082);
```

而我们也可以通过`fs.stats()`来获取传输的文件大小，并通过会处理所有逻辑。

```javascript
let http = require('http');
// 引入文件模块
let fs = require('fs');
// 读取文件大小
fs.stat('./index.html', (err, stats) => {
  // request流式写入数据
  // 接收两个参数：option, callback
  let request = http.request(
    {
      hostname: '127.0.0.1', // 发布服务器地址
      port: 8082, // 端口
      methos: 'post',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': stats.size,
      },
    },
    response => {
      console.log(response);
    }
  );

  let file = fs.createReadStream('./index.html');
  file.pipe(request);
  file.on('end', chunk => {
    request.end(chunk);
  });
});
```

针对于多文件场景，一个是本地服务器压缩文件，然后在服务器端解压文件。首先，我们先在本地服务器(publish-tool)安装引入`archive`进行文件压缩，并先使用 API 压缩文件：

```javascript
let http = require('http');
// 引入文件模块
let fs = require('fs');
// 压缩文件包引用
let archiver = require('archiver');
// 读取文件大小
fs.stat('./index.html', (err, stats) => {
  let file = fs.createReadStream('./index.html');
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });
  // 压缩文件方法
  archiver.directory('./sample/', false);
  // 这个API表示已经为压缩工具填好了压缩内容
  archiver.finalize();
  // 压缩到本地文件夹
  archiver.pipe(fs.createReadStream('tmp.zip'));
  // 发送到服务器端
  archiver.pipe(request);
});
```

其次，在`publish-server`发布服务器上安装解压包`unzipper`，然后进行解压。

```javascript
let http = require('http');
let unzipper = require('unzipper');
http
  .createServer(function (request, response) {
    // 覆盖式发布
    request.pipe(unzipper.Extract({ path: '../nodeServer/public' }));
  })
  .listen(8082);
```

## 通过 GitHub oAuth 做一个登录实例

根据 GitHub 的 oAuth 来完成登录实例，大体流程可以参考 oAuth 的 API：首先是跳转到权限页面进行登录，然后通过返回的 code 去其他页面获取 access_token，最后通过 access_token 就可以访问用信息。而我们设计的思路可以转化为：

1、打开 https://github.com/login/oauth/authorize

2、auth 路由去接收 code，用 code_id + client_secrect 换 tooken

3、创建 server，接收 tooken,后点击发布

4、publish 路由：用 token 获取用户信息，检查权限，接受发布

具体服务器端代码如下:

```javascript
let http = require('http');
let https = require('https');
let unzipper = require('unzipper');
let querystring = require('querystring');

let outFile = fs.createWriteStream('../nodeServer/public/index.html');
// 2、auth 路由去接收code，用code_id + client_secrect 换 token
function auth(request, response) {
  let query = querystring.parse(request.url.match(/^\/auth\?([\s\S]+)$/));
  getTooken(query.code, function (info) {
    // response.write(JSON.stringfy(info));
    response.write(`<a href="http://localhost:8083?token=${info.access_token}">publish</a>`);
    response(end);
  });
}
function getTooken(code, callback) {
  let request = https.request(
    {
      hostname: 'github.com',
      path: `/login/oauth/access_token?code=${code}&client_id=${client_id}&client_secret=${client_secret}`,
      port: 443,
      method: 'POST',
    },
    function (response) {
      let body = '';
      response.on('data', chunk => {
        body += chunk.toString();
      });
      response.on('end', chunk => {
        let o = querystring.parse(body);
        callback(o);
      });
    }
  );
  request.end();
}

// 4、publish路由：用token获取用户信息，检查权限，接受发布
function publish(request, response) {
  let query = querystring.parse(request.url.match(/^\/auth\?([\s\S]+)$/));
  if (query.token) {
    getUser(query.token, info => {
      if (info.login === 'username') {
        request.pipe(outFile);
        request.pipe(unzipper.Extract({ path: '../nodeServer/public' }));
      }
    });
  }
}
function getUser(token, callback) {
  let request = https.request(
    {
      hostname: 'github.com',
      path: `/user`,
      port: 443,
      method: 'GET',
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'toy-publish',
      },
    },
    function (response) {
      let body = '';
      response.on('data', chunk => {
        body += chunk.toString();
      });
      response.on('end', chunk => {
        let o = querystring.parse(body);
        callback(o);
      });
    }
  );
  request.end();
}
// auth 路由：接收 code
http
  .createServer(function (request, response) {
    // 覆盖式发布
    if (request.urlmatch(/^\/auth\?/)) {
      return auth(request, response);
    }
    if (request.urlmatch(/^\/publish\?/)) {
      return publish(request, response);
    }
  })
  .listen(8082);
```

本地服务器代码如下：

```javascript
let http = require('http');
// 引入文件模块
let fs = require('fs');
let querystring = require('querystring');
// 压缩文件包引用
let archiver = require('archiver');
let child_process = require('child_process');

// 1、打开 https://github.com/login/oauth/authorize
child_process.exec(`https://github.com/login/oauth/authorize?client_id=${register_clientId}`);
// 3、创建serer，接收token,后点击发布
// auth 路由：接收 code
http
  .createServer(function (request, response) {
    let query = querystring.parse(request.url.match(/^\/\?([\s\S]+)$/)[1]);
    publish(query.token);
  })
  .listen(8083);

function publish(token) {
  let request = http.request(
    {
      hostname: '127.0.0.1', // 发布服务器地址
      port: 8082, // 端口
      methos: 'post',
      path: `/publish?token=${token}`,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    },
    response => {
      console.log(response);
    }
  );

  let file = fs.createReadStream('./index.html');
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });
  // 压缩文件方法
  archiver.directory('./sample/', false);
  // 这个API表示已经为压缩工具填好了压缩内容
  archiver.finalize();
  // 压缩到本地文件夹
  archiver.pipe(fs.createReadStream('tmp.zip'));
  // 发送到服务器端
  archiver.pipe(request);
  file.on('end', chunk => {
    request.end(chunk);
  });
}
```
