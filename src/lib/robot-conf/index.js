
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
  rss_sites: []
}

module.exports = {
  run: _run,
  get: _get
}

function _run() {

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

    var data, op, origin, news;
    data = querystring.parse(url.parse(req.url).query);
    op = data.op

    if (op == 'submit') {
      console.log('submit data ...')
      for (var i in conf_json) {
        origin = conf_json[i];
        news = data[i].replace(/\s/g, '');
        if (typeof origin == 'object') {
          conf_json[i] = news.split(',');
        } else {
          conf_json[i] = news;
        }
      }

      fs.writeFileSync(CONFFILE, JSON.stringify(conf_json), 'utf8');
    }

    ejs.renderFile(tpl, {data: conf_json}, {}, (err, str) => {
      if (err) {
        console.log(err);
        // reject(err);
      } else {
        res.end(str);
      }

    })


  }).listen(8890);

  console.log('setting page run at port: 8890....');
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

_run();
