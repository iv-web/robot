
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



// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'qq',  
  auth: {  
    user: '404645486@qq.com',  
    pass: 'ercnokftpiekbhgj' //授权码,通过QQ获取  
  }  
});

// setup e-mail data with unicode symbols
let mailOptions = {
    from: '404645486@qq.com', // sender address
};


module.exports.mail = (json) => {

  const d = new Date();

  mailOptions.to = _to;
  mailOptions.subject = `【互动视频知识weekly】- ${util.format('%s-%s-%s', d.getFullYear(), d.getMonth()+1, d.getDate())}`;

  const _data = {
    data: json
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
