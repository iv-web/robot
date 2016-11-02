
'use strict';
const util = require('util')
//const msg = require('./msg.js');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path')
const Promise = require('promise')
const fs = require('fs')
const tpl = path.resolve(__dirname, 'tpl/index.ejs');
const conf = require('../robot-conf')
var _to = conf.get('mail_to')
var _cc = conf.get('mail_cc')



// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'qq',  
  auth: {  
    user: '2580575484@qq.com',  
    pass: 'jyqujqyyunkydjhb' //授权码,通过QQ获取  
  }  
});

// setup e-mail data with unicode symbols
let mailOptions = {
    from: '"IVWEB" 2580575484@qq.com', // sender address
};


module.exports.mail = (json, newOriginFile) => {

  const d = new Date();

  mailOptions.to = _to;
  mailOptions.cc = _cc;
  mailOptions.subject = `【IVWEB WEEKLY】${util.format('%s-%s-%s', d.getFullYear(), d.getMonth()+1, d.getDate())} 最新文章`;

  
  const _data = {
    data: json.slice(0, 5),
    newOriginFile: 'https://github.com/iv-web/ivweb-weekly/blob/master/weekly/2016/' + newOriginFile.split(/[\/\\]/).pop() + '.md'
  }

  return new Promise((resolve, reject) => {

    ejs.renderFile(tpl, _data, {}, (err, str) => {
      if (err) {
        console.log(err)
        reject(err)
      }

      mailOptions.html = str;

      // send mail with defined transport object
      transporter.sendMail(mailOptions, function(error, info){
          if(error){
              console.log(error);
              reject(error)
          } else {
            resolve(str)
            console.log('Message sent: ' + info.response);
          }
      });
    })
  })

  

}
