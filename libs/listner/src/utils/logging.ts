import chalk from 'chalk';

const l = (v: string, ...parms: any[]) => console.log(v, ...parms);

const info = () => `[${new Date().toLocaleString()}]`;

export const logging = {
  error: (msg: string, ...parms: any[]) =>
    l(chalk.red(info(), 'ERROR:', msg), ...parms),
  warn: (msg: string, ...parms: any[]) =>
    l(chalk.yellow(info(), 'WARNING:', msg), ...parms),
  log: (msg: string, ...parms: any[]) =>
    l(chalk.green(info(), 'LOG:', msg), ...parms),
  info: (msg: string, ...parms: any[]) =>
    l(chalk.gray(info(), 'INFO:', msg), ...parms),
  debug: (msg: string, ...parms: any[]) =>
    l(chalk.white(info(), 'DEBUG:', msg), ...parms),
};
