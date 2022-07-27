export type welcome = {
  type: 'welcome';
  value: string;
};

export type debug = {
  type: 'debug';
  value: string;
};

export type devices = {
  type: 'devices';
  value: { [key: string]: any };
};
 
export type messages = welcome | debug | devices;