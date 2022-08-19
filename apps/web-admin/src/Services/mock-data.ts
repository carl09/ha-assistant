export const mockSync = async () => {
  const resp = await fetch('api/fulfillment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
      inputs: [
        {
          intent: 'action.devices.SYNC',
        },
      ],
    }),
  });

  return resp.json();
};

export const mockDisconnect = async () => {
  const resp = await fetch('api/fulfillment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
      inputs: [
        {
          intent: 'action.devices.DISCONNECT',
        },
      ],
    }),
  });

  return resp.json();
};

export const mockQuery = async () => {
  const resp = await fetch('api/fulfillment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
      inputs: [
        {
          intent: 'action.devices.QUERY',
          payload: {
            devices: [
              {
                id: '123',
                customData: {
                  fooValue: 74,
                  barValue: true,
                  bazValue: 'foo',
                },
              },
              {
                id: '456',
                customData: {
                  fooValue: 12,
                  barValue: false,
                  bazValue: 'bar',
                },
              },
            ],
          },
        },
      ],
    }),
  });

  return resp.json();
};

export const mockExecuteOnOff = async () => {
  const resp = await fetch('api/fulfillment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
      inputs: [
        {
          intent: 'action.devices.EXECUTE',
          payload: {
            commands: [
              {
                devices: [
                  {
                    id: '104c6816-c98c-4a6a-9ed3-4c2cc2bf9115',
                  },
                ],
                execution: [
                  {
                    command: 'action.devices.commands.OnOff',
                    params: {
                      on: true,
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
  });

  return resp.json();
};

export const mockExecuteClimateHeat = async () => {
  const resp = await fetch('api/fulfillment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
      inputs: [
        {
          intent: 'action.devices.EXECUTE',
          payload: {
            commands: [
              {
                devices: [
                  {
                    id: '71fff875-88b8-4697-9193-e32009eed2d9',
                  },
                ],
                execution: [
                  {
                    command: 'action.devices.commands.ThermostatSetMode',
                    params: {
                      thermostatMode: 'heat',
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
  });

  return resp.json();
};

export const mockExecute = async (
  deviceId: string,
  commandName: string,
  params: any
) => {
  const resp = await fetch('api/fulfillment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
      inputs: [
        {
          intent: 'action.devices.EXECUTE',
          payload: {
            commands: [
              {
                devices: [
                  {
                    id: deviceId,
                  },
                ],
                execution: [
                  {
                    command: commandName,
                    params,
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
  });

  return resp.json();
};
