

'use strict';

const co = require('co');

exports.client = {
  handle: (originFile) => {

    this.origin = originFile;
    const self = this;

    co(function *() {

      yield self.sort();

      yield self.mail();

      yield self.createMdFile();

    }).catch((err) => {
      throw err;
    })

  },
  sort: () => {
    let arr = local.getObj(this.origin);
    const keySet = Conf.get('group_client_key');
    arr.forEach(item => {
      keySet.forEach(item2 => {
        if (item.title.indexOf(item2) >= 0) {
          if(typeof item.weight === 'undefined') item.weight = 0;
          item.weidht += 1;
        }
      })
    })

    arr = arr.sort((a, b) => {
      let wa = a.weight, wb = b.weight;

      if (wa > wb) {
        return -1;
      } else if (wa < wb) {
        return 1;
      } else {
        return 0;
      }
    })

  },
  mail: () => {

    Mail.mail(arr);
  }
}
