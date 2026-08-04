import { describe, expect, it } from 'vitest'
import { splitCommand } from '../src/util/split-command.js'

describe('splitCommand', () => {
  it('splits a plain command on whitespace', () => {
    expect(splitCommand('node script.js --flag value')).toEqual(['node', 'script.js', '--flag', 'value'])
  })

  it('keeps a double-quoted Windows path intact', () => {
    const args = splitCommand('"C:\\Program Files\\nodejs\\node.exe" --version')
    expect(args[0]).toBe('C:\\Program Files\\nodejs\\node.exe')
  })

  it('handles escaped quotes inside double quotes', () => {
    const args = splitCommand('node -e "process.stdout.write(\\"hi\\")"')
    expect(args).toEqual(['node', '-e', 'process.stdout.write("hi")'])
  })

  it('preserves empty quoted segments', () => {
    const args = splitCommand('cmd "" --flag')
    expect(args).toEqual(['cmd', '', '--flag'])
  })

  it('preserves quoted whitespace inside an argument', () => {
    const args = splitCommand('cmd "two words"')
    expect(args).toEqual(['cmd', 'two words'])
  })

  it('splits single-quoted strings without escape interpretation', () => {
    const args = splitCommand("cmd 'a\\b'")
    expect(args).toEqual(['cmd', 'a\\b'])
  })
})
