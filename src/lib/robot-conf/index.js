'use strict';
const ejs = require("ejs");
const url = require("url");
const querystring = require('querystring');
const path = require("path")
const Promise = require("promise")
const fs = require("fs")
const tpl = path.resolve(__dirname, "tpl/index.ejs");
const http = require('http')

const CONFFILE = __dirname + "/conf.json.db";


const EXAMPLE_CONF_JSON = {
  mail_to: [],
  mail_cc: [],
  rss_sites: [],
  rss_site_timeout: '',
  backup: '',
  regexp_and_sites: [],
  group_client_mail_to: [],
  group_client_key: []
}

module.exports = {
  run: _run,
  get: _get
}

function _run(port) {

  http.createServer((req, res) => {
    let html = "";

    var conf_json;
    
    try {
      conf_json = fs.readFileSync(CONFFILE, 'utf8');
    } catch(e) {

      fs.writeFileSync(CONFFILE, JSON.stringify(EXAMPLE_CONF_JSON), 'utf8');
    }

    if (!conf_json)  {
      conf_json = fs.readFileSync(CONFFILE, 'utf8');
    }

    conf_json = JSON.parse(conf_json);

    for(let i in EXAMPLE_CONF_JSON) {
      if (!conf_json[i]) {
        conf_json[i] = EXAMPLE_CONF_JSON[i];
      }
    }

    var clientData, op, origin, news;

    // post 请求处理
    if (req.method === 'POST') {
      req.on('data', (data) => {
        clientData = querystring.parse(data.toString());
        op = clientData.op
        console.log(clientData);

        // 处理提交的数据
        console.log('submit data ...')
        for (var i in conf_json) {
          origin = conf_json[i];
          if (!clientData[i]) continue;
          news = clientData[i].replace(/\s/g, '');
          if (typeof origin == 'object') {
            conf_json[i] = news.split(',');
          } else {
            conf_json[i] = news;
          }
        }

        fs.writeFileSync(CONFFILE, JSON.stringify(conf_json), 'utf8');

        render(tpl, conf_json, res);
      })
    } else {
      render(tpl, conf_json, res);
    }


    function render(tpl, conf_json, res) {
      ejs.renderFile(tpl, {
        data: conf_json,
        url: '/'
      }, {}, (err, str) => {
        if (err) {
          console.log(err);
          // reject(err);
        } else {
          res.end(str);
        }

      })
    }


  }).listen(port);

  console.log('setting page run at port: ' + port + '....');
}

function _get(name) {
  let conf = fs.readFileSync(CONFFILE, "utf8");
  conf = conf.replace(/\s/g, "");
  conf = JSON.parse(conf);
  
  for (let i in conf) {
    console.log(`name: ${name}, value: ${conf[name]}`);
    return conf[name];
  }
}

