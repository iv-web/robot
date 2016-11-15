'use strict';

const Url = require('url');
const http = require('http');
const https = require('https');
const Promise = require('bluebird');
const local = require('../robot-local');


exports.filter = filter; 

function filter(origin_file, callback) {

  return new Promise((resolve, reject) => {

    let list = [];
    let originlist = local.getObj(origin_file);

    originlist.forEach((item, index) => {
      list.push(getHead(item.link, index));
    })

    console.log(`list length: ${list.length}`)
    Promise.all(list).then((obj) => {
      obj.forEach(item => {
        if (!item.active) {
          originlist[item.index].deleted = true;
        }
      })
      originlist = originlist.filter(item => {return !item.deleted})
      console.log('-----')
      originlist.forEach(item => {console.log(item.link)})
      
      local.save(origin_file, originlist);

      resolve(true);
      
      console.log('filter 404 page success...')
    }).catch(arr => {
       console.log(arr);
    })
  })
}


function getHead(url, index) {
  return new Promise((resolve, reject) => {
    let param = Url.parse(url);
    let options = {method: 'HEAD', host: param.host, port: 80, path: param.path};
    let _http = http;
    if (param.protocol === 'https:') {
      _http = https;
      options.port = 443;
    }
    var req = _http.request(options, (res) => {
      console.log(`url: ${url}; code: ${res.statusCode}`);
      if (res.statusCode === 200) {
        resolve({active: true, index: index});
      } else {
        resolve({active: false, index: index});
      }
    })
    req.end();
  });
}

 test();

function test() {
  // getHead('https://www.h5jun.com/post/what-does-a-startup-cto-actually-do.html');
  filter(__dirname + '/origin-2016-11-09-01-23-05-46', () => {
    console.log('this is callback...')
  })
}

