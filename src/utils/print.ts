import chalk from 'chalk'
import * as spinner from './spinner'

export const logColor = (text: string): string => {
  return chalk.hex('#bdbdbd')(text)
}

export const cyanColor = (text: string): string => {
  return chalk.cyanBright(text)
}

export const dangerColor = (text: string): string => {
  return chalk.redBright(text)
}

export const catchErr = (err: Error): void => {
  const msg = err.message || `${err}`
  spinner.fail()
  console.log(dangerColor(`> ${msg}`))
  process.exit(1)
}

export const welcome = (): void => {
  const name = chalk.hex('#FEFEFE').bold('unix-bio')
  const text = chalk.hex('#F0F0F0')(`  Welcome to ${name} Migrater`)
  console.log('')
  console.log(text)
  console.log('')
}
