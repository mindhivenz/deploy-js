import del from 'del'
import gulp from 'gulp'
import ts from 'gulp-typescript'
import path from 'path'
import ensureGitUpToDate from '../src/ensureGitUpToDate'
import gitPush from '../src/gitPush'
import openAwsConsoleTask from '../src/openAwsConsoleTask'
import yarnPublishDist from '../src/yarnPublishDist'

const projectDir = path.dirname(__dirname)
process.chdir(projectDir)
const srcDir = `src`
const distDir = `dist`

const tsProj = ts.createProject('src/tsconfig.json')

const clean = () => del(distDir)

export const build = () =>
  tsProj
    .src()
    .pipe(tsProj())
    .pipe(gulp.dest(distDir))

const copy = () =>
  gulp
    .src(`${srcDir}/cfn/**/*`, { base: srcDir, buffer: false })
    .pipe(gulp.dest(distDir))

export const dist = gulp.series(clean, gulp.parallel(build, copy))

const gitUpToDate = () => ensureGitUpToDate('.')

const publish = () =>
  yarnPublishDist({ srcPackageDir: projectDir, distPackageDir: distDir })

const push = () => gitPush(projectDir)

export const release = gulp.series(gitUpToDate, dist, publish, push)

export const testOpen = openAwsConsoleTask({
  proj: 'devops',
  region: 'us-east-1',
  stage: 'production',
})
