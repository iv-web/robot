
var mail = require('../index.js');
const fs = require('fs')
const path = require('path')
var json = fs.readFileSync(path.resolve(__dirname, '0'));
json = JSON.parse(json);



mail.mail(json).then(str => {
  fs.writeFileSync('testhtml.html', str);
}).catch(err => {
  console.log(err)
})


