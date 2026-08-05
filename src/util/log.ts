type Level = 'debug' | 'info' | 'warn' | 'error'

function shouldOutput(level: Level): boolean {
  if (level === 'debug') {
    const v = process.env.VERIDIA_DEBUG
    return v === '1' || v === 'true'
  }
  return true
}

function write(level: Level, msg: string): void {
  if (!shouldOutput(level)) return
  if (process.stderr.isTTY) {
    process.stderr.write(`veridia: ${level}: ${msg}\n`)
  } else {
    const line = JSON.stringify({ level, msg, timestamp: new Date().toISOString() })
    process.stderr.write(`${line}\n`)
  }
}

export const log = {
  debug: (msg: string) => write('debug', msg),
  info: (msg: string) => write('info', msg),
  warn: (msg: string) => write('warn', msg),
  error: (msg: string) => write('error', msg),
}
