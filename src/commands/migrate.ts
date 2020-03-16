import { Command } from 'func'
import * as print from '../utils/print'
import { getTmpBlog, getUserdir, downloadLatestTemplate, upgradeFiles } from '../utils/tools'

@Command({
  name: 'migrate',
})
export class Migrate {
  
  private tempDir: string = ''
  private userDir: string = ''
  
  constructor() {
    print.welcome()
    this.init()
      .then(() => this.upgrade())
      .catch(e => {
        print.catchErr(e.message)
      })
  }
  
  async init() {
    this.tempDir = await getTmpBlog()
    this.userDir = await getUserdir()
  }
  
  async upgrade() {
    await downloadLatestTemplate(this.tempDir)
    await upgradeFiles(this.tempDir, this.userDir)
  
    console.log(print.cyanColor('> Upgrade completed.'))
    console.log(print.logColor('  Run <npm install> refresh dependencies.\n'))
    process.exit(0)
  }
  
}
