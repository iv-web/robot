const fs = require('fs')

exports.create = (filename) => {

 fs.readFile(filename, 'utf8', (err, data) => {
	 if (err) {
		 throw err;
		 return;
	 }

	 var fn = filename.split(/[\\/]/).pop();

	 var p = global.ServerPath + '/lib/robot-github/__git_path_ivwebweekly_ignore/weekly/2016/' + fn;
	 console.log(p);
	 fs.writeFile(p, data, (err, data) => {

		 if (err) {
			 throw err;
			 return;
		 }

		 console.log('file copy success ....')
	 })
 })	

}
