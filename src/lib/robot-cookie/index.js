
'use strict';


modules.exports = {
  get: _get,
  set: _set,
  del: _del
}

function _get(req, name) {
  const cookieStr = req.headers.cookie;
  let v = null, r, result;
  r = new RegExp('(?:^|\\\s)' + name + '=([^;]*)(?:;|$)');
  result = r.exec(cookieStr);
  if (result) {
    v = result[1];
  }
  return v;
}



