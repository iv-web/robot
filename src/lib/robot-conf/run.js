
'use strict';
let port = 8890;
let portIndex = process.argv.indexOf('-p');
if (portIndex > 0) {
  portIndex += 1;
  port = process.argv[portIndex] || 8890;
}

var run = require(__dirname + '/index.js')
run.run(port);
