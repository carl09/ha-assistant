import { resolveValue } from './devices-props';

describe('resolveValue', () => {
  test('boolean', () => {
    const r = resolveValue('true', {});

    expect(r).toBe(true);
  });

  test('number', () => {
    const r = resolveValue('1', {});

    expect(r).toBe(1);
  });

  // test('addition', () => {
  //   const r = resolveValue('1 + 1', {});

  //   expect(r).toBe(true);
  // });

  test('turnery true', () => {
    const r = resolveValue('demo.foo ? "help" : "now"', {
      demo: { foo: true },
    });

    expect(r).toBe('help');
  });

  test('turnery false', () => {
    const r = resolveValue('demo.foo ? "help" : "now"', {
      demo: { foo: false },
    });

    expect(r).toBe('now');
  });

  test('turnery false debugging', () => {
    const r = resolveValue('googleEvents.on ? "switch.turn_on" : "switch.turn_off"', {
      googleEvents: { on: false },
    });

    expect(r).toBe('switch.turn_off');
  });

  test('turnery false debugging', () => {
    const r = resolveValue('googleEvents.on ? "switch.turn_on" : "switch.turn_off"', {
      googleEvents: { on: true },
    });

    expect(r).toBe('switch.turn_on');
  });

  test('turnery false debugging 2', () => {
    const r = resolveValue('googleEvents.on ? switch.turn_on : switch.turn_off', {
      googleEvents: { on: false },
    });

    expect(r).toBe('switch.turn_off');
  });

  test('sensor.d1_mini_3_humidity.state', () => {
    const r = resolveValue('sensor.d1_mini_3_humidity.state', {
      sensor: {
        d1_mini_3_humidity: {
          state: 'off',
        },
      },
    });

    expect(r).toBe('off');
  });

  // test('switch.kogan_8.state', () => {
  //   const r = resolveValue('switch.kogan_8.state', {
  //     switch: {
  //       kogan_8: {
  //         state: 'on',
  //       },
  //     },
  //   });

  //   expect(r).toBe('on');
  // });

  // test('equals(switch.kogan_8.state, "on")', () => {
  //   const r = resolveValue('equals(switch.kogan_8.state, "on")', {
  //     switch: {
  //       kogan_8: {
  //         state: 'off',
  //       },
  //     },
  //   });

  //   expect(r).toBe(false);
  // });
});

describe('resolveValue toGoogleThermostatMode', () => {
  test('no mapping', () => {
    const r = resolveValue('toGoogleThermostatMode("heat")', {});

    expect(r).toBe('heat');
  });

  test('mapping', () => {
    const r = resolveValue('toGoogleThermostatMode("heat_cool")', {});

    expect(r).toBe('heatcool');
  });

  test('undefined', () => {
    const r = resolveValue('toGoogleThermostatMode()', {});

    expect(r).toBeUndefined;
  });

  test('simple array', () => {
    const r = resolveValue('toGoogleThermostatMode(["heat", "cool"])', {});

    expect(r).toStrictEqual(['heat', 'cool']);
  });

  test('simple array', () => {
    const r = resolveValue('toGoogleThermostatMode(toArray(demo.val))', {
      demo: {
        val: 'heat, cool',
      },
    });

    expect(r).toStrictEqual(['heat', 'cool']);
  });
});
