'use strict';
/**
 * get-value-from-url
 *
 * title description summary date pubdate pubDate link guid author comments origlink image source categories enclosures
 * atom:@ atom:title atom:link atom:id atom:published atom:updated atom:summary atom:author atom:category atom:content meta
 */

var http = require('http');
var util = require('util');
var parser = require('parse-rss');
var Promise = require('promise');
const conf = require('../robot-conf');

const list = conf.get('regexp_and_sites');

let sites = list.map(item => {

  try {
    if (item) {
      let o = {};
      let a = item.split('|');
      o.url = a[0];
      o.list_reqExp = a[1];
      o.desc_reqExp = a[2];

      console.log(o);
      return o;
    }
  } catch (e) {
    console.log(`${__dirname}: conf parse error , item : ${JSON.stringify(item)} ....`);
  }

})

sites = sites.filter(item => { return item ? true : false});

console.log(sites);
return;
exports.handle = init;


// title, desc, url, time, author
function init(url, index) {
  
  return new Promise((resolve, reject) => {

    console.log(`start require url: ${url}`);

    parser(url, (err, rss) => {
      
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(`rss.length: ${rss.length}, url: ${url}, index: ${index}`);
        var out = [];

        rss.forEach(item => {
          var d = item.date;
          var _date = util.format('%s-%s-%s', d.getFullYear(), d.getMonth()+1, d.getDate())
          out.push({
            title: item.title,
            desc: item.description ? item.description.replace(/<a.*<\/a>/g, '') : '',
            link: item.link,
            date: _date,
            author: item.author,
            cate: item.categories
          })
        });

        resolve(out);
      }

    })

  });

}
