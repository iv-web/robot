var myUtil = require('./lib/myUtil');
var tof = require('./node-tof.js');
var msg = require('./msg.js');
var fs = require('fs');
var ejs = require('ejs');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var async = require('async');
var zlib = require('zlib');

var BOBO_CGIS = [
    'http://www.bobo.com/home/getHotlive?orderby=cost', //热门直播
    'http://www.bobo.com/home/getNewRecommendAnchor?orderby=cost', //新生代
    'http://www.bobo.com/home/get4types?type=1&orderby=cost', //好声音
    'http://www.bobo.com/home/get4types?type=2&orderby=cost', //萌妹子
    'http://www.bobo.com/home/get4types?type=3&orderby=cost', //够劲爆
    'http://www.bobo.com/home/get4types?type=4&orderby=cost' //超搞siao
];

var KK_CGIS = [
    'http://www.kktv1.com/CDN/output/M/1/I/10002032/P/partId-100_start-0_offset-20_platform-1_a-1_c-100/json.js', //兴趣推荐
    'http://www.kktv1.com/CDN/output/M/1/I/10002032/P/partId-101_start-0_offset-20_platform-1_a-1_c-100/json.js', //劲爆
    'http://www.kktv1.com/CDN/output/M/1/I/10002032/P/partId-104_start-0_offset-20_platform-1_a-1_c-100/json.js', //神曲
    'http://www.kktv1.com/CDN/output/M/1/I/10002032/P/partId-108_start-0_offset-20_platform-1_a-1_c-100/json.js', //搞笑
    'http://www.kktv1.com/CDN/output/M/1/I/10002032/P/partId-103_start-0_offset-20_platform-1_a-1_c-100/json.js', //才艺
    'http://www.kktv1.com/CDN/output/M/1/I/10002032/P/partId-107_start-0_offset-20_platform-1_a-1_c-100/json.js', //游戏
    'http://www.kktv1.com/CDN/output/M/1/I/10002032/P/partId-203_start-0_offset-20_platform-1_a-1_c-100/json.js' //热舞
];


var KK_PARTID = [100, 203, 101, 104, 108, 103, 107];  // 兴趣推荐, 热舞, 劲爆, 神曲, 搞笑, 才艺, 游戏

var YY_CGIS = [
    'http://www.yy.com/index/t?tabId=101001&subTabId=&offset=0&limit=25&async=true'
];

var geCgi = function (urlStart, startName, startIndex, offsetName, offset, urlEnd, concatOprater, evalOprater) {
    return urlStart + startName + evalOprater + startIndex + concatOprater + offsetName + evalOprater + offset + urlEnd;
};

var geKKCgi = function (partId, start, offset) {
    return 'http://www.kktv1.com/CDN/output/M/1/I/10002032/P/partId-'+ partId +'_start-' + start + '_offset-' + offset + '_platform-1_a-1_c-100/json.js';
};

var geYYCgi = function (offset, limit) {
    return 'http://www.yy.com/index/t?tabId=101001&subTabId=&offset=' + offset + '&limit=' + limit + '&async=true';
};

var geWoxiuCgi = function (page) {
    return 'http://www.woxiu.com/index.php?action=IndexList&do=gtypeZbList&gtype=5&type=api&sort=1&stype=1&page=' + page + '&&callback=jnsJsonpData';
};

var geLaifengCgi = function (page) {
    return 'http://www.laifeng.com/anchor/search?pageNo=' + page;
};

var geFanxingCgi = function (offset) {
	return (offset === 1 ? 'http://visitor.fanxing.kugou.com/VServices/IndexService.IndexService.getLiveRoomListByType/'+ offset + '-0-0-0-0/'
		: 'http://visitor.fanxing.kugou.com/VServices/IndexService.IndexService.getLiveRoomListByType/'+ offset + '-0-0-1-0/');
}

var xiu8Cgi = ['http://www.xiu8.com/lobby'];
var v6Cgi = ['http://v.6.cn/liveAjax.html'];

var boboData = [];
var kkData = [];
var yyData = [];
var boboTotalOnline = 0;
var kkTotalOnline = 0;
var yyTotalOnline = 0;
var html = '';
var boboDone = false;
var kkDone = true;
var yyDone = false;
var xiu8Done = true;
var v6Done = false;
var woxiuDone = false;
var laifengDone = false;
var fanxingDone = false;
var myUtilInstance = new myUtil();
var tpl = fs.readFileSync('./src/tpl/table-daily.ejs', 'utf8');
var timerData = {};

