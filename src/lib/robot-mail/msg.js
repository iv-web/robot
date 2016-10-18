
module.exports = (function () {
  'use strict';

  var spawn = require('child_process').spawn
  	, bash = __dirname + '/uniform_msg_client';


  /**
   * mail
   * @param {Stirng} to
   * @param {String} title
   * @param {String} content
   */
  function mail(to, title, content, cc) {
	var args = ['mail', '-T', to, '-S', title, '-c', content, '-d', 'utf8'];
	if (cc) {
		args.push('-C');
		args.push(cc);
	}
    var worker = spawn(bash, args);
    worker.stdout.on('data', function (data) {
      console.log('[Mail info]' + data);
    });
    worker.stderr.on('data', function (data) {
      console.log('[Mail error]' + data);
    });
    worker.on('close', function (code) {
      // worker close
    });
  }

  /**
   * sms
   * @param {String} to
   * @param {String} content
   */
  function sms(to, content) {
    var worker = spawn(bash, ['sms', '-T', to, '-c', content, '-d', 'utf8']);
    worker.stdout.on('data', function (data) {
      console.log('[SMS info]' + data);
    });
    worker.stderr.on('data', function (data) {
      console.log('[SMS error]' + data);
    });
    worker.on('close', function (code) {
      // worker close
    });
  }

  return {
    mail: mail,
    sms: sms
  };

})();
