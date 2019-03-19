import del from 'del'
import gulp from 'gulp'
import execFile from './src/execFile'
import yarnPublish from './src/yarnPublish'

const distDir = 'dist'

export const clean = () => del(distDir)

export const build = () =>
  execFile('tsc', ['--outDir', distDir, '--project', 'src'], {
    pipeOutput: true,
  })

const copyResources = () =>
  gulp
    .src('src/cfn/**/*', { base: 'src', buffer: false })
    .pipe(gulp.dest(distDir))

const copyPackageJson = () =>
  gulp.src('package.json', { buffer: false }).pipe(gulp.dest(distDir))

export const copy = gulp.parallel(copyResources, copyPackageJson)

export const dist = gulp.series(clean, gulp.parallel(build, copy))

const publish = () => yarnPublish({ cwd: distDir })

export const release = gulp.series(dist, publish)
