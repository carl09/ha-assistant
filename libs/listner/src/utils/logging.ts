export const logging = {
  error: (err: any, ...parms: any[]) => console.error(err, ...parms),
  warn: (msg: string, ...parms: any[]) => console.warn(msg, ...parms),
  log: (msg: string, ...parms: any[]) => console.log(msg, ...parms),
  info: (msg: string, ...parms: any[]) => console.info(msg, ...parms),
  debug: (msg: string, ...parms: any[]) => console.warn(msg, ...parms),
};