var _prefixBoboContent = function (obj) {
    return  obj.anchors.map(function (item) {
        return {
            liveType: item.liveType || 1,
            id: item.userId || 0,
            idList: item.unit.onlineCount || 0
        };
    });
};

var _prefixKKContent = function (obj) {
    obj.roomList.map(function (item) {
        return {
            liveType: item.unit.live || 1,
            id: item.unit.userId || 0,
            idList: item.unit.idList || 0
        };
    });
};

var _prefixYYContent = function (obj) {
    return obj.data.lives.map(function (item) {
        return {
            liveType: item.liveType || 1,
            id: item.liveUid || 0,
            idList: item.users || 0
        };
    });
};

var callback = function (lives, status, siteResult, options) {
    var getDataCounts = options.getDataCounts || 0;
    var anchorList = options.anchorList || [];
    var anchorIdList = options.anchorIdList || [];
    var cgiLen = options.cgiLen || 0;
    lives.foreach(function (item ,i) {
        if (item.liveType === 1 && anchorList.indexOf(item.id) === -1) {
            var currentAnchorUnit = item.unit;
            var anchorInfo = {};
            anchorInfo.id = currentAnchorUnit.userId;
            anchorInfo.idList = currentAnchorUnit.idList;
            anchorList.push(anchorInfo);
            anchorIdList.push(anchorInfo.id);
        }
    });
    if (getDataCounts === cgiLen) {
        siteResult = anchorList;
        console.log(siteResult, siteResult.length);
    }
};

var spider = function (cgiList, siteResult, prefixContent) {
    var anchorList = [];
    var anchorIdList = [];
    var getDataCounts = 0;
    var cgiLen = cgiList.length;
    var siteData = {
        'anchorList': anchorList,
        'anchorIdList': anchorIdList,
        'getDataCounts': getDataCounts,
        'cgiLen': cgiLen
    };
    cgiList.forEach(function (item, i) {
        myUtilInstance.get(item, function (content, status) {
            var lives = prefixContent(JSON.parse(content));
            callback(lives, status, siteResult, siteData);
        });
    });
};

var boboSpider = function (cgiList) {
    var anchorIdList = [];
    var getDataCounts = 0;
    var cgiLen = cgiList.length;
    var cgiCallback = function (content, status) {
        getDataCounts++;
        var hotLive = [];
        hotLive = content.anchors;
        hotLive.forEach(function (item, i) {
            if (item.unit.live === 1 && anchorIdList.indexOf(item.unit.userId) === -1) {
                var currentAnchorUnit = item.unit;
                var anchorInfo = {};
                anchorInfo.id = currentAnchorUnit.userId;
				anchorIdList.push(anchorInfo.id);
			}
		});
		if (getDataCounts === cgiLen) {
			console.log('boboOnlineAnchor', anchorIdList.length);
			boboDone = true;
			var boboTimerData = {};
			boboTimerData.idList = anchorIdList;
			//boboTimerData.name = 'bobo';
			//return boboTimerData;
			timerData["bobo"] = boboTimerData;
			rewriteData(timerData);
        }
    };
    cgiList.forEach(function (cgiItem, i) {
        myUtilInstance.get(cgiItem, function (content, status) {
            content = JSON.parse(content);
            cgiCallback(content, status);
        });
    });
};


var kkSpider = function (cgiList) {
    var anchorIdList = [];
    var getDataCounts = 0;
    var cgiLen = cgiList.length;
    var defaultOffset = 50;
    var cgiCallback = function (content, status, item, start, offset) {
        var lives = [];
        lives = content.roomList;
        if (lives.length) {
            lives.forEach(function (item, i) {
                if (item.liveType === 1 && anchorIdList.indexOf(item.userId) === -1) {
                    var anchorInfo = {};
                    anchorInfo.id = item.userId;
                    anchorIdList.push(anchorInfo.id);
                }
            });

            if (start + offset < content.roomTotal) {
                // next page request
                start += offset;

                if (start > 999) {
                    // warning: response is empty if start is greater then 999.
                    start = 999;
                    offset = content.roomTotal;
                }

                requestCGI(item, start, offset);
            } else {
                getDataCounts++;
            }
        } else {
            getDataCounts++;
        }

        if (getDataCounts === cgiLen) {
            console.log('kkOnlineAnchor', anchorIdList.length);
			kkDone = true;
			var kkTimerData = {};
			kkTimerData.idList= anchorIdList;
			//kkTimerData.name = 'kk';
			//return kkTimerData;
			timerData["kk"] = kkTimerData;
			rewriteData(timerData);
        }

    };

    var requestCGI = function (item, start, offset) {
        myUtilInstance.get(geKKCgi(item, start, offset), function (content, status, response) {
			console.log(response.headers);
            content = JSON.parse(content);
            cgiCallback(content, status, item, start, offset);
        });
    };
    cgiList.forEach(function (item, i) {
        var start = 0;

        requestCGI(item, start, defaultOffset);
    });
};

