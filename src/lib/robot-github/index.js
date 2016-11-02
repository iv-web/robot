'use strict';
const exec = require('child_process').exec;
const ejs = require("ejs");
const url = require("url");
const querystring = require('querystring');
const path = require("path")
const Promise = require("promise")
const fs = require("fs")
const tpl = path.resolve(__dirname, "tpl/index.ejs");
const http = require('http')

const CONFFILE = __dirname + "/conf.json.db";


exports = module.exports = class RobotGithub {

  constructor(gitUrl, name) {
    console.log('init RobotGithub ...')

    this.gitUrl = gitUrl;
    this.name = '__git__path__' + name + '__ignore';
    
    this.mdStr = '';


  }


  sendFile (jsonfile) {

    this.gitPull.then((ou) => {

      this.addFile();
      this.push();
    }).catch(e => {
      throw e;
    })

  }

  push() {
    const commit = `${this.name}/commit.sh`;
    console.log(commit)
    exec(commit, () => {
      exec('dir', (e, stdout, stderr) => {
        console.log(e)
        console.log(stdout)
        console.log(stderr)
      });
    })
  }

  handleJsonFile(jsonFile, callback) {
    ejs.renderFile(tpl, jsonFile, {}, (err, str) => {
      if (err) {
        console.log(err);
        
      }

      this.mdStr = str;
      callback(str);
    })
  }


}

