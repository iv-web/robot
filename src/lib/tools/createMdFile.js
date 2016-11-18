'use strict';
const local = require('../robot-local')
const fs = require('fs')
const path = require('path')

exports.create = (filename, createPath, github_filename) => {

  let p ;
  if (createPath) {
   p = path.resolve(createPath + '/' + github_filename + '.md');
  } else {
   p = path.resolve(global.ServerPath , './lib/robot-github/__git_path_ivwebweekly_ignore/weekly/2016/' + github_filename + '.md');
  }

   // 判断目录是不是存在
   let arr = p.split(path.sep);
   
   arr.pop();
   let path_week = path.resolve(arr.join(path.sep));
   arr.pop();
   let path_year = path.resolve(arr.join(path.sep));

   try {
     fs.statSync(path_year)
   } catch(e) {
     fs.mkdirSync(path_year);
   }

   try {
     fs.statSync(path_week)
   } catch(e) {
     fs.mkdirSync(path_week);
   }

   if (typeof filename == 'string') {
   
     let obj = local.getObj(filename);

      _create(obj, p);

   } else {
      _create(filename, p);
   } 
 
 
 function _create(obj, p) {

   let _href;
   let mdArr = [], menu = ['## 文章索引'], _index;
   
   obj.forEach((item, index) => {

     _index = index + 1; 
     _href = item.title.replace(/(\u3002|\uFF1F|\uFF01|\uFF0C|\u3001|\uFF1B|\uFF1A|\u300C|\u300D|\u300E|\u300F|\u2018|\u2019|\u201C|\u201D|\uFF08|\uFF09|\u3014|\u3015|\u3010|\u3011|\u2014|\u2026|\u2013|\uFF0E|\u300A|\u300B|\u3008|\u3009|,|\.|\?|'|"|\$|\%|\*|\(|\)|\[|\])/g, '').replace(/\s+/g, '-').toLowerCase();

     menu.push(_index + '、 <a href="#' + _index + _href + '" >' + item.title + '</a><br/>');

     mdArr.push('<h1 id="#title_' + index + '" >' + _index + '、' + item.title + '</h1>');
     mdArr.push(item.author);
     mdArr.push(`[${item.link}](${item.link})`)
     mdArr.push(item.desc)
     mdArr.push('---------------')
   })

   menu = menu.join('\n')

   let mdStr = mdArr.join('\n')

	 fs.writeFile(p, menu + mdStr, (err, data) => {

		 if (err) {
			 throw err;
			 return;
		 }

		 console.log('github file copy success ....')
	 })
 }
 

}

exports.createMenu = (basePath, weekNo, year) => {
  if (!basePath) {
     basePath = global.ServerPath;
  }
  const rssPath = path.resolve(basePath, '../db/rss/');

 // console.log(rssPath)
 
 const files = fs.readdirSync(rssPath);

 // console.log(files);
 
 let container = [];

 files.forEach(item => {
   if (item.split('-').pop() == weekNo + '') {
     // console.log(item)

     const json = local.getObj(path.resolve(rssPath, item));
     container = container.concat(json.splice(0, 5))
   }
 })

  container = container.sort((a, b) => {

		let aw = a.weight;
		let bw = b.weight;
		if (aw > bw) {
			return -1;
		} else if (aw < bw) {
			return 1;
		} else {
			return 0;
		}
  })

  container = container.splice(0, 10)
  // console.log(container)

  // 把这周的数据合并到总的文件中
  const menuFilePath = path.resolve(rssPath, 'weekly_menu');
  try {
    fs.statSync(menuFilePath);
  } catch(e) {
    local.save(menuFilePath, '{}')
  }
  let weeklyMenu = local.getObj(menuFilePath);

  weeklyMenu[weekNo] = container;

  local.save(menuFilePath, weeklyMenu)

  // console.log(weeklyMenu);
  

  let menu = [];
  menu.push('# WEEKLY LIST ')

  for (let i = weekNo; i > 0; i --) {
     let item = weeklyMenu[i];
     if (!item) continue;
     menu.push(`## 第${i}周文章列表`);
     item.forEach((item, index) => {
       menu.push(`${index+1}. [${item.title}](${item.link})`)
     })
     menu.push(`*[查看更多](https://github.com/iv-web/ivweb-weekly/blob/master/weekly/${year}/week_${weekNo}/)*`);
     menu.push('\r\n');

  }

  console.log(menu.join('       \r\n'))


  console.log(global.ServerPath);
	const readmePath = path.resolve(basePath, `./lib/robot-github/__git_path_ivwebweekly_ignore/weekly/README.md`);
  console.log(readmePath);

  local.save(readmePath, menu.join('       \r\n'));
  console.log('create readme md file success ....')


}
