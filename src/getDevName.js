import * as gitExec from './gitExec'


export default () =>
  gitExec.sync('config user.name')
