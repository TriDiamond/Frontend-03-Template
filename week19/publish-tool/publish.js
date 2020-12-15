let http = require('http');
// 引入文件模块
let fs = require('fs');
let querystring = require('querystring');
// 压缩文件包引用
let archiver = require('archiver');
let child_process = require("child_process");

// 1、打开 https://github.com/login/oauth/authorize
child_process.exec(`https://github.com/login/oauth/authorize?client_id=${register_clientId}`);
// 3、创建serer，接收token,后点击发布
// auth 路由：接收 code 
http.createServer(function(request, response) {
  let query = querystring.parse(request.url.match(/^\/\?([\s\S]+)$/)[1]);
  publish(query.token)
}).listen(8083);


function publish(token) {
  let request = http.request({
    hostname: '127.0.0.1', // 发布服务器地址
    port: 8082, // 端口
    methos: 'post',
    path: `/publish?token=${token}`,
    headers: {
      'Content-Type': 'application/octet-stream'
    }
  }, response => {
    console.log(response);
  });

  let file = fs.createReadStream("./index.html");
  const archive = archiver('zip', {
    zlib: { level: 9 }
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
