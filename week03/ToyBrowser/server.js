const http = require('http');

http
  .createServer((request, response) => {
    let body = [];
    request
      .on('error', err => {
        console.error(err);
      })
      .on('data', chunk => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        console.log('body', body);
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(
          `<html class=a>
  <head>
    <style>
      body div #myId {
        width: 100px;
        background-color: #ff5000;
      }
      body div img {
        color: red;
      }
      body div img#abId.a.b {
        background-color: #ff0000;
      }
    </style>
  </head>
  <body>
      <div>
        <img id="myId" />
        <img class="a b" id="abId"/>
      </div>
  </body>
</html>`
        );
      });
  })
  .listen(8080);

console.log('server started');
