import chalk from 'chalk';

const l = (v: string, ...parms: any[]) => console.log(v, ...parms);

const info = () => `[${new Date().toLocaleString()}]`;

export const LoggingLevel = {
  Debug: 0,
  Info: 1,
  Warn: 2,
  Error: 3,
} as const;

let logLevel = LoggingLevel.Debug;

export const setLogLevel = (level: string) => {
  console.log('Setting Log Level', level);
  logLevel = (LoggingLevel as any)[level] || LoggingLevel.Debug;
};

export const logging = {
  error: (msg: string, ...parms: any[]) => {
    l(chalk.red(info(), 'ERROR:', msg), ...parms);
  },

  warn: (msg: string, ...parms: any[]) => {
    if (logLevel <= 2) {
      l(chalk.yellow(info(), 'WARNING:', msg), ...parms);
    }
  },
  log: (msg: string, ...parms: any[]) => {
    if (logLevel <= 1) {
      l(chalk.green(info(), 'LOG:', msg), ...parms);
    }
  },
  info: (msg: string, ...parms: any[]) => {
    if (logLevel <= 1) {
      l(chalk.green(info(), 'INFO:', msg), ...parms);
    }
  },
  debug: (msg: string, ...parms: any[]) => {
    if (logLevel <= 0) {
      l(chalk.gray(info(), 'DEBUG:', msg), ...parms);
    }
  },
};
