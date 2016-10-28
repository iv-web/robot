'use strict';
/**
 *  local
 *
 */

const fs = require('fs')
const path = require('path')

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

  var add = getNew(addfile)
  _save(originfile, JSON.stringify(getObj(originfile).concat(add)));
  console.log(`diff originfile and ${addfile} success ....`)


  function getObj(filename) {
    var r;
    try {

      console.log('start JSON.parse ..')
      r = JSON.parse(_read(filename) || '[]');
    } catch(e) {
      console.log('JSON.parse error')
      _save(filename, '');
      r = [];
    }
    return r;
  }
  function getNew(filename) {
    let arr = [], obj, titlesStr, titlesObj, newAdd = [];
    let titlesPath = path.resolve(global.ServerPath, '../db/rss/titles');
    obj = getObj(filename);

    try {
      fs.statSync(titlesPath);  
    } catch(e) {
      _save(titlesPath, '')
    }

    titlesStr = _read(titlesPath);
    
    try {
      titlesObj = JSON.parse(titlesStr);
    } catch (e) {
      titlesObj = [];
    }

    if (titlesObj) {
      obj.forEach(item => {
        //console.log(item.title)
        if (titlesObj.indexOf(item.title) < 0) {
          titlesObj.push(item.title);
          newAdd.push(item)
        }
      })

      _save(titlesPath, titlesObj);
    }
    
    return newAdd;
  }
}
