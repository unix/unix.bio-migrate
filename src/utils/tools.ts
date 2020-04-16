import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import { createHash } from 'crypto'
import gitClone from 'git-clone'
import * as spinner from './spinner'

export const getTmpBlog = async () => {
  const dir = path.join(os.tmpdir(), 'unixbio')
  await fs.remove(dir)
  await fs.ensureDir(dir)
  return dir
}

export const getUserdir = async () => {
  const dir = process.cwd()
  const hasConfig = await fs.pathExists(path.join(dir, 'blog.config.js'))
  if (!hasConfig) {
    throw new Error('Abort. The current dir is not a "unix.bio" blog.\n')
    process.exit(1)
  }
  return dir
}

export const downloadLatestTemplate = async (target: string) => {
  spinner.start('template installing...')
  return new Promise((resolve, reject) => {
    gitClone(
      'https://github.com/unix/unix.bio',
      target,
      { shallow: true },
      (err) => {
        if (err) return reject(new Error(`About. ${err}`))
        spinner.succeed(true)
        spinner.start('Template downloaded. Diff and upgrading...')
        resolve()
      },
    )
  })
}

export const hash = (buf: Buffer) => {
  return createHash('sha1')
    .update(buf)
    .digest('hex')
}

export const defaultIgnores = [
  'node_modules',
  '.git',
  '.idea',
  '.github',
  'public',
]

const isIgnore = (filePath: string): boolean => {
  const hasIgnore = defaultIgnores.find(item => filePath.includes(item))
  return !!hasIgnore
}

const collect = (currentPath: string) => {
  const files = fs.readdirSync(currentPath)
  const outputs = []
  for (const name of files) {
    const filePath = path.join(currentPath, name)
    if (isIgnore(filePath)) continue
    
    const stat = fs.statSync(filePath)
    if (!stat.isDirectory()) {
      const data = fs.readFileSync(filePath)
      
      outputs.push({
        name,
        size: stat.size,
        hash: hash(data),
        source: filePath,
      })
    } else {
      outputs.push(...collect(filePath))
    }
  }
  return outputs
}

export const ignoreUpgradeFiles = [
  'blog.config.js',
  'LICENSE',
  'package.json',
  'yarn.lock',
  '.gitignore',
  'favicon.ico',
]

export const upgradeFiles = async (tempDir: string, userDir: string) => {
  const files = collect(tempDir)
  
  await Promise.all(files.map(async item => {
    if (item.name.endsWith('mdx')) return
    if (item.name.endsWith('md')) return
    const shouldIgnore = ignoreUpgradeFiles.find(name => item.name.includes(name))
    if (shouldIgnore) return
    
    const reletivePath = item.source.replace(tempDir, '')
    const userFilePath = path.join(userDir, reletivePath)
    await fs.ensureFile(userFilePath)
    await fs.copyFile(item.source, userFilePath)
  }))

  const pkgJSON: any = await fs.readJSON(path.join(tempDir, 'package.json'))
  const userPkgJSON: any = await fs.readJSON(path.join(userDir, 'package.json'))
  
  const nextVersionPkg = {
    ...userPkgJSON,
    dependencies: pkgJSON.dependencies,
    devDependencies: pkgJSON.devDependencies,
    scripts: pkgJSON.scripts,
  }
  await fs.writeJSON(path.join(userDir, 'package.json'), nextVersionPkg, { spaces: 2 })
  
  spinner.succeed()
}
