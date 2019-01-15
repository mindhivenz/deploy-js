import { spawn } from 'child_process'
import del from 'del'
import gulp from 'gulp'

import bump from './src/bumpVersion'

const distDir = 'dist'

const bumpVersion = () => bump()

const clean = () => del(distDir)

const build = () =>
  spawn('yarn', ['tsc', '--outDir', distDir, '--project', 'src'], {
    stdio: 'inherit',
  })

const copy = () =>
  gulp
    .src(['cfn/**/*', 'package.json'], { base: '.', buffer: false })
    .pipe(gulp.dest(distDir))

const publish = () =>
  spawn('yarn', ['publish', '--non-interactive'], {
    cwd: distDir,
    stdio: 'inherit',
  })

export { clean, build, copy }

export const release = gulp.series(bumpVersion, clean, build, copy, publish)

export default gulp.series(clean, build, copy)