var yySpider = function () {
    var offset = 0;
    var limit = 100;
    var anchorIdList = [];
    var isGet = true;
    var firstDone = 0;
    var cgiCallback = function (content, status) {
        var lives = [];
        lives = content.data.lives;
        lives.forEach(function (item, i) {
            if (anchorIdList.indexOf(item.liveUid) === -1) {
                var anchorInfo = {};
                anchorInfo.id = item.liveUid;
                anchorIdList.push(anchorInfo.id);
            }
        });
    };

    setTimeout(function () {
            myUtilInstance.get(geYYCgi(offset, limit), function (content, status) {
                content = JSON.parse(content);
                if (!content.data.lives.length) {
                    isGet = false;
					yyDone = true;
					firstDone++;
					if (firstDone === 1) {
						console.log('yyOnlineAnchor', anchorIdList.length);
						var yyTimerData = {};
						yyTimerData.idList= anchorIdList;
						//yyTimerData.name = 'yy';
						//return yyTimerData;
						timerData["yy"] = yyTimerData;
						rewriteData(timerData);
					}
                }
                cgiCallback(content, status);
            });
            offset += limit;
            if (isGet) {
                setTimeout(arguments.callee, 1000);
            }
    }, 1000);
};

var xiu8Spider = function (cgiList) {
	var anchorIdList = [];
    var getDataCounts = 0;
    var cgiLen = cgiList.length;
	var cgiCallback = function (content, status) {
		getDataCounts++;
		var lives = [];
		lives = content.onlineAll;
		lives.forEach(function (item, i) {
			if (anchorIdList.indexOf(item.userId) === -1) {
				anchorIdList.push(item.userId);
			}
		});
        if (getDataCounts === cgiLen) {
            console.log('xiu8OnlineAnchor', anchorIdList.length);
			xiu8Done = true;
			var xiu8TimerData = {};
			xiu8TimerData.idList= anchorIdList;
			//xiu8TimerData.name = 'xiu8';
			//return xiu8TimerData;
			timerData["xiu8"] = xiu8TimerData;
			rewriteData(timerData);
        }
	};
	cgiList.forEach(function (item, i) {
			myUtilInstance.get(item, function (content, status) {
				var $ = cheerio.load(content);
				var scriptContent = $('script');
				for (var key in scriptContent) {
					if (!isNaN(Number(key)) && !!scriptContent[key].children.length) {
						var jsonContent = scriptContent[key].children[0];
						for (var name in jsonContent) {
							if (name === 'data' && jsonContent[name].indexOf('_data =') !== -1) {
								var startIndex = jsonContent[name].indexOf('_data =') + 7;
								var lastIndex = jsonContent[name].indexOf(';'); 
								var data = JSON.parse(jsonContent[name].slice(startIndex, lastIndex));
								cgiCallback(data, status);
							}
						}		
					}
				}
			});
    });
};

var v6Spider = function (cgiList) {
	var anchorIdList = [];
    var getDataCounts = 0;
    var cgiLen = cgiList.length;
	var cgiCallback = function (content, status) {
		getDataCounts++;
		var lives = [];
		lives = content.roomList;
		lives.forEach(function (item, i) {
			if (anchorIdList.indexOf(item.uid) === -1) {
				anchorIdList.push(item.uid);
			}
		});
        if (getDataCounts === cgiLen) {
            console.log('v6OnlineAnchor', anchorIdList.length);
			v6Done = true;
			var v6TimerData = {};
			v6TimerData.idList= anchorIdList;
			timerData["v6"] = v6TimerData;
			rewriteData(timerData);
        }
	};
	cgiList.forEach(function (item, i) {
		myUtilInstance.get(item, function (content, status) {
			content = JSON.parse(content);
			cgiCallback(content, status);
		});
	});
};

