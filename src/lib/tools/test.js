var path = require('path')
var c = require('./createMdFile.js');

//var p = path.resolve(__dirname, '../../../db/rss/origin-2016-11-08-05-16-09');
//
//global.ServerPath = __dirname;
//
//c.create(p, './aaa/ddd');
//

global.ServerPath = path.resolve(__dirname, '../../')
c.createMenu(path.resolve(__dirname, '../../'), 46, 2016)
