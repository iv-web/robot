'use strict';

const Url = require('url');
const http = require('http');
const Promise = require('bluebird');
const local = require('../robot-local');


exports.filter = filter; 

function filter(origin_file, callback) {

  let list = [];
  let originlist = local.getObj(origin_file);

  originlist.forEach((item, index) => {
    list.push(getHead(item.link, index));
  })

  console.log(`list length: ${list.length}`)
  Promise.all(list).then((arr) => {
    console.log(arr)
    console.log('filter 404 page success...')
  }).catch(arr => {
    console.log(arr);
  })
}


function getHead(url, index) {
  return new Promise((resolve, reject) => {
    let param = Url.parse(url);
    let options = {method: 'HEAD', host: param.host, port: 80, path: param.path};
    var req = http.request(options, (res) => {
      console.log(`url: ${url}; code: ${res.statusCode}`);
      if (res.statusCode === 200) {
        resolve(index);
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        let param = Url.parse(res.headers.location);
        let options = {method: 'HEAD', host: param.host, port: 80, path: param.path};
        let  req = http.request(options, (res) => {
            console.log(`url: ${param.url}; code: ${res.statusCode}`);
        });
        reject(index);
      };
    })
    req.end();
  });
}

test();

function test() {
  filter(__dirname + '/origin-2016-11-09-01-23-05-46', () => {
    console.log('this is callback...')
  })
}

