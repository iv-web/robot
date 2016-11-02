'use strict';

exports.sort = (arr) => {

	
	
	if (typeof arr !== 'object') {
		try {
		  arr = JSON.parse(arr);
		} catch (e) {
			throw e;
			return;
		}

	}

	const keys = {
		'javascript': 3,
		'js': 3,
		'html': 3,
		'css': 3,
		'node': 3,
		'react': 3,
		'前端': 2,
		'后端':1

	}


	arr.forEach(item => {
		for (let  i in keys) {
	    let _reg, match, weight = 0;
			_reg = new RegExp(i, 'ig');
      match = item.title.match(_reg);
			if (match) {
				weight = match.length;
			}
			weight = weight * keys[i];
			item.weight === undefined ? item.weight = weight:
				item.weight = (item.weight - 0) + weight;

		}
	})

	arr = arr.sort((a, b) => {
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

	arr.forEach(item => {
		console.log(`item.title: ${item.title}, weight: ${item.weight}`)
	})
	
	
	return arr;


}
