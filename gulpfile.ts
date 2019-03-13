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

const copyResources = () =>
  gulp
    .src('src/cfn/**/*', { base: 'src', buffer: false })
    .pipe(gulp.dest(distDir))

const copyPackageJson = () =>
  gulp.src('package.json', { buffer: false }).pipe(gulp.dest(distDir))

const copy = gulp.parallel(copyResources, copyPackageJson)

const publish = () =>
  spawn('yarn', ['publish', '--non-interactive'], {
    cwd: distDir,
    stdio: 'inherit',
  })

export { clean, build, copy }

export const dist = gulp.series(clean, gulp.parallel(build, copy))

export const release = gulp.series(bumpVersion, dist, publish)
