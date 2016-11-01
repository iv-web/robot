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

  gitPull () {
    return new Promise((resolve, reject) => {
      this.pull((err, stdout) => {
        if (err) {
          throw err;
          reject(err);
        }

        resolve(stdout);
      })
    });
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
    try {
    let cd = `cd ${this.name}`;
    console.log(cd)
    exec(cd, (e) => {
      if (e) {console.log(e); return ; }
      let add = `git add .`;
      console.log(add)
      exec(add , (e, d) => {
        if (e) {console.log(e); return ; }
        let commit = `git commit -m "add weekly file..."`;
        console.log(commit)
        exec(commit , (e) => {
          if (e) {console.log(e); return ; }
          let push = `git push`;
          console.log(push)
          exec(push, (e) => {
            if (e) {console.log(e); return ; }
            console.log('push success...');
          })
        })
      })
    })
    } catch(e) {
      throw e
    }
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

  pull(callback) {

    const self = this;

    this.localGitPath = path.resolve(__dirname, './' + this.name);

    fs.stat(this.localGitPath, (err, stat) => {
      if (err) {
        //throw err;
        _ececClone();
      }
      
      if (stat && stat.isDirectory()) {
        let cmd1 = `cd ${this.name}`;
        console.log(cmd1)
       exec(cmd1, (err, stdout, stderr) => {
         if (err) {
           callback(err)
           return false;
         }
         let cmd2 = 'git pull';
         console.log(cmd2)
         exec(cmd2, (err, stdout, stderr) => {
           if (err) {
             callback(err)
             return false;
           }
           
           callback(null, stdout);
           
         })
       })
      }
    })

    function _ececClone() {
      const cmd = `git clone ${self.gitUrl} ${self.localGitPath}`;
      console.log(cmd)
      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          callback(err);
          return false;
        }

        // Cloning into 'E:\workspace\git_project\robot\src\lib\robot-github\myrobot'...
        console.log(stdout)
        console.log(stderr)
        callback(null, stdout);
      });
    }


  }

}

