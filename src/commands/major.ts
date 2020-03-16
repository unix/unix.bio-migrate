import { CommandMajor } from 'func'
import * as print from '../utils/print'

@CommandMajor()
export class Major {
  constructor() {
    print.cyanColor('> Run command <migrate> to upgrade.')
  }
}
