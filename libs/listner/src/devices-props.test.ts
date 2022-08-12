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

  // test('variable', () => {
  //   const r = resolveValue('foo ? "help" : "now"', { foo: false });

  //   expect(r).toBe('now');
  // });

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

  

  test('switch.kogan_8.state', () => {
    const r = resolveValue('switch.kogan_8.state', {
      switch: {
        kogan_8: {
          state: 'on',
        },
      },
    });

    expect(r).toBe('on');
  });

  test('equals(switch.kogan_8.state, "on")', () => {
    const r = resolveValue('equals(switch.kogan_8.state, "on")', {
      switch: {
        kogan_8: {
          state: 'off',
        },
      },
    });

    expect(r).toBe(false);
  });
});
