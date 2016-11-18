


'use strict';
const cookie = require('../robot-cookie');

exports.isLogin = isLoagin;


function isLoagin(req) {


  const his = cookie(req, 'robot_history');

  const his_arr = his.split('|')

  if (his_arr.length < 2) {
    return false;
  }

  const username = his_arr.split('|')[1];
  const his_arr = his_arr.split('|')[0];

  const soat = getSoat(username);

  const passmd5_2 = getMd5(username + soat + 'robot');

  if (passmd5_2 === passmd5) {
    return true;
  }

  return false;


}
