
var local = require('../index.js');

var testJSONOrigin = '';

var testJSONAdd = [{
  title: 'aaaa', 
  description: 'xxxxxxx'
},{
  title: 'bbb', 
  description: 'xxxxxxx'
}]

// local.save('./testorigin', testJSONOrigin);
// 
// var testorigin = local.read('./testorigin');
// console.log(`testorigin string: ${testorigin}`);
// 
// 
// local.save('./testadd', testJSONAdd);

local.diff('testorigin', 'testadd');