var woxiuSpider = function () {
	var anchorIdList = [];
	var page = 1;
	var isGet = true;
	var firstDone= 0;
	var jsonReg = /^(jnsJsonpData\()(.*)(\)\;)$/;
	var cgiCallback = function (content, status) {
        var lives = [];
        lives = content;
        lives.forEach(function (item, i) {
            if (anchorIdList.indexOf(item.nickname) === -1) {
                anchorIdList.push(item.nickname);
            }
        });
	};
	setTimeout(function () {
		myUtilInstance.get(geWoxiuCgi(page), function (content, status) {
			content = content.toString().replace(jsonReg, '$2');
			iconv.skipDecodeWarning = true;
			content = iconv.decode(content, 'GBK');
			content = JSON.parse(content);
			if (!content.length) {
				isGet = false;
				woxiuDone = true;
				firstDone++;
				if (firstDone === 1) {
					console.log('woxiuOnlineAnchor', anchorIdList.length);
					var woxiuTimerData = {};
					woxiuTimerData.idList= anchorIdList;
					//woxiuTimerData.name = 'woxiu';
					//return woxiuTimerData;
					timerData["woxiu"] = woxiuTimerData;
					rewriteData(timerData);
				}
			}
			cgiCallback(content, status);
		});
		page++;
		if (isGet) {
			setTimeout(arguments.callee, 1000);
		}
	}, 1000);

};

var laifengSpider = function () {
	var anchorIdList = [];
	var page = 0;
	var firstDone = 0;
	var cgiCallback = function (content, status) {
		for (var key in content) {
			if (!isNaN(Number(key))) {
				var item = content[key];
				var anchorId = item.attribs['data-cardid'];
				if (anchorIdList.indexOf(anchorId) === -1) {
					anchorIdList.push(anchorId);
				}
			}
		}
	};
	var getData = function () {
		myUtilInstance.get(geLaifengCgi(page++), function (content, status) {
			var $ = cheerio.load(content);
			var imgList = {};
			if ($('.tag-live').length) {
				imgList = $('.tag-live').prev('img');
				cgiCallback(imgList, status);
			} else {
				firstDone++;
				laifengDone = true;
				if (firstDone === 1) {
					console.log('laifengOnlineAnchor', anchorIdList.length);
					var laifengTimerData = {};
					laifengTimerData.idList= anchorIdList;
					timerData["laifeng"] = laifengTimerData;
					rewriteData(timerData);
				}
				return ;
			}
			getData();
		});
	};
	getData();
};

var fanxingSpider = function () {
	var anchorIdList = [];
	var offset = 1;
	var firstDone = 0;
	var isGet = true;
	var jsonReg = /^(jsonpcallback_httpvisitorfanxingkugoucomVServicesIndexServiceIndexServicegetLiveRoomListByType\d+\()(.*)(\))$/;	
	var cgiCallback = function (content, status) {
		var lives = [];
		lives = content;
		lives.forEach(function (item, i) {
			if (item.status == 1 && anchorIdList.indexOf(item.userId) === -1) {
				anchorIdList.push(item.userId);
			}
		});
	};
	setTimeout(function () {
		myUtilInstance.get(geFanxingCgi(offset), function (content, status, response) {
			if (response && response.headers && response.headers['content-encoding'] && response.headers['content-encoding'].indexOf('gzip') !== -1){
				zlib.unzip(content, function (err, content) {
					if (err) {
						console.log('err:', err);
					}
					content = content.toString().replace(jsonReg, '$2');
					content = JSON.parse(content);
				    if (content.data && content.data.list && content.data.list.length && content.data.list.length>0) {
						cgiCallback(content.data.list, status);
					} else {
						isGet = false;
						firstDone++;
						fanxingDone = true;
						if (firstDone === 1) {
							console.log('fanxingOnlineAnchor:', anchorIdList.length);
							var fanxingTimerData = {};
							fanxingTimerData.idList = anchorIdList;
							timerData['fanxing'] = fanxingTimerData;
							rewriteData(timerData);
						}
					}
				});
			} else {
				content = content.toString().replace(jsonReg, '$2');
				content = JSON.parse(content);
				if (content.data && content.data.list && content.data.list.length && content.data.list.length>0) {
					cgiCallback(content.data.list, status);
				} else {
					isGet = false;
					firstDone++;
					fanxingDone = true;
					if (firstDone === 1) {
						console.log('fanxingOnlineAnchor:', anchorIdList.length);
						var fanxingTimerData = {};
						fanxingTimerData.idList = anchorIdList;
						timerData['fanxing'] = fanxingTimerData;
						rewriteData(timerData);
					}
				}
			}
		});
		offset++;
		if (isGet || offset === 2) {
			if (offset === 2) {
				firstDone = 0;
				isGet = true;
				fanxingDone = false;
			}
			setTimeout(arguments.callee, 500);		
		}
	}, 500);
}

