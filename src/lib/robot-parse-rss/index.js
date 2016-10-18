/**
 * get-value-from-url
 *
 * title description summary date pubdate pubDate link guid author comments origlink image source categories enclosures
 * atom:@ atom:title atom:link atom:id atom:published atom:updated atom:summary atom:author atom:category atom:content meta
 */

var http = require('http');
var parser = require('parse-rss');
var Promise = require('promise');

module.exports = getValueFromUrl;


// title, desc, url, time, author
function getValueFromUrl(url, index) {
  
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
          out.push({
            title: item.title,
            desc: item.description ? item.description.replace(/<a.*<\/a>/g, '') : '',
            link: item.link
          })
        });

        resolve(out);
      }

    })

  });

}
