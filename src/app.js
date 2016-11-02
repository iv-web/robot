
process.env.TZ = 'Asia/Shanghai';


global.ServerPath = __dirname;

const path = require('path')
const local = require(__dirname + '/lib/robot-local')
const parse = require(__dirname + '/lib/robot-parse-rss')
const mail = require(__dirname + '/lib/robot-mail')
const robot_sort = require(__dirname + '/lib/tools/sort.js')
const robot_copy_github = require(__dirname + '/lib/tools/createMdFile.js')
const conf = require(__dirname + '/lib/robot-conf')
const fs = require('fs');

const tmp_db_path = path.resolve(__dirname, '../db/rss');
const origin_file = path.resolve(__dirname, '../db/rss/origin');
const mail_file = path.resolve(__dirname, '../db/rss/mail_file.html');


var done_arr = [];

// 要抓取那些网站
//const targetSites = [
  //'http://www.ruanyifeng.com/blog/atom.xml',
  //'http://geek.csdn.net/admin/news_service/rss',
  //'http://javascriptweekly.com/rss/1gh8b434',
  //'http://feeds.gracecode.com/gracecode/',
  //'https://hacks.mozilla.org/feed/',
  //'http://www.infoq.com/cn/feed',
  //'https://cnodejs.org/rss',
  //'http://fex.baidu.com/feed.xml',
  //'https://www.smashingmagazine.com/feed/',
  //'http://feed.cnblogs.com/blog/u/90635/rss',
  //'http://gold.xitu.io/rss'
//]

const targetSites = conf.get('rss_sites');

function start () {

  console.log('robot starting...');
  console.log(new Date());

  
  try {
    fs.statSync(path.resolve(__dirname, '../db/rss'))
  } catch (e) {
    fs.mkdirSync(path.resolve(__dirname, '../db/'))
    fs.mkdirSync(path.resolve(__dirname, '../db/rss'))
    fs.writeFileSync(origin_file, '');
  }

  targetSites.forEach((item, index) => {

    const mpath = path.resolve(tmp_db_path, String(index));
    parse(item, index).then(out => {
      local.save(mpath, out);
      done_arr.push(index);
    }).catch(err => {
      console.log(err)
    })


  }) 

  const done = new Promise((resolve, reject) => {
    var timeout = setTimeout(() => {
      clearTimeout(intervalue)
      resolve(true)
    }, 10e3)
    var intervalue = setInterval(() => {
      if (done_arr.length == targetSites.length) {
        resolve(true);
        _end();
      }
    }, 1e3)
    function _end() {
      clearTimeout(timeout)
      clearInterval(intervalue);
    }
  })
  
  done.then(() => {
    console.log('all file load success. ')
    merger()
    send_mail();
    
  })
  
  function merger() {
    debugger;
    console.log('done_arr length: ' + done_arr.length)
    done_arr.forEach(item => {
      local.diff(origin_file, path.resolve(tmp_db_path, String(item)));
    })

    console.log('all file merger succcess.')
  }

  function send_mail() {
    var str = local.read(origin_file);
    var json = JSON.parse(str);
	  json = robot_sort.sort(json);
		process.nextTick(() => {
			local.save(origin_file, json);
		});
    console.log(`start send mail, json.length: ${json.length}`)

    if (json.length <= 0) {
      return;
    }
    mail.mail(json).then(str => {
      local.save(mail_file, str)
      console.log('send mail success .....')
      end();
    }).catch(err => {

      console.log(err)
    });
  }
  function end() {
    var d = new Date().toISOString().replace(/\D/g, '-').slice(0, 19);
    console.log('copy file ....')
	  var newHtmlFile = mail_file.replace('.html', ('-' + d + '.html'));
    var newOriginFile = origin_file + '-' + d;
    try {
      fs.renameSync(origin_file, newOriginFile);
      fs.renameSync(mail_file, newHtmlFile)
      fs.writeFileSync(path.resolve(origin_file), '')
      console.log('copy file success'); 

			robot_copy_github.create(newOriginFile);
    } catch(e) {
      console.log(e);
    }
    
  }

}

start();