Date.prototype.format = function(format){
	var o = {
		"M+" : this.getMonth()+1, //month
		"d+" : this.getDate(), //day
		"h+" : this.getHours(), //hour
		"m+" : this.getMinutes(), //minute
		"s+" : this.getSeconds(), //second
		"q+" : Math.floor((this.getMonth()+3)/3), //quarter
		"S" : this.getMilliseconds() //millisecond
	}

	if(/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
	}

	for(var k in o) {
		if(new RegExp("("+ k +")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
		}
	}

	return format;
}
var clearDataFile = function (fileName) {
	var _dirname = './src/data/';
	var dataFile = fs.readFileSync(_dirname + fileName); 
	dataFile = JSON.parse(dataFile);
	dataFile.timerData = [];
	for (var key in dataFile.totalData) {
		localData.totalData[key].idList= [];
	}
}

function creatDefaultDailyData(offsetDay) {
	var data = {};
	data.timerData = [];
	data.totalData = {};
	var nameList = ['bobo', 'kk', 'yy','xiu8', 'v6', 'woxiu', 'laifeng', 'fanxing'];
	nameList.forEach(function (item, i) {
		data.totalData[item] = {};
		data.totalData[item].idList = [];
	})
	data.totalData['date'] = getDateStr(-offsetDay);
	return data;
}

var sendMail = function () {
	console.log('enter sendMail');
	var now = new Date();
	var currHour = now.getHours();
	var currMinute = now.getMinutes();
	if (currHour === 9 && currMinute < 30) {
	//if (1) {
		console.log('enter sendMail check');
		var _dirname = './src/data/';	
		var weeklyData = {};
		weeklyData['dailyData'] = [];
		for (var i = 1;i <= 7;i++) {
			var filename = 'data' + getDateStr(-i) + '.json';
			try {
				fs.stat(_dirname + filename, function(i, filename){
						return function(err, stats) {
							var dailyData;
							if(err) {
					    		dailyData = dailyData ? JSON.parse(dailyData) : creatDefaultDailyData(i);
								delete dailyData.totalData['kk'];
								weeklyData['dailyData'][i-1] = dailyData.totalData;
							} else {
								dailyData = fs.readFileSync(_dirname + filename, 'utf8');
					    		dailyData = dailyData ? JSON.parse(dailyData) : creatDefaultDailyData(i);
								delete dailyData.totalData['kk'];
								weeklyData['dailyData'][i-1] = dailyData.totalData;
							}
							console.log(filename);
							if(i === 7) {
								var ret = ejs.render(tpl, weeklyData); 
								//msg.mail('linkzhu;', '呱呱竞品监控【' + getDateStr() + '】', ret, 'linkzhu;');
								msg.mail('g_DBASIC_APP_PRD_Int_vid', '花样竞品监控【' + getDateStr() + '】', ret, 'evanjyu;linkzhu;herbertliu;mikawu;v_xianguo;v_wenbofeng;g_DBASIC_APP_Plat_Video_Web1;');
								
							}
						}
					}(i, filename)) 
				//var stats = fs.statSync(_dirname + filename);
				//console.log(stats);
			} catch (e) {
				console.log('error data', filename);
				//console.log(dailyData);
				msg.mail('linkzhu;evanjyu', '呱呱竞品监控【' + getDateStr() + '】出错啦！', 'error: ' + e, 'linkzhu;evanjyu');
				throw e;
			}
		}
	//msg.mail('evanjyu', '呱呱竞品监控【' + getDateStr() + '】', ret, 'evanjyu');
		//msg.mail('aaronhhu;garryli;rowenchen;robinjiang;henryguo;teresajiang;silentye;jianiili;dannypeng;', '呱呱竞品监控【' + getDateStr() + '】', ret, 'evanjyu;donaldyang;ouvenzhang;linkzhu;henryguo;');
//		msg.mail('henryguo;', '呱呱竞品监控【' + getDateStr() + '】', ret, 'henryguo;');
		//var filename = 'data' + getDateStr(-1) + '.json';
		//var filename = 'data' + getDateStr() + '.json';
		//fs.readFile(_dirname + filename, function (err, data) {
		//	if (err) {
		//		console.log('err: ', err);
		//		throw err;
		//	} else {
		//		var dataObj = JSON.parse(data);
		//		var ret = ejs.render(tpl, dataObj); 
		//		//tof.mail('aaronhhu;rowenchen;', '呱呱竞品监控【' + getDateStr(-1) + '】', ret, {from: 'linkzhu', cc: 'donaldyang;ouvenzhang;linkzhu;'}, function (res) {
		//		//	console.log('sendMail succ: ', res);
		//		//	console.log('mail end: ', new Date);
		//		//});
		//		msg.mail('aaronhhu;rowenchen;robinjiang;teresajiang;', '呱呱竞品监控【' + getDateStr(-1) + '】', ret, 'donaldyang;ouvenzhang;linkzhu;');
		//		//msg.mail('linkzhu;', '呱呱竞品监控【' + getDateStr(-1) + '】', ret, 'linkzhu;');
		//	}
		//});
	}
	console.log('end: ', new Date);
}
var createDataFile = function (dirname, fileName) {
	var data = {};
	data.timerData = [];
	data.totalData = {};
	var nameList = ['bobo', 'kk', 'yy','xiu8', 'v6', 'woxiu', 'laifeng', 'fanxing'];
	nameList.forEach(function (item, i) {
		data.totalData[item] = {};
		data.totalData[item].idList = [];
	})
	dataStr = JSON.stringify(data);
	fs.writeFileSync(dirname + fileName, dataStr, 'utf8');
	return data;
}

var geTodayDataFilename = function () {
	var dateStr = new Date().format('yyyy_MM_dd');
	return 'data' + dateStr + '.json';
}

var readDataFile = function (dirname, filename) {
	if (fs.existsSync(dirname+filename)) {
		var localData = fs.readFileSync(dirname+filename);
		localData = JSON.parse(localData);
		return localData;
	} else {
		return false;
	}
}

var isLeapYear = function (year) {
	return (0 === year%4 && (0 !== year%100 || 0 === year%400));
}

var getDateStr = function (offset) {
	var resultDate = new Date();
	resultDate.setDate(resultDate.getDate() + (offset || 0));
	resultDateStr = resultDate.format('yyyy_MM_dd');
	return resultDateStr;
}

var rewriteData = function (timerData) {
	if (boboDone && kkDone && yyDone && xiu8Done && v6Done && woxiuDone && laifengDone && fanxingDone) {
		var _dirname = './src/data/';
		var filename = geTodayDataFilename();
		var localData = readDataFile(_dirname, filename) || createDataFile(_dirname, filename);
		var now = new Date();
		timerData["date"] = now.format("yyyy-MM-dd hh:mm:ss");
		localData.timerData.push(timerData);
		for (var key in localData.totalData) {
			if (timerData[key] && timerData[key].idList) {
				timerData[key].idList.forEach(function (item, i) {
					if (localData.totalData[key].idList.indexOf(item) === -1) {
						localData.totalData[key].idList.push(item);
					}
				})
			}
		}
		localData.totalData['date'] = now.format('yyyy-MM-dd');
		localData = JSON.stringify(localData);
		fs.writeFile(_dirname + filename, localData, 'utf8', function (err) {
			if (err) {
				console.log("err:", err);
				throw err;
			}
			console.log('rewrite succ');
			sendMail();	
		})
	}
}

function init() {
	console.log('begin: ', new Date)
	boboSpider(BOBO_CGIS);
	yySpider();
	//kkSpider(KK_PARTID);
	//xiu8Spider(xiu8Cgi);
	v6Spider(v6Cgi);
	woxiuSpider();
	laifengSpider();
	fanxingSpider();
}

init();
