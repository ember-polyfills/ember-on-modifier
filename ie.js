const { spawn } = require('child_process');
const { createServer } = require('http');

const IE_PATH = 'C:\\Program Files\\Internet Explorer\\iexplore.exe';

const server = createServer((req, res) => {
  console.log(req);
  server.close();
}).listen(4200);

const ie = spawn(IE_PATH, ['http://localhost:4200/']);

ie.stdout.on('data', data => {
  console.log(data.toString());
});

ie.stderr.on('data', data => {
  console.log(`ie stderr: ${data}`);
});

ie.on('close', code => {
  if (code !== 0) {
    console.log(`ie process exited with code ${code}`);
  }
});
