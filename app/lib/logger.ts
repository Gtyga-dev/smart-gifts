/* eslint-disable @typescript-eslint/no-explicit-any */
type LogLevel = "debug" | "info" | "warn" | "error"

class Logger {
  private logLevel: LogLevel

  constructor(level: LogLevel = "info") {
    this.logLevel = level
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    }

    return levels[level] >= levels[this.logLevel]
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog("debug")) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog("info")) {
      console.info(`[INFO] ${message}`, ...args)
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog("warn")) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog("error")) {
      console.error(`[ERROR] ${message}`, ...args)
    }
  }

  setLevel(level: LogLevel): void {
    this.logLevel = level
  }
}

// Create a singleton logger instance
export const logger = new Logger(process.env.NODE_ENV === "production" ? "info" : "debug")
