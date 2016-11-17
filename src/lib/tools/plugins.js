

'use strict';

const co = require('co');
const Promise = require('bluebird');
const Conf = require('../robot-conf');
const local = require('../robot-local');
const Mail = require('../robot-mail');
const MdTools = require('./createMdFile.js');

exports.clientHandle = (originFile, github_filename, testPath, optTitle) => {

  //this.origin = originFile;
  console.log('start plugin handle ....')

  const mailTo = Conf.get('group_client_mail_to');

  co(function *() {

    let arr = yield sort(originFile);

    arr.forEach(item => {
      console.log(`title: ${item.title}, weight: ${item.weight}`);
    })
    const mailstr = yield mail(arr, github_filename, optTitle, mailTo);

    yield createMdFile(arr, github_filename, testPath);

  }).catch((err) => {
    console.log(err)
  })

}

function sort(origin) {
  return new Promise((resolve, reject) => {
    let arr = local.getObj(origin);

    arr.map(item => {
      item.weight = 0;
      return item;
    })

    const keySet = Conf.get('group_client_key');
    arr.forEach(item => {
      keySet.forEach(item2 => {
        let _reg, match, weight = 0, times = 0;
        let key = item2.split(':')[0];
        let key_weight = item2.split(':')[1];

        _reg = new RegExp(key, 'ig');
        match = item.title.match(_reg);
        if (match) {
          times = match.length;
        }
        weight = times * key_weight;

        item.weight = item.weight + weight;
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

    resolve(arr);
  })

}

function mail(p, github_filename, optTitle, mailTo) {
  return Mail.mail(p, github_filename, optTitle, mailTo);
}

function createMdFile(arr, github_filename, testPath) {
  return new Promise((resolve, reject) => {
    MdTools.create(arr, testPath, github_filename);
  })
}

