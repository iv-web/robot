
'use strict';
process.env.TZ = 'Asia/Shanghai';


global.ServerPath = __dirname;

const path = require('path')
const local = require(__dirname + '/lib/robot-local')
const parse = require(__dirname + '/lib/robot-parse-rss')
const mail = require(__dirname + '/lib/robot-mail')
const robot_sort = require(__dirname + '/lib/tools/sort.js')
const robot_copy_github = require(__dirname + '/lib/tools/createMdFile.js')
const robot_filter404 = require(__dirname + '/lib/tools/filter404.js')
const conf = require(__dirname + '/lib/robot-conf')
const fs = require('fs');

const tmp_db_path = path.resolve(__dirname, '../db/rss');
const origin_file = path.resolve(__dirname, '../db/rss/origin');
const mail_file = path.resolve(__dirname, '../db/rss/mail_file.html');

var done_arr = [];

const targetSites = conf.get('rss_sites');

const date = new Date();
const weekNo = getWeekNo(date); // 获得以第几周为名字的子文件夹
const dirname = 'week_' + weekNo
let d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()).toISOString().split(/\D/).splice(0, 6);
d.push(weekNo + '');
const newOriginFile = origin_file + '-' + d.join('-');
// IVWEB WEEKLY-20161102.md
const github_filename = dirname + '/IVWEB_WEEKL'+ '-' + d.slice(0, 3).join('');


function start () {

  console.log('robot starting...');
  console.log(new Date());
  //return;
  
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
    merger().then(() => {
      send_mail();
    })
    
  })
  
  function merger(callback) {
    // debugger;
    console.log('done_arr length: ' + done_arr.length)
    done_arr.forEach(item => {
      local.diff(origin_file, path.resolve(tmp_db_path, String(item)));
    })

    console.log('all file merger success.')

    return robot_filter404.filter(origin_file);
    
  }


  function send_mail() {
    var str = local.read(origin_file);
    var json = JSON.parse(str);

    // 按照关键字排序
	  json = robot_sort.sort(json);
		process.nextTick(() => {
			local.save(origin_file, json);
		});
    console.log(`start send mail, json.length: ${json.length}`)

    if (json.length <= 0) {
      return;
    }
    mail.mail(json, newOriginFile, github_filename).then(str => {
      local.save(mail_file, str)
      console.log('send mail success .....')
      end();
    }).catch(err => {

      console.log(err)
    });
  }

  function end() {
    console.log('copy file ....')
	  var newHtmlFile = mail_file.replace('.html', ('-' + d.join('-') + '.html'));
    try {
      fs.renameSync(origin_file, newOriginFile);
      fs.renameSync(mail_file, newHtmlFile)
      fs.writeFileSync(path.resolve(origin_file), '')
      console.log('copy file success ....'); 
			robot_copy_github.create(newOriginFile, null, github_filename);
      console.log('create github file success ....')
      robot_copy_github.createMenu(null, weekNo, date.getFullYear());
    } catch(e) {
      console.log(e);
    }
    
  }

}

function getWeekNo(d) {

  // Copy date so don't modify original
  d = new Date(+d);
  d.setHours(0,0,0,0);
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setDate(d.getDate() + 4 - (d.getDay()||7));
  // Get first day of year
  var yearStart = new Date(d.getFullYear(),0,1);
  // Calculate full weeks to nearest Thursday
  var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
  // Return array of year and week number

  return weekNo+1;

}

start();

