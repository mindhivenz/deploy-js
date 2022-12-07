import del from 'del'
import { src, dest, series, parallel } from 'gulp'
import ts from 'gulp-typescript'
import path from 'path'
import ensureGitUpToDate from '../src/ensureGitUpToDate'
import execFile from '../src/execFile'
import gitPush from '../src/gitPush'
import openAwsConsoleTask from '../src/internal/openAwsConsoleTask'
import yarnPublishDist from '../src/yarnPublishDist'

const projectDir = path.dirname(__dirname)
process.chdir(projectDir)
const srcDir = `src`
const distDir = `dist`

const tsProj = ts.createProject('src/tsconfig.json')

const clean = () => del(distDir)

export const build = () => tsProj.src().pipe(tsProj()).pipe(dest(distDir))

const copyCfn = () =>
  src(`${srcDir}/cfn/**/*`, { base: srcDir, buffer: false }).pipe(dest(distDir))

const copyScript = () => src(`script/*`, { buffer: false }).pipe(dest(distDir))

export const dist = series(clean, parallel(build, copyCfn, copyScript))

const gitUpToDate = () => ensureGitUpToDate()

const publish = () =>
  yarnPublishDist({ srcPackageDir: projectDir, distPackageDir: distDir })

const push = () => gitPush(projectDir)

export const release = series(gitUpToDate, dist, publish, push)

export const testOpen = openAwsConsoleTask({
  proj: 'devops',
  region: 'us-east-1',
  stage: 'production',
})

export const testExec = async () => {
  await execFile('echo', ['hello', 'world'], {})
}
