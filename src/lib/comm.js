
'use strict';

let _log = console.log;

console.log = (msg) => {
  (function() {
    _log(__filename);
    _log(msg);
  })();
}
