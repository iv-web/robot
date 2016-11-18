
'use strict';

const login = require('../login.js');
const http = require('http');


http.createServer((req, res) => {

  login.isLogin(req);
}).listen(8899)


