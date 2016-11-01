
var RobotGithub = require('../index.js');


const rg = new RobotGithub('https://github.com/gogoday/robot.git', 'myrobot');




rg.gitPull.then(stat => console.log(stat)).
  catch(e => console.log(e))


