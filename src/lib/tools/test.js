var path = require('path')
var c = require('./createMdFile.js');

var p = path.resolve(__dirname, '../../../db/rss/origin-2016-11-01-01-49-47');
c.create(p, path.resolve('./'));
