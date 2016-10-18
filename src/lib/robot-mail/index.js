
const util = require('util')
const msg = require('./msg.js');
const ejs = require('ejs');
const path = require('path')
const Promise = require('promise')
const fs = require('fs')
const tpl = path.resolve(__dirname, 'tpl/index.ejs');


module.exports.mail = (json) => {

  const d = new Date();
  const to = 'herbertliu;adamhe;evanjyu;fishineyuan;kevinyyang;kurtshen;lindazhu;linjianghe;linkzhu;lowenshi;sampsonwang;vienwu;willliang;zhuoyingmo;'
  const title = `【互动视频知识weekly】- ${util.format('%s-%s-%s', d.getFullYear(), d.getMonth()+1, d.getDate())}`;
  const cc = '';
  const html;

  const _data = {
    data: json
  }
  return new Promise((resolve, reject) => {

    ejs.renderFile(tpl, _data, {}, (err, str) => {
      if (err) {
        console.log(err)
        reject(err)
      }

      msg.mail(to, title, str, cc);
      resolve(str)
    })
  })

  

}
