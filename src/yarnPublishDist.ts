import { dest, src } from 'gulp'
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
  const versionBumpArgs = yarnVersionBumpArgs()
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
    src(path.join(srcPackageDir, 'package.json'), { buffer: false }).pipe(
      dest(distPackageDir),
    ),
  )
  await execFile('yarn', ['publish', '--non-interactive'], {
    cwd: distPackageDir,
    pipeOutput,
  })
}
