let http = require('http');
let https = require('https');
let unzipper = require('unzipper');
let querystring = require('querystring');

let outFile = fs.createWriteStream("../nodeServer/public/index.html");
// 2、auth 路由去接收code，用code_id + client_secrect 换 token
function auth(request, response) {
  let query = querystring.parse(request.url.match(/^\/auth\?([\s\S]+)$/));
  getTooken(query.code, function(info){
    // response.write(JSON.stringfy(info));
    response.write(`<a href="http://localhost:8083?token=${info.access_token}">publish</a>`)
    response(end);
  });

}
function getTooken(code, callback) {
  let request = https.request({
    hostname: "github.com",
    path:`/login/oauth/access_token?code=${code}&client_id=${client_id}&client_secret=${client_secret}`,
    port: 443,
    method: "POST"
  }, function(response){
    let body = "";
    response.on('data', (chunk) => {
      body += (chunk.toString());
    })
    response.on('end', (chunk) => {
      let o = querystring.parse(body);
      callback(o);
    })
  });
  request.end();
}

// 4、publish路由：用token获取用户信息，检查权限，接受发布
function publish(request, response) {
  let query = querystring.parse(request.url.match(/^\/auth\?([\s\S]+)$/));
  if(query.token) {
    getUser(query.token, info => {
      if(info.login === "username") {
        request.pipe(outFile);
        request.pipe(unzipper.Extract({ path: '../nodeServer/public' }));
      }
    });
  }
}
function getUser(token, callback) {
  let request = https.request({
    hostname: "github.com",
    path:`/user`,
    port: 443,
    method: "GET",
    headers: {
      Authorization: `token ${token}`,
      "User-Agent": "toy-publish"
    }
  }, function(response){
    let body = "";
    response.on('data', (chunk) => {
      body += (chunk.toString());
    })
    response.on('end', (chunk) => {
      let o = querystring.parse(body);
      callback(o);
    })
  });
  request.end();
}
// auth 路由：接收 code 
http.createServer(function(request, response) {
  // 覆盖式发布
  if(request.urlmatch(/^\/auth\?/)){
    return auth(request, response);
  }
  if(request.urlmatch(/^\/publish\?/)){
    return publish(request, response);
  }
  
  
}).listen(8082);