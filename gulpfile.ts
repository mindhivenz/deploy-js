import del from 'del'
import gulp from 'gulp'
import ensureGitUpToDate from './src/ensureGitUpToDate'
import execFile from './src/execFile'
import yarnPublish from './src/yarnPublishDist'

const distDir = 'dist'

export const clean = () => del(distDir)

export const build = () =>
  execFile('tsc', ['--outDir', distDir, '--project', 'src'], {
    pipeOutput: true,
  })

export const copy = () =>
  gulp
    .src('src/cfn/**/*', { base: 'src', buffer: false })
    .pipe(gulp.dest(distDir))

export const dist = gulp.series(clean, gulp.parallel(build, copy))

const gitUpToDate = () => ensureGitUpToDate('.')

const publish = () =>
  yarnPublish({ srcPackageDir: '.', distPackageDir: distDir })

export const release = gulp.series(gitUpToDate, dist, publish)
