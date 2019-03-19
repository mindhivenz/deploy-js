import del from 'del'
import gulp from 'gulp'
import execFile from './src/execFile'
import yarnPublish from './src/yarnPublish'

const distDir = 'dist'

const clean = () => del(distDir)

const build = () =>
  execFile('tsc', ['--outDir', distDir, '--project', 'src'], {
    pipeOutput: true,
  })

const copyResources = () =>
  gulp
    .src('src/cfn/**/*', { base: 'src', buffer: false })
    .pipe(gulp.dest(distDir))

const copyPackageJson = () =>
  gulp.src('package.json', { buffer: false }).pipe(gulp.dest(distDir))

const copy = gulp.parallel(copyResources, copyPackageJson)

export { clean, build, copy }

export const dist = gulp.series(clean, gulp.parallel(build, copy))

export const release = gulp.series(dist, yarnPublish)
