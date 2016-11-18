


'use strict';

exports.isLogin = isLoagin;


function isLoagin(req) {

  console.log(req.headers);
  return;

  const his = reg.getCookie('robot_history');

  const his_arr = his.split('|')

  if (his_arr.length < 2) {
    return false;
  }

  const username = passmd5.split('|')[1];
  const passmd5 = passmd5.split('|')[0];

  const soat = getSoat(username);

  const passmd5_2 = getMd5(username + soat + 'robot');

  if (passmd5_2 === passmd5) {
    return true;
  }

  return false;


}
