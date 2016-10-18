/**
 *  local
 *
 */

const fs = require('fs')

module.exports = {
  save: _save,
  read: _read,
  diff: _diff
}

function _save(filename, string) {
  if (typeof string == 'object') {
    string = JSON.stringify(string);
  }

  try {
  fs.writeFileSync(filename, string);
  } catch (e) {
    console.log(e);
  }
}

function _read(filename) {
  var file;
  try {
    file = fs.readFileSync(filename, 'utf8');
  } catch (err){
    console.log(err)
    file = false;
  }
  return file;
}

function _diff(originfile, addfile) {
  var origin = getTitle(originfile)
  var add = getObj(addfile)

  var newArr = [];
  add.forEach(item => {
    if (origin.indexOf(item.title) < 0) {
      newArr.push(item)
    }
  })

  _save(originfile, JSON.stringify(getObj(originfile).concat(newArr)));
  console.log(`diff originfile and ${addfile} success ....`)


  function getObj(filename) {
    return JSON.parse(_read(filename) || '[]');
  }
  function getTitle(filename) {
    var arr = [], obj, item;
    obj = getObj(filename);
    for(var i in obj) {
      item = obj[i];
     
      arr.push(item.title);
      
    }
    return arr;
  }
}
