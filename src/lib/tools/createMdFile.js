const fs = require('fs')

exports.create = (filename, createPath) => {

 fs.readFile(filename, 'utf8', (err, data) => {
	 if (err) {
		 throw err;
		 return;
	 }

	 var fn = filename.split(/[\\/]/).pop();

   var p ;
   if (createPath) {
     p = createPath + '/' + fn + '.md';
   } else {
	   p = global.ServerPath + '/lib/robot-github/__git_path_ivwebweekly_ignore/weekly/2016/' + fn + '.md';
   }

	 console.log(p);
   
   var obj = JSON.parse(data);

   var mdArr = [], menu = ['## 文章索引'], _index;
   
   obj.forEach((item, index) => {

     _index = index + 1; 
     _href = item.title.replace(/(\u3002|\uFF1F|\uFF01|\uFF0C|\u3001|\uFF1B|\uFF1A|\u300C|\u300D|\u300E|\u300F|\u2018|\u2019|\u201C|\u201D|\uFF08|\uFF09|\u3014|\u3015|\u3010|\u3011|\u2014|\u2026|\u2013|\uFF0E|\u300A|\u300B|\u3008|\u3009|,|\.|\?|'|"|\$|\%|\*|\(|\))/g, '').replace(/\s+/g, '-').toLowerCase();

     menu.push(_index + '、 <a href="#' + _index + _href + '" >' + item.title + '</a><br/>');

     mdArr.push('<h1 id="#title_' + index + '" >' + _index + '、' + item.title + '</h1>');
     mdArr.push(item.author);
     mdArr.push(`[${item.link}](${item.link})`)
     mdArr.push(item.desc)
     mdArr.push('---------------')
   })

   menu = menu.join('\n')

   var mdStr = mdArr.join('\n')

	 fs.writeFile(p, menu + mdStr, (err, data) => {

		 if (err) {
			 throw err;
			 return;
		 }

		 console.log('file copy success ....')
	 })
 })	

}
