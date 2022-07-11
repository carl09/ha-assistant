// import { BehaviorSubject } from 'rxjs';

// let _devices: string[] = [];

// const devicesSubject: BehaviorSubject<string[]> = new BehaviorSubject(_devices);

// const getDeviceConfig = (deviceName: string) => {
//   return {
//     thermostatMode: 'climate.d1_mini_4_climate.state',
//     thermostatTemperatureSetpoint: 'climate.d1_mini_4_climate.temperature',
//     thermostatTemperatureAmbient: 'climate.d1_mini_4_climate.current_temperature',
//     // thermostatTemperatureSetpointHigh: 'climate.d1_mini_4_climate.', // Bug ?
//     // thermostatTemperatureSetpointLow: 'climate.d1_mini_4_climate.min_temp',
//     thermostatHumidityAmbient: 'sensor.d1_mini_4_humidity.state',
//   };
// };

// export const setDevices = (devices: string[]) => {
//   _devices = [...devices];
//   devicesSubject.next([..._devices]);
// };

// export const getDevices = () => {
//   return _devices;
// };

// export const devices$ = () => {
//   return devicesSubject.asObservable();
// };
