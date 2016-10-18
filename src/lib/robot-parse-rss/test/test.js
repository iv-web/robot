
var get_test = require('../index.js');

var url = 'http://www.ruanyifeng.com/blog/atom.xml';

// var url = 'http://javascriptweekly.com/rss/1gh8b434';

get_test(url).
  then(arr => {
    console.log(`arr.length: ${arr.length}`);
  });
