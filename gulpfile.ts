import del from 'del'
import gulp from 'gulp'
import ensureGitUpToDate from './src/ensureGitUpToDate'
import execFile from './src/execFile'
import gitPush from './src/gitPush'
import yarnPublishDist from './src/yarnPublishDist'

const distDir = 'dist'

const clean = () => del(distDir)

const build = () =>
  execFile('tsc', ['--outDir', distDir, '--project', 'src'], {
    pipeOutput: true,
  })

const copy = () =>
  gulp
    .src('src/cfn/**/*', { base: 'src', buffer: false })
    .pipe(gulp.dest(distDir))

export const dist = gulp.series(clean, gulp.parallel(build, copy))

const gitUpToDate = () => ensureGitUpToDate('.')

const publish = () =>
  yarnPublishDist({ srcPackageDir: '.', distPackageDir: distDir })

const push = () => gitPush('.')

export const release = gulp.series(gitUpToDate, dist, publish, push)
