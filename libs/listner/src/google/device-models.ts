// https://developers.google.com/assistant/smarthome/guides/thermostat#request
// https://developers.google.com/assistant/smarthome/traits/onoff

export interface IDeviceType {
  type: string;
  humanName: string;
  attributes?: { [key: string]: string };
  traits: string[];
}

// export interface IDeviceTraitsStates {
//   type: 'string' | 'array' | 'number' | 'boolean' | 'integer' | 'object';
//   required?: boolean;
//   supportedValues?: string[];
//   hint: string;
// }

export interface IDeviceTraitsProps {
  type: 'string' | 'array' | 'number' | 'boolean' | 'integer' | 'object';
  required?: boolean;
  supportedValues?: string[];
  hint: string;
}

export interface IDeviceCommandProps {
  command: string;
  params: {
    [name: string]: IDeviceTraitsProps;
  };
}

export interface IDeviceTraits {
  type: string;
  humanName: string;
  attributes: {
    [name: string]: IDeviceTraitsProps;
  };
  states: {
    [name: string]: IDeviceTraitsProps;
  };
  commands: IDeviceCommandProps[];
}
