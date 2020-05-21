import pino from 'pino'

export const logger = pino({ level: process.env.LOG || 'silent' })

export function wrapDebugger(f: Function) {
  return (...args: unknown[]) => {
    const val = f.apply(f, args)
    logger.debug({
      args,
      val,
      fnName: f.name,
    })
    return val
  }
}
