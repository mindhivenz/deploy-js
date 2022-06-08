import gulp from 'gulp'
import path from 'path'
import streamToPromise from 'stream-to-promise'
import execFile from './execFile'
import { yarnVersionBumpArgs } from './internal/yarnVersionBumpArgs'

interface IOptions {
  srcPackageDir: string
  distPackageDir: string
  pipeOutput?: boolean
}

export default async ({
  pipeOutput = false,
  srcPackageDir,
  distPackageDir,
}: IOptions) => {
  const versionBumpArgs = await yarnVersionBumpArgs()
  if (versionBumpArgs.length) {
    await execFile(
      'yarn',
      ['version', '--non-interactive', ...versionBumpArgs],
      {
        cwd: srcPackageDir,
        pipeOutput,
      },
    )
  }
  await streamToPromise(
    gulp
      .src(path.join(srcPackageDir, 'package.json'), { buffer: false })
      .pipe(gulp.dest(distPackageDir)),
  )
  await execFile('yarn', ['publish', '--non-interactive'], {
    cwd: distPackageDir,
    pipeOutput,
  })
}
