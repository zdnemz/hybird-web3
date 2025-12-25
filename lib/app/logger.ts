class Logger {
  public name?: string;
  private level: LogLevel = LogLevel.INFO;
  private showTimestamp: boolean = true;
  private colorsEnabled: boolean = true;

  constructor(name?: string) {
    this.name = name ? name.toUpperCase() : "SYSTEM";
  }

  public debug(message: string, ...args: unknown[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  public info(message: string, ...args: unknown[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  public warn(message: string, ...args: unknown[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  public error(message: string, ...args: unknown[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (level < this.level) return;

    const timestamp = this.showTimestamp ? this.getTimestamp() + " " : "";
    const levelStr = this.getLevelString(level);
    const nameStr = this.name ? `[${this.name}] ` : "";

    const formattedMessage = this.formatMessage(message, args);
    const logEntry = `${timestamp}${levelStr}${nameStr}${formattedMessage}`;

    this.writeToConsole(level, logEntry);
  }

  public setLevel(level: LogLevel): this {
    this.level = level;
    return this;
  }

  public showTimestamps(show: boolean): this {
    this.showTimestamp = show;
    return this;
  }

  public enableColors(enabled: boolean): this {
    this.colorsEnabled = enabled;
    return this;
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private getLevelString(level: LogLevel): string {
    const colors = this.colorsEnabled
      ? {
          [LogLevel.DEBUG]: "\x1b[36m", // Cyan
          [LogLevel.INFO]: "\x1b[34m", // Blue
          [LogLevel.WARN]: "\x1b[33m", // Yellow
          [LogLevel.ERROR]: "\x1b[31m", // Red
        }
      : {};

    const reset = this.colorsEnabled ? "\x1b[0m" : "";
    const color = colors[level] || "";

    const levelNames = {
      [LogLevel.DEBUG]: "DEBUG",
      [LogLevel.INFO]: "INFO",
      [LogLevel.WARN]: "WARN",
      [LogLevel.ERROR]: "ERROR",
    };

    return `${color}[${levelNames[level]}]${reset} `;
  }

  private formatMessage(message: string, args: unknown[]): string {
    if (args.length === 0) return message;

    return message.replace(/{(\d+)}/g, (match, index) => {
      return typeof args[index] !== "undefined"
        ? JSON.stringify(args[index])
        : match;
    });
  }

  private writeToConsole(level: LogLevel, message: string): void {
    const consoleMethods = {
      [LogLevel.DEBUG]: console.debug,
      [LogLevel.INFO]: console.info,
      [LogLevel.WARN]: console.warn,
      [LogLevel.ERROR]: console.error,
    };

    const method = consoleMethods[level] || console.log;
    method(message);
  }

  // Static factory method
  public static create(name?: string): Logger {
    return new Logger(name);
  }

  // Create child logger
  public child(childName: string): Logger {
    const fullName = this.name
      ? `${this.name}:${childName.toUpperCase()}`
      : childName.toUpperCase();
    const childLogger = new Logger(fullName);
    childLogger.setLevel(this.level);
    childLogger.showTimestamps(this.showTimestamp);
    childLogger.enableColors(this.colorsEnabled);
    return childLogger;
  }
}

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export { Logger, LogLevel };
